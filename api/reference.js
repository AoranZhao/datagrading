'use strict';

let utils = require('./utils');
let fs = require('fs');
let path = require('path');
let config = require('../config');

let couchdb = utils.getDB();

let referenceParameters = {
    'reference_id': 'string',
    'question_body': 'string',
    'reference_solution': 'string',
    'reference_scan': 'string',
    'question_body_region': [['number']],
    'student_solution_region': [['number']]
}

let getReferenceList = (req, res) => {
    promise_getReferenceList()
        .then(result => {
            res.status(200).send({
                statusCode: 200,
                data: result
            })
            return;
        })
        .catch(err => {
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let getReference = (req, res) => {
    let id = req.params.id;
    if (typeof id == 'undefined') {
        res.status(400).send({
            statusCode: 400,
            reason: 'missing parameter \"id\" in url'
        })
        return;
    }
    promise_getReference_byRefId(id)
        .then(reference => {
            if (typeof reference == 'undefined') {
                res.status(404).send({
                    statusCode: 404,
                    reason: `not find reference with id \"${id}\"`
                })
                return;
            } else {
                reference = add_scanPath(reference);
                res.status(200).send({
                    statusCode: 200,
                    data: reference
                })
                return;
            }
        })
        .catch(err => {
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let postReference = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let validation = check_request_getPostRefId(id, body['reference_id']);
    if (typeof validation != 'undefined') {
        res.status(validation.statusCode).send(validation);
        return;
    }
    promise_postReference(body)
        .then(result => {
            res.status(200).send(result);
            return;
        })
        .catch(err => {
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let promise_getReferenceList = () => {
    let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('reference', 'listRefIds', {}, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let listRefIds = [];
            body.rows.forEach(row => {
                listRefIds.push(row.value);
            })
            resolve(listRefIds);
        })
    })
}

let promise_getReference_byRefId = (id) => {
    let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('reference', 'refId', { key: id }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let reference;
            if (body.rows.length > 0) {
                reference = body.rows[0].value;
            }
            resolve(reference);
        })
    })
}

let promise_getReferenceDoc_byRefId = (id) => {
    let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('reference', 'refId', { key: id, include_docs: true }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let reference;
            if (body.rows.length > 0) {
                reference = body.rows[0].doc;
            }
            resolve(reference);
        })
    })
}

let promise_postReference = (reference) => {
    return new Promise((resolve, reject) => {
        let validation;
        validation = check_reference_parametersMissing(reference);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        validation = check_reference_parametersDataType(reference);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        // console.log("finish validation");
        promise_getReferenceDoc_byRefId(reference['reference_id'])
            .then(oldRef => {
                let body = {};
                Object.keys(referenceParameters).forEach(key => {
                    body[key] = reference[key];
                })
                if (typeof oldRef == 'undefined') {
                    body['created_date'] = new Date().toISOString();
                    body['doc_type'] = 'reference';
                } else {
                    body['_id'] = oldRef['_id'];
                    body['_rev'] = oldRef['_rev'];
                    body['created_date'] = oldRef['created_date'];
                    body['doc_type'] = oldRef['doc_type'];
                }
                return promise_save(body);
            })
            .then(() => {
                resolve({
                    statusCode: 200,
                    data: 'success'
                });
                return;
            })
            .catch(err => {
                // console.log(JSON.stringify(err));
                reject(err);
                return;
            })
    })
}

let check_reference_parametersMissing = (reference) => {
    let validation;
    let keys = Object.keys(referenceParameters);
    for (let i = 0; i < keys.length; i++) {
        if (typeof reference[keys[i]] == 'undefined') {
            validation = {
                statusCode: 400,
                reason: `missing parameter in body \"${keys[i]}\"`
            }
            break;
        }
    }
    // console.log(`checking reference missing, reference: ${reference}, result: ${validation}`);
    return validation;
}

let check_reference_parametersDataType = (reference) => {
    let validation;
    let keys = Object.keys(referenceParameters);
    for (let i = 0; i < keys.length; i++) {
        if (!check_element(reference[keys[i]], referenceParameters[keys[i]])) {
            validation = {
                statusCode: 400,
                reason: `wrong data type of parameter \"${keys[i]}\", should be ${Array.isArray(referenceParameters[keys[i]]) ? `Array of ${referenceParameters[keys[i]]}` : referenceParameters[keys[i]]}`
            }
            break;
        }
    }
    // console.log(`checking reference parameters data type, reference: ${reference}, result: ${validation}`);
    return validation;
}

let check_element = (element, type) => {
    if (typeof element == 'undefined' || typeof type == 'undefined') {
        return true;
    } else if (Array.isArray(type)) {
        let newEle, newType;
        if (Array.isArray(element)) {
            if (element.length > 0)
                newEle = element[0];
            if (type.length > 0)
                newType = type[0];
            return check_element(newEle, newType);
        } else {
            return false;
        }
    } else {
        if (typeof element == type) {
            return true;
        } else {
            return false;
        }
    }
}

let promise_save = (reference) => {
    let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.insert(reference, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            } else {
                resolve();
            }
        })
    })
}

let check_request_getPostRefId = (id, body_id) => {
    let validation;
    if (typeof id == 'undefined' || typeof body_id == 'undefined' || id !== body_id) {
        validation = {
            statusCode: 400,
            reason: `reference id in url \"${id}\" mismatch with in body \"${body_id}\"`
        }
    }
    // console.log(`check request ref, id: ${id}, body_id: ${body_id}, result: ${validation}`);
    return validation;
}

let add_scanPath = (reference) => {
    let regex = new RegExp(`^${config.STATIC_REF_DATA_PATH}`);
    reference.scan_path = reference['reference_scan'].replace(regex, config.STATIC_REF_URL_PREFIX);
    reference.scan_path = reference.scan_path.replace('http\:\/', 'http\:\/\/');
    return reference;
}

module.exports = {
    getReferenceList: getReferenceList,
    getReference: getReference,
    postReference: postReference
}
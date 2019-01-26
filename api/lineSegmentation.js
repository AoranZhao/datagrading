'use strict';

let utils = require('./utils');
let fs = require('fs');
let path = require('path');
let config = require('../config');

// let couchdb = utils.getDB();
let db = utils.getDB();

let lineSegmentationParameters = {
    'image_scan': 'string',
    'print_line_regions': [{
        'x': 'number',
        'y': 'number',
        'w': 'number',
        'h': 'number',
        'c': 'number'
    }],
    'hand_written_line_regions': [{
        'x': 'number',
        'y': 'number',
        'w': 'number',
        'h': 'number',
        'c': 'number'
    }],
    'label_complete': 'boolean',
    'text_content': 'string',
    'checked': 'boolean',
    'note1': 'string',
    'note2': 'string'
}

let getSegmentationList = (req, res) => {
    let amount = (typeof req.query.amount === 'number' && req.query.amount >= 0) ? Math.ceil(req.query.amount) : 100,
        page = (typeof req.query.page === 'number' && req.query.page > 0) ? Math.ceil(req.query.page) : 1;
    promise_getSegmentationList(page, amount)
        .then(result => {
            utils.printInfoLog('getSegmentationList', `success, get ${result.length} items`);
            res.status(200).send({
                statusCode: 200,
                data: result
            })
            return;
        })
        .catch(err => {
            utils.printErrLog('getSegmentationList', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let getSegmentation = (req, res) => {
    let id = req.params.id;
    if (typeof id == 'undefined') {
        utils.printErrLog('getSegmentation', 'missing parameter \"scan-id\" in url');
        res.status(400).send({
            statusCode: 400,
            reason: 'missing parameter \"scan-id\" in url'
        })
        return;
    }
    promise_getSegmentation_byId(id)
        .then(result => {
            if (typeof result == 'undefined') {
                utils.printErrLog('getSegmentation', `not find line segmentation with id \"${id}\"`);
                res.status(404).send({
                    statusCode: 404,
                    reason: `not find line segmentation with id \"${id}\"`
                })
                return;
            } else {
                result = add_scanPath(result);
                utils.printInfoLog('getSegmentation', JSON.stringify(result));
                res.status(200).send({
                    statusCode: 200,
                    data: result
                })
                return;
            }
        })
        .catch(err => {
            utils.printErrLog('getSegmentation', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let postSegmentation = (req, res) => {
    let id = req.params.id;
    if (typeof id == 'undefined') {
        utils.printErrLog('postSegmentation', 'missing parameter \"scan-id\" in url');
        res.status(400).send({
            statusCode: 400,
            reason: 'missing parameter \"scan-id\" in url'
        })
        return;
    }
    let body = Object.assign({}, req.body, { scan_id: id });
    promise_postSegmentation(body)
        .then(result => {
            utils.printInfoLog('postSegmentation', JSON.stringify(result));
            res.status(200).send(result);
            return;
        })
        .catch(err => {
            utils.printErrLog('postSegmentation', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let deleteSegmentation = (req, res) => {
    let id = req.params.id;
    if (typeof id == 'undefined') {
        utils.printErrLog('deleteSegmentation', "not find line segmentation id in url");
        res.status(400).send({
            statusCode: 400,
            reason: "not find line segmentation id in url"
        })
        return;
    }
    promise_getSegmentationDoc_byId(id)
        .then(result => {
            return promise_deleteSegmentation(result);
        })
        .then(result => {
            utils.printInfoLog('deleteSegmentation', JSON.stringify(result));
            res.status(200).send({
                statusCode: 200,
                reason: 'success'
            })
        })
        .catch(err => {
            utils.printErrLog('deleteSegmentation', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let promise_getSegmentationList = (page, amount) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('linesegmentation', 'listLineSegIds', { skip: (page - 1) * amount, limit: amount }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let listSegIds = [];
            if (Array.isArray(body.rows)) {
                body.rows.forEach(row => {
                    listSegIds.push(row.value);
                })
                resolve(listSegIds);
            } else {
                console.log('promise_getSegmentationList: body rows is not array, error code < 34875928374 >');
                console.log(body);
                reject({ statusCode: 500, reason: 'Something error occurs, please contact the most beautiful Lan.' })
            }
        })
    })
}

let promise_getSegmentation_byId = (id) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('linesegmentation', 'lineSegId', { key: id }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let lineSeg;
            if (body.rows.length > 0) {
                lineSeg = body.rows[0].value;
            }
            resolve(lineSeg);
        })
    })
}

let promise_getSegmentationDoc_byId = (id) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('linesegmentation', 'lineSegId', { key: id, include_docs: true }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let lineSeg;
            if (body.rows.length > 0) {
                lineSeg = body.rows[0].doc;
            }
            resolve(lineSeg);
        })
    })
}

let promise_postSegmentation = (lineSeg) => {
    return new Promise((resolve, reject) => {
        let validation;
        validation = check_reference_parametersMissing(lineSeg);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        validation = check_reference_parametersDataType(lineSeg);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        promise_getSegmentationDoc_byId(lineSeg['scan_id'])
            .then(oldSeg => {
                let body = {};
                Object.keys(lineSegmentationParameters).forEach(key => {
                    body[key] = lineSeg[key];
                })
                body['scan_id'] = lineSeg['scan_id'];
                if (typeof oldSeg == 'undefined') {
                    body['created_date'] = new Date().toISOString();
                    body['doc_type'] = 'linesegementation';
                } else {
                    body['_id'] = oldSeg['_id'];
                    body['_rev'] = oldSeg['_rev'];
                    body['created_date'] = oldSeg['created_date'];
                    body['doc_type'] = oldSeg['doc_type'];
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
                reject(err);
                return;
            })
    })
}

let promise_deleteSegmentation = (lineSeg) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        if (typeof lineSeg == 'undefined') {
            reject({ statusCode: 404, reason: "not find line segmentation" });
            return;
        }
        if (typeof lineSeg._id == 'undefined' || typeof lineSeg._rev == 'undefined') {
            reject({ statusCode: 500, reason: 'not find line segmentation id or rev' });
            return;
        } else {
            db.destroy(lineSeg._id, lineSeg._rev, (err, body) => {
                if (err) {
                    reject({ statusCode: err.statusCode, reason: err.reason });
                    return;
                } else {
                    resolve(body);
                }
            })
        }
    })
}

let check_reference_parametersMissing = (lineSeg) => {
    let validation;
    let keys = Object.keys(lineSegmentationParameters);
    for (let i = 0; i < keys.length; i++) {
        if (typeof lineSeg[keys[i]] == 'undefined') {
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

let check_reference_parametersDataType = (lineSeg) => {
    return check_element('body', lineSeg, lineSegmentationParameters);
}

let check_element = (curKey, element, type) => {
    let validation;
    if (typeof element == 'undefined') {
        return {
            statusCode: 400,
            reason: `parameter \"${curKey}\" missing`
        };
    } else if (Array.isArray(type)) {
        let newType = type[0];
        if (Array.isArray(element)) {
            for (let i = 0; i < element.length; i++) {
                validation = check_element(curKey, element[i], newType);
                if (typeof validation != 'undefined') {
                    break;
                }
            }
            return validation;
        } else {
            return {
                statusCode: 400,
                reason: `parameter \"${curKey}\" should be array`
            }
        }
    } else if (typeof type == 'string') {
        if (typeof element == type) {
            return validation;
        } else {
            return {
                statusCode: 400,
                reason: `wrong data type of parameter \"${curKey}\", should be \"${type}\"`
            }
        }
    } else if (typeof type == 'object') {
        if (typeof element == 'object') {
            let keys = Object.keys(type);
            for (let i = 0; i < keys.length; i++) {
                validation = check_element(keys[i], element[keys[i]], type[keys[i]]);
                if (typeof validation != 'undefined') {
                    break;
                }
            }
            return validation;
        } else {
            return {
                statusCode: 400,
                reason: `wrong data type of parameter \"${curKey}\"`
            }
        }
    } else {
        return validation;
    }
}

let promise_save = (lineSeg) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.insert(lineSeg, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            } else {
                resolve();
            }
        })
    })
}

let add_scanPath = (lineSeg) => {
    let regex = new RegExp(`^${config.STATIC_SOL_DATA_PATH}`);
    lineSeg.scan_path = lineSeg['image_scan'].replace(regex, config.STATIC_SOL_URL_PREFIX);
    return lineSeg;
}

module.exports = {
    getSegmentationList: getSegmentationList,
    getSegmentation: getSegmentation,
    postSegmentation: postSegmentation,
    deleteSegmentation: deleteSegmentation
}
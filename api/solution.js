'use strict';

let utils = require('./utils');
let fs = require('fs');
let path = require('path');
let config = require('../config');

// let couchdb = utils.getDB();
let db = utils.getDB();

let solutionParameters = {
    // 'student_solution_id': 'string',
    // 'reference_id': 'string',
    'student_solution_scan': 'string',
    'label_complete': 'boolean',
    'text_content': 'string',
    'checked': 'boolean',
    'note1': 'string',
    'note2': 'string',
    'score': {
        'rank': 'string',
        'empty': 'boolean',
        'answer_exist': 'boolean',
        'different_solution': 'boolean'
    }
}

let getSolutionList = (req, res) => {
    let refId = req.params.refId;
    if (typeof refId == 'undefined') {
        utils.printErrLog('getSolutionList', 'missing parameter reference id');
        res.status(400).send({
            statusCode: 400,
            reason: 'missing parameter reference id'
        })
        return;
    }
    promise_getSolutionList(refId)
        .then(result => {
            utils.printInfoLog('getSolutionList', `success, get ${result.length} items`);
            res.status(200).send({
                statusCode: 200,
                data: result
            })
        })
        .catch(err => {
            utils.printErrLog('getSolutionList', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let getSolution = (req, res) => {
    let refId = req.params.refId, soluId = req.params.soluId;
    if (typeof refId == 'undefined' || typeof soluId == 'undefined') {
        utils.printErrLog('getSolution', 'missing parameter reference id or solution id');
        res.status(400).send({
            statusCode: 400,
            reason: 'missing parameter reference id or solution id'
        })
        return;
    }
    promise_getSolution_byRefIdAndSoluId(refId, soluId)
        .then(result => {
            if (typeof result == 'undefined') {
                utils.printErrLog('getSolution', `not find solution with id \"${soluId}\" relating reference with id \"${refId}\"`);
                res.status(404).send({
                    statusCode: 404,
                    reason: `not find solution with id \"${soluId}\" relating reference with id \"${refId}\"`
                })
                return;
            } else {
                result = add_scanPath(result);
                utils.printInfoLog('getSolution', JSON.stringify(result));
                res.status(200).send({
                    statusCode: 200,
                    data: result
                })
                return;
            }
        })
        .catch(err => {
            utils.printErrLog('getSolution', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let postSolution = (req, res) => {
    let refId = req.params.refId, soluId = req.params.soluId;
    if (typeof refId == 'undefined' || typeof soluId == 'undefined') {
        utils.printErrLog('postSolution', 'missing parameter reference id or solution id');
        res.status(400).send({
            statusCode: 400,
            reason: 'missing parameter reference id or solution id'
        })
        return;
    }
    // let validation;
    // validation = check_solution_refIdAndSoluIdWithBody(refId, soluId, req.body);
    // if (typeof validation != 'undefined') {
    //     res.status(validation.statusCode).send(validation);
    //     return;
    // }
    let body = Object.assign({}, req.body, { student_solution_id: soluId, reference_id: refId });
    promise_postSolution(body)
        .then(result => {
            utils.printInfoLog('postSolution', JSON.stringify(result));
            res.status(result.statusCode).send(result);
            return;
        })
        .catch(err => {
            utils.printErrLog('postSolution', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
            return;
        })
}

let deleteSolution = (req, res) => {
    let refId = req.params.refId, soluId = req.params.soluId;
    if (typeof refId == 'undefined') {
        utils.printErrLog('deleteSolution', 'not found reference id');
        res.status(400).send({
            statusCode: 400,
            reason: "not found reference id"
        })
        return;
    }
    if (typeof soluId == 'undefined') {
        utils.printErrLog('deleteSolution', 'not found solution id');
        res.status(400).send({
            statusCode: 400,
            reason: "not found solution id"
        })
        return;
    }
    promise_getSolutionDoc_byRefIdAndSoluId(refId, soluId)
        .then(result => {
            return promise_deleteSolution(result);
        })
        .then(result => {
            utils.printInfoLog('deleteSolution', JSON.stringify(result));
            res.status(200).send({
                stautsCode: 200,
                reason: "success"
            })
        })
        .catch(err => {
            utils.printErrLog('deleteSolution', JSON.stringify(err));
            if (typeof err.statusCode == 'undefined') {
                res.status(500).send(err);
            } else {
                res.status(err.statusCode).send(err);
            }
        })
}

let promise_getSolutionList = (refId) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.view('solution', 'listSoluIds', { key: refId }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let listSoluIds = [];
            body.rows.forEach(row => {
                listSoluIds.push(row.value);
            })
            resolve(listSoluIds);
        })
    })
}

let promise_getSolution_byRefIdAndSoluId = (refId, soluId) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        let validation;
        validation = check_solution_refIdAndSoluId(refId, soluId);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        db.view('solution', 'refIdAndSoluId', { key: [refId, soluId] }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let solution;
            if (body.rows.length > 0) {
                solution = body.rows[0].value;
            }
            resolve(solution);
        })
    })
}

let promise_getSolutionDoc_byRefIdAndSoluId = (refId, soluId) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        let validation;
        validation = check_solution_refIdAndSoluId(refId, soluId);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        db.view('solution', 'refIdAndSoluId', { key: [refId, soluId], include_docs: true }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            let solution;
            if (body.rows.length > 0) {
                solution = body.rows[0].doc;
            }
            resolve(solution);
        })
    })
}

let promise_postSolution = (solution) => {
    return new Promise((resolve, reject) => {
        let validation;
        validation = check_solution_parametersMissiong(solution);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        validation = check_solution_parametersDataType(solution);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        validation = check_solution_rankRange(solution);
        if (typeof validation != 'undefined') {
            reject(validation);
            return;
        }
        promise_getSolutionDoc_byRefIdAndSoluId(solution['reference_id'], solution['student_solution_id'])
            .then(oldSolu => {
                let body = fill_body(solution, solutionParameters);
                body['reference_id'] = solution['reference_id'];
                body['student_solution_id'] = solution['student_solution_id'];
                if (typeof oldSolu == 'undefined') {
                    body['created_date'] = new Date().toISOString();
                    body['doc_type'] = 'solution';
                } else {
                    body['created_date'] = oldSolu['created_date'];
                    body['doc_type'] = oldSolu['doc_type'];
                    body['_id'] = oldSolu['_id'];
                    body['_rev'] = oldSolu['_rev'];
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

let promise_deleteSolution = (solution) => {
    // let db = couchdb.use("datagrading");
    return new Promise((resolve, reject) => {
        if (typeof solution == 'undefined') {
            reject({ statusCode: 404, reason: "not find solution" });
            return;
        }
        if (typeof solution._id == 'undefined' || typeof solution._rev == 'undefined') {
            reject({
                statusCode: 500,
                reason: "not find solution id and rev"
            })
            return;
        }
        db.destroy(solution._id, solution._rev, (err, body) => {
            if (err) {
                reject({
                    statusCode: err.statusCode,
                    reason: err.reason
                })
                return;
            } else {
                resolve(body);
            }
        })
    })
}

let check_solution_parametersMissiong = (solution) => {
    let validation = check_missing(solution, solutionParameters);
    return validation;
}

let check_solution_parametersDataType = (solution) => {
    let validation = check_element(solution, solutionParameters);
    return validation;
}

let check_missing = (element, type) => {
    if (typeof element == 'undefined' || typeof type == 'undefined') {
        return;
    } else {
        let keys = Object.keys(type);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let theEle = element[key];
            if (typeof theEle == 'undefined') {
                return {
                    statusCode: 400,
                    reason: `parameter \"${key}\" missing in body`
                };
            }
            if (typeof theEle == 'object' && !Array.isArray(theEle)) {
                let result = check_missing(theEle, type[key]);
                if (typeof result != 'undefined')
                    return result;
            }
        }
        return;
    }
}

let check_element = (element, type) => {
    if (typeof element == 'undefined' || typeof type == 'undefined') {
        return;
    } else {
        let keys = Object.keys(type);
        let validation;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let theType = type[key];
            let theEle = element[key];
            if (typeof theType != 'string') {
                validation = check_element(theEle, theType);
            } else if (typeof theEle != theType) {
                validation = {
                    statusCode: 400,
                    reason: `parameter \"${key}\" should be type of \"${theType}\"`
                }
                break;
            }
        }
        return validation;
    }
}

let check_solution_refIdAndSoluId = (refId, soluId) => {
    let validation;
    if (typeof refId == 'undefined') {
        validation = {
            statusCode: 400,
            reason: `reference id should not be undefined`
        }
        return validation;
    }
    if (typeof soluId == 'undefined') {
        validation = {
            statusCode: 400,
            reason: `solution id should not be undefined`
        }
        return validation;
    }
    return validation;
}

let check_solution_refIdAndSoluIdWithBody = (refId, soluId, body) => {
    let validation;
    if (body['reference_id'] != refId) {
        validation = {
            statusCode: 400,
            reason: `reference id \"${refId}\" should be match with id in body \"${body['reference_id']}\"`
        }
        return validation;
    }
    if (body['student_solution_id'] != soluId) {
        validation = {
            statusCode: 400,
            reason: `solution id \"${soluId}\" should be match with id in body \"${body['student_solution_id']}\"`
        }
        return validation;
    }
    return validation;
}

let check_solution_rankRange = (solution) => {
    let rankRange = ["S", "A", "B", "C", "D"];
    let rank = solution["score"]["rank"];
    let validation;
    if (rankRange.indexOf(rank) == -1) {
        validation = {
            statusCode: 400,
            reason: `score rank \"${rank}\" should be in [${JSON.stringify(rankRange)}]`
        }
    }
    return validation;
}

let fill_body = (element, type) => {
    let body = {};
    let keys = Object.keys(type);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let theType = type[key];
        if (typeof theType == 'object') {
            body[key] = fill_body(element[key], theType);
        } else {
            body[key] = element[key];
        }
    }
    return body;
}

let promise_save = (solution) => {
    // let db = couchdb.use('datagrading');
    return new Promise((resolve, reject) => {
        db.insert(solution, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            resolve();
        })
    })
}

let add_scanPath = (solution) => {
    let regex = new RegExp(`^${config.STATIC_SOL_DATA_PATH}`);
    solution.scan_path = solution['student_solution_scan'].replace(regex, config.STATIC_SOL_URL_PREFIX);
    // solution.scan_path = solution.scan_path.replace('http\:\/', 'http\:\/\/');
    return solution;
}

module.exports = {
    getSolutionList: getSolutionList,
    getSolution: getSolution,
    postSolution: postSolution,
    deleteSolution: deleteSolution
}
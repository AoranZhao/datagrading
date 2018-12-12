'use strict';

let utils = require('./utils');
let config = require('../config');
let jwt = require('jsonwebtoken');
let jwt_secret = "sdf8wfhh#aef2fi22";

let userDb = utils.getUserDB();

let auth = (req, res) => {
    let username = req.body.username,
        password = req.body.password;
    if (typeof username == 'undefined' || typeof password == 'undefined') {
        utils.printErrLog('auth', `missing parameters 'username' or 'password' in body`);
        res.status(400).send({
            statusCode: 400,
            reason: `missing parameters 'username' or 'password' in body`
        });
        return;
    }
    promise_getUser(username)
        .then(user => {
            return promise_authorize(user, password);
        })
        .then(user => {
            delete user.password;
            user.token = encode_user(user);
            res.status(200).send({
                statusCode: 200,
                data: user
            });
            return;
        })
        .catch(err => {
            let statusCode = (typeof err.statusCode != 'undefined') ? err.statusCode : 500,
                reason = (typeof err.statusCode != 'undefined') ? err.reason : err;
            res.status(err.statusCode || 500)
                .send({
                    statusCode: statusCode,
                    reason: reason
                });
        })
}

let verify = (req, res) => {
    let token = req.headers['x-token'];
    if (typeof token == 'undefined') {
        utils.printErrLog('verify', `missing parameters 'x-token' in header`);
        res.status(400).send({
            statusCode: 400,
            reason: `missing parameters 'x-token' in header`
        });
        return;
    }
    promise_decode_user(token)
        .then(decoded => {
            res.status(200).send(decoded);
        })
        .catch(err => {
            let statusCode = (typeof err.statusCode != 'undefined') ? err.statusCode : 500,
                reason = (typeof err.statusCode != 'undefined') ? err.reason : err;
            res.status(err.statusCode || 500)
                .send({
                    statusCode: statusCode,
                    reason: reason
                });
        })
}

let authorize = (req, res, cb) => {
    let token = req.headers['x-token'];
    if (typeof token == 'undefined') {
        utils.printErrLog('verify', `missing parameters 'x-token' in header`);
        res.status(400).send({
            statusCode: 400,
            reason: `missing parameters 'x-token' in header`
        });
        return;
    }
    promise_decode_user(token)
        .then(decoded => {
            req.headers['x-user'] = decoded;
            cb(req, res);
        })
        .catch(err => {
            let statusCode = (typeof err.statusCode != 'undefined') ? err.statusCode : 500,
                reason = (typeof err.statusCode != 'undefined') ? err.reason : err;
            res.status(err.statusCode || 500)
                .send({
                    statusCode: statusCode,
                    reason: reason
                });
        })
}

let promise_getUser = (username) => {
    return new Promise((resolve, reject) => {
        userDb.view('config', 'user', { key: username }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            if (body.rows.length == 0) {
                reject({ statusCode: 401, reason: `unknown user \<${username}\>` });
                return;
            }
            let user = body.rows[0].value;
            user.username = user.email;
            delete user.email;
            resolve(user);
            return;
        })
    })
}

let promise_authorize = (user, password) => {
    return new Promise((resolve, reject) => {
        if (user.password !== password) {
            reject({
                statusCode: 401,
                reason: 'unauthorized'
            });
            return;
        }
        if (user.expire < new Date().getTime()) {
            reject({
                statusCode: 401,
                reason: `account \<${user.username}\> expired.`
            });
            return;
        }
        if (user.disable) {
            reject({
                statusCode: 401,
                reason: `account \<${user.username}\> is disabled.`
            });
            return;
        }
        resolve(user);
        return;
    })
}

let encode_user = (user) => {
    return jwt.sign(user, jwt_secret, {
        expiresIn: '1440m'
    })
}

let promise_decode_user = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, jwt_secret, (err, decoded) => {
            if (err) {
                if (err.name == 'TokenExpiredError') {
                    reject({
                        statusCode: 401,
                        reason: `token expired`
                    });
                    return;
                } else {
                    reject({
                        statusCode: 401,
                        reason: `unauthorized`
                    });
                    return;
                }
            }
            promise_getUser(decoded.username)
                .then(user => {
                    return promise_authorize(user, user.password);
                })
                .then(user => {
                    resolve(decoded);
                })
                .catch(err => {
                    reject(err);
                })
        })
    })
}

module.exports = {
    auth: auth,
    verify: verify,
    authorize: authorize
}
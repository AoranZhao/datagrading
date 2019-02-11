var nano = require('nano');

let db = nano(process.env.COUCHDB_URL || 'http://couchdb2.learnable.ai').use('datagrading');
let userDb = nano(process.env.COUCHDB_URL || 'http://couchdb2.learnable.ai').use('user');

let getDB = () => {
    return db;
}

let getUserDB = () => {
    return userDb;
}

let printInfoLog = (func, str) => {
    let date = new Date().toISOString();
    console.log(`${date} - Info - ${func}`);
    console.log(`${date} - Info - ${str}`);
}

let printErrLog = (func, str) => {
    let date = new Date().toISOString();
    console.log(`${date} - Err - ${func}`);
    console.log(`${date} - Err - ${str}`);
}

module.exports = {
    getDB: getDB,
    getUserDB: getUserDB,
    printInfoLog: printInfoLog,
    printErrLog: printErrLog
}

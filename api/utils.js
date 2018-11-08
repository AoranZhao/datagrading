var nano = require('nano');

let db = nano(process.env.COUCHDB_URL || 'http://127.0.0.1:8840').use('datagrading');

let getDB = () => {
    return db;
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
    printInfoLog: printInfoLog,
    printErrLog: printErrLog
}
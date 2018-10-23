var nano = require('nano');

let getDB = () => {
    return nano(process.env.COUCHDB_URL || 'http://192.168.56.3:8840');
}

module.exports = {
    getDB: getDB
}
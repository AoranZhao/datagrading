var path = require('path');

const PORT = process.env.PORT || 2800;
const STATIC_DATA_PATH = process.env.STATIC_DATA_PATH || '/tmp';
const STATIC_URL_PATH = process.env.STATIC_URL_PATH || '/gradingdata';
const STATIC_URL_PREFIX = process.env.STATIC_URL_PREFIX || path.join(`http://localhost:${PORT}/`, STATIC_URL_PATH);

module.exports = {
    PORT: PORT,
    STATIC_DATA_PATH: STATIC_DATA_PATH,
    STATIC_URL_PATH: STATIC_URL_PATH,
    STATIC_URL_PREFIX: STATIC_URL_PREFIX
}
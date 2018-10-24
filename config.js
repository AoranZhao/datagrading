var path = require('path');

const PORT = process.env.PORT || 2800;
const STATIC_REF_DATA_PATH = process.env.STATIC_REF_DATA_PATH || '/tmp/reference';
const STATIC_REF_URL_PATH = process.env.STATIC_REF_URL_PATH || '/gradingdata/reference/';
const STATIC_SOL_DATA_PATH = process.env.STATIC_SOL_DATA_PATH || '/tmp/solution';
const STATIC_SOL_URL_PATH = process.env.STATIC_SOL_URL_PATH || '/gradingdata/solution/';

const STATIC_REF_URL_PREFIX = (typeof process.env.STATIC_REF_URL_PREFIX != 'undefined') ? path.join(process.env.STATIC_REF_URL_PREFIX, STATIC_REF_URL_PATH) : path.join(`http://localhost:${PORT}/`, STATIC_REF_URL_PATH);
const STATIC_SOL_URL_PREFIX = (typeof process.env.STATIC_SOL_URL_PREFIX != 'undefined') ? path.join(process.env.STATIC_SOL_URL_PREFIX, STATIC_SOL_URL_PATH) : path.join(`http://localhost:${PORT}/`, STATIC_SOL_URL_PATH);

module.exports = {
    PORT: PORT,
    STATIC_REF_DATA_PATH: STATIC_REF_DATA_PATH,
    STATIC_REF_URL_PATH: STATIC_REF_URL_PATH,
    STATIC_SOL_DATA_PATH: STATIC_SOL_DATA_PATH,
    STATIC_SOL_URL_PATH: STATIC_SOL_URL_PATH,

    STATIC_REF_URL_PREFIX: STATIC_REF_URL_PREFIX,
    STATIC_SOL_URL_PREFIX: STATIC_SOL_URL_PREFIX
}
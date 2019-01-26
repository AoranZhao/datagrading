var path = require('path');

const PORT = process.env.PORT || 2800;
const STATIC_REF_DATA_PATH = process.env.STATIC_REF_DATA_PATH || '/tmp/reference';
const STATIC_REF_CONTAINER_DATA_PATH = process.env.STATIC_REF_CONTAINER_DATA_PATH || '/data/reference';
const STATIC_REF_URL_PATH = process.env.STATIC_REF_URL_PATH || '/gradingdata/reference';
const STATIC_SOL_DATA_PATH = process.env.STATIC_SOL_DATA_PATH || '/tmp/solution';
const STATIC_SOL_CONTAINER_DATA_PATH = process.env.STATIC_SOL_CONTAINER_DATA_PATH || '/data/solution';
const STATIC_SOL_URL_PATH = process.env.STATIC_SOL_URL_PATH || '/gradingdata/solution';

let STATIC_REF_URL_PREFIX = (typeof process.env.STATIC_REF_URL_PREFIX != 'undefined') ? path.join(process.env.STATIC_REF_URL_PREFIX, STATIC_REF_URL_PATH) : path.join(`http://127.0.0.1:${PORT}/`, STATIC_REF_URL_PATH);
let STATIC_SOL_URL_PREFIX = (typeof process.env.STATIC_SOL_URL_PREFIX != 'undefined') ? path.join(process.env.STATIC_SOL_URL_PREFIX, STATIC_SOL_URL_PATH) : path.join(`http://127.0.0.1:${PORT}/`, STATIC_SOL_URL_PATH);
STATIC_REF_URL_PREFIX = STATIC_REF_URL_PREFIX.replace(new RegExp('^http:/*'), 'http://').replace(new RegExp('^https:/*'), 'https://');
STATIC_SOL_URL_PREFIX = STATIC_SOL_URL_PREFIX.replace(new RegExp('^http:/*'), 'http://').replace(new RegExp('^https:/*'), 'https://');

const STATIC_IMG_DATA_PATH = process.env.STATIC_IMG_DATA_PATH || '/tmp/images';
const STATIC_IMG_CONTAINER_DATA_PATH = process.env.STATIC_IMG_CONTAINER_DATA_PATH || '/data/images';
const STATIC_IMG_URL_PATH = process.env.STATIC_IMG_URL_PATH || '/gradingdata/images';
let STATIC_IMG_URL_PREFIX = (typeof process.env.STATIC_IMG_URL_PREFIX != 'undefined') ? path.join(process.env.STATIC_IMG_URL_PREFIX, STATIC_IMG_URL_PATH) : path.join(`http://127.0.0.1:${PORT}/`, STATIC_IMG_URL_PATH);
STATIC_IMG_URL_PREFIX = STATIC_IMG_URL_PREFIX.replace(new RegExp('^http:/*'), 'http://').replace(new RegExp('^https:/*'), 'https://');

module.exports = {
    PORT: PORT,
    STATIC_REF_DATA_PATH: STATIC_REF_DATA_PATH,
    STATIC_REF_URL_PATH: STATIC_REF_URL_PATH,
    STATIC_REF_CONTAINER_DATA_PATH: STATIC_REF_CONTAINER_DATA_PATH,
    STATIC_SOL_DATA_PATH: STATIC_SOL_DATA_PATH,
    STATIC_SOL_URL_PATH: STATIC_SOL_URL_PATH,
    STATIC_SOL_CONTAINER_DATA_PATH: STATIC_SOL_CONTAINER_DATA_PATH,

    STATIC_REF_URL_PREFIX: STATIC_REF_URL_PREFIX,
    STATIC_SOL_URL_PREFIX: STATIC_SOL_URL_PREFIX,

    STATIC_IMG_DATA_PATH: STATIC_IMG_DATA_PATH,
    STATIC_IMG_CONTAINER_DATA_PATH: STATIC_IMG_CONTAINER_DATA_PATH,
    STATIC_IMG_URL_PATH: STATIC_IMG_URL_PATH,
    STATIC_IMG_URL_PREFIX: STATIC_IMG_URL_PREFIX
}
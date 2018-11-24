var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');

var route = require('./route');
var config = require('./config');

const PORT = config.PORT;

const STATIC_REF_DATA_PATH = config.STATIC_REF_DATA_PATH;
const STATIC_REF_URL_PATH = config.STATIC_REF_URL_PATH;
const STATIC_REF_CONTAINER_DATA_PATH = config.STATIC_REF_CONTAINER_DATA_PATH;
const STATIC_SOL_CONTAINER_DATA_PATH = config.STATIC_SOL_CONTAINER_DATA_PATH;
const STATIC_SOL_DATA_PATH = config.STATIC_SOL_DATA_PATH;
const STATIC_SOL_URL_PATH = config.STATIC_SOL_URL_PATH;

const STATIC_REF_URL_PREFIX = config.STATIC_REF_URL_PREFIX;
const STATIC_SOL_URL_PREFIX = config.STATIC_SOL_URL_PREFIX;

const STATIC_IMG_CONTAINER_DATA_PATH = config.STATIC_IMG_CONTAINER_DATA_PATH;
const STATIC_IMG_URL_PATH = config.STATIC_IMG_URL_PATH;

app.use(bodyParser.json({
    type: 'application/json'
}))
app.use(bodyParser.urlencoded({
    type: 'application/x-www-form-urlencoded',
    extended: true
}))

app.use(cors());
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-App-Key, X-Account, X-Auth-Token, X-Token, Verified-Token')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    next()
})

app.use(STATIC_REF_URL_PATH, express.static(STATIC_REF_CONTAINER_DATA_PATH));
app.use(STATIC_SOL_URL_PATH, express.static(STATIC_SOL_CONTAINER_DATA_PATH));
app.use(STATIC_IMG_URL_PATH, express.static(STATIC_IMG_CONTAINER_DATA_PATH));

app.use('/api/grading/v1', route.apiRoute);

app.listen(PORT, () => {
    console.log(`server start at ${PORT}`);
})

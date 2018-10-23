var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');

var route = require('./route');
var config = require('./config');

const PORT = config.PORT;
const STATIC_DATA_PATH = config.STATIC_DATA_PATH;
const STATIC_URL_PATH = config.STATIC_URL_PATH;
const STATIC_URL_PREFIX = config.STATIC_URL_PREFIX;

app.use(bodyParser.json({
    type: 'application/json'
}))

app.use(cors());
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-App-Key, X-Account, X-Auth-Token, X-Token, Verified-Token')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    next()
})

app.use(STATIC_URL_PATH, express.static(STATIC_DATA_PATH));

app.use('/api/grading/v1', route.apiRoute);

app.listen(PORT, () => {
    console.log(`server start at ${PORT}`);
})

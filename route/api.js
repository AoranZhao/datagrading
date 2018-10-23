var express = require('express');
var api = require('../api');

var apiRoute = express.Router();

apiRoute.get('/', (req, res) => {
    res.status(200).send('succeed');
})

apiRoute.get('/reference/list', (req, res) => {
    api.ref_getList(req, res);
})

apiRoute.get('/reference/:id', (req, res) => {
    api.ref_getRef(req, res);
})

apiRoute.post('/reference/:id', (req, res) => {
    api.ref_postRef(req, res);
})

apiRoute.get('/student-solution/:refId/list', (req, res) => {
    api.solu_getList(req, res);
})

apiRoute.get('/student-solution/:refId/:soluId', (req, res) => {
    api.solu_getSolu(req, res);
})

apiRoute.post('/student-solution/:refId/:soluId', (req, res) => {
    api.solu_postSolu(req, res);
})

module.exports = {
    apiRoute: apiRoute
}
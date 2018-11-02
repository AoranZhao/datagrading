var express = require('express');
var api = require('../api');

var apiRoute = express.Router();

apiRoute.get('/', (req, res) => {
    res.status(200).send('succeed');
})

apiRoute.get('/references', (req, res) => {
    api.ref_getList(req, res);
})

apiRoute.get('/references/:id', (req, res) => {
    api.ref_getRef(req, res);
})

apiRoute.post('/references/:id', (req, res) => {
    api.ref_postRef(req, res);
})

apiRoute.delete('/references/:id', (req, res) => {
    api.ref_deleteRef(req, res);
})

apiRoute.get('/references/:refId/solutions', (req, res) => {
    api.solu_getList(req, res);
})

apiRoute.get('/references/:refId/solutions/:soluId', (req, res) => {
    api.solu_getSolu(req, res);
})

apiRoute.post('/references/:refId/solutions/:soluId', (req, res) => {
    api.solu_postSolu(req, res);
})

apiRoute.delete('/references/:refId/solutions/:soluId', (req, res) => {
    api.solu_deleteSolu(req, res);
})

apiRoute.get('/line_segmentations', (req, res) => {
    api.lineseg_getList(req, res);
})

apiRoute.get('/line_segmentations/:id', (req, res) => {
    api.lineseg_getSeg(req, res);
})

apiRoute.post('/line_segmentations/:id', (req, res) => {
    api.lineseg_postSeg(req, res);
})

apiRoute.delete('/line_segmentations/:id', (req, res) => {
    api.lineseg_deleteSeg(req, res);
})

module.exports = {
    apiRoute: apiRoute
}
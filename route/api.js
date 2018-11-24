var express = require('express');
var api = require('../api');
var connectMultiparty = require('connect-multiparty');

var multiParty = connectMultiparty();
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

apiRoute.get('/ocr', (req, res) => {
    api.lineseg_getList(req, res);
})

apiRoute.get('/ocr/:id', (req, res) => {
    api.lineseg_getSeg(req, res);
})

apiRoute.post('/ocr/:id', (req, res) => {
    api.lineseg_postSeg(req, res);
})

apiRoute.delete('/ocr/:id', (req, res) => {
    api.lineseg_deleteSeg(req, res);
})

apiRoute.get('/ocr/:scan_id/images', (req, res) => {
    api.image_getImages(req, res);
})

apiRoute.post('/ocr/:scan_id/images', multiParty, (req, res) => {
    api.image_postImages(req, res);
})

apiRoute.delete('/ocr/:scan_id/images/:image_id', (req, res) => {
    api.image_deleteImages(req, res);
})

module.exports = {
    apiRoute: apiRoute
}
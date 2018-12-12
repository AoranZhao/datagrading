var express = require('express');
var api = require('../api');
var connectMultiparty = require('connect-multiparty');

var multiParty = connectMultiparty();
var apiAuthRoute = express.Router();
var apiGradingRoute = express.Router();


apiAuthRoute.post('/auth', (req, res) => {
    api.user_auth(req, res);
})

apiAuthRoute.get('/verify', (req, res) => {
    api.user_verify(req, res);
})


apiGradingRoute.get('/', (req, res) => {
    // api.authorize(req, res, (request, response) => {
    response.status(200).send('succeed');
    // response.status(200).send(request.headers['x-user']);
    // })
})

apiGradingRoute.get('/references', (req, res) => {
    api.ref_getList(req, res);
})

apiGradingRoute.get('/references/:id', (req, res) => {
    api.ref_getRef(req, res);
})

apiGradingRoute.post('/references/:id', (req, res) => {
    api.ref_postRef(req, res);
})

apiGradingRoute.delete('/references/:id', (req, res) => {
    api.ref_deleteRef(req, res);
})

apiGradingRoute.get('/references/:refId/solutions', (req, res) => {
    api.solu_getList(req, res);
})

apiGradingRoute.get('/references/:refId/solutions/:soluId', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.solu_getSolu(request, response);
    })
})

apiGradingRoute.post('/references/:refId/solutions/:soluId', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.solu_postSolu(request, response);
    })
})

apiGradingRoute.delete('/references/:refId/solutions/:soluId', (req, res) => {
    api.solu_deleteSolu(req, res);
})

apiGradingRoute.get('/ocr', (req, res) => {
    api.lineseg_getList(req, res);
})

apiGradingRoute.get('/ocr/:id', (req, res) => {
    api.lineseg_getSeg(req, res);
})

apiGradingRoute.post('/ocr/:id', (req, res) => {
    api.lineseg_postSeg(req, res);
})

apiGradingRoute.delete('/ocr/:id', (req, res) => {
    api.lineseg_deleteSeg(req, res);
})

apiGradingRoute.get('/ocr/:scan_id/images', (req, res) => {
    api.image_getImages(req, res);
})

apiGradingRoute.post('/ocr/:scan_id/images', multiParty, (req, res) => {
    api.image_postImages(req, res);
})

apiGradingRoute.delete('/ocr/:scan_id/images/:image_id', (req, res) => {
    api.image_deleteImages(req, res);
})

module.exports = {
    apiAuthRoute: apiAuthRoute,
    apiGradingRoute: apiGradingRoute
}
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
    res.status(200).send('succeed');
    // response.status(200).send(request.headers['x-user']);
    // })
})

apiGradingRoute.get('/references', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.ref_getList(request, response);
    });
})

apiGradingRoute.get('/references/:id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.ref_getRef(request, response);
    });
})

apiGradingRoute.post('/references/:id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.ref_postRef(request, response);
    });
})

apiGradingRoute.delete('/references/:id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.ref_deleteRef(request, response);
    });
})

apiGradingRoute.get('/references/:refId/solutions', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.solu_getList(request, response);
    });
})

apiGradingRoute.get('/references/:refId/solutions/:soluId', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.solu_getSolu(request, response);
    });
})

apiGradingRoute.post('/references/:refId/solutions/:soluId', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.solu_postSolu(request, response);
    });
})

apiGradingRoute.delete('/references/:refId/solutions/:soluId', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.solu_deleteSolu(request, response);
    });
})

apiGradingRoute.get('/ocr', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.lineseg_getList(request, response);
    });
})

apiGradingRoute.get('/ocr/:id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.lineseg_getSeg(request, response);
    });
})

apiGradingRoute.post('/ocr/:id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.lineseg_postSeg(request, response);
    });
})

apiGradingRoute.delete('/ocr/:id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.lineseg_deleteSeg(request, response);
    });
})

apiGradingRoute.get('/ocr/:scan_id/images', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.image_getImages(request, response);
    });
})

apiGradingRoute.post('/ocr/:scan_id/images', multiParty, (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.image_postImages(request, response);
    });
})

apiGradingRoute.delete('/ocr/:scan_id/images/:image_id', (req, res) => {
    api.authorize(req, res, (request, response) => {
        api.image_deleteImages(request, response);
    });
})

module.exports = {
    apiAuthRoute: apiAuthRoute,
    apiGradingRoute: apiGradingRoute
}
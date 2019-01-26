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
    // api.authorize(req, res, (request, response) => {
    //     api.lineseg_getList(request, response);
    // });
    api.lineseg_getList(req, res);
})

apiGradingRoute.get('/ocr/:id', (req, res) => {
    // api.authorize(req, res, (request, response) => {
    //     api.lineseg_getSeg(request, response);
    // });
    api.lineseg_getSeg(req, res);
})

apiGradingRoute.post('/ocr/:id', (req, res) => {
    // api.authorize(req, res, (request, response) => {
    //     api.lineseg_postSeg(request, response);
    // });
    api.lineseg_postSeg(req, res);
})

apiGradingRoute.delete('/ocr/:id', (req, res) => {
    // api.authorize(req, res, (request, response) => {
    //     api.lineseg_deleteSeg(request, response);
    // });
    api.lineseg_deleteSeg(req, res);
})

apiGradingRoute.get('/ocr/:scan_id/images', (req, res) => {
    // api.authorize(req, res, (request, response) => {
    //     api.image_getImages(request, response);
    // });
    api.image_getImages(req, res);
})

apiGradingRoute.post('/ocr/:scan_id/images', multiParty, (req, res) => {
    // api.authorize(req, res, (request, response) => {
    //     api.image_postImages(request, response);
    // });
    api.image_postImages(req, res);
})

apiGradingRoute.delete('/ocr/:scan_id/images/:image_id', (req, res) => {
    // api.authorize(req, res, (request, response) => {
    //     api.image_deleteImages(request, response);
    // });
    api.image_deleteImages(req, res);
})

module.exports = {
    apiAuthRoute: apiAuthRoute,
    apiGradingRoute: apiGradingRoute
}
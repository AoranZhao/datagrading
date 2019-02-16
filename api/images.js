'use strict';

let utils = require('./utils');
let fs = require('fs');
let path = require('path');
let config = require('../config');

let db = utils.getDB();

let getImages = (req, res) => {
    promise_getImages(req.params.scan_id)
        .then(result => {
            res.status(200).send({
                statusCode: 200,
                data: result
            });
            return;
        })
        .catch(err => {
            res.status(err.statusCode || 500).send(err);
            return;
        })
}

let postImages = (req, res) => {
    let data = [];
    try {
        data = JSON.parse(req.body.data || []);
    } catch (err) {
        res.status(500).send({ statusCode: 500, reason: err.message || err });
        return;
    }
    promise_postImages(req.params.scan_id, req.files.images, data)
        .then(result => {
            res.status(200).send({
                statusCode: 200,
                data: "success"
            });
            return;
        })
        .catch(err => {
            res.status(err.statusCode || 500).send(err);
            return;
        })
}

let deleteImages = (req, res) => {
    promise_deleteImages(req.params.scan_id, req.params.image_id)
        .then(result => {
            res.status(200).send({
                statusCode: 200,
                data: "success"
            });
            return;
        })
        .catch(err => {
            res.status(err.statusCode || 500).send(err);
            return;
        })
}

let promise_getImages = (scan_id) => {
    return new Promise((resolve, reject) => {
        if (typeof scan_id === 'undefined') {
            reject({ statusCode: 404, reason: "not find scan id in url, please check your request." });
            return;
        }
        promise_checkScanId(scan_id)
            .then(() => {
                db.view('image', 'ocrImageByScanId', { key: scan_id }, (err, body) => {
                    if (err) {
                        reject({ statusCode: err.statusCode, reason: err.reason });
                        return;
                    }
                    let listImages = [];
                    body.rows.forEach(row => {
                        listImages.push({
                            image_id: row.value.id,
                            original_filename: row.value.original_filename,
                            mime: row.value.mime,
                            note1: row.value.note1,
                            note2: row.value.note2,
                            scan_path: convert_scanPath(row.value.filename)
                        });
                    })
                    resolve(listImages);
                })
            })
            .catch(err => {
                reject(err);
            });
    })
}

let promise_postImages = (scan_id, images, data) => {
    return new Promise((resolve, reject) => {
        if (typeof scan_id === 'undefined') {
            reject({ statusCode: 404, reason: "not find scan id in url, please check your request." });
            return;
        }
        promise_checkScanId(scan_id)
            .then(() => {
                if (!Array.isArray(images)) {
                    images = [images];
                }
                if (!Array.isArray(data)) {
                    data = [data];
                }
                let imagesWithData = images.reduce((arr, image, index) => {
                    arr.push({
                        image: image,
                        data: (data.length > index) ? data[index] : {}
                    })
                    return arr;
                }, []);
                // console.log(imagesWithData);
                // resolve();
                return promise_save(scan_id, imagesWithData);
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject(err);
            })
    })
}

let promise_deleteImages = (scan_id, image_id) => {
    return new Promise((resolve, reject) => {
        if (typeof scan_id === 'undefined') {
            reject({ statusCode: 404, reason: "not find scan id in url, please check your request." });
            return;
        }
        if (typeof image_id === 'undefined') {
            reject({ statusCode: 404, reason: "not find image id in url, please check your request." });
            return;
        }
        promise_checkScanId(scan_id)
            .then(() => {
                db.view('image', 'ocrImageByScanIdAndId', { key: [scan_id, image_id], include_docs: true }, (err, body) => {
                    if (err) {
                        reject({ statusCode: err.statusCode, reason: err.reason });
                        return;
                    }
                    if (body.rows.length == 0) {
                        reject({ statusCode: 400, reason: `not find image with id <${image_id}> associated with scan id <${scan_id}>` });
                        return;
                    }
                    let id = body.rows[0].doc._id;
                    let rev = body.rows[0].doc._rev;
                    let filePath;
                    if (typeof body.rows[0].doc.filename !== 'undefined') {
                        filePath = path.join(config.STATIC_IMG_CONTAINER_DATA_PATH, body.rows[0].doc.filename);
                    }
                    db.destroy(id, rev, (err, body) => {
                        if (err) {
                            reject({ statusCode: err.statusCode, reason: err.reason });
                            return;
                        }
                        if (typeof filePath !== 'undefined' && fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                        resolve();
                    })
                })
            })
            .catch(err => {
                reject(err);
            })
    })
}

let promise_checkScanId = (scan_id) => {
    return new Promise((resolve, reject) => {
        db.view('linesegmentation', 'lineSegId', { key: scan_id }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            if (body.rows.length == 0) {
                reject({ statusCode: 404, reason: `not found line segmentation with id <${scan_id}>` });
                return;
            }
            resolve();
        })
    })
}

let promise_save = (scan_id, images) => {
    return new Promise((resolve, reject) => {
        let objs = images.reduce((arr, image) => {
            let theImage = image.image, theData = image.data;
            let paths = theImage.path.split('/');
            let newPath = path.join(config.STATIC_IMG_CONTAINER_DATA_PATH, paths[paths.length - 1]);
            // fs.renameSync(image.path, newPath);
            fs.copyFileSync(theImage.path, newPath);
            if (fs.existsSync(theImage.path)) {
                fs.unlinkSync(theImage.path);
            }
            arr.push({
                scan_id: scan_id,
                filename: paths[paths.length - 1],
                type: theImage.type,
                originalFilename: theImage.originalFilename,
                note1: theData.note1 || "",
                note2: theData.note2 || "",
                created_date: new Date().toISOString(),
                doc_type: 'ocr_image'
            })
            return arr;
        }, []);
        db.bulk({ docs: objs }, (err, body) => {
            if (err) {
                reject({ statusCode: err.statusCode, reason: err.reason });
                return;
            }
            resolve();
        });
    })
}

let convert_scanPath = (filename) => {
    return `${config.STATIC_IMG_URL_PREFIX}/${filename}`;
    // return path.join(config.STATIC_IMG_URL_PREFIX, filename);
}

module.exports = {
    getImages: getImages,
    postImages: postImages,
    deleteImages: deleteImages
}


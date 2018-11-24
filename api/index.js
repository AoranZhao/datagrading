var reference = require('./reference');
var solution = require('./solution');
var lineSegmentation = require('./lineSegmentation');
var images = require('./images');

module.exports = {
    ref_getList: reference.getReferenceList,
    ref_getRef: reference.getReference,
    ref_postRef: reference.postReference,
    ref_deleteRef: reference.deleteReference,

    solu_getList: solution.getSolutionList,
    solu_getSolu: solution.getSolution,
    solu_postSolu: solution.postSolution,
    solu_deleteSolu: solution.deleteSolution,

    lineseg_getList: lineSegmentation.getSegmentationList,
    lineseg_getSeg: lineSegmentation.getSegmentation,
    lineseg_postSeg: lineSegmentation.postSegmentation,
    lineseg_deleteSeg: lineSegmentation.deleteSegmentation,

    image_getImages: images.getImages,
    image_postImages: images.postImages,
    image_deleteImages: images.deleteImages
}
var reference = require('./reference');
var solution = require('./solution');

module.exports = {
    ref_getList: reference.getReferenceList,
    ref_getRef: reference.getReference,
    ref_postRef: reference.postReference,
    ref_deleteRef: reference.deleteReference,

    solu_getList: solution.getSolutionList,
    solu_getSolu: solution.getSolution,
    solu_postSolu: solution.postSolution,
    solu_deleteSolu: solution.deleteSolution
}
const sinon = require('sinon')

module.exports = function() {
    return Object.freeze({
        get: sinon.stub()
    })
}
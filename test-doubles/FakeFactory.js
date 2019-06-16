const sinon = require('sinon')

module.exports = function() {
    return Object.freeze({
        create: sinon.stub()
    })
}
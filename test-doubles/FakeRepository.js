const sinon = require('sinon')

module.exports = function() {
    return Object.freeze({
        create: sinon.stub(),
        get: sinon.stub(),
        add: sinon.stub(),
        find: sinon.stub()
    })
}
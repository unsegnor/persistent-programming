const StatefulObject = require('./StatefulObject')

module.exports = function() {
    return Object.freeze({
        create
    })

    async function create({id, state, objectRepository}){
        return StatefulObject({id, state, objectRepository})
    }
}
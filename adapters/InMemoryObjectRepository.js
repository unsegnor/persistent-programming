const State = require('./InMemoryState')
const ObjectRepository = require('../domain/ObjectRepository')
const ObjectFactory = require('../domain/StatefulObject.factory')
const IdGenerator = require('./InMemoryIdGenerator')

module.exports = function(dependencies) {
    let repository = ObjectRepository({
        factory: ObjectFactory(),
        idGenerator: (dependencies && dependencies.idGenerator) || IdGenerator(),
        state: State()})

    return Object.freeze({
        getNew,
        get,
        getRoot
    })

    async function getNew(){
        return repository.getNew()
    }

    async function get(id){
        return repository.get(id)
    }

    async function getRoot(id){
        return repository.getRoot(id)
    }
}
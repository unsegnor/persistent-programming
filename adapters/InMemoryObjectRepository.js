const State = require('./InMemoryState')
const ObjectRepository = require('../domain/ObjectRepository')
const ObjectFactory = require('../domain/StatefulObject.factory')
const IdGenerator = require('./InMemoryIdGenerator')

module.exports = function(dependencies) {
    let state = State()
    let idGenerator = (dependencies && dependencies.idGenerator) || IdGenerator()
    let repository = ObjectRepository({
        factory: ObjectFactory(),
        idGenerator,
        state})

    return Object.freeze({
        getNew,
        get,
        getRoot,
        close
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

    async function close(){
        await state.close()
    }
}
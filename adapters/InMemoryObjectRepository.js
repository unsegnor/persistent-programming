const State = require('./InMemoryState')
const ObjectRepository = require('../domain/ObjectRepository')
const ObjectFactory = require('../domain/StatefulObject.factory')
const IdGenerator = require('./InMemoryIdGenerator')

module.exports = function() {
    let repository = ObjectRepository({factory: ObjectFactory(), idGenerator: IdGenerator(), state: State()})

    return Object.freeze({
        getNew,
        get
    })

    async function getNew(){
        return repository.getNew()
    }

    async function get(id){
        return repository.get(id)
    }

}
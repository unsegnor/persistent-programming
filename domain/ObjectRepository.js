module.exports = function({factory, idGenerator, state}) {
    return Object.freeze({
        getNew,
        get,
        getRoot
    })

    async function getRoot(id){
        var internalId = `root-${id}`
        return await factory.create({id: internalId, state, objectRepository: this})
    }

    async function getNew(){
        let id = await idGenerator.getNew()
        var internalId = `internal-${id}`
        await state.register(internalId)
        return await factory.create({id: internalId, state, objectRepository: this})
    }

    async function get(id){
        if(! await state.isRegistered(id)){
            throw new Error('id does not exist')
        }

        return await factory.create({id, state, objectRepository: this})
    }
}
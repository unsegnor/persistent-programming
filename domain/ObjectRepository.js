module.exports = function({factory, idGenerator, state}) {
    return Object.freeze({
        getNew,
        get
    })

    async function getNew(){
        let id = await idGenerator.getNew()
        await state.register(id)
        return await factory.create({id, state, objectRepository: this})
    }

    async function get(id){
        if(! await state.isRegistered(id)){
            throw new Error('id does not exist')
        }

        return await factory.create({id, state, objectRepository: this})
    }
}
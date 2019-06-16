module.exports = function StatefulObject({id, state, objectRepository}) {

    const reference_type = 'reference'
    const primitive_type = 'primitive'
    const primitive_list_type = 'primitive-list'
    const reference_list_type = 'reference-list'

    return Object.freeze({
        set,
        get,
        id
    })

    async function set(attribute, value){
        if(Array.isArray(value)){
            //TODO: empty array

            if(typeof value[0] === 'object'){
                var idsArray = []
                for(var item of value){
                    if(!item.id) throw new Error('missing id')
                    //TODO: allow arrays of multiple types, make them always references and build complex types on the factory
                    idsArray.push(item.id)
                }
                await state.store({id, attribute, value: idsArray, type: reference_list_type})
            } else{
                await state.store({id, attribute, value, type: primitive_list_type})
            }
        }else if(typeof value === 'object'){
            if(!value.id) throw new Error('missing id')
            await state.store({id, attribute, value: value.id, type: reference_type})
        }else if(typeof value === 'string'){
            await state.store({id, attribute, value, type: primitive_type})
        }
    }

    async function get(attribute){
        let retrievedInfo = await state.load({id, attribute})

        if(retrievedInfo.type === primitive_type){
            return retrievedInfo.value
        }
        
        if(retrievedInfo.type === reference_type){
            return await objectRepository.get(retrievedInfo.value)
        }
                
        if(retrievedInfo.type === reference_list_type){
            var objects = []
            for(var objectId of retrievedInfo.value){
                var object = await objectRepository.get(objectId)
                objects.push(object)
            }
            return objects
        }

        if(retrievedInfo.type === primitive_list_type){
            return retrievedInfo.value
        }
    }
}
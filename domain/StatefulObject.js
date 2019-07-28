module.exports = function StatefulObject({id, state, objectRepository}) {

    const reference_type = 'reference'
    const primitive_type = 'primitive'
    const primitive_list_type = 'primitive-list'
    const reference_list_type = 'reference-list'

    return Object.freeze({
        set,
        get,
        getId,
        add
    })

    async function getId(){
        return id
    }

    async function set(attribute, value){
        if(Array.isArray(value)){
            if(typeof value[0] === 'object'){
                var idsArray = []
                for(var item of value){
                    if(!item.getId) throw new Error('missing id')
                    idsArray.push(await item.getId())
                }
                await state.store({id, attribute, value: idsArray, type: reference_list_type})
            } else{
                await state.store({id, attribute, value, type: primitive_list_type})
            }
        }else if(typeof value === 'object'){
            if(!value.getId) throw new Error('missing id')
            await state.store({id, attribute, value: await value.getId(), type: reference_type})
        }else if(typeof value === 'string'){
            await state.store({id, attribute, value, type: primitive_type})
        }else{
            throw new Error('type not supported: ' + (typeof value))
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

        if(retrievedInfo.type === undefined){
            return undefined
        }

        throw new Error('type not expected: ' + retrievedInfo.type)
    }

    async function add(attribute, value){
        var oldAttribute = await state.load({id, attribute})

        if(value === undefined || Array.isArray(value) && value.some(function(item){ return item === undefined})){
            throw new Error('adding undefined values is not supported')
        }

        if(Array.isArray(value) && !isAnArrayOf(value, 'object') && !isAnArrayOf(value, 'string')) throwMixedListsNotSupportedError()

        if(isAnArrayOf(value, 'object')){
            var ids = []
            for(var item of value){
                if(!item.getId) throw new Error('missing id')
                ids.push(await item.getId())
            }

            if(oldAttribute.type === primitive_type || oldAttribute.type === primitive_list_type) throwMixedListsNotSupportedError()

            if(oldAttribute.type === reference_type){
                await state.store({id, attribute, value: [oldAttribute.value, ...ids], type: reference_list_type})
            }else if(oldAttribute.type === reference_list_type){
                await state.store({id, attribute, value: [...oldAttribute.value, ...ids], type: reference_list_type})
            }else{
                await state.store({id, attribute, value: ids, type: reference_list_type})
            }
        }else if((typeof(value)) === 'object' && !Array.isArray(value)){
            if(!value.getId) throw new Error('missing id')

            if(oldAttribute.type === primitive_type || oldAttribute.type === primitive_list_type) throwMixedListsNotSupportedError()
            
            var valueId = await value.getId()
            if(oldAttribute.type === reference_type){
                await state.store({id, attribute, value: [oldAttribute.value, valueId], type: reference_list_type})
            }else if(oldAttribute.type === reference_list_type){
                await state.store({id, attribute, value: [...oldAttribute.value, valueId], type: reference_list_type})
            }else{
                await state.store({id, attribute, value: [valueId], type: reference_list_type})
            }
        }else if((typeof(value)) === 'string'){
            if(oldAttribute.type === primitive_type){
                await state.store({id, attribute, value: [oldAttribute.value, value], type: primitive_list_type})    
            }else if(oldAttribute.type === primitive_list_type){
                await state.store({id, attribute, value: [...oldAttribute.value, value], type: primitive_list_type})    
            }else if(oldAttribute.type === reference_type || oldAttribute.type === reference_list_type){
                throwMixedListsNotSupportedError()
            }else{
                await state.store({id, attribute, value: [value], type: primitive_list_type})
            }
        }else if(isAnArrayOf(value, 'string')){
            if(oldAttribute.type === primitive_type){
                await state.store({id, attribute, value: [oldAttribute.value, ...value], type: primitive_list_type})        
            }else if(oldAttribute.type === primitive_list_type){
                await state.store({id, attribute, value: [...oldAttribute.value, ...value], type: primitive_list_type})    
            }else if(oldAttribute.type === reference_type || oldAttribute.type === reference_list_type){
                throwMixedListsNotSupportedError()
            }else{
                await state.store({id, attribute, value: value, type: primitive_list_type})    
            }
        }else{
            throw new Error('type not supported: ' + (typeof value))
        }
    }

    function throwMixedListsNotSupportedError(){
        throw new Error('lists of mixed primitives and objects are not yet supported')
    }

    function isAnArrayOf(value, type){
        return Array.isArray(value) && 
            value.every(function(item){
                return typeof(item) === type
            })
    }
}
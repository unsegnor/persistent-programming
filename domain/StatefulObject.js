module.exports = function StatefulObject({id, state, objectRepository}) {

    const reference_type = 'reference'
    const primitive_type = 'primitive'
    const primitive_list_type = 'primitive-list'
    const reference_list_type = 'reference-list'

    return Object.freeze({
        set,
        get,
        getId,
        add,
        getProperties
    })

    async function getId(){
        return id
    }

    async function set(property, value){
        if(isStringValue(value)){
            var typeToStore = isAList(value) ? primitive_list_type : primitive_type
            await state.store({id, property, value, type: typeToStore})
        }else if(isObjectValue(value)){
            if(isAList(value)){
                var ids = await getIdsFromObjectsList(value)
                await state.store({id, property, value: ids, type: reference_list_type})
            }else{
                if(!value.getId) throw new Error('missing id')
                await state.store({id, property, value: await value.getId(), type: reference_type})
            }
        }else{
            throw new Error('type not supported: ' + (typeof value))
        }
    }

    async function get(property){
        let retrievedInfo = await state.load({id, property})

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

    async function add(property, newValue){
        var currentProperty = await state.load({id, property})
        var currentType = currentProperty.type
        var currentValue = currentProperty.value

        if(isAnEmptyList(newValue)) return
        if(hasUndefinedValues(newValue)) throw new Error('adding undefined values is not supported')
        if(isAMixedList(newValue) || isMixedTypeAndValue(currentType, newValue)) throwMixedListsNotSupportedError()

        let valueToStore, typeToStore

        if(isObjectValue(newValue)){
            var newValues = isAList(newValue)? newValue : [newValue]
            var newIds = await getIdsFromObjectsList(newValues)
            valueToStore = joinValuesInAList(currentValue, newIds)
            typeToStore = reference_list_type
        }else if(isStringValue(newValue)){
            valueToStore = joinValuesInAList(currentValue, newValue)
            typeToStore = primitive_list_type
        }else{
            throw new Error('type not supported: ' + (typeof newValue))
        }

        await state.store({id, property, value: valueToStore, type: typeToStore})
    }

    function joinValuesInAList(currentValue, newValue){
        if(currentValue === undefined) {
            if(isAList(newValue)) return newValue
            return [newValue]
        }

        if(isAList(currentValue) && isAList(newValue)) return [...currentValue, ...newValue]
        if(!isAList(currentValue) && isAList(newValue)) return [currentValue, ...newValue]
        if(isAList(currentValue) && !isAList(newValue)) return [...currentValue, newValue]
        return [currentValue, newValue]
    }

    async function getIdsFromObjectsList(list){
        var ids = []
        for(var item of list){
            if(!item.getId) throw new Error('missing id')
            ids.push(await item.getId())
        }
        return ids
    }

    function isReferenceType(type){
        return (type === reference_list_type) || (type === reference_type)
    }

    function isPrimitiveType(type){
        return (type === primitive_list_type) || (type === primitive_type)
    }

    function isStringValue(value){
        return (typeof(value) === 'string') || isAListOf(value, 'string')
    }

    function isObjectValue(value){
        return isAnObject(value) || isAListOf(value, 'object')
    }

    function isAnObject(value){
        return (typeof(value) === 'object') && !Array.isArray(value)
    }

    function isAList(value){
        return Array.isArray(value)
    }

    function isAMixedList(list){
        return  isAList(list) &&
                !isAListOf(list, 'object') &&
                !isAListOf(list, 'string')
    }

    function isAnEmptyList(value){
        return isAList(value) && (value.length === 0)
    }

    function isMixedTypeAndValue(type, value){
        return  (isStringValue(value) && isReferenceType(type)) ||
                (isObjectValue(value) && isPrimitiveType(type))
    }

    function hasUndefinedValues(value){
        return  isUndefined(value) || (isAList(value) && value.some(isUndefined))
    }

    function isUndefined(value){
        return value === undefined
    }

    function throwMixedListsNotSupportedError(){
        throw new Error('lists of mixed primitives and objects are not yet supported')
    }

    function isAListOf(value, type){
        return isAList(value) && 
            value.every(function(item){
                return typeof(item) === type
            })
    }

    async function getProperties(){
        return state.getProperties({id})
    }
}
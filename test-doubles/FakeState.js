module.exports = function() {
    let storedId, storedProperty, storedValue, storedType
    let fakeStoredId, fakeStoredProperty, fakeStoredInfo
    let registeredElement, valueToReturnWhenAskingForIsRegistered, idRegistered
    let somethingStored = false
    let propertiesToReturn, idWithProperties

    return Object.freeze({
        store,
        load,
        register,
        isRegistered,
        getProperties,

        hasStored,
        setStored,
        setRegistered,
        hasRegistered,
        setPropertiesForId,

        assertHasStored,
        hasStoredAnything
    })

    async function register(element){
        registeredElement = element
    }

    async function isRegistered(id){
        if(id === idRegistered) return valueToReturnWhenAskingForIsRegistered
    }
    
    async function store({id, property, value, type}){
        storedId = id
        storedProperty = property
        storedValue = value
        storedType = type
        somethingStored = true
    }

    async function assertHasStored({id, property, value, type}){
        if(storedId !== id) throw new Error('stored id: ' + storedId + ' is different than expected: ' + id)
        if(storedProperty !== property) throw new Error('stored property: ' + storedProperty + ' is different than expected: ' + property)
        if(storedType !== type) throw new Error('stored type: ' + storedType + ' is different than expected: ' + type)
        if(!equals(storedValue, value)) throw new Error('stored value: ' + storedValue + ' is different than expected: ' + value )
    }

    async function hasStored({id, property, value, type}){
        return (storedId === id &&
            storedProperty === property &&
            equals(storedValue,value) &&
            storedType === type)
    }

    function hasStoredAnything(){
        return somethingStored
    }

    function equals(value, value2){
        if(!Array.isArray(value)) return value === value2
        if(Array.isArray(value) === Array.isArray(value2)){

            if(value.length !== value2.length) return false

            for(var i = 0; i<value.length; i++){
                if(value[i] !== value2[i]) return false
            }

            return true
        }
    }

    function setStored({id, property, value, type}){
        fakeStoredId = id
        fakeStoredProperty = property
        fakeStoredInfo = { value, type }
    }

    async function load({id, property}){
        if(id !== fakeStoredId) throw new Error(`id not matching ${id}`)
        if(property !== fakeStoredProperty) throw new Error(`property not matching ${property}`)
        return fakeStoredInfo
    }

    function setRegistered(id, value){
        idRegistered = id
        valueToReturnWhenAskingForIsRegistered = value
    }

    function hasRegistered(element){
        return registeredElement === element
    }

    function setPropertiesForId({id, fakeProperties}){
        propertiesToReturn = fakeProperties
        idWithProperties = id
    }

    async function getProperties({id}){
        if(id != idWithProperties) throw new Error(`id not matching: "${id}" expected "${idWithProperties}"`)
        return propertiesToReturn
    }
}
module.exports = function() {
    let storedId, storedAttribute, storedValue, storedType
    let fakeStoredId, fakeStoredAttribute, fakeStoredInfo
    let registeredElement, valueToReturnWhenAskingForIsRegistered, idRegistered

    return Object.freeze({
        store,
        load,
        register,
        isRegistered,

        hasStored,
        setStored,
        setRegistered,
        hasRegistered,

        assertHasStored
    })

    async function register(element){
        registeredElement = element
    }

    async function isRegistered(id){
        if(id === idRegistered) return valueToReturnWhenAskingForIsRegistered
    }
    
    async function store({id, attribute, value, type}){
        storedId = id
        storedAttribute = attribute
        storedValue = value
        storedType = type
    }

    async function assertHasStored({id, attribute, value, type}){
        if(storedId !== id) throw new Error('stored id: ' + storedId + ' is different than expected: ' + id)
        if(storedAttribute !== attribute) throw new Error('stored attribute: ' + storedAttribute + ' is different than expected: ' + attribute)
        if(storedType !== type) throw new Error('stored type: ' + storedType + ' is different than expected: ' + type)
        if(!equals(storedValue, value)) throw new Error('stored value: ' + storedValue + ' is different than expected: ' + value )
    }

    async function hasStored({id, attribute, value, type}){
        return (storedId === id &&
            storedAttribute === attribute &&
            equals(storedValue,value) &&
            storedType === type)
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

    function setStored({id, attribute, value, type}){
        fakeStoredId = id
        fakeStoredAttribute = attribute
        fakeStoredInfo = { value, type }
    }

    async function load({id, attribute}){
        if(id !== fakeStoredId) throw new Error(`id not matching ${id}`)
        if(attribute !== fakeStoredAttribute) throw new Error(`attribute not matching ${attribute}`)
        return fakeStoredInfo
    }

    function setRegistered(id, value){
        idRegistered = id
        valueToReturnWhenAskingForIsRegistered = value
    }

    function hasRegistered(element){
        return registeredElement === element
    }
}
module.exports = function() {
    let stored = {}

    return Object.freeze({
        store,
        load,
        register,
        isRegistered,
        getProperties
    })

    async function store({id, property, value, type}){
        stored[getValueIdFor(id, property)] = value
        stored[getTypeIdFor(id, property)] = type
        addProperty(id, property)
    }

    function addProperty(id, property){
        var properties = stored[`${id}.PROPERTIES`] || []
        properties.push(property)
        stored[`${id}.PROPERTIES`] = properties
    }

    async function load({id, property}){
        return {
            value: stored[getValueIdFor(id, property)],
            type: stored[getTypeIdFor(id, property)]
        }
    }

    function composeId(id1, id2){
        return `${id1.length}${id1}${id2.length}${id2}`
    }

    function getValueIdFor(id, property){
        return `${composeId(id, property)}.VALUE`
    }

    function getTypeIdFor(id, property){
        return `${composeId(id, property)}.TYPE`
    }

    async function register(id){
        stored[`${id}.REGISTERED`] = 'true'
    }

    async function isRegistered(id){
        return stored[`${id}.REGISTERED`] === 'true'
    }
    
    async function getProperties({id}){
        return stored[`${id}.PROPERTIES`] || []
    }
}
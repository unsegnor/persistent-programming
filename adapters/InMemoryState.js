module.exports = function() {
    let stored = {}

    return Object.freeze({
        store,
        load,
        register,
        isRegistered
    })

    async function store({id, attribute, value, type}){
        stored[getValueIdFor(id, attribute)] = value
        stored[getTypeIdFor(id, attribute)] = type
    }

    async function load({id, attribute}){
        return {
            value: stored[getValueIdFor(id, attribute)],
            type: stored[getTypeIdFor(id, attribute)]
        }
    }

    function composeId(id1, id2){
        return `${id1.length}${id1}${id2.length}${id2}`
    }

    function getValueIdFor(id, attribute){
        return `${composeId(id, attribute)}.VALUE`
    }

    function getTypeIdFor(id, attribute){
        return `${composeId(id, attribute)}.TYPE`
    }

    async function register(id){
        stored[`${id}.REGISTERED`] = 'true'
    }

    async function isRegistered(id){
        return stored[`${id}.REGISTERED`] === 'true'
    }
}
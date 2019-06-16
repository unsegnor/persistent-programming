module.exports = function() {
    let createdObject = false
    let creationParameters = {}
    let objectToCreate

    return Object.freeze({
        create,

        hasCreatedAnObject,
        hasCreatedAnObjectWith,
        setFakeObjectToCreate
    })

    async function create(parameters){
        creationParameters = parameters
        createdObject = true
        return objectToCreate
    }

    function hasCreatedAnObject(){
        return createdObject
    }

    function hasCreatedAnObjectWith(parameters){
        for(let property in parameters){
            if(parameters[property] !== creationParameters[property]) return false
        }

        return true
    }

    function setFakeObjectToCreate(object){
        objectToCreate = object
    }
}
module.exports = function() {
    let satisfiedObject

    return Object.freeze({
        isSatisfiedBy,

        setSatisfiedBy
    })

    async function isSatisfiedBy(object){
        if(satisfiedObject === object) return true
        throw new Error('object not expected')
    }

    function setSatisfiedBy(object){
        satisfiedObject = object
    }
}
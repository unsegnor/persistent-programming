module.exports = function({object}) {
    
    return Object.freeze({
        isSatisfiedBy
    })

    async function isSatisfiedBy(otherObject){
        return (await object.getId()) === (await otherObject.getId())
    }
}
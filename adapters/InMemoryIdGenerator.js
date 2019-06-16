module.exports = function() {
    let currentId = 0
    
    return Object.freeze({
        getNew
    })

    async function getNew(){
        currentId++
        return currentId
    }
}
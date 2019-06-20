module.exports = function() {
    let id

    return Object.freeze({
        getNew,

        setFakeId
    })

    async function getNew(){
        return id
    }

    function setFakeId(fakeId){
        id = fakeId
    }
}
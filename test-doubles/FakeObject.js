module.exports = function() {
    let fakeId,
    equalObject = {},
    notEqualObject = {},
    fakeValue,
    expectedAttribute

    return Object.freeze({
        getId,
        equals,
        get,

        setFakeId,
        setEquals,
        setNotEquals,
        setFake
    })

    function setFakeId(id){
        fakeId = id
    }

    function setEquals(object){
        equalObject = object
    }

    function setNotEquals(object){
        notEqualObject = object
    }

    function setFake(attribute, value){
        expectedAttribute = attribute
        fakeValue = value
    }

    async function getId(){
        return fakeId
    }

    async function equals(object){
        if(object === equalObject) return true
        if(object === notEqualObject) return false
        throw new Error('object not expected')
    }

    async function get(attribute){
        if(attribute === expectedAttribute) return fakeValue
        throw new Error('attribute not expected')
    }
}
const {expect} = require('chai')

module.exports = function(){
    return Object.freeze({
        expectToThrow
    })

    async function expectToThrow(expectedMessage, fn){
        try{
            await fn()
            expect.fail()
        } catch(error){
            expect(error.message).to.contain(expectedMessage)
        }
    }
}
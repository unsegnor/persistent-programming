const {expect} = require('chai')

module.exports = function(){
    return Object.freeze({
        expectToThrow
    })

    async function expectToThrow(expectedMessage, fn){
        var notFailedError = new Error('The execution did not throw any exception')
        try{
            await fn()
            throw notFailedError
        } catch(error){
            if(error === notFailedError){
                throw new Error('Expected exception containing: "' + expectedMessage + '" but no exception was thrown.')
            }else{
                expect(error.message).to.contain(expectedMessage)
            }
        }
    }
}
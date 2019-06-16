const {expect} = require('chai')
const FakeSpecification = require('./FakeSpecification')

describe('FakeSpecification', function(){
    describe('isSatisfiedBy', function(){
        it('must return true when the input is set as satisfied by the object', async function(){
            var object = 'fakeObject'
            var specification = FakeSpecification()
            specification.setSatisfiedBy(object)

            expect(await specification.isSatisfiedBy(object)).to.equal(true)
        })

        it('must throw when the input is not set as satisfied by the object', async function(){
            var object = 'fakeObject'
            var specification = FakeSpecification()

            try{
                await specification.isSatisfiedBy(object)
                expect.fail()
            }catch(error){
                expect(error.message).to.contain('object not expected')
            }
        })
    })
})
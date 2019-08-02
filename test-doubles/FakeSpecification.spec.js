const {expect} = require('chai')
const expectToThrow  = require('expect-to-throw')
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
            await expectToThrow('object not expected', async function(){
                await specification.isSatisfiedBy(object)
            })
        })
    })
})
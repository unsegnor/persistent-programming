const {expect} = require('chai')
const EqualObjectSpecification = require('./EqualObjectSpecification')
const FakeObject = require('../test-doubles/FakeObject')


describe('EqualObjectSpecification', function(){
    describe('isSatisfiedBy', function(){
        it('must return false when the object ids are not the same', async function(){
            var object1 = FakeObject()
            object1.setFakeId('id')
            var object2 = FakeObject()
            object2.setFakeId('otherId')
            var specification = EqualObjectSpecification({object: object1})
            var result = await specification.isSatisfiedBy(object2)

            expect(result).to.equal(false)
        })

        it('must return true when the object ids are the same', async function(){
            var object1 = FakeObject()
            object1.setFakeId('id')
            var object2 = FakeObject()
            object2.setFakeId('id')
            var specification = EqualObjectSpecification({object: object1})
            var result = await specification.isSatisfiedBy(object2)

            expect(result).to.equal(true)
        })
    })
})
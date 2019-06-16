const {expect} = require('chai')
const FakeObject = require('./FakeObject')

describe('FakeObject', function(){
    describe('getId', function(){
        it('must return the fake id setted', async function(){
            var object = FakeObject()
            object.setFakeId('fakeId')
            expect(await object.getId()).to.equal('fakeId')
        })
    })

    describe('equals', function(){
        it('must return true when the object has been set as equal', async function(){
            var object = FakeObject()
            var otherObject = 'otherObject'

            object.setEquals(otherObject)

            expect(await object.equals(otherObject)).to.equal(true)
        })

        it('must return false when the object has been set as not equal', async function(){
            var object = FakeObject()
            var otherObject = 'otherObject'

            object.setNotEquals(otherObject)

            expect(await object.equals(otherObject)).to.equal(false)
        })

        it('must throw when the object has not been set as equal', async function(){
            var object = FakeObject()
            var otherObject = 'otherObject'

            try{
                await object.equals(otherObject)
                expect.fail()
            }catch(error){
                expect(error.message).to.contain('object not expected')
            }
        })

        it('must throw when the object is undefined and has not been set as equal', async function(){
            var object = FakeObject()

            try{
                await object.equals()
                expect.fail()
            }catch(error){
                expect(error.message).to.contain('object not expected')
            }
        })
    })

    describe('get', function(){
        it('must return the fake value setted when requesting the same attribute', async function(){
            var object = FakeObject()
            object.setFake('attribute', 'value')
            
            expect(await object.get('attribute')).to.equal('value')
        })

        it('must throw when getting a not expected attribute', async function(){
            var object = FakeObject()
            object.setFake('attribute', 'value')
            
            try{
                await object.get('otherAttribute')
                expect.fail()
            }catch(error){
                expect(error.message).to.contain('attribute not expected')
            }
        })
    })
})
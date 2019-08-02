const {expect} = require('chai')
const expectToThrow  = require('expect-to-throw')
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
            await expectToThrow('object not expected', async function(){
                await object.equals(otherObject)
            })
        })

        it('must throw when the object is undefined and has not been set as equal', async function(){
            var object = FakeObject()
            await expectToThrow('object not expected', async function(){
                await object.equals()
            })
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
            await expectToThrow('attribute not expected', async function(){
                await object.get('otherAttribute')
            })
        })
    })
})
const {expect} = require('chai')
const FakeObjectFactory = require('./FakeObjectFactory')

describe('FakeObjectFactory', function(){
    let factory

    beforeEach(function(){
        factory = FakeObjectFactory()
    })

    describe('hasCreatedAnObject', function(){
        it('must return false when no object has been created', async function(){
            expect(factory.hasCreatedAnObject()).to.equal(false)
        })

        it('must return true when an object has been created', async function(){
            await factory.create()
            expect(factory.hasCreatedAnObject()).to.equal(true)
        })
    })

    describe('hasCreatedAnObjectWith', function(){
        it('must return false when no object has been created with the property and the value specified', async function(){
            expect(factory.hasCreatedAnObjectWith({property: 'value'})).to.equal(false)
        })

        it('must return true when an object has been created with the property and the value specified', async function(){
            await factory.create({property: 'value'})
            expect(factory.hasCreatedAnObjectWith({property: 'value'})).to.equal(true)
        })

        it('must return false when no object has been created with all the properties and the values specified', async function(){
            await factory.create({property: 'value'})
            expect(factory.hasCreatedAnObjectWith({property: 'value', property2: 'value2'})).to.equal(false)
        })

        it('must return true when an object has been created with all the properties and the values specified', async function(){
            await factory.create({property2: 'value2', property: 'value'})
            expect(factory.hasCreatedAnObjectWith({property: 'value', property2: 'value2'})).to.equal(true)
        })

        it('must return true when an object has been created with more than the properties and the values specified', async function(){
            await factory.create({property2: 'value2', property: 'value'})
            expect(factory.hasCreatedAnObjectWith({property: 'value'})).to.equal(true)
        })
    })

    describe('create', function(){
        it('must return the fake object to create', async function(){
            var object = 'object'
            factory.setFakeObjectToCreate(object)
            var result = await factory.create()

            expect(result).to.equal(object)
        })
    })
})
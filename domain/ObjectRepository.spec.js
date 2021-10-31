const {expect} = require('chai')
const expectToThrow  = require('expect-to-throw')
const ObjectRepository = require('./ObjectRepository')
const FakeObjectFactory = require('../test-doubles/FakeObjectFactory')
const FakeIdGenerator = require('../test-doubles/FakeIdGenerator')
const FakeState = require('../test-doubles/FakeState')

describe('ObjectRepository', function(){
    let repository, factory, idGenerator, state

    beforeEach(function(){
        factory = FakeObjectFactory()
        idGenerator = FakeIdGenerator()
        state = FakeState()
        repository = ObjectRepository({factory, idGenerator, state})
    })

    describe('getNew', function(){
        it('must use the factory to create a new object', async function(){
            await repository.getNew()
            expect(factory.hasCreatedAnObject()).to.equal(true)
        })

        it('must set the id as the one provided by the id generator plus the prefix', async function(){
            var newId = 'newId'
            idGenerator.setFakeId(newId)
            await repository.getNew()
            
            expect(factory.hasCreatedAnObjectWith({id: `internal-${newId}`})).to.equal(true)
        })

        it('must set the state as the given state', async function(){
            await repository.getNew()
            expect(factory.hasCreatedAnObjectWith({state})).to.equal(true)
        })

        it('must set the object repository of the new object as itself', async function(){
            await repository.getNew()
            expect(factory.hasCreatedAnObjectWith({objectRepository: repository})).to.equal(true)
        })

        it('must return the new object', async function(){
            var expectedObject = 'expectedObject'
            factory.setFakeObjectToCreate(expectedObject)
            var result = await repository.getNew()

            expect(result).to.equal(expectedObject)
        })

        it('must add the objectId to the state', async function(){
            var id = 'newId'
            idGenerator.setFakeId(id)
            await repository.getNew()

            expect(state.hasRegistered(`internal-${id}`)).to.equal(true)
        })
    })

    describe('get', function(){
        let id

        beforeEach(function(){
            id = 'objectId'            
        })

        it('must throw when the id does not exist in the state', async function(){
            state.setRegistered(id, false)
            await expectToThrow('id does not exist', async function(){
                await repository.get(id)
            })
        })

        describe('when the id does exist', function(){
            beforeEach(function(){
                state.setRegistered(id, true)
            })

            it('must use the factory to create a new object', async function(){
                await repository.get(id)
                expect(factory.hasCreatedAnObject()).to.equal(true)
            })
    
            it('must set the id as the one specified', async function(){
                await repository.get(id)
                expect(factory.hasCreatedAnObjectWith({id: id})).to.equal(true)
            })
    
            it('must set the state as the given state', async function(){
                await repository.get(id)
                expect(factory.hasCreatedAnObjectWith({state})).to.equal(true)
            })
    
            it('must set the object repository of the new object as itself', async function(){
                await repository.get(id)
                expect(factory.hasCreatedAnObjectWith({objectRepository: repository})).to.equal(true)
            })
    
            it('must return the new object', async function(){
                var expectedObject = 'expectedObject'
                factory.setFakeObjectToCreate(expectedObject)
                var result = await repository.get(id)
    
                expect(result).to.equal(expectedObject)
            })
        })
    })
})
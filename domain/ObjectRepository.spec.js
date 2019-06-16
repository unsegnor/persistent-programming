const {expect} = require('chai')
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

        it('must set the id as the one provided by the id generator', async function(){
            var newId = 'newId'
            idGenerator.setFakeId(newId)
            await repository.getNew()
            
            expect(factory.hasCreatedAnObjectWith({id: newId})).to.equal(true)
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

            expect(state.hasRegistered(id)).to.equal(true)
        })
    })

    describe('get', function(){
        let id

        beforeEach(function(){
            id = 'objectId'            
        })

        it('must throw when the id does not exist in the state', async function(){
            state.setRegistered(id, false)

            try{
                await repository.get(id)
                expect.fail()
            } catch(error){
                expect(error.message).to.contain('id does not exist')
            }
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

    //ObjectRepository también añade algo al state?? o lo que son diferentes son los states??
    //no, el objectRepository quizá podría añadir algo al guardarlo.... bueno sí, ya lo hace, lo de exist
    //aunque el exist bien lo podría añadir la propia clase al ser instanciada

    //claro, el repository sólo tendría que mantener en el state la información de qué ids contiene
    //y ya cada repository puede hacer sus paranoias de optimización de índices y tal...

    //claro que la implementación actual obliga a que el state sea el mismo para el repository y las clases
    //bueno, en realidad eso lo gestiona el repository que sabe qué state asigna a cada objeto que devuelve
    //bien podríamos tener un multirepository que en función de un parámetro o del id o del tipo de los objetos
    //utilizara un state diferente

    //o incluso tener un multistate que hiciera la distinción, claro que éste sólo la podría hacer en función de datos de almacenamiento
})
const {expect} = require('chai')
const StatefulObject = require('./StatefulObject')
const FakeState = require('../test-doubles/FakeState')
const FakeObjectRepository = require('../test-doubles/FakeObjectRepository')

describe('StatefulObject', function(){
    let object, state, id, objectRepository

    beforeEach(function(){
        id = 'objectId'
        state = FakeState()
        objectRepository = FakeObjectRepository()
        object = StatefulObject({id, state, objectRepository})
    })

    describe('set', function(){
        describe('when the value is a string', function(){
            it('must set the property value in the state as primitive', async function(){
                var property = 'propertyName'
                var newValue = 'newValue'
                await object.set(property, newValue)
                expect(await state.hasStored({id, attribute: property, value: newValue, type: 'primitive'})).to.equal(true)
            })
        })

        describe('when the value is an array of strings', function(){
            it('must store the array of values as a list of primitives', async function(){
                var property = 'propertyName'
                var value1 = 'value1'
                var value2 = 'value2'
                var array = [value1, value2]

                await object.set(property, array)

                expect(await state.hasStored({id, attribute: property, value: array, type: 'primitive-list'})).to.equal(true)
            })
        })

        describe('when the value is an object', function(){
            describe('when the value has no id property', function(){
                it('must throw an error', async function(){
                    var property = 'propertyName'
                    var newValue = {name: 'cosa'}
                    try{
                        await object.set(property, newValue)
                        expect.fail()
                    }catch(error){
                        expect(error.message).to.contain('missing id')
                    }
                })
            })

            describe('when the value has id property', function(){
                it('must set the value id in the stored value and set it as a reference', async function(){
                    var property = 'propertyName'
                    var valueId = 'valueId'
                    var newValue = {id: valueId}
                    await object.set(property, newValue)

                    expect(await state.hasStored({id, attribute: property, value: valueId, type: 'reference'})).to.equal(true)
                })
            })
        })

        describe('when the value is an array of objects', function(){
            describe('when some of the objects have no id property', function(){
                it('must throw an error', async function(){
                    var property = 'propertyName'
                    var newValue = [{name: 'cosa', id:'validId'},{name: 'cosa2'}]
                    try{
                        await object.set(property, newValue)
                        expect.fail()
                    }catch(error){
                        expect(error.message).to.contain('missing id')
                    }
                })
            })

            describe('when the objects have an id property', function(){
                it('must set an array of the object ids in the stored value and set it as a reference-list', async function(){
                    var property = 'propertyName'
                    var valueId = 'valueId'
                    var valueId2 = 'valueId2'
                    var newValue = [{id: valueId}, {id: valueId2}]
                    await object.set(property, newValue)

                    expect(await state.hasStored({id, attribute: property, value: [valueId, valueId2], type: 'reference-list'})).to.equal(true)
                })
            })
        })
    })

    describe('get', function(){
        it('must return the value as a primitive when it is primitive', async function(){
            var attribute = 'attribute'
            var value = 'value'
            state.setStored({id, attribute, value, type: 'primitive'})
            var retrievedValue = await object.get(attribute)

            expect(retrievedValue).to.equal(value)
        })

        it('must return the value as an array when it is a primitive-list', async function(){
            var attribute = 'attribute'
            var value = ['value', 'value2']
            state.setStored({id, attribute, value, type: 'primitive-list'})
            var retrievedValue = await object.get(attribute)

            expect(retrievedValue).to.equal(value)
        })

        describe('when the value is a reference', function(){
            let attribute, value

            beforeEach(function(){
                attribute = 'attribute'
                value = 'value'
                state.setStored({id, attribute, value, type: 'reference'})
            })

            it('must retrieve the object with the value as the id from the object repository', async function(){
                await object.get(attribute)
                expect(objectRepository.get.calledWith(value)).to.equal(true)
            })

            it('must return the object given by the repository', async function(){
                var expectedObject = {id: 'expectedObject'}
                objectRepository.get.withArgs(value).resolves(expectedObject)

                var result = await object.get(attribute)

                expect(result).to.equal(expectedObject)
            })
        })

        describe('when the value is a reference list', function(){
            let attribute, value, id1, id2

            beforeEach(function(){
                attribute = 'attribute'
                id1 = 'id1'
                id2 = 'id2'
                value = [id1, id2]
                state.setStored({id, attribute, value, type: 'reference-list'})
            })

            it('must retrieve all the objects with the id from the object repository', async function(){
                await object.get(attribute)
                expect(objectRepository.get.calledWith(id1)).to.equal(true)
                expect(objectRepository.get.calledWith(id2)).to.equal(true)
            })

            it('must return the objects given by the repository', async function(){
                var expectedObject1 = {id: 'expectedObject'}
                var expectedObject2 = {id: 'expectedObject'}
                objectRepository.get.withArgs(id1).resolves(expectedObject1)
                objectRepository.get.withArgs(id2).resolves(expectedObject2)

                var result = await object.get(attribute)

                expect(result).to.contain(expectedObject1)
                expect(result).to.contain(expectedObject2)
            })
        })
    })
})
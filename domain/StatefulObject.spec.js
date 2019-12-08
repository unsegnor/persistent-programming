const {expect} = require('chai')
const expectToThrow  = require('expect-to-throw')
const StatefulObject = require('./StatefulObject')
const FakeState = require('../test-doubles/FakeState')
const FakeObjectRepository = require('../test-doubles/FakeObjectRepository')
const FakeObject = require('../test-doubles/FakeObject')

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

        describe('when the value is an empty array', function(){
            it('must store the array of values as a list of primitives', async function(){
                var property = 'propertyName'
                var array = []

                await object.set(property, array)

                expect(await state.hasStored({id, attribute: property, value: array, type: 'primitive-list'})).to.equal(true)
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
            describe('when the value has no id', function(){
                it('must throw an error', async function(){
                    var property = 'propertyName'
                    var newValue = {name: 'cosa'}
                    await expectToThrow('missing id', async function(){
                        await object.set(property, newValue)
                    })
                })
            })

            describe('when the value has id', function(){
                it('must set the value id in the stored value and set it as a reference', async function(){
                    var property = 'propertyName'
                    var valueId = 'valueId'
                    var newValue = FakeObject()
                    newValue.setFakeId(valueId)
                    await object.set(property, newValue)

                    expect(await state.hasStored({id, attribute: property, value: valueId, type: 'reference'})).to.equal(true)
                })
            })
        })

        describe('when the value is an array of objects', function(){
            describe('when some of the objects have no id property', function(){
                it('must throw an error', async function(){
                    var property = 'propertyName'
                    var objectValue = FakeObject()
                    objectValue.setFakeId('validId')
                    var newValue = [objectValue,{name: 'cosa2'}]

                    await expectToThrow('missing id', async function(){
                        await object.set(property, newValue)
                    })
                })
            })

            describe('when the objects have an id property', function(){
                it('must set an array of the object ids in the stored value and set it as a reference-list', async function(){
                    var property = 'propertyName'
                    var valueId = 'valueId'
                    var valueId2 = 'valueId2'
                    var objectValue1 = FakeObject()
                    objectValue1.setFakeId(valueId)
                    var objectValue2 = FakeObject()
                    objectValue2.setFakeId(valueId2)
                    var newValue = [objectValue1, objectValue2]
                    await object.set(property, newValue)

                    expect(await state.hasStored({id, attribute: property, value: [valueId, valueId2], type: 'reference-list'})).to.equal(true)
                })
            })
        })

        describe('when the value is a primitive but not a string', function(){
            it('must throw not supported primitive type exception', async function(){
                var property = 'propertyName'
                var newValue = 10100
                
                await expectToThrow('type not supported: ' + typeof(newValue), async function(){
                    await object.set(property, newValue)
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

        it('must return undefined when the attribute has no value nor type', async function(){
            var attribute = 'attribute'
            state.setStored({id, attribute, value: undefined, type: undefined})
            var retrievedValue = await object.get(attribute)
            expect(retrievedValue).to.equal(undefined)
        })

        it('must throw when the type is not expected', async function(){
            var attribute = 'attribute'
            var value = 'value'
            state.setStored({id, attribute, value, type: 'invalid-type'})

            await expectToThrow('type not expected: invalid-type', async function(){
                await object.get(attribute)
            })
        })
    })

    describe('add', function(){
        let oldValue, oldValue2, property, newValue

        function given_the_attribute_was_not_defined(){
            state.setStored({id, attribute: property, value: undefined, type: undefined})
        }

        function given_the_attribute_was_defined_as_a_string(){
            state.setStored({id, attribute: property, value: oldValue, type: 'primitive'})
        }

        function given_the_attribute_was_defined_as_an_object(){
            state.setStored({id, attribute: property, value: oldValue, type: 'reference'})
        }

        function given_the_attribute_was_defined_as_a_list_of_strings(){
            state.setStored({id, attribute: property, value: [oldValue, oldValue2], type: 'primitive-list'})
        }

        function given_the_attribute_was_defined_as_a_list_of_objects(){
            state.setStored({id, attribute: property, value: [oldValue, oldValue2], type: 'reference-list'})
        }

        async function when_we_add_the_new_value_to_the_attribute(){
            await object.add(property, newValue)
        }

        async function then_must_have_stored_the_value_with_type(expectedValue, expectedType){
            await state.assertHasStored({id, attribute: property, value: expectedValue, type: expectedType})
        }

        async function then_must_throw_adding_undefined_values_is_not_supported(){
            await expectToThrow('adding undefined values is not supported', async function(){
                await when_we_add_the_new_value_to_the_attribute()
            })
        }

        async function then_must_throw_mixed_lists_are_not_supported(){
            await expectToThrow('lists of mixed primitives and objects are not yet supported', async function(){
                await when_we_add_the_new_value_to_the_attribute()
            })
        }

        async function then_must_throw_missing_id_error(){
            await expectToThrow('missing id', async function(){
                await when_we_add_the_new_value_to_the_attribute()
            })
        }

        async function then_must_not_store_anything(){
            expect(state.hasStoredAnything()).to.equal(false)
        }

        beforeEach(function(){
            oldValue = 'oldValue'
            oldValue2 = 'oldValue2'
            property = 'propertyName'
            newValue = 'newValue'

            given_the_attribute_was_not_defined()
        })

        describe('when the value is a string', function(){
            describe('when the attribute was not defined', async function(){
                beforeEach(async function(){
                    given_the_attribute_was_not_defined()
                    await when_we_add_the_new_value_to_the_attribute()
                })

                it('must set the property value as an array of primitives with the string value', async function(){
                    await then_must_have_stored_the_value_with_type([newValue], 'primitive-list')
                })
            })

            describe('when the attribute was defined as a string', async function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_string()
                    await when_we_add_the_new_value_to_the_attribute()
                })

                it('must set the property value as an array of primitives with the string value and the old value', async function(){
                    await then_must_have_stored_the_value_with_type([oldValue, newValue], 'primitive-list')
                })
            })

            describe('when the attribute was defined as an object reference', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_an_object()
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })

            describe('when the attribute was defined as a list of primitives', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_strings()
                    await when_we_add_the_new_value_to_the_attribute()
                })

                it('must add the new value to the array', async function(){
                    await then_must_have_stored_the_value_with_type([oldValue, oldValue2, newValue], 'primitive-list')
                })
            })

            describe('when the attribute was defined as a list of references', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_objects()
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })
        })

        describe('when de value is undefined', function(){
            beforeEach(function(){
                newValue = undefined
            })
            
            describe('when the attribute was not defined', function(){
                beforeEach(async function(){
                    given_the_attribute_was_not_defined()
                })

                it('must throw adding undefined values is not supported', async function(){
                    await then_must_throw_adding_undefined_values_is_not_supported()
                })
            })

            describe('when the attribute was defined as a primitive', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_string()
                })

                it('must throw adding undefined values is not supported', async function(){
                    await then_must_throw_adding_undefined_values_is_not_supported()
                })
            })

            describe('when the attribute was defined as an object reference', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_an_object()
                })

                it('must throw adding undefined values is not supported', async function(){
                    await then_must_throw_adding_undefined_values_is_not_supported()
                })
            })

            describe('when the attribute was defined as a list of primitives', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_strings()
                })

                it('must throw adding undefined values is not supported', async function(){
                    await then_must_throw_adding_undefined_values_is_not_supported()
                })
            })

            describe('when the attribute was defined as a list of references', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_objects()
                })

                it('must throw adding undefined values is not supported', async function(){
                    await then_must_throw_adding_undefined_values_is_not_supported()
                })
            })
        })

        describe('when the value is an array of string', function(){
            let value1, value2

            beforeEach(async function(){
                value1 = 'value1'
                value2 = 'value2'
                newValue = [value1, value2]
            })

            describe('when the attribute was not defined', function(){
                beforeEach(function(){
                    given_the_attribute_was_not_defined()
                })

                it('must store the new value as a list of primitives', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_have_stored_the_value_with_type(newValue, 'primitive-list')
                })
            })

            describe('when the attribute was defined as a string', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_string()
                })

                it('must include the existing value in the beginning of the array', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_have_stored_the_value_with_type([oldValue, value1, value2], 'primitive-list')
                })
            })

            describe('when the attribute was defined as an object reference', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_an_object()
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })

            describe('when the attribute was defined as a list of primitives', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_strings()
                })

                it('must store the existing list with the new values', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_have_stored_the_value_with_type([oldValue, oldValue2, value1, value2], 'primitive-list')
                })
            })

            describe('when the attribute was defined as a list of references', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_objects()
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })
        })

        describe('when the value is an object', function(){
            describe('when the object does not have an id', function(){
                beforeEach(async function(){
                    newValue = {name: 'object'}
                })

                it('must throw missing id error', async function(){
                    await then_must_throw_missing_id_error()
                })
            })

            describe('when the object has an id', function(){
                let valueId

                beforeEach(async function(){
                    valueId = 'valueId'
                    newValue = FakeObject()
                    newValue.setFakeId(valueId)
                })

                describe('when the attribute was not defined', function(){
                    beforeEach(async function(){
                        given_the_attribute_was_not_defined()
                        await when_we_add_the_new_value_to_the_attribute()
                    })

                    it('must store the object id in a reference list', async function(){
                        await then_must_have_stored_the_value_with_type([valueId], 'reference-list')
                    })
                })

                describe('when the attribute was defined as a primitive', function(){
                    beforeEach(async function(){
                        given_the_attribute_was_defined_as_a_string()
                    })

                    it('must throw mixed lists are not supported', async function(){
                        await then_must_throw_mixed_lists_are_not_supported()
                    })
                })

                describe('when the attribute was defined as an object reference', function(){
                    beforeEach(async function(){
                        given_the_attribute_was_defined_as_an_object()
                    })

                    it('must store a reference list with the old value and the new object id', async function(){
                        await when_we_add_the_new_value_to_the_attribute()
                        await then_must_have_stored_the_value_with_type([oldValue, valueId], 'reference-list')
                    })
                })

                describe('when the attribute was defined as a list of primitives', function(){
                    beforeEach(async function(){
                        given_the_attribute_was_defined_as_a_list_of_strings()
                    })

                    it('must throw mixed lists are not supported', async function(){
                        await then_must_throw_mixed_lists_are_not_supported()
                    })
                })

                describe('when the attribute was defined as a list of references', function(){
                    beforeEach(async function(){
                        given_the_attribute_was_defined_as_a_list_of_objects()
                    })

                    it('must add the object id to the end of the existing list', async function(){
                        await when_we_add_the_new_value_to_the_attribute()
                        await then_must_have_stored_the_value_with_type([oldValue, oldValue2, valueId], 'reference-list')
                    })
                })
            })
            
        })

        describe('when the value is an array of objects', function(){
            var valueId, valueId2

            beforeEach(function(){
                valueId = 'valueId'
                valueId2 = 'valueId2'
                var object1 = FakeObject()
                object1.setFakeId(valueId)
                var object2 = FakeObject()
                object2.setFakeId(valueId2)
                newValue = [object1, object2]
            })

            describe('when some of the objects do not have an id', function(){
                beforeEach(async function(){
                    newValue.push({noId:'noId'})
                })

                it('must throw missing id error', async function(){
                    await then_must_throw_missing_id_error()
                })
            })

            describe('when the attribute was not defined', function(){
                beforeEach(async function(){
                    given_the_attribute_was_not_defined()
                })

                it('must store the new object ids as a reference list', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_have_stored_the_value_with_type([valueId, valueId2], 'reference-list')
                })
            })

            describe('when the attribute was defined as a primitive', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_string()
                })

                it('must throw mixed lists not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })

            describe('when the attribute was defined as an object reference', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_an_object()
                })

                it('must store the new objects ids and the old one in a reference-list', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_have_stored_the_value_with_type([oldValue, valueId, valueId2], 'reference-list')
                })
            })

            describe('when the attribute was defined as a list of primitives', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_strings()
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })

            describe('when the attribute was defined as a list of references', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_objects()
                })

                it('must add the new object ids to the reference list', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_have_stored_the_value_with_type([oldValue, oldValue2, valueId, valueId2], 'reference-list')
                })
            })
        })

        describe('when the value is an array of mixed strings and objects', function(){
            describe('starting with an object', function(){
                beforeEach(async function(){
                    var object1 = FakeObject()
                    object1.setFakeId('id1')
                    var object2 = FakeObject()
                    object2.setFakeId('id2')
                    newValue = [object1, 'patata', object2]
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })

            describe('starting with a string', function(){
                beforeEach(async function(){
                    var object1 = FakeObject()
                    object1.setFakeId('id1')
                    var object2 = FakeObject()
                    object2.setFakeId('id2')
                    newValue = ['potato', object1, 'patata', object2]
                })

                it('must throw mixed lists are not supported', async function(){
                    await then_must_throw_mixed_lists_are_not_supported()
                })
            })
        })

        describe('when the value is an array containing some undefined value', function(){
            beforeEach(async function(){
                newValue = ['value1', undefined, 'value2']
            })

            it('must throw adding undefined is not supported', async function(){
                await then_must_throw_adding_undefined_values_is_not_supported()
            })
        })

        describe('when the value is an empty array', function(){
            beforeEach(async function(){
                newValue = []
            })

            describe('when the attribute was not defined', function(){
                beforeEach(async function(){
                    given_the_attribute_was_not_defined()
                })

                it('must not store anything', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_not_store_anything()
                })
            })

            describe('when the attribute was defined as a primitive', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_string()
                })

                it('must not store anything', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_not_store_anything()
                })
            })

            describe('when the attribute was defined as an object reference', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_an_object()
                })

                it('must not store anything', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_not_store_anything()
                })
            })

            describe('when the attribute was defined as a list of primitives', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_strings()
                })

                it('must not store anything', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_not_store_anything()
                })
            })

            describe('when the attribute was defined as a list of references', function(){
                beforeEach(async function(){
                    given_the_attribute_was_defined_as_a_list_of_objects()
                })

                it('must not store anything', async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                    await then_must_not_store_anything()
                })
            })
        })

        describe('when the value is a primitive but not a string', function(){
            beforeEach(function(){
                newValue = 10100
            })

            it('must throw not supported primitive type exception', async function(){
                await expectToThrow('type not supported: ' + typeof(newValue), async function(){
                    await when_we_add_the_new_value_to_the_attribute()
                })
            })
        })
    })

    describe('getId', function(){
        it('must return the id of the object', async function(){
            expect(await object.getId()).to.equal(id)
        })
    })

    describe('getProperties', function(){
        it('must return the list of attributes related to the id in the state', async function(){
            var attribute1 = 'attribute1'
            var attribute2 = 'attribute2'
            var attributesList = [attribute1, attribute2]
            state.setAttributesForId({id, fakeAttributes: attributesList})

            var properties = await object.getProperties()

            expect(properties).to.contain(attribute1)
            expect(properties).to.contain(attribute2)
        })
    })
})
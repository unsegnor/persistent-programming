const {expect} = require('chai')
const expectToThrow  = require('expect-to-throw')
const FakeState = require('./FakeState')

describe('FakeState', function(){
    let state, id, property, value, type

    beforeEach(function(){
        state = FakeState()
        id = 'objectId'
        property = 'objectProperty'
        value = 'propertyValue'
        type = 'valueType'
    })

    describe('hasStored', function(){
        it('must return true when the id, property, value and type have been stored', async function(){
            await state.store({id, property, value, type})
            expect(await state.hasStored({id, property, value, type})).to.equal(true)
        })

        it('must return true when the id, property, value as an array and type have been stored', async function(){
            await state.store({id, property, value: ['value1', 'value2'], type})
            expect(await state.hasStored({id, property, value: ['value1', 'value2'], type})).to.equal(true)
        })

        it('must return false when the value as an array has different elements', async function(){
            await state.store({id, property, value: ['value1', 'value2'], type})
            expect(await state.hasStored({id, property, value: ['value3', 'value2'], type})).to.equal(false)
        })

        it('must return false when the value as an array has a different number of elements', async function(){
            await state.store({id, property, value: ['value1'], type})
            expect(await state.hasStored({id, property, value: ['value3', 'value2'], type})).to.equal(false)
        })

        it('must return false when the id has not been stored', async function(){
            await state.store({id, property, value, type})
            expect(await state.hasStored({id: 'otherId', property, value, type})).to.equal(false)
        })

        it('must return false when the property has not been stored', async function(){
            await state.store({id, property, value, type})
            expect(await state.hasStored({id, property: 'otherProperty', value, type})).to.equal(false)
        })

        it('must return false when the value has not been stored', async function(){
            await state.store({id, property, value, type})
            expect(await state.hasStored({id, property, value: 'otherValue', type})).to.equal(false)
        })

        it('must return false when the type has not been stored', async function(){
            await state.store({id, property, value, type})
            expect(await state.hasStored({id, property, value, type: 'otherType'})).to.equal(false)
        })
    })

    describe('assertHasStored', function(){
        it('must not throw when the id, property, value and type have been stored', async function(){
            await state.store({id, property, value, type})
            await state.assertHasStored({id, property, value, type})
        })

        it('must not throw when the id, property, value as an array and type have been stored', async function(){
            await state.store({id, property, value: ['value1', 'value2'], type})
            await state.assertHasStored({id, property, value: ['value1', 'value2'], type})
        })

        it('must throw when the value as an array has different elements', async function(){
            await state.store({id, property, value: ['value1', 'value2'], type})
            await expectToThrow('stored value: value1,value2 is different than expected: value3,value2', async function(){
                await state.assertHasStored({id, property, value: ['value3', 'value2'], type})
            })
        })

        it('must throw when the value as an array has a different number of elements', async function(){
            await state.store({id, property, value: ['value1'], type})
            await expectToThrow('stored value: value1 is different than expected: value3,value2', async function(){
                await state.assertHasStored({id, property, value: ['value3', 'value2'], type})
            })
        })

        it('must throw when the id has not been stored', async function(){
            await state.store({id, property, value, type})
            await expectToThrow('stored id: ' + id + ' is different than expected: otherId', async function(){
                await state.assertHasStored({id: 'otherId', property, value, type})
            })
        })

        it('must throw when the property has not been stored', async function(){
            await state.store({id, property, value, type})
            await expectToThrow('stored property: ' + property + ' is different than expected: otherProperty', async function(){
                await state.assertHasStored({id, property: 'otherProperty', value, type})
            })
        })

        it('must throw when the value has not been stored', async function(){
            await state.store({id, property, value, type})
            await expectToThrow('stored value: '+ value +' is different than expected: otherValue', async function(){
                await state.assertHasStored({id, property, value: 'otherValue', type})
            })
        })

        it('must throw when the type has not been stored', async function(){
            await state.store({id, property, value, type})
            await expectToThrow('stored type: '+ type +' is different than expected: otherType', async function(){
                await state.assertHasStored({id, property, value, type: 'otherType'})
            })
        })
    })

    describe('hasStoredAnything', function(){
        it('must return false when nothing was store', async function(){
            expect(state.hasStoredAnything()).to.equal(false)
        })

        it('must return true when something has been stored', async function(){
            await state.store({id, property, value, type})
            expect(state.hasStoredAnything()).to.equal(true)
        })
    })

    describe('load', function(){
        it('must return the store value setted when the id and the property match', async function(){
            state.setStored({id, property, value, type})
            var result = await state.load({id, property})
            expect(result.value).to.equal(value)
            expect(result.type).to.equal(type)
        })

        it('must throw when the id does not match', async function(){
            state.setStored({id, property, value, type})
            await expectToThrow('id not matching', async function(){
                await state.load({id: 'otherId', property})
            })
        })

        it('must throw when the property does not match', async function(){
            state.setStored({id, property, value, type})
            await expectToThrow('property not matching', async function(){
                await state.load({id, property: 'otherProperty'})
            })
        })
    })

    describe('isRegistered', function(){
        it('must return the value setted as registered when the id is the expected', async function(){
            state.setRegistered(id, 'value')
            expect(await state.isRegistered(id)).to.equal('value')
        })
    })

    describe('hasRegistered', function(){
        it('must return true when the given id has been registered', async function(){
            state.register('id')
            expect(await state.hasRegistered('id')).to.equal(true)
        })

        it('must return false when the given id has not been registered', async function(){
            state.register('id2')
            expect(await state.hasRegistered('id')).to.equal(false)
        })
    })

    describe('getProperties', function(){
        describe('when there is an id with properties', function(){
            let fakeProperties

            beforeEach(function(){
                fakeProperties = ['property1', 'property2']
                state.setPropertiesForId({id, fakeProperties})
            })

            it('must return the properties list setted for the specific id', async function(){
                expect(await state.getProperties({id})).to.equal(fakeProperties)
            })
    
            it('must throw when the id does not match', async function(){
                await expectToThrow('id not matching', async function(){
                    await state.getProperties({id: 'otherId'})
                })
            })
        })
    })
})
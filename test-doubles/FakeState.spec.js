const {expect} = require('chai')
const FakeState = require('./FakeState')

describe('FakeState', function(){
    let state, id, attribute, value, type

    beforeEach(function(){
        state = FakeState()
        id = 'objectId'
        attribute = 'objectAttribute'
        value = 'attributeValue'
        type = 'valueType'
    })

    describe('hasStored', function(){
        it('must return true when the id, attribute, value and type have been stored', async function(){
            await state.store({id, attribute, value, type})
            expect(await state.hasStored({id, attribute, value, type})).to.equal(true)
        })

        it('must return true when the id, attribute, value as an array and type have been stored', async function(){
            await state.store({id, attribute, value: ['value1', 'value2'], type})
            expect(await state.hasStored({id, attribute, value: ['value1', 'value2'], type})).to.equal(true)
        })

        it('must return false when the value as an array has different elements', async function(){
            await state.store({id, attribute, value: ['value1', 'value2'], type})
            expect(await state.hasStored({id, attribute, value: ['value3', 'value2'], type})).to.equal(false)
        })

        it('must return false when the value as an array has a different number of elements', async function(){
            await state.store({id, attribute, value: ['value1'], type})
            expect(await state.hasStored({id, attribute, value: ['value3', 'value2'], type})).to.equal(false)
        })

        it('must return false when the id has not been stored', async function(){
            await state.store({id, attribute, value, type})
            expect(await state.hasStored({id: 'otherId', attribute, value, type})).to.equal(false)
        })

        it('must return false when the attribute has not been stored', async function(){
            await state.store({id, attribute, value, type})
            expect(await state.hasStored({id, attribute: 'otherAttribute', value, type})).to.equal(false)
        })

        it('must return false when the value has not been stored', async function(){
            await state.store({id, attribute, value, type})
            expect(await state.hasStored({id, attribute, value: 'otherValue', type})).to.equal(false)
        })

        it('must return false when the type has not been stored', async function(){
            await state.store({id, attribute, value, type})
            expect(await state.hasStored({id, attribute, value, type: 'otherType'})).to.equal(false)
        })
    })

    describe('load', function(){
        it('must return the store value setted when the id and the attribute match', async function(){
            state.setStored({id, attribute, value, type})
            var result = await state.load({id, attribute})
            expect(result.value).to.equal(value)
            expect(result.type).to.equal(type)
        })

        it('must throw when the id does not match', async function(){
            state.setStored({id, attribute, value, type})
            try{
                await state.load({id: 'otherId', attribute})
                expect.fail()
            } catch(error){
                expect(error.message).to.contain('id not matching')
            }
        })

        it('must throw when the attribute does not match', async function(){
            state.setStored({id, attribute, value, type})
            try{
                await state.load({id, attribute: 'otherAttribute'})
                expect.fail()
            } catch(error){
                expect(error.message).to.contain('attribute not matching')
            }
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
})
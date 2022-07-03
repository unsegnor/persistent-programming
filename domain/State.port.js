const {expect} = require('chai')

module.exports = function(){
    describe('as a state', function(){
        let state
        let id, property, value, type

        beforeEach(function(){
            state = this.adapter
            id = 'id'
            property = 'property'
            value = 'value'
            type = 'type'
        })

        describe('load', function(){
            it('must return the value and type of the matching id and property', async function(){
                await state.store({id, property, value, type})
                var storedData = await state.load({id, property})
    
                expect(storedData.value).to.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return the last value and type of the matching id and property when they have been stored more than once', async function(){
                await state.store({id, property, value: 'oldValue', type: 'oldType'})
                await state.store({id, property, value, type})
                var storedData = await state.load({id, property})
    
                expect(storedData.value).to.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return the value and type of the matching id and property when the value is an array', async function(){
                value = ['value1', 'value2']
                await state.store({id, property, value, type})
                var storedData = await state.load({id, property})
    
                expect(storedData.value).to.deep.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return the value and type of the matching id and property when there are several entries', async function(){
                await state.store({id: 'otherId', property: 'otherProperty', value: 'otherValue', type: 'otherType'})
                await state.store({id, property, value, type})
                await state.store({id: 'otherId2', property: 'otherProperty2', value: 'otherValue2', type: 'otherType2'})
                var storedData = await state.load({id, property})
    
                expect(storedData.value).to.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return value and type undefined when no entry is matching the id and the property', async function(){
                await state.store({id: 'otherId', property: 'otherProperty', value: 'otherValue', type: 'otherType'})
                await state.store({id: 'otherId2', property: 'otherProperty2', value: 'otherValue2', type: 'otherType2'})
                var storedData = await state.load({id, property})
    
                expect(storedData.value).to.be.undefined
                expect(storedData.type).to.be.undefined
            })

            it('must return value and type of the matching id and property when there are several pairs of id and property that concatenate equally', async function(){
                await state.store({id: 'abc', property: 'def', value: 'value1', type: 'type1'})
                await state.store({id: 'abcd', property: 'ef', value: 'value2', type: 'type2'})
                var storedData = await state.load({id: 'abc', property: 'def'})
    
                expect(storedData.value).to.equal('value1')
                expect(storedData.type).to.equal('type1')
            })

            function createStringWithNCharacters(amount, character){
                return new Array(amount +1).join(character)
            }

            it('must return value and type of the matching id and property when there are several pairs of id and property that concatenate equally using special characters', async function(){
                for(var i = 0; i< 256; i++){
                    var character = String.fromCharCode(i)
                    var cc = createStringWithNCharacters(2, character)
                    var ccc = createStringWithNCharacters(3, character)
                    await state.store({id: cc, property: ccc, value: 'value1', type: 'type1'})
                    await state.store({id: ccc, property: cc, value: 'value2', type: 'type2'})
                    var storedData = await state.load({id: cc, property: ccc})
        
                    expect(storedData.value).to.equal('value1', `fails with the character "${character}" maybe it is being used as a separator`)
                    expect(storedData.type).to.equal('type1', `fails with the character "${character}" maybe it is being used as a separator`)
                }
            })
        })

        describe('isRegistered', function(){
            it('must return true when the element has been already registered', async function(){
                await state.register('elementId')
                expect(await state.isRegistered('elementId')).to.equal(true)
            })

            it('must return false when the element has not been registered', async function(){
                expect(await state.isRegistered('elementId')).to.equal(false)
            })
        })

        describe('getProperties', function(){
            it('must return the properties setted to the id', async function(){
                var property1 = 'property1'
                var property2 = 'property2'
                await state.store({id, property: property1, value, type})
                await state.store({id, property: property2, value, type})
                
                var properties = await state.getProperties({id})

                expect(properties).to.contain(property1)
                expect(properties).to.contain(property2)
            })

            it('must return an empty array when there are no properties setted to the id', async function(){
                var properties = await state.getProperties({id})

                expect(properties).to.be.an('array')
                expect(properties).to.be.empty
            })
        })

        it('must be closable', async function(){
            await state.close()
        })
    })
}
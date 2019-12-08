const {expect} = require('chai')

module.exports = function(){
    describe('as a state', function(){
        let state
        let id, attribute, value, type

        beforeEach(function(){
            state = this.adapter
            id = 'id'
            attribute = 'attribute'
            value = 'value'
            type = 'type'
        })

        describe('load', function(){
            it('must return the value and type of the matching id and attribute', async function(){
                await state.store({id, attribute, value, type})
                var storedData = await state.load({id, attribute})
    
                expect(storedData.value).to.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return the last value and type of the matching id and attribute when they have been stored more than once', async function(){
                await state.store({id, attribute, value: 'oldValue', type: 'oldType'})
                await state.store({id, attribute, value, type})
                var storedData = await state.load({id, attribute})
    
                expect(storedData.value).to.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return the value and type of the matching id and attribute when the value is an array', async function(){
                var value = ['value1', 'value2']
                await state.store({id, attribute, value, type})
                var storedData = await state.load({id, attribute})
    
                expect(storedData.value).to.deep.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return the value and type of the matching id and attribute when there are several entries', async function(){
                await state.store({id: 'otherId', attribute: 'otherAttribute', value: 'otherValue', type: 'otherType'})
                await state.store({id, attribute, value, type})
                await state.store({id: 'otherId2', attribute: 'otherAttribute2', value: 'otherValue2', type: 'otherType2'})
                var storedData = await state.load({id, attribute})
    
                expect(storedData.value).to.equal(value)
                expect(storedData.type).to.equal(type)
            })

            it('must return value and type undefined when no entry is matching the id and the attribute', async function(){
                await state.store({id: 'otherId', attribute: 'otherAttribute', value: 'otherValue', type: 'otherType'})
                await state.store({id: 'otherId2', attribute: 'otherAttribute2', value: 'otherValue2', type: 'otherType2'})
                var storedData = await state.load({id, attribute})
    
                expect(storedData.value).to.be.undefined
                expect(storedData.type).to.be.undefined
            })

            it('must return value and type of the matching id and attribute when there are several pairs of id and attribute that concatenate equally', async function(){
                await state.store({id: 'abc', attribute: 'def', value: 'value1', type: 'type1'})
                await state.store({id: 'abcd', attribute: 'ef', value: 'value2', type: 'type2'})
                var storedData = await state.load({id: 'abc', attribute: 'def'})
    
                expect(storedData.value).to.equal('value1')
                expect(storedData.type).to.equal('type1')
            })

            function createStringWithNCharacters(amount, character){
                return new Array(amount +1).join(character)
            }

            it('must return value and type of the matching id and attribute when there are several pairs of id and attribute that concatenate equally using special characters', async function(){
                for(var i = 0; i< 256; i++){
                    var character = String.fromCharCode(i)
                    var cc = createStringWithNCharacters(2, character)
                    var ccc = createStringWithNCharacters(3, character)
                    await state.store({id: cc, attribute: ccc, value: 'value1', type: 'type1'})
                    await state.store({id: ccc, attribute: cc, value: 'value2', type: 'type2'})
                    var storedData = await state.load({id: cc, attribute: ccc})
        
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

        describe('getAttributes', function(){
            it('must return the attributes setted to the id', async function(){
                var attribute1 = 'attribute1'
                var attribute2 = 'attribute2'
                await state.store({id, attribute: attribute1, value, type})
                await state.store({id, attribute: attribute2, value, type})
                
                var attributes = await state.getAttributes({id})

                expect(attributes).to.contain(attribute1)
                expect(attributes).to.contain(attribute2)
            })

            it('must return an empty array when there are no attributes setted to the id', async function(){
                var attributes = await state.getAttributes({id})

                expect(attributes).to.be.an('array')
                expect(attributes).to.be.empty
            })
        })
    })
}
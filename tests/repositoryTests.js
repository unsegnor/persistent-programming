const {expect} = require('chai')

module.exports = function(){
    describe('Repository Tests', function(){
        let objectRepository
    
        beforeEach(function(){
            objectRepository = this.CreateRepository()
        })

        afterEach(async function(){
            await objectRepository.close()
        })
    
        describe('Object repository', function(){
            describe('getRoot', function(){
                it('must create and return a new root object if the id did not exist', async function(){
                    var root = await objectRepository.getRoot('specific-id')
                    var house = await objectRepository.getNew()
                    await house.set('color', 'blue')
                    await root.add('houses', house)
                })
    
                it('must return the existing root object if the id did exist', async function(){
                    var root = await objectRepository.getRoot('other-specific-id')
                    var house = await objectRepository.getNew()
                    await house.set('color', 'blue')
                    await root.add('houses', house)
    
                    var root2 = await objectRepository.getRoot('other-specific-id')
                    var houses = await root2.get('houses')
                    var house2 = houses[0]
                    var color = await house2.get('color')
    
                    expect(color).to.equal('blue')
                })
    
                it('must return different root objects if the ids are different', async function(){
                    var root = await objectRepository.getRoot('specific-id')
                    var house = await objectRepository.getNew()
                    await house.set('color', 'blue')
                    await root.add('houses', house)
    
                    var root2 = await objectRepository.getRoot('different-specific-id')
                    var houses = await root2.get('houses')
    
                    expect(houses).to.be.undefined
                })
    
                it('the internal id must not match with the root id', async function(){
                    var object = await objectRepository.getNew()
                    await object.set('created', 'yes')
                    var objectId = await object.getId()
    
                    var root = await objectRepository.getRoot(objectId)
    
                    var value = await root.get('created')
                    expect(value).to.be.undefined
                })
    
                it('we must be able to set a different idGenerator', async function(){
                    var idGenerator = {
                        getNew: function(){
                            return '5'
                        }
                    }
                    var otherObjectRepository = this.CreateRepository({idGenerator})
                    var object = await otherObjectRepository.getNew()
                    expect(await object.getId()).to.equal('internal-5')
                    
                    await otherObjectRepository.close()
                })
    
                it('the root id must not collide wih other objects ids', async function(){
                    var idGenerator = {
                        getNew: function(){
                            return '5'
                        }
                    }
                    var otherObjectRepository = this.CreateRepository({idGenerator})
                    var object = await otherObjectRepository.getNew()
                    await object.set('value', 'existing')
    
                    var root = await otherObjectRepository.getRoot(await object.getId())
                    expect(await root.get('value')).to.be.undefined

                    await otherObjectRepository.close()
                })
    
                it('the root id must not collide wih other objects ids even if the id generator generates the same root id', async function(){
                    var idGenerator = {
                        getNew: function(){
                            return 'root-5'
                        }
                    }
                    var otherObjectRepository = this.CreateRepository({idGenerator})
                    var object = await otherObjectRepository.getNew()
                    await object.set('value', 'existing')
    
                    var root = await otherObjectRepository.getRoot('5')
                    expect(await root.get('value')).to.be.undefined

                    await otherObjectRepository.close()
                })
            })
    
            it('must allow to assign and read values', async function(){
                var object = await objectRepository.getNew()
                await object.set('type', 'house')
                await object.set('name', 'my house')
                await object.set('color', 'red')
        
                expect(await object.get('type')).to.equal('house')
                expect(await object.get('name')).to.equal('my house')
                expect(await object.get('color')).to.equal('red')
            })
        
            it('must allow to compose objects with other objects', async function(){
                var house = await objectRepository.getNew()
                var window = await objectRepository.getNew()
                var fly = await objectRepository.getNew()
        
                await house.set('rightWindow', window)
                await fly.set('color', 'yellow')
                await window.set('habitant', fly)
        
                var rWindow = await house.get('rightWindow')
                var rHabitant = await rWindow.get('habitant')
                var rColor = await rHabitant.get('color')
        
                expect(rColor).to.equal('yellow')
            })
        
            it('must auto update the object data when both have the same reference', async function(){
                var task = await objectRepository.getNew()
                var sameTask = await objectRepository.get(await task.getId())
        
                await task.set('duedate', 'fakeDate')
        
                expect(await sameTask.get('duedate')).to.equal('fakeDate')
            })
        
            it('must allow defining a property as an array of primitives', async function(){
                var object = await objectRepository.getNew()
                await object.set('things', ['thingOne', 'thingTwo'])
                var things = await object.get('things')
    
                expect(things).to.contain('thingOne')
                expect(things).to.contain('thingTwo')
            })
    
            it('must allow defining a property as an array of objects', async function(){
                var object = await objectRepository.getNew()
                var thingOne = await objectRepository.getNew()
                var thingTwo = await objectRepository.getNew()
    
                await object.set('things', [thingOne, thingTwo])
                var things = await object.get('things')
    
                expect(await things[0].getId()).to.equal(await thingOne.getId())
                expect(await things[1].getId()).to.equal(await thingTwo.getId())
            })
    
            it('must allow adding primitives to a property', async function(){
                var house = await objectRepository.getNew()
                await house.set('names', 'my house')
                await house.add('names', 'your house')
    
                var names = await house.get('names')
    
                expect(names).to.contain('my house')
                expect(names).to.contain('your house')
            })
    
            it('must allow adding lists of primitives to a property', async function(){
                var house = await objectRepository.getNew()
                await house.set('names', 'my house')
                await house.add('names', ['your house', 'their house'])
    
                var names = await house.get('names')
    
                expect(names).to.contain('my house')
                expect(names).to.contain('your house')
                expect(names).to.contain('their house')
            })
    
            it('must allow adding objects to a property', async function(){
                var house = await objectRepository.getNew()
                var bathroom = await objectRepository.getNew()
                await bathroom.set('name', 'bath')
                var bedroom = await objectRepository.getNew()
                await bedroom.set('name', 'bedroom')
    
                await house.add('rooms', bathroom)
                await house.add('rooms', bedroom)
    
                var rooms = await house.get('rooms')
    
                expect(await rooms[0].get('name')).to.equal('bath')
                expect(await rooms[1].get('name')).to.equal('bedroom')
            })
    
            it('must allow adding lists of objects to a property', async function(){
                var house = await objectRepository.getNew()
                var bathroom = await objectRepository.getNew()
                var bedroom = await objectRepository.getNew()
                var kitchen = await objectRepository.getNew()
                await bathroom.set('name', 'bath')
                await bedroom.set('name', 'bedroom')
                await kitchen.set('name', 'kitchen')
    
                await house.add('rooms', bathroom)
                await house.add('rooms', [bedroom, kitchen])
    
                var rooms = await house.get('rooms')
    
                expect(await rooms[0].get('name')).to.equal('bath')
                expect(await rooms[1].get('name')).to.equal('bedroom')
                expect(await rooms[2].get('name')).to.equal('kitchen')
            })
    
            it('must allow listing all the properties of an object', async function(){
                var house = await objectRepository.getNew()
                await house.set('address', 'whatever street')
                await house.set('color', 'red')
                var bedroom = await objectRepository.getNew()
                await house.add('rooms', bedroom)
    
                var properties = await house.getProperties()
    
                expect(properties).to.contain('address')
                expect(properties).to.contain('color')
                expect(properties).to.contain('rooms')
            })
        })
    })
}

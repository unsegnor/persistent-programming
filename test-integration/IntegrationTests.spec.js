const {expect} = require('chai')
const ObjectRepository = require('../adapters/InMemoryObjectRepository')

describe('Integration tests', function(){
    let objectRepository

    beforeEach(function(){
        objectRepository = ObjectRepository()
    })

    describe('Object repository', function(){
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

            expect(things[0].id).to.equal(thingOne.id)
            expect(things[1].id).to.equal(thingTwo.id)
        })
    })
})
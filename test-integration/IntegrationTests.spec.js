const {expect} = require('chai')
const {TestRepository} = require('../index')

describe('Integration tests', function(){
    let objectRepository

    beforeEach(function(){
        objectRepository = TestRepository()
    })

    describe('Object repository', function(){
        it('must allow creating an object with specific id', async function(){
            var object = await objectRepository.getNew('specific-id')
            //qué pinta tiene el id que tenemos que utilizar?
            //porque los ids ahora mismo los están generando el propio repository
            //tenemos que poder generar objetos con un id específico
            //podemos marcar esos objetos de modo que nunca coincidan
            //por ejemplo con un prefijo: custom-<id>
            //después cuando haga get por id tendría que poder ponerlo sin conocer ese sufijo
            //quizá necesitemos un nuevo tipo de nodo, un nodo raíz
            //el objetivo es que al reiniciar, la aplicación pueda volver a referenciar al nodo raíz
            //application-id: aildfhoq84n48rfhru78n2ourfhr72o3urfheu2o8rfh2o8...(2048 caracteres)
            //ese id es el que nos permite volver a cargar la aplicación
            //cómo hacemos para compaginar los dos tipos de ids??
            //quizá es que no necesitamos el id interno para nada
            //eso sólo lo utiliza el propio state para enlazar sus elementos

            //entonces si generamos un nuevo objeto con id definido
            

            //necesitamos poder generar objetos a partir de un identificador
            //de modo que no colisione con el resto de objetos
            //podemos usar un prefijo y luego si pedimos un objeto propio con el identificador otra vez
            //entonces volvermos a añadir el prefijo
            //y si pedimos un objeto por id normal
            //entonces no añadimos el prefijo, es decir, que necesitamos otro método para obtener objeto
            //o que el método que tenemos para obtener objetos por id se el custom
            //y hacemos un test para comprobar que nunca van a colisionar con los objetos creados internamente
            


            //se podrá tener un id único en el mundo por cada objeto??
            //de forma que se pudieran compartir objetos específicos
    
            expect(await object.get('type')).to.equal('house')
            expect(await object.get('name')).to.equal('my house')
            expect(await object.get('color')).to.equal('red')
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
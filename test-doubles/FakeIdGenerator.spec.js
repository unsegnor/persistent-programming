const {expect} = require('chai')
const FakeIdGenerator = require('./FakeIdGenerator')

describe('FakeIdGenerator', function(){
    describe('getNew', function(){
        it('must return the fake id setted', async function(){
            var generator = FakeIdGenerator()
            generator.setFakeId('fakeId')

            var result = await generator.getNew()

            expect(result).to.equal('fakeId')
        })
    })
})
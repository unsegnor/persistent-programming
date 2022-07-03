const repositoryTests = require('../tests/repositoryTests.js')
const {TestRepository} = require('../index')

describe('TestRepository', function(){
    beforeEach(function(){
        this.CreateRepository = function(args){
            return TestRepository(args)
        }
    })

    repositoryTests()

})
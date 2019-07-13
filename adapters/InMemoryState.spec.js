const {expect} = require('chai')
const InMemoryState = require('./InMemoryState')
const StatePortTests = require('../domain/State.port')

describe('InMemoryState', function(){
    beforeEach(function(){
        this.adapter = InMemoryState()
    })

    StatePortTests()
})
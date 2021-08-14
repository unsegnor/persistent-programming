module.exports = {
  packageManager: "npm",
  reporters: ["clear-text", "progress"],
  testRunner: "mocha",
  coverageAnalysis: "perTest",
  mochaOptions:{
    spec: ['domain/*.spec.js']
  },
  mutate: ['domain/*.js',
    '!domain/*.spec.js',
    '!domain/*.port.js',
    '!domain/*.factory.js'],
  maxConcurrentTestRunners: 2
}

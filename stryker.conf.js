module.exports = function(config) {
  config.set({
    mutator: "javascript",
    packageManager: "npm",
    reporters: ["clear-text", "progress"],
    testRunner: "mocha",
    transpilers: [],
    testFramework: "mocha",
    coverageAnalysis: "perTest",
    mochaOptions:{
      spec: ['domain/*.spec.js']
    },
    mutate: ['domain/*.js',
      '!domain/*.spec.js',
      '!domain/*.port.js',
      '!domain/*.factory.js'],
    maxConcurrentTestRunners: 2
  });
};

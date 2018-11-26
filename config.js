// Object contains all the environments
var environments = {};

// Staging environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
}

// Production environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
}

// Get the current environment from the terminal
var environmentString = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';

// Get the appropriate environment object
var environmentObject = typeof (environments[environmentString]) == 'object' ?
    environments[environmentString] : environments.staging;

// Export the choosen environment
module.exports = environmentObject;
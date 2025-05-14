module.exports = {
    nodeClasses: {
      aitable: require('./dist/nodes/Aitable/Aitable.node').Aitable,
    },
    credentialClasses: {
      aitableApi: require('./dist/credentials/AitableApi.credentials').AitableApi,
    },
  };

// Nouvelle version (solution)
module.exports = require('./dist/nodes/Aitable/Aitable.node');
module.exports = {
    nodeClasses: {
      aitable: require('./dist/nodes/Aitable/Aitable.node').Aitable,
    },
    credentialClasses: {
      aitableApi: require('./dist/credentials/AitableApi.credentials').AitableApi,
    },
  };
module.exports = {
    nodeClasses: {
      Aitable: require('./dist/nodes/Aitable/Aitable.node').Aitable,
    },
    credentialClasses: {
      AitableApi: require('./dist/credentials/AitableApi.credentials').AitableApi,
    },
  };
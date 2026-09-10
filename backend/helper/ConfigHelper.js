const MainConfig = require('../ModelConfigs/mainConfig');
const MainConfigObj = new MainConfig();

class ConfigHelper {}

ConfigHelper.getModelConfig = function (ObjectName) {
  var Temp = MainConfigObj.ModelConfigs.filter((s) => s.ObjectName === ObjectName);
  if (Temp.length === 1) return Temp[0];
  else return null;
};

module.exports = ConfigHelper;

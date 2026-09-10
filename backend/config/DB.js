const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('./DbConnection');

const DB = {
  Sequelize: Sequelize,
  Op: Sequelize.Op,
  sequelize: sequelize,
  Models: {},
  execProcedure: (spName, params) => {},
};
const models = [];

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files_);
    } else {
      files_.push(fullPath);
    }
  }
  return files_;
}

try {
  const modelDir = path.join(__dirname, '../model');

  getFiles(modelDir).forEach(function (filename) {
    models.push(require(filename));
  });

  models.forEach((model) => {
    DB.Models[model.name] = model;
  });

  Object.keys(DB.Models).forEach((model) => {
    if (DB.Models[model].SetAssocations) {
      DB.Models[model].SetAssocations(DB.Models);
    }
    if (DB.Models[model].SetFunctions) {
      DB.Models[model].SetFunctions(DB.Models);
    }
  });

  const execProcedure = (spName, params) => {
    const strParams = [];
    Object.keys(params).forEach((p) => {
      if (params[p] !== undefined) strParams.push(`@${p}=:${p}`);
    });
    return sequelize.query(`EXEC ${spName} ${strParams.join(',')}`, {
      replacements: params,
    });
  };

  DB.execProcedure = execProcedure;
  DB.sequelize = sequelize;
  DB.Op = Sequelize.Op;
} catch (ex) {
  console.error('Failed to initialize database models:', ex);
  throw ex;
}

module.exports = DB;

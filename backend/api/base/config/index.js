const path = require('path');
const {
  validation: { baseValidate },
  baseHelper: { getFiles },
} = require('batuna-utils-back');

const targets = {};

getFiles(__dirname)
  .filter((filePath) => {
    const file = path.basename(filePath);
    return file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const config = require(file);
    targets[config.target ? config.target : config.model.name] = config;
  });

module.exports.targets = targets;

module.exports.validate = (action) => (req, res, next) => {
  const target = req.params.target;
  if (target && targets[target]) {
    if (targets[target].validation && targets[target].validation[action]) {
      return baseValidate(targets[target].validation[action])(req, res, next);
    }
    return next();
  }
  return next();
};

module.exports.middleware = (action) => (req, res, next) => {
  const target = req.params.target;
  if (target && targets[target]) {
    if (targets[target].middleware && targets[target].middleware[action]) {
      return targets[target].middleware[action](req, res, next);
    }
    return res.status(200).json({
      success: false,
      message: 'Идвэхигүй үйлдэл',
    });
  }
  return next();
};

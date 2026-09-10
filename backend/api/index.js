const Router = require('express').Router();
Router.use('/report', require('./report'));
Router.use('/base', require('./base'));

module.exports = Router;

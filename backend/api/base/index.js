const express = require('express');
const { list, show, create, update, lookup, destroy } = require('./controller');
const { middleware } = require('batuna-utils-back');
///const onSaving = require("../../middleware/onSaving");

// const {
//   canCreate,
//   canDestroy,
//   canShow,
//   canUpdate,
// } = require("../../middleware/permission");

const config = require('./config/index');

const router = express.Router();

// router
//   .route("/:target/import-excel-data")
//   .post(config.middleware("importExcelData"), importExcelData);

router.route('/:target/lookup').get(middleware.list, config.middleware('lookup'), lookup);

router
  .route('/:target/:id')
  .get(config.middleware('show'), middleware.show, show)
  .put(
    config.validate('update'),
    //onSaving.onUpdating,
    config.middleware('update'),
    update
  )
  .delete(config.validate('destroy'), config.middleware('destroy'), destroy);

router.route('/:target').get(middleware.list, config.middleware('list'), list).post(
  config.validate('create'),
  //onSaving.onCreating,
  config.middleware('create'),
  create
);

module.exports = router;

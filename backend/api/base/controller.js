const config = require('./config');
const { sequelize } = require('../../config/DB');
const { getList, getLookup, create, destroy, getOne, update } = require('../../services/base');
const BaseHelper = require('../../services/base');

exports.list = async (req, res) => {
  const { target } = req.params;
  const { limit, offset, select, sort, filter, summary } = req;
  const model = config.targets[target] ? config.targets[target].model : null;
  const result = { success: true, message: '', data: null };
  if (!model) {
    return res.status(200).json({ success: false, message: 'TableName алдаатай байна' });
  }

  try {
    const resGetList = await getList({
      model,
      options: { limit, offset, select, sort, filter, summary },
    });
    if (!resGetList.success) {
      return res.status(200).json(resGetList);
    }

    result.data = resGetList.data;

    return res.status(200).json(result);
  } catch (ex) {
    console.error(ex);
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

exports.lookup = async (req, res) => {
  const { target } = req.params;
  const { limit, offset, select, sort, filter } = req;
  const model = config.targets[target] ? config.targets[target].model : null;
  const result = { success: true, message: '', data: null };
  if (!model) {
    return res.status(200).json({ success: false, message: 'TableName алдаатай байна' });
  }

  try {
    const resGetLkp = await getLookup({
      model,
      options: { limit, offset, select, sort, filter },
    });
    if (!resGetLkp.success) {
      return res.status(200).json(resGetLkp);
    }

    result.data = resGetLkp.data;

    return res.status(200).json(result);
  } catch (ex) {
    console.error(ex);
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

exports.show = async (req, res) => {
  const { target, id } = req.params;
  const { select } = req;
  const model = config.targets[target] ? config.targets[target].model : null;
  const result = { success: true, message: '', data: null };
  try {
    const resGetOne = await getOne({
      id,
      model,
      options: { select },
    });

    if (!resGetOne.success) {
      return res.status(200).json(resGetOne);
    }

    result.data = resGetOne.data;
    return res.status(200).json(result);
  } catch (ex) {
    console.error(ex);
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

exports.create = async (req, res) => {
  const body = req.body;
  const { target } = req.params;
  const result = { success: true, message: '', data: null };

  const model = config.targets[target] ? config.targets[target].model : null;
  const transaction = await sequelize.transaction();
  try {
    const resCreate = await create({
      model,
      data: body,
      transaction,
    });

    if (!resCreate.success) {
      await transaction.rollback();
      return res.status(200).json(resCreate);
    }

    result.data = resCreate.data;

    if (req.onCreated) {
      await req.onCreated(result.data);
    }

    await transaction.commit();
    return res.status(200).json(result);
  } catch (ex) {
    await transaction.rollback();
    console.error(ex);
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

exports.update = async (req, res) => {
  const body = req.body;
  const id = req.params.id;
  const { target } = req.params;
  const result = { success: true, message: '', data: null };
  const transaction = await sequelize.transaction();
  const model = config.targets[target] ? config.targets[target].model : null;

  try {
    const resUpdate = await update({
      id,
      model,
      data: body,
      transaction,
    });

    if (!resUpdate.success) {
      await transaction.rollback();
      return res.status(200).json(resUpdate);
    }

    result.data = resUpdate.data;

    if (req.onUpdated) {
      await req.onUpdated(result.data);
    }
    await transaction.commit();
    return res.status(200).json(result);
  } catch (ex) {
    console.error(ex);
    await transaction.rollback();
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

exports.destroy = async (req, res) => {
  const id = req.params.id;
  const { target } = req.params;
  const user = req.user;
  const result = { success: true, message: '', data: null };
  const transaction = await sequelize.transaction();
  const model = config.targets[target] ? config.targets[target].model : null;

  try {
    const resDelete = await destroy({
      id,
      model,
      transaction,
      userId: user.id,
    });

    if (!resDelete.success) {
      await transaction.rollback();
      return res.status(200).json(resDelete);
    }

    result.data = resDelete.data;

    if (req.onDeleted) {
      await req.onDeleted(result.data);
    }
    await transaction.commit();
    return res.status(200).json(result);
  } catch (ex) {
    await transaction.rollback();
    console.error(ex);
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

exports.importExcelData = async (req, res) => {
  const data = req.body;
  const { target } = req.params;
  const user = req.user;
  const result = { success: true, message: 'Амжилттай', data: null };
  const model = config.targets[target] ? config.targets[target].model : null;
  const transaction = await sequelize.transaction();
  try {
    const resImportExcel = await BaseHelper.importExcelData({
      data,
      model,
      transaction,
      onSaving: req.onSaving,
      userId: user.id,
    });
    if (!resImportExcel.success) {
      await transaction.rollback();
      return res.status(200).json(resImportExcel);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};

const {
  queryBuilder: { getSelect, getSelectSummary, getFilter, getSort },
  excelImport: { getDataByExcelLoadedData },
} = require('batuna-utils-back');

const { Sequelize } = require('../../config/DB');
const { format } = require('date-fns');

const checkIsDeleteField = (model) => {
  // const fields = model.getAttributes();
  // return Object.keys(fields).includes("isDelete");
  return false;
};

exports.getList = async ({ model, options, transaction }) => {
  const result = { success: true, message: '', data: null };
  let { limit, offset, select, sort, filter, summary } = options;

  try {
    if (!model) {
      return { success: false, message: 'TableName алдаатай байна' };
    }

    const modelSelect = {};
    getSelect(select, model, modelSelect);

    const where = [];

    if (checkIsDeleteField(model)) {
      filter = filter
        ? [[['isDelete', '=', false], 'or', ['isDelete', '=', null]], 'and', filter]
        : [['isDelete', '=', false], 'or', ['isDelete', '=', null]];
    }

    if (filter) {
      getFilter(where, filter);
    }

    let order = null;
    if (sort) {
      order = getSort(sort);
    }

    const { rows, count } = await model.findAndCountAll({
      ...modelSelect,
      limit,
      offset,
      where,
      //order: [[Sequelize.col("id_data"), "desc"]],
      order: order ? order : [''],
      transaction,
      // logging: (q) => console.log(q),
    });

    const summaryData = [];
    if (summary && Array.isArray(summary)) {
      const summarySelect = {};
      getSelectSummary(select, model, summarySelect);

      const attributes = [];
      for (let i = 0; i < summary.length; i++) {
        attributes.push([
          Sequelize.fn(summary[i][1], Sequelize.col(summary[i][0])),
          summary[i][2] ? summary[i][2] : summary[i][0],
        ]);
      }

      const summarys = await model.findAll({
        ...summarySelect,
        attributes: attributes,
        where,
        transaction,
        //  logging: (q) => console.log(q),
        raw: true,
      });
      if (summarys.length === 1) {
        Object.keys(summarys[0]).map((key) => {
          summaryData.push(summarys[0][key]);
        });
      }
    }

    result.data = { rows, count, summary: summaryData };
    return result;
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'Жагсаалт татах явцад алдаа гарлаа',
      data: null,
    };
  }
};

exports.getLookup = async ({ model, transaction, options }) => {
  const result = { success: true, message: '', data: {} };
  let { limit, offset, select, sort, filter } = options;
  if (!model) {
    return { success: false, message: 'TableName алдаатай байна' };
  }
  try {
    const modelSelect = {};
    getSelect(select, model, modelSelect);

    const where = [];

    if (checkIsDeleteField(model)) {
      filter = filter
        ? [[['isDelete', '=', false], 'or', ['isDelete', '=', null]], 'and', filter]
        : [['isDelete', '=', false], 'or', ['isDelete', '=', null]];
    }

    if (filter) {
      getFilter(where, filter);
    }

    let order = null;
    if (sort) {
      order = getSort(sort);
    }

    const { rows, count } = await model.findAndCountAll({
      ...modelSelect,
      limit,
      offset,
      where,
      order: order ? order : [],
      transaction,
      // logging: (q) => console.log(q),
    });

    result.data = { rows, count };

    return result;
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'Дата татах явцад алдаа гарлаа',
      data: null,
    };
  }
};

exports.getOne = async ({ model, transaction, id, options }) => {
  const result = { success: true, message: '', data: null };
  const { select } = options;

  if (!model) {
    return { success: false, message: 'TableName алдаатай байна' };
  }
  try {
    const modelSelect = {};
    getSelect(select, model, modelSelect);

    const data = await model.findOne({
      ...modelSelect,
      where: { [model.primaryKeyAttribute]: id },
      transaction,
    });

    result.data = data;
    return result;
  } catch (ex) {
    console.error(ex);
    return { success: false, message: 'Дата татах явцад алдаа гарлаа' };
  }
};

exports.create = async ({ model, transaction, data }) => {
  const result = { success: true, message: 'Амжилттай', data: null };
  if (!model) {
    return { success: false, message: 'TableName алдаатай байна' };
  }

  try {
    const createdData = await model.create(data, { transaction });
    // if (model.saveLog !== false) {
    //   await saveLog({
    //     userId: req.user ? req.user.id : null,
    //     action: "create",
    //     modifyData: JSON.stringify(body),
    //     newData: JSON.stringify(data),
    //     objectName: model.tableName,
    //     objectId: data[model.primaryKeyAttributes],
    //     moduleName: model.logModule,
    //   });
    // }

    result.data = createdData;
    return result;
  } catch (ex) {
    console.error(ex);
    return { success: false, message: 'Мэдээлэл үүсгэх явцад алдаа гарлаа' };
  }
};

exports.update = async ({ id, transaction, model, data }) => {
  const result = { success: true, message: 'Амжилттай', data: null };
  if (!model) {
    return { success: false, message: 'TableName алдаатай байна' };
  }
  try {
    const oldData = await model.findByPk(id, { transaction });
    const oldDataJSON = JSON.stringify(oldData);
    await oldData.update(data, { transaction });
    // if (model.saveLog !== false) {
    //   await saveLog({
    //     userId: req.user ? req.user.id : null,
    //     action: "update",
    //     oldData: oldDataJSON,
    //     modifyData: JSON.stringify(body),
    //     newData: JSON.stringify(data),
    //     objectName: model.tableName,
    //     objectId: id,
    //     moduleName: model.logModule,
    //   });
    // }
    result.data = oldData;
    return result;
  } catch (ex) {
    console.error(ex);
    return { success: false, message: 'Мэдээлэл засах явцад алдаа гарлаа' };
  }
};

exports.destroy = async ({ id, transaction, model, onDeleting, userId }) => {
  const result = { success: true, message: 'Амжилттай', data: null };

  if (!model) {
    return { success: false, message: 'TableName алдаатай байна' };
  }
  try {
    const data = await model.findOne({
      where: { [model.primaryKeyAttribute]: id },
      transaction,
    });
    const oldData = JSON.stringify(data);
    if (data) {
      if (onDeleting) {
        await onDeleting(data);
      }

      const nowDate = new Date();

      if (checkIsDeleteField(model)) {
        data.isDelete = true;
        data.deleteDate = format(nowDate, 'yyyy-MM-dd HH:mm:ss');
        data.deleteUserId = userId;
        await data.save({ transaction });
      } else {
        await data.destroy({ transaction });
      }

      //   if (model.saveLog !== false) {
      //     await saveLog({
      //       userId: user ? user.id : null,
      //       action: "destroy",
      //       oldData: oldData,
      //       objectName: model.tableName,
      //       objectId: data[model.primaryKeyAttributes],
      //       moduleName: model.logModule,
      //     });
      //   }
    } else {
      return { success: false, message: 'Устгах мэлээлэл олдсонгүй' };
    }
    return result;
  } catch (ex) {
    console.error(ex);
    return { success: false, message: 'Мэдээлэл устгах явцад алдаа гарлаа' };
  }
};

// exports.bulkCreate = async (req, res) => {
//   const body = req.body;
//   const { target } = req.params;

//   const model = config.targets[target] ? config.targets[target].model : null;
//   if (!model) {
//     return res
//       .status(200)
//       .json({ success: false, message: "TableName алдаатай байна" });
//   }
//   try {
//     const data = await model.bulkCreate(body);
//     return res.status(200).json({
//       message: "Амжилттай",
//       success: true,
//       data: data,
//     });
//   } catch (ex) {
//     console.log(ex);
//     return res
//       .status(200)
//       .json({ success: false, message: "Сервер дээр алдаа гарлаа" });
//   }
// };

exports.importExcelData = async ({ userId, transaction, data, model, onSaving }) => {
  const result = { success: true, message: 'Амжилттай', data: null };

  if (!model) {
    return { success: false, message: 'TableName алдаатай байна' };
  }
  try {
    const resGetData = await getDataByExcelLoadedData({
      data,
      model,
      transaction,
    });
    if (!resGetData.success) {
      return { success: false, message: result.message };
    }
    const rows = resGetData.data;
    if (onSaving) {
      await onSaving(rows);
    }

    await model.bulkCreate(rows);

    return result;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Excel-ээс мэдээлэл оруулах явцад алдаа гарлаа',
    };
  }
};

// exports.initNewRow = async (req, res) => {
//   try {
//     return res.status(200).json({
//       message: "",
//       success: true,
//       data: {},
//     });
//   } catch (ex) {
//     console.log(ex);
//     return res
//       .status(200)
//       .json({ success: false, message: "Сервер дээр алдаа гарлаа" });
//   }
// };

// exports.print = async (req, res) => {
//   try {
//     return res.status(200).json({
//       message: "",
//       success: true,
//       data: {},
//     });
//   } catch (ex) {
//     console.log(ex);
//     return res
//       .status(200)
//       .json({ success: false, message: "Сервер дээр алдаа гарлаа" });
//   }
// };

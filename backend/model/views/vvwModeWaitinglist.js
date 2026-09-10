const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vvwModeWaitinglist extends Sequelize.Model {}

vvwModeWaitinglist.init(
  {
    id_dico: { type: Sequelize.INTEGER, primaryKey: true },
    dico: { type: Sequelize.STRING },
    label: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING },
    pos: { type: Sequelize.INTEGER },
    translate_flag: { type: Sequelize.SMALLINT },
  },
  {
    sequelize,
    tableName: 'vvwModeWaitinglist',
    modelName: 'vvwModeWaitinglist',
    timestamps: false,
  }
);

module.exports = vvwModeWaitinglist;

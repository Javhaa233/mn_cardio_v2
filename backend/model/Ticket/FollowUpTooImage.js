const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class FollowUpTooImage extends Sequelize.Model {}
FollowUpTooImage.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    FollowUpId: { type: Sequelize.INTEGER },
    ImageId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'FollowUpTooImage',
    modelName: 'FollowUpTooImage',
    timestamps: false,
  }
);
FollowUpTooImage.SearchField = ['id', 'FollowUpId', 'ImageId', 'ChildRecStatus'];

module.exports = FollowUpTooImage;

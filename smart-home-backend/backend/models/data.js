const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Data = sequelize.define('Data', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    deviceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Data.associate = (models) => {
    Data.belongsTo(models.Devices, {
      foreignKey: 'deviceID',
      as: 'device',
    });
  };

  return Data;
};

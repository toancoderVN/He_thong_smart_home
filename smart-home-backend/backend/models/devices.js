const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Devices = sequelize.define('Devices', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    roomID: {
      type: DataTypes.INTEGER,
    },
    esp32IP: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  });

  Devices.associate = (models) => {
    Devices.belongsTo(models.Rooms, {
      foreignKey: 'roomID',
      as: 'room',
      onDelete: 'CASCADE',
    });
    Devices.hasMany(models.Data, {
      foreignKey: 'deviceID',
      as: 'data',
    });
  };

  return Devices;
};

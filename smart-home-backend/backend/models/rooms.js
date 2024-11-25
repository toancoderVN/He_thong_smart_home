const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rooms = sequelize.define('Rooms', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numberDevices: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Rooms.associate = (models) => {
    Rooms.belongsTo(models.Users, {
      foreignKey: 'userID',
      as: 'user',
      onDelete: 'CASCADE',
    });
    Rooms.hasMany(models.Devices, {
      foreignKey: 'roomID',
      as: 'devices',
    });
  };

  return Rooms;
};

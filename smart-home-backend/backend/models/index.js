const { Sequelize } = require('sequelize');
const DataModel = require('./data');
const DevicesModel = require('./devices');
const RoomsModel = require('./rooms');
const SensorDataModel = require('./sensor_data');
const UsersModel = require('./users');

const sequelize = new Sequelize('led_logs', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

const models = {
  Data: DataModel(sequelize),
  Devices: DevicesModel(sequelize),
  Rooms: RoomsModel(sequelize),
  SensorData: SensorDataModel(sequelize),
  Users: UsersModel(sequelize),
};

// Thiết lập mối quan hệ giữa các model
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

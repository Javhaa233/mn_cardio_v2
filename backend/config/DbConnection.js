const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.SQL_DB,
  process.env.SQL_USER,
  process.env.SQL_PASSWORD,
  {
    dialect: 'mssql',
    dialectModule: require('tedious'), // ensure tedious is used
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Only log in development
    pool: { max: 20, min: 2, acquire: 60000, idle: 30000 },
    dialectOptions: {
      options: {
        encrypt: false, // set true if using Azure
        trustServerCertificate: true, // required for self-signed certs
        requestTimeout: 300000,
      },
      server: process.env.SQL_HOST, // <--- this is now explicitly the server
    },
  }
);

module.exports = sequelize;

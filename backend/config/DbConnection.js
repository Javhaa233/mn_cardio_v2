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
    /*
     * Sequelize's mssql dialect takes the server from the TOP-LEVEL `host`
     * option. The `dialectOptions.server` below is ignored — it has never had
     * any effect, and the app has always dialled localhost. That went unnoticed
     * because on every deployment so far SQL Server has been on the same box.
     *
     * SQL_HOST is deliberately NOT used here. On the production host SQL_HOST
     * holds a public NAT address that the box cannot reach from inside (its own
     * private address is on a different subnet), so honouring it would break
     * the live system. SQL_SERVER is a separate, optional override: unset, the
     * behaviour is exactly what it has always been.
     */
    host: process.env.SQL_SERVER || 'localhost',
    port: Number(process.env.SQL_PORT) || 1433,
    dialectOptions: {
      options: {
        /*
         * Off by default, which is what every existing deployment expects and
         * is harmless when the database is on localhost.
         *
         * Set SQL_ENCRYPT=true whenever the database is reached over a network
         * — without it, credentials and patient data cross the wire in clear
         * text. trustServerCertificate below accepts SQL Server's self-signed
         * certificate, so no certificate has to be installed to get transport
         * encryption.
         */
        encrypt: process.env.SQL_ENCRYPT === 'true',
        trustServerCertificate: true, // required for self-signed certs
        requestTimeout: 300000,
      },
    },
  }
);

module.exports = sequelize;

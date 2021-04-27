if (typeof PhusionPassenger != "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) throw err;

  const app = require("./app");
  if (typeof PhusionPassenger != "undefined") {
    app.listen("passenger");
  } else {
    app.listen(process.env.PORT);
  }
});

module.exports = connection;

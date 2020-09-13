const knex = require("knex");
const environment = process.env.NODE_ENV || "development";
const configuration = require("../knexfile")[environment];

const db = knex(configuration);

module.exports = {
  db: db,
};

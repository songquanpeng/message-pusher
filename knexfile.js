module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./data.db",
    },
  },

  staging: {
    client: "sqlite3",
    connection: {
      filename: "./data.db",
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: "./data.db",
    },
  },
};

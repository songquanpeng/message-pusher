exports.up = function (knex) {
  return knex.schema.createTable("messages", (tableBuilder) => {
    tableBuilder.uuid("id").primary();
    tableBuilder.string("title");
    tableBuilder.string("status");
    tableBuilder.string("created_by");
    tableBuilder.string("created_time");
    tableBuilder.string("description");
    tableBuilder.text("content");
  });
};

exports.down = function (knex) {};

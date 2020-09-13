const db = require("../utils/database").db;
const { v4: uuid } = require("uuid");

class Message {
  create(message) {
    message.id = uuid();
    return db("messages").insert(message);
  }

  getById(id) {
    return db("messages").where("id", id);
  }

  deleteById(id) {
    return db("messages").where("id", id).del();
  }
}

module.exports.Message = new Message();

const User = require('./user');
const Message = require('./message');
const sequelize = require('../common/database');

Message.belongsTo(User);

(async () => {
  await sequelize.sync();
  console.log('Database initialized.');
  const isNoAdminExisted =
    (await User.findOne({ where: { isAdmin: true } })) === null;
  if (isNoAdminExisted) {
    console.log('No admin user existed! Creating one for you.');
    await User.create({
      username: 'admin',
      password: '123456',
      isAdmin: true,
      prefix: 'admin',
    });
  }
})();

exports.User = User;
exports.Message = Message;

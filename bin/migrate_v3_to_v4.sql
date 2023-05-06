-- 未测试，仅供参考

-- 插入 email 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'email', id, 'email', '', 1, '', '', '', '', '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE email IS NOT NULL;

-- 插入 test 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'test', id, 'test', '', 1, wechat_test_account_secret, wechat_test_account_id, wechat_test_account_open_id, '', wechat_test_account_template_id, UNIX_TIMESTAMP()
FROM old_database.users
WHERE wechat_test_account_id IS NOT NULL;

-- 插入 corp_app 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'corp_app', id, 'corp_app', '', 1, wechat_corp_account_agent_secret, CONCAT(wechat_corp_account_id, '|', wechat_corp_account_agent_id), wechat_corp_account_user_id, '', wechat_corp_account_client_type, UNIX_TIMESTAMP()
FROM old_database.users
WHERE wechat_corp_account_id IS NOT NULL;

-- 插入 lark 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'lark', id, 'lark', '', 1, lark_webhook_secret, '', '', lark_webhook_url, '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE lark_webhook_url IS NOT NULL;

-- 插入 ding 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'ding', id, 'ding', '', 1, ding_webhook_secret, '', '', ding_webhook_url, '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE ding_webhook_url IS NOT NULL;

-- 插入 corp 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'corp', id, 'corp', '', 1, '', '', '', corp_webhook_url, '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE corp_webhook_url IS NOT NULL;

-- 插入 bark 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'bark', id, 'bark', '', 1, bark_secret, '', '', bark_server, '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE bark_server IS NOT NULL;

-- 插入 telegram 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'telegram', id, 'telegram', '', 1, telegram_bot_token, '', telegram_chat_id, '', '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE telegram_bot_token IS NOT NULL;

-- 插入 discord 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'discord', id, 'discord', '', 1, '', '', '', discord_webhook_url, '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE discord_webhook_url IS NOT NULL;

-- 插入 client 通道数据
INSERT INTO channels (type, user_id, name, description, status, secret, app_id, account_id, url, other, created_time)
SELECT 'client', id, 'client', '', 1, client_secret, '', '', '', '', UNIX_TIMESTAMP()
FROM old_database.users
WHERE client_secret IS NOT NULL;


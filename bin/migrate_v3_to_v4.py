#!/usr/bin/env python3

import argparse
import sqlite3
import time


def get_timestamp():
    return int(time.time())


def main(args):
    old_conn = sqlite3.connect(args.v3_db_path)
    old_cursor = old_conn.cursor()
    new_conn = sqlite3.connect(args.v4_db_path)
    new_cursor = new_conn.cursor()
    new_cursor.execute("DELETE FROM users")
    res = old_cursor.execute("SELECT * FROM users")
    users = res.fetchall()
    for id, username, password, display_name, role, status, token, email, github_id, wechat_id, channel, wechat_test_account_id, wechat_test_account_secret, wechat_test_account_template_id, wechat_test_account_open_id, wechat_test_account_verification_token, wechat_corp_account_id, wechat_corp_account_agent_secret, wechat_corp_account_agent_id, wechat_corp_account_user_id, wechat_corp_account_client_type, corp_webhook_url, lark_webhook_url, lark_webhook_secret, ding_webhook_url, ding_webhook_secret, bark_server, bark_secret, client_secret, telegram_bot_token, telegram_chat_id, discord_webhook_url, send_email_to_others, save_message_to_database in users:
        new_cursor.execute(
            "INSERT INTO users (id,username,password,display_name,role,status,token,email,github_id,wechat_id,channel,"
            "send_email_to_others,save_message_to_database) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (id, username, password, display_name, role, status, token, email, github_id, wechat_id, channel,
             send_email_to_others, save_message_to_database))
        if email:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('email', id, 'email', '', 1, '', '', '', '', '', get_timestamp()))
        if wechat_test_account_id:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('test', id, 'test', '', 1, wechat_test_account_secret, wechat_test_account_id,
                 wechat_test_account_open_id, '', wechat_test_account_template_id, get_timestamp()))
        if wechat_corp_account_id:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('corp_app', id, 'corp_app', '', 1, wechat_corp_account_agent_secret,
                 f"{wechat_corp_account_id}|{wechat_corp_account_agent_id}",
                 wechat_corp_account_user_id, '', wechat_corp_account_client_type, get_timestamp()))
        if lark_webhook_url:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('lark', id, 'lark', '', 1, lark_webhook_secret, '', '', lark_webhook_url, '', get_timestamp()))
        if ding_webhook_url:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('ding', id, 'ding', '', 1, ding_webhook_secret, '', '', ding_webhook_url, '', get_timestamp()))
        if corp_webhook_url:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('corp', id, 'corp', '', 1, '', '', '', corp_webhook_url, '', get_timestamp()))
        if bark_server:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('bark', id, 'bark', '', 1, bark_secret, '', '', bark_server, '', get_timestamp()))
        if telegram_bot_token:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('telegram', id, 'telegram', '', 1, telegram_bot_token, '', telegram_chat_id, '', '', get_timestamp()))
        if discord_webhook_url:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('discord', id, 'discord', '', 1, '', '', '', discord_webhook_url, '', get_timestamp()))
        if client_secret:
            new_cursor.execute(
                "INSERT INTO channels "
                "(type,user_id,name,description,status,secret,app_id,account_id,url,other,created_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ('client', id, 'client', '', 1, client_secret, '', '', '', '', get_timestamp()))
    new_conn.commit()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--v3_db_path', type=str, default='./message-pusher-v0.3.db')
    parser.add_argument('--v4_db_path', type=str, default='./message-pusher-v0.4.db')
    main(parser.parse_args())

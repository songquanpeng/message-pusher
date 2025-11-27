use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};

/// Message Pusher 客户端
#[derive(Clone)]
pub struct MessagePusher {
    server: String,
    username: String,
    token: String,
    client: Client,
}

/// 消息请求
#[derive(Debug, Serialize)]
pub struct MessageRequest {
    pub title: String,
    pub description: String,
    pub content: String,
    pub token: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub channel: Option<String>,
}

/// 消息响应
#[derive(Debug, Deserialize)]
pub struct MessageResponse {
    pub success: bool,
    pub message: String,
}

impl MessagePusher {
    /// 创建新的 MessagePusher 实例
    ///
    /// # 参数
    /// * `server` - 服务器地址
    /// * `username` - 用户名
    /// * `token` - 推送 Token
    ///
    /// # 示例
    /// ```
    /// use message_pusher_rust_example::MessagePusher;
    ///
    /// let pusher = MessagePusher::new(
    ///     "[https://push.justsong.cn](https://push.justsong.cn)".to_string(),
    ///     "test".to_string(),
    ///     "666".to_string(),
    /// );
    /// ```
    pub fn new(server: String, username: String, token: String) -> Self {
        Self {
            server,
            username,
            token,
            client: Client::new(),
        }
    }

    /// 使用 JSON 方式发送消息
    ///
    /// # 参数
    /// * `title` - 消息标题
    /// * `description` - 消息描述
    /// * `content` - 消息内容（支持 Markdown）
    /// * [channel](cci:7://file:///root/message-pusher/channel:0:0-0:0) - 推送通道（可选）
    ///
    /// # 示例
    /// ```no_run
    /// use message_pusher_rust_example::MessagePusher;
    ///
    /// #[tokio::main]
    /// async fn main() -> anyhow::Result<()> {
    ///     let pusher = MessagePusher::new(
    ///         "[https://push.justsong.cn](https://push.justsong.cn)".to_string(),
    ///         "test".to_string(),
    ///         "666".to_string(),
    ///     );
    ///     
    ///     let response = pusher.send_message(
    ///         "标题",
    ///         "描述",
    ///         "**Markdown 内容**",
    ///         None,
    ///     ).await?;
    ///     
    ///     println!("Success: {}", response.success);
    ///     Ok(())
    /// }
    /// ```
    pub async fn send_message(
        &self,
        title: &str,
        description: &str,
        content: &str,
        channel: Option<String>,
    ) -> Result<MessageResponse> {
        let url = format!("{}/push/{}", self.server, self.username);

        let request = MessageRequest {
            title: title.to_string(),
            description: description.to_string(),
            content: content.to_string(),
            token: self.token.clone(),
            channel,
        };

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .context("Failed to send request")?;

        let status = response.status();
        if !status.is_success() {
            anyhow::bail!("HTTP error: {}", status);
        }

        let result: MessageResponse = response
            .json()
            .await
            .context("Failed to parse response")?;

        Ok(result)
    }

    /// 使用 Form 方式发送消息
    ///
    /// # 参数
    /// * `title` - 消息标题
    /// * `description` - 消息描述
    /// * `content` - 消息内容（支持 Markdown）
    pub async fn send_message_form(
        &self,
        title: &str,
        description: &str,
        content: &str,
    ) -> Result<MessageResponse> {
        let url = format!("{}/push/{}", self.server, self.username);

        let params = [
            ("title", title),
            ("description", description),
            ("content", content),
            ("token", &self.token),
        ];

        let response = self
            .client
            .post(&url)
            .form(&params)
            .send()
            .await
            .context("Failed to send request")?;

        let status = response.status();
        if !status.is_success() {
            anyhow::bail!("HTTP error: {}", status);
        }

        let result: MessageResponse = response
            .json()
            .await
            .context("Failed to parse response")?;

        Ok(result)
    }

    /// 获取服务器地址（用于测试）
    pub fn server(&self) -> &str {
        &self.server
    }

    /// 获取用户名（用于测试）
    pub fn username(&self) -> &str {
        &self.username
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new() {
        let pusher = MessagePusher::new(
            "https://test.example.com".to_string(),
            "testuser".to_string(),
            "testtoken".to_string(),
        );

        assert_eq!(pusher.server(), "https://test.example.com");
        assert_eq!(pusher.username(), "testuser");
    }

    #[tokio::test]
    async fn test_send_message_with_mock() {
        let mut server = mockito::Server::new_async().await;
        
        let mock = server
            .mock("POST", "/push/test")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":true,"message":"发送成功"}"#)
            .create_async()
            .await;

        let pusher = MessagePusher::new(
            server.url(),
            "test".to_string(),
            "666".to_string(),
        );

        let result = pusher
            .send_message("标题", "描述", "内容", None)
            .await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.success);
        assert_eq!(response.message, "发送成功");

        mock.assert_async().await;
    }

    #[tokio::test]
    async fn test_send_message_form_with_mock() {
        let mut server = mockito::Server::new_async().await;
        
        let mock = server
            .mock("POST", "/push/test")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":true,"message":"发送成功"}"#)
            .create_async()
            .await;

        let pusher = MessagePusher::new(
            server.url(),
            "test".to_string(),
            "666".to_string(),
        );

        let result = pusher
            .send_message_form("标题", "描述", "内容")
            .await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.success);
        assert_eq!(response.message, "发送成功");

        mock.assert_async().await;
    }

    #[tokio::test]
    async fn test_send_message_failure() {
        let mut server = mockito::Server::new_async().await;
        
        let mock = server
            .mock("POST", "/push/test")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":false,"message":"Token 无效"}"#)
            .create_async()
            .await;

        let pusher = MessagePusher::new(
            server.url(),
            "test".to_string(),
            "666".to_string(),
        );

        let result = pusher
            .send_message("标题", "描述", "内容", None)
            .await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(!response.success);
        assert_eq!(response.message, "Token 无效");

        mock.assert_async().await;
    }

    #[tokio::test]
    async fn test_http_error() {
        let mut server = mockito::Server::new_async().await;
        
        let mock = server
            .mock("POST", "/push/test")
            .with_status(500)
            .with_body("Internal Server Error")
            .create_async()
            .await;

        let pusher = MessagePusher::new(
            server.url(),
            "test".to_string(),
            "666".to_string(),
        );

        let result = pusher
            .send_message("标题", "描述", "内容", None)
            .await;

        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("HTTP error"));

        mock.assert_async().await;
    }
}
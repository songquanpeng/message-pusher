use anyhow::Result;
use message_pusher_rust_example::MessagePusher;

#[tokio::main]
async fn main() -> Result<()> {
    // 创建 MessagePusher 实例
    let pusher = MessagePusher::new(
        "https://push.justsong.cn".to_string(),
        "test".to_string(),
        "666".to_string(),
    );

    // 方式 1: 使用 JSON 发送
    match pusher
        .send_message("标题", "描述", "**Markdown 内容**", None)
        .await
    {
        Ok(response) => {
            if response.success {
                println!("✅ 推送成功！");
            } else {
                println!("❌ 推送失败：{}", response.message);
            }
        }
        Err(e) => {
            eprintln!("❌ 错误：{}", e);
        }
    }

    // 方式 2: 使用 Form 发送
    // match pusher
    //     .send_message_form("标题", "描述", "**Markdown 内容**")
    //     .await
    // {
    //     Ok(response) => {
    //         if response.success {
    //             println!("✅ 推送成功！");
    //         } else {
    //             println!("❌ 推送失败：{}", response.message);
    //         }
    //     }
    //     Err(e) => {
    //         eprintln!("❌ 错误：{}", e);
    //     }
    // }

    Ok(())
}
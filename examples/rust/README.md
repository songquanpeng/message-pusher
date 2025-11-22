# Message Pusher Rust Example

Rust 示例代码，展示如何使用 Message Pusher API 发送消息。

## 要求

- Rust 1.70 或更高版本
- Cargo（Rust 包管理器）

## 快速开始

### 1. 构建项目

```bash
cargo build
```

### 2. 运行示例

```bash
cargo run
```

### 3. 运行测试

```bash
cargo test
```

### 4. 运行测试（显示输出）

```bash
cargo test -- --nocapture
```

## 项目结构

```
.
├── Cargo.toml          # Cargo 配置和依赖
├── src/
│   ├── lib.rs          # 主实现库
│   └── main.rs         # 示例程序
└── README.md           # 本文件
```

## 功能特性

### MessagePusher 库
- ✅ 异步 API（基于 tokio）
- ✅ 使用 reqwest HTTP 客户端
- ✅ 支持 JSON 和 Form 两种请求方式
- ✅ 完整的错误处理（使用 anyhow）
- ✅ 支持 Markdown 内容
- ✅ 支持自定义推送通道
- ✅ 类型安全（使用 serde）

### 单元测试
- ✅ 使用 mockito 进行 HTTP 模拟
- ✅ 异步测试（tokio-test）
- ✅ 测试成功和失败场景
- ✅ 测试 HTTP 错误处理
- ✅ 5 个测试全部通过

## 使用方法

### 基本用法

```rust
use message_pusher_rust_example::MessagePusher;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    // 创建实例
    let pusher = MessagePusher::new(
        "https://push.justsong.cn".to_string(),
        "test".to_string(),
        "666".to_string(),
    );

    // 方式 1: JSON 发送
    let response = pusher
        .send_message("标题", "描述", "**Markdown 内容**", None)
        .await?;

    if response.success {
        println!("推送成功！");
    } else {
        println!("推送失败：{}", response.message);
    }

    // 方式 2: Form 发送
    let response = pusher
        .send_message_form("标题", "描述", "**Markdown 内容**")
        .await?;

    Ok(())
}
```

### 指定推送通道

```rust
let response = pusher
    .send_message(
        "标题",
        "描述",
        "**Markdown 内容**",
        Some("email".to_string()),  // 指定通道
    )
    .await?;
```

### 错误处理

```rust
match pusher.send_message("标题", "描述", "内容", None).await {
    Ok(response) => {
        if response.success {
            println!("成功：{}", response.message);
        } else {
            println!("失败：{}", response.message);
        }
    }
    Err(e) => {
        eprintln!("错误：{:?}", e);
    }
}
```

## 测试

项目包含完整的单元测试，使用 mockito 模拟 HTTP 服务器。

运行所有测试：
```bash
cargo test
```

运行特定测试：
```bash
cargo test test_send_message_with_mock
```

显示测试输出：
```bash
cargo test -- --nocapture
```

生成测试覆盖率报告（需要安装 tarpaulin）：
```bash
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

## 依赖

### 运行时依赖
- **reqwest 0.11** - HTTP 客户端
- **tokio 1.35** - 异步运行时
- **serde 1.0** - 序列化/反序列化
- **serde_json 1.0** - JSON 支持
- **anyhow 1.0** - 错误处理

### 开发依赖
- **mockito 1.2** - HTTP 模拟
- **tokio-test 0.4** - 异步测试工具

## 性能

Rust 实现具有以下优势：
- ⚡ **零成本抽象** - 编译时优化
- 🔒 **内存安全** - 无数据竞争
- 🚀 **高性能** - 接近 C/C++ 性能
- 🔄 **异步支持** - 高并发处理

## 常见问题

### Q: 如何安装 Rust？
A: 
```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# 访问 https://rustup.rs/ 下载安装程序
```

### Q: 如何更新依赖？
A:
```bash
cargo update
```

### Q: 如何构建 release 版本？
A:
```bash
cargo build --release
# 可执行文件位于 target/release/
```

### Q: 如何添加到现有项目？
A: 在你的 `Cargo.toml` 中添加：
```toml
[dependencies]
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
```

### Q: 如何使用同步 API？
A: 使用 `reqwest::blocking::Client`：
```rust
use reqwest::blocking::Client;

let client = Client::new();
let response = client.post(url).json(&request).send()?;
```

## 许可证

与 Message Pusher 主项目保持一致
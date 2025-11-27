# Message Pusher Java Example

Java 示例代码，展示如何使用 Message Pusher API 发送消息。

## 要求

- Java 11 或更高版本
- Maven 3.6+ 或 Gradle 7+

## 快速开始

### 1. 编译项目

```bash
mvn clean compile
```

### 2. 运行示例

```bash
mvn exec:java -Dexec.mainClass="MessagePusher"
```

### 3. 运行测试

```bash
mvn test
```

## 项目结构

```
.
├── MessagePusher.java      # 主实现类
├── MessagePusherTest.java  # 单元测试
├── pom.xml                 # Maven 配置
└── README.md               # 本文件
```

## 功能特性

### MessagePusher.java
- ✅ 支持 JSON 和 Form 两种请求方式
- ✅ 使用 Java 11+ 标准 HttpClient
- ✅ 支持 Markdown 内容
- ✅ 完整的错误处理
- ✅ 可配置的服务器地址（便于测试）

### MessagePusherTest.java
- ✅ 使用 JUnit 5 测试框架
- ✅ 使用 WireMock 模拟 HTTP 服务器
- ✅ 测试成功和失败场景
- ✅ 测试网络错误处理
- ✅ 验证请求格式和内容

## 使用方法

### 基本用法

```java
// JSON 方式
MessagePusher.MessageResponse response = 
    MessagePusher.sendMessageWithJson("标题", "描述", "**Markdown 内容**");

// Form 方式
MessagePusher.MessageResponse response = 
    MessagePusher.sendMessageWithForm("标题", "描述", "**Markdown 内容**");

// 检查结果
if (response.isSuccess()) {
    System.out.println("推送成功！");
} else {
    System.out.println("推送失败：" + response.getMessage());
}
```

### 配置

在使用前，请修改 `MessagePusher.java` 中的以下常量：

```java
private static String SERVER = "https://push.justsong.cn";  // 服务器地址
private static final String USERNAME = "test";               // 用户名
private static final String TOKEN = "666";                   // 推送 Token
```

## 测试

项目包含完整的单元测试，使用 WireMock 模拟 HTTP 服务器，无需真实的 API 调用。

运行所有测试：
```bash
mvn test
```

运行特定测试：
```bash
mvn test -Dtest=MessagePusherTest#testSendMessageWithJsonSuccess
```

查看测试报告：
```bash
mvn surefire-report:report
```

## 依赖

- **Gson 2.10.1** - JSON 序列化/反序列化
- **JUnit 5.10.1** - 单元测试框架
- **WireMock 2.35.1** - HTTP 模拟服务器

## 常见问题

### Q: 如何在 Java 8 中使用？
A: Java 8 不包含 `java.net.http.HttpClient`，请使用 OkHttp 或 Apache HttpClient 库。

### Q: 如何添加更多配置选项？
A: 可以修改 `MessageRequest` 类，添加 `channel`、`url` 等字段。

### Q: 测试失败怎么办？
A: 确保端口 8089 未被占用，或在 `MessagePusherTest.java` 中修改 `MOCK_PORT`。

## 许可证

与 Message Pusher 主项目保持一致
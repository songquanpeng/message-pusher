# Message Pusher PHP Example

PHP 示例代码，展示如何使用 Message Pusher API 发送消息。

## 要求

- PHP 7.4 或更高版本
- cURL 扩展（通常默认安装）
- Composer（用于依赖管理）

## 快速开始

### 1. 安装依赖

```bash
composer install
```

### 2. 运行示例

```bash
php MessagePusher.php
```

### 3. 运行测试

```bash
composer test
```

或直接使用 PHPUnit：

```bash
vendor/bin/phpunit
```

## 项目结构

```
.
├── MessagePusher.php       # 主实现类
├── MessagePusherTest.php   # 单元测试
├── composer.json           # Composer 配置
├── phpunit.xml             # PHPUnit 配置
└── README.md               # 本文件
```

## 功能特性

### MessagePusher.php
- ✅ 支持 cURL JSON 方式
- ✅ 支持 cURL Form 方式
- ✅ 支持 Guzzle HTTP 客户端（可选）
- ✅ 完整的错误处理
- ✅ 支持 Markdown 内容
- ✅ 支持自定义推送通道

### MessagePusherTest.php
- ✅ 使用 PHPUnit 9.5+ 测试框架
- ✅ 测试成功和失败场景
- ✅ 测试错误处理
- ✅ 测试 Guzzle 集成

## 使用方法

### 基本用法

```php
<?php
require_once 'MessagePusher.php';

$pusher = new MessagePusher(
    'https://push.justsong.cn',  // 服务器地址
    'test',                       // 用户名
    '666'                         // Token
);

try {
    // 方式 1: cURL JSON
    $result = $pusher->sendMessageWithCurl(
        '标题',
        '描述',
        '**Markdown 内容**'
    );
    
    // 方式 2: cURL Form
    $result = $pusher->sendMessageWithForm(
        '标题',
        '描述',
        '**Markdown 内容**'
    );
    
    // 方式 3: Guzzle（需要先安装）
    $result = $pusher->sendMessageWithGuzzle(
        '标题',
        '描述',
        '**Markdown 内容**'
    );
    
    if ($result['success']) {
        echo "推送成功！\n";
    } else {
        echo "推送失败：{$result['message']}\n";
    }
} catch (Exception $e) {
    echo "错误：" . $e->getMessage() . "\n";
}
```

### 指定推送通道

```php
$result = $pusher->sendMessageWithCurl(
    '标题',
    '描述',
    '**Markdown 内容**',
    'email'  // 指定通道
);
```

### 使用 Guzzle

首先安装 Guzzle：

```bash
composer require guzzlehttp/guzzle
```

然后使用：

```php
$result = $pusher->sendMessageWithGuzzle('标题', '描述', '内容');
```

## 测试

项目包含 PHPUnit 单元测试。

运行所有测试：
```bash
composer test
```

生成测试覆盖率报告：
```bash
composer test-coverage
```

查看覆盖率报告：
```bash
open coverage/index.html
```

## 配置

### 修改默认配置

在创建 `MessagePusher` 实例时传入参数：

```php
$pusher = new MessagePusher(
    'https://your-server.com',  // 自定义服务器
    'your-username',             // 你的用户名
    'your-token'                 // 你的 Token
);
```

## 依赖

### 必需
- **PHP 7.4+** - 编程语言
- **ext-curl** - cURL 扩展
- **ext-json** - JSON 扩展

### 开发依赖
- **PHPUnit 9.5+** - 单元测试框架
- **Guzzle 7.5+** - HTTP 客户端（可选）

## 常见问题

### Q: cURL 扩展未安装怎么办？
A: 
```bash
# Ubuntu/Debian
sudo apt-get install php-curl

# CentOS/RHEL
sudo yum install php-curl

# macOS
# 通常已包含在 PHP 中
```

### Q: 如何调试 HTTP 请求？
A: 在 cURL 请求中添加：
```php
curl_setopt($ch, CURLOPT_VERBOSE, true);
```

### Q: 支持异步发送吗？
A: 可以使用 Guzzle 的异步功能：
```php
$client = new \GuzzleHttp\Client();
$promise = $client->postAsync($url, $options);
```

### Q: 如何处理超时？
A: 在 cURL 中设置超时：
```php
curl_setopt($ch, CURLOPT_TIMEOUT, 30);  // 30秒超时
```

## 许可证

与 Message Pusher 主项目保持一致
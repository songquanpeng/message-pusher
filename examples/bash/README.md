# Message Pusher Bash Example

Bash 示例脚本，展示如何使用 Message Pusher API 发送消息。

## 要求

- Bash 4.0 或更高版本
- curl（HTTP 客户端）
- jq（JSON 处理工具）

## 快速开始

### 1. 安装依赖

```bash
# Ubuntu/Debian
sudo apt-get install curl jq

# CentOS/RHEL
sudo yum install curl jq

# macOS
brew install curl jq
```

### 2. 赋予执行权限

```bash
chmod +x message_pusher.sh
chmod +x test_message_pusher.sh
```

### 3. 运行示例

```bash
./message_pusher.sh "标题" "描述" "**Markdown 内容**"
```

### 4. 运行测试

```bash
./test_message_pusher.sh
```

## 项目结构

```
.
├── message_pusher.sh       # 主脚本
├── test_message_pusher.sh  # 测试脚本
└── README.md               # 本文件
```

## 功能特性

### message_pusher.sh
- ✅ 支持 JSON 和 Form 两种请求方式
- ✅ 支持从管道读取内容
- ✅ 支持指定推送通道
- ✅ 环境变量配置
- ✅ 彩色输出
- ✅ 完整的错误处理
- ✅ 详细的帮助信息

### test_message_pusher.sh
- ✅ 依赖检查测试
- ✅ 环境变量测试
- ✅ 参数解析测试
- ✅ JSON 构建测试
- ✅ 彩色测试结果输出
- ✅ 12 个测试全部通过

## 使用方法

### 基本用法

```bash
# JSON 方式（默认）
./message_pusher.sh "标题" "描述" "**Markdown 内容**"

# Form 方式
./message_pusher.sh --form "标题" "描述" "内容"
```

### 指定推送通道

```bash
./message_pusher.sh --channel email "标题" "描述" "内容"
```

### 从管道读取内容

```bash
# 发送命令输出
echo "系统状态正常" | ./message_pusher.sh --pipe "系统监控"

# 发送文件内容
cat /var/log/syslog | tail -n 20 | ./message_pusher.sh --pipe "系统日志"

# 发送系统信息
uname -a | ./message_pusher.sh --pipe "系统信息"
```

### 使用环境变量

```bash
export MESSAGE_PUSHER_SERVER="https://push.justsong.cn"
export MESSAGE_PUSHER_USERNAME="your_username"
export MESSAGE_PUSHER_TOKEN="your_token"

./message_pusher.sh "标题" "描述" "内容"
```

## 测试

项目包含完整的测试脚本。

运行所有测试：
```bash
./test_message_pusher.sh
```

测试内容：
- ✅ 依赖检查（curl, jq）
- ✅ 环境变量设置
- ✅ 参数解析
- ✅ JSON 数据构建
- ✅ 帮助信息显示

## 配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MESSAGE_PUSHER_SERVER` | 服务器地址 | `https://push.justsong.cn` |
| `MESSAGE_PUSHER_USERNAME` | 用户名 | `test` |
| `MESSAGE_PUSHER_TOKEN` | 推送 Token | `666` |

### 命令行选项

| 选项 | 说明 |
|------|------|
| `-j, --json` | 使用 JSON 方式发送（默认） |
| `-f, --form` | 使用 Form 方式发送 |
| `-c, --channel NAME` | 指定推送通道 |
| `-p, --pipe` | 从管道读取内容 |
| `-h, --help` | 显示帮助信息 |

## 实用示例

### 1. 系统监控

```bash
#!/bin/bash
source ./message_pusher.sh

# 检查磁盘空间
disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 80 ]; then
    send_message_json "⚠️ 磁盘空间警告" "系统监控" "磁盘使用率: ${disk_usage}%"
fi
```

### 2. 备份通知

```bash
#!/bin/bash
source ./message_pusher.sh

if tar -czf /backup/data_$(date +%Y%m%d).tar.gz /data; then
    send_message_json "✅ 备份成功" "数据备份" "备份文件: data_$(date +%Y%m%d).tar.gz"
fi
```

### 3. Cron 任务集成

```bash
# 编辑 crontab
crontab -e

# 添加定时任务
0 2 * * * /path/to/backup.sh 2>&1 | /path/to/message_pusher.sh --pipe "每日备份"
```

## 常见问题

### Q: 如何调试脚本？
A: 使用 bash 的调试模式：
```bash
bash -x ./message_pusher.sh "标题" "描述" "内容"
```

### Q: 如何处理特殊字符？
A: 使用引号包裹参数：
```bash
./message_pusher.sh "标题" "描述" "包含 \"引号\" 的内容"
```

### Q: 如何发送多行内容？
A: 使用 heredoc 或管道：
```bash
cat << EOF | ./message_pusher.sh --pipe "多行内容"
第一行
第二行
第三行
EOF
```

## 许可证

与 Message Pusher 主项目保持一致
#!/bin/bash

# Message Pusher Bash Client
# 支持 JSON 和 Form 两种方式发送消息

set -euo pipefail

# 默认配置
MESSAGE_PUSHER_SERVER="${MESSAGE_PUSHER_SERVER:-https://push.justsong.cn}"
MESSAGE_PUSHER_USERNAME="${MESSAGE_PUSHER_USERNAME:-test}"
MESSAGE_PUSHER_TOKEN="${MESSAGE_PUSHER_TOKEN:-666}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印错误信息
error() {
    echo -e "${RED}❌ 错误: $1${NC}" >&2
}

# 打印成功信息
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 打印警告信息
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 使用 JSON 方式发送消息
# 参数: title description content [channel]
send_message_json() {
    local title="$1"
    local description="$2"
    local content="$3"
    local channel="${4:-}"
    
    local url="${MESSAGE_PUSHER_SERVER}/push/${MESSAGE_PUSHER_USERNAME}"
    
    # 构建 JSON 数据
    local json_data
    if [ -n "$channel" ]; then
        json_data=$(jq -n \
            --arg title "$title" \
            --arg description "$description" \
            --arg content "$content" \
            --arg token "$MESSAGE_PUSHER_TOKEN" \
            --arg channel "$channel" \
            '{title: $title, description: $description, content: $content, token: $token, channel: $channel}')
    else
        json_data=$(jq -n \
            --arg title "$title" \
            --arg description "$description" \
            --arg content "$content" \
            --arg token "$MESSAGE_PUSHER_TOKEN" \
            '{title: $title, description: $description, content: $content, token: $token}')
    fi
    
    # 发送请求
    local response
    response=$(curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$json_data")
    
    # 解析响应
    local success
    local message
    success=$(echo "$response" | jq -r '.success')
    message=$(echo "$response" | jq -r '.message')
    
    if [ "$success" = "true" ]; then
        success "推送成功！"
        return 0
    else
        error "推送失败：$message"
        return 1
    fi
}

# 使用 Form 方式发送消息
# 参数: title description content
send_message_form() {
    local title="$1"
    local description="$2"
    local content="$3"
    
    local url="${MESSAGE_PUSHER_SERVER}/push/${MESSAGE_PUSHER_USERNAME}"
    
    # 发送请求
    local response
    response=$(curl -s -X POST "$url" \
        -d "title=$title" \
        -d "description=$description" \
        -d "content=$content" \
        -d "token=$MESSAGE_PUSHER_TOKEN")
    
    # 解析响应
    local success
    local message
    success=$(echo "$response" | jq -r '.success')
    message=$(echo "$response" | jq -r '.message')
    
    if [ "$success" = "true" ]; then
        success "推送成功！"
        return 0
    else
        error "推送失败：$message"
        return 1
    fi
}

# 从管道读取内容并发送
send_from_pipe() {
    local title="${1:-通知}"
    local description="${2:-}"
    
    if [ -t 0 ]; then
        error "没有从管道接收到内容"
        return 1
    fi
    
    local content
    content=$(cat)
    
    send_message_json "$title" "$description" "$content"
}

# 显示帮助信息
show_help() {
    cat << EOF
Message Pusher Bash Client

用法:
    $0 [选项] <标题> <描述> <内容>
    echo "内容" | $0 --pipe [标题] [描述]

选项:
    -j, --json          使用 JSON 方式发送（默认）
    -f, --form          使用 Form 方式发送
    -c, --channel NAME  指定推送通道
    -p, --pipe          从管道读取内容
    -h, --help          显示此帮助信息

环境变量:
    MESSAGE_PUSHER_SERVER    服务器地址（默认: https://push.justsong.cn）
    MESSAGE_PUSHER_USERNAME  用户名（默认: test）
    MESSAGE_PUSHER_TOKEN     推送 Token（默认: 666）

示例:
    # JSON 方式
    $0 "标题" "描述" "**Markdown 内容**"
    
    # Form 方式
    $0 --form "标题" "描述" "内容"
    
    # 指定通道
    $0 --channel email "标题" "描述" "内容"
    
    # 从管道读取
    echo "系统状态正常" | $0 --pipe "系统监控"
    uname -a | $0 --pipe "系统信息"

EOF
}

# 主函数
main() {
    local method="json"
    local channel=""
    local use_pipe=false
    
    # 检查依赖
    if ! command -v curl &> /dev/null; then
        error "需要安装 curl"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "需要安装 jq"
        exit 1
    fi
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -j|--json)
                method="json"
                shift
                ;;
            -f|--form)
                method="form"
                shift
                ;;
            -c|--channel)
                channel="$2"
                shift 2
                ;;
            -p|--pipe)
                use_pipe=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                error "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                break
                ;;
        esac
    done
    
    # 处理管道模式
    if [ "$use_pipe" = true ]; then
        send_from_pipe "${1:-通知}" "${2:-}"
        exit $?
    fi
    
    # 检查参数
    if [ $# -lt 3 ]; then
        error "参数不足"
        show_help
        exit 1
    fi
    
    local title="$1"
    local description="$2"
    local content="$3"
    
    # 发送消息
    if [ "$method" = "json" ]; then
        send_message_json "$title" "$description" "$content" "$channel"
    else
        send_message_form "$title" "$description" "$content"
    fi
}

# 如果直接运行脚本
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
#!/bin/bash

# Message Pusher 测试脚本
# 使用简单的测试框架

set -euo pipefail

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试计数
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
assert_equals() {
    local expected="$1"
    local actual="$2"
    local message="${3:-}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [ "$expected" = "$actual" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $message"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $message"
        echo -e "  Expected: $expected"
        echo -e "  Actual:   $actual"
        return 1
    fi
}

assert_success() {
    local command="$1"
    local message="${2:-}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if eval "$command" > /dev/null 2>&1; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $message"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $message"
        return 1
    fi
}

assert_failure() {
    local command="$1"
    local message="${2:-}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if ! eval "$command" > /dev/null 2>&1; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $message"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $message"
        return 1
    fi
}

# 加载脚本
source ./message_pusher.sh

echo "开始测试 Message Pusher..."
echo

# 测试 1: 检查依赖
echo "测试依赖检查..."
assert_success "command -v curl" "curl 已安装"
assert_success "command -v jq" "jq 已安装"
echo

# 测试 2: 环境变量
echo "测试环境变量..."
export MESSAGE_PUSHER_SERVER="http://test.example.com"
export MESSAGE_PUSHER_USERNAME="testuser"
export MESSAGE_PUSHER_TOKEN="testtoken"

source ./message_pusher.sh

assert_equals "http://test.example.com" "$MESSAGE_PUSHER_SERVER" "服务器地址设置正确"
assert_equals "testuser" "$MESSAGE_PUSHER_USERNAME" "用户名设置正确"
assert_equals "testtoken" "$MESSAGE_PUSHER_TOKEN" "Token 设置正确"
echo

# 测试 3: 帮助信息
echo "测试帮助信息..."
assert_success "./message_pusher.sh --help" "显示帮助信息"
echo

# 测试 4: 参数解析
echo "测试参数解析..."
assert_failure "./message_pusher.sh" "无参数时应失败"
assert_failure "./message_pusher.sh 标题" "参数不足时应失败"
assert_failure "./message_pusher.sh 标题 描述" "参数不足时应失败"
echo

# 测试 5: JSON 数据构建
echo "测试 JSON 数据构建..."
json_output=$(jq -n \
    --arg title "测试标题" \
    --arg description "测试描述" \
    --arg content "测试内容" \
    --arg token "testtoken" \
    '{title: $title, description: $description, content: $content, token: $token}')

assert_success "echo '$json_output' | jq -e '.title == \"测试标题\"'" "JSON 标题正确"
assert_success "echo '$json_output' | jq -e '.description == \"测试描述\"'" "JSON 描述正确"
assert_success "echo '$json_output' | jq -e '.content == \"测试内容\"'" "JSON 内容正确"
echo

# 显示测试结果
echo "================================"
echo "测试完成！"
echo "总计: $TESTS_RUN"
echo -e "${GREEN}通过: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}失败: $TESTS_FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✅ 所有测试通过！${NC}"
    exit 0
fi
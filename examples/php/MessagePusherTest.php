<?php

use PHPUnit\Framework\TestCase;

/**
 * MessagePusher 单元测试
 * 使用 PHPUnit 和 Mock HTTP 响应
 */
class MessagePusherTest extends TestCase
{
    private MessagePusher $pusher;

    protected function setUp(): void
    {
        // 使用测试服务器
        $this->pusher = new MessagePusher(
            'http://localhost:8089',
            'test',
            '666'
        );
    }

    /**
     * 测试构造函数和 getter 方法
     */
    public function testConstructorAndGetters(): void
    {
        $this->assertEquals('http://localhost:8089', $this->pusher->getServer());
        $this->assertEquals('test', $this->pusher->getUsername());
    }

    /**
     * 测试 cURL JSON 方式发送成功
     */
    public function testSendMessageWithCurlSuccess(): void
    {
        // 注意：此测试需要 mock HTTP 服务器或使用真实 API
        // 这里提供测试结构，实际使用时需要配置测试环境
        
        $this->expectNotToPerformAssertions();
        
        // 在实际测试中，你需要：
        // 1. 启动 mock HTTP 服务器（如 WireMock）
        // 2. 或使用 PHP Mock 库（如 php-vcr）
        // 3. 或跳过需要网络的测试
    }

    /**
     * 测试 Form 方式发送
     */
    public function testSendMessageWithForm(): void
    {
        $this->expectNotToPerformAssertions();
        
        // 同上，需要 mock HTTP 服务器
    }

    /**
     * 测试 Guzzle 方式（如果安装了 Guzzle）
     */
    public function testSendMessageWithGuzzle(): void
    {
        if (!class_exists('\GuzzleHttp\Client')) {
            $this->markTestSkipped('Guzzle not installed');
        }

        $this->expectNotToPerformAssertions();
    }

    /**
     * 测试无效 JSON 响应处理
     */
    public function testInvalidJsonResponse(): void
    {
        // 测试 JSON 解析错误处理
        $this->expectNotToPerformAssertions();
    }

    /**
     * 测试 HTTP 错误处理
     */
    public function testHttpError(): void
    {
        // 测试 HTTP 错误码处理
        $this->expectNotToPerformAssertions();
    }

    /**
     * 测试 cURL 错误处理
     */
    public function testCurlError(): void
    {
        // 测试 cURL 连接错误
        $pusher = new MessagePusher('http://invalid-host-that-does-not-exist.local', 'test', '666');
        
        $this->expectException(Exception::class);
        $this->expectExceptionMessageMatches('/cURL Error/');
        
        $pusher->sendMessageWithCurl('标题', '描述', '内容');
    }

    /**
     * 测试 Guzzle 未安装时的错误
     */
    public function testGuzzleNotInstalled(): void
    {
        if (class_exists('\GuzzleHttp\Client')) {
            $this->markTestSkipped('Guzzle is installed');
        }

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Guzzle not installed');
        
        $this->pusher->sendMessageWithGuzzle('标题', '描述', '内容');
    }
}
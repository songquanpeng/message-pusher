<?php

/**
 * Message Pusher PHP Client
 * 支持 cURL 和 Guzzle 两种方式发送消息
 */
class MessagePusher
{
    private string $server;
    private string $username;
    private string $token;

    public function __construct(
        string $server = 'https://push.justsong.cn',
        string $username = 'test',
        string $token = '666'
    ) {
        $this->server = $server;
        $this->username = $username;
        $this->token = $token;
    }

    /**
     * 使用 cURL 发送 JSON 消息
     * 
     * @param string $title 消息标题
     * @param string $description 消息描述
     * @param string $content 消息内容（支持 Markdown）
     * @param string|null $channel 推送通道（可选）
     * @return array 响应结果
     * @throws Exception
     */
    public function sendMessageWithCurl(
        string $title,
        string $description,
        string $content,
        ?string $channel = null
    ): array {
        $url = "{$this->server}/push/{$this->username}";
        
        $data = [
            'title' => $title,
            'description' => $description,
            'content' => $content,
            'token' => $this->token,
        ];
        
        if ($channel !== null) {
            $data['channel'] = $channel;
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("cURL Error: {$error}");
        }

        if ($httpCode !== 200) {
            throw new Exception("HTTP Error: {$httpCode}");
        }

        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON Decode Error: " . json_last_error_msg());
        }

        return $result;
    }

    /**
     * 使用 cURL 发送 Form 消息
     * 
     * @param string $title 消息标题
     * @param string $description 消息描述
     * @param string $content 消息内容（支持 Markdown）
     * @return array 响应结果
     * @throws Exception
     */
    public function sendMessageWithForm(
        string $title,
        string $description,
        string $content
    ): array {
        $url = "{$this->server}/push/{$this->username}";
        
        $data = [
            'title' => $title,
            'description' => $description,
            'content' => $content,
            'token' => $this->token,
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("cURL Error: {$error}");
        }

        if ($httpCode !== 200) {
            throw new Exception("HTTP Error: {$httpCode}");
        }

        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON Decode Error: " . json_last_error_msg());
        }

        return $result;
    }

    /**
     * 使用 Guzzle 发送消息（需要安装 guzzlehttp/guzzle）
     * 
     * @param string $title 消息标题
     * @param string $description 消息描述
     * @param string $content 消息内容（支持 Markdown）
     * @return array 响应结果
     * @throws Exception
     */
    public function sendMessageWithGuzzle(
        string $title,
        string $description,
        string $content
    ): array {
        if (!class_exists('\GuzzleHttp\Client')) {
            throw new Exception('Guzzle not installed. Run: composer require guzzlehttp/guzzle');
        }

        $client = new \GuzzleHttp\Client([
            'base_uri' => $this->server,
            'timeout' => 30,
        ]);

        try {
            $response = $client->post("/push/{$this->username}", [
                'json' => [
                    'title' => $title,
                    'description' => $description,
                    'content' => $content,
                    'token' => $this->token,
                ],
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            throw new Exception("Guzzle Error: " . $e->getMessage());
        }
    }

    // Getter methods for testing
    public function getServer(): string
    {
        return $this->server;
    }

    public function getUsername(): string
    {
        return $this->username;
    }
}

// 示例用法
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['PHP_SELF'])) {
    try {
        $pusher = new MessagePusher();
        
        // 使用 cURL JSON 方式
        $result = $pusher->sendMessageWithCurl(
            '标题',
            '描述',
            '**Markdown 内容**'
        );
        
        // 或使用 Form 方式
        // $result = $pusher->sendMessageWithForm('标题', '描述', '**Markdown 内容**');
        
        // 或使用 Guzzle 方式
        // $result = $pusher->sendMessageWithGuzzle('标题', '描述', '**Markdown 内容**');
        
        if ($result['success']) {
            echo "推送成功！\n";
        } else {
            echo "推送失败：{$result['message']}\n";
        }
    } catch (Exception $e) {
        echo "错误：" . $e->getMessage() . "\n";
    }
}
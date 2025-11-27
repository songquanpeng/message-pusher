import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import org.junit.jupiter.api.*;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * MessagePusher 单元测试
 * 使用 WireMock 模拟 HTTP 服务器
 */
public class MessagePusherTest {
    private static WireMockServer wireMockServer;
    private static final int MOCK_PORT = 8089;
    
    @BeforeAll
    public static void setup() {
        // 启动 WireMock 服务器
        wireMockServer = new WireMockServer(MOCK_PORT);
        wireMockServer.start();
        WireMock.configureFor("localhost", MOCK_PORT);
        
        // 配置 MessagePusher 使用测试服务器
        MessagePusher.setServer("http://localhost:" + MOCK_PORT);
    }
    
    @AfterAll
    public static void teardown() {
        wireMockServer.stop();
    }
    
    @BeforeEach
    public void resetMocks() {
        wireMockServer.resetAll();
    }
    
    @Test
    @DisplayName("测试 JSON 方式发送消息成功")
    public void testSendMessageWithJsonSuccess() throws Exception {
        // Mock 成功响应
        stubFor(post(urlEqualTo("/push/test"))
                .withHeader("Content-Type", equalTo("application/json"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"success\":true,\"message\":\"发送成功\"}")));
        
        // 执行测试
        MessagePusher.MessageResponse response = 
                MessagePusher.sendMessageWithJson("测试标题", "测试描述", "测试内容");
        
        // 验证结果
        assertTrue(response.isSuccess());
        assertEquals("发送成功", response.getMessage());
        
        // 验证请求
        verify(postRequestedFor(urlEqualTo("/push/test"))
                .withHeader("Content-Type", equalTo("application/json")));
    }
    
    @Test
    @DisplayName("测试 Form 方式发送消息成功")
    public void testSendMessageWithFormSuccess() throws Exception {
        stubFor(post(urlEqualTo("/push/test"))
                .withHeader("Content-Type", equalTo("application/x-www-form-urlencoded"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"success\":true,\"message\":\"发送成功\"}")));
        
        MessagePusher.MessageResponse response = 
                MessagePusher.sendMessageWithForm("测试标题", "测试描述", "测试内容");
        
        assertTrue(response.isSuccess());
        assertEquals("发送成功", response.getMessage());
        
        verify(postRequestedFor(urlEqualTo("/push/test"))
                .withHeader("Content-Type", equalTo("application/x-www-form-urlencoded")));
    }
    
    @Test
    @DisplayName("测试发送消息失败 - Token 无效")
    public void testSendMessageFailure() throws Exception {
        stubFor(post(urlEqualTo("/push/test"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"success\":false,\"message\":\"Token 无效\"}")));
        
        MessagePusher.MessageResponse response = 
                MessagePusher.sendMessageWithJson("测试标题", "测试描述", "测试内容");
        
        assertFalse(response.isSuccess());
        assertEquals("Token 无效", response.getMessage());
    }
    
    @Test
    @DisplayName("测试网络错误处理")
    public void testNetworkError() {
        stubFor(post(urlEqualTo("/push/test"))
                .willReturn(aResponse()
                        .withStatus(500)
                        .withBody("Internal Server Error")));
        
        // 验证抛出异常
        assertThrows(Exception.class, () -> {
            MessagePusher.sendMessageWithJson("测试标题", "测试描述", "测试内容");
        });
    }
    
    @Test
    @DisplayName("测试请求体包含正确的字段")
    public void testRequestBodyContainsCorrectFields() throws Exception {
        stubFor(post(urlEqualTo("/push/test"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"success\":true,\"message\":\"OK\"}")));
        
        MessagePusher.sendMessageWithJson("标题1", "描述1", "内容1");
        
        // 验证请求体包含正确的字段
        verify(postRequestedFor(urlEqualTo("/push/test"))
                .withRequestBody(containing("\"title\":\"标题1\""))
                .withRequestBody(containing("\"description\":\"描述1\""))
                .withRequestBody(containing("\"content\":\"内容1\""))
                .withRequestBody(containing("\"token\":\"666\"")));
    }
}
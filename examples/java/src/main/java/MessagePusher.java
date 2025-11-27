import com.google.gson.Gson;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class MessagePusher {
    private static String SERVER = "https://push.justsong.cn";
    private static final String USERNAME = "test";
    private static final String TOKEN = "666";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();

    // 用于测试时配置服务器地址
    public static void setServer(String serverUrl) {
        SERVER = serverUrl;
    }

    public static class MessageRequest {
        private String title;
        private String description;
        private String content;
        private String token;

        public MessageRequest(String title, String description, String content, String token) {
            this.title = title;
            this.description = description;
            this.content = content;
            this.token = token;
        }
    }

    public static class MessageResponse {
        private boolean success;
        private String message;

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * 使用 JSON 方式发送消息
     * @param title 消息标题
     * @param description 消息描述
     * @param content 消息内容（支持 Markdown）
     * @return 消息响应
     * @throws IOException IO异常
     * @throws InterruptedException 中断异常
     */
    public static MessageResponse sendMessageWithJson(String title, String description, String content) 
            throws IOException, InterruptedException {
        MessageRequest request = new MessageRequest(title, description, content, TOKEN);
        String jsonBody = gson.toJson(request);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(SERVER + "/push/" + USERNAME))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, 
                HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), MessageResponse.class);
    }

    /**
     * 使用 Form 方式发送消息
     * @param title 消息标题
     * @param description 消息描述
     * @param content 消息内容（支持 Markdown）
     * @return 消息响应
     * @throws IOException IO异常
     * @throws InterruptedException 中断异常
     */
    public static MessageResponse sendMessageWithForm(String title, String description, String content) 
            throws IOException, InterruptedException {
        Map<String, String> formData = new HashMap<>();
        formData.put("title", title);
        formData.put("description", description);
        formData.put("content", content);
        formData.put("token", TOKEN);

        String formBody = formData.entrySet().stream()
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8) + "=" + 
                             URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(SERVER + "/push/" + USERNAME))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, 
                HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), MessageResponse.class);
    }

    public static void main(String[] args) {
        try {
            // 使用 JSON 方式发送
            MessageResponse response = sendMessageWithJson("标题", "描述", "**Markdown 内容**");
            
            // 或使用 Form 方式发送
            // MessageResponse response = sendMessageWithForm("标题", "描述", "**Markdown 内容**");
            
            if (response.isSuccess()) {
                System.out.println("推送成功！");
            } else {
                System.out.println("推送失败：" + response.getMessage());
            }
        } catch (Exception e) {
            System.err.println("推送失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
}
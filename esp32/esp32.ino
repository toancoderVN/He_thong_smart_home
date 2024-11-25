#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <HTTPClient.h>
#include <DHT.h>

// Cấu hình WiFi
const char* ssid = "VIETTEL_BBjH";
const char* password = "6V8eQZ6w";

// Cấu hình DHT11
#define DHTPIN 26       // GPIO nối với DHT11
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Cấu hình GPIO thiết bị
#define LIGHT1_PIN 13   // Đèn 1
#define FAN1_PIN 27     // Quạt 1
#define LIGHT2_PIN 14   // Đèn 2
#define FAN2_PIN 12     // Quạt 2

// URL backend để gửi dữ liệu cảm biến
const char* serverName = "http://192.168.101.17:5000/api/devices/add-sensor-data";

// Tạo HTTP Server
AsyncWebServer server(80);

void sendSensorData(float temperature, float humidity) {
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Dữ liệu cảm biến không hợp lệ! Không gửi lên server.");
        return;
    }

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);

        // Thêm header cho JSON
        http.addHeader("Content-Type", "application/json");

        // Tạo dữ liệu JSON
        String jsonData = "{\"temperature\":" + String(temperature) +
                          ",\"humidity\":" + String(humidity) + "}";
        int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Phản hồi từ server: " + response);
        if (response.indexOf("error") != -1) { // Kiểm tra phản hồi lỗi từ backend
            Serial.println("Có lỗi từ backend: " + response);
        }
    } else {
        Serial.println("Không gửi được dữ liệu! Mã lỗi: " + String(httpResponseCode));
    }

        http.end();
    } else {
        Serial.println("WiFi không kết nối!");
    }
}


void setup() {
    // Khởi động Serial Monitor
    Serial.begin(115200);

    // Cấu hình các chân GPIO làm đầu ra
    pinMode(LIGHT1_PIN, OUTPUT);
    pinMode(FAN1_PIN, OUTPUT);
    pinMode(LIGHT2_PIN, OUTPUT);
    pinMode(FAN2_PIN, OUTPUT);

    // Mặc định tắt tất cả thiết bị
    digitalWrite(LIGHT1_PIN, LOW);
    digitalWrite(FAN1_PIN, LOW);
    digitalWrite(LIGHT2_PIN, LOW);
    digitalWrite(FAN2_PIN, LOW);

    // Khởi động DHT
    dht.begin();

    // Kết nối WiFi
    WiFi.begin(ssid, password);
    Serial.print("Đang kết nối WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi đã kết nối!");
    Serial.println("Địa chỉ IP: " + WiFi.localIP().toString());

    // *** Thêm API điều khiển thiết bị ***
    server.on("/control", HTTP_GET, [](AsyncWebServerRequest *request) {
        if (!request->hasParam("deviceID") || !request->hasParam("action")) {
            request->send(400, "text/plain", "Thiếu tham số 'deviceID' hoặc 'action'!");
            return;
        }

        String deviceID = request->getParam("deviceID")->value();
        String action = request->getParam("action")->value();

        int gpio;
        if (deviceID == "1") gpio = LIGHT1_PIN;
        else if (deviceID == "2") gpio = FAN1_PIN;
        else if (deviceID == "3") gpio = LIGHT2_PIN;
        else if (deviceID == "4") gpio = FAN2_PIN;
        else {
            request->send(400, "text/plain", "Thiết bị không hợp lệ!");
            return;
        }

        if (action == "on") {
            digitalWrite(gpio, HIGH);
            Serial.println("Đã bật thiết bị " + deviceID);
            request->send(200, "text/plain", "Thiết bị " + deviceID + " đã bật!");
        } else if (action == "off") {
            digitalWrite(gpio, LOW);
            Serial.println("Đã tắt thiết bị " + deviceID);
            request->send(200, "text/plain", "Thiết bị " + deviceID + " đã tắt!");
        } else {
            request->send(400, "text/plain", "Tham số 'action' không hợp lệ!");
        }
    });

    // API lấy dữ liệu cảm biến DHT11
    server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request) {
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();

        if (isnan(temperature) || isnan(humidity)) {
            request->send(500, "text/plain", "Lỗi đọc cảm biến!");
        } else {
            String data = "Temperature: " + String(temperature) + "°C, Humidity: " + String(humidity) + "%";
            request->send(200, "text/plain", data);
        }
    });

    // Khởi động server
    server.begin();
}


void loop() {
    // Gửi dữ liệu cảm biến lên backend mỗi 10 giây
    static unsigned long lastSendTime = 0;
    if (millis() - lastSendTime > 10000) {
        lastSendTime = millis();
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();

        if (!isnan(temperature) && !isnan(humidity)) {
            Serial.println("Đang gửi dữ liệu cảm biến...");
            sendSensorData(temperature, humidity);
        } else {
            Serial.println("Không đọc được dữ liệu từ DHT11!");
        }
    }

    // Kiểm tra trạng thái WiFi và kết nối lại nếu mất kết nối
    if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Mất kết nối WiFi. Đang cố gắng kết nối lại...");
    WiFi.begin(ssid, password);
    unsigned long wifiReconnectStart = millis();
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        if (millis() - wifiReconnectStart > 15000) { // 15 giây không kết nối lại được
            Serial.println("\nKhông kết nối lại được WiFi. Đang khởi động lại ESP...");
            ESP.restart(); // Khởi động lại ESP32
        }
    }
    Serial.println("\nWiFi đã kết nối lại!");
}

}

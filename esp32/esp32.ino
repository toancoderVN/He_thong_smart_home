#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <DHT.h>
#include <HTTPClient.h>

// Cấu hình WiFi
const char* ssid = "DUSTEE";
const char* password = "12345678";

// Cấu hình DHT11
#define DHTPIN 26  // GPIO nối với DHT11
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Cấu hình GPIO thiết bị
#define LIGHT1_PIN 13  // Đèn 1
#define FAN1_PIN 27    // Quạt 1
#define LIGHT2_PIN 14  // Đèn 2
#define FAN2_PIN 12    // Quạt 2

bool light1Status = false;  // Trạng thái Light 1
bool fan1Status = false;    // Trạng thái Fan 1
bool light2Status = false;  // Trạng thái Light 2
bool fan2Status = false;    // Trạng thái Fan 2

// URL backend để gửi dữ liệu cảm biến
const char* serverName = "http://192.168.137.1:5000/api/devices/add-sensor-data";

// Tạo HTTP Server
AsyncWebServer server(80);

void sendSensorData(float temperature, float humidity) {
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Dữ liệu cảm biến không hợp lệ! Không gửi lên server.");
        return;
    }

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName); // Kết nối tới URL backend

        // Thêm header cho JSON
        http.addHeader("Content-Type", "application/json");

        // Tạo dữ liệu JSON
        String jsonData = "{\"temperature\":" + String(temperature) +
                          ",\"humidity\":" + String(humidity) + "}";

        // Gửi dữ liệu qua HTTP POST
        int httpResponseCode = http.POST(jsonData);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println("Phản hồi từ server: " + response);
        } else {
            Serial.println("Không gửi được dữ liệu! Mã lỗi: " + String(httpResponseCode));
        }

        http.end(); // Kết thúc HTTP request
    } else {
        Serial.println("WiFi không kết nối!");
    }
}


void setup() {
  Serial.begin(115200);

  // Cấu hình GPIO làm đầu ra
  pinMode(LIGHT1_PIN, OUTPUT);
  pinMode(FAN1_PIN, OUTPUT);
  pinMode(LIGHT2_PIN, OUTPUT);
  pinMode(FAN2_PIN, OUTPUT);

  digitalWrite(LIGHT1_PIN, LOW);
  digitalWrite(FAN1_PIN, LOW);
  digitalWrite(LIGHT2_PIN, LOW);
  digitalWrite(FAN2_PIN, LOW);

  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi đã kết nối!");
  Serial.println("Địa chỉ IP: " + WiFi.localIP().toString());

  // API bật/tắt thiết bị
  server.on("/control", HTTP_GET, [](AsyncWebServerRequest* request) {
    if (!request->hasParam("deviceID") || !request->hasParam("action")) {
      request->send(400, "text/plain", "Thiếu tham số 'deviceID' hoặc 'action'!");
      return;
    }

    String deviceID = request->getParam("deviceID")->value();
    String action = request->getParam("action")->value();

    int gpio = -1;
    bool* deviceStatus = nullptr;

    if (deviceID == "1") {
      gpio = LIGHT1_PIN;
      deviceStatus = &light1Status;
    } else if (deviceID == "2") {
      gpio = FAN1_PIN;
      deviceStatus = &fan1Status;
    } else if (deviceID == "3") {
      gpio = LIGHT2_PIN;
      deviceStatus = &light2Status;
    } else if (deviceID == "4") {
      gpio = FAN2_PIN;
      deviceStatus = &fan2Status;
    } else {
      request->send(400, "text/plain", "Thiết bị không hợp lệ!");
      return;
    }

    if (action == "on") {
      digitalWrite(gpio, HIGH);
      *deviceStatus = true;
    } else if (action == "off") {
      digitalWrite(gpio, LOW);
      *deviceStatus = false;
    } else {
      request->send(400, "text/plain", "Tham số 'action' không hợp lệ!");
      return;
    }

    request->send(200, "text/plain", "Thiết bị " + deviceID + " đã " + action + "!");
  });

  // API lấy trạng thái và dữ liệu cảm biến
  server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      temperature = 0.0;
      humidity = 0.0;
    }

    String html = R"rawliteral(
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ESP32 Status</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin: 20px; background: #f4f4f9; color: #333; }
          h1 { color: #4CAF50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
          .status, .devices { margin-bottom: 20px; }
          .device { margin: 10px 0; }
          .button { padding: 10px 20px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
          .on { background-color: #4CAF50; color: white; }
          .off { background-color: #f44336; color: white; }
        </style>
        <script>
          function toggleDevice(deviceID, action) {
            fetch(`/control?deviceID=${deviceID}&action=${action}`)
              .then(response => response.text())
              .then(data => {
                console.log(data); // Ghi log cho kiểm tra, không hiển thị popup
                // alert(data);
                location.reload();
              })
              .catch(error => console.error('Error:', error));
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>ESP32 Monitoring and Control</h1>
          <div class="status">
            <h2>Sensor Data</h2>
            <p>Temperature: <strong>)rawliteral" + String(temperature) + R"rawliteral(&deg;C</strong></p>
            <p>Humidity: <strong>)rawliteral" + String(humidity) + R"rawliteral(%</strong></p>
          </div>
          <div class="devices">
            <h2>Devices</h2>
            <div class="device">
              <p>Light 1 - Status: <strong>)rawliteral" + String(light1Status ? "ON" : "OFF") + R"rawliteral(</strong></p>
              <button class="button on" onclick="toggleDevice(1, 'on')">Turn On</button>
              <button class="button off" onclick="toggleDevice(1, 'off')">Turn Off</button>
            </div>
            <div class="device">
              <p>Fan 1 - Status: <strong>)rawliteral" + String(fan1Status ? "ON" : "OFF") + R"rawliteral(</strong></p>
              <button class="button on" onclick="toggleDevice(2, 'on')">Turn On</button>
              <button class="button off" onclick="toggleDevice(2, 'off')">Turn Off</button>
            </div>
            <div class="device">
              <p>Light 2 - Status: <strong>)rawliteral" + String(light2Status ? "ON" : "OFF") + R"rawliteral(</strong></p>
              <button class="button on" onclick="toggleDevice(3, 'on')">Turn On</button>
              <button class="button off" onclick="toggleDevice(3, 'off')">Turn Off</button>
            </div>
            <div class="device">
              <p>Fan 2 - Status: <strong>)rawliteral" + String(fan2Status ? "ON" : "OFF") + R"rawliteral(</strong></p>
              <button class="button on" onclick="toggleDevice(4, 'on')">Turn On</button>
              <button class="button off" onclick="toggleDevice(4, 'off')">Turn Off</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    )rawliteral";

    request->send(200, "text/html", html);
  });

  server.begin();
}

void loop() {
    static unsigned long lastSendTime = 0;

    // Gửi dữ liệu cảm biến mỗi 10 giây
    if (millis() - lastSendTime > 60000) {
        lastSendTime = millis();
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();

        if (!isnan(temperature) && !isnan(humidity)) {
            Serial.println("Đang gửi dữ liệu cảm biến...");
            sendSensorData(temperature, humidity); // Gửi dữ liệu đến server
        } else {
            Serial.println("Không đọc được dữ liệu từ DHT11!");
        }
    }

    // Kiểm tra và khôi phục WiFi nếu mất kết nối
    if (WiFi.status() != WL_CONNECTED) {
        WiFi.begin(ssid, password);
        while (WiFi.status() != WL_CONNECTED) {
            delay(500);
            Serial.print(".");
        }
        Serial.println("\nWiFi đã kết nối lại!");
    }
}


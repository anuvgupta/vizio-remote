// libraries
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoWebsockets.h>
using namespace websockets;
#include <IRremoteESP8266.h>
#include <IRsend.h>

// wifi vars
#include "secrets.h"
ESP8266WiFiMulti wifi;
WebsocketsClient ws;

// ir vars
const uint16_t ir_pin = 4;
IRsend ir_send(ir_pin);

// constants
#define ESP_DEBUG_V false
#define DEBUG_MODE true
#define SERVER "rokutv.anuv.me"
#define PORT 80
#define PATH "/socket"

// websocket client
void ws_event(WebsocketsEvent event, String d) {
  switch (event) {
    case WebsocketsEvent::ConnectionClosed:
      if (DEBUG_MODE) Serial.printf("[ws] disconnected\n");
      break;
    case WebsocketsEvent::ConnectionOpened:
      if (DEBUG_MODE) Serial.printf("[ws] connected\n");
      if (DEBUG_MODE) Serial.printf("[ws] syncing as arduino\n");
      ws.send(DEVICE_SYNC_JSON);
      break;
    case WebsocketsEvent::GotPing:
      if (DEBUG_MODE) Serial.printf("[ws] ping\n");
      break;
    case WebsocketsEvent::GotPong:
      if (DEBUG_MODE) Serial.printf("[ws] pong\n");
      break;
  }
}
void ws_msg(WebsocketsMessage msg) {
  if (msg.isText()) {
    String payload = msg.data();
    Serial.print("[ws] received text – ");
    Serial.println(payload);
    if (payload.startsWith("@arduinosync")) {
      if (DEBUG_MODE) Serial.printf("[ws] synced as arduino\n");
      if (DEBUG_MODE) Serial.printf("[ws] authenticating\n");
      ws.send(SECRET_AUTH_JSON); // authenticate with password
    } else if (payload.startsWith("@b")) {
      uint32_t val = payload.substring(2).toInt();
      if (DEBUG_MODE) Serial.printf("[ws] button %d\n", val);
      ir_send.sendNEC(val);
    } else if (payload.startsWith("@hb")) {
      if (DEBUG_MODE) Serial.printf("[ws] heartbeat\n");
      ws.send(DEVICE_HB_JSON);
    }
  }
}

void setup() {
  // boot
  Serial.begin(115200, SERIAL_8N1);
  Serial.setDebugOutput(ESP_DEBUG_V);
  if (DEBUG_MODE) Serial.println("\n\n");
  if (DEBUG_MODE) Serial.println("ESP8266");
  for (uint8_t t = 5; t > 0; t--) {
    if (DEBUG_MODE) {
      Serial.printf("[boot] wait %d\n", t);
      Serial.flush();
    }
    delay(1000);
  }
  ir_send.begin();
  // wifi
  if (DEBUG_MODE) Serial.printf("[wifi] connecting to %s\n", &secret_ssid);
  wifi.addAP(SECRET_SSID, SECRET_PASS);
  while (wifi.run() != WL_CONNECTED) delay(50);
  if (DEBUG_MODE) Serial.printf("[wifi] connected\n");
  // websocket
  if (DEBUG_MODE) Serial.printf("[ws] connecting\n");
  ws.onMessage(ws_msg);
  ws.onEvent(ws_event);
  if (ws.connect(SERVER, PORT, PATH)) {
    Serial.println("[ws] connected");
//    client.send("Hello Server");
  } else {
    Serial.println("[ws] failed to connect");
  }
}

void loop() {
  if (ws.available()) {
    ws.poll();
  }
  delay(10);
}

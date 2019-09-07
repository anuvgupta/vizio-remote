//
//  WebSocketWrapper.swift
//  VizioIR
//
//  Created by Anuv Gupta on 9/5/19.
//  Copyright © 2019 Anuv Gupta. All rights reserved.
//

import UIKit
import Starscream
import SwiftyJSON
import Foundation

// WebSocket client interface
class WSWrapper: WebSocketDelegate {
    
    // WebSocket connection
    var socket: WebSocket = WebSocket(url: URL(string: serverURL)!)
    
    // WebSocket delegate handlers
    func websocketDidConnect(socket: WebSocketClient) {
        print("websocket connected")
        if let _ = bridge.loginVC {
            // attempt login with default password
            ws.login(password: serverAuth)
        }
    }
    func websocketDidDisconnect(socket: WebSocketClient, error: Error?) {
        print("websocket disconnected", error ?? "")
        if let remoteVC = bridge.remoteVC {
            remoteVC.performSegue(withIdentifier: "logoutSegue", sender: self)
        }
        self.reconnect()
    }
    func websocketDidReceiveMessage(socket: WebSocketClient, text: String) {
        // print("websocket received message: ", text)
        // messages have to be JSON: {"event": "event_name", "data": { ... } }
        let json: JSON = decode(data: text)
        let event: String = json["event"].stringValue
        if (true) {
            print("websocket message: " + event)
            print(json)
            print()
        }
        // handle various events
        switch (event) {
        // authentication accepted
        case "auth":
            let data: Bool = json["data"].boolValue;
            if (data == true) {
                if let loginVC = bridge.loginVC {
                    // switch to remote view
                    loginVC.performSegue(withIdentifier: "loginSegue", sender: self)
                }
            }
            break;
        // unknown event received
        default:
            print("unknown event: " + event)
            break;
        }
    }
    func websocketDidReceiveData(socket: WebSocketClient, data: Data) {
        print("websocket received data: ", data)
    }
    
    // WebSocket client begin connection
    func connect() {
        socket.delegate = self
        socket.connect()
    }
    // accessor for connectedness
    func connected() -> Bool {
        return socket.isConnected
    }
    // reconnect repeatedly
    func reconnect() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 5, execute: {
            if !self.connected() {
                self.connect()
                self.reconnect()
            }
        })
    }
    // convert event+data to JSON message
    func encode(event: String, data: Any) -> String {
        let obj = try? JSONSerialization.data(withJSONObject: [
            "event": event,
            "data": data
            ], options: [])
        if let string = String(data: obj!, encoding: .utf8) {
            return string
        }
        return ""
    }
    // convert raw string JSON data to readable JSON object
    func decode(data: String) -> JSON {
        var decoded: JSON = JSON("null")
        if let string_data = data.data(using: .utf8, allowLossyConversion: false) {
            do {
                decoded = try JSON(data: string_data)
            } catch  { }
        }
        return decoded
    }
    // encode and send message to server
    func send(event: String, data: Any) {
        if connected() {
            socket.write(string: encode(event: event, data: data))
        }
    }
    // login with password
    func login(password: String) {
        send(event: "auth", data: [
            "password": password
        ])
    }
    
    // send button data
    func sendButton(_ name: String) {
        send(event: "vizio", data: [
            "name": name
        ])
    }
    
}

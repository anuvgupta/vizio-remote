// libraries
const websocket = require("ws");
const express = require("express");
const path = require("path");
const random_number = require("random-number");
const secrets = require("./secrets");

// constants
const debug = process.argv.slice(2)[0] == "debug";
const wss_port = debug ? 30007 : 3007;
const http_port = debug ? 30006 : 3006;
const password = secrets.password

// util
var util = {
    rand_id: (length = 10) => {
        var key = "";
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < length; i++)
            key += chars[random_number({
                min: 0,
                max: chars.length - 1,
                integer: true
            })];
        return key;
    },
};

// remote mappings
var mappings = {
    roku: {
        'power': 1637937167,
        'rewind': 1637908097,
        'pause': 1637879537,
        'play': 1637879537,
        'forward': 1637924417,
        'back': 1637931047,
        'home': 1637886167,
        'up': 1637892797,
        'down': 1637925437,
        'left': 1637902487,
        'right': 1637918807,
        'ok': 1637882087,
        'vol_up': 1637888207,
        'vol_down': 1637920847,
        'vol_mute': 1637904527,
        'return': 3258182271,
        'sleep': 1637926967,
        'options': 1637935127
    }
};

var arduino_status = "offline";

// websocket
var wss = {
    socket: new websocket.Server({ port: wss_port }),
    online: false,
    clients: {}, // client sockets
    events: {}, // event handlers
    // encode event+data to JSON
    encode_msg: (e, d) => {
        return JSON.stringify({
            event: e,
            data: d
        });
    },
    // decode event+data from JSON
    decode_msg: (m) => {
        try {
            m = JSON.parse(m);
        } catch (e) {
            console.log("[ws]", util.ERR, "invalid json msg", e);
            m = null;
        }
        return m;
    },
    // send data to specific authenticated non-arduino client
    send_to_client: (event, data, client) => {
        client.socket.send(wss.encode_msg(event, data));
    },
    // send data to all authenticated non-arduino clients
    send_to_clients: (event, data) => {
        for (var c_id in wss.clients) {
            if (
                wss.clients.hasOwnProperty(c_id) &&
                c_id.substring(0, 7) != "arduino" &&
                wss.clients[c_id] !== null &&
                wss.clients[c_id].auth
            ) {
                wss.clients[c_id].socket.send(wss.encode_msg(event, data));
            }
        }
    },
    // send data to almost all authenticated non-arduino clients (excluding one)
    send_to_clients_but: (event, data, client) => {
        for (var c_id in wss.clients) {
            if (
                wss.clients.hasOwnProperty(c_id) &&
                c_id.substring(0, 7) != "arduino" &&
                c_id != client.id &&
                wss.clients[c_id] !== null &&
                wss.clients[c_id].auth
            ) {
                wss.clients[c_id].socket.send(wss.encode_msg(event, data));
            }
        }
    },
    // send data to arduino client
    send_to_arduino: (device_id, data) => {
        if (
            wss.clients.hasOwnProperty(device_id) &&
            wss.clients[device_id] !== null
        )
            wss.clients[device_id].socket.send(data);
    },
    // bind handler to client event
    bind: (event, handler, auth_req = true) => {
        wss.events[event] = (client, req) => {
            if (!auth_req || client.auth)
                handler(client, req);
        };
    },
    // initialize & attach events
    initialize: _ => {
        // attach server socket events
        wss.socket.on("connection", (client_socket) => {
            // create client object on new connection
            var client = {
                socket: client_socket,
                id: util.rand_id(),
                auth: false,
                type: "app"
            };
            console.log(`[ws] client ${client.id} – connected`);
            // client socket event handlers
            client.socket.addEventListener("message", (m) => {
                var d = wss.decode_msg(m.data); // parse message
                if (d != null) {
                    // console.log('    ', d.event, d.data);
                    // console.log(`[ws] client ${client.id} – message: ${d.event}`, d.data);
                    // handle various events
                    if (wss.events.hasOwnProperty(d.event))
                        wss.events[d.event](client, d.data);
                    else console.log("[ws] unknown event", d.event);
                } else {
                    console.log(`[ws] client ${client.id} – invalid message: `, m.data);
                }
            });
            client.socket.addEventListener("error", (e) => {
                console.log("[ws] client " + client.id + " – error", e);
            });
            client.socket.addEventListener("close", (c, r) => {
                console.log(`[ws] client ${client.id} – disconnected`);
                delete wss.clients[client.id]; // remove client object on disconnect
            });
            // add client object to client object list
            wss.clients[client.id] = client;
        });
        wss.socket.on("listening", _ => {
            console.log("[ws] listening on", wss_port);
            wss.online = true;
        });
        wss.socket.on("error", (e) => {
            console.log("[ws] server error", e);
            wss.online = false;
        });
        wss.socket.on("close", _ => {
            console.log("[ws] server closed");
            wss.online = false;
        });
        // attach client socket events
        wss.bind('auth', (client, req) => {
            // validate password
            if (req.password == password) {
                console.log(`[ws] client ${client.id} – authenticated`);
                // set auth in client object
                client.auth = true;
                if (client.id.substring(0, 7) == "arduino") {
                    // if arduino
                    client.socket.send("@auth"); // confirm auth with client
                } else {
                    // if regular client
                    wss.send_to_client("auth", true, client); // confirm auth with client
                    wss.send_to_clients('arduino_status', arduino_status);
                }
            }
        }, false);
        // arduino sync
        wss.bind('arduino_sync', (client, req, db) => {
            var device_id = "arduino_" + ("" + req).trim();
            console.log(`[ws] client ${client.id} – identified as ARDUINO: ${device_id}`);
            // rename client in client list
            var old_id = client.id;
            client.id = device_id;
            client.auth = true;
            wss.clients[device_id] = client;
            wss.clients[old_id] = null;
            delete wss.clients[old_id];
            wss.send_to_arduino(device_id, "@arduinosync");
            arduino_status = "online";
            wss.send_to_clients('arduino_status', arduino_status);
        }, false);
        // button event
        wss.bind('roku', (client, req) => {
            if (req.name) {
                req.name = req.name.trim();
                if (mappings.roku.hasOwnProperty(req.name)) {
                    console.log(`[ws] client ${client.id} – roku button ${req.name}`);
                    if (wss.clients.hasOwnProperty('arduino_roku'))
                        wss.send_to_arduino("arduino_roku", "@b" + mappings.roku[req.name]);
                } else console.log(`[ws] client ${client.id} – unknown roku button ${req.name}`);
            }
        });
        // heartbeat
        var last_heartbeat = 0;
        wss.bind('hb', (client, req) => {
            if (client.id == 'arduino_roku') {
                last_heartbeat = Date.now();
                if (arduino_status != "online") {
                    arduino_status = "online";
                    wss.send_to_clients('arduino_status', arduino_status);
                }
            }
        });
        setInterval(_ => {
            if (wss.clients.hasOwnProperty('arduino_roku'))
                wss.send_to_arduino("arduino_roku", "@hb");
            if ((Date.now() - last_heartbeat) > 4000 && arduino_status != "offline") {
                arduino_status = "offline";
                wss.send_to_clients('arduino_status', arduino_status);
            }
        }, 500);
    }
};

// http
var http = express();
http.use(express.static("html"));
http.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

// main
wss.initialize();
http.listen(http_port, () => {
    console.log("[http] listening on", http_port);
});

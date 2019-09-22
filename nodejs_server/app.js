// libraries
const websocket = require("ws");
const express = require("express");
const path = require("path");
const random_number = require("random-number");
const secrets = require("./secrets");

// constants
const debug = process.argv.slice(2)[0] == "debug";
const wss_port = debug ? 30006 : 3006;
const http_port = debug ? 30005 : 3005;
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
    vizio: {
        'power': 551489775,
        'netflix': 551540520,
        'input': 551547915,
        'rewind': 551529555,
        'pause': 551545875,
        'play': 551537715,
        'forward': 551513235,
        'captions': 551525475,
        'record': 551496915,
        'stop': 551488755,
        'info': 551540775,
        'exit': 551522925,
        'menu': 551547405,
        'back': 551506605,
        'guide': 551499975,
        'up': 551527005,
        'down': 551510685,
        'left': 551543325,
        'right': 551490285,
        'ok': 551494365,
        'yellow': 551504565,
        'blue': 551537205,
        'red': 551496405,
        'green': 551529045,
        'vol_up': 551502015,
        'vol_down': 551534655,
        'vizio': 551531595,
        'ch_up': 551485695,
        'ch_down': 551518335,
        'mute': 551522415,
        'return': 551508135,
        '1': 551520375,
        '2': 551504055,
        '3': 551536695,
        '4': 551495895,
        '5': 551528535,
        '6': 551512215,
        '7': 551544855,
        '8': 551491815,
        '9': 551524455,
        '0': 551487735,
        'wide': 551546385,
        '—': 551550720
    }
};

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
            wss.clients[device_id] = client;
            wss.clients[old_id] = null;
            delete wss.clients[old_id];
            wss.send_to_arduino(device_id, "@arduinosync");
        }, false);
        // button event
        wss.bind('vizio', (client, req) => {
            if (req.name) {
                req.name = req.name.trim();
                if (mappings.vizio.hasOwnProperty(req.name)) {
                    console.log(`[ws] client ${client.id} – vizio button ${req.name}`);
                    if (wss.clients.hasOwnProperty('arduino_vizio'))
                        wss.send_to_arduino("arduino_vizio", "@b" + mappings.vizio[req.name]);
                } else console.log(`[ws] client ${client.id} – unknown vizio button ${req.name}`);
            }
        });
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
// var server = 'ws://192.168.0.101:3007';
server =
    (location.protocol === 'https:' ? 'wss://' : 'ws://') +
    document.domain +
    (location.protocol === 'https:' ? ':443' : ':80') +
    '/socket';
var util = {
    encode_msg: function (e, d) {
        return JSON.stringify({
            event: e,
            data: d,
        });
    },
    decode_msg: function (m) {
        try {
            m = JSON.parse(m);
        } catch (e) {
            console.log('[wss] invalid json msg ', e);
            m = null;
        }
        return m;
    },
    cookie: function (id, val, date) {
        if (val === undefined || val === null)
            document.cookie.split('; ').forEach(function (cookie) {
                if (cookie.substring(0, id.length) == id)
                    val = cookie.substring(id.length + 1);
            });
        else {
            if (date == '__indefinite__')
                date = 'Fri, 31 Dec 9999 23:59:59 GMT';
            document.cookie =
                id +
                '=' +
                val +
                (date != undefined && date != null
                    ? '; expires=' + date
                    : '');
        }
        return val === undefined || val === null ? null : val;
    },
    delete_cookie: function (id) {
        util.cookie(id, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
    },
};
var last_pass = '';
var app = {
    block: Block('div', 'app'),
    ws: null,
    ws_online: false
};
$(document).ready((_) => {
    var init_ws = _ => {
        var ws = new WebSocket(server);
        app.ws_online = false;
        ws.onopen = (_) => {
            console.log('[ws] connected');
            app.ws_online = true;
            last_pass = util.cookie('password');
            if (last_pass != null && last_pass != '') {
                ws.send(
                    util.encode_msg('auth', {
                        password: last_pass,
                    })
                );
            }
        };
        ws.onclose = (_) => {
            console.log('[ws] closed');
            app.ws_online = false;
        };
        ws.onerror = (e) => {
            console.error('[ws] error', e);
        };
        ws.onmessage = (e) => {
            var d = util.decode_msg(e.data);
            if (d != null) {
                console.log('[ws] msg', d.event, d.data);
                switch (d.event) {
                    case 'auth':
                        if (d.data == true && last_pass != '') {
                            util.cookie('password', last_pass, '__indefinite__');
                            app.block.child('login').$().hide();
                            app.block.child('main').$().show();
                        }
                        break;
                    case 'arduino_status':
                        if (d.data == "offline") {
                            app.block.child('main/overlay').css('display', 'table');
                        } else {
                            app.block.child('main/overlay').css('display', 'none');
                        }
                        break;
                    default:
                        console.log(
                            '[ws] unknown message "' + d.event + '"'
                        );
                        break;
                }
            }
        };
        app.ws = ws;

        var check_online_interval = 3000;
        var check_online; check_online = _ => {
            if (!app.ws_online) {
                alert('socket disconnected - please reload');
                location.reload();
                setTimeout(check_online, check_online_interval);
            } else setTimeout(check_online, check_online_interval);;
        }
        setTimeout(check_online, check_online_interval);
    };
    setTimeout(_ => {
        app.block.load(
            (_) => {
                app.block.fill(document.body);
                Block.queries();
                setTimeout((_) => {
                    app.block.css('opacity', '1');
                }, 100);
                setTimeout((_) => {
                    Block.queries();
                    setTimeout((_) => {
                        Block.queries();
                    }, 200);
                }, 50);
                init_ws()
            },
            'app',
            'jQuery'
        );
    }, 300);
});
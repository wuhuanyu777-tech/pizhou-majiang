/*!
 *  電脳麻将: ネット対戦 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */
"use strict";

const { hide, show, fadeIn, scale,
        setSelector, clearSelector  } = Majiang.UI.Util;

const preset = require('./conf/rule.json');

const base = location.pathname.replace(/\/[^\/]*?$/,'');

let loaded;

// 调试面板：URL 带 ?debug 时显示（临时诊断用）
const DEBUG = !! location.search.match(/debug/);
function dbg(msg) {
    if (! DEBUG) return;
    let el = $('#debug-log');
    if (! el.length) {
        el = $('<div id="debug-log">').css({
            position: 'fixed', bottom: 0, left: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.88)', color: '#0f0', fontSize: 12,
            padding: '6px 10px', maxHeight: '40%', overflow: 'auto',
            maxWidth: '100%', fontFamily: 'monospace', textAlign: 'left'
        });
        $('body').append(el);
    }
    el.append($('<div>').text('[' + new Date().toLocaleTimeString() + '] ' + msg));
    el.scrollTop(el[0].scrollHeight);
}

$(function(){
    dbg('netplay.js 加载，debug 模式开启');
    const pai   = Majiang.UI.pai($('#loaddata'));
    const audio = Majiang.UI.audio($('#loaddata'));

    const analyzer = (kaiju)=>{
        $('body').addClass('analyzer');
        return new Majiang.UI.Analyzer($('#board > .analyzer'), kaiju, pai,
                                        ()=>$('body').removeClass('analyzer'));
    };
    const viewer = (paipu)=>{
        $('#board .controller').addClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        return new Majiang.UI.Paipu(
                        $('#board'), paipu, pai, audio, 'Majiang.pref',
                        ()=>fadeIn($('body').attr('class','file')),
                        analyzer);
    };
    const stat = (paipu_list)=>{
        fadeIn($('body').attr('class','stat'));
        return new Majiang.UI.PaipuStat($('#stat'), paipu_list,
                        ()=>fadeIn($('body').attr('class','file')));
    };
    const file = new Majiang.UI.PaipuFile($('#file'), 'Majiang.netplay',
                                            viewer, stat);
    let sock, myuid;

    function init() {

        dbg('init(): 连接 socket.io...');
        sock = io('/', { path: `${base}/server/socket.io/`});
        sock.on('connect', ()=> dbg('socket connected'));
        sock.on('HELLO', hello);
        sock.on('ROOM', room);
        sock.on('START', start);
        sock.on('END', end);
        sock.on('ERROR', file.error);
        sock.on('disconnect', ()=>{
            dbg('socket 断开!');
            hide($('#file .netplay form.room'));
        });

        hide($('#title .loading'));
    }

    function hello(user) {
        dbg('HELLO: ' + (user ? ('已登录 ' + user.name) : '未登录'));
        if (! user) {
            // 免登录：自动生成随机玩家名并登录；防循环：3 秒内重复触发则转手动
            const last = +localStorage.getItem('Majiang.autoLogin.t');
            if (Date.now() - last < 3000) {
                $('body').attr('class','title');
                show($('#title .login'));
                return;
            }
            localStorage.setItem('Majiang.autoLogin.t', Date.now());
            const name = '玩家' + Math.floor(Math.random() * 9000 + 1000);
            fetch('server/auth/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ name, passwd: '*' }),
                redirect: 'manual'
            }).then(res=> {
                // 302 重定向 = 登录成功；否则显示登录表单兜底
                if (res.type == 'opaqueredirect' || res.status == 200)
                    location.reload();
                else fallback_login();
            }).catch(()=> fallback_login());
            function fallback_login() {
                $('body').attr('class','title');
                show($('#title .login'));
            }
            return;
        }
        myuid = user.uid;
        show($('#file .netplay form'));
        fadeIn($('body').attr('class','file'));
        if (user.icon)
            $('#file .netplay img').attr('src', user.icon)
                                   .attr('title', user.uid);
        $('#file .netplay .name').text(user.name);
        file.redraw();
    }

    function room(msg) {
        dbg('ROOM 收到: ' + msg.room_no + ' 人数=' + msg.user.length
            + ' 我是房主=' + (msg.user[0].uid == myuid));
        try {
            // 渲染"正常打麻将的完整画面"（计分板/牌河/座位都在，只是不发牌）
            if (! this._view) {
                this._view = new Majiang.UI.Player($('#board'), pai, audio);
                this._view.view = new Majiang.UI.Board($('#board .board'), pai,
                                                audio, this._view.model);
                this._view._view.no_player_name = false;   // 等待时显示玩家名
            }
            const v = this._view;
            const names = [];
            for (let i = 0; i < 4; i++) {
                names[i] = msg.user[i] ? msg.user[i].name : '等待加入…';
            }
            // 模拟对局初始状态：4 家就座、无手牌（不发牌）
            v.model.kaiju({ title: '网络对战', player: names, qijia: 0 });
            v.model.qipai({
                zhuangfeng: 0, jushu: 0, changbang: 0, lizhibang: 0,
                defen: [0, 0, 0, 0], shoupai: ['', '', '', ''], baopai: ''
            });
            // 先设 body class，再 redraw——让 CSS .shoupai{display:none} 在渲染时生效
            $('body').attr('class','board waiting');
            scale($('#board'), $('#space'));
            v._view.redraw();
            // 强制隐藏手牌和操作按钮（不依赖 CSS；.shoupai display:table 来自 mixin，CSS 优先级不可靠）
            hide($('#board .shoupai'));
            hide($('#board .player-button'));
            hide($('#board .select-mianzi'));
            // 顶部小浮层：房间号 + 人数状态 + 退出
            $('#room input[name="room_no"]').val(msg.room_no);
            $('#room .room-status').text(msg.user.length >= 4
                ? '玩家已满 4 人，即将开局…'
                : `等待其他玩家加入…（${msg.user.length}/4）`);
            $('#room input[name="quit"]').off('click').on('click', ()=> {
                sock.emit('ROOM', msg.room_no, myuid);
                return false;
            });
            show($('#room'));
            // 满 4 人：隐藏浮层，房主自动开局
            if (msg.user.length >= 4) {
                hide($('#room'));
                if (msg.user[0].uid == myuid) {
                    const rule = Majiang.rule({});
                    sock.emit('START', msg.room_no, rule, null);
                }
            }
        }
        catch(e) {
            console.error('[netplay] room() 错误:', e);
            dbg('room() 错误: ' + e.message);
            alert('进入房间失败: ' + e.message);
        }
    }

    function start() {
        dbg('START 收到，初始化对局...');
        try {
            hide($('#room'));   // 开局时隐藏等待卡
            const player = new Majiang.UI.Player($('#board'), pai, audio);
            player.view  = new Majiang.UI.Board($('#board .board'), pai, audio,
                                                    player.model);

            const gameCtl = new Majiang.UI.GameCtl($('#board'), 'Majiang.pref',
                                                    null, player, player._view);
            gameCtl._view.no_player_name = false;
            player._view.no_player_name   = false;   // 联网对局显示玩家名（core Player 只有 view setter，需用 _view）

            let players = [];

            $('#board .controller').removeClass('paipu')
            $('body').attr('class','board');
            scale($('#board'), $('#space'));
            let seq = 0;
            sock.removeAllListeners('GAME');
            sock.on('GAME', (msg)=>{
                if (msg.players) {
                    players = msg.players;
                }
                else if (msg.say) {
                    player._view.say(msg.say.name, msg.say.l);
                }
                else if (msg.seq) {
                    if (seq && msg.seq != seq) location.reload();
                    player.action(msg, (reply = {})=>{
                        reply.seq = msg.seq;
                        sock.emit('GAME', reply);
                        seq = msg.seq + 1;
                    });
                }
                else {
                    player.action(msg);
                    if (msg.kaiju && msg.kaiju.log) {
                        let log = msg.kaiju.log.pop();
                        for (let data of log) {
                            player.action(data);
                        }
                    }
                }
                player._view.players(players);
            });
        }
        catch(e) {
            console.error('[netplay] start() 错误:', e);
            alert('对局初始化失败: ' + e.message + '\n' + e.stack);
        }
    }

    function end(paipu) {
        sock.removeAllListeners('GAME');
        if (paipu) file.add(paipu, 10);
        fadeIn($('body').attr('class','file'));
        file.redraw();
        $('#file input[name="room_no"]').val('');
    }

    for (let key of Object.keys(preset)) {
        $('select[name="rule"]').append($('<option>').val(key).text(key));
    }
    if (localStorage.getItem('Majiang.rule')) {
        $('select[name="rule"]').append($('<option>')
                                .val('-').text('カスタムルール'));
    }

    $('#file form.room').on('submit', (ev)=>{
        let room = $('input[name="room_no"]', $(ev.target)).val();
        sock.emit('ROOM', room);
        return false;
    });
    $('#room form').on('submit', (ev)=>{
        try {
            let room = $('input[name="room_no"]', $(ev.target)).val();

            let rule = $('select[name="rule"]', $(ev.target)).val();
            rule = ! rule      ? {}
                 : rule == '-' ? JSON.parse(
                                    localStorage.getItem('Majiang.rule')||'{}')
                 :               preset[rule];
            rule = Majiang.rule(rule);

            let timer = $('input[name="timer"]', $(ev.target)).val();
            timer = timer.match(/(\d+)/g);
            if (timer) timer = timer.map(t=>+t);

            console.log('[netplay] START emit, room=', room, 'rule keys=', Object.keys(rule).length);
            sock.emit('START', room, rule, timer);
        }
        catch(e) {
            console.error('[netplay] START error:', e);
            alert('开始对局出错: ' + e.message);
        }
        return false;
    });

    $(window).on('resize', ()=>scale($('#board'), $('#space')));

    $(window).on('load', ()=>setTimeout(init, 500));
    if (loaded) $(window).trigger('load');

    $('#title .login form').each(function(){
        let method = $(this).attr('method')
        let url    = $(this).attr('action');
        fetch(url, { method: method, redirect: 'manual' }).then(res =>{
            if (res.status == 404) hide($(this));
        });
    });
});
$(window).on('load', ()=> loaded = true);

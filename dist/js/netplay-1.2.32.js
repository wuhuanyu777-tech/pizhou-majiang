/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/conf/rule.json"
/*!*******************************!*\
  !*** ./src/js/conf/rule.json ***!
  \*******************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"Mリーグルール":{"配給原点":25000,"順位点":["+30.0","+10.0","-10.0","-30.0"],"赤牌":{"m":1,"p":1,"s":1},"連風牌は2符":true,"クイタンあり":true,"喰い替え許可レベル":0,"場数":2,"途中流局あり":false,"流し満貫あり":false,"ノーテン宣言あり":true,"ノーテン罰あり":true,"最大同時和了数":1,"連荘方式":2,"トビ終了あり":false,"オーラス止めあり":false,"延長戦方式":0,"一発あり":true,"裏ドラあり":true,"カンドラあり":true,"カン裏あり":true,"カンドラ後乗せ":false,"ツモ番なしリーチあり":true,"リーチ後暗槓許可レベル":1,"ダブル役満あり":false,"役満の複合あり":true,"数え役満あり":false,"役満パオあり":true,"切り上げ満貫あり":true},"Classicルール":{"配給原点":30000,"順位点":["+12.0","+4.0","-4.0","-12.0"],"赤牌":{"m":0,"p":0,"s":0},"連風牌は2符":false,"クイタンあり":true,"喰い替え許可レベル":2,"場数":2,"途中流局あり":false,"流し満貫あり":false,"ノーテン宣言あり":false,"ノーテン罰あり":false,"最大同時和了数":1,"連荘方式":1,"トビ終了あり":false,"オーラス止めあり":false,"延長戦方式":0,"一発あり":false,"裏ドラあり":false,"カンドラあり":false,"カン裏あり":false,"カンドラ後乗せ":false,"ツモ番なしリーチあり":true,"リーチ後暗槓許可レベル":0,"ダブル役満あり":false,"役満の複合あり":false,"数え役満あり":false,"役満パオあり":false,"切り上げ満貫あり":false}}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./src/js/netplay.js ***!
  \***************************/
/*!
 *  電脳麻将: ネット対戦 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { hide, show, fadeIn, scale,
        setSelector, clearSelector  } = Majiang.UI.Util;

const preset = __webpack_require__(/*! ./conf/rule.json */ "./src/js/conf/rule.json");

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
        // 服务器以 -b / 启动（docroot=../dist），socket.io 挂在根路径
        sock = io('/', { path: '/socket.io/' });
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLG9DQUFvQztBQUN6RDtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvbmV0cGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvKiFcclxuICogIOmbu+iEs+m6u+Wwhjog44ON44OD44OI5a++5oimIHYxLjAuMFxyXG4gKlxyXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcclxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSxcclxuICAgICAgICBzZXRTZWxlY3RvciwgY2xlYXJTZWxlY3RvciAgfSA9IE1hamlhbmcuVUkuVXRpbDtcclxuXHJcbmNvbnN0IHByZXNldCA9IHJlcXVpcmUoJy4vY29uZi9ydWxlLmpzb24nKTtcclxuXHJcbmNvbnN0IGJhc2UgPSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qPyQvLCcnKTtcclxuXHJcbmxldCBsb2FkZWQ7XHJcblxyXG4vLyDosIPor5XpnaLmnb/vvJpVUkwg5bimID9kZWJ1ZyDml7bmmL7npLrvvIjkuLTml7bor4rmlq3nlKjvvIlcclxuY29uc3QgREVCVUcgPSAhISBsb2NhdGlvbi5zZWFyY2gubWF0Y2goL2RlYnVnLyk7XHJcbmZ1bmN0aW9uIGRiZyhtc2cpIHtcclxuICAgIGlmICghIERFQlVHKSByZXR1cm47XHJcbiAgICBsZXQgZWwgPSAkKCcjZGVidWctbG9nJyk7XHJcbiAgICBpZiAoISBlbC5sZW5ndGgpIHtcclxuICAgICAgICBlbCA9ICQoJzxkaXYgaWQ9XCJkZWJ1Zy1sb2dcIj4nKS5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJywgYm90dG9tOiAwLCBsZWZ0OiAwLCB6SW5kZXg6IDk5OTk5LFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgwLDAsMCwwLjg4KScsIGNvbG9yOiAnIzBmMCcsIGZvbnRTaXplOiAxMixcclxuICAgICAgICAgICAgcGFkZGluZzogJzZweCAxMHB4JywgbWF4SGVpZ2h0OiAnNDAlJywgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICAgICAgbWF4V2lkdGg6ICcxMDAlJywgZm9udEZhbWlseTogJ21vbm9zcGFjZScsIHRleHRBbGlnbjogJ2xlZnQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChlbCk7XHJcbiAgICB9XHJcbiAgICBlbC5hcHBlbmQoJCgnPGRpdj4nKS50ZXh0KCdbJyArIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCkgKyAnXSAnICsgbXNnKSk7XHJcbiAgICBlbC5zY3JvbGxUb3AoZWxbMF0uc2Nyb2xsSGVpZ2h0KTtcclxufVxyXG5cclxuJChmdW5jdGlvbigpe1xyXG4gICAgZGJnKCduZXRwbGF5LmpzIOWKoOi9ve+8jGRlYnVnIOaooeW8j+W8gOWQrycpO1xyXG4gICAgY29uc3QgcGFpICAgPSBNYWppYW5nLlVJLnBhaSgkKCcjbG9hZGRhdGEnKSk7XHJcbiAgICBjb25zdCBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJCgnI2xvYWRkYXRhJykpO1xyXG5cclxuICAgIGNvbnN0IGFuYWx5emVyID0gKGthaWp1KT0+e1xyXG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYW5hbHl6ZXInKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2JvYXJkID4gLmFuYWx5emVyJyksIGthaWp1LCBwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKT0+JCgnYm9keScpLnJlbW92ZUNsYXNzKCdhbmFseXplcicpKTtcclxuICAgIH07XHJcbiAgICBjb25zdCB2aWV3ZXIgPSAocGFpcHUpPT57XHJcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcclxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xyXG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBzdGF0ID0gKHBhaXB1X2xpc3QpPT57XHJcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3N0YXQnKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1U3RhdCgkKCcjc3RhdCcpLCBwYWlwdV9saXN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoJCgnI2ZpbGUnKSwgJ01hamlhbmcubmV0cGxheScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0KTtcclxuICAgIGxldCBzb2NrLCBteXVpZDtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0KCkge1xyXG5cclxuICAgICAgICBkYmcoJ2luaXQoKTog6L+e5o6lIHNvY2tldC5pby4uLicpO1xyXG4gICAgICAgIC8vIOacjeWKoeWZqOS7pSAtYiAvIOWQr+WKqO+8iGRvY3Jvb3Q9Li4vZGlzdO+8ie+8jHNvY2tldC5pbyDmjILlnKjmoLnot6/lvoRcclxuICAgICAgICBzb2NrID0gaW8oJy8nLCB7IHBhdGg6ICcvc29ja2V0LmlvLycgfSk7XHJcbiAgICAgICAgc29jay5vbignY29ubmVjdCcsICgpPT4gZGJnKCdzb2NrZXQgY29ubmVjdGVkJykpO1xyXG4gICAgICAgIHNvY2sub24oJ0hFTExPJywgaGVsbG8pO1xyXG4gICAgICAgIHNvY2sub24oJ1JPT00nLCByb29tKTtcclxuICAgICAgICBzb2NrLm9uKCdTVEFSVCcsIHN0YXJ0KTtcclxuICAgICAgICBzb2NrLm9uKCdFTkQnLCBlbmQpO1xyXG4gICAgICAgIHNvY2sub24oJ0VSUk9SJywgZmlsZS5lcnJvcik7XHJcbiAgICAgICAgc29jay5vbignZGlzY29ubmVjdCcsICgpPT57XHJcbiAgICAgICAgICAgIGRiZygnc29ja2V0IOaWreW8gCEnKTtcclxuICAgICAgICAgICAgaGlkZSgkKCcjZmlsZSAubmV0cGxheSBmb3JtLnJvb20nKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGhpZGUoJCgnI3RpdGxlIC5sb2FkaW5nJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhlbGxvKHVzZXIpIHtcclxuICAgICAgICBkYmcoJ0hFTExPOiAnICsgKHVzZXIgPyAoJ+W3sueZu+W9lSAnICsgdXNlci5uYW1lKSA6ICfmnKrnmbvlvZUnKSk7XHJcbiAgICAgICAgaWYgKCEgdXNlcikge1xyXG4gICAgICAgICAgICAvLyDlhY3nmbvlvZXvvJroh6rliqjnlJ/miJDpmo/mnLrnjqnlrrblkI3lubbnmbvlvZXvvJvpmLLlvqrnjq/vvJozIOenkuWGhemHjeWkjeinpuWPkeWImei9rOaJi+WKqFxyXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gK2xvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLmF1dG9Mb2dpbi50Jyk7XHJcbiAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdCA8IDMwMDApIHtcclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3RpdGxlJyk7XHJcbiAgICAgICAgICAgICAgICBzaG93KCQoJyN0aXRsZSAubG9naW4nKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ01hamlhbmcuYXV0b0xvZ2luLnQnLCBEYXRlLm5vdygpKTtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9ICfnjqnlrrYnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOTAwMCArIDEwMDApO1xyXG4gICAgICAgICAgICBmZXRjaCgnc2VydmVyL2F1dGgvJywge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyB9LFxyXG4gICAgICAgICAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyh7IG5hbWUsIHBhc3N3ZDogJyonIH0pLFxyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3Q6ICdtYW51YWwnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gMzAyIOmHjeWumuWQkSA9IOeZu+W9leaIkOWKn++8m+WQpuWImeaYvuekuueZu+W9leihqOWNleWFnOW6lVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy50eXBlID09ICdvcGFxdWVyZWRpcmVjdCcgfHwgcmVzLnN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGZhbGxiYWNrX2xvZ2luKCk7XHJcbiAgICAgICAgICAgIH0pLmNhdGNoKCgpPT4gZmFsbGJhY2tfbG9naW4oKSk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZhbGxiYWNrX2xvZ2luKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywndGl0bGUnKTtcclxuICAgICAgICAgICAgICAgIHNob3coJCgnI3RpdGxlIC5sb2dpbicpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG15dWlkID0gdXNlci51aWQ7XHJcbiAgICAgICAgc2hvdygkKCcjZmlsZSAubmV0cGxheSBmb3JtJykpO1xyXG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xyXG4gICAgICAgIGlmICh1c2VyLmljb24pXHJcbiAgICAgICAgICAgICQoJyNmaWxlIC5uZXRwbGF5IGltZycpLmF0dHIoJ3NyYycsIHVzZXIuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndGl0bGUnLCB1c2VyLnVpZCk7XHJcbiAgICAgICAgJCgnI2ZpbGUgLm5ldHBsYXkgLm5hbWUnKS50ZXh0KHVzZXIubmFtZSk7XHJcbiAgICAgICAgZmlsZS5yZWRyYXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByb29tKG1zZykge1xyXG4gICAgICAgIGRiZygnUk9PTSDmlLbliLA6ICcgKyBtc2cucm9vbV9ubyArICcg5Lq65pWwPScgKyBtc2cudXNlci5sZW5ndGhcclxuICAgICAgICAgICAgKyAnIOaIkeaYr+aIv+S4uz0nICsgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCkpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIOa4suafk1wi5q2j5bi45omT6bq75bCG55qE5a6M5pW055S76Z2iXCLvvIjorqHliIbmnb8v54mM5rKzL+W6p+S9jemDveWcqO+8jOWPquaYr+S4jeWPkeeJjO+8iVxyXG4gICAgICAgICAgICBpZiAoISB0aGlzLl92aWV3KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3ID0gbmV3IE1hamlhbmcuVUkuUGxheWVyKCQoJyNib2FyZCcpLCBwYWksIGF1ZGlvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXcudmlldyA9IG5ldyBNYWppYW5nLlVJLkJvYXJkKCQoJyNib2FyZCAuYm9hcmQnKSwgcGFpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpbywgdGhpcy5fdmlldy5tb2RlbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3Ll92aWV3Lm5vX3BsYXllcl9uYW1lID0gZmFsc2U7ICAgLy8g562J5b6F5pe25pi+56S6546p5a625ZCNXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuX3ZpZXc7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lc1tpXSA9IG1zZy51c2VyW2ldID8gbXNnLnVzZXJbaV0ubmFtZSA6ICfnrYnlvoXliqDlhaXigKYnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOaooeaLn+WvueWxgOWIneWni+eKtuaAge+8mjQg5a625bCx5bqn44CB5peg5omL54mM77yI5LiN5Y+R54mM77yJXHJcbiAgICAgICAgICAgIHYubW9kZWwua2FpanUoeyB0aXRsZTogJ+e9kee7nOWvueaImCcsIHBsYXllcjogbmFtZXMsIHFpamlhOiAwIH0pO1xyXG4gICAgICAgICAgICB2Lm1vZGVsLnFpcGFpKHtcclxuICAgICAgICAgICAgICAgIHpodWFuZ2Zlbmc6IDAsIGp1c2h1OiAwLCBjaGFuZ2Jhbmc6IDAsIGxpemhpYmFuZzogMCxcclxuICAgICAgICAgICAgICAgIGRlZmVuOiBbMCwgMCwgMCwgMF0sIHNob3VwYWk6IFsnJywgJycsICcnLCAnJ10sIGJhb3BhaTogJydcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIOWFiOiuviBib2R5IGNsYXNz77yM5YaNIHJlZHJhd+KAlOKAlOiuqSBDU1MgLnNob3VwYWl7ZGlzcGxheTpub25lfSDlnKjmuLLmn5Pml7bnlJ/mlYhcclxuICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQgd2FpdGluZycpO1xyXG4gICAgICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xyXG4gICAgICAgICAgICB2Ll92aWV3LnJlZHJhdygpO1xyXG4gICAgICAgICAgICAvLyDlvLrliLbpmpDol4/miYvniYzlkozmk43kvZzmjInpkq7vvIjkuI3kvp3otZYgQ1NT77ybLnNob3VwYWkgZGlzcGxheTp0YWJsZSDmnaXoh6ogbWl4aW7vvIxDU1Mg5LyY5YWI57qn5LiN5Y+v6Z2g77yJXHJcbiAgICAgICAgICAgIGhpZGUoJCgnI2JvYXJkIC5zaG91cGFpJykpO1xyXG4gICAgICAgICAgICBoaWRlKCQoJyNib2FyZCAucGxheWVyLWJ1dHRvbicpKTtcclxuICAgICAgICAgICAgaGlkZSgkKCcjYm9hcmQgLnNlbGVjdC1taWFuemknKSk7XHJcbiAgICAgICAgICAgIC8vIOmhtumDqOWwj+a1ruWxgu+8muaIv+mXtOWPtyArIOS6uuaVsOeKtuaAgSArIOmAgOWHulxyXG4gICAgICAgICAgICAkKCcjcm9vbSBpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScpLnZhbChtc2cucm9vbV9ubyk7XHJcbiAgICAgICAgICAgICQoJyNyb29tIC5yb29tLXN0YXR1cycpLnRleHQobXNnLnVzZXIubGVuZ3RoID49IDRcclxuICAgICAgICAgICAgICAgID8gJ+eOqeWutuW3sua7oSA0IOS6uu+8jOWNs+WwhuW8gOWxgOKApidcclxuICAgICAgICAgICAgICAgIDogYOetieW+heWFtuS7lueOqeWutuWKoOWFpeKApu+8iCR7bXNnLnVzZXIubGVuZ3RofS8077yJYCk7XHJcbiAgICAgICAgICAgICQoJyNyb29tIGlucHV0W25hbWU9XCJxdWl0XCJdJykub2ZmKCdjbGljaycpLm9uKCdjbGljaycsICgpPT4ge1xyXG4gICAgICAgICAgICAgICAgc29jay5lbWl0KCdST09NJywgbXNnLnJvb21fbm8sIG15dWlkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHNob3coJCgnI3Jvb20nKSk7XHJcbiAgICAgICAgICAgIC8vIOa7oSA0IOS6uu+8mumakOiXj+a1ruWxgu+8jOaIv+S4u+iHquWKqOW8gOWxgFxyXG4gICAgICAgICAgICBpZiAobXNnLnVzZXIubGVuZ3RoID49IDQpIHtcclxuICAgICAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20nKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobXNnLnVzZXJbMF0udWlkID09IG15dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcnVsZSA9IE1hamlhbmcucnVsZSh7fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdTVEFSVCcsIG1zZy5yb29tX25vLCBydWxlLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tuZXRwbGF5XSByb29tKCkg6ZSZ6K+vOicsIGUpO1xyXG4gICAgICAgICAgICBkYmcoJ3Jvb20oKSDplJnor686ICcgKyBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBhbGVydCgn6L+b5YWl5oi/6Ze05aSx6LSlOiAnICsgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgICAgICAgZGJnKCdTVEFSVCDmlLbliLDvvIzliJ3lp4vljJblr7nlsYAuLi4nKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBoaWRlKCQoJyNyb29tJykpOyAgIC8vIOW8gOWxgOaXtumakOiXj+etieW+heWNoVxyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgTWFqaWFuZy5VSS5QbGF5ZXIoJCgnI2JvYXJkJyksIHBhaSwgYXVkaW8pO1xyXG4gICAgICAgICAgICBwbGF5ZXIudmlldyAgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksIHBhaSwgYXVkaW8sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIubW9kZWwpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2FtZUN0bCA9IG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCwgcGxheWVyLCBwbGF5ZXIuX3ZpZXcpO1xyXG4gICAgICAgICAgICBnYW1lQ3RsLl92aWV3Lm5vX3BsYXllcl9uYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHBsYXllci5fdmlldy5ub19wbGF5ZXJfbmFtZSAgID0gZmFsc2U7ICAgLy8g6IGU572R5a+55bGA5pi+56S6546p5a625ZCN77yIY29yZSBQbGF5ZXIg5Y+q5pyJIHZpZXcgc2V0dGVy77yM6ZyA55SoIF92aWV377yJXHJcblxyXG4gICAgICAgICAgICBsZXQgcGxheWVycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykucmVtb3ZlQ2xhc3MoJ3BhaXB1JylcclxuICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcclxuICAgICAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcclxuICAgICAgICAgICAgbGV0IHNlcSA9IDA7XHJcbiAgICAgICAgICAgIHNvY2sucmVtb3ZlQWxsTGlzdGVuZXJzKCdHQU1FJyk7XHJcbiAgICAgICAgICAgIHNvY2sub24oJ0dBTUUnLCAobXNnKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKG1zZy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVycyA9IG1zZy5wbGF5ZXJzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobXNnLnNheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5fdmlldy5zYXkobXNnLnNheS5uYW1lLCBtc2cuc2F5LmwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobXNnLnNlcSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXEgJiYgbXNnLnNlcSAhPSBzZXEpIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24obXNnLCAocmVwbHkgPSB7fSk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHkuc2VxID0gbXNnLnNlcTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdHQU1FJywgcmVwbHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEgPSBtc2cuc2VxICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24obXNnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobXNnLmthaWp1ICYmIG1zZy5rYWlqdS5sb2cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvZyA9IG1zZy5rYWlqdS5sb2cucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGRhdGEgb2YgbG9nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcGxheWVyLl92aWV3LnBsYXllcnMocGxheWVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tuZXRwbGF5XSBzdGFydCgpIOmUmeivrzonLCBlKTtcclxuICAgICAgICAgICAgYWxlcnQoJ+WvueWxgOWIneWni+WMluWksei0pTogJyArIGUubWVzc2FnZSArICdcXG4nICsgZS5zdGFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuZChwYWlwdSkge1xyXG4gICAgICAgIHNvY2sucmVtb3ZlQWxsTGlzdGVuZXJzKCdHQU1FJyk7XHJcbiAgICAgICAgaWYgKHBhaXB1KSBmaWxlLmFkZChwYWlwdSwgMTApO1xyXG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xyXG4gICAgICAgIGZpbGUucmVkcmF3KCk7XHJcbiAgICAgICAgJCgnI2ZpbGUgaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nKS52YWwoJycpO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwcmVzZXQpKSB7XHJcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JykudmFsKGtleSkudGV4dChrZXkpKTtcclxuICAgIH1cclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJykpIHtcclxuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWwoJy0nKS50ZXh0KCfjgqvjgrnjgr/jg6Djg6vjg7zjg6snKSk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnI2ZpbGUgZm9ybS5yb29tJykub24oJ3N1Ym1pdCcsIChldik9PntcclxuICAgICAgICBsZXQgcm9vbSA9ICQoJ2lucHV0W25hbWU9XCJyb29tX25vXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcclxuICAgICAgICBzb2NrLmVtaXQoJ1JPT00nLCByb29tKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgICQoJyNyb29tIGZvcm0nKS5vbignc3VibWl0JywgKGV2KT0+e1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCByb29tID0gJCgnaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHJ1bGUgPSAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xyXG4gICAgICAgICAgICBydWxlID0gISBydWxlICAgICAgPyB7fVxyXG4gICAgICAgICAgICAgICAgIDogcnVsZSA9PSAnLScgPyBKU09OLnBhcnNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJyl8fCd7fScpXHJcbiAgICAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgIHByZXNldFtydWxlXTtcclxuICAgICAgICAgICAgcnVsZSA9IE1hamlhbmcucnVsZShydWxlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0aW1lciA9ICQoJ2lucHV0W25hbWU9XCJ0aW1lclwiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XHJcbiAgICAgICAgICAgIHRpbWVyID0gdGltZXIubWF0Y2goLyhcXGQrKS9nKTtcclxuICAgICAgICAgICAgaWYgKHRpbWVyKSB0aW1lciA9IHRpbWVyLm1hcCh0PT4rdCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW25ldHBsYXldIFNUQVJUIGVtaXQsIHJvb209Jywgcm9vbSwgJ3J1bGUga2V5cz0nLCBPYmplY3Qua2V5cyhydWxlKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICBzb2NrLmVtaXQoJ1NUQVJUJywgcm9vbSwgcnVsZSwgdGltZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tuZXRwbGF5XSBTVEFSVCBlcnJvcjonLCBlKTtcclxuICAgICAgICAgICAgYWxlcnQoJ+W8gOWni+WvueWxgOWHuumUmTogJyArIGUubWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xyXG5cclxuICAgICQod2luZG93KS5vbignbG9hZCcsICgpPT5zZXRUaW1lb3V0KGluaXQsIDUwMCkpO1xyXG4gICAgaWYgKGxvYWRlZCkgJCh3aW5kb3cpLnRyaWdnZXIoJ2xvYWQnKTtcclxuXHJcbiAgICAkKCcjdGl0bGUgLmxvZ2luIGZvcm0nKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IG1ldGhvZCA9ICQodGhpcykuYXR0cignbWV0aG9kJylcclxuICAgICAgICBsZXQgdXJsICAgID0gJCh0aGlzKS5hdHRyKCdhY3Rpb24nKTtcclxuICAgICAgICBmZXRjaCh1cmwsIHsgbWV0aG9kOiBtZXRob2QsIHJlZGlyZWN0OiAnbWFudWFsJyB9KS50aGVuKHJlcyA9PntcclxuICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gNDA0KSBoaWRlKCQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+IGxvYWRlZCA9IHRydWUpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
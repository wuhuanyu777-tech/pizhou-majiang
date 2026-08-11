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
            fetch('auth/', {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLG9DQUFvQztBQUN6RDtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvbmV0cGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvKiFcclxuICogIOmbu+iEs+m6u+Wwhjog44ON44OD44OI5a++5oimIHYxLjAuMFxyXG4gKlxyXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcclxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSxcclxuICAgICAgICBzZXRTZWxlY3RvciwgY2xlYXJTZWxlY3RvciAgfSA9IE1hamlhbmcuVUkuVXRpbDtcclxuXHJcbmNvbnN0IHByZXNldCA9IHJlcXVpcmUoJy4vY29uZi9ydWxlLmpzb24nKTtcclxuXHJcbmNvbnN0IGJhc2UgPSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qPyQvLCcnKTtcclxuXHJcbmxldCBsb2FkZWQ7XHJcblxyXG4vLyDosIPor5XpnaLmnb/vvJpVUkwg5bimID9kZWJ1ZyDml7bmmL7npLrvvIjkuLTml7bor4rmlq3nlKjvvIlcclxuY29uc3QgREVCVUcgPSAhISBsb2NhdGlvbi5zZWFyY2gubWF0Y2goL2RlYnVnLyk7XHJcbmZ1bmN0aW9uIGRiZyhtc2cpIHtcclxuICAgIGlmICghIERFQlVHKSByZXR1cm47XHJcbiAgICBsZXQgZWwgPSAkKCcjZGVidWctbG9nJyk7XHJcbiAgICBpZiAoISBlbC5sZW5ndGgpIHtcclxuICAgICAgICBlbCA9ICQoJzxkaXYgaWQ9XCJkZWJ1Zy1sb2dcIj4nKS5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJywgYm90dG9tOiAwLCBsZWZ0OiAwLCB6SW5kZXg6IDk5OTk5LFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgwLDAsMCwwLjg4KScsIGNvbG9yOiAnIzBmMCcsIGZvbnRTaXplOiAxMixcclxuICAgICAgICAgICAgcGFkZGluZzogJzZweCAxMHB4JywgbWF4SGVpZ2h0OiAnNDAlJywgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICAgICAgbWF4V2lkdGg6ICcxMDAlJywgZm9udEZhbWlseTogJ21vbm9zcGFjZScsIHRleHRBbGlnbjogJ2xlZnQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChlbCk7XHJcbiAgICB9XHJcbiAgICBlbC5hcHBlbmQoJCgnPGRpdj4nKS50ZXh0KCdbJyArIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCkgKyAnXSAnICsgbXNnKSk7XHJcbiAgICBlbC5zY3JvbGxUb3AoZWxbMF0uc2Nyb2xsSGVpZ2h0KTtcclxufVxyXG5cclxuJChmdW5jdGlvbigpe1xyXG4gICAgZGJnKCduZXRwbGF5LmpzIOWKoOi9ve+8jGRlYnVnIOaooeW8j+W8gOWQrycpO1xyXG4gICAgY29uc3QgcGFpICAgPSBNYWppYW5nLlVJLnBhaSgkKCcjbG9hZGRhdGEnKSk7XHJcbiAgICBjb25zdCBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJCgnI2xvYWRkYXRhJykpO1xyXG5cclxuICAgIGNvbnN0IGFuYWx5emVyID0gKGthaWp1KT0+e1xyXG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYW5hbHl6ZXInKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2JvYXJkID4gLmFuYWx5emVyJyksIGthaWp1LCBwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKT0+JCgnYm9keScpLnJlbW92ZUNsYXNzKCdhbmFseXplcicpKTtcclxuICAgIH07XHJcbiAgICBjb25zdCB2aWV3ZXIgPSAocGFpcHUpPT57XHJcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcclxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xyXG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBzdGF0ID0gKHBhaXB1X2xpc3QpPT57XHJcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3N0YXQnKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1U3RhdCgkKCcjc3RhdCcpLCBwYWlwdV9saXN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoJCgnI2ZpbGUnKSwgJ01hamlhbmcubmV0cGxheScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0KTtcclxuICAgIGxldCBzb2NrLCBteXVpZDtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0KCkge1xyXG5cclxuICAgICAgICBkYmcoJ2luaXQoKTog6L+e5o6lIHNvY2tldC5pby4uLicpO1xyXG4gICAgICAgIC8vIOacjeWKoeWZqOS7pSAtYiAvIOWQr+WKqO+8iGRvY3Jvb3Q9Li4vZGlzdO+8ie+8jHNvY2tldC5pbyDmjILlnKjmoLnot6/lvoRcclxuICAgICAgICBzb2NrID0gaW8oJy8nLCB7IHBhdGg6ICcvc29ja2V0LmlvLycgfSk7XHJcbiAgICAgICAgc29jay5vbignY29ubmVjdCcsICgpPT4gZGJnKCdzb2NrZXQgY29ubmVjdGVkJykpO1xyXG4gICAgICAgIHNvY2sub24oJ0hFTExPJywgaGVsbG8pO1xyXG4gICAgICAgIHNvY2sub24oJ1JPT00nLCByb29tKTtcclxuICAgICAgICBzb2NrLm9uKCdTVEFSVCcsIHN0YXJ0KTtcclxuICAgICAgICBzb2NrLm9uKCdFTkQnLCBlbmQpO1xyXG4gICAgICAgIHNvY2sub24oJ0VSUk9SJywgZmlsZS5lcnJvcik7XHJcbiAgICAgICAgc29jay5vbignZGlzY29ubmVjdCcsICgpPT57XHJcbiAgICAgICAgICAgIGRiZygnc29ja2V0IOaWreW8gCEnKTtcclxuICAgICAgICAgICAgaGlkZSgkKCcjZmlsZSAubmV0cGxheSBmb3JtLnJvb20nKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGhpZGUoJCgnI3RpdGxlIC5sb2FkaW5nJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhlbGxvKHVzZXIpIHtcclxuICAgICAgICBkYmcoJ0hFTExPOiAnICsgKHVzZXIgPyAoJ+W3sueZu+W9lSAnICsgdXNlci5uYW1lKSA6ICfmnKrnmbvlvZUnKSk7XHJcbiAgICAgICAgaWYgKCEgdXNlcikge1xyXG4gICAgICAgICAgICAvLyDlhY3nmbvlvZXvvJroh6rliqjnlJ/miJDpmo/mnLrnjqnlrrblkI3lubbnmbvlvZXvvJvpmLLlvqrnjq/vvJozIOenkuWGhemHjeWkjeinpuWPkeWImei9rOaJi+WKqFxyXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gK2xvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLmF1dG9Mb2dpbi50Jyk7XHJcbiAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdCA8IDMwMDApIHtcclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3RpdGxlJyk7XHJcbiAgICAgICAgICAgICAgICBzaG93KCQoJyN0aXRsZSAubG9naW4nKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ01hamlhbmcuYXV0b0xvZ2luLnQnLCBEYXRlLm5vdygpKTtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9ICfnjqnlrrYnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOTAwMCArIDEwMDApO1xyXG4gICAgICAgICAgICBmZXRjaCgnYXV0aC8nLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKHsgbmFtZSwgcGFzc3dkOiAnKicgfSksXHJcbiAgICAgICAgICAgICAgICByZWRpcmVjdDogJ21hbnVhbCdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyAzMDIg6YeN5a6a5ZCRID0g55m75b2V5oiQ5Yqf77yb5ZCm5YiZ5pi+56S655m75b2V6KGo5Y2V5YWc5bqVXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLnR5cGUgPT0gJ29wYXF1ZXJlZGlyZWN0JyB8fCByZXMuc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgZmFsbGJhY2tfbG9naW4oKTtcclxuICAgICAgICAgICAgfSkuY2F0Y2goKCk9PiBmYWxsYmFja19sb2dpbigpKTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gZmFsbGJhY2tfbG9naW4oKSB7XHJcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCd0aXRsZScpO1xyXG4gICAgICAgICAgICAgICAgc2hvdygkKCcjdGl0bGUgLmxvZ2luJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbXl1aWQgPSB1c2VyLnVpZDtcclxuICAgICAgICBzaG93KCQoJyNmaWxlIC5uZXRwbGF5IGZvcm0nKSk7XHJcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSk7XHJcbiAgICAgICAgaWYgKHVzZXIuaWNvbilcclxuICAgICAgICAgICAgJCgnI2ZpbGUgLm5ldHBsYXkgaW1nJykuYXR0cignc3JjJywgdXNlci5pY29uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0aXRsZScsIHVzZXIudWlkKTtcclxuICAgICAgICAkKCcjZmlsZSAubmV0cGxheSAubmFtZScpLnRleHQodXNlci5uYW1lKTtcclxuICAgICAgICBmaWxlLnJlZHJhdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJvb20obXNnKSB7XHJcbiAgICAgICAgZGJnKCdST09NIOaUtuWIsDogJyArIG1zZy5yb29tX25vICsgJyDkurrmlbA9JyArIG1zZy51c2VyLmxlbmd0aFxyXG4gICAgICAgICAgICArICcg5oiR5piv5oi/5Li7PScgKyAobXNnLnVzZXJbMF0udWlkID09IG15dWlkKSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8g5riy5p+TXCLmraPluLjmiZPpurvlsIbnmoTlrozmlbTnlLvpnaJcIu+8iOiuoeWIhuadvy/niYzmsrMv5bqn5L2N6YO95Zyo77yM5Y+q5piv5LiN5Y+R54mM77yJXHJcbiAgICAgICAgICAgIGlmICghIHRoaXMuX3ZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXcgPSBuZXcgTWFqaWFuZy5VSS5QbGF5ZXIoJCgnI2JvYXJkJyksIHBhaSwgYXVkaW8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlldy52aWV3ID0gbmV3IE1hamlhbmcuVUkuQm9hcmQoJCgnI2JvYXJkIC5ib2FyZCcpLCBwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLCB0aGlzLl92aWV3Lm1vZGVsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXcuX3ZpZXcubm9fcGxheWVyX25hbWUgPSBmYWxzZTsgICAvLyDnrYnlvoXml7bmmL7npLrnjqnlrrblkI1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5fdmlldztcclxuICAgICAgICAgICAgY29uc3QgbmFtZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWVzW2ldID0gbXNnLnVzZXJbaV0gPyBtc2cudXNlcltpXS5uYW1lIDogJ+etieW+heWKoOWFpeKApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5qih5ouf5a+55bGA5Yid5aeL54q25oCB77yaNCDlrrblsLHluqfjgIHml6DmiYvniYzvvIjkuI3lj5HniYzvvIlcclxuICAgICAgICAgICAgdi5tb2RlbC5rYWlqdSh7IHRpdGxlOiAn572R57uc5a+55oiYJywgcGxheWVyOiBuYW1lcywgcWlqaWE6IDAgfSk7XHJcbiAgICAgICAgICAgIHYubW9kZWwucWlwYWkoe1xyXG4gICAgICAgICAgICAgICAgemh1YW5nZmVuZzogMCwganVzaHU6IDAsIGNoYW5nYmFuZzogMCwgbGl6aGliYW5nOiAwLFxyXG4gICAgICAgICAgICAgICAgZGVmZW46IFswLCAwLCAwLCAwXSwgc2hvdXBhaTogWycnLCAnJywgJycsICcnXSwgYmFvcGFpOiAnJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8g5YWI6K6+IGJvZHkgY2xhc3PvvIzlho0gcmVkcmF34oCU4oCU6K6pIENTUyAuc2hvdXBhaXtkaXNwbGF5Om5vbmV9IOWcqOa4suafk+aXtueUn+aViFxyXG4gICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCB3YWl0aW5nJyk7XHJcbiAgICAgICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XHJcbiAgICAgICAgICAgIHYuX3ZpZXcucmVkcmF3KCk7XHJcbiAgICAgICAgICAgIC8vIOW8uuWItumakOiXj+aJi+eJjOWSjOaTjeS9nOaMiemSru+8iOS4jeS+nei1liBDU1PvvJsuc2hvdXBhaSBkaXNwbGF5OnRhYmxlIOadpeiHqiBtaXhpbu+8jENTUyDkvJjlhYjnuqfkuI3lj6/pnaDvvIlcclxuICAgICAgICAgICAgaGlkZSgkKCcjYm9hcmQgLnNob3VwYWknKSk7XHJcbiAgICAgICAgICAgIGhpZGUoJCgnI2JvYXJkIC5wbGF5ZXItYnV0dG9uJykpO1xyXG4gICAgICAgICAgICBoaWRlKCQoJyNib2FyZCAuc2VsZWN0LW1pYW56aScpKTtcclxuICAgICAgICAgICAgLy8g6aG26YOo5bCP5rWu5bGC77ya5oi/6Ze05Y+3ICsg5Lq65pWw54q25oCBICsg6YCA5Ye6XHJcbiAgICAgICAgICAgICQoJyNyb29tIGlucHV0W25hbWU9XCJyb29tX25vXCJdJykudmFsKG1zZy5yb29tX25vKTtcclxuICAgICAgICAgICAgJCgnI3Jvb20gLnJvb20tc3RhdHVzJykudGV4dChtc2cudXNlci5sZW5ndGggPj0gNFxyXG4gICAgICAgICAgICAgICAgPyAn546p5a625bey5ruhIDQg5Lq677yM5Y2z5bCG5byA5bGA4oCmJ1xyXG4gICAgICAgICAgICAgICAgOiBg562J5b6F5YW25LuW546p5a625Yqg5YWl4oCm77yIJHttc2cudXNlci5sZW5ndGh9LzTvvIlgKTtcclxuICAgICAgICAgICAgJCgnI3Jvb20gaW5wdXRbbmFtZT1cInF1aXRcIl0nKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgKCk9PiB7XHJcbiAgICAgICAgICAgICAgICBzb2NrLmVtaXQoJ1JPT00nLCBtc2cucm9vbV9ubywgbXl1aWQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2hvdygkKCcjcm9vbScpKTtcclxuICAgICAgICAgICAgLy8g5ruhIDQg5Lq677ya6ZqQ6JeP5rWu5bGC77yM5oi/5Li76Ieq5Yqo5byA5bGAXHJcbiAgICAgICAgICAgIGlmIChtc2cudXNlci5sZW5ndGggPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgkKCcjcm9vbScpKTtcclxuICAgICAgICAgICAgICAgIGlmIChtc2cudXNlclswXS51aWQgPT0gbXl1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBydWxlID0gTWFqaWFuZy5ydWxlKHt9KTtcclxuICAgICAgICAgICAgICAgICAgICBzb2NrLmVtaXQoJ1NUQVJUJywgbXNnLnJvb21fbm8sIHJ1bGUsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIHJvb20oKSDplJnor686JywgZSk7XHJcbiAgICAgICAgICAgIGRiZygncm9vbSgpIOmUmeivrzogJyArIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGFsZXJ0KCfov5vlhaXmiL/pl7TlpLHotKU6ICcgKyBlLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcclxuICAgICAgICBkYmcoJ1NUQVJUIOaUtuWIsO+8jOWIneWni+WMluWvueWxgC4uLicpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20nKSk7ICAgLy8g5byA5bGA5pe26ZqQ6JeP562J5b6F5Y2hXHJcbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG5ldyBNYWppYW5nLlVJLlBsYXllcigkKCcjYm9hcmQnKSwgcGFpLCBhdWRpbyk7XHJcbiAgICAgICAgICAgIHBsYXllci52aWV3ICA9IG5ldyBNYWppYW5nLlVJLkJvYXJkKCQoJyNib2FyZCAuYm9hcmQnKSwgcGFpLCBhdWRpbyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5tb2RlbCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBnYW1lQ3RsID0gbmV3IE1hamlhbmcuVUkuR2FtZUN0bCgkKCcjYm9hcmQnKSwgJ01hamlhbmcucHJlZicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLCBwbGF5ZXIsIHBsYXllci5fdmlldyk7XHJcbiAgICAgICAgICAgIGdhbWVDdGwuX3ZpZXcubm9fcGxheWVyX25hbWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGxheWVyLl92aWV3Lm5vX3BsYXllcl9uYW1lICAgPSBmYWxzZTsgICAvLyDogZTnvZHlr7nlsYDmmL7npLrnjqnlrrblkI3vvIhjb3JlIFBsYXllciDlj6rmnIkgdmlldyBzZXR0ZXLvvIzpnIDnlKggX3ZpZXfvvIlcclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXJzID0gW107XHJcblxyXG4gICAgICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5yZW1vdmVDbGFzcygncGFpcHUnKVxyXG4gICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xyXG4gICAgICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xyXG4gICAgICAgICAgICBsZXQgc2VxID0gMDtcclxuICAgICAgICAgICAgc29jay5yZW1vdmVBbGxMaXN0ZW5lcnMoJ0dBTUUnKTtcclxuICAgICAgICAgICAgc29jay5vbignR0FNRScsIChtc2cpPT57XHJcbiAgICAgICAgICAgICAgICBpZiAobXNnLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzID0gbXNnLnBsYXllcnM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2cuc2F5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLl92aWV3LnNheShtc2cuc2F5Lm5hbWUsIG1zZy5zYXkubCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2cuc2VxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcSAmJiBtc2cuc2VxICE9IHNlcSkgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbihtc2csIChyZXBseSA9IHt9KT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseS5zZXEgPSBtc2cuc2VxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrLmVtaXQoJ0dBTUUnLCByZXBseSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcSA9IG1zZy5zZXEgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbihtc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtc2cua2FpanUgJiYgbXNnLmthaWp1LmxvZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9nID0gbXNnLmthaWp1LmxvZy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZGF0YSBvZiBsb2cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24oZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuX3ZpZXcucGxheWVycyhwbGF5ZXJzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIHN0YXJ0KCkg6ZSZ6K+vOicsIGUpO1xyXG4gICAgICAgICAgICBhbGVydCgn5a+55bGA5Yid5aeL5YyW5aSx6LSlOiAnICsgZS5tZXNzYWdlICsgJ1xcbicgKyBlLnN0YWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5kKHBhaXB1KSB7XHJcbiAgICAgICAgc29jay5yZW1vdmVBbGxMaXN0ZW5lcnMoJ0dBTUUnKTtcclxuICAgICAgICBpZiAocGFpcHUpIGZpbGUuYWRkKHBhaXB1LCAxMCk7XHJcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSk7XHJcbiAgICAgICAgZmlsZS5yZWRyYXcoKTtcclxuICAgICAgICAkKCcjZmlsZSBpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScpLnZhbCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHByZXNldCkpIHtcclxuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKS52YWwoa2V5KS50ZXh0KGtleSkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKSkge1xyXG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCgnLScpLnRleHQoJ+OCq+OCueOCv+ODoOODq+ODvOODqycpKTtcclxuICAgIH1cclxuXHJcbiAgICAkKCcjZmlsZSBmb3JtLnJvb20nKS5vbignc3VibWl0JywgKGV2KT0+e1xyXG4gICAgICAgIGxldCByb29tID0gJCgnaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xyXG4gICAgICAgIHNvY2suZW1pdCgnUk9PTScsIHJvb20pO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgJCgnI3Jvb20gZm9ybScpLm9uKCdzdWJtaXQnLCAoZXYpPT57XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IHJvb20gPSAkKCdpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcnVsZSA9ICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XHJcbiAgICAgICAgICAgIHJ1bGUgPSAhIHJ1bGUgICAgICA/IHt9XHJcbiAgICAgICAgICAgICAgICAgOiBydWxlID09ICctJyA/IEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcclxuICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgcHJlc2V0W3J1bGVdO1xyXG4gICAgICAgICAgICBydWxlID0gTWFqaWFuZy5ydWxlKHJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRpbWVyID0gJCgnaW5wdXRbbmFtZT1cInRpbWVyXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcclxuICAgICAgICAgICAgdGltZXIgPSB0aW1lci5tYXRjaCgvKFxcZCspL2cpO1xyXG4gICAgICAgICAgICBpZiAodGltZXIpIHRpbWVyID0gdGltZXIubWFwKHQ9Pit0KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbbmV0cGxheV0gU1RBUlQgZW1pdCwgcm9vbT0nLCByb29tLCAncnVsZSBrZXlzPScsIE9iamVjdC5rZXlzKHJ1bGUpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHNvY2suZW1pdCgnU1RBUlQnLCByb29tLCBydWxlLCB0aW1lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIFNUQVJUIGVycm9yOicsIGUpO1xyXG4gICAgICAgICAgICBhbGVydCgn5byA5aeL5a+55bGA5Ye66ZSZOiAnICsgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKT0+c2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgKCk9PnNldFRpbWVvdXQoaW5pdCwgNTAwKSk7XHJcbiAgICBpZiAobG9hZGVkKSAkKHdpbmRvdykudHJpZ2dlcignbG9hZCcpO1xyXG5cclxuICAgICQoJyN0aXRsZSAubG9naW4gZm9ybScpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgbWV0aG9kID0gJCh0aGlzKS5hdHRyKCdtZXRob2QnKVxyXG4gICAgICAgIGxldCB1cmwgICAgPSAkKHRoaXMpLmF0dHIoJ2FjdGlvbicpO1xyXG4gICAgICAgIGZldGNoKHVybCwgeyBtZXRob2Q6IG1ldGhvZCwgcmVkaXJlY3Q6ICdtYW51YWwnIH0pLnRoZW4ocmVzID0+e1xyXG4gICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSA0MDQpIGhpZGUoJCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiQod2luZG93KS5vbignbG9hZCcsICgpPT4gbG9hZGVkID0gdHJ1ZSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
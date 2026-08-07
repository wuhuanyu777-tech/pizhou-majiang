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

$(function(){

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

        sock = io('/', { path: `${base}/server/socket.io/`});

        sock.on('HELLO', hello);
        sock.on('ROOM', room);
        sock.on('START', start);
        sock.on('END', end);
        sock.on('ERROR', file.error);
        sock.on('disconnect', ()=>hide($('#file .netplay form.room')));

        hide($('#title .loading'));
    }

    function hello(user) {
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

    let row, src;

    function room(msg) {
        if (! row) {
            row = $('#room .user').eq(0);
            src = $('img', row).attr('src');
        }
        // 建房/进房即进入牌桌画面（空牌桌，等满 4 人自动发牌开局）
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        $('#room input[name="room_no"]').val(msg.room_no);
        $('#room .room').empty();
        for (let user of msg.user) {
            let r = row.clone();
            if (user.icon) $('img', r).attr('src', user.icon)
                                      .attr('title', user.uid);
            else           $('img', r).attr('src', src);
            $('.name', r).text(user.name);
            if (msg.user[0].uid == myuid || user.uid == myuid )
                show($('input[name="quit"]', r).on('click', ()=> {
                        sock.emit('ROOM', msg.room_no, user.uid);
                        return false;
                    }));
            if (user.offline) r.addClass('offline');
            else              r.removeClass('offline');
            $('#room .room').append(r);
        }
        if (msg.user[0].uid == myuid) {
            $('#room .room-status').text(msg.user.length >= 4
                ? '玩家已满 4 人，即将开局…'
                : `等待其他玩家加入…（${msg.user.length}/4）`);
        }
        if (msg.user.length >= 4) {
            // 满 4 人：隐藏等待卡，房主自动开局
            hide($('#room'));
            if (msg.user[0].uid == myuid) {
                const rule = Majiang.rule({});
                sock.emit('START', msg.room_no, rule, null);
            }
        }
        else {
            show($('#room'));
            hide($('#room select[name="rule"]'));
            hide($('#room input[name="timer"]'));
            hide($('#room input[type="submit"]'));
        }
    }

    function start() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0cGxheS0xLjIuMTcuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7O0FBRWIsUUFBUTtBQUNSLHNDQUFzQzs7QUFFdEMsZUFBZSxtQkFBTyxDQUFDLGlEQUFrQjs7QUFFekM7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx5QkFBeUIsU0FBUyxLQUFLLG9CQUFvQjs7QUFFM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIscURBQXFEO0FBQ2hGLDRDQUE0QyxtQkFBbUI7QUFDL0Q7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsZ0JBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscURBQXFEOztBQUVyRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLG9DQUFvQztBQUN6RDtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvbmV0cGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvKiFcbiAqICDpm7vohLPpurvlsIY6IOODjeODg+ODiOWvvuaIpiB2MS4wLjBcbiAqXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqICBodHRwczovL2dpdGh1Yi5jb20va29iYWxhYi9NYWppYW5nL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSxcbiAgICAgICAgc2V0U2VsZWN0b3IsIGNsZWFyU2VsZWN0b3IgIH0gPSBNYWppYW5nLlVJLlV0aWw7XG5cbmNvbnN0IHByZXNldCA9IHJlcXVpcmUoJy4vY29uZi9ydWxlLmpzb24nKTtcblxuY29uc3QgYmFzZSA9IGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSo/JC8sJycpO1xuXG5sZXQgbG9hZGVkO1xuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcbiAgICBjb25zdCBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJCgnI2xvYWRkYXRhJykpO1xuXG4gICAgY29uc3QgYW5hbHl6ZXIgPSAoa2FpanUpPT57XG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYW5hbHl6ZXInKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLkFuYWx5emVyKCQoJyNib2FyZCA+IC5hbmFseXplcicpLCBrYWlqdSwgcGFpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpPT4kKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2FuYWx5emVyJykpO1xuICAgIH07XG4gICAgY29uc3Qgdmlld2VyID0gKHBhaXB1KT0+e1xuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5hZGRDbGFzcygncGFpcHUnKVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuUGFpcHUoXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk9PmZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIpO1xuICAgIH07XG4gICAgY29uc3Qgc3RhdCA9IChwYWlwdV9saXN0KT0+e1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnc3RhdCcpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1U3RhdCgkKCcjc3RhdCcpLCBwYWlwdV9saXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk9PmZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpKTtcbiAgICB9O1xuICAgIGNvbnN0IGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoJCgnI2ZpbGUnKSwgJ01hamlhbmcubmV0cGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdlciwgc3RhdCk7XG4gICAgbGV0IHNvY2ssIG15dWlkO1xuXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgICAgICBzb2NrID0gaW8oJy8nLCB7IHBhdGg6IGAke2Jhc2V9L3NlcnZlci9zb2NrZXQuaW8vYH0pO1xuXG4gICAgICAgIHNvY2sub24oJ0hFTExPJywgaGVsbG8pO1xuICAgICAgICBzb2NrLm9uKCdST09NJywgcm9vbSk7XG4gICAgICAgIHNvY2sub24oJ1NUQVJUJywgc3RhcnQpO1xuICAgICAgICBzb2NrLm9uKCdFTkQnLCBlbmQpO1xuICAgICAgICBzb2NrLm9uKCdFUlJPUicsIGZpbGUuZXJyb3IpO1xuICAgICAgICBzb2NrLm9uKCdkaXNjb25uZWN0JywgKCk9PmhpZGUoJCgnI2ZpbGUgLm5ldHBsYXkgZm9ybS5yb29tJykpKTtcblxuICAgICAgICBoaWRlKCQoJyN0aXRsZSAubG9hZGluZycpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoZWxsbyh1c2VyKSB7XG4gICAgICAgIGlmICghIHVzZXIpIHtcbiAgICAgICAgICAgIC8vIOWFjeeZu+W9le+8muiHquWKqOeUn+aIkOmaj+acuueOqeWutuWQjeW5tueZu+W9le+8m+mYsuW+queOr++8mjMg56eS5YaF6YeN5aSN6Kem5Y+R5YiZ6L2s5omL5YqoXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gK2xvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLmF1dG9Mb2dpbi50Jyk7XG4gICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3QgPCAzMDAwKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywndGl0bGUnKTtcbiAgICAgICAgICAgICAgICBzaG93KCQoJyN0aXRsZSAubG9naW4nKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ01hamlhbmcuYXV0b0xvZ2luLnQnLCBEYXRlLm5vdygpKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSAn546p5a62JyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDkwMDAgKyAxMDAwKTtcbiAgICAgICAgICAgIGZldGNoKCdzZXJ2ZXIvYXV0aC8nLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKHsgbmFtZSwgcGFzc3dkOiAnKicgfSksXG4gICAgICAgICAgICAgICAgcmVkaXJlY3Q6ICdtYW51YWwnXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+IHtcbiAgICAgICAgICAgICAgICAvLyAzMDIg6YeN5a6a5ZCRID0g55m75b2V5oiQ5Yqf77yb5ZCm5YiZ5pi+56S655m75b2V6KGo5Y2V5YWc5bqVXG4gICAgICAgICAgICAgICAgaWYgKHJlcy50eXBlID09ICdvcGFxdWVyZWRpcmVjdCcgfHwgcmVzLnN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgIGVsc2UgZmFsbGJhY2tfbG9naW4oKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKCgpPT4gZmFsbGJhY2tfbG9naW4oKSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBmYWxsYmFja19sb2dpbigpIHtcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCd0aXRsZScpO1xuICAgICAgICAgICAgICAgIHNob3coJCgnI3RpdGxlIC5sb2dpbicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBteXVpZCA9IHVzZXIudWlkO1xuICAgICAgICBzaG93KCQoJyNmaWxlIC5uZXRwbGF5IGZvcm0nKSk7XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xuICAgICAgICBpZiAodXNlci5pY29uKVxuICAgICAgICAgICAgJCgnI2ZpbGUgLm5ldHBsYXkgaW1nJykuYXR0cignc3JjJywgdXNlci5pY29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndGl0bGUnLCB1c2VyLnVpZCk7XG4gICAgICAgICQoJyNmaWxlIC5uZXRwbGF5IC5uYW1lJykudGV4dCh1c2VyLm5hbWUpO1xuICAgICAgICBmaWxlLnJlZHJhdygpO1xuICAgIH1cblxuICAgIGxldCByb3csIHNyYztcblxuICAgIGZ1bmN0aW9uIHJvb20obXNnKSB7XG4gICAgICAgIGlmICghIHJvdykge1xuICAgICAgICAgICAgcm93ID0gJCgnI3Jvb20gLnVzZXInKS5lcSgwKTtcbiAgICAgICAgICAgIHNyYyA9ICQoJ2ltZycsIHJvdykuYXR0cignc3JjJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5bu65oi/L+i/m+aIv+WNs+i/m+WFpeeJjOahjOeUu+mdou+8iOepuueJjOahjO+8jOetiea7oSA0IOS6uuiHquWKqOWPkeeJjOW8gOWxgO+8iVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuICAgICAgICAkKCcjcm9vbSBpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScpLnZhbChtc2cucm9vbV9ubyk7XG4gICAgICAgICQoJyNyb29tIC5yb29tJykuZW1wdHkoKTtcbiAgICAgICAgZm9yIChsZXQgdXNlciBvZiBtc2cudXNlcikge1xuICAgICAgICAgICAgbGV0IHIgPSByb3cuY2xvbmUoKTtcbiAgICAgICAgICAgIGlmICh1c2VyLmljb24pICQoJ2ltZycsIHIpLmF0dHIoJ3NyYycsIHVzZXIuaWNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RpdGxlJywgdXNlci51aWQpO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgJCgnaW1nJywgcikuYXR0cignc3JjJywgc3JjKTtcbiAgICAgICAgICAgICQoJy5uYW1lJywgcikudGV4dCh1c2VyLm5hbWUpO1xuICAgICAgICAgICAgaWYgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCB8fCB1c2VyLnVpZCA9PSBteXVpZCApXG4gICAgICAgICAgICAgICAgc2hvdygkKCdpbnB1dFtuYW1lPVwicXVpdFwiXScsIHIpLm9uKCdjbGljaycsICgpPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdST09NJywgbXNnLnJvb21fbm8sIHVzZXIudWlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaWYgKHVzZXIub2ZmbGluZSkgci5hZGRDbGFzcygnb2ZmbGluZScpO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgci5yZW1vdmVDbGFzcygnb2ZmbGluZScpO1xuICAgICAgICAgICAgJCgnI3Jvb20gLnJvb20nKS5hcHBlbmQocik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCkge1xuICAgICAgICAgICAgJCgnI3Jvb20gLnJvb20tc3RhdHVzJykudGV4dChtc2cudXNlci5sZW5ndGggPj0gNFxuICAgICAgICAgICAgICAgID8gJ+eOqeWutuW3sua7oSA0IOS6uu+8jOWNs+WwhuW8gOWxgOKApidcbiAgICAgICAgICAgICAgICA6IGDnrYnlvoXlhbbku5bnjqnlrrbliqDlhaXigKbvvIgke21zZy51c2VyLmxlbmd0aH0vNO+8iWApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtc2cudXNlci5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgLy8g5ruhIDQg5Lq677ya6ZqQ6JeP562J5b6F5Y2h77yM5oi/5Li76Ieq5Yqo5byA5bGAXG4gICAgICAgICAgICBoaWRlKCQoJyNyb29tJykpO1xuICAgICAgICAgICAgaWYgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBNYWppYW5nLnJ1bGUoe30pO1xuICAgICAgICAgICAgICAgIHNvY2suZW1pdCgnU1RBUlQnLCBtc2cucm9vbV9ubywgcnVsZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzaG93KCQoJyNyb29tJykpO1xuICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKSk7XG4gICAgICAgICAgICBoaWRlKCQoJyNyb29tIGlucHV0W25hbWU9XCJ0aW1lclwiXScpKTtcbiAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGlkZSgkKCcjcm9vbScpKTsgICAvLyDlvIDlsYDml7bpmpDol4/nrYnlvoXljaFcbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG5ldyBNYWppYW5nLlVJLlBsYXllcigkKCcjYm9hcmQnKSwgcGFpLCBhdWRpbyk7XG4gICAgICAgICAgICBwbGF5ZXIudmlldyAgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksIHBhaSwgYXVkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLm1vZGVsKTtcblxuICAgICAgICAgICAgY29uc3QgZ2FtZUN0bCA9IG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIHBsYXllciwgcGxheWVyLl92aWV3KTtcbiAgICAgICAgICAgIGdhbWVDdGwuX3ZpZXcubm9fcGxheWVyX25hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIHBsYXllci5fdmlldy5ub19wbGF5ZXJfbmFtZSAgID0gZmFsc2U7ICAgLy8g6IGU572R5a+55bGA5pi+56S6546p5a625ZCN77yIY29yZSBQbGF5ZXIg5Y+q5pyJIHZpZXcgc2V0dGVy77yM6ZyA55SoIF92aWV377yJXG5cbiAgICAgICAgICAgIGxldCBwbGF5ZXJzID0gW107XG5cbiAgICAgICAgICAgICQoJyNib2FyZCAuY29udHJvbGxlcicpLnJlbW92ZUNsYXNzKCdwYWlwdScpXG4gICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICAgICAgICAgIGxldCBzZXEgPSAwO1xuICAgICAgICAgICAgc29jay5yZW1vdmVBbGxMaXN0ZW5lcnMoJ0dBTUUnKTtcbiAgICAgICAgICAgIHNvY2sub24oJ0dBTUUnLCAobXNnKT0+e1xuICAgICAgICAgICAgICAgIGlmIChtc2cucGxheWVycykge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzID0gbXNnLnBsYXllcnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1zZy5zYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLl92aWV3LnNheShtc2cuc2F5Lm5hbWUsIG1zZy5zYXkubCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1zZy5zZXEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcSAmJiBtc2cuc2VxICE9IHNlcSkgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24obXNnLCAocmVwbHkgPSB7fSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5LnNlcSA9IG1zZy5zZXE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrLmVtaXQoJ0dBTUUnLCByZXBseSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEgPSBtc2cuc2VxICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtc2cua2FpanUgJiYgbXNnLmthaWp1LmxvZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvZyA9IG1zZy5rYWlqdS5sb2cucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBkYXRhIG9mIGxvZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGxheWVyLl92aWV3LnBsYXllcnMocGxheWVycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbbmV0cGxheV0gc3RhcnQoKSDplJnor686JywgZSk7XG4gICAgICAgICAgICBhbGVydCgn5a+55bGA5Yid5aeL5YyW5aSx6LSlOiAnICsgZS5tZXNzYWdlICsgJ1xcbicgKyBlLnN0YWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZChwYWlwdSkge1xuICAgICAgICBzb2NrLnJlbW92ZUFsbExpc3RlbmVycygnR0FNRScpO1xuICAgICAgICBpZiAocGFpcHUpIGZpbGUuYWRkKHBhaXB1LCAxMCk7XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xuICAgICAgICBmaWxlLnJlZHJhdygpO1xuICAgICAgICAkKCcjZmlsZSBpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScpLnZhbCgnJyk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHByZXNldCkpIHtcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JykudmFsKGtleSkudGV4dChrZXkpKTtcbiAgICB9XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKSkge1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsKCctJykudGV4dCgn44Kr44K544K/44Og44Or44O844OrJykpO1xuICAgIH1cblxuICAgICQoJyNmaWxlIGZvcm0ucm9vbScpLm9uKCdzdWJtaXQnLCAoZXYpPT57XG4gICAgICAgIGxldCByb29tID0gJCgnaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xuICAgICAgICBzb2NrLmVtaXQoJ1JPT00nLCByb29tKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJyNyb29tIGZvcm0nKS5vbignc3VibWl0JywgKGV2KT0+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHJvb20gPSAkKCdpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG5cbiAgICAgICAgICAgIGxldCBydWxlID0gJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcbiAgICAgICAgICAgIHJ1bGUgPSAhIHJ1bGUgICAgICA/IHt9XG4gICAgICAgICAgICAgICAgIDogcnVsZSA9PSAnLScgPyBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpfHwne30nKVxuICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgcHJlc2V0W3J1bGVdO1xuICAgICAgICAgICAgcnVsZSA9IE1hamlhbmcucnVsZShydWxlKTtcblxuICAgICAgICAgICAgbGV0IHRpbWVyID0gJCgnaW5wdXRbbmFtZT1cInRpbWVyXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcbiAgICAgICAgICAgIHRpbWVyID0gdGltZXIubWF0Y2goLyhcXGQrKS9nKTtcbiAgICAgICAgICAgIGlmICh0aW1lcikgdGltZXIgPSB0aW1lci5tYXAodD0+K3QpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW25ldHBsYXldIFNUQVJUIGVtaXQsIHJvb209Jywgcm9vbSwgJ3J1bGUga2V5cz0nLCBPYmplY3Qua2V5cyhydWxlKS5sZW5ndGgpO1xuICAgICAgICAgICAgc29jay5lbWl0KCdTVEFSVCcsIHJvb20sIHJ1bGUsIHRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbbmV0cGxheV0gU1RBUlQgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICBhbGVydCgn5byA5aeL5a+55bGA5Ye66ZSZOiAnICsgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpPT5zY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpKTtcblxuICAgICQod2luZG93KS5vbignbG9hZCcsICgpPT5zZXRUaW1lb3V0KGluaXQsIDUwMCkpO1xuICAgIGlmIChsb2FkZWQpICQod2luZG93KS50cmlnZ2VyKCdsb2FkJyk7XG5cbiAgICAkKCcjdGl0bGUgLmxvZ2luIGZvcm0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBtZXRob2QgPSAkKHRoaXMpLmF0dHIoJ21ldGhvZCcpXG4gICAgICAgIGxldCB1cmwgICAgPSAkKHRoaXMpLmF0dHIoJ2FjdGlvbicpO1xuICAgICAgICBmZXRjaCh1cmwsIHsgbWV0aG9kOiBtZXRob2QsIHJlZGlyZWN0OiAnbWFudWFsJyB9KS50aGVuKHJlcyA9PntcbiAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwNCkgaGlkZSgkKHRoaXMpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiQod2luZG93KS5vbignbG9hZCcsICgpPT4gbG9hZGVkID0gdHJ1ZSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
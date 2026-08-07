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
        $('body').attr('class','room');
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
                ? '玩家已满 4 人，可以开始对局'
                : `等待其他玩家加入…（${msg.user.length}/4）`);
            if (msg.user.length >= 4) {
                show($('#room select[name="rule"]'));
                show($('#room input[name="timer"]'));
                show($('#room input[type="submit"]'));
            }
            else {
                hide($('#room select[name="rule"]'));
                hide($('#room input[name="timer"]'));
                hide($('#room input[type="submit"]'));
            }
        }
        else {
            hide($('#room select[name="rule"]'));
            hide($('#room input[name="timer"]'));
            hide($('#room input[type="submit"]'));
        }
    }

    function start() {
        try {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0cGxheS0xLjIuMTUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7O0FBRWIsUUFBUTtBQUNSLHNDQUFzQzs7QUFFdEMsZUFBZSxtQkFBTyxDQUFDLGlEQUFrQjs7QUFFekM7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx5QkFBeUIsU0FBUyxLQUFLLG9CQUFvQjs7QUFFM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIscURBQXFEO0FBQ2hGLDRDQUE0QyxtQkFBbUI7QUFDL0Q7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixnQkFBZ0I7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDs7QUFFckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDZFQUE2RTtBQUM3RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixvQ0FBb0M7QUFDekQ7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL25ldHBsYXkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDjg43jg4Pjg4jlr77miKYgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgc2NhbGUsXG4gICAgICAgIHNldFNlbGVjdG9yLCBjbGVhclNlbGVjdG9yICB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG5jb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL2NvbmYvcnVsZS5qc29uJyk7XG5cbmNvbnN0IGJhc2UgPSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qPyQvLCcnKTtcblxubGV0IGxvYWRlZDtcblxuJChmdW5jdGlvbigpe1xuXG4gICAgY29uc3QgcGFpICAgPSBNYWppYW5nLlVJLnBhaSgkKCcjbG9hZGRhdGEnKSk7XG4gICAgY29uc3QgYXVkaW8gPSBNYWppYW5nLlVJLmF1ZGlvKCQoJyNsb2FkZGF0YScpKTtcblxuICAgIGNvbnN0IGFuYWx5emVyID0gKGthaWp1KT0+e1xuICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2FuYWx5emVyJyk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5BbmFseXplcigkKCcjYm9hcmQgPiAuYW5hbHl6ZXInKSwga2FpanUsIHBhaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKT0+JCgnYm9keScpLnJlbW92ZUNsYXNzKCdhbmFseXplcicpKTtcbiAgICB9O1xuICAgIGNvbnN0IHZpZXdlciA9IChwYWlwdSk9PntcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1KFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2JvYXJkJyksIHBhaXB1LCBwYWksIGF1ZGlvLCAnTWFqaWFuZy5wcmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcbiAgICB9O1xuICAgIGNvbnN0IHN0YXQgPSAocGFpcHVfbGlzdCk9PntcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3N0YXQnKSk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5QYWlwdVN0YXQoJCgnI3N0YXQnKSwgcGFpcHVfbGlzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSk7XG4gICAgfTtcbiAgICBjb25zdCBmaWxlID0gbmV3IE1hamlhbmcuVUkuUGFpcHVGaWxlKCQoJyNmaWxlJyksICdNYWppYW5nLm5ldHBsYXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ZXIsIHN0YXQpO1xuICAgIGxldCBzb2NrLCBteXVpZDtcblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICAgICAgc29jayA9IGlvKCcvJywgeyBwYXRoOiBgJHtiYXNlfS9zZXJ2ZXIvc29ja2V0LmlvL2B9KTtcblxuICAgICAgICBzb2NrLm9uKCdIRUxMTycsIGhlbGxvKTtcbiAgICAgICAgc29jay5vbignUk9PTScsIHJvb20pO1xuICAgICAgICBzb2NrLm9uKCdTVEFSVCcsIHN0YXJ0KTtcbiAgICAgICAgc29jay5vbignRU5EJywgZW5kKTtcbiAgICAgICAgc29jay5vbignRVJST1InLCBmaWxlLmVycm9yKTtcbiAgICAgICAgc29jay5vbignZGlzY29ubmVjdCcsICgpPT5oaWRlKCQoJyNmaWxlIC5uZXRwbGF5IGZvcm0ucm9vbScpKSk7XG5cbiAgICAgICAgaGlkZSgkKCcjdGl0bGUgLmxvYWRpbmcnKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGVsbG8odXNlcikge1xuICAgICAgICBpZiAoISB1c2VyKSB7XG4gICAgICAgICAgICAvLyDlhY3nmbvlvZXvvJroh6rliqjnlJ/miJDpmo/mnLrnjqnlrrblkI3lubbnmbvlvZXvvJvpmLLlvqrnjq/vvJozIOenkuWGhemHjeWkjeinpuWPkeWImei9rOaJi+WKqFxuICAgICAgICAgICAgY29uc3QgbGFzdCA9ICtsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5hdXRvTG9naW4udCcpO1xuICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0IDwgMzAwMCkge1xuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3RpdGxlJyk7XG4gICAgICAgICAgICAgICAgc2hvdygkKCcjdGl0bGUgLmxvZ2luJykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdNYWppYW5nLmF1dG9Mb2dpbi50JywgRGF0ZS5ub3coKSk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gJ+eOqeWuticgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5MDAwICsgMTAwMCk7XG4gICAgICAgICAgICBmZXRjaCgnc2VydmVyL2F1dGgvJywge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIH0sXG4gICAgICAgICAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyh7IG5hbWUsIHBhc3N3ZDogJyonIH0pLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiAnbWFudWFsJ1xuICAgICAgICAgICAgfSkudGhlbihyZXM9PiB7XG4gICAgICAgICAgICAgICAgLy8gMzAyIOmHjeWumuWQkSA9IOeZu+W9leaIkOWKn++8m+WQpuWImeaYvuekuueZu+W9leihqOWNleWFnOW6lVxuICAgICAgICAgICAgICAgIGlmIChyZXMudHlwZSA9PSAnb3BhcXVlcmVkaXJlY3QnIHx8IHJlcy5zdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICBlbHNlIGZhbGxiYWNrX2xvZ2luKCk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKT0+IGZhbGxiYWNrX2xvZ2luKCkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gZmFsbGJhY2tfbG9naW4oKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywndGl0bGUnKTtcbiAgICAgICAgICAgICAgICBzaG93KCQoJyN0aXRsZSAubG9naW4nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbXl1aWQgPSB1c2VyLnVpZDtcbiAgICAgICAgc2hvdygkKCcjZmlsZSAubmV0cGxheSBmb3JtJykpO1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKTtcbiAgICAgICAgaWYgKHVzZXIuaWNvbilcbiAgICAgICAgICAgICQoJyNmaWxlIC5uZXRwbGF5IGltZycpLmF0dHIoJ3NyYycsIHVzZXIuaWNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RpdGxlJywgdXNlci51aWQpO1xuICAgICAgICAkKCcjZmlsZSAubmV0cGxheSAubmFtZScpLnRleHQodXNlci5uYW1lKTtcbiAgICAgICAgZmlsZS5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICBsZXQgcm93LCBzcmM7XG5cbiAgICBmdW5jdGlvbiByb29tKG1zZykge1xuICAgICAgICBpZiAoISByb3cpIHtcbiAgICAgICAgICAgIHJvdyA9ICQoJyNyb29tIC51c2VyJykuZXEoMCk7XG4gICAgICAgICAgICBzcmMgPSAkKCdpbWcnLCByb3cpLmF0dHIoJ3NyYycpO1xuICAgICAgICB9XG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3Jvb20nKTtcbiAgICAgICAgJCgnI3Jvb20gaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nKS52YWwobXNnLnJvb21fbm8pO1xuICAgICAgICAkKCcjcm9vbSAucm9vbScpLmVtcHR5KCk7XG4gICAgICAgIGZvciAobGV0IHVzZXIgb2YgbXNnLnVzZXIpIHtcbiAgICAgICAgICAgIGxldCByID0gcm93LmNsb25lKCk7XG4gICAgICAgICAgICBpZiAodXNlci5pY29uKSAkKCdpbWcnLCByKS5hdHRyKCdzcmMnLCB1c2VyLmljb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0aXRsZScsIHVzZXIudWlkKTtcbiAgICAgICAgICAgIGVsc2UgICAgICAgICAgICQoJ2ltZycsIHIpLmF0dHIoJ3NyYycsIHNyYyk7XG4gICAgICAgICAgICAkKCcubmFtZScsIHIpLnRleHQodXNlci5uYW1lKTtcbiAgICAgICAgICAgIGlmIChtc2cudXNlclswXS51aWQgPT0gbXl1aWQgfHwgdXNlci51aWQgPT0gbXl1aWQgKVxuICAgICAgICAgICAgICAgIHNob3coJCgnaW5wdXRbbmFtZT1cInF1aXRcIl0nLCByKS5vbignY2xpY2snLCAoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2suZW1pdCgnUk9PTScsIG1zZy5yb29tX25vLCB1c2VyLnVpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGlmICh1c2VyLm9mZmxpbmUpIHIuYWRkQ2xhc3MoJ29mZmxpbmUnKTtcbiAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgIHIucmVtb3ZlQ2xhc3MoJ29mZmxpbmUnKTtcbiAgICAgICAgICAgICQoJyNyb29tIC5yb29tJykuYXBwZW5kKHIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtc2cudXNlclswXS51aWQgPT0gbXl1aWQpIHtcbiAgICAgICAgICAgICQoJyNyb29tIC5yb29tLXN0YXR1cycpLnRleHQobXNnLnVzZXIubGVuZ3RoID49IDRcbiAgICAgICAgICAgICAgICA/ICfnjqnlrrblt7Lmu6EgNCDkurrvvIzlj6/ku6XlvIDlp4vlr7nlsYAnXG4gICAgICAgICAgICAgICAgOiBg562J5b6F5YW25LuW546p5a625Yqg5YWl4oCm77yIJHttc2cudXNlci5sZW5ndGh9LzTvvIlgKTtcbiAgICAgICAgICAgIGlmIChtc2cudXNlci5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgICAgIHNob3coJCgnI3Jvb20gc2VsZWN0W25hbWU9XCJydWxlXCJdJykpO1xuICAgICAgICAgICAgICAgIHNob3coJCgnI3Jvb20gaW5wdXRbbmFtZT1cInRpbWVyXCJdJykpO1xuICAgICAgICAgICAgICAgIHNob3coJCgnI3Jvb20gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gc2VsZWN0W25hbWU9XCJydWxlXCJdJykpO1xuICAgICAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gaW5wdXRbbmFtZT1cInRpbWVyXCJdJykpO1xuICAgICAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gc2VsZWN0W25hbWU9XCJydWxlXCJdJykpO1xuICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBpbnB1dFtuYW1lPVwidGltZXJcIl0nKSk7XG4gICAgICAgICAgICBoaWRlKCQoJyNyb29tIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG5ldyBNYWppYW5nLlVJLlBsYXllcigkKCcjYm9hcmQnKSwgcGFpLCBhdWRpbyk7XG4gICAgICAgICAgICBwbGF5ZXIudmlldyAgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksIHBhaSwgYXVkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLm1vZGVsKTtcblxuICAgICAgICAgICAgY29uc3QgZ2FtZUN0bCA9IG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIHBsYXllciwgcGxheWVyLl92aWV3KTtcbiAgICAgICAgICAgIGdhbWVDdGwuX3ZpZXcubm9fcGxheWVyX25hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIHBsYXllci5fdmlldy5ub19wbGF5ZXJfbmFtZSAgID0gZmFsc2U7ICAgLy8g6IGU572R5a+55bGA5pi+56S6546p5a625ZCN77yIY29yZSBQbGF5ZXIg5Y+q5pyJIHZpZXcgc2V0dGVy77yM6ZyA55SoIF92aWV377yJXG5cbiAgICAgICAgICAgIGxldCBwbGF5ZXJzID0gW107XG5cbiAgICAgICAgICAgICQoJyNib2FyZCAuY29udHJvbGxlcicpLnJlbW92ZUNsYXNzKCdwYWlwdScpXG4gICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICAgICAgICAgIGxldCBzZXEgPSAwO1xuICAgICAgICAgICAgc29jay5yZW1vdmVBbGxMaXN0ZW5lcnMoJ0dBTUUnKTtcbiAgICAgICAgICAgIHNvY2sub24oJ0dBTUUnLCAobXNnKT0+e1xuICAgICAgICAgICAgICAgIGlmIChtc2cucGxheWVycykge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzID0gbXNnLnBsYXllcnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1zZy5zYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLl92aWV3LnNheShtc2cuc2F5Lm5hbWUsIG1zZy5zYXkubCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1zZy5zZXEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcSAmJiBtc2cuc2VxICE9IHNlcSkgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24obXNnLCAocmVwbHkgPSB7fSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5LnNlcSA9IG1zZy5zZXE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrLmVtaXQoJ0dBTUUnLCByZXBseSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEgPSBtc2cuc2VxICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtc2cua2FpanUgJiYgbXNnLmthaWp1LmxvZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvZyA9IG1zZy5rYWlqdS5sb2cucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBkYXRhIG9mIGxvZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGxheWVyLl92aWV3LnBsYXllcnMocGxheWVycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbbmV0cGxheV0gc3RhcnQoKSDplJnor686JywgZSk7XG4gICAgICAgICAgICBhbGVydCgn5a+55bGA5Yid5aeL5YyW5aSx6LSlOiAnICsgZS5tZXNzYWdlICsgJ1xcbicgKyBlLnN0YWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZChwYWlwdSkge1xuICAgICAgICBzb2NrLnJlbW92ZUFsbExpc3RlbmVycygnR0FNRScpO1xuICAgICAgICBpZiAocGFpcHUpIGZpbGUuYWRkKHBhaXB1LCAxMCk7XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xuICAgICAgICBmaWxlLnJlZHJhdygpO1xuICAgICAgICAkKCcjZmlsZSBpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScpLnZhbCgnJyk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHByZXNldCkpIHtcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JykudmFsKGtleSkudGV4dChrZXkpKTtcbiAgICB9XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKSkge1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsKCctJykudGV4dCgn44Kr44K544K/44Og44Or44O844OrJykpO1xuICAgIH1cblxuICAgICQoJyNmaWxlIGZvcm0ucm9vbScpLm9uKCdzdWJtaXQnLCAoZXYpPT57XG4gICAgICAgIGxldCByb29tID0gJCgnaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xuICAgICAgICBzb2NrLmVtaXQoJ1JPT00nLCByb29tKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJyNyb29tIGZvcm0nKS5vbignc3VibWl0JywgKGV2KT0+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHJvb20gPSAkKCdpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG5cbiAgICAgICAgICAgIGxldCBydWxlID0gJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcbiAgICAgICAgICAgIHJ1bGUgPSAhIHJ1bGUgICAgICA/IHt9XG4gICAgICAgICAgICAgICAgIDogcnVsZSA9PSAnLScgPyBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpfHwne30nKVxuICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgcHJlc2V0W3J1bGVdO1xuICAgICAgICAgICAgcnVsZSA9IE1hamlhbmcucnVsZShydWxlKTtcblxuICAgICAgICAgICAgbGV0IHRpbWVyID0gJCgnaW5wdXRbbmFtZT1cInRpbWVyXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcbiAgICAgICAgICAgIHRpbWVyID0gdGltZXIubWF0Y2goLyhcXGQrKS9nKTtcbiAgICAgICAgICAgIGlmICh0aW1lcikgdGltZXIgPSB0aW1lci5tYXAodD0+K3QpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW25ldHBsYXldIFNUQVJUIGVtaXQsIHJvb209Jywgcm9vbSwgJ3J1bGUga2V5cz0nLCBPYmplY3Qua2V5cyhydWxlKS5sZW5ndGgpO1xuICAgICAgICAgICAgc29jay5lbWl0KCdTVEFSVCcsIHJvb20sIHJ1bGUsIHRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbbmV0cGxheV0gU1RBUlQgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICBhbGVydCgn5byA5aeL5a+55bGA5Ye66ZSZOiAnICsgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpPT5zY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpKTtcblxuICAgICQod2luZG93KS5vbignbG9hZCcsICgpPT5zZXRUaW1lb3V0KGluaXQsIDUwMCkpO1xuICAgIGlmIChsb2FkZWQpICQod2luZG93KS50cmlnZ2VyKCdsb2FkJyk7XG5cbiAgICAkKCcjdGl0bGUgLmxvZ2luIGZvcm0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBtZXRob2QgPSAkKHRoaXMpLmF0dHIoJ21ldGhvZCcpXG4gICAgICAgIGxldCB1cmwgICAgPSAkKHRoaXMpLmF0dHIoJ2FjdGlvbicpO1xuICAgICAgICBmZXRjaCh1cmwsIHsgbWV0aG9kOiBtZXRob2QsIHJlZGlyZWN0OiAnbWFudWFsJyB9KS50aGVuKHJlcyA9PntcbiAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwNCkgaGlkZSgkKHRoaXMpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiQod2luZG93KS5vbignbG9hZCcsICgpPT4gbG9hZGVkID0gdHJ1ZSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
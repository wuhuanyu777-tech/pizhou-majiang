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
            $('body').attr('class','title');
            show($('#title .login'));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0cGxheS0xLjIuMTIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7O0FBRWIsUUFBUTtBQUNSLHNDQUFzQzs7QUFFdEMsZUFBZSxtQkFBTyxDQUFDLGlEQUFrQjs7QUFFekM7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx5QkFBeUIsU0FBUyxLQUFLLG9CQUFvQjs7QUFFM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixnQkFBZ0I7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDs7QUFFckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDZFQUE2RTtBQUM3RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixvQ0FBb0M7QUFDekQ7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL25ldHBsYXkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDjg43jg4Pjg4jlr77miKYgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgc2NhbGUsXG4gICAgICAgIHNldFNlbGVjdG9yLCBjbGVhclNlbGVjdG9yICB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG5jb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL2NvbmYvcnVsZS5qc29uJyk7XG5cbmNvbnN0IGJhc2UgPSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qPyQvLCcnKTtcblxubGV0IGxvYWRlZDtcblxuJChmdW5jdGlvbigpe1xuXG4gICAgY29uc3QgcGFpICAgPSBNYWppYW5nLlVJLnBhaSgkKCcjbG9hZGRhdGEnKSk7XG4gICAgY29uc3QgYXVkaW8gPSBNYWppYW5nLlVJLmF1ZGlvKCQoJyNsb2FkZGF0YScpKTtcblxuICAgIGNvbnN0IGFuYWx5emVyID0gKGthaWp1KT0+e1xuICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2FuYWx5emVyJyk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5BbmFseXplcigkKCcjYm9hcmQgPiAuYW5hbHl6ZXInKSwga2FpanUsIHBhaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKT0+JCgnYm9keScpLnJlbW92ZUNsYXNzKCdhbmFseXplcicpKTtcbiAgICB9O1xuICAgIGNvbnN0IHZpZXdlciA9IChwYWlwdSk9PntcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1KFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2JvYXJkJyksIHBhaXB1LCBwYWksIGF1ZGlvLCAnTWFqaWFuZy5wcmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcbiAgICB9O1xuICAgIGNvbnN0IHN0YXQgPSAocGFpcHVfbGlzdCk9PntcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3N0YXQnKSk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5QYWlwdVN0YXQoJCgnI3N0YXQnKSwgcGFpcHVfbGlzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSk7XG4gICAgfTtcbiAgICBjb25zdCBmaWxlID0gbmV3IE1hamlhbmcuVUkuUGFpcHVGaWxlKCQoJyNmaWxlJyksICdNYWppYW5nLm5ldHBsYXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ZXIsIHN0YXQpO1xuICAgIGxldCBzb2NrLCBteXVpZDtcblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICAgICAgc29jayA9IGlvKCcvJywgeyBwYXRoOiBgJHtiYXNlfS9zZXJ2ZXIvc29ja2V0LmlvL2B9KTtcblxuICAgICAgICBzb2NrLm9uKCdIRUxMTycsIGhlbGxvKTtcbiAgICAgICAgc29jay5vbignUk9PTScsIHJvb20pO1xuICAgICAgICBzb2NrLm9uKCdTVEFSVCcsIHN0YXJ0KTtcbiAgICAgICAgc29jay5vbignRU5EJywgZW5kKTtcbiAgICAgICAgc29jay5vbignRVJST1InLCBmaWxlLmVycm9yKTtcbiAgICAgICAgc29jay5vbignZGlzY29ubmVjdCcsICgpPT5oaWRlKCQoJyNmaWxlIC5uZXRwbGF5IGZvcm0ucm9vbScpKSk7XG5cbiAgICAgICAgaGlkZSgkKCcjdGl0bGUgLmxvYWRpbmcnKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGVsbG8odXNlcikge1xuICAgICAgICBpZiAoISB1c2VyKSB7XG4gICAgICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCd0aXRsZScpO1xuICAgICAgICAgICAgc2hvdygkKCcjdGl0bGUgLmxvZ2luJykpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG15dWlkID0gdXNlci51aWQ7XG4gICAgICAgIHNob3coJCgnI2ZpbGUgLm5ldHBsYXkgZm9ybScpKTtcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSk7XG4gICAgICAgIGlmICh1c2VyLmljb24pXG4gICAgICAgICAgICAkKCcjZmlsZSAubmV0cGxheSBpbWcnKS5hdHRyKCdzcmMnLCB1c2VyLmljb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0aXRsZScsIHVzZXIudWlkKTtcbiAgICAgICAgJCgnI2ZpbGUgLm5ldHBsYXkgLm5hbWUnKS50ZXh0KHVzZXIubmFtZSk7XG4gICAgICAgIGZpbGUucmVkcmF3KCk7XG4gICAgfVxuXG4gICAgbGV0IHJvdywgc3JjO1xuXG4gICAgZnVuY3Rpb24gcm9vbShtc2cpIHtcbiAgICAgICAgaWYgKCEgcm93KSB7XG4gICAgICAgICAgICByb3cgPSAkKCcjcm9vbSAudXNlcicpLmVxKDApO1xuICAgICAgICAgICAgc3JjID0gJCgnaW1nJywgcm93KS5hdHRyKCdzcmMnKTtcbiAgICAgICAgfVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdyb29tJyk7XG4gICAgICAgICQoJyNyb29tIGlucHV0W25hbWU9XCJyb29tX25vXCJdJykudmFsKG1zZy5yb29tX25vKTtcbiAgICAgICAgJCgnI3Jvb20gLnJvb20nKS5lbXB0eSgpO1xuICAgICAgICBmb3IgKGxldCB1c2VyIG9mIG1zZy51c2VyKSB7XG4gICAgICAgICAgICBsZXQgciA9IHJvdy5jbG9uZSgpO1xuICAgICAgICAgICAgaWYgKHVzZXIuaWNvbikgJCgnaW1nJywgcikuYXR0cignc3JjJywgdXNlci5pY29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndGl0bGUnLCB1c2VyLnVpZCk7XG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAkKCdpbWcnLCByKS5hdHRyKCdzcmMnLCBzcmMpO1xuICAgICAgICAgICAgJCgnLm5hbWUnLCByKS50ZXh0KHVzZXIubmFtZSk7XG4gICAgICAgICAgICBpZiAobXNnLnVzZXJbMF0udWlkID09IG15dWlkIHx8IHVzZXIudWlkID09IG15dWlkIClcbiAgICAgICAgICAgICAgICBzaG93KCQoJ2lucHV0W25hbWU9XCJxdWl0XCJdJywgcikub24oJ2NsaWNrJywgKCk9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrLmVtaXQoJ1JPT00nLCBtc2cucm9vbV9ubywgdXNlci51aWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBpZiAodXNlci5vZmZsaW5lKSByLmFkZENsYXNzKCdvZmZsaW5lJyk7XG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICByLnJlbW92ZUNsYXNzKCdvZmZsaW5lJyk7XG4gICAgICAgICAgICAkKCcjcm9vbSAucm9vbScpLmFwcGVuZChyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobXNnLnVzZXJbMF0udWlkID09IG15dWlkKSB7XG4gICAgICAgICAgICAkKCcjcm9vbSAucm9vbS1zdGF0dXMnKS50ZXh0KG1zZy51c2VyLmxlbmd0aCA+PSA0XG4gICAgICAgICAgICAgICAgPyAn546p5a625bey5ruhIDQg5Lq677yM5Y+v5Lul5byA5aeL5a+55bGAJ1xuICAgICAgICAgICAgICAgIDogYOetieW+heWFtuS7lueOqeWutuWKoOWFpeKApu+8iCR7bXNnLnVzZXIubGVuZ3RofS8077yJYCk7XG4gICAgICAgICAgICBpZiAobXNnLnVzZXIubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgICAgICBzaG93KCQoJyNyb29tIHNlbGVjdFtuYW1lPVwicnVsZVwiXScpKTtcbiAgICAgICAgICAgICAgICBzaG93KCQoJyNyb29tIGlucHV0W25hbWU9XCJ0aW1lclwiXScpKTtcbiAgICAgICAgICAgICAgICBzaG93KCQoJyNyb29tIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBoaWRlKCQoJyNyb29tIHNlbGVjdFtuYW1lPVwicnVsZVwiXScpKTtcbiAgICAgICAgICAgICAgICBoaWRlKCQoJyNyb29tIGlucHV0W25hbWU9XCJ0aW1lclwiXScpKTtcbiAgICAgICAgICAgICAgICBoaWRlKCQoJyNyb29tIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoaWRlKCQoJyNyb29tIHNlbGVjdFtuYW1lPVwicnVsZVwiXScpKTtcbiAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gaW5wdXRbbmFtZT1cInRpbWVyXCJdJykpO1xuICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgTWFqaWFuZy5VSS5QbGF5ZXIoJCgnI2JvYXJkJyksIHBhaSwgYXVkaW8pO1xuICAgICAgICAgICAgcGxheWVyLnZpZXcgID0gbmV3IE1hamlhbmcuVUkuQm9hcmQoJCgnI2JvYXJkIC5ib2FyZCcpLCBwYWksIGF1ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5tb2RlbCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGdhbWVDdGwgPSBuZXcgTWFqaWFuZy5VSS5HYW1lQ3RsKCQoJyNib2FyZCcpLCAnTWFqaWFuZy5wcmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLCBwbGF5ZXIsIHBsYXllci5fdmlldyk7XG4gICAgICAgICAgICBnYW1lQ3RsLl92aWV3Lm5vX3BsYXllcl9uYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBwbGF5ZXIuX3ZpZXcubm9fcGxheWVyX25hbWUgICA9IGZhbHNlOyAgIC8vIOiBlOe9keWvueWxgOaYvuekuueOqeWutuWQje+8iGNvcmUgUGxheWVyIOWPquaciSB2aWV3IHNldHRlcu+8jOmcgOeUqCBfdmlld++8iVxuXG4gICAgICAgICAgICBsZXQgcGxheWVycyA9IFtdO1xuXG4gICAgICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5yZW1vdmVDbGFzcygncGFpcHUnKVxuICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcbiAgICAgICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG4gICAgICAgICAgICBsZXQgc2VxID0gMDtcbiAgICAgICAgICAgIHNvY2sucmVtb3ZlQWxsTGlzdGVuZXJzKCdHQU1FJyk7XG4gICAgICAgICAgICBzb2NrLm9uKCdHQU1FJywgKG1zZyk9PntcbiAgICAgICAgICAgICAgICBpZiAobXNnLnBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVycyA9IG1zZy5wbGF5ZXJzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2cuc2F5KSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5fdmlldy5zYXkobXNnLnNheS5uYW1lLCBtc2cuc2F5LmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2cuc2VxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXEgJiYgbXNnLnNlcSAhPSBzZXEpIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKG1zZywgKHJlcGx5ID0ge30pPT57XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseS5zZXEgPSBtc2cuc2VxO1xuICAgICAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdHQU1FJywgcmVwbHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VxID0gbXNnLnNlcSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXNnLmthaWp1ICYmIG1zZy5rYWlqdS5sb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2cgPSBtc2cua2FpanUubG9nLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZGF0YSBvZiBsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBsYXllci5fdmlldy5wbGF5ZXJzKHBsYXllcnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIHN0YXJ0KCkg6ZSZ6K+vOicsIGUpO1xuICAgICAgICAgICAgYWxlcnQoJ+WvueWxgOWIneWni+WMluWksei0pTogJyArIGUubWVzc2FnZSArICdcXG4nICsgZS5zdGFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmQocGFpcHUpIHtcbiAgICAgICAgc29jay5yZW1vdmVBbGxMaXN0ZW5lcnMoJ0dBTUUnKTtcbiAgICAgICAgaWYgKHBhaXB1KSBmaWxlLmFkZChwYWlwdSwgMTApO1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKTtcbiAgICAgICAgZmlsZS5yZWRyYXcoKTtcbiAgICAgICAgJCgnI2ZpbGUgaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nKS52YWwoJycpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwcmVzZXQpKSB7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpLnZhbChrZXkpLnRleHQoa2V5KSk7XG4gICAgfVxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJykpIHtcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCgnLScpLnRleHQoJ+OCq+OCueOCv+ODoOODq+ODvOODqycpKTtcbiAgICB9XG5cbiAgICAkKCcjZmlsZSBmb3JtLnJvb20nKS5vbignc3VibWl0JywgKGV2KT0+e1xuICAgICAgICBsZXQgcm9vbSA9ICQoJ2lucHV0W25hbWU9XCJyb29tX25vXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcbiAgICAgICAgc29jay5lbWl0KCdST09NJywgcm9vbSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcjcm9vbSBmb3JtJykub24oJ3N1Ym1pdCcsIChldik9PntcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCByb29tID0gJCgnaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xuXG4gICAgICAgICAgICBsZXQgcnVsZSA9ICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG4gICAgICAgICAgICBydWxlID0gISBydWxlICAgICAgPyB7fVxuICAgICAgICAgICAgICAgICA6IHJ1bGUgPT0gJy0nID8gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcbiAgICAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgIHByZXNldFtydWxlXTtcbiAgICAgICAgICAgIHJ1bGUgPSBNYWppYW5nLnJ1bGUocnVsZSk7XG5cbiAgICAgICAgICAgIGxldCB0aW1lciA9ICQoJ2lucHV0W25hbWU9XCJ0aW1lclwiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG4gICAgICAgICAgICB0aW1lciA9IHRpbWVyLm1hdGNoKC8oXFxkKykvZyk7XG4gICAgICAgICAgICBpZiAodGltZXIpIHRpbWVyID0gdGltZXIubWFwKHQ9Pit0KTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tuZXRwbGF5XSBTVEFSVCBlbWl0LCByb29tPScsIHJvb20sICdydWxlIGtleXM9JywgT2JqZWN0LmtleXMocnVsZSkubGVuZ3RoKTtcbiAgICAgICAgICAgIHNvY2suZW1pdCgnU1RBUlQnLCByb29tLCBydWxlLCB0aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIFNUQVJUIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgYWxlcnQoJ+W8gOWni+WvueWxgOWHuumUmTogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKT0+c2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKSk7XG5cbiAgICAkKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+c2V0VGltZW91dChpbml0LCA1MDApKTtcbiAgICBpZiAobG9hZGVkKSAkKHdpbmRvdykudHJpZ2dlcignbG9hZCcpO1xuXG4gICAgJCgnI3RpdGxlIC5sb2dpbiBmb3JtJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgbWV0aG9kID0gJCh0aGlzKS5hdHRyKCdtZXRob2QnKVxuICAgICAgICBsZXQgdXJsICAgID0gJCh0aGlzKS5hdHRyKCdhY3Rpb24nKTtcbiAgICAgICAgZmV0Y2godXJsLCB7IG1ldGhvZDogbWV0aG9kLCByZWRpcmVjdDogJ21hbnVhbCcgfSkudGhlbihyZXMgPT57XG4gICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSA0MDQpIGhpZGUoJCh0aGlzKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+IGxvYWRlZCA9IHRydWUpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
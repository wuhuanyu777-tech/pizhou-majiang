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

    // 登录名自动填入随机名字，省去手动输入（可自行修改）
    $('#title .login input[name="name"]').val(
        '玩家' + Math.floor(Math.random() * 9000 + 1000));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0cGxheS0xLjIuMTMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7O0FBRWIsUUFBUTtBQUNSLHNDQUFzQzs7QUFFdEMsZUFBZSxtQkFBTyxDQUFDLGlEQUFrQjs7QUFFekM7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEseUJBQXlCLFNBQVMsS0FBSyxvQkFBb0I7O0FBRTNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsZ0JBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQ7O0FBRXJEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0U7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsb0NBQW9DO0FBQ3pEO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTCxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9uZXRwbGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8qIVxuICogIOmbu+iEs+m6u+Wwhjog44ON44OD44OI5a++5oimIHYxLjAuMFxuICpcbiAqICBDb3B5cmlnaHQoQykgMjAxNyBTYXRvc2hpIEtvYmF5YXNoaVxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgeyBoaWRlLCBzaG93LCBmYWRlSW4sIHNjYWxlLFxuICAgICAgICBzZXRTZWxlY3RvciwgY2xlYXJTZWxlY3RvciAgfSA9IE1hamlhbmcuVUkuVXRpbDtcblxuY29uc3QgcHJlc2V0ID0gcmVxdWlyZSgnLi9jb25mL3J1bGUuanNvbicpO1xuXG5jb25zdCBiYXNlID0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKj8kLywnJyk7XG5cbmxldCBsb2FkZWQ7XG5cbiQoZnVuY3Rpb24oKXtcblxuICAgIC8vIOeZu+W9leWQjeiHquWKqOWhq+WFpemaj+acuuWQjeWtl++8jOecgeWOu+aJi+WKqOi+k+WFpe+8iOWPr+iHquihjOS/ruaUue+8iVxuICAgICQoJyN0aXRsZSAubG9naW4gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoXG4gICAgICAgICfnjqnlrrYnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOTAwMCArIDEwMDApKTtcblxuICAgIGNvbnN0IHBhaSAgID0gTWFqaWFuZy5VSS5wYWkoJCgnI2xvYWRkYXRhJykpO1xuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XG5cbiAgICBjb25zdCBhbmFseXplciA9IChrYWlqdSk9PntcbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdhbmFseXplcicpO1xuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2JvYXJkID4gLmFuYWx5emVyJyksIGthaWp1LCBwYWksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCk9PiQoJ2JvZHknKS5yZW1vdmVDbGFzcygnYW5hbHl6ZXInKSk7XG4gICAgfTtcbiAgICBjb25zdCB2aWV3ZXIgPSAocGFpcHUpPT57XG4gICAgICAgICQoJyNib2FyZCAuY29udHJvbGxlcicpLmFkZENsYXNzKCdwYWlwdScpXG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkJyk7XG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5QYWlwdShcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNib2FyZCcpLCBwYWlwdSwgcGFpLCBhdWRpbywgJ01hamlhbmcucHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmFseXplcik7XG4gICAgfTtcbiAgICBjb25zdCBzdGF0ID0gKHBhaXB1X2xpc3QpPT57XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdzdGF0JykpO1xuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuUGFpcHVTdGF0KCQoJyNzdGF0JyksIHBhaXB1X2xpc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkpO1xuICAgIH07XG4gICAgY29uc3QgZmlsZSA9IG5ldyBNYWppYW5nLlVJLlBhaXB1RmlsZSgkKCcjZmlsZScpLCAnTWFqaWFuZy5uZXRwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0KTtcbiAgICBsZXQgc29jaywgbXl1aWQ7XG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgICAgIHNvY2sgPSBpbygnLycsIHsgcGF0aDogYCR7YmFzZX0vc2VydmVyL3NvY2tldC5pby9gfSk7XG5cbiAgICAgICAgc29jay5vbignSEVMTE8nLCBoZWxsbyk7XG4gICAgICAgIHNvY2sub24oJ1JPT00nLCByb29tKTtcbiAgICAgICAgc29jay5vbignU1RBUlQnLCBzdGFydCk7XG4gICAgICAgIHNvY2sub24oJ0VORCcsIGVuZCk7XG4gICAgICAgIHNvY2sub24oJ0VSUk9SJywgZmlsZS5lcnJvcik7XG4gICAgICAgIHNvY2sub24oJ2Rpc2Nvbm5lY3QnLCAoKT0+aGlkZSgkKCcjZmlsZSAubmV0cGxheSBmb3JtLnJvb20nKSkpO1xuXG4gICAgICAgIGhpZGUoJCgnI3RpdGxlIC5sb2FkaW5nJykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhlbGxvKHVzZXIpIHtcbiAgICAgICAgaWYgKCEgdXNlcikge1xuICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywndGl0bGUnKTtcbiAgICAgICAgICAgIHNob3coJCgnI3RpdGxlIC5sb2dpbicpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBteXVpZCA9IHVzZXIudWlkO1xuICAgICAgICBzaG93KCQoJyNmaWxlIC5uZXRwbGF5IGZvcm0nKSk7XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xuICAgICAgICBpZiAodXNlci5pY29uKVxuICAgICAgICAgICAgJCgnI2ZpbGUgLm5ldHBsYXkgaW1nJykuYXR0cignc3JjJywgdXNlci5pY29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndGl0bGUnLCB1c2VyLnVpZCk7XG4gICAgICAgICQoJyNmaWxlIC5uZXRwbGF5IC5uYW1lJykudGV4dCh1c2VyLm5hbWUpO1xuICAgICAgICBmaWxlLnJlZHJhdygpO1xuICAgIH1cblxuICAgIGxldCByb3csIHNyYztcblxuICAgIGZ1bmN0aW9uIHJvb20obXNnKSB7XG4gICAgICAgIGlmICghIHJvdykge1xuICAgICAgICAgICAgcm93ID0gJCgnI3Jvb20gLnVzZXInKS5lcSgwKTtcbiAgICAgICAgICAgIHNyYyA9ICQoJ2ltZycsIHJvdykuYXR0cignc3JjJyk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywncm9vbScpO1xuICAgICAgICAkKCcjcm9vbSBpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScpLnZhbChtc2cucm9vbV9ubyk7XG4gICAgICAgICQoJyNyb29tIC5yb29tJykuZW1wdHkoKTtcbiAgICAgICAgZm9yIChsZXQgdXNlciBvZiBtc2cudXNlcikge1xuICAgICAgICAgICAgbGV0IHIgPSByb3cuY2xvbmUoKTtcbiAgICAgICAgICAgIGlmICh1c2VyLmljb24pICQoJ2ltZycsIHIpLmF0dHIoJ3NyYycsIHVzZXIuaWNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RpdGxlJywgdXNlci51aWQpO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgJCgnaW1nJywgcikuYXR0cignc3JjJywgc3JjKTtcbiAgICAgICAgICAgICQoJy5uYW1lJywgcikudGV4dCh1c2VyLm5hbWUpO1xuICAgICAgICAgICAgaWYgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCB8fCB1c2VyLnVpZCA9PSBteXVpZCApXG4gICAgICAgICAgICAgICAgc2hvdygkKCdpbnB1dFtuYW1lPVwicXVpdFwiXScsIHIpLm9uKCdjbGljaycsICgpPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdST09NJywgbXNnLnJvb21fbm8sIHVzZXIudWlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaWYgKHVzZXIub2ZmbGluZSkgci5hZGRDbGFzcygnb2ZmbGluZScpO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgci5yZW1vdmVDbGFzcygnb2ZmbGluZScpO1xuICAgICAgICAgICAgJCgnI3Jvb20gLnJvb20nKS5hcHBlbmQocik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCkge1xuICAgICAgICAgICAgJCgnI3Jvb20gLnJvb20tc3RhdHVzJykudGV4dChtc2cudXNlci5sZW5ndGggPj0gNFxuICAgICAgICAgICAgICAgID8gJ+eOqeWutuW3sua7oSA0IOS6uu+8jOWPr+S7peW8gOWni+WvueWxgCdcbiAgICAgICAgICAgICAgICA6IGDnrYnlvoXlhbbku5bnjqnlrrbliqDlhaXigKbvvIgke21zZy51c2VyLmxlbmd0aH0vNO+8iWApO1xuICAgICAgICAgICAgaWYgKG1zZy51c2VyLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgc2hvdygkKCcjcm9vbSBzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKSk7XG4gICAgICAgICAgICAgICAgc2hvdygkKCcjcm9vbSBpbnB1dFtuYW1lPVwidGltZXJcIl0nKSk7XG4gICAgICAgICAgICAgICAgc2hvdygkKCcjcm9vbSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKSk7XG4gICAgICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBpbnB1dFtuYW1lPVwidGltZXJcIl0nKSk7XG4gICAgICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGlkZSgkKCcjcm9vbSBzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKSk7XG4gICAgICAgICAgICBoaWRlKCQoJyNyb29tIGlucHV0W25hbWU9XCJ0aW1lclwiXScpKTtcbiAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbmV3IE1hamlhbmcuVUkuUGxheWVyKCQoJyNib2FyZCcpLCBwYWksIGF1ZGlvKTtcbiAgICAgICAgICAgIHBsYXllci52aWV3ICA9IG5ldyBNYWppYW5nLlVJLkJvYXJkKCQoJyNib2FyZCAuYm9hcmQnKSwgcGFpLCBhdWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIubW9kZWwpO1xuXG4gICAgICAgICAgICBjb25zdCBnYW1lQ3RsID0gbmV3IE1hamlhbmcuVUkuR2FtZUN0bCgkKCcjYm9hcmQnKSwgJ01hamlhbmcucHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCwgcGxheWVyLCBwbGF5ZXIuX3ZpZXcpO1xuICAgICAgICAgICAgZ2FtZUN0bC5fdmlldy5ub19wbGF5ZXJfbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgcGxheWVyLl92aWV3Lm5vX3BsYXllcl9uYW1lICAgPSBmYWxzZTsgICAvLyDogZTnvZHlr7nlsYDmmL7npLrnjqnlrrblkI3vvIhjb3JlIFBsYXllciDlj6rmnIkgdmlldyBzZXR0ZXLvvIzpnIDnlKggX3ZpZXfvvIlcblxuICAgICAgICAgICAgbGV0IHBsYXllcnMgPSBbXTtcblxuICAgICAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykucmVtb3ZlQ2xhc3MoJ3BhaXB1JylcbiAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkJyk7XG4gICAgICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuICAgICAgICAgICAgbGV0IHNlcSA9IDA7XG4gICAgICAgICAgICBzb2NrLnJlbW92ZUFsbExpc3RlbmVycygnR0FNRScpO1xuICAgICAgICAgICAgc29jay5vbignR0FNRScsIChtc2cpPT57XG4gICAgICAgICAgICAgICAgaWYgKG1zZy5wbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnMgPSBtc2cucGxheWVycztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobXNnLnNheSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuX3ZpZXcuc2F5KG1zZy5zYXkubmFtZSwgbXNnLnNheS5sKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobXNnLnNlcSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VxICYmIG1zZy5zZXEgIT0gc2VxKSBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbihtc2csIChyZXBseSA9IHt9KT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHkuc2VxID0gbXNnLnNlcTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2suZW1pdCgnR0FNRScsIHJlcGx5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcSA9IG1zZy5zZXEgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb24obXNnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1zZy5rYWlqdSAmJiBtc2cua2FpanUubG9nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9nID0gbXNnLmthaWp1LmxvZy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGRhdGEgb2YgbG9nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwbGF5ZXIuX3ZpZXcucGxheWVycyhwbGF5ZXJzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tuZXRwbGF5XSBzdGFydCgpIOmUmeivrzonLCBlKTtcbiAgICAgICAgICAgIGFsZXJ0KCflr7nlsYDliJ3lp4vljJblpLHotKU6ICcgKyBlLm1lc3NhZ2UgKyAnXFxuJyArIGUuc3RhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kKHBhaXB1KSB7XG4gICAgICAgIHNvY2sucmVtb3ZlQWxsTGlzdGVuZXJzKCdHQU1FJyk7XG4gICAgICAgIGlmIChwYWlwdSkgZmlsZS5hZGQocGFpcHUsIDEwKTtcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSk7XG4gICAgICAgIGZpbGUucmVkcmF3KCk7XG4gICAgICAgICQoJyNmaWxlIGlucHV0W25hbWU9XCJyb29tX25vXCJdJykudmFsKCcnKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocHJlc2V0KSkge1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKS52YWwoa2V5KS50ZXh0KGtleSkpO1xuICAgIH1cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpKSB7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWwoJy0nKS50ZXh0KCfjgqvjgrnjgr/jg6Djg6vjg7zjg6snKSk7XG4gICAgfVxuXG4gICAgJCgnI2ZpbGUgZm9ybS5yb29tJykub24oJ3N1Ym1pdCcsIChldik9PntcbiAgICAgICAgbGV0IHJvb20gPSAkKCdpbnB1dFtuYW1lPVwicm9vbV9ub1wiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG4gICAgICAgIHNvY2suZW1pdCgnUk9PTScsIHJvb20pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgJCgnI3Jvb20gZm9ybScpLm9uKCdzdWJtaXQnLCAoZXYpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcm9vbSA9ICQoJ2lucHV0W25hbWU9XCJyb29tX25vXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcblxuICAgICAgICAgICAgbGV0IHJ1bGUgPSAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xuICAgICAgICAgICAgcnVsZSA9ICEgcnVsZSAgICAgID8ge31cbiAgICAgICAgICAgICAgICAgOiBydWxlID09ICctJyA/IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJyl8fCd7fScpXG4gICAgICAgICAgICAgICAgIDogICAgICAgICAgICAgICBwcmVzZXRbcnVsZV07XG4gICAgICAgICAgICBydWxlID0gTWFqaWFuZy5ydWxlKHJ1bGUpO1xuXG4gICAgICAgICAgICBsZXQgdGltZXIgPSAkKCdpbnB1dFtuYW1lPVwidGltZXJcIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xuICAgICAgICAgICAgdGltZXIgPSB0aW1lci5tYXRjaCgvKFxcZCspL2cpO1xuICAgICAgICAgICAgaWYgKHRpbWVyKSB0aW1lciA9IHRpbWVyLm1hcCh0PT4rdCk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbbmV0cGxheV0gU1RBUlQgZW1pdCwgcm9vbT0nLCByb29tLCAncnVsZSBrZXlzPScsIE9iamVjdC5rZXlzKHJ1bGUpLmxlbmd0aCk7XG4gICAgICAgICAgICBzb2NrLmVtaXQoJ1NUQVJUJywgcm9vbSwgcnVsZSwgdGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tuZXRwbGF5XSBTVEFSVCBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIGFsZXJ0KCflvIDlp4vlr7nlsYDlh7rplJk6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgKCk9PnNldFRpbWVvdXQoaW5pdCwgNTAwKSk7XG4gICAgaWYgKGxvYWRlZCkgJCh3aW5kb3cpLnRyaWdnZXIoJ2xvYWQnKTtcblxuICAgICQoJyN0aXRsZSAubG9naW4gZm9ybScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICQodGhpcykuYXR0cignbWV0aG9kJylcbiAgICAgICAgbGV0IHVybCAgICA9ICQodGhpcykuYXR0cignYWN0aW9uJyk7XG4gICAgICAgIGZldGNoKHVybCwgeyBtZXRob2Q6IG1ldGhvZCwgcmVkaXJlY3Q6ICdtYW51YWwnIH0pLnRoZW4ocmVzID0+e1xuICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gNDA0KSBoaWRlKCQodGhpcykpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCk9PiBsb2FkZWQgPSB0cnVlKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
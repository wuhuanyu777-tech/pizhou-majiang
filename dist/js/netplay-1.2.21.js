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
            // 进房即渲染麻将桌面：4 个座位显示玩家名，空的显示"等待加入…"
            $('body').attr('class','board waiting');
            scale($('#board'), $('#space'));
            const pos = ['main','xiajia','duimian','shangjia'];
            $('#board .board > .player').each((i, el)=>{
                const u = msg.user[i];
                const $el = $(el);
                if (u) {
                    $el.find('.name').text(u.name);
                    $el.removeClass('empty');
                }
                else {
                    $el.find('.name').text('等待加入…');
                    $el.addClass('empty');
                }
                show($el);
            });
            // 中央小浮层：房间号 + 人数状态
            $('#room input[name="room_no"]').val(msg.room_no);
            $('#room .room-status').text(msg.user.length >= 4
                ? '玩家已满 4 人，即将开局…'
                : `等待其他玩家加入…（${msg.user.length}/4）`);
            // 退出房间
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0cGxheS0xLjIuMjEuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7O0FBRWIsUUFBUTtBQUNSLHNDQUFzQzs7QUFFdEMsZUFBZSxtQkFBTyxDQUFDLGlEQUFrQjs7QUFFekM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EseUJBQXlCLFNBQVMsS0FBSyxvQkFBb0I7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIscURBQXFEO0FBQ2hGLDRDQUE0QyxtQkFBbUI7QUFDL0Q7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsZ0JBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQ7O0FBRXJEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0U7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsb0NBQW9DO0FBQ3pEO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTCxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9uZXRwbGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8qIVxuICogIOmbu+iEs+m6u+Wwhjog44ON44OD44OI5a++5oimIHYxLjAuMFxuICpcbiAqICBDb3B5cmlnaHQoQykgMjAxNyBTYXRvc2hpIEtvYmF5YXNoaVxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgeyBoaWRlLCBzaG93LCBmYWRlSW4sIHNjYWxlLFxuICAgICAgICBzZXRTZWxlY3RvciwgY2xlYXJTZWxlY3RvciAgfSA9IE1hamlhbmcuVUkuVXRpbDtcblxuY29uc3QgcHJlc2V0ID0gcmVxdWlyZSgnLi9jb25mL3J1bGUuanNvbicpO1xuXG5jb25zdCBiYXNlID0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKj8kLywnJyk7XG5cbmxldCBsb2FkZWQ7XG5cbi8vIOiwg+ivlemdouadv++8mlVSTCDluKYgP2RlYnVnIOaXtuaYvuekuu+8iOS4tOaXtuiviuaWreeUqO+8iVxuY29uc3QgREVCVUcgPSAhISBsb2NhdGlvbi5zZWFyY2gubWF0Y2goL2RlYnVnLyk7XG5mdW5jdGlvbiBkYmcobXNnKSB7XG4gICAgaWYgKCEgREVCVUcpIHJldHVybjtcbiAgICBsZXQgZWwgPSAkKCcjZGVidWctbG9nJyk7XG4gICAgaWYgKCEgZWwubGVuZ3RoKSB7XG4gICAgICAgIGVsID0gJCgnPGRpdiBpZD1cImRlYnVnLWxvZ1wiPicpLmNzcyh7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJywgYm90dG9tOiAwLCBsZWZ0OiAwLCB6SW5kZXg6IDk5OTk5LFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoMCwwLDAsMC44OCknLCBjb2xvcjogJyMwZjAnLCBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBwYWRkaW5nOiAnNnB4IDEwcHgnLCBtYXhIZWlnaHQ6ICc0MCUnLCBvdmVyZmxvdzogJ2F1dG8nLFxuICAgICAgICAgICAgbWF4V2lkdGg6ICcxMDAlJywgZm9udEZhbWlseTogJ21vbm9zcGFjZScsIHRleHRBbGlnbjogJ2xlZnQnXG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKGVsKTtcbiAgICB9XG4gICAgZWwuYXBwZW5kKCQoJzxkaXY+JykudGV4dCgnWycgKyBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpICsgJ10gJyArIG1zZykpO1xuICAgIGVsLnNjcm9sbFRvcChlbFswXS5zY3JvbGxIZWlnaHQpO1xufVxuXG4kKGZ1bmN0aW9uKCl7XG4gICAgZGJnKCduZXRwbGF5LmpzIOWKoOi9ve+8jGRlYnVnIOaooeW8j+W8gOWQrycpO1xuICAgIGNvbnN0IHBhaSAgID0gTWFqaWFuZy5VSS5wYWkoJCgnI2xvYWRkYXRhJykpO1xuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XG5cbiAgICBjb25zdCBhbmFseXplciA9IChrYWlqdSk9PntcbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdhbmFseXplcicpO1xuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2JvYXJkID4gLmFuYWx5emVyJyksIGthaWp1LCBwYWksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCk9PiQoJ2JvZHknKS5yZW1vdmVDbGFzcygnYW5hbHl6ZXInKSk7XG4gICAgfTtcbiAgICBjb25zdCB2aWV3ZXIgPSAocGFpcHUpPT57XG4gICAgICAgICQoJyNib2FyZCAuY29udHJvbGxlcicpLmFkZENsYXNzKCdwYWlwdScpXG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkJyk7XG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5QYWlwdShcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNib2FyZCcpLCBwYWlwdSwgcGFpLCBhdWRpbywgJ01hamlhbmcucHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmFseXplcik7XG4gICAgfTtcbiAgICBjb25zdCBzdGF0ID0gKHBhaXB1X2xpc3QpPT57XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdzdGF0JykpO1xuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuUGFpcHVTdGF0KCQoJyNzdGF0JyksIHBhaXB1X2xpc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkpO1xuICAgIH07XG4gICAgY29uc3QgZmlsZSA9IG5ldyBNYWppYW5nLlVJLlBhaXB1RmlsZSgkKCcjZmlsZScpLCAnTWFqaWFuZy5uZXRwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0KTtcbiAgICBsZXQgc29jaywgbXl1aWQ7XG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgICAgIGRiZygnaW5pdCgpOiDov57mjqUgc29ja2V0LmlvLi4uJyk7XG4gICAgICAgIHNvY2sgPSBpbygnLycsIHsgcGF0aDogYCR7YmFzZX0vc2VydmVyL3NvY2tldC5pby9gfSk7XG4gICAgICAgIHNvY2sub24oJ2Nvbm5lY3QnLCAoKT0+IGRiZygnc29ja2V0IGNvbm5lY3RlZCcpKTtcbiAgICAgICAgc29jay5vbignSEVMTE8nLCBoZWxsbyk7XG4gICAgICAgIHNvY2sub24oJ1JPT00nLCByb29tKTtcbiAgICAgICAgc29jay5vbignU1RBUlQnLCBzdGFydCk7XG4gICAgICAgIHNvY2sub24oJ0VORCcsIGVuZCk7XG4gICAgICAgIHNvY2sub24oJ0VSUk9SJywgZmlsZS5lcnJvcik7XG4gICAgICAgIHNvY2sub24oJ2Rpc2Nvbm5lY3QnLCAoKT0+e1xuICAgICAgICAgICAgZGJnKCdzb2NrZXQg5pat5byAIScpO1xuICAgICAgICAgICAgaGlkZSgkKCcjZmlsZSAubmV0cGxheSBmb3JtLnJvb20nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGhpZGUoJCgnI3RpdGxlIC5sb2FkaW5nJykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhlbGxvKHVzZXIpIHtcbiAgICAgICAgZGJnKCdIRUxMTzogJyArICh1c2VyID8gKCflt7LnmbvlvZUgJyArIHVzZXIubmFtZSkgOiAn5pyq55m75b2VJykpO1xuICAgICAgICBpZiAoISB1c2VyKSB7XG4gICAgICAgICAgICAvLyDlhY3nmbvlvZXvvJroh6rliqjnlJ/miJDpmo/mnLrnjqnlrrblkI3lubbnmbvlvZXvvJvpmLLlvqrnjq/vvJozIOenkuWGhemHjeWkjeinpuWPkeWImei9rOaJi+WKqFxuICAgICAgICAgICAgY29uc3QgbGFzdCA9ICtsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5hdXRvTG9naW4udCcpO1xuICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0IDwgMzAwMCkge1xuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3RpdGxlJyk7XG4gICAgICAgICAgICAgICAgc2hvdygkKCcjdGl0bGUgLmxvZ2luJykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdNYWppYW5nLmF1dG9Mb2dpbi50JywgRGF0ZS5ub3coKSk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gJ+eOqeWuticgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5MDAwICsgMTAwMCk7XG4gICAgICAgICAgICBmZXRjaCgnc2VydmVyL2F1dGgvJywge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIH0sXG4gICAgICAgICAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyh7IG5hbWUsIHBhc3N3ZDogJyonIH0pLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiAnbWFudWFsJ1xuICAgICAgICAgICAgfSkudGhlbihyZXM9PiB7XG4gICAgICAgICAgICAgICAgLy8gMzAyIOmHjeWumuWQkSA9IOeZu+W9leaIkOWKn++8m+WQpuWImeaYvuekuueZu+W9leihqOWNleWFnOW6lVxuICAgICAgICAgICAgICAgIGlmIChyZXMudHlwZSA9PSAnb3BhcXVlcmVkaXJlY3QnIHx8IHJlcy5zdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICBlbHNlIGZhbGxiYWNrX2xvZ2luKCk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKT0+IGZhbGxiYWNrX2xvZ2luKCkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gZmFsbGJhY2tfbG9naW4oKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywndGl0bGUnKTtcbiAgICAgICAgICAgICAgICBzaG93KCQoJyN0aXRsZSAubG9naW4nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbXl1aWQgPSB1c2VyLnVpZDtcbiAgICAgICAgc2hvdygkKCcjZmlsZSAubmV0cGxheSBmb3JtJykpO1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKTtcbiAgICAgICAgaWYgKHVzZXIuaWNvbilcbiAgICAgICAgICAgICQoJyNmaWxlIC5uZXRwbGF5IGltZycpLmF0dHIoJ3NyYycsIHVzZXIuaWNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RpdGxlJywgdXNlci51aWQpO1xuICAgICAgICAkKCcjZmlsZSAubmV0cGxheSAubmFtZScpLnRleHQodXNlci5uYW1lKTtcbiAgICAgICAgZmlsZS5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByb29tKG1zZykge1xuICAgICAgICBkYmcoJ1JPT00g5pS25YiwOiAnICsgbXNnLnJvb21fbm8gKyAnIOS6uuaVsD0nICsgbXNnLnVzZXIubGVuZ3RoXG4gICAgICAgICAgICArICcg5oiR5piv5oi/5Li7PScgKyAobXNnLnVzZXJbMF0udWlkID09IG15dWlkKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDov5vmiL/ljbPmuLLmn5PpurvlsIbmoYzpnaLvvJo0IOS4quW6p+S9jeaYvuekuueOqeWutuWQje+8jOepuueahOaYvuekulwi562J5b6F5Yqg5YWl4oCmXCJcbiAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkIHdhaXRpbmcnKTtcbiAgICAgICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBbJ21haW4nLCd4aWFqaWEnLCdkdWltaWFuJywnc2hhbmdqaWEnXTtcbiAgICAgICAgICAgICQoJyNib2FyZCAuYm9hcmQgPiAucGxheWVyJykuZWFjaCgoaSwgZWwpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IG1zZy51c2VyW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0ICRlbCA9ICQoZWwpO1xuICAgICAgICAgICAgICAgIGlmICh1KSB7XG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCcubmFtZScpLnRleHQodS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgJGVsLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoJy5uYW1lJykudGV4dCgn562J5b6F5Yqg5YWl4oCmJyk7XG4gICAgICAgICAgICAgICAgICAgICRlbC5hZGRDbGFzcygnZW1wdHknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hvdygkZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyDkuK3lpK7lsI/mta7lsYLvvJrmiL/pl7Tlj7cgKyDkurrmlbDnirbmgIFcbiAgICAgICAgICAgICQoJyNyb29tIGlucHV0W25hbWU9XCJyb29tX25vXCJdJykudmFsKG1zZy5yb29tX25vKTtcbiAgICAgICAgICAgICQoJyNyb29tIC5yb29tLXN0YXR1cycpLnRleHQobXNnLnVzZXIubGVuZ3RoID49IDRcbiAgICAgICAgICAgICAgICA/ICfnjqnlrrblt7Lmu6EgNCDkurrvvIzljbPlsIblvIDlsYDigKYnXG4gICAgICAgICAgICAgICAgOiBg562J5b6F5YW25LuW546p5a625Yqg5YWl4oCm77yIJHttc2cudXNlci5sZW5ndGh9LzTvvIlgKTtcbiAgICAgICAgICAgIC8vIOmAgOWHuuaIv+mXtFxuICAgICAgICAgICAgJCgnI3Jvb20gaW5wdXRbbmFtZT1cInF1aXRcIl0nKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgKCk9PiB7XG4gICAgICAgICAgICAgICAgc29jay5lbWl0KCdST09NJywgbXNnLnJvb21fbm8sIG15dWlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNob3coJCgnI3Jvb20nKSk7XG4gICAgICAgICAgICAvLyDmu6EgNCDkurrvvJrpmpDol4/mta7lsYLvvIzmiL/kuLvoh6rliqjlvIDlsYBcbiAgICAgICAgICAgIGlmIChtc2cudXNlci5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20nKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1zZy51c2VyWzBdLnVpZCA9PSBteXVpZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBydWxlID0gTWFqaWFuZy5ydWxlKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdTVEFSVCcsIG1zZy5yb29tX25vLCBydWxlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIHJvb20oKSDplJnor686JywgZSk7XG4gICAgICAgICAgICBkYmcoJ3Jvb20oKSDplJnor686ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgYWxlcnQoJ+i/m+WFpeaIv+mXtOWksei0pTogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgZGJnKCdTVEFSVCDmlLbliLDvvIzliJ3lp4vljJblr7nlsYAuLi4nKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhpZGUoJCgnI3Jvb20nKSk7ICAgLy8g5byA5bGA5pe26ZqQ6JeP562J5b6F5Y2hXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgTWFqaWFuZy5VSS5QbGF5ZXIoJCgnI2JvYXJkJyksIHBhaSwgYXVkaW8pO1xuICAgICAgICAgICAgcGxheWVyLnZpZXcgID0gbmV3IE1hamlhbmcuVUkuQm9hcmQoJCgnI2JvYXJkIC5ib2FyZCcpLCBwYWksIGF1ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5tb2RlbCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGdhbWVDdGwgPSBuZXcgTWFqaWFuZy5VSS5HYW1lQ3RsKCQoJyNib2FyZCcpLCAnTWFqaWFuZy5wcmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLCBwbGF5ZXIsIHBsYXllci5fdmlldyk7XG4gICAgICAgICAgICBnYW1lQ3RsLl92aWV3Lm5vX3BsYXllcl9uYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBwbGF5ZXIuX3ZpZXcubm9fcGxheWVyX25hbWUgICA9IGZhbHNlOyAgIC8vIOiBlOe9keWvueWxgOaYvuekuueOqeWutuWQje+8iGNvcmUgUGxheWVyIOWPquaciSB2aWV3IHNldHRlcu+8jOmcgOeUqCBfdmlld++8iVxuXG4gICAgICAgICAgICBsZXQgcGxheWVycyA9IFtdO1xuXG4gICAgICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5yZW1vdmVDbGFzcygncGFpcHUnKVxuICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcbiAgICAgICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG4gICAgICAgICAgICBsZXQgc2VxID0gMDtcbiAgICAgICAgICAgIHNvY2sucmVtb3ZlQWxsTGlzdGVuZXJzKCdHQU1FJyk7XG4gICAgICAgICAgICBzb2NrLm9uKCdHQU1FJywgKG1zZyk9PntcbiAgICAgICAgICAgICAgICBpZiAobXNnLnBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVycyA9IG1zZy5wbGF5ZXJzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2cuc2F5KSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5fdmlldy5zYXkobXNnLnNheS5uYW1lLCBtc2cuc2F5LmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2cuc2VxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXEgJiYgbXNnLnNlcSAhPSBzZXEpIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKG1zZywgKHJlcGx5ID0ge30pPT57XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseS5zZXEgPSBtc2cuc2VxO1xuICAgICAgICAgICAgICAgICAgICAgICAgc29jay5lbWl0KCdHQU1FJywgcmVwbHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VxID0gbXNnLnNlcSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXNnLmthaWp1ICYmIG1zZy5rYWlqdS5sb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2cgPSBtc2cua2FpanUubG9nLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZGF0YSBvZiBsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9uKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBsYXllci5fdmlldy5wbGF5ZXJzKHBsYXllcnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIHN0YXJ0KCkg6ZSZ6K+vOicsIGUpO1xuICAgICAgICAgICAgYWxlcnQoJ+WvueWxgOWIneWni+WMluWksei0pTogJyArIGUubWVzc2FnZSArICdcXG4nICsgZS5zdGFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmQocGFpcHUpIHtcbiAgICAgICAgc29jay5yZW1vdmVBbGxMaXN0ZW5lcnMoJ0dBTUUnKTtcbiAgICAgICAgaWYgKHBhaXB1KSBmaWxlLmFkZChwYWlwdSwgMTApO1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKTtcbiAgICAgICAgZmlsZS5yZWRyYXcoKTtcbiAgICAgICAgJCgnI2ZpbGUgaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nKS52YWwoJycpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwcmVzZXQpKSB7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpLnZhbChrZXkpLnRleHQoa2V5KSk7XG4gICAgfVxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJykpIHtcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCgnLScpLnRleHQoJ+OCq+OCueOCv+ODoOODq+ODvOODqycpKTtcbiAgICB9XG5cbiAgICAkKCcjZmlsZSBmb3JtLnJvb20nKS5vbignc3VibWl0JywgKGV2KT0+e1xuICAgICAgICBsZXQgcm9vbSA9ICQoJ2lucHV0W25hbWU9XCJyb29tX25vXCJdJywgJChldi50YXJnZXQpKS52YWwoKTtcbiAgICAgICAgc29jay5lbWl0KCdST09NJywgcm9vbSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcjcm9vbSBmb3JtJykub24oJ3N1Ym1pdCcsIChldik9PntcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCByb29tID0gJCgnaW5wdXRbbmFtZT1cInJvb21fbm9cIl0nLCAkKGV2LnRhcmdldCkpLnZhbCgpO1xuXG4gICAgICAgICAgICBsZXQgcnVsZSA9ICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG4gICAgICAgICAgICBydWxlID0gISBydWxlICAgICAgPyB7fVxuICAgICAgICAgICAgICAgICA6IHJ1bGUgPT0gJy0nID8gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcbiAgICAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgIHByZXNldFtydWxlXTtcbiAgICAgICAgICAgIHJ1bGUgPSBNYWppYW5nLnJ1bGUocnVsZSk7XG5cbiAgICAgICAgICAgIGxldCB0aW1lciA9ICQoJ2lucHV0W25hbWU9XCJ0aW1lclwiXScsICQoZXYudGFyZ2V0KSkudmFsKCk7XG4gICAgICAgICAgICB0aW1lciA9IHRpbWVyLm1hdGNoKC8oXFxkKykvZyk7XG4gICAgICAgICAgICBpZiAodGltZXIpIHRpbWVyID0gdGltZXIubWFwKHQ9Pit0KTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tuZXRwbGF5XSBTVEFSVCBlbWl0LCByb29tPScsIHJvb20sICdydWxlIGtleXM9JywgT2JqZWN0LmtleXMocnVsZSkubGVuZ3RoKTtcbiAgICAgICAgICAgIHNvY2suZW1pdCgnU1RBUlQnLCByb29tLCBydWxlLCB0aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW25ldHBsYXldIFNUQVJUIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgYWxlcnQoJ+W8gOWni+WvueWxgOWHuumUmTogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKT0+c2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKSk7XG5cbiAgICAkKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+c2V0VGltZW91dChpbml0LCA1MDApKTtcbiAgICBpZiAobG9hZGVkKSAkKHdpbmRvdykudHJpZ2dlcignbG9hZCcpO1xuXG4gICAgJCgnI3RpdGxlIC5sb2dpbiBmb3JtJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgbWV0aG9kID0gJCh0aGlzKS5hdHRyKCdtZXRob2QnKVxuICAgICAgICBsZXQgdXJsICAgID0gJCh0aGlzKS5hdHRyKCdhY3Rpb24nKTtcbiAgICAgICAgZmV0Y2godXJsLCB7IG1ldGhvZDogbWV0aG9kLCByZWRpcmVjdDogJ21hbnVhbCcgfSkudGhlbihyZXMgPT57XG4gICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSA0MDQpIGhpZGUoJCh0aGlzKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+IGxvYWRlZCA9IHRydWUpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
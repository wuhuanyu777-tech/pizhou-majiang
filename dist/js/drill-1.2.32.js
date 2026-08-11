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
/*!*************************!*\
  !*** ./src/js/drill.js ***!
  \*************************/
/*!
 *  電脳麻将: 点数計算ドリル v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { hide, show, fadeIn, fadeOut } = Majiang.UI.Util;

const preset = __webpack_require__(/*! ./conf/rule.json */ "./src/js/conf/rule.json");
const view = {};

const feng_hanzi = ['東','南','西','北'];

let player, next_exam, miss_exams, stat;

class Player extends Majiang.AI {
    select_lizhi(p) {
        return this.allow_lizhi(this.shoupai, p) && Math.random() < 0.3;
    }
}

function init_player() {

    let player = new Player();

    let rule = $('select[name="rule"]').val();
    rule = ! rule      ? {}
         : rule == '-' ? JSON.parse(localStorage.getItem('Majiang.rule')||'{}')
         :               preset[rule];
    rule = Majiang.rule(rule);

    player.kaiju({ id: 0, qijia: 0, title: '', player: [], rule: rule });

    return player;
}

function make_exam(player) {
    for (;;) {
        let zhuangfeng = (Math.random()*2)|0;
        let menfeng    = (Math.random()*4)|0;
        let shoupai    = [ '', '', '', '' ];
        let shan = new Majiang.Shan(player._rule);
        let qipai = [];
        for (let i = 0; i < 13; i++) qipai.push(shan.zimo());
        shoupai[menfeng] = (new Majiang.Shoupai(qipai)).toString();
        player.qipai({
            zhuangfeng: zhuangfeng,
            jushu:      [0,3,2,1][menfeng],
            changbang:  0,
            lizhibang:  0,
            defen:      [ 25000, 25000, 25000, 25000 ],
            baopai:     shan.baopai[0],
            shoupai:    shoupai
        });
        player.shan.paishu = shan.paishu + 4;
        let gang = null, lunban = 0;
        while (shan.paishu) {
            let p;
            if (gang) {
                p = shan.gangzimo();
                if (shan._weikaigang) shan.kaigang();
                gang = null;
            }
            else {
                p = shan.zimo();
            }
            let msg = { l: lunban, p: p };
            if (lunban == menfeng) {
                player.zimo(msg);
                if (player.select_hule()) {
                    shan.close();
                    return {
                        shoupai:    player.shoupai,
                        zhuangfeng: zhuangfeng,
                        menfeng:    menfeng,
                        baopai:     shan.baopai,
                        fubaopai:   player.shoupai.lizhi && shan.fubaopai
                    };
                }
                let m = player.select_gang();
                if (m)  {
                    player.gang({ l: menfeng, m: m});
                    gang = m;
                    continue;
                }
                player.dapai({ l: menfeng, p: player.select_dapai()});
            }
            else {
                player.zimo(msg);
                player.dapai(msg);
                player._neng_rong = true;
                if (player.select_hule(msg)) {
                    shan.close();
                    let rongpai
                            = p + ['','+','=','-'][(4 + lunban - menfeng) % 4];
                    return {
                        shoupai:    player.shoupai,
                        rongpai:    rongpai,
                        zhuangfeng: zhuangfeng,
                        menfeng:    menfeng,
                        baopai:     shan.baopai,
                        fubaopai:   player.shoupai.lizhi && shan.fubaopai
                    };
                }
                let m = player.select_fulou(msg);
                if (m) {
                    player.fulou({ l: menfeng, m: m });
                    if (m.match(/^[mpsz]\d{4}/)) {
                        gang = m;
                        continue;
                    }
                    player.dapai({ l: menfeng, p: player.select_dapai()});
                }
            }
            lunban = (lunban + 1) % 4;
        }
    }
}

function parse_fragment(hash) {
    let [ paistr, baopai, fubaopai, zimo, zhuangfeng, menfeng, lizhi ]
            = hash.split('/');
    let shoupai = Majiang.Shoupai.fromString(paistr);
    let rongpai;
    if (zimo != '1' && shoupai._zimo) {
        rongpai = shoupai._zimo + '=';
        shoupai.dapai(shoupai._zimo);
    }
    if (lizhi == '1') {
        shoupai._lizhi = true;
    }
    baopai      = baopai ? baopai.split(',') : [];
    fubaopai    = fubaopai ? fubaopai.split(',')
                : shoupai.lizhi ? [] : null;
    zhuangfeng  = +(zhuangfeng || 0);
    menfeng     = +(menfeng || 0);
    return {
        shoupai:    shoupai,
        rongpai:    rongpai,
        zhuangfeng: zhuangfeng,
        menfeng:    menfeng,
        baopai:     baopai,
        fubaopai:   fubaopai
    };
}

function show_exam(exam) {

    let hule = Majiang.Util.hule(
                    exam.shoupai,
                    exam.rongpai,
                    Majiang.Util.hule_param({
                        rule:       player._rule,
                        zhuangfeng: exam.zhuangfeng,
                        menfeng:    exam.menfeng,
                        baopai:     exam.baopai,
                        fubaopai:   exam.fubaopai,
                        lizhi:      exam.shoupai.lizhi
                    }));

    $('.zhuangfeng').text(feng_hanzi[exam.zhuangfeng]);
    $('.menfeng').text(feng_hanzi[exam.menfeng]);

    if (exam.shoupai.lizhi) show($('.lizhi'));
    else                    hide($('.lizhi'));

    let shan = {
        baopai:   exam.baopai,
        fubaopai: exam.fubaopai,
        paishu:   0
    };
    if (exam.fubaopai) show($('.shan.fubaopai'));
    else               hide($('.shan.fubaopai'));
    view.baopai = new Majiang.UI.Shan($('.shan'), view.pai, shan).redraw(true);

    let shoupai = exam.shoupai.clone();
    if (exam.rongpai) shoupai.zimo(exam.rongpai);

    view.shoupai = new Majiang.UI.Shoupai(
                            $('.shoupai'), view.pai, shoupai
                        ).redraw(true);
    if (exam.rongpai) $('.shoupai .zimo').prepend('<span>ロン</span>');
    else              $('.shoupai .zimo').append('<span>ツモ</span>');

    let defen;
    if (hule && hule.defen) {
        defen = (exam.rongpai ? 'ロン: ' : 'ツモ: ')
              + (exam.rongpai ? hule.defen
                    : exam.menfeng
                        ? (Math.ceil(hule.defen / 200) * 100 / 2)
                            + ' / ' + (Math.floor(hule.defen / 200) * 100)
                        : `${hule.defen / 3}オール`)
              + (hule.damanguan
                  ? (hule.damanguan > 1
                        ? ` (役満 ×${hule.damanguan})`
                        : ' (役満)')
                  : ` (${hule.fu}符 ${hule.fanshu}翻)`);
    }
    else {
        defen = '(役なし)';
    }
    $('.defen').text(defen);

    let hupai = '';
    if (hule && hule.hupai)
        hupai = hule.hupai.map(h =>
                    h.name.match(/^(赤|裏)?ドラ$/)
                        ? `${h.name} ×${h.fanshu}` : h.name
                ).join(' / ');
    $('.hupai').text(hupai);

    stat.total++;

    hide($('.answer'));
    show($('.button'));

    $('.answer button.miss').off('click').on('click', ()=>{
        miss_exams.push(exam);
        next();
    });

    show($('.exam'));
    hide($('.break'));
    show($('.drill'));

    next_exam = null;
    setTimeout(()=>{
        next_exam = miss_exams.splice(Math.random() * 5, 1)[0]
                        || make_exam(player);
    }, 10);
}

function next() {
    hide($('.drill'));
    $('.stat').text(
        `回答数: ${stat.total}、`
        + `正答率: ${(stat.right / stat.total * 100)|0}%`);
    if (stat.total % 10 == 0) take_break();
    else                      show_exam(next_exam || make_exam(player));
}

function take_break() {
    hide($('.exam'));
    show($('.break'));
    show($('.drill'));
}

function restart() {

    hide($('.drill'));
    $('.stat').text('');

    next_exam = null;
    miss_exams = [];
    player = init_player();
    stat = { total:  0, right:  0 };

    if (location.hash)
            show_exam(parse_fragment(location.hash.replace(/^#/,'')));
    else    show_exam(make_exam(player));
}

$(function(){

    view.pai = Majiang.UI.pai('#loaddata');

    for (let key of Object.keys(preset)) {
        $('select[name="rule"]').append($('<option>').val(key).text(key));
    }
    if (localStorage.getItem('Majiang.rule')) {
        $('select[name="rule"]').append($('<option>')
                                .val('-').text('カスタムルール')
                                .attr('selected',true));
    }

    $('select[name="rule"]').on('change', restart);

    $('.button button').on('click', ()=>{
        show($('.answer'));
        hide($('.button'));
    });
    $('.answer button.right').on('click', ()=>{
        stat.right++;
        next();
    });
    $('.break button').on('click', ()=>{
        show_exam(next_exam || make_exam(player));
    });

    restart();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvZHJpbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLyohXHJcbiAqICDpm7vohLPpurvlsIY6IOeCueaVsOioiOeul+ODieODquODqyB2MS4wLjBcclxuICpcclxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXHJcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgZmFkZU91dCB9ID0gTWFqaWFuZy5VSS5VdGlsO1xyXG5cclxuY29uc3QgcHJlc2V0ID0gcmVxdWlyZSgnLi9jb25mL3J1bGUuanNvbicpO1xyXG5jb25zdCB2aWV3ID0ge307XHJcblxyXG5jb25zdCBmZW5nX2hhbnppID0gWyfmnbEnLCfljZcnLCfopb8nLCfljJcnXTtcclxuXHJcbmxldCBwbGF5ZXIsIG5leHRfZXhhbSwgbWlzc19leGFtcywgc3RhdDtcclxuXHJcbmNsYXNzIFBsYXllciBleHRlbmRzIE1hamlhbmcuQUkge1xyXG4gICAgc2VsZWN0X2xpemhpKHApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbGxvd19saXpoaSh0aGlzLnNob3VwYWksIHApICYmIE1hdGgucmFuZG9tKCkgPCAwLjM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRfcGxheWVyKCkge1xyXG5cclxuICAgIGxldCBwbGF5ZXIgPSBuZXcgUGxheWVyKCk7XHJcblxyXG4gICAgbGV0IHJ1bGUgPSAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS52YWwoKTtcclxuICAgIHJ1bGUgPSAhIHJ1bGUgICAgICA/IHt9XHJcbiAgICAgICAgIDogcnVsZSA9PSAnLScgPyBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcclxuICAgICAgICAgOiAgICAgICAgICAgICAgIHByZXNldFtydWxlXTtcclxuICAgIHJ1bGUgPSBNYWppYW5nLnJ1bGUocnVsZSk7XHJcblxyXG4gICAgcGxheWVyLmthaWp1KHsgaWQ6IDAsIHFpamlhOiAwLCB0aXRsZTogJycsIHBsYXllcjogW10sIHJ1bGU6IHJ1bGUgfSk7XHJcblxyXG4gICAgcmV0dXJuIHBsYXllcjtcclxufVxyXG5cclxuZnVuY3Rpb24gbWFrZV9leGFtKHBsYXllcikge1xyXG4gICAgZm9yICg7Oykge1xyXG4gICAgICAgIGxldCB6aHVhbmdmZW5nID0gKE1hdGgucmFuZG9tKCkqMil8MDtcclxuICAgICAgICBsZXQgbWVuZmVuZyAgICA9IChNYXRoLnJhbmRvbSgpKjQpfDA7XHJcbiAgICAgICAgbGV0IHNob3VwYWkgICAgPSBbICcnLCAnJywgJycsICcnIF07XHJcbiAgICAgICAgbGV0IHNoYW4gPSBuZXcgTWFqaWFuZy5TaGFuKHBsYXllci5fcnVsZSk7XHJcbiAgICAgICAgbGV0IHFpcGFpID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMzsgaSsrKSBxaXBhaS5wdXNoKHNoYW4uemltbygpKTtcclxuICAgICAgICBzaG91cGFpW21lbmZlbmddID0gKG5ldyBNYWppYW5nLlNob3VwYWkocWlwYWkpKS50b1N0cmluZygpO1xyXG4gICAgICAgIHBsYXllci5xaXBhaSh7XHJcbiAgICAgICAgICAgIHpodWFuZ2Zlbmc6IHpodWFuZ2ZlbmcsXHJcbiAgICAgICAgICAgIGp1c2h1OiAgICAgIFswLDMsMiwxXVttZW5mZW5nXSxcclxuICAgICAgICAgICAgY2hhbmdiYW5nOiAgMCxcclxuICAgICAgICAgICAgbGl6aGliYW5nOiAgMCxcclxuICAgICAgICAgICAgZGVmZW46ICAgICAgWyAyNTAwMCwgMjUwMDAsIDI1MDAwLCAyNTAwMCBdLFxyXG4gICAgICAgICAgICBiYW9wYWk6ICAgICBzaGFuLmJhb3BhaVswXSxcclxuICAgICAgICAgICAgc2hvdXBhaTogICAgc2hvdXBhaVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5zaGFuLnBhaXNodSA9IHNoYW4ucGFpc2h1ICsgNDtcclxuICAgICAgICBsZXQgZ2FuZyA9IG51bGwsIGx1bmJhbiA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHNoYW4ucGFpc2h1KSB7XHJcbiAgICAgICAgICAgIGxldCBwO1xyXG4gICAgICAgICAgICBpZiAoZ2FuZykge1xyXG4gICAgICAgICAgICAgICAgcCA9IHNoYW4uZ2FuZ3ppbW8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzaGFuLl93ZWlrYWlnYW5nKSBzaGFuLmthaWdhbmcoKTtcclxuICAgICAgICAgICAgICAgIGdhbmcgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcCA9IHNoYW4uemltbygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtc2cgPSB7IGw6IGx1bmJhbiwgcDogcCB9O1xyXG4gICAgICAgICAgICBpZiAobHVuYmFuID09IG1lbmZlbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci56aW1vKG1zZyk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdF9odWxlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaGFuLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdXBhaTogICAgcGxheWVyLnNob3VwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpodWFuZ2Zlbmc6IHpodWFuZ2ZlbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbmZlbmc6ICAgIG1lbmZlbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhb3BhaTogICAgIHNoYW4uYmFvcGFpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWJhb3BhaTogICBwbGF5ZXIuc2hvdXBhaS5saXpoaSAmJiBzaGFuLmZ1YmFvcGFpXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBtID0gcGxheWVyLnNlbGVjdF9nYW5nKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobSkgIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FuZyh7IGw6IG1lbmZlbmcsIG06IG19KTtcclxuICAgICAgICAgICAgICAgICAgICBnYW5nID0gbTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBsYXllci5kYXBhaSh7IGw6IG1lbmZlbmcsIHA6IHBsYXllci5zZWxlY3RfZGFwYWkoKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnppbW8obXNnKTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5kYXBhaShtc2cpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLl9uZW5nX3JvbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RfaHVsZShtc2cpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hhbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByb25ncGFpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHAgKyBbJycsJysnLCc9JywnLSddWyg0ICsgbHVuYmFuIC0gbWVuZmVuZykgJSA0XTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91cGFpOiAgICBwbGF5ZXIuc2hvdXBhaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9uZ3BhaTogICAgcm9uZ3BhaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgemh1YW5nZmVuZzogemh1YW5nZmVuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVuZmVuZzogICAgbWVuZmVuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFvcGFpOiAgICAgc2hhbi5iYW9wYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1YmFvcGFpOiAgIHBsYXllci5zaG91cGFpLmxpemhpICYmIHNoYW4uZnViYW9wYWlcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IG0gPSBwbGF5ZXIuc2VsZWN0X2Z1bG91KG1zZyk7XHJcbiAgICAgICAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5mdWxvdSh7IGw6IG1lbmZlbmcsIG06IG0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0ubWF0Y2goL15bbXBzel1cXGR7NH0vKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW5nID0gbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5kYXBhaSh7IGw6IG1lbmZlbmcsIHA6IHBsYXllci5zZWxlY3RfZGFwYWkoKX0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGx1bmJhbiA9IChsdW5iYW4gKyAxKSAlIDQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZV9mcmFnbWVudChoYXNoKSB7XHJcbiAgICBsZXQgWyBwYWlzdHIsIGJhb3BhaSwgZnViYW9wYWksIHppbW8sIHpodWFuZ2ZlbmcsIG1lbmZlbmcsIGxpemhpIF1cclxuICAgICAgICAgICAgPSBoYXNoLnNwbGl0KCcvJyk7XHJcbiAgICBsZXQgc2hvdXBhaSA9IE1hamlhbmcuU2hvdXBhaS5mcm9tU3RyaW5nKHBhaXN0cik7XHJcbiAgICBsZXQgcm9uZ3BhaTtcclxuICAgIGlmICh6aW1vICE9ICcxJyAmJiBzaG91cGFpLl96aW1vKSB7XHJcbiAgICAgICAgcm9uZ3BhaSA9IHNob3VwYWkuX3ppbW8gKyAnPSc7XHJcbiAgICAgICAgc2hvdXBhaS5kYXBhaShzaG91cGFpLl96aW1vKTtcclxuICAgIH1cclxuICAgIGlmIChsaXpoaSA9PSAnMScpIHtcclxuICAgICAgICBzaG91cGFpLl9saXpoaSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBiYW9wYWkgICAgICA9IGJhb3BhaSA/IGJhb3BhaS5zcGxpdCgnLCcpIDogW107XHJcbiAgICBmdWJhb3BhaSAgICA9IGZ1YmFvcGFpID8gZnViYW9wYWkuc3BsaXQoJywnKVxyXG4gICAgICAgICAgICAgICAgOiBzaG91cGFpLmxpemhpID8gW10gOiBudWxsO1xyXG4gICAgemh1YW5nZmVuZyAgPSArKHpodWFuZ2ZlbmcgfHwgMCk7XHJcbiAgICBtZW5mZW5nICAgICA9ICsobWVuZmVuZyB8fCAwKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hvdXBhaTogICAgc2hvdXBhaSxcclxuICAgICAgICByb25ncGFpOiAgICByb25ncGFpLFxyXG4gICAgICAgIHpodWFuZ2Zlbmc6IHpodWFuZ2ZlbmcsXHJcbiAgICAgICAgbWVuZmVuZzogICAgbWVuZmVuZyxcclxuICAgICAgICBiYW9wYWk6ICAgICBiYW9wYWksXHJcbiAgICAgICAgZnViYW9wYWk6ICAgZnViYW9wYWlcclxuICAgIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dfZXhhbShleGFtKSB7XHJcblxyXG4gICAgbGV0IGh1bGUgPSBNYWppYW5nLlV0aWwuaHVsZShcclxuICAgICAgICAgICAgICAgICAgICBleGFtLnNob3VwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgZXhhbS5yb25ncGFpLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hamlhbmcuVXRpbC5odWxlX3BhcmFtKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZTogICAgICAgcGxheWVyLl9ydWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6aHVhbmdmZW5nOiBleGFtLnpodWFuZ2ZlbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbmZlbmc6ICAgIGV4YW0ubWVuZmVuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFvcGFpOiAgICAgZXhhbS5iYW9wYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1YmFvcGFpOiAgIGV4YW0uZnViYW9wYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpemhpOiAgICAgIGV4YW0uc2hvdXBhaS5saXpoaVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAkKCcuemh1YW5nZmVuZycpLnRleHQoZmVuZ19oYW56aVtleGFtLnpodWFuZ2ZlbmddKTtcclxuICAgICQoJy5tZW5mZW5nJykudGV4dChmZW5nX2hhbnppW2V4YW0ubWVuZmVuZ10pO1xyXG5cclxuICAgIGlmIChleGFtLnNob3VwYWkubGl6aGkpIHNob3coJCgnLmxpemhpJykpO1xyXG4gICAgZWxzZSAgICAgICAgICAgICAgICAgICAgaGlkZSgkKCcubGl6aGknKSk7XHJcblxyXG4gICAgbGV0IHNoYW4gPSB7XHJcbiAgICAgICAgYmFvcGFpOiAgIGV4YW0uYmFvcGFpLFxyXG4gICAgICAgIGZ1YmFvcGFpOiBleGFtLmZ1YmFvcGFpLFxyXG4gICAgICAgIHBhaXNodTogICAwXHJcbiAgICB9O1xyXG4gICAgaWYgKGV4YW0uZnViYW9wYWkpIHNob3coJCgnLnNoYW4uZnViYW9wYWknKSk7XHJcbiAgICBlbHNlICAgICAgICAgICAgICAgaGlkZSgkKCcuc2hhbi5mdWJhb3BhaScpKTtcclxuICAgIHZpZXcuYmFvcGFpID0gbmV3IE1hamlhbmcuVUkuU2hhbigkKCcuc2hhbicpLCB2aWV3LnBhaSwgc2hhbikucmVkcmF3KHRydWUpO1xyXG5cclxuICAgIGxldCBzaG91cGFpID0gZXhhbS5zaG91cGFpLmNsb25lKCk7XHJcbiAgICBpZiAoZXhhbS5yb25ncGFpKSBzaG91cGFpLnppbW8oZXhhbS5yb25ncGFpKTtcclxuXHJcbiAgICB2aWV3LnNob3VwYWkgPSBuZXcgTWFqaWFuZy5VSS5TaG91cGFpKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNob3VwYWknKSwgdmlldy5wYWksIHNob3VwYWlcclxuICAgICAgICAgICAgICAgICAgICAgICAgKS5yZWRyYXcodHJ1ZSk7XHJcbiAgICBpZiAoZXhhbS5yb25ncGFpKSAkKCcuc2hvdXBhaSAuemltbycpLnByZXBlbmQoJzxzcGFuPuODreODszwvc3Bhbj4nKTtcclxuICAgIGVsc2UgICAgICAgICAgICAgICQoJy5zaG91cGFpIC56aW1vJykuYXBwZW5kKCc8c3Bhbj7jg4Tjg6I8L3NwYW4+Jyk7XHJcblxyXG4gICAgbGV0IGRlZmVuO1xyXG4gICAgaWYgKGh1bGUgJiYgaHVsZS5kZWZlbikge1xyXG4gICAgICAgIGRlZmVuID0gKGV4YW0ucm9uZ3BhaSA/ICfjg63jg7M6ICcgOiAn44OE44OiOiAnKVxyXG4gICAgICAgICAgICAgICsgKGV4YW0ucm9uZ3BhaSA/IGh1bGUuZGVmZW5cclxuICAgICAgICAgICAgICAgICAgICA6IGV4YW0ubWVuZmVuZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IChNYXRoLmNlaWwoaHVsZS5kZWZlbiAvIDIwMCkgKiAxMDAgLyAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnIC8gJyArIChNYXRoLmZsb29yKGh1bGUuZGVmZW4gLyAyMDApICogMTAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGAke2h1bGUuZGVmZW4gLyAzfeOCquODvOODq2ApXHJcbiAgICAgICAgICAgICAgKyAoaHVsZS5kYW1hbmd1YW5cclxuICAgICAgICAgICAgICAgICAgPyAoaHVsZS5kYW1hbmd1YW4gPiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCAo5b255rqAIMOXJHtodWxlLmRhbWFuZ3Vhbn0pYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICcgKOW9uea6gCknKVxyXG4gICAgICAgICAgICAgICAgICA6IGAgKCR7aHVsZS5mdX3nrKYgJHtodWxlLmZhbnNodX3nv7spYCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBkZWZlbiA9ICco5b2544Gq44GXKSc7XHJcbiAgICB9XHJcbiAgICAkKCcuZGVmZW4nKS50ZXh0KGRlZmVuKTtcclxuXHJcbiAgICBsZXQgaHVwYWkgPSAnJztcclxuICAgIGlmIChodWxlICYmIGh1bGUuaHVwYWkpXHJcbiAgICAgICAgaHVwYWkgPSBodWxlLmh1cGFpLm1hcChoID0+XHJcbiAgICAgICAgICAgICAgICAgICAgaC5uYW1lLm1hdGNoKC9eKOi1pHzoo48pP+ODieODqSQvKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2gubmFtZX0gw5cke2guZmFuc2h1fWAgOiBoLm5hbWVcclxuICAgICAgICAgICAgICAgICkuam9pbignIC8gJyk7XHJcbiAgICAkKCcuaHVwYWknKS50ZXh0KGh1cGFpKTtcclxuXHJcbiAgICBzdGF0LnRvdGFsKys7XHJcblxyXG4gICAgaGlkZSgkKCcuYW5zd2VyJykpO1xyXG4gICAgc2hvdygkKCcuYnV0dG9uJykpO1xyXG5cclxuICAgICQoJy5hbnN3ZXIgYnV0dG9uLm1pc3MnKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgKCk9PntcclxuICAgICAgICBtaXNzX2V4YW1zLnB1c2goZXhhbSk7XHJcbiAgICAgICAgbmV4dCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvdygkKCcuZXhhbScpKTtcclxuICAgIGhpZGUoJCgnLmJyZWFrJykpO1xyXG4gICAgc2hvdygkKCcuZHJpbGwnKSk7XHJcblxyXG4gICAgbmV4dF9leGFtID0gbnVsbDtcclxuICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICBuZXh0X2V4YW0gPSBtaXNzX2V4YW1zLnNwbGljZShNYXRoLnJhbmRvbSgpICogNSwgMSlbMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbWFrZV9leGFtKHBsYXllcik7XHJcbiAgICB9LCAxMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICBoaWRlKCQoJy5kcmlsbCcpKTtcclxuICAgICQoJy5zdGF0JykudGV4dChcclxuICAgICAgICBg5Zue562U5pWwOiAke3N0YXQudG90YWx944CBYFxyXG4gICAgICAgICsgYOato+etlOeOhzogJHsoc3RhdC5yaWdodCAvIHN0YXQudG90YWwgKiAxMDApfDB9JWApO1xyXG4gICAgaWYgKHN0YXQudG90YWwgJSAxMCA9PSAwKSB0YWtlX2JyZWFrKCk7XHJcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgIHNob3dfZXhhbShuZXh0X2V4YW0gfHwgbWFrZV9leGFtKHBsYXllcikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0YWtlX2JyZWFrKCkge1xyXG4gICAgaGlkZSgkKCcuZXhhbScpKTtcclxuICAgIHNob3coJCgnLmJyZWFrJykpO1xyXG4gICAgc2hvdygkKCcuZHJpbGwnKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc3RhcnQoKSB7XHJcblxyXG4gICAgaGlkZSgkKCcuZHJpbGwnKSk7XHJcbiAgICAkKCcuc3RhdCcpLnRleHQoJycpO1xyXG5cclxuICAgIG5leHRfZXhhbSA9IG51bGw7XHJcbiAgICBtaXNzX2V4YW1zID0gW107XHJcbiAgICBwbGF5ZXIgPSBpbml0X3BsYXllcigpO1xyXG4gICAgc3RhdCA9IHsgdG90YWw6ICAwLCByaWdodDogIDAgfTtcclxuXHJcbiAgICBpZiAobG9jYXRpb24uaGFzaClcclxuICAgICAgICAgICAgc2hvd19leGFtKHBhcnNlX2ZyYWdtZW50KGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKSkpO1xyXG4gICAgZWxzZSAgICBzaG93X2V4YW0obWFrZV9leGFtKHBsYXllcikpO1xyXG59XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdmlldy5wYWkgPSBNYWppYW5nLlVJLnBhaSgnI2xvYWRkYXRhJyk7XHJcblxyXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHByZXNldCkpIHtcclxuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKS52YWwoa2V5KS50ZXh0KGtleSkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKSkge1xyXG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCgnLScpLnRleHQoJ+OCq+OCueOCv+ODoOODq+ODvOODqycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykub24oJ2NoYW5nZScsIHJlc3RhcnQpO1xyXG5cclxuICAgICQoJy5idXR0b24gYnV0dG9uJykub24oJ2NsaWNrJywgKCk9PntcclxuICAgICAgICBzaG93KCQoJy5hbnN3ZXInKSk7XHJcbiAgICAgICAgaGlkZSgkKCcuYnV0dG9uJykpO1xyXG4gICAgfSk7XHJcbiAgICAkKCcuYW5zd2VyIGJ1dHRvbi5yaWdodCcpLm9uKCdjbGljaycsICgpPT57XHJcbiAgICAgICAgc3RhdC5yaWdodCsrO1xyXG4gICAgICAgIG5leHQoKTtcclxuICAgIH0pO1xyXG4gICAgJCgnLmJyZWFrIGJ1dHRvbicpLm9uKCdjbGljaycsICgpPT57XHJcbiAgICAgICAgc2hvd19leGFtKG5leHRfZXhhbSB8fCBtYWtlX2V4YW0ocGxheWVyKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXN0YXJ0KCk7XHJcbn0pO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
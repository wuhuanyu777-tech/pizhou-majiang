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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvZHJpbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDngrnmlbDoqIjnrpfjg4njg6rjg6sgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgZmFkZU91dCB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG5jb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL2NvbmYvcnVsZS5qc29uJyk7XG5jb25zdCB2aWV3ID0ge307XG5cbmNvbnN0IGZlbmdfaGFuemkgPSBbJ+adsScsJ+WNlycsJ+ilvycsJ+WMlyddO1xuXG5sZXQgcGxheWVyLCBuZXh0X2V4YW0sIG1pc3NfZXhhbXMsIHN0YXQ7XG5cbmNsYXNzIFBsYXllciBleHRlbmRzIE1hamlhbmcuQUkge1xuICAgIHNlbGVjdF9saXpoaShwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbG93X2xpemhpKHRoaXMuc2hvdXBhaSwgcCkgJiYgTWF0aC5yYW5kb20oKSA8IDAuMztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXRfcGxheWVyKCkge1xuXG4gICAgbGV0IHBsYXllciA9IG5ldyBQbGF5ZXIoKTtcblxuICAgIGxldCBydWxlID0gJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykudmFsKCk7XG4gICAgcnVsZSA9ICEgcnVsZSAgICAgID8ge31cbiAgICAgICAgIDogcnVsZSA9PSAnLScgPyBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcbiAgICAgICAgIDogICAgICAgICAgICAgICBwcmVzZXRbcnVsZV07XG4gICAgcnVsZSA9IE1hamlhbmcucnVsZShydWxlKTtcblxuICAgIHBsYXllci5rYWlqdSh7IGlkOiAwLCBxaWppYTogMCwgdGl0bGU6ICcnLCBwbGF5ZXI6IFtdLCBydWxlOiBydWxlIH0pO1xuXG4gICAgcmV0dXJuIHBsYXllcjtcbn1cblxuZnVuY3Rpb24gbWFrZV9leGFtKHBsYXllcikge1xuICAgIGZvciAoOzspIHtcbiAgICAgICAgbGV0IHpodWFuZ2ZlbmcgPSAoTWF0aC5yYW5kb20oKSoyKXwwO1xuICAgICAgICBsZXQgbWVuZmVuZyAgICA9IChNYXRoLnJhbmRvbSgpKjQpfDA7XG4gICAgICAgIGxldCBzaG91cGFpICAgID0gWyAnJywgJycsICcnLCAnJyBdO1xuICAgICAgICBsZXQgc2hhbiA9IG5ldyBNYWppYW5nLlNoYW4ocGxheWVyLl9ydWxlKTtcbiAgICAgICAgbGV0IHFpcGFpID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTM7IGkrKykgcWlwYWkucHVzaChzaGFuLnppbW8oKSk7XG4gICAgICAgIHNob3VwYWlbbWVuZmVuZ10gPSAobmV3IE1hamlhbmcuU2hvdXBhaShxaXBhaSkpLnRvU3RyaW5nKCk7XG4gICAgICAgIHBsYXllci5xaXBhaSh7XG4gICAgICAgICAgICB6aHVhbmdmZW5nOiB6aHVhbmdmZW5nLFxuICAgICAgICAgICAganVzaHU6ICAgICAgWzAsMywyLDFdW21lbmZlbmddLFxuICAgICAgICAgICAgY2hhbmdiYW5nOiAgMCxcbiAgICAgICAgICAgIGxpemhpYmFuZzogIDAsXG4gICAgICAgICAgICBkZWZlbjogICAgICBbIDI1MDAwLCAyNTAwMCwgMjUwMDAsIDI1MDAwIF0sXG4gICAgICAgICAgICBiYW9wYWk6ICAgICBzaGFuLmJhb3BhaVswXSxcbiAgICAgICAgICAgIHNob3VwYWk6ICAgIHNob3VwYWlcbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5zaGFuLnBhaXNodSA9IHNoYW4ucGFpc2h1ICsgNDtcbiAgICAgICAgbGV0IGdhbmcgPSBudWxsLCBsdW5iYW4gPSAwO1xuICAgICAgICB3aGlsZSAoc2hhbi5wYWlzaHUpIHtcbiAgICAgICAgICAgIGxldCBwO1xuICAgICAgICAgICAgaWYgKGdhbmcpIHtcbiAgICAgICAgICAgICAgICBwID0gc2hhbi5nYW5nemltbygpO1xuICAgICAgICAgICAgICAgIGlmIChzaGFuLl93ZWlrYWlnYW5nKSBzaGFuLmthaWdhbmcoKTtcbiAgICAgICAgICAgICAgICBnYW5nID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHAgPSBzaGFuLnppbW8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBtc2cgPSB7IGw6IGx1bmJhbiwgcDogcCB9O1xuICAgICAgICAgICAgaWYgKGx1bmJhbiA9PSBtZW5mZW5nKSB7XG4gICAgICAgICAgICAgICAgcGxheWVyLnppbW8obXNnKTtcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdF9odWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhbi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdXBhaTogICAgcGxheWVyLnNob3VwYWksXG4gICAgICAgICAgICAgICAgICAgICAgICB6aHVhbmdmZW5nOiB6aHVhbmdmZW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVuZmVuZzogICAgbWVuZmVuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhb3BhaTogICAgIHNoYW4uYmFvcGFpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnViYW9wYWk6ICAgcGxheWVyLnNob3VwYWkubGl6aGkgJiYgc2hhbi5mdWJhb3BhaVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbSA9IHBsYXllci5zZWxlY3RfZ2FuZygpO1xuICAgICAgICAgICAgICAgIGlmIChtKSAge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FuZyh7IGw6IG1lbmZlbmcsIG06IG19KTtcbiAgICAgICAgICAgICAgICAgICAgZ2FuZyA9IG07XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwbGF5ZXIuZGFwYWkoeyBsOiBtZW5mZW5nLCBwOiBwbGF5ZXIuc2VsZWN0X2RhcGFpKCl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBsYXllci56aW1vKG1zZyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmRhcGFpKG1zZyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLl9uZW5nX3JvbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0X2h1bGUobXNnKSkge1xuICAgICAgICAgICAgICAgICAgICBzaGFuLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb25ncGFpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBwICsgWycnLCcrJywnPScsJy0nXVsoNCArIGx1bmJhbiAtIG1lbmZlbmcpICUgNF07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91cGFpOiAgICBwbGF5ZXIuc2hvdXBhaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbmdwYWk6ICAgIHJvbmdwYWksXG4gICAgICAgICAgICAgICAgICAgICAgICB6aHVhbmdmZW5nOiB6aHVhbmdmZW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVuZmVuZzogICAgbWVuZmVuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhb3BhaTogICAgIHNoYW4uYmFvcGFpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnViYW9wYWk6ICAgcGxheWVyLnNob3VwYWkubGl6aGkgJiYgc2hhbi5mdWJhb3BhaVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbSA9IHBsYXllci5zZWxlY3RfZnVsb3UobXNnKTtcbiAgICAgICAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZnVsb3UoeyBsOiBtZW5mZW5nLCBtOiBtIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobS5tYXRjaCgvXlttcHN6XVxcZHs0fS8pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW5nID0gbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5kYXBhaSh7IGw6IG1lbmZlbmcsIHA6IHBsYXllci5zZWxlY3RfZGFwYWkoKX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGx1bmJhbiA9IChsdW5iYW4gKyAxKSAlIDQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlX2ZyYWdtZW50KGhhc2gpIHtcbiAgICBsZXQgWyBwYWlzdHIsIGJhb3BhaSwgZnViYW9wYWksIHppbW8sIHpodWFuZ2ZlbmcsIG1lbmZlbmcsIGxpemhpIF1cbiAgICAgICAgICAgID0gaGFzaC5zcGxpdCgnLycpO1xuICAgIGxldCBzaG91cGFpID0gTWFqaWFuZy5TaG91cGFpLmZyb21TdHJpbmcocGFpc3RyKTtcbiAgICBsZXQgcm9uZ3BhaTtcbiAgICBpZiAoemltbyAhPSAnMScgJiYgc2hvdXBhaS5femltbykge1xuICAgICAgICByb25ncGFpID0gc2hvdXBhaS5femltbyArICc9JztcbiAgICAgICAgc2hvdXBhaS5kYXBhaShzaG91cGFpLl96aW1vKTtcbiAgICB9XG4gICAgaWYgKGxpemhpID09ICcxJykge1xuICAgICAgICBzaG91cGFpLl9saXpoaSA9IHRydWU7XG4gICAgfVxuICAgIGJhb3BhaSAgICAgID0gYmFvcGFpID8gYmFvcGFpLnNwbGl0KCcsJykgOiBbXTtcbiAgICBmdWJhb3BhaSAgICA9IGZ1YmFvcGFpID8gZnViYW9wYWkuc3BsaXQoJywnKVxuICAgICAgICAgICAgICAgIDogc2hvdXBhaS5saXpoaSA/IFtdIDogbnVsbDtcbiAgICB6aHVhbmdmZW5nICA9ICsoemh1YW5nZmVuZyB8fCAwKTtcbiAgICBtZW5mZW5nICAgICA9ICsobWVuZmVuZyB8fCAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaG91cGFpOiAgICBzaG91cGFpLFxuICAgICAgICByb25ncGFpOiAgICByb25ncGFpLFxuICAgICAgICB6aHVhbmdmZW5nOiB6aHVhbmdmZW5nLFxuICAgICAgICBtZW5mZW5nOiAgICBtZW5mZW5nLFxuICAgICAgICBiYW9wYWk6ICAgICBiYW9wYWksXG4gICAgICAgIGZ1YmFvcGFpOiAgIGZ1YmFvcGFpXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2hvd19leGFtKGV4YW0pIHtcblxuICAgIGxldCBodWxlID0gTWFqaWFuZy5VdGlsLmh1bGUoXG4gICAgICAgICAgICAgICAgICAgIGV4YW0uc2hvdXBhaSxcbiAgICAgICAgICAgICAgICAgICAgZXhhbS5yb25ncGFpLFxuICAgICAgICAgICAgICAgICAgICBNYWppYW5nLlV0aWwuaHVsZV9wYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlOiAgICAgICBwbGF5ZXIuX3J1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB6aHVhbmdmZW5nOiBleGFtLnpodWFuZ2ZlbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW5mZW5nOiAgICBleGFtLm1lbmZlbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYW9wYWk6ICAgICBleGFtLmJhb3BhaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1YmFvcGFpOiAgIGV4YW0uZnViYW9wYWksXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXpoaTogICAgICBleGFtLnNob3VwYWkubGl6aGlcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgJCgnLnpodWFuZ2ZlbmcnKS50ZXh0KGZlbmdfaGFuemlbZXhhbS56aHVhbmdmZW5nXSk7XG4gICAgJCgnLm1lbmZlbmcnKS50ZXh0KGZlbmdfaGFuemlbZXhhbS5tZW5mZW5nXSk7XG5cbiAgICBpZiAoZXhhbS5zaG91cGFpLmxpemhpKSBzaG93KCQoJy5saXpoaScpKTtcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICBoaWRlKCQoJy5saXpoaScpKTtcblxuICAgIGxldCBzaGFuID0ge1xuICAgICAgICBiYW9wYWk6ICAgZXhhbS5iYW9wYWksXG4gICAgICAgIGZ1YmFvcGFpOiBleGFtLmZ1YmFvcGFpLFxuICAgICAgICBwYWlzaHU6ICAgMFxuICAgIH07XG4gICAgaWYgKGV4YW0uZnViYW9wYWkpIHNob3coJCgnLnNoYW4uZnViYW9wYWknKSk7XG4gICAgZWxzZSAgICAgICAgICAgICAgIGhpZGUoJCgnLnNoYW4uZnViYW9wYWknKSk7XG4gICAgdmlldy5iYW9wYWkgPSBuZXcgTWFqaWFuZy5VSS5TaGFuKCQoJy5zaGFuJyksIHZpZXcucGFpLCBzaGFuKS5yZWRyYXcodHJ1ZSk7XG5cbiAgICBsZXQgc2hvdXBhaSA9IGV4YW0uc2hvdXBhaS5jbG9uZSgpO1xuICAgIGlmIChleGFtLnJvbmdwYWkpIHNob3VwYWkuemltbyhleGFtLnJvbmdwYWkpO1xuXG4gICAgdmlldy5zaG91cGFpID0gbmV3IE1hamlhbmcuVUkuU2hvdXBhaShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2hvdXBhaScpLCB2aWV3LnBhaSwgc2hvdXBhaVxuICAgICAgICAgICAgICAgICAgICAgICAgKS5yZWRyYXcodHJ1ZSk7XG4gICAgaWYgKGV4YW0ucm9uZ3BhaSkgJCgnLnNob3VwYWkgLnppbW8nKS5wcmVwZW5kKCc8c3Bhbj7jg63jg7M8L3NwYW4+Jyk7XG4gICAgZWxzZSAgICAgICAgICAgICAgJCgnLnNob3VwYWkgLnppbW8nKS5hcHBlbmQoJzxzcGFuPuODhOODojwvc3Bhbj4nKTtcblxuICAgIGxldCBkZWZlbjtcbiAgICBpZiAoaHVsZSAmJiBodWxlLmRlZmVuKSB7XG4gICAgICAgIGRlZmVuID0gKGV4YW0ucm9uZ3BhaSA/ICfjg63jg7M6ICcgOiAn44OE44OiOiAnKVxuICAgICAgICAgICAgICArIChleGFtLnJvbmdwYWkgPyBodWxlLmRlZmVuXG4gICAgICAgICAgICAgICAgICAgIDogZXhhbS5tZW5mZW5nXG4gICAgICAgICAgICAgICAgICAgICAgICA/IChNYXRoLmNlaWwoaHVsZS5kZWZlbiAvIDIwMCkgKiAxMDAgLyAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJyAvICcgKyAoTWF0aC5mbG9vcihodWxlLmRlZmVuIC8gMjAwKSAqIDEwMClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogYCR7aHVsZS5kZWZlbiAvIDN944Kq44O844OrYClcbiAgICAgICAgICAgICAgKyAoaHVsZS5kYW1hbmd1YW5cbiAgICAgICAgICAgICAgICAgID8gKGh1bGUuZGFtYW5ndWFuID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgICjlvbnmuoAgw5cke2h1bGUuZGFtYW5ndWFufSlgXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICcgKOW9uea6gCknKVxuICAgICAgICAgICAgICAgICAgOiBgICgke2h1bGUuZnV956ymICR7aHVsZS5mYW5zaHV957+7KWApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGVmZW4gPSAnKOW9ueOBquOBlyknO1xuICAgIH1cbiAgICAkKCcuZGVmZW4nKS50ZXh0KGRlZmVuKTtcblxuICAgIGxldCBodXBhaSA9ICcnO1xuICAgIGlmIChodWxlICYmIGh1bGUuaHVwYWkpXG4gICAgICAgIGh1cGFpID0gaHVsZS5odXBhaS5tYXAoaCA9PlxuICAgICAgICAgICAgICAgICAgICBoLm5hbWUubWF0Y2goL14o6LWkfOijjyk/44OJ44OpJC8pXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2gubmFtZX0gw5cke2guZmFuc2h1fWAgOiBoLm5hbWVcbiAgICAgICAgICAgICAgICApLmpvaW4oJyAvICcpO1xuICAgICQoJy5odXBhaScpLnRleHQoaHVwYWkpO1xuXG4gICAgc3RhdC50b3RhbCsrO1xuXG4gICAgaGlkZSgkKCcuYW5zd2VyJykpO1xuICAgIHNob3coJCgnLmJ1dHRvbicpKTtcblxuICAgICQoJy5hbnN3ZXIgYnV0dG9uLm1pc3MnKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgKCk9PntcbiAgICAgICAgbWlzc19leGFtcy5wdXNoKGV4YW0pO1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICBzaG93KCQoJy5leGFtJykpO1xuICAgIGhpZGUoJCgnLmJyZWFrJykpO1xuICAgIHNob3coJCgnLmRyaWxsJykpO1xuXG4gICAgbmV4dF9leGFtID0gbnVsbDtcbiAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgIG5leHRfZXhhbSA9IG1pc3NfZXhhbXMuc3BsaWNlKE1hdGgucmFuZG9tKCkgKiA1LCAxKVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbWFrZV9leGFtKHBsYXllcik7XG4gICAgfSwgMTApO1xufVxuXG5mdW5jdGlvbiBuZXh0KCkge1xuICAgIGhpZGUoJCgnLmRyaWxsJykpO1xuICAgICQoJy5zdGF0JykudGV4dChcbiAgICAgICAgYOWbnuetlOaVsDogJHtzdGF0LnRvdGFsfeOAgWBcbiAgICAgICAgKyBg5q2j562U546HOiAkeyhzdGF0LnJpZ2h0IC8gc3RhdC50b3RhbCAqIDEwMCl8MH0lYCk7XG4gICAgaWYgKHN0YXQudG90YWwgJSAxMCA9PSAwKSB0YWtlX2JyZWFrKCk7XG4gICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICBzaG93X2V4YW0obmV4dF9leGFtIHx8IG1ha2VfZXhhbShwbGF5ZXIpKTtcbn1cblxuZnVuY3Rpb24gdGFrZV9icmVhaygpIHtcbiAgICBoaWRlKCQoJy5leGFtJykpO1xuICAgIHNob3coJCgnLmJyZWFrJykpO1xuICAgIHNob3coJCgnLmRyaWxsJykpO1xufVxuXG5mdW5jdGlvbiByZXN0YXJ0KCkge1xuXG4gICAgaGlkZSgkKCcuZHJpbGwnKSk7XG4gICAgJCgnLnN0YXQnKS50ZXh0KCcnKTtcblxuICAgIG5leHRfZXhhbSA9IG51bGw7XG4gICAgbWlzc19leGFtcyA9IFtdO1xuICAgIHBsYXllciA9IGluaXRfcGxheWVyKCk7XG4gICAgc3RhdCA9IHsgdG90YWw6ICAwLCByaWdodDogIDAgfTtcblxuICAgIGlmIChsb2NhdGlvbi5oYXNoKVxuICAgICAgICAgICAgc2hvd19leGFtKHBhcnNlX2ZyYWdtZW50KGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKSkpO1xuICAgIGVsc2UgICAgc2hvd19leGFtKG1ha2VfZXhhbShwbGF5ZXIpKTtcbn1cblxuJChmdW5jdGlvbigpe1xuXG4gICAgdmlldy5wYWkgPSBNYWppYW5nLlVJLnBhaSgnI2xvYWRkYXRhJyk7XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocHJlc2V0KSkge1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5hcHBlbmQoJCgnPG9wdGlvbj4nKS52YWwoa2V5KS50ZXh0KGtleSkpO1xuICAgIH1cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpKSB7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWwoJy0nKS50ZXh0KCfjgqvjgrnjgr/jg6Djg6vjg7zjg6snKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc2VsZWN0ZWQnLHRydWUpKTtcbiAgICB9XG5cbiAgICAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS5vbignY2hhbmdlJywgcmVzdGFydCk7XG5cbiAgICAkKCcuYnV0dG9uIGJ1dHRvbicpLm9uKCdjbGljaycsICgpPT57XG4gICAgICAgIHNob3coJCgnLmFuc3dlcicpKTtcbiAgICAgICAgaGlkZSgkKCcuYnV0dG9uJykpO1xuICAgIH0pO1xuICAgICQoJy5hbnN3ZXIgYnV0dG9uLnJpZ2h0Jykub24oJ2NsaWNrJywgKCk9PntcbiAgICAgICAgc3RhdC5yaWdodCsrO1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG4gICAgJCgnLmJyZWFrIGJ1dHRvbicpLm9uKCdjbGljaycsICgpPT57XG4gICAgICAgIHNob3dfZXhhbShuZXh0X2V4YW0gfHwgbWFrZV9leGFtKHBsYXllcikpO1xuICAgIH0pO1xuXG4gICAgcmVzdGFydCgpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
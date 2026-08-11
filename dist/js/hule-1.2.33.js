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
/*!************************!*\
  !*** ./src/js/hule.js ***!
  \************************/
/*!
 *  電脳麻将: 和了点計算 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { hide, show, fadeIn, fadeOut } = Majiang.UI.Util;

const preset = __webpack_require__(/*! ./conf/rule.json */ "./src/js/conf/rule.json");
const view = {};

function init(fragment) {

    if (fragment) {

        let [ paistr, baopai, fubaopai, zimo, zhuangfeng, menfeng,
              lizhi, yifa, haidi, lingshang, qianggang, tianhu, rule ]
                    = fragment.split(/\//);
        baopai   = (baopai   || '').split(/,/);
        fubaopai = (fubaopai || '').split(/,/);
        rule     = decodeURIComponent(rule||'');

        $('input[name="paistr"]').val(paistr);
        for (let i = 0; i < baopai.length; i++) {
            $('input[name="baopai"]').eq(i).val(baopai[i]);
        }
        for (let i = 0; i < fubaopai.length; i++) {
            $('input[name="fubaopai"]').eq(i).val(fubaopai[i]);
        }
        $(`input[name="zimo"][value="${zimo}"]`).click();
        $('select[name="zhuangfeng"]').val(zhuangfeng || 0);
        $('select[name="menfeng"]').val(menfeng || 0);
        $(`input[name="lizhi"][value="${lizhi}"]`).click();
        if (+yifa)      $('input[name="yifa"]').click();
        if (+haidi)     $('input[name="haidi"]').click();
        if (+lingshang) $('input[name="lingshang"]').click();
        if (+qianggang) $('input[name="qianggang"]').click();
        if (+tianhu)    $('input[name="tianhu"]').click();
        if (rule)       $('select[name="rule"]').val(rule);

        $('form').submit();
    }
    else {
        let paistr = 'm123p123z1z1,s1-23,z222=';
        let baopai = ['z1'];

        $('input[name="paistr"]').val(paistr).focus();
        for (let i = 0; i < baopai.length; i++) {
            $('input[name="baopai"]').eq(i).val(baopai[i]);
        }
    }
}

function submit() {

    let paistr = $('input[name="paistr"]').val();
    if (! paistr) {
        return false;
    }
    let shoupai = Majiang.Shoupai.fromString(paistr);
    $('input[name="paistr"]').val(shoupai.toString());

    let rongpai;
    if ($('input[name="zimo"]:checked').val() == 0) {
        if (shoupai._zimo) {
            rongpai = shoupai._zimo + '=';
            shoupai.dapai(shoupai._zimo);
        }
    }

    if (! shoupai.menqian) {
        $('input[name="lizhi"]').prop('checked', false);
        $('input[name="fubaopai"]').parent().addClass('hide');
        $('input[name="yifa"]').prop('checked', false)
                               .prop('disabled', true);
        $('input[name="tianhu"]').prop('checked', false);
    }
    if (! shoupai._fulou
            .find(m=>m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1.*\1.*$/)))
    {
        $('input[name="lingshang"]').prop('checked', false);
    }

    let baopai   = $.makeArray($('input[name="baopai"]'))
                        .map(n => Majiang.Shoupai.valid_pai($(n).val()))
                        .filter(p => p);
    let fubaopai = $.makeArray($('input[name="fubaopai"]'))
                        .map(n => Majiang.Shoupai.valid_pai($(n).val()))
                        .filter(p => p);

    let lizhi = + $('input[name="lizhi"]:checked').val() || 0;

    let rule = $('select[name="rule"]').val();
    rule = ! rule      ? {}
         : rule == '-' ? JSON.parse(localStorage.getItem('Majiang.rule')||'{}')
         :               preset[rule];
    rule = Majiang.rule(rule);

    if (! rule['一発あり']) {
        $('input[name="yifa"]').prop('checked', false);
    }
    if (! rule['カンドラあり']) {
        while (baopai.length > 1) baopai.pop();
        while (fubaopai.length > 1) fubaopai.pop();
    }
    if (! rule['カン裏あり']) {
        while (fubaopai.length > 1) fubaopai.pop();
    }
    if (! rule['裏ドラあり']) {
        fubaopai = null;
    }

    let param = {
        rule:       rule,
        zhuangfeng: + $('select[name="zhuangfeng"]').val(),
        menfeng:    + $('select[name="menfeng"]').val(),
        hupai: {
            lizhi:      lizhi,
            yifa:       $('input[name="yifa"]').prop('checked'),
            qianggang:  $('input[name="qianggang"]').prop('checked'),
            lingshang:  $('input[name="lingshang"]').prop('checked'),
            haidi:      ! $('input[name="haidi"]').prop('checked') ? 0
                            : ! rongpai                            ? 1
                            :                                        2,
            tianhu:     + $('input[name="tianhu"]:checked').val() || 0,
        },
        baopai:     baopai,
        fubaopai:   lizhi ? fubaopai : null,
        jicun:      { changbang: 0, lizhibang: 0 }
    };

    let hule = Majiang.Util.hule(shoupai, rongpai, param) || {};

    const model = {
        player: ['','','',''],
        defen:  [0,0,0,0],
        changbang: param.jicun.changbang,
        lizhibang: param.jicun.lizhibang,
        shan: {
            baopai:   param.baopai,
            fubaopai: param.fubaopai,
            paishu:   0
        },
        player_id:  [0,1,2,3],
    };
    const paipu = {
        l:          param.menfeng,
        shoupai:    paistr,
        baojia:     rongpai ? (param.menfeng + 2) % 4 : null,
        fubaopai:   param.fubaopai,
        fu:         hule.fu,
        fanshu:     hule.fanshu,
        damanguan:  hule.damanguan,
        defen:      hule.defen,
        hupai:      hule.hupai,
        fenpei:     hule.fenpei,
    };

    new Majiang.UI.HuleDialog($('.hule-dialog'), view.pai, model).hule(paipu);
    fadeIn($('.hule-dialog'));

    $('input[name="baopai"]').val('');
    for (let i = 0; i < baopai.length; i++) {
        $('input[name="baopai"]').eq(i).val(baopai[i]);
    }
    $('input[name="fubaopai"]').val('');
    if (! fubaopai) fubaopai = [];
    for (let i = 0; i < fubaopai.length; i++) {
        $('input[name="fubaopai"]').eq(i).val(fubaopai[i]);
    }

    let fragment = '#' + [
                    paistr,
                    baopai.join(','),
                    fubaopai.join(','),
                    $('input[name="zimo"]:checked').val(),
                    $('select[name="zhuangfeng"]').val(),
                    $('select[name="menfeng"]').val(),
                    $('input[name="lizhi"]:checked').val(),
                    + $('input[name="yifa"]').prop('checked'),
                    + $('input[name="haidi"]').prop('checked'),
                    + $('input[name="lingshang"]').prop('checked'),
                    + $('input[name="qianggang"]').prop('checked'),
                    + $('input[name="tianhu"]:checked').val() || 0
                ].join('/');
    rule = $('select[name="rule"]').val();
    if (rule) fragment += `/${rule}`;

    if (rule == '-')
            history.replaceState('', '', location.href.replace(/#.*$/,''));
    else    history.replaceState('', '', fragment);

    return false;
}

$(function(){

    view.pai = Majiang.UI.pai('#loaddata');

    for (let key of Object.keys(preset)) {
        $('select[name="rule"]').append($('<option>').val(key).text(key));
    }
    if (localStorage.getItem('Majiang.rule')) {
        $('select[name="rule"]').append($('<option>')
                                .val('-').text('カスタムルール'));
    }

    $('form').on('submit', submit);

    $('form').on('reset', function(){
        hide($('.hule-dialog'));
        $('input[name="fubaopai"]').parent().addClass('hide');
        $('input[name="tianhu"]').next().text('地和');
        $('input[name="tianhu"]').val(2);
        $('form input[name="paistr"]').focus();
    });

    $('input[name="zimo"]').on('change', function(){
        if ($(this, ':checked').val() == 1) {
            $('input[name="qianggang"]').prop('checked', false);
        }
        else {
            $('input[name="lingshang"]').prop('checked', false);
            $('input[name="tianhu"]').prop('checked', false);
        }
    });
    $('select[name="menfeng"]').on('change', function(){
        if ($(this, ':selected').val() == 0) {
            $('input[name="tianhu"]').next().text('天和');
            $('input[name="tianhu"]').val(1);
        }
        else {
            $('input[name="tianhu"]').next().text('地和');
            $('input[name="tianhu"]').val(2);
        }
    });
    $('input[name="lizhi"]').on('change', function(){
        if ($(this).prop('checked')) {
            let val = $(this).val() == 1 ? 2 : 1;
            $(`input[name="lizhi"][value="${val}"]`).prop('checked', false);
            $('input[name="fubaopai"]').parent().removeClass('hide');
            $('input[name="yifa"]').prop('disabled', false);
            $('input[name="tianhu"]').prop('checked', false);
        }
        else {
            $('input[name="fubaopai"]').parent().addClass('hide');
            $('input[name="yifa"]').prop('checked', false)
                                   .prop('disabled', true);
        }
    });
    $('input[name="yifa"]').on('change', function(){
        if ($(this).prop('checked')) {
            $('input[name="lingshang"]').prop('checked', false);
        }
    });
    $('input[name="haidi"]').on('change', function(){
        if ($(this).prop('checked')) {
            $('input[name="lingshang"]').prop('checked', false);
            $('input[name="qianggang"]').prop('checked', false);
            $('input[name="tianhu"]').prop('checked', false);
        }
    });
    $('input[name="lingshang"]').on('change', function(){
        if ($(this).prop('checked')) {
            $('input[name="yifa"]').prop('checked', false);
            $('input[name="haidi"]').prop('checked', false);
            $('input[name="qianggang"]').prop('checked', false);
            $('input[name="tianhu"]').prop('checked', false);
            $('input[name="zimo"][value="1"]').click();
        }
    });
    $('input[name="qianggang"]').on('change', function(){
        if ($(this).prop('checked')) {
            $('input[name="haidi"]').prop('checked', false);
            $('input[name="lingshang"]').prop('checked', false);
            $('input[name="tianhu"]').prop('checked', false);
            $('input[name="zimo"][value="0"]').click();
        }
    });
    $('input[name="tianhu"]').on('change', function(){
        if ($(this).prop('checked')) {
            $('input[name="lizhi"]').prop('checked', false);
            $('input[name="fubaopai"]').parent().addClass('hide');
            $('input[name="yifa"]').prop('checked', false)
                                   .prop('disabled', true);
            $('input[name="haidi"]').prop('checked', false);
            $('input[name="lingshang"]').prop('checked', false);
            $('input[name="qianggang"]').prop('checked', false);
            $('input[name="zimo"][value="1"]').click();
        }
    });

    let fragment = location.hash.replace(/^#/,'');
    init(fragment);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvaHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvKiFcclxuICogIOmbu+iEs+m6u+Wwhjog5ZKM5LqG54K56KiI566XIHYxLjAuMFxyXG4gKlxyXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcclxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBmYWRlT3V0IH0gPSBNYWppYW5nLlVJLlV0aWw7XHJcblxyXG5jb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL2NvbmYvcnVsZS5qc29uJyk7XHJcbmNvbnN0IHZpZXcgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGluaXQoZnJhZ21lbnQpIHtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgbGV0IFsgcGFpc3RyLCBiYW9wYWksIGZ1YmFvcGFpLCB6aW1vLCB6aHVhbmdmZW5nLCBtZW5mZW5nLFxyXG4gICAgICAgICAgICAgIGxpemhpLCB5aWZhLCBoYWlkaSwgbGluZ3NoYW5nLCBxaWFuZ2dhbmcsIHRpYW5odSwgcnVsZSBdXHJcbiAgICAgICAgICAgICAgICAgICAgPSBmcmFnbWVudC5zcGxpdCgvXFwvLyk7XHJcbiAgICAgICAgYmFvcGFpICAgPSAoYmFvcGFpICAgfHwgJycpLnNwbGl0KC8sLyk7XHJcbiAgICAgICAgZnViYW9wYWkgPSAoZnViYW9wYWkgfHwgJycpLnNwbGl0KC8sLyk7XHJcbiAgICAgICAgcnVsZSAgICAgPSBkZWNvZGVVUklDb21wb25lbnQocnVsZXx8JycpO1xyXG5cclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKHBhaXN0cik7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYW9wYWkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLmVxKGkpLnZhbChiYW9wYWlbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1YmFvcGFpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLmVxKGkpLnZhbChmdWJhb3BhaVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoYGlucHV0W25hbWU9XCJ6aW1vXCJdW3ZhbHVlPVwiJHt6aW1vfVwiXWApLmNsaWNrKCk7XHJcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJ6aHVhbmdmZW5nXCJdJykudmFsKHpodWFuZ2ZlbmcgfHwgMCk7XHJcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJtZW5mZW5nXCJdJykudmFsKG1lbmZlbmcgfHwgMCk7XHJcbiAgICAgICAgJChgaW5wdXRbbmFtZT1cImxpemhpXCJdW3ZhbHVlPVwiJHtsaXpoaX1cIl1gKS5jbGljaygpO1xyXG4gICAgICAgIGlmICgreWlmYSkgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLmNsaWNrKCk7XHJcbiAgICAgICAgaWYgKCtoYWlkaSkgICAgICQoJ2lucHV0W25hbWU9XCJoYWlkaVwiXScpLmNsaWNrKCk7XHJcbiAgICAgICAgaWYgKCtsaW5nc2hhbmcpICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5jbGljaygpO1xyXG4gICAgICAgIGlmICgrcWlhbmdnYW5nKSAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykuY2xpY2soKTtcclxuICAgICAgICBpZiAoK3RpYW5odSkgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLmNsaWNrKCk7XHJcbiAgICAgICAgaWYgKHJ1bGUpICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLnZhbChydWxlKTtcclxuXHJcbiAgICAgICAgJCgnZm9ybScpLnN1Ym1pdCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbGV0IHBhaXN0ciA9ICdtMTIzcDEyM3oxejEsczEtMjMsejIyMj0nO1xyXG4gICAgICAgIGxldCBiYW9wYWkgPSBbJ3oxJ107XHJcblxyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwocGFpc3RyKS5mb2N1cygpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFvcGFpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcShpKS52YWwoYmFvcGFpW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN1Ym1pdCgpIHtcclxuXHJcbiAgICBsZXQgcGFpc3RyID0gJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbCgpO1xyXG4gICAgaWYgKCEgcGFpc3RyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgbGV0IHNob3VwYWkgPSBNYWppYW5nLlNob3VwYWkuZnJvbVN0cmluZyhwYWlzdHIpO1xyXG4gICAgJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbChzaG91cGFpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgIGxldCByb25ncGFpO1xyXG4gICAgaWYgKCQoJ2lucHV0W25hbWU9XCJ6aW1vXCJdOmNoZWNrZWQnKS52YWwoKSA9PSAwKSB7XHJcbiAgICAgICAgaWYgKHNob3VwYWkuX3ppbW8pIHtcclxuICAgICAgICAgICAgcm9uZ3BhaSA9IHNob3VwYWkuX3ppbW8gKyAnPSc7XHJcbiAgICAgICAgICAgIHNob3VwYWkuZGFwYWkoc2hvdXBhaS5femltbyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghIHNob3VwYWkubWVucWlhbikge1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJsaXpoaVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImZ1YmFvcGFpXCJdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgaWYgKCEgc2hvdXBhaS5fZnVsb3VcclxuICAgICAgICAgICAgLmZpbmQobT0+bS5yZXBsYWNlKC8wL2csJzUnKS5tYXRjaCgvXlttcHN6XShcXGQpXFwxXFwxLipcXDEuKiQvKSkpXHJcbiAgICB7XHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGJhb3BhaSAgID0gJC5tYWtlQXJyYXkoJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKG4gPT4gTWFqaWFuZy5TaG91cGFpLnZhbGlkX3BhaSgkKG4pLnZhbCgpKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihwID0+IHApO1xyXG4gICAgbGV0IGZ1YmFvcGFpID0gJC5tYWtlQXJyYXkoJCgnaW5wdXRbbmFtZT1cImZ1YmFvcGFpXCJdJykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAobiA9PiBNYWppYW5nLlNob3VwYWkudmFsaWRfcGFpKCQobikudmFsKCkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4gcCk7XHJcblxyXG4gICAgbGV0IGxpemhpID0gKyAkKCdpbnB1dFtuYW1lPVwibGl6aGlcIl06Y2hlY2tlZCcpLnZhbCgpIHx8IDA7XHJcblxyXG4gICAgbGV0IHJ1bGUgPSAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS52YWwoKTtcclxuICAgIHJ1bGUgPSAhIHJ1bGUgICAgICA/IHt9XHJcbiAgICAgICAgIDogcnVsZSA9PSAnLScgPyBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcclxuICAgICAgICAgOiAgICAgICAgICAgICAgIHByZXNldFtydWxlXTtcclxuICAgIHJ1bGUgPSBNYWppYW5nLnJ1bGUocnVsZSk7XHJcblxyXG4gICAgaWYgKCEgcnVsZVsn5LiA55m644GC44KKJ10pIHtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoISBydWxlWyfjgqvjg7Pjg4njg6njgYLjgoonXSkge1xyXG4gICAgICAgIHdoaWxlIChiYW9wYWkubGVuZ3RoID4gMSkgYmFvcGFpLnBvcCgpO1xyXG4gICAgICAgIHdoaWxlIChmdWJhb3BhaS5sZW5ndGggPiAxKSBmdWJhb3BhaS5wb3AoKTtcclxuICAgIH1cclxuICAgIGlmICghIHJ1bGVbJ+OCq+ODs+ijj+OBguOCiiddKSB7XHJcbiAgICAgICAgd2hpbGUgKGZ1YmFvcGFpLmxlbmd0aCA+IDEpIGZ1YmFvcGFpLnBvcCgpO1xyXG4gICAgfVxyXG4gICAgaWYgKCEgcnVsZVsn6KOP44OJ44Op44GC44KKJ10pIHtcclxuICAgICAgICBmdWJhb3BhaSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBhcmFtID0ge1xyXG4gICAgICAgIHJ1bGU6ICAgICAgIHJ1bGUsXHJcbiAgICAgICAgemh1YW5nZmVuZzogKyAkKCdzZWxlY3RbbmFtZT1cInpodWFuZ2ZlbmdcIl0nKS52YWwoKSxcclxuICAgICAgICBtZW5mZW5nOiAgICArICQoJ3NlbGVjdFtuYW1lPVwibWVuZmVuZ1wiXScpLnZhbCgpLFxyXG4gICAgICAgIGh1cGFpOiB7XHJcbiAgICAgICAgICAgIGxpemhpOiAgICAgIGxpemhpLFxyXG4gICAgICAgICAgICB5aWZhOiAgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgcWlhbmdnYW5nOiAgJCgnaW5wdXRbbmFtZT1cInFpYW5nZ2FuZ1wiXScpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgbGluZ3NoYW5nOiAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgaGFpZGk6ICAgICAgISAkKCdpbnB1dFtuYW1lPVwiaGFpZGlcIl0nKS5wcm9wKCdjaGVja2VkJykgPyAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICEgcm9uZ3BhaSAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgdGlhbmh1OiAgICAgKyAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdOmNoZWNrZWQnKS52YWwoKSB8fCAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmFvcGFpOiAgICAgYmFvcGFpLFxyXG4gICAgICAgIGZ1YmFvcGFpOiAgIGxpemhpID8gZnViYW9wYWkgOiBudWxsLFxyXG4gICAgICAgIGppY3VuOiAgICAgIHsgY2hhbmdiYW5nOiAwLCBsaXpoaWJhbmc6IDAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgaHVsZSA9IE1hamlhbmcuVXRpbC5odWxlKHNob3VwYWksIHJvbmdwYWksIHBhcmFtKSB8fCB7fTtcclxuXHJcbiAgICBjb25zdCBtb2RlbCA9IHtcclxuICAgICAgICBwbGF5ZXI6IFsnJywnJywnJywnJ10sXHJcbiAgICAgICAgZGVmZW46ICBbMCwwLDAsMF0sXHJcbiAgICAgICAgY2hhbmdiYW5nOiBwYXJhbS5qaWN1bi5jaGFuZ2JhbmcsXHJcbiAgICAgICAgbGl6aGliYW5nOiBwYXJhbS5qaWN1bi5saXpoaWJhbmcsXHJcbiAgICAgICAgc2hhbjoge1xyXG4gICAgICAgICAgICBiYW9wYWk6ICAgcGFyYW0uYmFvcGFpLFxyXG4gICAgICAgICAgICBmdWJhb3BhaTogcGFyYW0uZnViYW9wYWksXHJcbiAgICAgICAgICAgIHBhaXNodTogICAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF5ZXJfaWQ6ICBbMCwxLDIsM10sXHJcbiAgICB9O1xyXG4gICAgY29uc3QgcGFpcHUgPSB7XHJcbiAgICAgICAgbDogICAgICAgICAgcGFyYW0ubWVuZmVuZyxcclxuICAgICAgICBzaG91cGFpOiAgICBwYWlzdHIsXHJcbiAgICAgICAgYmFvamlhOiAgICAgcm9uZ3BhaSA/IChwYXJhbS5tZW5mZW5nICsgMikgJSA0IDogbnVsbCxcclxuICAgICAgICBmdWJhb3BhaTogICBwYXJhbS5mdWJhb3BhaSxcclxuICAgICAgICBmdTogICAgICAgICBodWxlLmZ1LFxyXG4gICAgICAgIGZhbnNodTogICAgIGh1bGUuZmFuc2h1LFxyXG4gICAgICAgIGRhbWFuZ3VhbjogIGh1bGUuZGFtYW5ndWFuLFxyXG4gICAgICAgIGRlZmVuOiAgICAgIGh1bGUuZGVmZW4sXHJcbiAgICAgICAgaHVwYWk6ICAgICAgaHVsZS5odXBhaSxcclxuICAgICAgICBmZW5wZWk6ICAgICBodWxlLmZlbnBlaSxcclxuICAgIH07XHJcblxyXG4gICAgbmV3IE1hamlhbmcuVUkuSHVsZURpYWxvZygkKCcuaHVsZS1kaWFsb2cnKSwgdmlldy5wYWksIG1vZGVsKS5odWxlKHBhaXB1KTtcclxuICAgIGZhZGVJbigkKCcuaHVsZS1kaWFsb2cnKSk7XHJcblxyXG4gICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLnZhbCgnJyk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhb3BhaS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcShpKS52YWwoYmFvcGFpW2ldKTtcclxuICAgIH1cclxuICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLnZhbCgnJyk7XHJcbiAgICBpZiAoISBmdWJhb3BhaSkgZnViYW9wYWkgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnViYW9wYWkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZnViYW9wYWlcIl0nKS5lcShpKS52YWwoZnViYW9wYWlbaV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmcmFnbWVudCA9ICcjJyArIFtcclxuICAgICAgICAgICAgICAgICAgICBwYWlzdHIsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFvcGFpLmpvaW4oJywnKSxcclxuICAgICAgICAgICAgICAgICAgICBmdWJhb3BhaS5qb2luKCcsJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInppbW9cIl06Y2hlY2tlZCcpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICQoJ3NlbGVjdFtuYW1lPVwiemh1YW5nZmVuZ1wiXScpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICQoJ3NlbGVjdFtuYW1lPVwibWVuZmVuZ1wiXScpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJsaXpoaVwiXTpjaGVja2VkJykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgKyAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgICAgICAgICArICQoJ2lucHV0W25hbWU9XCJoYWlkaVwiXScpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgICAgICAgICArICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5wcm9wKCdjaGVja2VkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgKyAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICsgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXTpjaGVja2VkJykudmFsKCkgfHwgMFxyXG4gICAgICAgICAgICAgICAgXS5qb2luKCcvJyk7XHJcbiAgICBydWxlID0gJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykudmFsKCk7XHJcbiAgICBpZiAocnVsZSkgZnJhZ21lbnQgKz0gYC8ke3J1bGV9YDtcclxuXHJcbiAgICBpZiAocnVsZSA9PSAnLScpXHJcbiAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8jLiokLywnJykpO1xyXG4gICAgZWxzZSAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGZyYWdtZW50KTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHJcbiAgICB2aWV3LnBhaSA9IE1hamlhbmcuVUkucGFpKCcjbG9hZGRhdGEnKTtcclxuXHJcbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocHJlc2V0KSkge1xyXG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpLnZhbChrZXkpLnRleHQoa2V5KSk7XHJcbiAgICB9XHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpKSB7XHJcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsKCctJykudGV4dCgn44Kr44K544K/44Og44Or44O844OrJykpO1xyXG4gICAgfVxyXG5cclxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0Jywgc3VibWl0KTtcclxuXHJcbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgZnVuY3Rpb24oKXtcclxuICAgICAgICBoaWRlKCQoJy5odWxlLWRpYWxvZycpKTtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZnViYW9wYWlcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcygnaGlkZScpO1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5uZXh0KCkudGV4dCgn5Zyw5ZKMJyk7XHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLnZhbCgyKTtcclxuICAgICAgICAkKCdmb3JtIGlucHV0W25hbWU9XCJwYWlzdHJcIl0nKS5mb2N1cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnaW5wdXRbbmFtZT1cInppbW9cIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzLCAnOmNoZWNrZWQnKS52YWwoKSA9PSAxKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJxaWFuZ2dhbmdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgJCgnc2VsZWN0W25hbWU9XCJtZW5mZW5nXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKCQodGhpcywgJzpzZWxlY3RlZCcpLnZhbCgpID09IDApIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLm5leHQoKS50ZXh0KCflpKnlkownKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLnZhbCgxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5uZXh0KCkudGV4dCgn5Zyw5ZKMJyk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS52YWwoMik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwibGl6aGlcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9ICQodGhpcykudmFsKCkgPT0gMSA/IDIgOiAxO1xyXG4gICAgICAgICAgICAkKGBpbnB1dFtuYW1lPVwibGl6aGlcIl1bdmFsdWU9XCIke3ZhbH1cIl1gKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZnViYW9wYWlcIl0nKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaGlkZScpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ5aWZhXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgJCgnaW5wdXRbbmFtZT1cInlpZmFcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwiaGFpZGlcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJxaWFuZ2dhbmdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInlpZmFcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiaGFpZGlcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ6aW1vXCJdW3ZhbHVlPVwiMVwiXScpLmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJoYWlkaVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInppbW9cIl1bdmFsdWU9XCIwXCJdJykuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpemhpXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImZ1YmFvcGFpXCJdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInlpZmFcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJoYWlkaVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInppbW9cIl1bdmFsdWU9XCIxXCJdJykuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgZnJhZ21lbnQgPSBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJyk7XHJcbiAgICBpbml0KGZyYWdtZW50KTtcclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
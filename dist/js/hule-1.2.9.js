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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL2h1bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDlkozkuobngrnoqIjnrpcgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgZmFkZU91dCB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG5jb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL2NvbmYvcnVsZS5qc29uJyk7XG5jb25zdCB2aWV3ID0ge307XG5cbmZ1bmN0aW9uIGluaXQoZnJhZ21lbnQpIHtcblxuICAgIGlmIChmcmFnbWVudCkge1xuXG4gICAgICAgIGxldCBbIHBhaXN0ciwgYmFvcGFpLCBmdWJhb3BhaSwgemltbywgemh1YW5nZmVuZywgbWVuZmVuZyxcbiAgICAgICAgICAgICAgbGl6aGksIHlpZmEsIGhhaWRpLCBsaW5nc2hhbmcsIHFpYW5nZ2FuZywgdGlhbmh1LCBydWxlIF1cbiAgICAgICAgICAgICAgICAgICAgPSBmcmFnbWVudC5zcGxpdCgvXFwvLyk7XG4gICAgICAgIGJhb3BhaSAgID0gKGJhb3BhaSAgIHx8ICcnKS5zcGxpdCgvLC8pO1xuICAgICAgICBmdWJhb3BhaSA9IChmdWJhb3BhaSB8fCAnJykuc3BsaXQoLywvKTtcbiAgICAgICAgcnVsZSAgICAgPSBkZWNvZGVVUklDb21wb25lbnQocnVsZXx8JycpO1xuXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwocGFpc3RyKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYW9wYWkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcShpKS52YWwoYmFvcGFpW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1YmFvcGFpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZnViYW9wYWlcIl0nKS5lcShpKS52YWwoZnViYW9wYWlbaV0pO1xuICAgICAgICB9XG4gICAgICAgICQoYGlucHV0W25hbWU9XCJ6aW1vXCJdW3ZhbHVlPVwiJHt6aW1vfVwiXWApLmNsaWNrKCk7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwiemh1YW5nZmVuZ1wiXScpLnZhbCh6aHVhbmdmZW5nIHx8IDApO1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIm1lbmZlbmdcIl0nKS52YWwobWVuZmVuZyB8fCAwKTtcbiAgICAgICAgJChgaW5wdXRbbmFtZT1cImxpemhpXCJdW3ZhbHVlPVwiJHtsaXpoaX1cIl1gKS5jbGljaygpO1xuICAgICAgICBpZiAoK3lpZmEpICAgICAgJCgnaW5wdXRbbmFtZT1cInlpZmFcIl0nKS5jbGljaygpO1xuICAgICAgICBpZiAoK2hhaWRpKSAgICAgJCgnaW5wdXRbbmFtZT1cImhhaWRpXCJdJykuY2xpY2soKTtcbiAgICAgICAgaWYgKCtsaW5nc2hhbmcpICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5jbGljaygpO1xuICAgICAgICBpZiAoK3FpYW5nZ2FuZykgJCgnaW5wdXRbbmFtZT1cInFpYW5nZ2FuZ1wiXScpLmNsaWNrKCk7XG4gICAgICAgIGlmICgrdGlhbmh1KSAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykuY2xpY2soKTtcbiAgICAgICAgaWYgKHJ1bGUpICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLnZhbChydWxlKTtcblxuICAgICAgICAkKCdmb3JtJykuc3VibWl0KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsZXQgcGFpc3RyID0gJ20xMjNwMTIzejF6MSxzMS0yMyx6MjIyPSc7XG4gICAgICAgIGxldCBiYW9wYWkgPSBbJ3oxJ107XG5cbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbChwYWlzdHIpLmZvY3VzKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFvcGFpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiYmFvcGFpXCJdJykuZXEoaSkudmFsKGJhb3BhaVtpXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN1Ym1pdCgpIHtcblxuICAgIGxldCBwYWlzdHIgPSAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKCk7XG4gICAgaWYgKCEgcGFpc3RyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IHNob3VwYWkgPSBNYWppYW5nLlNob3VwYWkuZnJvbVN0cmluZyhwYWlzdHIpO1xuICAgICQoJ2lucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwoc2hvdXBhaS50b1N0cmluZygpKTtcblxuICAgIGxldCByb25ncGFpO1xuICAgIGlmICgkKCdpbnB1dFtuYW1lPVwiemltb1wiXTpjaGVja2VkJykudmFsKCkgPT0gMCkge1xuICAgICAgICBpZiAoc2hvdXBhaS5femltbykge1xuICAgICAgICAgICAgcm9uZ3BhaSA9IHNob3VwYWkuX3ppbW8gKyAnPSc7XG4gICAgICAgICAgICBzaG91cGFpLmRhcGFpKHNob3VwYWkuX3ppbW8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCEgc2hvdXBhaS5tZW5xaWFuKSB7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJsaXpoaVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJ5aWZhXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICB9XG4gICAgaWYgKCEgc2hvdXBhaS5fZnVsb3VcbiAgICAgICAgICAgIC5maW5kKG09Pm0ucmVwbGFjZSgvMC9nLCc1JykubWF0Y2goL15bbXBzel0oXFxkKVxcMVxcMS4qXFwxLiokLykpKVxuICAgIHtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgbGV0IGJhb3BhaSAgID0gJC5tYWtlQXJyYXkoJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChuID0+IE1hamlhbmcuU2hvdXBhaS52YWxpZF9wYWkoJChuKS52YWwoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4gcCk7XG4gICAgbGV0IGZ1YmFvcGFpID0gJC5tYWtlQXJyYXkoJCgnaW5wdXRbbmFtZT1cImZ1YmFvcGFpXCJdJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKG4gPT4gTWFqaWFuZy5TaG91cGFpLnZhbGlkX3BhaSgkKG4pLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIocCA9PiBwKTtcblxuICAgIGxldCBsaXpoaSA9ICsgJCgnaW5wdXRbbmFtZT1cImxpemhpXCJdOmNoZWNrZWQnKS52YWwoKSB8fCAwO1xuXG4gICAgbGV0IHJ1bGUgPSAkKCdzZWxlY3RbbmFtZT1cInJ1bGVcIl0nKS52YWwoKTtcbiAgICBydWxlID0gISBydWxlICAgICAgPyB7fVxuICAgICAgICAgOiBydWxlID09ICctJyA/IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpfHwne30nKVxuICAgICAgICAgOiAgICAgICAgICAgICAgIHByZXNldFtydWxlXTtcbiAgICBydWxlID0gTWFqaWFuZy5ydWxlKHJ1bGUpO1xuXG4gICAgaWYgKCEgcnVsZVsn5LiA55m644GC44KKJ10pIHtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cInlpZmFcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgIH1cbiAgICBpZiAoISBydWxlWyfjgqvjg7Pjg4njg6njgYLjgoonXSkge1xuICAgICAgICB3aGlsZSAoYmFvcGFpLmxlbmd0aCA+IDEpIGJhb3BhaS5wb3AoKTtcbiAgICAgICAgd2hpbGUgKGZ1YmFvcGFpLmxlbmd0aCA+IDEpIGZ1YmFvcGFpLnBvcCgpO1xuICAgIH1cbiAgICBpZiAoISBydWxlWyfjgqvjg7Poo4/jgYLjgoonXSkge1xuICAgICAgICB3aGlsZSAoZnViYW9wYWkubGVuZ3RoID4gMSkgZnViYW9wYWkucG9wKCk7XG4gICAgfVxuICAgIGlmICghIHJ1bGVbJ+ijj+ODieODqeOBguOCiiddKSB7XG4gICAgICAgIGZ1YmFvcGFpID0gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcGFyYW0gPSB7XG4gICAgICAgIHJ1bGU6ICAgICAgIHJ1bGUsXG4gICAgICAgIHpodWFuZ2Zlbmc6ICsgJCgnc2VsZWN0W25hbWU9XCJ6aHVhbmdmZW5nXCJdJykudmFsKCksXG4gICAgICAgIG1lbmZlbmc6ICAgICsgJCgnc2VsZWN0W25hbWU9XCJtZW5mZW5nXCJdJykudmFsKCksXG4gICAgICAgIGh1cGFpOiB7XG4gICAgICAgICAgICBsaXpoaTogICAgICBsaXpoaSxcbiAgICAgICAgICAgIHlpZmE6ICAgICAgICQoJ2lucHV0W25hbWU9XCJ5aWZhXCJdJykucHJvcCgnY2hlY2tlZCcpLFxuICAgICAgICAgICAgcWlhbmdnYW5nOiAgJCgnaW5wdXRbbmFtZT1cInFpYW5nZ2FuZ1wiXScpLnByb3AoJ2NoZWNrZWQnKSxcbiAgICAgICAgICAgIGxpbmdzaGFuZzogICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5wcm9wKCdjaGVja2VkJyksXG4gICAgICAgICAgICBoYWlkaTogICAgICAhICQoJ2lucHV0W25hbWU9XCJoYWlkaVwiXScpLnByb3AoJ2NoZWNrZWQnKSA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICEgcm9uZ3BhaSAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICB0aWFuaHU6ICAgICArICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl06Y2hlY2tlZCcpLnZhbCgpIHx8IDAsXG4gICAgICAgIH0sXG4gICAgICAgIGJhb3BhaTogICAgIGJhb3BhaSxcbiAgICAgICAgZnViYW9wYWk6ICAgbGl6aGkgPyBmdWJhb3BhaSA6IG51bGwsXG4gICAgICAgIGppY3VuOiAgICAgIHsgY2hhbmdiYW5nOiAwLCBsaXpoaWJhbmc6IDAgfVxuICAgIH07XG5cbiAgICBsZXQgaHVsZSA9IE1hamlhbmcuVXRpbC5odWxlKHNob3VwYWksIHJvbmdwYWksIHBhcmFtKSB8fCB7fTtcblxuICAgIGNvbnN0IG1vZGVsID0ge1xuICAgICAgICBwbGF5ZXI6IFsnJywnJywnJywnJ10sXG4gICAgICAgIGRlZmVuOiAgWzAsMCwwLDBdLFxuICAgICAgICBjaGFuZ2Jhbmc6IHBhcmFtLmppY3VuLmNoYW5nYmFuZyxcbiAgICAgICAgbGl6aGliYW5nOiBwYXJhbS5qaWN1bi5saXpoaWJhbmcsXG4gICAgICAgIHNoYW46IHtcbiAgICAgICAgICAgIGJhb3BhaTogICBwYXJhbS5iYW9wYWksXG4gICAgICAgICAgICBmdWJhb3BhaTogcGFyYW0uZnViYW9wYWksXG4gICAgICAgICAgICBwYWlzaHU6ICAgMFxuICAgICAgICB9LFxuICAgICAgICBwbGF5ZXJfaWQ6ICBbMCwxLDIsM10sXG4gICAgfTtcbiAgICBjb25zdCBwYWlwdSA9IHtcbiAgICAgICAgbDogICAgICAgICAgcGFyYW0ubWVuZmVuZyxcbiAgICAgICAgc2hvdXBhaTogICAgcGFpc3RyLFxuICAgICAgICBiYW9qaWE6ICAgICByb25ncGFpID8gKHBhcmFtLm1lbmZlbmcgKyAyKSAlIDQgOiBudWxsLFxuICAgICAgICBmdWJhb3BhaTogICBwYXJhbS5mdWJhb3BhaSxcbiAgICAgICAgZnU6ICAgICAgICAgaHVsZS5mdSxcbiAgICAgICAgZmFuc2h1OiAgICAgaHVsZS5mYW5zaHUsXG4gICAgICAgIGRhbWFuZ3VhbjogIGh1bGUuZGFtYW5ndWFuLFxuICAgICAgICBkZWZlbjogICAgICBodWxlLmRlZmVuLFxuICAgICAgICBodXBhaTogICAgICBodWxlLmh1cGFpLFxuICAgICAgICBmZW5wZWk6ICAgICBodWxlLmZlbnBlaSxcbiAgICB9O1xuXG4gICAgbmV3IE1hamlhbmcuVUkuSHVsZURpYWxvZygkKCcuaHVsZS1kaWFsb2cnKSwgdmlldy5wYWksIG1vZGVsKS5odWxlKHBhaXB1KTtcbiAgICBmYWRlSW4oJCgnLmh1bGUtZGlhbG9nJykpO1xuXG4gICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLnZhbCgnJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYW9wYWkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLmVxKGkpLnZhbChiYW9wYWlbaV0pO1xuICAgIH1cbiAgICAkKCdpbnB1dFtuYW1lPVwiZnViYW9wYWlcIl0nKS52YWwoJycpO1xuICAgIGlmICghIGZ1YmFvcGFpKSBmdWJhb3BhaSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnViYW9wYWkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImZ1YmFvcGFpXCJdJykuZXEoaSkudmFsKGZ1YmFvcGFpW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgZnJhZ21lbnQgPSAnIycgKyBbXG4gICAgICAgICAgICAgICAgICAgIHBhaXN0cixcbiAgICAgICAgICAgICAgICAgICAgYmFvcGFpLmpvaW4oJywnKSxcbiAgICAgICAgICAgICAgICAgICAgZnViYW9wYWkuam9pbignLCcpLFxuICAgICAgICAgICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiemltb1wiXTpjaGVja2VkJykudmFsKCksXG4gICAgICAgICAgICAgICAgICAgICQoJ3NlbGVjdFtuYW1lPVwiemh1YW5nZmVuZ1wiXScpLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIm1lbmZlbmdcIl0nKS52YWwoKSxcbiAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpemhpXCJdOmNoZWNrZWQnKS52YWwoKSxcbiAgICAgICAgICAgICAgICAgICAgKyAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgKyAkKCdpbnB1dFtuYW1lPVwiaGFpZGlcIl0nKS5wcm9wKCdjaGVja2VkJyksXG4gICAgICAgICAgICAgICAgICAgICsgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgKyAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcpLFxuICAgICAgICAgICAgICAgICAgICArICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl06Y2hlY2tlZCcpLnZhbCgpIHx8IDBcbiAgICAgICAgICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICBydWxlID0gJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykudmFsKCk7XG4gICAgaWYgKHJ1bGUpIGZyYWdtZW50ICs9IGAvJHtydWxlfWA7XG5cbiAgICBpZiAocnVsZSA9PSAnLScpXG4gICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvIy4qJC8sJycpKTtcbiAgICBlbHNlICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgZnJhZ21lbnQpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICB2aWV3LnBhaSA9IE1hamlhbmcuVUkucGFpKCcjbG9hZGRhdGEnKTtcblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwcmVzZXQpKSB7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwicnVsZVwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpLnZhbChrZXkpLnRleHQoa2V5KSk7XG4gICAgfVxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJykpIHtcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJydWxlXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCgnLScpLnRleHQoJ+OCq+OCueOCv+ODoOODq+ODvOODqycpKTtcbiAgICB9XG5cbiAgICAkKCdmb3JtJykub24oJ3N1Ym1pdCcsIHN1Ym1pdCk7XG5cbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgaGlkZSgkKCcuaHVsZS1kaWFsb2cnKSk7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5uZXh0KCkudGV4dCgn5Zyw5ZKMJyk7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS52YWwoMik7XG4gICAgICAgICQoJ2Zvcm0gaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLmZvY3VzKCk7XG4gICAgfSk7XG5cbiAgICAkKCdpbnB1dFtuYW1lPVwiemltb1wiXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoJCh0aGlzLCAnOmNoZWNrZWQnKS52YWwoKSA9PSAxKSB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCdzZWxlY3RbbmFtZT1cIm1lbmZlbmdcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCQodGhpcywgJzpzZWxlY3RlZCcpLnZhbCgpID09IDApIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5uZXh0KCkudGV4dCgn5aSp5ZKMJyk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykudmFsKDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInRpYW5odVwiXScpLm5leHQoKS50ZXh0KCflnLDlkownKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS52YWwoMik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCdpbnB1dFtuYW1lPVwibGl6aGlcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICBsZXQgdmFsID0gJCh0aGlzKS52YWwoKSA9PSAxID8gMiA6IDE7XG4gICAgICAgICAgICAkKGBpbnB1dFtuYW1lPVwibGl6aGlcIl1bdmFsdWU9XCIke3ZhbH1cIl1gKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImZ1YmFvcGFpXCJdJykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ5aWZhXCJdJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJsaW5nc2hhbmdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJCgnaW5wdXRbbmFtZT1cImhhaWRpXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICgkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ5aWZhXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJoYWlkaVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ0aWFuaHVcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cInppbW9cIl1bdmFsdWU9XCIxXCJdJykuY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoJ2lucHV0W25hbWU9XCJxaWFuZ2dhbmdcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiaGFpZGlcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ6aW1vXCJdW3ZhbHVlPVwiMFwiXScpLmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCdpbnB1dFtuYW1lPVwidGlhbmh1XCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICgkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpemhpXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJmdWJhb3BhaVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwieWlmYVwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiaGFpZGlcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImxpbmdzaGFuZ1wiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwicWlhbmdnYW5nXCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJ6aW1vXCJdW3ZhbHVlPVwiMVwiXScpLmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBmcmFnbWVudCA9IGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKTtcbiAgICBpbml0KGZyYWdtZW50KTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
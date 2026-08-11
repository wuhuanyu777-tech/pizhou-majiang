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
  !*** ./src/js/rule.js ***!
  \************************/
/*!
 *  電脳麻将: ルール設定 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const preset = __webpack_require__(/*! ./conf/rule.json */ "./src/js/conf/rule.json");

function set_form(rule) {

    for (let key of Object.keys(rule)) {

        let value;

        if (key == '順位点') {
            value = rule[key].find(n=>n.match(/\./)) ? 0 : 1;
            $('input[name="順位点四捨五入あり"]').val([value]);
            for (let i = 1; i < 4; i++) {
                $('input[name="順位点"]').eq(i).val(rule[key][i]);
            }
            continue;
        }
        if (key == '赤牌') {
            $('input[name="赤牌"]').eq(0).val(rule[key].m);
            $('input[name="赤牌"]').eq(1).val(rule[key].p);
            $('input[name="赤牌"]').eq(2).val(rule[key].s);
            continue;
        }

        if ($(`input[name="${key}"]`).attr('type') == 'radio' ||
            $(`input[name="${key}"]`).attr('type') == 'checkbox')
        {
            value = rule[key] === false ? [0]
                  : rule[key] === true  ? [1]
                  :                       [rule[key]];
        }
        else {
            value = rule[key];
        }
        $(`input[name="${key}"]`).val(value);
    }

    repair_point();
    repair_gang();
    repair_damanguan();

    Majiang.UI.Util.fadeIn($('form'));
}

function get_form() {

    let rule = Majiang.rule();

    for (let key of Object.keys(rule)) {

        if (key == '順位点') {
            for (let i = 0; i < 4; i++) {
                rule[key][i] = $('input[name="順位点"]').eq(i).val();
            }
            continue;
        }
        if (key == '赤牌') {
            rule[key].m = + $('input[name="赤牌"]').eq(0).val();
            rule[key].p = + $('input[name="赤牌"]').eq(1).val();
            rule[key].s = + $('input[name="赤牌"]').eq(2).val();
            continue;
        }

        if ($(`input[name="${key}"]`).attr('type') == 'radio') {
            rule[key] = + $(`input[name="${key}"]:checked`).val();
            if ($(`input[name="${key}"]`).length == 2) {
                rule[key] = rule[key] != 0;
            }
        }
        else if ($(`input[name="${key}"]`).attr('type') == 'checkbox') {
            rule[key] = $(`input[name="${key}"]`).prop('checked');
        }
        else {
            rule[key] = + $(`input[name="${key}"]`).val();
        }
    }
    return rule;
}

function round_point(p, round) {
    p = isNaN(p) ? '0'
      : + p > 0  ? '+' + (+ p)
      :            ''  + (+ p);
    if (round) p.replace(/\.\d*$/,'');
    else       p = ! p.match(/\./) ? p + '.0' : p;
    return p;
}

function repair_point() {
    let round = $('input[name="順位点四捨五入あり"]').prop('checked');
    let sum = 0;
    for (let i = 1; i < 4; i++) {
        let p = + $('input[name="順位点"]').eq(i).val();
        sum += p;
        $('input[name="順位点"]').eq(i).val(round_point(p, round))
    }
    $('input[name="順位点"]').eq(0).val(round_point(-sum, round))
}

function repair_gang() {
    if (+ $('input[name="裏ドラあり"]:checked').val()
        && + $('input[name="カンドラあり"]:checked').val())
    {
        $('input[name="カン裏あり"]').prop('disabled', false);
    }
    else {
        $('input[name="カン裏あり"]').prop('disabled', true).val([0]);
    }

    if (+ $('input[name="カンドラあり"]:checked').val()) {
        $('input[name="カンドラ後乗せ"]').prop('disabled', false);
    }
    else {
        $('input[name="カンドラ後乗せ"]').prop('disabled', true)
                                        .prop('checked', false);
    }
}

function repair_damanguan() {
    if (+ $('input[name="役満の複合あり"]:checked').val()) {
        $('input[name="ダブル役満あり"]').prop('disabled', false);
    }
    else {
        $('input[name="ダブル役満あり"]').prop('disabled', true).val([0]);
    }
}

function unsaved() {
    $(window).on('beforeunload', (ev)=>{
        const message = 'ページを離れますがよろしいですか？';
        ev.returnValue = message;
        return message;
    });
}

$(function(){

    for (let key of Object.keys(preset)) {
        $('select[name="プリセット"]').append($('<option>').val(key).text(key));
    }
    if (localStorage.getItem('Majiang.rule')) {
        $('select[name="プリセット"]').append($('<option>')
                                    .val('-').text('カスタムルール'));
        $('select[name="プリセット"]').val('-');
    }

    let rule = Majiang.rule(
                    JSON.parse(localStorage.getItem('Majiang.rule')||'{}'));
    set_form(rule);

    $('input[name="配給原点"]').on('change', function(){
        let p = $(this).val();
        if (isNaN(p) || p <= 0) $(this).val(Majiang.rule()['配給原点']);
    });
    $('input[name="順位点"]').on('change', repair_point);
    $('input[name="順位点四捨五入あり"]').on('change', repair_point);
    $('input[name="赤牌"]').on('change', function(){
        let n = $(this).val();
        if (isNaN(n) || n < 0 || 4 < n) $(this).val(0);
    });
    $('input[name="裏ドラあり"]').on('change', repair_gang);
    $('input[name="カンドラあり"]').on('change', repair_gang);
    $('input[name="役満の複合あり"]').on('change', repair_damanguan);

    $('input[name="プリセット"]').on('click', ()=>{
        let key = $('select[name="プリセット"]').val();
        set_form(Majiang.rule(key == '-'
                    ? JSON.parse(localStorage.getItem('Majiang.rule')||'{}')
                    : preset[key] || {}));
        unsaved();
        return false;
    });

    $('form input').on('change', unsaved);

    $('form').on('submit', ()=>{
        if (! localStorage.getItem('Majiang.rule')) {
            $('select[name="プリセット"]').append($('<option>')
                                        .val('-').text('カスタムルール'));
        }
        localStorage.setItem('Majiang.rule', JSON.stringify(get_form()));

        $(window).off('beforeunload');
        $('select[name="プリセット"]').val('-');
        Majiang.UI.Util.fadeIn($('form'));
        Majiang.UI.Util.fadeIn($('.message'));
        setTimeout(()=>$('.message').trigger('click'), 2000);
        return false;
    });

    $('.message').on('click', function(){
        Majiang.UI.Util.fadeOut($(this));
        return false;
    });
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZS0xLjIuMzIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7QUFDYjtBQUNBLGVBQWUsbUJBQU8sQ0FBQyxpREFBa0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsT0FBTztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLElBQUk7QUFDakMsNkJBQTZCLElBQUk7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixJQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLE9BQU87QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixJQUFJO0FBQ2pDLDJDQUEyQyxJQUFJO0FBQy9DLGlDQUFpQyxJQUFJO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxJQUFJO0FBQ3RDLHlDQUF5QyxJQUFJO0FBQzdDO0FBQ0E7QUFDQSwyQ0FBMkMsSUFBSTtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwRUFBMEU7QUFDMUUsdUNBQXVDO0FBQ3ZDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL3J1bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLyohXHJcbiAqICDpm7vohLPpurvlsIY6IOODq+ODvOODq+ioreWumiB2MS4wLjBcclxuICpcclxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXHJcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL2NvbmYvcnVsZS5qc29uJyk7XHJcblxyXG5mdW5jdGlvbiBzZXRfZm9ybShydWxlKSB7XHJcblxyXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHJ1bGUpKSB7XHJcblxyXG4gICAgICAgIGxldCB2YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKGtleSA9PSAn6aCG5L2N54K5Jykge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHJ1bGVba2V5XS5maW5kKG49Pm4ubWF0Y2goL1xcLi8pKSA/IDAgOiAxO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwi6aCG5L2N54K55Zub5o2o5LqU5YWl44GC44KKXCJdJykudmFsKFt2YWx1ZV0pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cIumghuS9jeeCuVwiXScpLmVxKGkpLnZhbChydWxlW2tleV1baV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoa2V5ID09ICfotaTniYwnKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCLotaTniYxcIl0nKS5lcSgwKS52YWwocnVsZVtrZXldLm0pO1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwi6LWk54mMXCJdJykuZXEoMSkudmFsKHJ1bGVba2V5XS5wKTtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cIui1pOeJjFwiXScpLmVxKDIpLnZhbChydWxlW2tleV0ucyk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCQoYGlucHV0W25hbWU9XCIke2tleX1cIl1gKS5hdHRyKCd0eXBlJykgPT0gJ3JhZGlvJyB8fFxyXG4gICAgICAgICAgICAkKGBpbnB1dFtuYW1lPVwiJHtrZXl9XCJdYCkuYXR0cigndHlwZScpID09ICdjaGVja2JveCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHJ1bGVba2V5XSA9PT0gZmFsc2UgPyBbMF1cclxuICAgICAgICAgICAgICAgICAgOiBydWxlW2tleV0gPT09IHRydWUgID8gWzFdXHJcbiAgICAgICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICAgIFtydWxlW2tleV1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBydWxlW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoYGlucHV0W25hbWU9XCIke2tleX1cIl1gKS52YWwodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcGFpcl9wb2ludCgpO1xyXG4gICAgcmVwYWlyX2dhbmcoKTtcclxuICAgIHJlcGFpcl9kYW1hbmd1YW4oKTtcclxuXHJcbiAgICBNYWppYW5nLlVJLlV0aWwuZmFkZUluKCQoJ2Zvcm0nKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldF9mb3JtKCkge1xyXG5cclxuICAgIGxldCBydWxlID0gTWFqaWFuZy5ydWxlKCk7XHJcblxyXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHJ1bGUpKSB7XHJcblxyXG4gICAgICAgIGlmIChrZXkgPT0gJ+mghuS9jeeCuScpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHJ1bGVba2V5XVtpXSA9ICQoJ2lucHV0W25hbWU9XCLpoIbkvY3ngrlcIl0nKS5lcShpKS52YWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGtleSA9PSAn6LWk54mMJykge1xyXG4gICAgICAgICAgICBydWxlW2tleV0ubSA9ICsgJCgnaW5wdXRbbmFtZT1cIui1pOeJjFwiXScpLmVxKDApLnZhbCgpO1xyXG4gICAgICAgICAgICBydWxlW2tleV0ucCA9ICsgJCgnaW5wdXRbbmFtZT1cIui1pOeJjFwiXScpLmVxKDEpLnZhbCgpO1xyXG4gICAgICAgICAgICBydWxlW2tleV0ucyA9ICsgJCgnaW5wdXRbbmFtZT1cIui1pOeJjFwiXScpLmVxKDIpLnZhbCgpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgkKGBpbnB1dFtuYW1lPVwiJHtrZXl9XCJdYCkuYXR0cigndHlwZScpID09ICdyYWRpbycpIHtcclxuICAgICAgICAgICAgcnVsZVtrZXldID0gKyAkKGBpbnB1dFtuYW1lPVwiJHtrZXl9XCJdOmNoZWNrZWRgKS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKCQoYGlucHV0W25hbWU9XCIke2tleX1cIl1gKS5sZW5ndGggPT0gMikge1xyXG4gICAgICAgICAgICAgICAgcnVsZVtrZXldID0gcnVsZVtrZXldICE9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoJChgaW5wdXRbbmFtZT1cIiR7a2V5fVwiXWApLmF0dHIoJ3R5cGUnKSA9PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgIHJ1bGVba2V5XSA9ICQoYGlucHV0W25hbWU9XCIke2tleX1cIl1gKS5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBydWxlW2tleV0gPSArICQoYGlucHV0W25hbWU9XCIke2tleX1cIl1gKS52YWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcnVsZTtcclxufVxyXG5cclxuZnVuY3Rpb24gcm91bmRfcG9pbnQocCwgcm91bmQpIHtcclxuICAgIHAgPSBpc05hTihwKSA/ICcwJ1xyXG4gICAgICA6ICsgcCA+IDAgID8gJysnICsgKCsgcClcclxuICAgICAgOiAgICAgICAgICAgICcnICArICgrIHApO1xyXG4gICAgaWYgKHJvdW5kKSBwLnJlcGxhY2UoL1xcLlxcZCokLywnJyk7XHJcbiAgICBlbHNlICAgICAgIHAgPSAhIHAubWF0Y2goL1xcLi8pID8gcCArICcuMCcgOiBwO1xyXG4gICAgcmV0dXJuIHA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlcGFpcl9wb2ludCgpIHtcclxuICAgIGxldCByb3VuZCA9ICQoJ2lucHV0W25hbWU9XCLpoIbkvY3ngrnlm5vmjajkupTlhaXjgYLjgopcIl0nKS5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICBsZXQgc3VtID0gMDtcclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHAgPSArICQoJ2lucHV0W25hbWU9XCLpoIbkvY3ngrlcIl0nKS5lcShpKS52YWwoKTtcclxuICAgICAgICBzdW0gKz0gcDtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwi6aCG5L2N54K5XCJdJykuZXEoaSkudmFsKHJvdW5kX3BvaW50KHAsIHJvdW5kKSlcclxuICAgIH1cclxuICAgICQoJ2lucHV0W25hbWU9XCLpoIbkvY3ngrlcIl0nKS5lcSgwKS52YWwocm91bmRfcG9pbnQoLXN1bSwgcm91bmQpKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXBhaXJfZ2FuZygpIHtcclxuICAgIGlmICgrICQoJ2lucHV0W25hbWU9XCLoo4/jg4njg6njgYLjgopcIl06Y2hlY2tlZCcpLnZhbCgpXHJcbiAgICAgICAgJiYgKyAkKCdpbnB1dFtuYW1lPVwi44Kr44Oz44OJ44Op44GC44KKXCJdOmNoZWNrZWQnKS52YWwoKSlcclxuICAgIHtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwi44Kr44Oz6KOP44GC44KKXCJdJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwi44Kr44Oz6KOP44GC44KKXCJdJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKS52YWwoWzBdKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoKyAkKCdpbnB1dFtuYW1lPVwi44Kr44Oz44OJ44Op44GC44KKXCJdOmNoZWNrZWQnKS52YWwoKSkge1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCLjgqvjg7Pjg4njg6nlvozkuZfjgZtcIl0nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCLjgqvjg7Pjg4njg6nlvozkuZfjgZtcIl0nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVwYWlyX2RhbWFuZ3VhbigpIHtcclxuICAgIGlmICgrICQoJ2lucHV0W25hbWU9XCLlvbnmuoDjga7opIflkIjjgYLjgopcIl06Y2hlY2tlZCcpLnZhbCgpKSB7XHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cIuODgOODluODq+W9uea6gOOBguOCilwiXScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cIuODgOODluODq+W9uea6gOOBguOCilwiXScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkudmFsKFswXSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuc2F2ZWQoKSB7XHJcbiAgICAkKHdpbmRvdykub24oJ2JlZm9yZXVubG9hZCcsIChldik9PntcclxuICAgICAgICBjb25zdCBtZXNzYWdlID0gJ+ODmuODvOOCuOOCkumbouOCjOOBvuOBmeOBjOOCiOOCjeOBl+OBhOOBp+OBmeOBi++8nyc7XHJcbiAgICAgICAgZXYucmV0dXJuVmFsdWUgPSBtZXNzYWdlO1xyXG4gICAgICAgIHJldHVybiBtZXNzYWdlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHJcbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocHJlc2V0KSkge1xyXG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwi44OX44Oq44K744OD44OIXCJdJykuYXBwZW5kKCQoJzxvcHRpb24+JykudmFsKGtleSkudGV4dChrZXkpKTtcclxuICAgIH1cclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJykpIHtcclxuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIuODl+ODquOCu+ODg+ODiFwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWwoJy0nKS50ZXh0KCfjgqvjgrnjgr/jg6Djg6vjg7zjg6snKSk7XHJcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCLjg5fjg6rjgrvjg4Pjg4hcIl0nKS52YWwoJy0nKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcnVsZSA9IE1hamlhbmcucnVsZShcclxuICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JykpO1xyXG4gICAgc2V0X2Zvcm0ocnVsZSk7XHJcblxyXG4gICAgJCgnaW5wdXRbbmFtZT1cIumFjee1puWOn+eCuVwiXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGxldCBwID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICBpZiAoaXNOYU4ocCkgfHwgcCA8PSAwKSAkKHRoaXMpLnZhbChNYWppYW5nLnJ1bGUoKVsn6YWN57Wm5Y6f54K5J10pO1xyXG4gICAgfSk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwi6aCG5L2N54K5XCJdJykub24oJ2NoYW5nZScsIHJlcGFpcl9wb2ludCk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwi6aCG5L2N54K55Zub5o2o5LqU5YWl44GC44KKXCJdJykub24oJ2NoYW5nZScsIHJlcGFpcl9wb2ludCk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwi6LWk54mMXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IG4gPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgIGlmIChpc05hTihuKSB8fCBuIDwgMCB8fCA0IDwgbikgJCh0aGlzKS52YWwoMCk7XHJcbiAgICB9KTtcclxuICAgICQoJ2lucHV0W25hbWU9XCLoo4/jg4njg6njgYLjgopcIl0nKS5vbignY2hhbmdlJywgcmVwYWlyX2dhbmcpO1xyXG4gICAgJCgnaW5wdXRbbmFtZT1cIuOCq+ODs+ODieODqeOBguOCilwiXScpLm9uKCdjaGFuZ2UnLCByZXBhaXJfZ2FuZyk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwi5b255rqA44Gu6KSH5ZCI44GC44KKXCJdJykub24oJ2NoYW5nZScsIHJlcGFpcl9kYW1hbmd1YW4pO1xyXG5cclxuICAgICQoJ2lucHV0W25hbWU9XCLjg5fjg6rjgrvjg4Pjg4hcIl0nKS5vbignY2xpY2snLCAoKT0+e1xyXG4gICAgICAgIGxldCBrZXkgPSAkKCdzZWxlY3RbbmFtZT1cIuODl+ODquOCu+ODg+ODiFwiXScpLnZhbCgpO1xyXG4gICAgICAgIHNldF9mb3JtKE1hamlhbmcucnVsZShrZXkgPT0gJy0nXHJcbiAgICAgICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JylcclxuICAgICAgICAgICAgICAgICAgICA6IHByZXNldFtrZXldIHx8IHt9KSk7XHJcbiAgICAgICAgdW5zYXZlZCgpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJ2Zvcm0gaW5wdXQnKS5vbignY2hhbmdlJywgdW5zYXZlZCk7XHJcblxyXG4gICAgJCgnZm9ybScpLm9uKCdzdWJtaXQnLCAoKT0+e1xyXG4gICAgICAgIGlmICghIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKSkge1xyXG4gICAgICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIuODl+ODquOCu+ODg+ODiFwiXScpLmFwcGVuZCgkKCc8b3B0aW9uPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsKCctJykudGV4dCgn44Kr44K544K/44Og44Or44O844OrJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnTWFqaWFuZy5ydWxlJywgSlNPTi5zdHJpbmdpZnkoZ2V0X2Zvcm0oKSkpO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub2ZmKCdiZWZvcmV1bmxvYWQnKTtcclxuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIuODl+ODquOCu+ODg+ODiFwiXScpLnZhbCgnLScpO1xyXG4gICAgICAgIE1hamlhbmcuVUkuVXRpbC5mYWRlSW4oJCgnZm9ybScpKTtcclxuICAgICAgICBNYWppYW5nLlVJLlV0aWwuZmFkZUluKCQoJy5tZXNzYWdlJykpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiQoJy5tZXNzYWdlJykudHJpZ2dlcignY2xpY2snKSwgMjAwMCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLm1lc3NhZ2UnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIE1hamlhbmcuVUkuVXRpbC5mYWRlT3V0KCQodGhpcykpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
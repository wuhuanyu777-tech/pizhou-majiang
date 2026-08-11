/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/js/paili.js ***!
  \*************************/
/*!
 *  電脳麻将: 牌理 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { setSelector, clearSelector } = Majiang.UI.Util;

const model = {};
const view  = {};

const rule = Majiang.rule();

let pref;

function repair_shan(shan, shoupai) {
    let paistr = shoupai.toString();
    for (let suitstr of paistr.match(/[mpsz][\d\+\=\-]+/g)) {
        let s = suitstr[0];
        for (let n of suitstr.match(/\d/g)) {
            let i = shan._pai.indexOf(s+n);
            if (i >= 0) shan._pai.splice(i, 1);
        }
    }
}

function qipai(paistr) {

    model.shan = new Majiang.Shan(rule);

    if (paistr) {
        model.shoupai = Majiang.Shoupai.fromString(paistr);
        repair_shan(model.shan, model.shoupai);
    }
    else {
        let qipai = [];
        while (qipai.length < 13) qipai.push(model.shan.zimo());
        model.shoupai = new Majiang.Shoupai(qipai);
        model.shoupai.zimo(model.shan.zimo());
    }
    model.lizhi = false;

    while (model.shan.paishu > 17) model.shan.zimo();

    $('form input[name="paistr"]').val(model.shoupai.toString());
    if (paistr) history.replaceState('', '', `#${model.shoupai.toString()}`);

    view.shoupai = new Majiang.UI.Shoupai(
                                $('.shoupai'), view.pai, model.shoupai
                            ).redraw(true);

    model.he = new Majiang.He();
    view.he  = new Majiang.UI.He($('.he'), view.pai, model.he).redraw(true);

    paili(1);
}

function set_handler(focus = -1) {

    for (let p of model.shoupai.get_dapai()) {
        let pai = $(p.slice(-1) == '_'
                        ? `.zimo .pai[data-pai="${p.slice(0,2)}"]`
                        : `> .pai[data-pai="${p}"]`,
                    $('.shoupai .bingpai'));
        pai.attr('tabindex', 0).attr('role','button')
            .on('click.dapai', (ev)=>{
                $(ev.target).addClass('dapai');
                dapai(p);
            });
    }
    setSelector($('.shoupai .bingpai .pai[tabindex]'), 'dapai', {focus: focus});
}

function clear_handler() {
    view.shoupai.redraw();
    clearSelector('dapai');
}

function dapai(p) {

    clearSelector('dapai');

    if (pref.sound_on) view.audio('dapai').play();
    model.shoupai.dapai(p);
    view.shoupai.dapai(p);

    if (! model.lizhi && Majiang.Util.xiangting(model.shoupai) == 0) {
        model.lizhi = true;
        p += '*';
    }

    model.he.dapai(p);
    view.he.dapai(p);

    setTimeout(zimo, 600);
}

function zimo() {

    if (! model.shan.paishu) {
        view.shoupai.redraw();
        view.he.redraw();
        $('.status').text('流局……');
        $('.paili').empty();
        return;
    }

    model.shoupai.zimo(model.shan.zimo());
    view.shoupai.redraw();
    view.he.redraw();

    paili();
}

function paili(start) {

    $('.paili').empty();

    let n_xiangting = Majiang.Util.xiangting(model.shoupai);
    if      (n_xiangting == -1) $('.status').text('和了！！');
    else if (n_xiangting ==  0) $('.status').text('聴牌！');
    else                        $('.status').text(`${n_xiangting}向聴`);

    if (n_xiangting == -1) {
        if (pref.sound_on) view.audio('zimo').play();
        return;
    }
    else if (n_xiangting == 0 && ! model.lizhi) {
        if (pref.sound_on) view.audio('lizhi').play();
    }

    let dapai = [];
    for (let p of model.shoupai.get_dapai()) {

        let shoupai = model.shoupai.clone().dapai(p);
        if (Majiang.Util.xiangting(shoupai) > n_xiangting) continue;

        p = p[0] + (+p[1]||5);
        if (dapai.find(dapai => dapai.p == p)) continue;

        let tingpai = Majiang.Util.tingpai(shoupai);
        let n = tingpai.map(p => 4 - model.shoupai._bingpai[p[0]][p[1]])
                       .reduce((x, y)=> x + y, 0)

        dapai.push({ p: p, tingpai: tingpai, n: n });
    }

    const cmp = (a, b) => b.n - a.n
                       || b.tingpai.length - a.tingpai.length
                       || (a.p < b.p ? -1 : 1);
    for (let d of dapai.sort(cmp)) {
        let html = '<div>打: '
                 + $('<span>').append(view.pai(d.p)).html()
                 + ' 摸: '
                 + d.tingpai.map(
                     p => $('<span>').append(view.pai(p)).html()
                 ).join('')
                 + ` (${d.n}枚)</div>`;
        $('.paili').append($(html));
    }

    if (start) setTimeout(set_handler, 600);
    else       set_handler();
}

$(function(){

    view.pai   = Majiang.UI.pai('#loaddata');
    view.audio = Majiang.UI.audio('#loaddata');

    pref = JSON.parse(localStorage.getItem('Majiang.pref'));

    $('form input[type="button"]').on('click', function(){
        qipai();
        return false;
    });
    $('form').on('submit', function(){
        qipai($('form input[name="paistr"]').val());
        return false;
    });
    $('form').on('reset', function(){
        $('input[name="paistr"]').trigger('focus');
        history.replaceState('', '', location.href.replace(/#.*$/,''));
    });
    $('form [name="paistr"]').on('focus', clear_handler)
                             .on('blur',  ()=> set_handler(null));

    let paistr = location.hash.replace(/^#/,'');
    qipai(paistr);
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpbGktMS4yLjMyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTtBQUNiO0FBQ0EsUUFBUSw2QkFBNkI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCx5QkFBeUI7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGFBQWE7QUFDL0QsOENBQThDLEVBQUU7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGlFQUFpRSxhQUFhO0FBQzlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsWUFBWTtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw4QkFBOEI7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLElBQUk7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvcGFpbGkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqICDpm7vohLPpurvlsIY6IOeJjOeQhiB2MS4wLjBcclxuICpcclxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXHJcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCB7IHNldFNlbGVjdG9yLCBjbGVhclNlbGVjdG9yIH0gPSBNYWppYW5nLlVJLlV0aWw7XHJcblxyXG5jb25zdCBtb2RlbCA9IHt9O1xyXG5jb25zdCB2aWV3ICA9IHt9O1xyXG5cclxuY29uc3QgcnVsZSA9IE1hamlhbmcucnVsZSgpO1xyXG5cclxubGV0IHByZWY7XHJcblxyXG5mdW5jdGlvbiByZXBhaXJfc2hhbihzaGFuLCBzaG91cGFpKSB7XHJcbiAgICBsZXQgcGFpc3RyID0gc2hvdXBhaS50b1N0cmluZygpO1xyXG4gICAgZm9yIChsZXQgc3VpdHN0ciBvZiBwYWlzdHIubWF0Y2goL1ttcHN6XVtcXGRcXCtcXD1cXC1dKy9nKSkge1xyXG4gICAgICAgIGxldCBzID0gc3VpdHN0clswXTtcclxuICAgICAgICBmb3IgKGxldCBuIG9mIHN1aXRzdHIubWF0Y2goL1xcZC9nKSkge1xyXG4gICAgICAgICAgICBsZXQgaSA9IHNoYW4uX3BhaS5pbmRleE9mKHMrbik7XHJcbiAgICAgICAgICAgIGlmIChpID49IDApIHNoYW4uX3BhaS5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBxaXBhaShwYWlzdHIpIHtcclxuXHJcbiAgICBtb2RlbC5zaGFuID0gbmV3IE1hamlhbmcuU2hhbihydWxlKTtcclxuXHJcbiAgICBpZiAocGFpc3RyKSB7XHJcbiAgICAgICAgbW9kZWwuc2hvdXBhaSA9IE1hamlhbmcuU2hvdXBhaS5mcm9tU3RyaW5nKHBhaXN0cik7XHJcbiAgICAgICAgcmVwYWlyX3NoYW4obW9kZWwuc2hhbiwgbW9kZWwuc2hvdXBhaSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBsZXQgcWlwYWkgPSBbXTtcclxuICAgICAgICB3aGlsZSAocWlwYWkubGVuZ3RoIDwgMTMpIHFpcGFpLnB1c2gobW9kZWwuc2hhbi56aW1vKCkpO1xyXG4gICAgICAgIG1vZGVsLnNob3VwYWkgPSBuZXcgTWFqaWFuZy5TaG91cGFpKHFpcGFpKTtcclxuICAgICAgICBtb2RlbC5zaG91cGFpLnppbW8obW9kZWwuc2hhbi56aW1vKCkpO1xyXG4gICAgfVxyXG4gICAgbW9kZWwubGl6aGkgPSBmYWxzZTtcclxuXHJcbiAgICB3aGlsZSAobW9kZWwuc2hhbi5wYWlzaHUgPiAxNykgbW9kZWwuc2hhbi56aW1vKCk7XHJcblxyXG4gICAgJCgnZm9ybSBpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKG1vZGVsLnNob3VwYWkudG9TdHJpbmcoKSk7XHJcbiAgICBpZiAocGFpc3RyKSBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGAjJHttb2RlbC5zaG91cGFpLnRvU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgdmlldy5zaG91cGFpID0gbmV3IE1hamlhbmcuVUkuU2hvdXBhaShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2hvdXBhaScpLCB2aWV3LnBhaSwgbW9kZWwuc2hvdXBhaVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5yZWRyYXcodHJ1ZSk7XHJcblxyXG4gICAgbW9kZWwuaGUgPSBuZXcgTWFqaWFuZy5IZSgpO1xyXG4gICAgdmlldy5oZSAgPSBuZXcgTWFqaWFuZy5VSS5IZSgkKCcuaGUnKSwgdmlldy5wYWksIG1vZGVsLmhlKS5yZWRyYXcodHJ1ZSk7XHJcblxyXG4gICAgcGFpbGkoMSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldF9oYW5kbGVyKGZvY3VzID0gLTEpIHtcclxuXHJcbiAgICBmb3IgKGxldCBwIG9mIG1vZGVsLnNob3VwYWkuZ2V0X2RhcGFpKCkpIHtcclxuICAgICAgICBsZXQgcGFpID0gJChwLnNsaWNlKC0xKSA9PSAnXydcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgLnppbW8gLnBhaVtkYXRhLXBhaT1cIiR7cC5zbGljZSgwLDIpfVwiXWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBgPiAucGFpW2RhdGEtcGFpPVwiJHtwfVwiXWAsXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnNob3VwYWkgLmJpbmdwYWknKSk7XHJcbiAgICAgICAgcGFpLmF0dHIoJ3RhYmluZGV4JywgMCkuYXR0cigncm9sZScsJ2J1dHRvbicpXHJcbiAgICAgICAgICAgIC5vbignY2xpY2suZGFwYWknLCAoZXYpPT57XHJcbiAgICAgICAgICAgICAgICAkKGV2LnRhcmdldCkuYWRkQ2xhc3MoJ2RhcGFpJyk7XHJcbiAgICAgICAgICAgICAgICBkYXBhaShwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzZXRTZWxlY3RvcigkKCcuc2hvdXBhaSAuYmluZ3BhaSAucGFpW3RhYmluZGV4XScpLCAnZGFwYWknLCB7Zm9jdXM6IGZvY3VzfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyX2hhbmRsZXIoKSB7XHJcbiAgICB2aWV3LnNob3VwYWkucmVkcmF3KCk7XHJcbiAgICBjbGVhclNlbGVjdG9yKCdkYXBhaScpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkYXBhaShwKSB7XHJcblxyXG4gICAgY2xlYXJTZWxlY3RvcignZGFwYWknKTtcclxuXHJcbiAgICBpZiAocHJlZi5zb3VuZF9vbikgdmlldy5hdWRpbygnZGFwYWknKS5wbGF5KCk7XHJcbiAgICBtb2RlbC5zaG91cGFpLmRhcGFpKHApO1xyXG4gICAgdmlldy5zaG91cGFpLmRhcGFpKHApO1xyXG5cclxuICAgIGlmICghIG1vZGVsLmxpemhpICYmIE1hamlhbmcuVXRpbC54aWFuZ3RpbmcobW9kZWwuc2hvdXBhaSkgPT0gMCkge1xyXG4gICAgICAgIG1vZGVsLmxpemhpID0gdHJ1ZTtcclxuICAgICAgICBwICs9ICcqJztcclxuICAgIH1cclxuXHJcbiAgICBtb2RlbC5oZS5kYXBhaShwKTtcclxuICAgIHZpZXcuaGUuZGFwYWkocCk7XHJcblxyXG4gICAgc2V0VGltZW91dCh6aW1vLCA2MDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiB6aW1vKCkge1xyXG5cclxuICAgIGlmICghIG1vZGVsLnNoYW4ucGFpc2h1KSB7XHJcbiAgICAgICAgdmlldy5zaG91cGFpLnJlZHJhdygpO1xyXG4gICAgICAgIHZpZXcuaGUucmVkcmF3KCk7XHJcbiAgICAgICAgJCgnLnN0YXR1cycpLnRleHQoJ+a1geWxgOKApuKApicpO1xyXG4gICAgICAgICQoJy5wYWlsaScpLmVtcHR5KCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIG1vZGVsLnNob3VwYWkuemltbyhtb2RlbC5zaGFuLnppbW8oKSk7XHJcbiAgICB2aWV3LnNob3VwYWkucmVkcmF3KCk7XHJcbiAgICB2aWV3LmhlLnJlZHJhdygpO1xyXG5cclxuICAgIHBhaWxpKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhaWxpKHN0YXJ0KSB7XHJcblxyXG4gICAgJCgnLnBhaWxpJykuZW1wdHkoKTtcclxuXHJcbiAgICBsZXQgbl94aWFuZ3RpbmcgPSBNYWppYW5nLlV0aWwueGlhbmd0aW5nKG1vZGVsLnNob3VwYWkpO1xyXG4gICAgaWYgICAgICAobl94aWFuZ3RpbmcgPT0gLTEpICQoJy5zdGF0dXMnKS50ZXh0KCflkozkuobvvIHvvIEnKTtcclxuICAgIGVsc2UgaWYgKG5feGlhbmd0aW5nID09ICAwKSAkKCcuc3RhdHVzJykudGV4dCgn6IG054mM77yBJyk7XHJcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnN0YXR1cycpLnRleHQoYCR7bl94aWFuZ3Rpbmd95ZCR6IG0YCk7XHJcblxyXG4gICAgaWYgKG5feGlhbmd0aW5nID09IC0xKSB7XHJcbiAgICAgICAgaWYgKHByZWYuc291bmRfb24pIHZpZXcuYXVkaW8oJ3ppbW8nKS5wbGF5KCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAobl94aWFuZ3RpbmcgPT0gMCAmJiAhIG1vZGVsLmxpemhpKSB7XHJcbiAgICAgICAgaWYgKHByZWYuc291bmRfb24pIHZpZXcuYXVkaW8oJ2xpemhpJykucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBkYXBhaSA9IFtdO1xyXG4gICAgZm9yIChsZXQgcCBvZiBtb2RlbC5zaG91cGFpLmdldF9kYXBhaSgpKSB7XHJcblxyXG4gICAgICAgIGxldCBzaG91cGFpID0gbW9kZWwuc2hvdXBhaS5jbG9uZSgpLmRhcGFpKHApO1xyXG4gICAgICAgIGlmIChNYWppYW5nLlV0aWwueGlhbmd0aW5nKHNob3VwYWkpID4gbl94aWFuZ3RpbmcpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBwID0gcFswXSArICgrcFsxXXx8NSk7XHJcbiAgICAgICAgaWYgKGRhcGFpLmZpbmQoZGFwYWkgPT4gZGFwYWkucCA9PSBwKSkgY29udGludWU7XHJcblxyXG4gICAgICAgIGxldCB0aW5ncGFpID0gTWFqaWFuZy5VdGlsLnRpbmdwYWkoc2hvdXBhaSk7XHJcbiAgICAgICAgbGV0IG4gPSB0aW5ncGFpLm1hcChwID0+IDQgLSBtb2RlbC5zaG91cGFpLl9iaW5ncGFpW3BbMF1dW3BbMV1dKVxyXG4gICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHgsIHkpPT4geCArIHksIDApXHJcblxyXG4gICAgICAgIGRhcGFpLnB1c2goeyBwOiBwLCB0aW5ncGFpOiB0aW5ncGFpLCBuOiBuIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNtcCA9IChhLCBiKSA9PiBiLm4gLSBhLm5cclxuICAgICAgICAgICAgICAgICAgICAgICB8fCBiLnRpbmdwYWkubGVuZ3RoIC0gYS50aW5ncGFpLmxlbmd0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHx8IChhLnAgPCBiLnAgPyAtMSA6IDEpO1xyXG4gICAgZm9yIChsZXQgZCBvZiBkYXBhaS5zb3J0KGNtcCkpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2PuaJkzogJ1xyXG4gICAgICAgICAgICAgICAgICsgJCgnPHNwYW4+JykuYXBwZW5kKHZpZXcucGFpKGQucCkpLmh0bWwoKVxyXG4gICAgICAgICAgICAgICAgICsgJyDmkbg6ICdcclxuICAgICAgICAgICAgICAgICArIGQudGluZ3BhaS5tYXAoXHJcbiAgICAgICAgICAgICAgICAgICAgIHAgPT4gJCgnPHNwYW4+JykuYXBwZW5kKHZpZXcucGFpKHApKS5odG1sKClcclxuICAgICAgICAgICAgICAgICApLmpvaW4oJycpXHJcbiAgICAgICAgICAgICAgICAgKyBgICgke2Qubn3mnpopPC9kaXY+YDtcclxuICAgICAgICAkKCcucGFpbGknKS5hcHBlbmQoJChodG1sKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0YXJ0KSBzZXRUaW1lb3V0KHNldF9oYW5kbGVyLCA2MDApO1xyXG4gICAgZWxzZSAgICAgICBzZXRfaGFuZGxlcigpO1xyXG59XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdmlldy5wYWkgICA9IE1hamlhbmcuVUkucGFpKCcjbG9hZGRhdGEnKTtcclxuICAgIHZpZXcuYXVkaW8gPSBNYWppYW5nLlVJLmF1ZGlvKCcjbG9hZGRhdGEnKTtcclxuXHJcbiAgICBwcmVmID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5wcmVmJykpO1xyXG5cclxuICAgICQoJ2Zvcm0gaW5wdXRbdHlwZT1cImJ1dHRvblwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcWlwYWkoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oKXtcclxuICAgICAgICBxaXBhaSgkKCdmb3JtIGlucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwoKSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgZnVuY3Rpb24oKXtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudHJpZ2dlcignZm9jdXMnKTtcclxuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvIy4qJC8sJycpKTtcclxuICAgIH0pO1xyXG4gICAgJCgnZm9ybSBbbmFtZT1cInBhaXN0clwiXScpLm9uKCdmb2N1cycsIGNsZWFyX2hhbmRsZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdibHVyJywgICgpPT4gc2V0X2hhbmRsZXIobnVsbCkpO1xyXG5cclxuICAgIGxldCBwYWlzdHIgPSBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJyk7XHJcbiAgICBxaXBhaShwYWlzdHIpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
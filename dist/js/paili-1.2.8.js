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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpbGktMS4yLjguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNhOztBQUViLFFBQVEsNkJBQTZCOztBQUVyQztBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxpREFBaUQseUJBQXlCOztBQUUxRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxrREFBa0QsYUFBYTtBQUMvRCw4Q0FBOEMsRUFBRTtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsaUVBQWlFLGFBQWE7QUFDOUU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsWUFBWTs7QUFFakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHFCQUFxQiw4QkFBOEI7QUFDbkQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsSUFBSTtBQUM1QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9wYWlsaS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqICDpm7vohLPpurvlsIY6IOeJjOeQhiB2MS4wLjBcbiAqXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqICBodHRwczovL2dpdGh1Yi5jb20va29iYWxhYi9NYWppYW5nL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHsgc2V0U2VsZWN0b3IsIGNsZWFyU2VsZWN0b3IgfSA9IE1hamlhbmcuVUkuVXRpbDtcblxuY29uc3QgbW9kZWwgPSB7fTtcbmNvbnN0IHZpZXcgID0ge307XG5cbmNvbnN0IHJ1bGUgPSBNYWppYW5nLnJ1bGUoKTtcblxubGV0IHByZWY7XG5cbmZ1bmN0aW9uIHJlcGFpcl9zaGFuKHNoYW4sIHNob3VwYWkpIHtcbiAgICBsZXQgcGFpc3RyID0gc2hvdXBhaS50b1N0cmluZygpO1xuICAgIGZvciAobGV0IHN1aXRzdHIgb2YgcGFpc3RyLm1hdGNoKC9bbXBzel1bXFxkXFwrXFw9XFwtXSsvZykpIHtcbiAgICAgICAgbGV0IHMgPSBzdWl0c3RyWzBdO1xuICAgICAgICBmb3IgKGxldCBuIG9mIHN1aXRzdHIubWF0Y2goL1xcZC9nKSkge1xuICAgICAgICAgICAgbGV0IGkgPSBzaGFuLl9wYWkuaW5kZXhPZihzK24pO1xuICAgICAgICAgICAgaWYgKGkgPj0gMCkgc2hhbi5fcGFpLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcWlwYWkocGFpc3RyKSB7XG5cbiAgICBtb2RlbC5zaGFuID0gbmV3IE1hamlhbmcuU2hhbihydWxlKTtcblxuICAgIGlmIChwYWlzdHIpIHtcbiAgICAgICAgbW9kZWwuc2hvdXBhaSA9IE1hamlhbmcuU2hvdXBhaS5mcm9tU3RyaW5nKHBhaXN0cik7XG4gICAgICAgIHJlcGFpcl9zaGFuKG1vZGVsLnNoYW4sIG1vZGVsLnNob3VwYWkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IHFpcGFpID0gW107XG4gICAgICAgIHdoaWxlIChxaXBhaS5sZW5ndGggPCAxMykgcWlwYWkucHVzaChtb2RlbC5zaGFuLnppbW8oKSk7XG4gICAgICAgIG1vZGVsLnNob3VwYWkgPSBuZXcgTWFqaWFuZy5TaG91cGFpKHFpcGFpKTtcbiAgICAgICAgbW9kZWwuc2hvdXBhaS56aW1vKG1vZGVsLnNoYW4uemltbygpKTtcbiAgICB9XG4gICAgbW9kZWwubGl6aGkgPSBmYWxzZTtcblxuICAgIHdoaWxlIChtb2RlbC5zaGFuLnBhaXNodSA+IDE3KSBtb2RlbC5zaGFuLnppbW8oKTtcblxuICAgICQoJ2Zvcm0gaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbChtb2RlbC5zaG91cGFpLnRvU3RyaW5nKCkpO1xuICAgIGlmIChwYWlzdHIpIGhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgYCMke21vZGVsLnNob3VwYWkudG9TdHJpbmcoKX1gKTtcblxuICAgIHZpZXcuc2hvdXBhaSA9IG5ldyBNYWppYW5nLlVJLlNob3VwYWkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zaG91cGFpJyksIHZpZXcucGFpLCBtb2RlbC5zaG91cGFpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5yZWRyYXcodHJ1ZSk7XG5cbiAgICBtb2RlbC5oZSA9IG5ldyBNYWppYW5nLkhlKCk7XG4gICAgdmlldy5oZSAgPSBuZXcgTWFqaWFuZy5VSS5IZSgkKCcuaGUnKSwgdmlldy5wYWksIG1vZGVsLmhlKS5yZWRyYXcodHJ1ZSk7XG5cbiAgICBwYWlsaSgxKTtcbn1cblxuZnVuY3Rpb24gc2V0X2hhbmRsZXIoZm9jdXMgPSAtMSkge1xuXG4gICAgZm9yIChsZXQgcCBvZiBtb2RlbC5zaG91cGFpLmdldF9kYXBhaSgpKSB7XG4gICAgICAgIGxldCBwYWkgPSAkKHAuc2xpY2UoLTEpID09ICdfJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBgLnppbW8gLnBhaVtkYXRhLXBhaT1cIiR7cC5zbGljZSgwLDIpfVwiXWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogYD4gLnBhaVtkYXRhLXBhaT1cIiR7cH1cIl1gLFxuICAgICAgICAgICAgICAgICAgICAkKCcuc2hvdXBhaSAuYmluZ3BhaScpKTtcbiAgICAgICAgcGFpLmF0dHIoJ3RhYmluZGV4JywgMCkuYXR0cigncm9sZScsJ2J1dHRvbicpXG4gICAgICAgICAgICAub24oJ2NsaWNrLmRhcGFpJywgKGV2KT0+e1xuICAgICAgICAgICAgICAgICQoZXYudGFyZ2V0KS5hZGRDbGFzcygnZGFwYWknKTtcbiAgICAgICAgICAgICAgICBkYXBhaShwKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBzZXRTZWxlY3RvcigkKCcuc2hvdXBhaSAuYmluZ3BhaSAucGFpW3RhYmluZGV4XScpLCAnZGFwYWknLCB7Zm9jdXM6IGZvY3VzfSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyX2hhbmRsZXIoKSB7XG4gICAgdmlldy5zaG91cGFpLnJlZHJhdygpO1xuICAgIGNsZWFyU2VsZWN0b3IoJ2RhcGFpJyk7XG59XG5cbmZ1bmN0aW9uIGRhcGFpKHApIHtcblxuICAgIGNsZWFyU2VsZWN0b3IoJ2RhcGFpJyk7XG5cbiAgICBpZiAocHJlZi5zb3VuZF9vbikgdmlldy5hdWRpbygnZGFwYWknKS5wbGF5KCk7XG4gICAgbW9kZWwuc2hvdXBhaS5kYXBhaShwKTtcbiAgICB2aWV3LnNob3VwYWkuZGFwYWkocCk7XG5cbiAgICBpZiAoISBtb2RlbC5saXpoaSAmJiBNYWppYW5nLlV0aWwueGlhbmd0aW5nKG1vZGVsLnNob3VwYWkpID09IDApIHtcbiAgICAgICAgbW9kZWwubGl6aGkgPSB0cnVlO1xuICAgICAgICBwICs9ICcqJztcbiAgICB9XG5cbiAgICBtb2RlbC5oZS5kYXBhaShwKTtcbiAgICB2aWV3LmhlLmRhcGFpKHApO1xuXG4gICAgc2V0VGltZW91dCh6aW1vLCA2MDApO1xufVxuXG5mdW5jdGlvbiB6aW1vKCkge1xuXG4gICAgaWYgKCEgbW9kZWwuc2hhbi5wYWlzaHUpIHtcbiAgICAgICAgdmlldy5zaG91cGFpLnJlZHJhdygpO1xuICAgICAgICB2aWV3LmhlLnJlZHJhdygpO1xuICAgICAgICAkKCcuc3RhdHVzJykudGV4dCgn5rWB5bGA4oCm4oCmJyk7XG4gICAgICAgICQoJy5wYWlsaScpLmVtcHR5KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtb2RlbC5zaG91cGFpLnppbW8obW9kZWwuc2hhbi56aW1vKCkpO1xuICAgIHZpZXcuc2hvdXBhaS5yZWRyYXcoKTtcbiAgICB2aWV3LmhlLnJlZHJhdygpO1xuXG4gICAgcGFpbGkoKTtcbn1cblxuZnVuY3Rpb24gcGFpbGkoc3RhcnQpIHtcblxuICAgICQoJy5wYWlsaScpLmVtcHR5KCk7XG5cbiAgICBsZXQgbl94aWFuZ3RpbmcgPSBNYWppYW5nLlV0aWwueGlhbmd0aW5nKG1vZGVsLnNob3VwYWkpO1xuICAgIGlmICAgICAgKG5feGlhbmd0aW5nID09IC0xKSAkKCcuc3RhdHVzJykudGV4dCgn5ZKM5LqG77yB77yBJyk7XG4gICAgZWxzZSBpZiAobl94aWFuZ3RpbmcgPT0gIDApICQoJy5zdGF0dXMnKS50ZXh0KCfogbTniYzvvIEnKTtcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnN0YXR1cycpLnRleHQoYCR7bl94aWFuZ3Rpbmd95ZCR6IG0YCk7XG5cbiAgICBpZiAobl94aWFuZ3RpbmcgPT0gLTEpIHtcbiAgICAgICAgaWYgKHByZWYuc291bmRfb24pIHZpZXcuYXVkaW8oJ3ppbW8nKS5wbGF5KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAobl94aWFuZ3RpbmcgPT0gMCAmJiAhIG1vZGVsLmxpemhpKSB7XG4gICAgICAgIGlmIChwcmVmLnNvdW5kX29uKSB2aWV3LmF1ZGlvKCdsaXpoaScpLnBsYXkoKTtcbiAgICB9XG5cbiAgICBsZXQgZGFwYWkgPSBbXTtcbiAgICBmb3IgKGxldCBwIG9mIG1vZGVsLnNob3VwYWkuZ2V0X2RhcGFpKCkpIHtcblxuICAgICAgICBsZXQgc2hvdXBhaSA9IG1vZGVsLnNob3VwYWkuY2xvbmUoKS5kYXBhaShwKTtcbiAgICAgICAgaWYgKE1hamlhbmcuVXRpbC54aWFuZ3Rpbmcoc2hvdXBhaSkgPiBuX3hpYW5ndGluZykgY29udGludWU7XG5cbiAgICAgICAgcCA9IHBbMF0gKyAoK3BbMV18fDUpO1xuICAgICAgICBpZiAoZGFwYWkuZmluZChkYXBhaSA9PiBkYXBhaS5wID09IHApKSBjb250aW51ZTtcblxuICAgICAgICBsZXQgdGluZ3BhaSA9IE1hamlhbmcuVXRpbC50aW5ncGFpKHNob3VwYWkpO1xuICAgICAgICBsZXQgbiA9IHRpbmdwYWkubWFwKHAgPT4gNCAtIG1vZGVsLnNob3VwYWkuX2JpbmdwYWlbcFswXV1bcFsxXV0pXG4gICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHgsIHkpPT4geCArIHksIDApXG5cbiAgICAgICAgZGFwYWkucHVzaCh7IHA6IHAsIHRpbmdwYWk6IHRpbmdwYWksIG46IG4gfSk7XG4gICAgfVxuXG4gICAgY29uc3QgY21wID0gKGEsIGIpID0+IGIubiAtIGEublxuICAgICAgICAgICAgICAgICAgICAgICB8fCBiLnRpbmdwYWkubGVuZ3RoIC0gYS50aW5ncGFpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICB8fCAoYS5wIDwgYi5wID8gLTEgOiAxKTtcbiAgICBmb3IgKGxldCBkIG9mIGRhcGFpLnNvcnQoY21wKSkge1xuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2PuaJkzogJ1xuICAgICAgICAgICAgICAgICArICQoJzxzcGFuPicpLmFwcGVuZCh2aWV3LnBhaShkLnApKS5odG1sKClcbiAgICAgICAgICAgICAgICAgKyAnIOaRuDogJ1xuICAgICAgICAgICAgICAgICArIGQudGluZ3BhaS5tYXAoXG4gICAgICAgICAgICAgICAgICAgICBwID0+ICQoJzxzcGFuPicpLmFwcGVuZCh2aWV3LnBhaShwKSkuaHRtbCgpXG4gICAgICAgICAgICAgICAgICkuam9pbignJylcbiAgICAgICAgICAgICAgICAgKyBgICgke2Qubn3mnpopPC9kaXY+YDtcbiAgICAgICAgJCgnLnBhaWxpJykuYXBwZW5kKCQoaHRtbCkpO1xuICAgIH1cblxuICAgIGlmIChzdGFydCkgc2V0VGltZW91dChzZXRfaGFuZGxlciwgNjAwKTtcbiAgICBlbHNlICAgICAgIHNldF9oYW5kbGVyKCk7XG59XG5cbiQoZnVuY3Rpb24oKXtcblxuICAgIHZpZXcucGFpICAgPSBNYWppYW5nLlVJLnBhaSgnI2xvYWRkYXRhJyk7XG4gICAgdmlldy5hdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJyNsb2FkZGF0YScpO1xuXG4gICAgcHJlZiA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucHJlZicpKTtcblxuICAgICQoJ2Zvcm0gaW5wdXRbdHlwZT1cImJ1dHRvblwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHFpcGFpKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCdmb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHFpcGFpKCQoJ2Zvcm0gaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbCgpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJ2Zvcm0nKS5vbigncmVzZXQnLCBmdW5jdGlvbigpe1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudHJpZ2dlcignZm9jdXMnKTtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoJycsICcnLCBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyMuKiQvLCcnKSk7XG4gICAgfSk7XG4gICAgJCgnZm9ybSBbbmFtZT1cInBhaXN0clwiXScpLm9uKCdmb2N1cycsIGNsZWFyX2hhbmRsZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignYmx1cicsICAoKT0+IHNldF9oYW5kbGVyKG51bGwpKTtcblxuICAgIGxldCBwYWlzdHIgPSBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJyk7XG4gICAgcWlwYWkocGFpc3RyKTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
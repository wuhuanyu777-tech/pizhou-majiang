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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpbGktMS4yLjExLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTs7QUFFYixRQUFRLDZCQUE2Qjs7QUFFckM7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsaURBQWlELHlCQUF5Qjs7QUFFMUU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0Esa0RBQWtELGFBQWE7QUFDL0QsOENBQThDLEVBQUU7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGlFQUFpRSxhQUFhO0FBQzlFOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscURBQXFELFlBQVk7O0FBRWpFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsOEJBQThCO0FBQ25EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLElBQUk7QUFDNUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvcGFpbGkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDniYznkIYgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IHNldFNlbGVjdG9yLCBjbGVhclNlbGVjdG9yIH0gPSBNYWppYW5nLlVJLlV0aWw7XG5cbmNvbnN0IG1vZGVsID0ge307XG5jb25zdCB2aWV3ICA9IHt9O1xuXG5jb25zdCBydWxlID0gTWFqaWFuZy5ydWxlKCk7XG5cbmxldCBwcmVmO1xuXG5mdW5jdGlvbiByZXBhaXJfc2hhbihzaGFuLCBzaG91cGFpKSB7XG4gICAgbGV0IHBhaXN0ciA9IHNob3VwYWkudG9TdHJpbmcoKTtcbiAgICBmb3IgKGxldCBzdWl0c3RyIG9mIHBhaXN0ci5tYXRjaCgvW21wc3pdW1xcZFxcK1xcPVxcLV0rL2cpKSB7XG4gICAgICAgIGxldCBzID0gc3VpdHN0clswXTtcbiAgICAgICAgZm9yIChsZXQgbiBvZiBzdWl0c3RyLm1hdGNoKC9cXGQvZykpIHtcbiAgICAgICAgICAgIGxldCBpID0gc2hhbi5fcGFpLmluZGV4T2YocytuKTtcbiAgICAgICAgICAgIGlmIChpID49IDApIHNoYW4uX3BhaS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHFpcGFpKHBhaXN0cikge1xuXG4gICAgbW9kZWwuc2hhbiA9IG5ldyBNYWppYW5nLlNoYW4ocnVsZSk7XG5cbiAgICBpZiAocGFpc3RyKSB7XG4gICAgICAgIG1vZGVsLnNob3VwYWkgPSBNYWppYW5nLlNob3VwYWkuZnJvbVN0cmluZyhwYWlzdHIpO1xuICAgICAgICByZXBhaXJfc2hhbihtb2RlbC5zaGFuLCBtb2RlbC5zaG91cGFpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBxaXBhaSA9IFtdO1xuICAgICAgICB3aGlsZSAocWlwYWkubGVuZ3RoIDwgMTMpIHFpcGFpLnB1c2gobW9kZWwuc2hhbi56aW1vKCkpO1xuICAgICAgICBtb2RlbC5zaG91cGFpID0gbmV3IE1hamlhbmcuU2hvdXBhaShxaXBhaSk7XG4gICAgICAgIG1vZGVsLnNob3VwYWkuemltbyhtb2RlbC5zaGFuLnppbW8oKSk7XG4gICAgfVxuICAgIG1vZGVsLmxpemhpID0gZmFsc2U7XG5cbiAgICB3aGlsZSAobW9kZWwuc2hhbi5wYWlzaHUgPiAxNykgbW9kZWwuc2hhbi56aW1vKCk7XG5cbiAgICAkKCdmb3JtIGlucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwobW9kZWwuc2hvdXBhaS50b1N0cmluZygpKTtcbiAgICBpZiAocGFpc3RyKSBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGAjJHttb2RlbC5zaG91cGFpLnRvU3RyaW5nKCl9YCk7XG5cbiAgICB2aWV3LnNob3VwYWkgPSBuZXcgTWFqaWFuZy5VSS5TaG91cGFpKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2hvdXBhaScpLCB2aWV3LnBhaSwgbW9kZWwuc2hvdXBhaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkucmVkcmF3KHRydWUpO1xuXG4gICAgbW9kZWwuaGUgPSBuZXcgTWFqaWFuZy5IZSgpO1xuICAgIHZpZXcuaGUgID0gbmV3IE1hamlhbmcuVUkuSGUoJCgnLmhlJyksIHZpZXcucGFpLCBtb2RlbC5oZSkucmVkcmF3KHRydWUpO1xuXG4gICAgcGFpbGkoMSk7XG59XG5cbmZ1bmN0aW9uIHNldF9oYW5kbGVyKGZvY3VzID0gLTEpIHtcblxuICAgIGZvciAobGV0IHAgb2YgbW9kZWwuc2hvdXBhaS5nZXRfZGFwYWkoKSkge1xuICAgICAgICBsZXQgcGFpID0gJChwLnNsaWNlKC0xKSA9PSAnXydcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYC56aW1vIC5wYWlbZGF0YS1wYWk9XCIke3Auc2xpY2UoMCwyKX1cIl1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGA+IC5wYWlbZGF0YS1wYWk9XCIke3B9XCJdYCxcbiAgICAgICAgICAgICAgICAgICAgJCgnLnNob3VwYWkgLmJpbmdwYWknKSk7XG4gICAgICAgIHBhaS5hdHRyKCd0YWJpbmRleCcsIDApLmF0dHIoJ3JvbGUnLCdidXR0b24nKVxuICAgICAgICAgICAgLm9uKCdjbGljay5kYXBhaScsIChldik9PntcbiAgICAgICAgICAgICAgICAkKGV2LnRhcmdldCkuYWRkQ2xhc3MoJ2RhcGFpJyk7XG4gICAgICAgICAgICAgICAgZGFwYWkocCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgc2V0U2VsZWN0b3IoJCgnLnNob3VwYWkgLmJpbmdwYWkgLnBhaVt0YWJpbmRleF0nKSwgJ2RhcGFpJywge2ZvY3VzOiBmb2N1c30pO1xufVxuXG5mdW5jdGlvbiBjbGVhcl9oYW5kbGVyKCkge1xuICAgIHZpZXcuc2hvdXBhaS5yZWRyYXcoKTtcbiAgICBjbGVhclNlbGVjdG9yKCdkYXBhaScpO1xufVxuXG5mdW5jdGlvbiBkYXBhaShwKSB7XG5cbiAgICBjbGVhclNlbGVjdG9yKCdkYXBhaScpO1xuXG4gICAgaWYgKHByZWYuc291bmRfb24pIHZpZXcuYXVkaW8oJ2RhcGFpJykucGxheSgpO1xuICAgIG1vZGVsLnNob3VwYWkuZGFwYWkocCk7XG4gICAgdmlldy5zaG91cGFpLmRhcGFpKHApO1xuXG4gICAgaWYgKCEgbW9kZWwubGl6aGkgJiYgTWFqaWFuZy5VdGlsLnhpYW5ndGluZyhtb2RlbC5zaG91cGFpKSA9PSAwKSB7XG4gICAgICAgIG1vZGVsLmxpemhpID0gdHJ1ZTtcbiAgICAgICAgcCArPSAnKic7XG4gICAgfVxuXG4gICAgbW9kZWwuaGUuZGFwYWkocCk7XG4gICAgdmlldy5oZS5kYXBhaShwKTtcblxuICAgIHNldFRpbWVvdXQoemltbywgNjAwKTtcbn1cblxuZnVuY3Rpb24gemltbygpIHtcblxuICAgIGlmICghIG1vZGVsLnNoYW4ucGFpc2h1KSB7XG4gICAgICAgIHZpZXcuc2hvdXBhaS5yZWRyYXcoKTtcbiAgICAgICAgdmlldy5oZS5yZWRyYXcoKTtcbiAgICAgICAgJCgnLnN0YXR1cycpLnRleHQoJ+a1geWxgOKApuKApicpO1xuICAgICAgICAkKCcucGFpbGknKS5lbXB0eSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbW9kZWwuc2hvdXBhaS56aW1vKG1vZGVsLnNoYW4uemltbygpKTtcbiAgICB2aWV3LnNob3VwYWkucmVkcmF3KCk7XG4gICAgdmlldy5oZS5yZWRyYXcoKTtcblxuICAgIHBhaWxpKCk7XG59XG5cbmZ1bmN0aW9uIHBhaWxpKHN0YXJ0KSB7XG5cbiAgICAkKCcucGFpbGknKS5lbXB0eSgpO1xuXG4gICAgbGV0IG5feGlhbmd0aW5nID0gTWFqaWFuZy5VdGlsLnhpYW5ndGluZyhtb2RlbC5zaG91cGFpKTtcbiAgICBpZiAgICAgIChuX3hpYW5ndGluZyA9PSAtMSkgJCgnLnN0YXR1cycpLnRleHQoJ+WSjOS6hu+8ge+8gScpO1xuICAgIGVsc2UgaWYgKG5feGlhbmd0aW5nID09ICAwKSAkKCcuc3RhdHVzJykudGV4dCgn6IG054mM77yBJyk7XG4gICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zdGF0dXMnKS50ZXh0KGAke25feGlhbmd0aW5nfeWQkeiBtGApO1xuXG4gICAgaWYgKG5feGlhbmd0aW5nID09IC0xKSB7XG4gICAgICAgIGlmIChwcmVmLnNvdW5kX29uKSB2aWV3LmF1ZGlvKCd6aW1vJykucGxheSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKG5feGlhbmd0aW5nID09IDAgJiYgISBtb2RlbC5saXpoaSkge1xuICAgICAgICBpZiAocHJlZi5zb3VuZF9vbikgdmlldy5hdWRpbygnbGl6aGknKS5wbGF5KCk7XG4gICAgfVxuXG4gICAgbGV0IGRhcGFpID0gW107XG4gICAgZm9yIChsZXQgcCBvZiBtb2RlbC5zaG91cGFpLmdldF9kYXBhaSgpKSB7XG5cbiAgICAgICAgbGV0IHNob3VwYWkgPSBtb2RlbC5zaG91cGFpLmNsb25lKCkuZGFwYWkocCk7XG4gICAgICAgIGlmIChNYWppYW5nLlV0aWwueGlhbmd0aW5nKHNob3VwYWkpID4gbl94aWFuZ3RpbmcpIGNvbnRpbnVlO1xuXG4gICAgICAgIHAgPSBwWzBdICsgKCtwWzFdfHw1KTtcbiAgICAgICAgaWYgKGRhcGFpLmZpbmQoZGFwYWkgPT4gZGFwYWkucCA9PSBwKSkgY29udGludWU7XG5cbiAgICAgICAgbGV0IHRpbmdwYWkgPSBNYWppYW5nLlV0aWwudGluZ3BhaShzaG91cGFpKTtcbiAgICAgICAgbGV0IG4gPSB0aW5ncGFpLm1hcChwID0+IDQgLSBtb2RlbC5zaG91cGFpLl9iaW5ncGFpW3BbMF1dW3BbMV1dKVxuICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKCh4LCB5KT0+IHggKyB5LCAwKVxuXG4gICAgICAgIGRhcGFpLnB1c2goeyBwOiBwLCB0aW5ncGFpOiB0aW5ncGFpLCBuOiBuIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGNtcCA9IChhLCBiKSA9PiBiLm4gLSBhLm5cbiAgICAgICAgICAgICAgICAgICAgICAgfHwgYi50aW5ncGFpLmxlbmd0aCAtIGEudGluZ3BhaS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgfHwgKGEucCA8IGIucCA/IC0xIDogMSk7XG4gICAgZm9yIChsZXQgZCBvZiBkYXBhaS5zb3J0KGNtcCkpIHtcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdj7miZM6ICdcbiAgICAgICAgICAgICAgICAgKyAkKCc8c3Bhbj4nKS5hcHBlbmQodmlldy5wYWkoZC5wKSkuaHRtbCgpXG4gICAgICAgICAgICAgICAgICsgJyDmkbg6ICdcbiAgICAgICAgICAgICAgICAgKyBkLnRpbmdwYWkubWFwKFxuICAgICAgICAgICAgICAgICAgICAgcCA9PiAkKCc8c3Bhbj4nKS5hcHBlbmQodmlldy5wYWkocCkpLmh0bWwoKVxuICAgICAgICAgICAgICAgICApLmpvaW4oJycpXG4gICAgICAgICAgICAgICAgICsgYCAoJHtkLm595p6aKTwvZGl2PmA7XG4gICAgICAgICQoJy5wYWlsaScpLmFwcGVuZCgkKGh0bWwpKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQpIHNldFRpbWVvdXQoc2V0X2hhbmRsZXIsIDYwMCk7XG4gICAgZWxzZSAgICAgICBzZXRfaGFuZGxlcigpO1xufVxuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICB2aWV3LnBhaSAgID0gTWFqaWFuZy5VSS5wYWkoJyNsb2FkZGF0YScpO1xuICAgIHZpZXcuYXVkaW8gPSBNYWppYW5nLlVJLmF1ZGlvKCcjbG9hZGRhdGEnKTtcblxuICAgIHByZWYgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnByZWYnKSk7XG5cbiAgICAkKCdmb3JtIGlucHV0W3R5cGU9XCJidXR0b25cIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBxaXBhaSgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgJCgnZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbigpe1xuICAgICAgICBxaXBhaSgkKCdmb3JtIGlucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwoKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnRyaWdnZXIoJ2ZvY3VzJyk7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8jLiokLywnJykpO1xuICAgIH0pO1xuICAgICQoJ2Zvcm0gW25hbWU9XCJwYWlzdHJcIl0nKS5vbignZm9jdXMnLCBjbGVhcl9oYW5kbGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2JsdXInLCAgKCk9PiBzZXRfaGFuZGxlcihudWxsKSk7XG5cbiAgICBsZXQgcGFpc3RyID0gbG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpO1xuICAgIHFpcGFpKHBhaXN0cik7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
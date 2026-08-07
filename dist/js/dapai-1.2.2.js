/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/js/dapai.js ***!
  \*************************/
/*!
 *  電脳麻将: 何切る解答機 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { hide, show, fadeIn, fadeOut, scale } = Majiang.UI.Util;
const minipaipu = Majiang.AI.minipaipu;

let pai, audio;

function init(fragment) {

    if (fragment) {

        let [ baseinfo, heinfo ] = fragment.split(/&/);

        let xun, param = baseinfo.split(/\//);
        if (param.length && param[param.length-1][0] == '+') xun = param.pop();
        let [ paistr, zhuangfeng, menfeng, baopai, hongpai ] = param;
        baopai  = (baopai   || '').split(/,/);
        hongpai = ! hongpai;

        $('input[name="paistr"]').val(paistr);
        $('select[name="zhuangfeng"]').val(+zhuangfeng||0);
        $('select[name="menfeng"]').val(+menfeng||0);
        $('select[name="xun"]').val(+xun||7);
        for (let i = 0; i < baopai.length; i++) {
            $('input[name="baopai"]').eq(i).val(baopai[i]);
        }
        $('input[name="hongpai"]').prop('checked', hongpai);

        if (heinfo != null) {
            $('form input[name="heinfo"]').prop('checked', true)
                                          .trigger('change');
            let hestr = heinfo.split(/\//);
            for (let l = 0; l < 4; l++) {
                $('input[name="hestr"]').eq(l).val(hestr[l]);
            }
        }

        submit();
    }
    else {
        $('input[name="paistr"]').val('m123p1234789s338s8').focus();
        $('input[name="baopai"]').eq(0).val('s3');
    }
}

function submit(ev) {

    hide($('.shan, .shoupai, .analyzer', $('#demo')));

    let paistr = $('input[name="paistr"]').val();
    if (! paistr) return false;

    let zhuangfeng = + $('select[name="zhuangfeng"]').val();
    let menfeng    = + $('select[name="menfeng"]').val();
    let xun        = + $('select[name="xun"]').val();
    let baopai     = $('input[name="baopai"]').map((i,n)=>$(n).val()).toArray()
                                    .filter(p => Majiang.Shoupai.valid_pai(p));
    let hongpai    = $('input[name="hongpai"]').prop('checked');

    if (! baopai.length) baopai = ['z2'];

    let heinfo = $('input[name="hestr"]').map((i,n)=>$(n).val()).toArray();

    if (! hongpai) {
        paistr = paistr.replace(/0/,'5');
        baopai = baopai.map(p => p.replace(/0/,'5'));
        heinfo = heinfo.map(hestr => hestr.replace(/0/,'5'));
    }

    let baseinfo = { paistr: paistr, zhuangfeng: zhuangfeng, menfeng: menfeng,
                     baopai: baopai, hongpai: hongpai, xun: xun };

    let analyzer;
    let kaiju = { id: 0, rule: Majiang.rule(), qijia: 0 };

    if ($('form input[name="heinfo"]').prop('checked')) {

        analyzer = new Majiang.UI.Analyzer($('#board >.analyzer'), kaiju, pai);

        heinfo = minipaipu(analyzer, baseinfo, heinfo, true);

        let view = new Majiang.UI.Board($('#board .board'),
                                        pai, audio, analyzer.model);
        view.no_player_name = true;
        view.open_he        = true;
        view.redraw();

        let zimo = analyzer.shoupai._zimo
        if (zimo) {
            if (zimo.length == 2)
                    analyzer.action_zimo({ l: menfeng, p: zimo });
            else    analyzer.action_fulou({ l: menfeng, m: zimo });
        }
        else {
            let l = analyzer.model.lunban;
            if (l != -1) {
                let p = analyzer.model.he[l]._pai.slice(-1)[0];
                analyzer.action_dapai({ l: l, p: p });
            }
            else {
                analyzer.action_qipai();
            }
        }
        $('body').attr('class','board analyzer');
        scale($('#board'), $('#space'));
    }
    else {
        analyzer = new Majiang.UI.Analyzer($('#demo >.analyzer'), kaiju, pai);

        minipaipu(analyzer, baseinfo);

        new Majiang.UI.Shan($('#demo .shan'), pai, analyzer.shan).redraw();
        new Majiang.UI.Shoupai($('#demo .shoupai'), pai, analyzer.shoupai)
                                                                .redraw(true);

        let zimo = analyzer.shoupai._zimo
        if (zimo) {
            if (zimo.length == 2)
                    analyzer.action_zimo({ l: menfeng, p: zimo });
            else    analyzer.action_fulou({ l: menfeng, m: zimo });
        }
        fadeIn($('.shan, .shoupai, .analyzer', $('#demo')));

        heinfo = null;
    }

    paistr = analyzer.shoupai.toString();
    $('input[name="paistr"]').val(paistr);

    baopai = analyzer.shan.baopai;
    for (let i = 0; i < 5; i++) {
        $('input[name="baopai"]').eq(i).val(baopai[i] || '');
    }

    if (heinfo) {
        for (let i = 0; i < 4; i++)  {
            $('input[name="hestr"]').eq(i).val(heinfo[i]);
        }
    }

    let fragment = '#'
                 + [ paistr, zhuangfeng, menfeng, baopai.join(',')].join('/');
    if (! hongpai) fragment += '/1';

    if (heinfo) fragment += '&' + heinfo.join('/');
    else        fragment += '/+' + xun;

    history.replaceState('', '', fragment)

    return false;
}

function set_controller(root) {
    root.addClass('paipu');
    $(window).on('keyup', (ev)=>{
        if (ev.key == 'q' || ev.key == 'Escape') {
            if ($('body').attr('class') != 'demo')
                                    $('body').attr('class','demo');
        }
    });
    hide($('> img', root));
    show($('> img.exit', root).on('click', ()=>$('body').attr('class','demo')));
}

$(function(){

    pai = Majiang.UI.pai('#loaddata');
    audio = Majiang.UI.audio('#loaddata');

    $('form input[name="heinfo"]').on('change', function(){
        if ($(this).prop('checked')) {
            show($('form .heinfo'));
            hide($('form .xun'));
        }
        else {
            hide($('form .heinfo'));
            show($('form .xun'));
        }
    });
    hide($('form .heinfo'));

    $('form').on('submit', submit);

    $('form').on('reset', function(){
        hide($('.shan, .shoupai, .analyzer', $('#demo')));
        hide($('form .heinfo'));
        $('form input[name="paistr"]').focus();
    });

    $(window).on('resize', ()=>scale($('#board'), $('#space')));

    set_controller($('#board .controller'));

    let fragment = location.hash.replace(/^#/,'');
    init(fragment);
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFwYWktMS4yLjIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNhOztBQUViLFFBQVEscUNBQXFDO0FBQzdDOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsbUJBQW1CO0FBQzNDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixPQUFPO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBLGtCQUFrQjs7QUFFbEI7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMscUJBQXFCO0FBQ2hFLDRDQUE0QyxxQkFBcUI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxZQUFZO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMscUJBQXFCO0FBQ2hFLDRDQUE0QyxxQkFBcUI7QUFDakU7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0IsT0FBTztBQUMzQjtBQUNBOztBQUVBO0FBQ0Esd0JBQXdCLE9BQU87QUFDL0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL2RhcGFpLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogIOmbu+iEs+m6u+Wwhjog5L2V5YiH44KL6Kej562U5qmfIHYxLjAuMFxuICpcbiAqICBDb3B5cmlnaHQoQykgMjAxNyBTYXRvc2hpIEtvYmF5YXNoaVxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgeyBoaWRlLCBzaG93LCBmYWRlSW4sIGZhZGVPdXQsIHNjYWxlIH0gPSBNYWppYW5nLlVJLlV0aWw7XG5jb25zdCBtaW5pcGFpcHUgPSBNYWppYW5nLkFJLm1pbmlwYWlwdTtcblxubGV0IHBhaSwgYXVkaW87XG5cbmZ1bmN0aW9uIGluaXQoZnJhZ21lbnQpIHtcblxuICAgIGlmIChmcmFnbWVudCkge1xuXG4gICAgICAgIGxldCBbIGJhc2VpbmZvLCBoZWluZm8gXSA9IGZyYWdtZW50LnNwbGl0KC8mLyk7XG5cbiAgICAgICAgbGV0IHh1biwgcGFyYW0gPSBiYXNlaW5mby5zcGxpdCgvXFwvLyk7XG4gICAgICAgIGlmIChwYXJhbS5sZW5ndGggJiYgcGFyYW1bcGFyYW0ubGVuZ3RoLTFdWzBdID09ICcrJykgeHVuID0gcGFyYW0ucG9wKCk7XG4gICAgICAgIGxldCBbIHBhaXN0ciwgemh1YW5nZmVuZywgbWVuZmVuZywgYmFvcGFpLCBob25ncGFpIF0gPSBwYXJhbTtcbiAgICAgICAgYmFvcGFpICA9IChiYW9wYWkgICB8fCAnJykuc3BsaXQoLywvKTtcbiAgICAgICAgaG9uZ3BhaSA9ICEgaG9uZ3BhaTtcblxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKHBhaXN0cik7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwiemh1YW5nZmVuZ1wiXScpLnZhbCgremh1YW5nZmVuZ3x8MCk7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwibWVuZmVuZ1wiXScpLnZhbCgrbWVuZmVuZ3x8MCk7XG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwieHVuXCJdJykudmFsKCt4dW58fDcpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhb3BhaS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLmVxKGkpLnZhbChiYW9wYWlbaV0pO1xuICAgICAgICB9XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJob25ncGFpXCJdJykucHJvcCgnY2hlY2tlZCcsIGhvbmdwYWkpO1xuXG4gICAgICAgIGlmIChoZWluZm8gIT0gbnVsbCkge1xuICAgICAgICAgICAgJCgnZm9ybSBpbnB1dFtuYW1lPVwiaGVpbmZvXCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgICAgICBsZXQgaGVzdHIgPSBoZWluZm8uc3BsaXQoL1xcLy8pO1xuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCA0OyBsKyspIHtcbiAgICAgICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiaGVzdHJcIl0nKS5lcShsKS52YWwoaGVzdHJbbF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3VibWl0KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKCdtMTIzcDEyMzQ3ODlzMzM4czgnKS5mb2N1cygpO1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiYmFvcGFpXCJdJykuZXEoMCkudmFsKCdzMycpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3VibWl0KGV2KSB7XG5cbiAgICBoaWRlKCQoJy5zaGFuLCAuc2hvdXBhaSwgLmFuYWx5emVyJywgJCgnI2RlbW8nKSkpO1xuXG4gICAgbGV0IHBhaXN0ciA9ICQoJ2lucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwoKTtcbiAgICBpZiAoISBwYWlzdHIpIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB6aHVhbmdmZW5nID0gKyAkKCdzZWxlY3RbbmFtZT1cInpodWFuZ2ZlbmdcIl0nKS52YWwoKTtcbiAgICBsZXQgbWVuZmVuZyAgICA9ICsgJCgnc2VsZWN0W25hbWU9XCJtZW5mZW5nXCJdJykudmFsKCk7XG4gICAgbGV0IHh1biAgICAgICAgPSArICQoJ3NlbGVjdFtuYW1lPVwieHVuXCJdJykudmFsKCk7XG4gICAgbGV0IGJhb3BhaSAgICAgPSAkKCdpbnB1dFtuYW1lPVwiYmFvcGFpXCJdJykubWFwKChpLG4pPT4kKG4pLnZhbCgpKS50b0FycmF5KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIocCA9PiBNYWppYW5nLlNob3VwYWkudmFsaWRfcGFpKHApKTtcbiAgICBsZXQgaG9uZ3BhaSAgICA9ICQoJ2lucHV0W25hbWU9XCJob25ncGFpXCJdJykucHJvcCgnY2hlY2tlZCcpO1xuXG4gICAgaWYgKCEgYmFvcGFpLmxlbmd0aCkgYmFvcGFpID0gWyd6MiddO1xuXG4gICAgbGV0IGhlaW5mbyA9ICQoJ2lucHV0W25hbWU9XCJoZXN0clwiXScpLm1hcCgoaSxuKT0+JChuKS52YWwoKSkudG9BcnJheSgpO1xuXG4gICAgaWYgKCEgaG9uZ3BhaSkge1xuICAgICAgICBwYWlzdHIgPSBwYWlzdHIucmVwbGFjZSgvMC8sJzUnKTtcbiAgICAgICAgYmFvcGFpID0gYmFvcGFpLm1hcChwID0+IHAucmVwbGFjZSgvMC8sJzUnKSk7XG4gICAgICAgIGhlaW5mbyA9IGhlaW5mby5tYXAoaGVzdHIgPT4gaGVzdHIucmVwbGFjZSgvMC8sJzUnKSk7XG4gICAgfVxuXG4gICAgbGV0IGJhc2VpbmZvID0geyBwYWlzdHI6IHBhaXN0ciwgemh1YW5nZmVuZzogemh1YW5nZmVuZywgbWVuZmVuZzogbWVuZmVuZyxcbiAgICAgICAgICAgICAgICAgICAgIGJhb3BhaTogYmFvcGFpLCBob25ncGFpOiBob25ncGFpLCB4dW46IHh1biB9O1xuXG4gICAgbGV0IGFuYWx5emVyO1xuICAgIGxldCBrYWlqdSA9IHsgaWQ6IDAsIHJ1bGU6IE1hamlhbmcucnVsZSgpLCBxaWppYTogMCB9O1xuXG4gICAgaWYgKCQoJ2Zvcm0gaW5wdXRbbmFtZT1cImhlaW5mb1wiXScpLnByb3AoJ2NoZWNrZWQnKSkge1xuXG4gICAgICAgIGFuYWx5emVyID0gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2JvYXJkID4uYW5hbHl6ZXInKSwga2FpanUsIHBhaSk7XG5cbiAgICAgICAgaGVpbmZvID0gbWluaXBhaXB1KGFuYWx5emVyLCBiYXNlaW5mbywgaGVpbmZvLCB0cnVlKTtcblxuICAgICAgICBsZXQgdmlldyA9IG5ldyBNYWppYW5nLlVJLkJvYXJkKCQoJyNib2FyZCAuYm9hcmQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWksIGF1ZGlvLCBhbmFseXplci5tb2RlbCk7XG4gICAgICAgIHZpZXcubm9fcGxheWVyX25hbWUgPSB0cnVlO1xuICAgICAgICB2aWV3Lm9wZW5faGUgICAgICAgID0gdHJ1ZTtcbiAgICAgICAgdmlldy5yZWRyYXcoKTtcblxuICAgICAgICBsZXQgemltbyA9IGFuYWx5emVyLnNob3VwYWkuX3ppbW9cbiAgICAgICAgaWYgKHppbW8pIHtcbiAgICAgICAgICAgIGlmICh6aW1vLmxlbmd0aCA9PSAyKVxuICAgICAgICAgICAgICAgICAgICBhbmFseXplci5hY3Rpb25femltbyh7IGw6IG1lbmZlbmcsIHA6IHppbW8gfSk7XG4gICAgICAgICAgICBlbHNlICAgIGFuYWx5emVyLmFjdGlvbl9mdWxvdSh7IGw6IG1lbmZlbmcsIG06IHppbW8gfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgbCA9IGFuYWx5emVyLm1vZGVsLmx1bmJhbjtcbiAgICAgICAgICAgIGlmIChsICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBhbmFseXplci5tb2RlbC5oZVtsXS5fcGFpLnNsaWNlKC0xKVswXTtcbiAgICAgICAgICAgICAgICBhbmFseXplci5hY3Rpb25fZGFwYWkoeyBsOiBsLCBwOiBwIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX3FpcGFpKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQgYW5hbHl6ZXInKTtcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGFuYWx5emVyID0gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2RlbW8gPi5hbmFseXplcicpLCBrYWlqdSwgcGFpKTtcblxuICAgICAgICBtaW5pcGFpcHUoYW5hbHl6ZXIsIGJhc2VpbmZvKTtcblxuICAgICAgICBuZXcgTWFqaWFuZy5VSS5TaGFuKCQoJyNkZW1vIC5zaGFuJyksIHBhaSwgYW5hbHl6ZXIuc2hhbikucmVkcmF3KCk7XG4gICAgICAgIG5ldyBNYWppYW5nLlVJLlNob3VwYWkoJCgnI2RlbW8gLnNob3VwYWknKSwgcGFpLCBhbmFseXplci5zaG91cGFpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZWRyYXcodHJ1ZSk7XG5cbiAgICAgICAgbGV0IHppbW8gPSBhbmFseXplci5zaG91cGFpLl96aW1vXG4gICAgICAgIGlmICh6aW1vKSB7XG4gICAgICAgICAgICBpZiAoemltby5sZW5ndGggPT0gMilcbiAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX3ppbW8oeyBsOiBtZW5mZW5nLCBwOiB6aW1vIH0pO1xuICAgICAgICAgICAgZWxzZSAgICBhbmFseXplci5hY3Rpb25fZnVsb3UoeyBsOiBtZW5mZW5nLCBtOiB6aW1vIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZhZGVJbigkKCcuc2hhbiwgLnNob3VwYWksIC5hbmFseXplcicsICQoJyNkZW1vJykpKTtcblxuICAgICAgICBoZWluZm8gPSBudWxsO1xuICAgIH1cblxuICAgIHBhaXN0ciA9IGFuYWx5emVyLnNob3VwYWkudG9TdHJpbmcoKTtcbiAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKHBhaXN0cik7XG5cbiAgICBiYW9wYWkgPSBhbmFseXplci5zaGFuLmJhb3BhaTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiYmFvcGFpXCJdJykuZXEoaSkudmFsKGJhb3BhaVtpXSB8fCAnJyk7XG4gICAgfVxuXG4gICAgaWYgKGhlaW5mbykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykgIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJoZXN0clwiXScpLmVxKGkpLnZhbChoZWluZm9baV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZyYWdtZW50ID0gJyMnXG4gICAgICAgICAgICAgICAgICsgWyBwYWlzdHIsIHpodWFuZ2ZlbmcsIG1lbmZlbmcsIGJhb3BhaS5qb2luKCcsJyldLmpvaW4oJy8nKTtcbiAgICBpZiAoISBob25ncGFpKSBmcmFnbWVudCArPSAnLzEnO1xuXG4gICAgaWYgKGhlaW5mbykgZnJhZ21lbnQgKz0gJyYnICsgaGVpbmZvLmpvaW4oJy8nKTtcbiAgICBlbHNlICAgICAgICBmcmFnbWVudCArPSAnLysnICsgeHVuO1xuXG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoJycsICcnLCBmcmFnbWVudClcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0X2NvbnRyb2xsZXIocm9vdCkge1xuICAgIHJvb3QuYWRkQ2xhc3MoJ3BhaXB1Jyk7XG4gICAgJCh3aW5kb3cpLm9uKCdrZXl1cCcsIChldik9PntcbiAgICAgICAgaWYgKGV2LmtleSA9PSAncScgfHwgZXYua2V5ID09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBpZiAoJCgnYm9keScpLmF0dHIoJ2NsYXNzJykgIT0gJ2RlbW8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZGVtbycpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaGlkZSgkKCc+IGltZycsIHJvb3QpKTtcbiAgICBzaG93KCQoJz4gaW1nLmV4aXQnLCByb290KS5vbignY2xpY2snLCAoKT0+JCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZGVtbycpKSk7XG59XG5cbiQoZnVuY3Rpb24oKXtcblxuICAgIHBhaSA9IE1hamlhbmcuVUkucGFpKCcjbG9hZGRhdGEnKTtcbiAgICBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJyNsb2FkZGF0YScpO1xuXG4gICAgJCgnZm9ybSBpbnB1dFtuYW1lPVwiaGVpbmZvXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICgkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgc2hvdygkKCdmb3JtIC5oZWluZm8nKSk7XG4gICAgICAgICAgICBoaWRlKCQoJ2Zvcm0gLnh1bicpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhpZGUoJCgnZm9ybSAuaGVpbmZvJykpO1xuICAgICAgICAgICAgc2hvdygkKCdmb3JtIC54dW4nKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBoaWRlKCQoJ2Zvcm0gLmhlaW5mbycpKTtcblxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0Jywgc3VibWl0KTtcblxuICAgICQoJ2Zvcm0nKS5vbigncmVzZXQnLCBmdW5jdGlvbigpe1xuICAgICAgICBoaWRlKCQoJy5zaGFuLCAuc2hvdXBhaSwgLmFuYWx5emVyJywgJCgnI2RlbW8nKSkpO1xuICAgICAgICBoaWRlKCQoJ2Zvcm0gLmhlaW5mbycpKTtcbiAgICAgICAgJCgnZm9ybSBpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykuZm9jdXMoKTtcbiAgICB9KTtcblxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xuXG4gICAgc2V0X2NvbnRyb2xsZXIoJCgnI2JvYXJkIC5jb250cm9sbGVyJykpO1xuXG4gICAgbGV0IGZyYWdtZW50ID0gbG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpO1xuICAgIGluaXQoZnJhZ21lbnQpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
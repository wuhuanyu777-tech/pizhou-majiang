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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFwYWktMS4yLjMzLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTtBQUNiO0FBQ0EsUUFBUSxxQ0FBcUM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixtQkFBbUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixPQUFPO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMscUJBQXFCO0FBQ2hFLDRDQUE0QyxxQkFBcUI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxZQUFZO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMscUJBQXFCO0FBQ2hFLDRDQUE0QyxxQkFBcUI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsT0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvZGFwYWkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqICDpm7vohLPpurvlsIY6IOS9leWIh+OCi+ino+etlOapnyB2MS4wLjBcclxuICpcclxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXHJcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgZmFkZU91dCwgc2NhbGUgfSA9IE1hamlhbmcuVUkuVXRpbDtcclxuY29uc3QgbWluaXBhaXB1ID0gTWFqaWFuZy5BSS5taW5pcGFpcHU7XHJcblxyXG5sZXQgcGFpLCBhdWRpbztcclxuXHJcbmZ1bmN0aW9uIGluaXQoZnJhZ21lbnQpIHtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgbGV0IFsgYmFzZWluZm8sIGhlaW5mbyBdID0gZnJhZ21lbnQuc3BsaXQoLyYvKTtcclxuXHJcbiAgICAgICAgbGV0IHh1biwgcGFyYW0gPSBiYXNlaW5mby5zcGxpdCgvXFwvLyk7XHJcbiAgICAgICAgaWYgKHBhcmFtLmxlbmd0aCAmJiBwYXJhbVtwYXJhbS5sZW5ndGgtMV1bMF0gPT0gJysnKSB4dW4gPSBwYXJhbS5wb3AoKTtcclxuICAgICAgICBsZXQgWyBwYWlzdHIsIHpodWFuZ2ZlbmcsIG1lbmZlbmcsIGJhb3BhaSwgaG9uZ3BhaSBdID0gcGFyYW07XHJcbiAgICAgICAgYmFvcGFpICA9IChiYW9wYWkgICB8fCAnJykuc3BsaXQoLywvKTtcclxuICAgICAgICBob25ncGFpID0gISBob25ncGFpO1xyXG5cclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKHBhaXN0cik7XHJcbiAgICAgICAgJCgnc2VsZWN0W25hbWU9XCJ6aHVhbmdmZW5nXCJdJykudmFsKCt6aHVhbmdmZW5nfHwwKTtcclxuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIm1lbmZlbmdcIl0nKS52YWwoK21lbmZlbmd8fDApO1xyXG4gICAgICAgICQoJ3NlbGVjdFtuYW1lPVwieHVuXCJdJykudmFsKCt4dW58fDcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFvcGFpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcShpKS52YWwoYmFvcGFpW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImhvbmdwYWlcIl0nKS5wcm9wKCdjaGVja2VkJywgaG9uZ3BhaSk7XHJcblxyXG4gICAgICAgIGlmIChoZWluZm8gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAkKCdmb3JtIGlucHV0W25hbWU9XCJoZWluZm9cIl0nKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICBsZXQgaGVzdHIgPSBoZWluZm8uc3BsaXQoL1xcLy8pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IDQ7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImhlc3RyXCJdJykuZXEobCkudmFsKGhlc3RyW2xdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3VibWl0KCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKCdtMTIzcDEyMzQ3ODlzMzM4czgnKS5mb2N1cygpO1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcSgwKS52YWwoJ3MzJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN1Ym1pdChldikge1xyXG5cclxuICAgIGhpZGUoJCgnLnNoYW4sIC5zaG91cGFpLCAuYW5hbHl6ZXInLCAkKCcjZGVtbycpKSk7XHJcblxyXG4gICAgbGV0IHBhaXN0ciA9ICQoJ2lucHV0W25hbWU9XCJwYWlzdHJcIl0nKS52YWwoKTtcclxuICAgIGlmICghIHBhaXN0cikgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGxldCB6aHVhbmdmZW5nID0gKyAkKCdzZWxlY3RbbmFtZT1cInpodWFuZ2ZlbmdcIl0nKS52YWwoKTtcclxuICAgIGxldCBtZW5mZW5nICAgID0gKyAkKCdzZWxlY3RbbmFtZT1cIm1lbmZlbmdcIl0nKS52YWwoKTtcclxuICAgIGxldCB4dW4gICAgICAgID0gKyAkKCdzZWxlY3RbbmFtZT1cInh1blwiXScpLnZhbCgpO1xyXG4gICAgbGV0IGJhb3BhaSAgICAgPSAkKCdpbnB1dFtuYW1lPVwiYmFvcGFpXCJdJykubWFwKChpLG4pPT4kKG4pLnZhbCgpKS50b0FycmF5KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihwID0+IE1hamlhbmcuU2hvdXBhaS52YWxpZF9wYWkocCkpO1xyXG4gICAgbGV0IGhvbmdwYWkgICAgPSAkKCdpbnB1dFtuYW1lPVwiaG9uZ3BhaVwiXScpLnByb3AoJ2NoZWNrZWQnKTtcclxuXHJcbiAgICBpZiAoISBiYW9wYWkubGVuZ3RoKSBiYW9wYWkgPSBbJ3oyJ107XHJcblxyXG4gICAgbGV0IGhlaW5mbyA9ICQoJ2lucHV0W25hbWU9XCJoZXN0clwiXScpLm1hcCgoaSxuKT0+JChuKS52YWwoKSkudG9BcnJheSgpO1xyXG5cclxuICAgIGlmICghIGhvbmdwYWkpIHtcclxuICAgICAgICBwYWlzdHIgPSBwYWlzdHIucmVwbGFjZSgvMC8sJzUnKTtcclxuICAgICAgICBiYW9wYWkgPSBiYW9wYWkubWFwKHAgPT4gcC5yZXBsYWNlKC8wLywnNScpKTtcclxuICAgICAgICBoZWluZm8gPSBoZWluZm8ubWFwKGhlc3RyID0+IGhlc3RyLnJlcGxhY2UoLzAvLCc1JykpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBiYXNlaW5mbyA9IHsgcGFpc3RyOiBwYWlzdHIsIHpodWFuZ2Zlbmc6IHpodWFuZ2ZlbmcsIG1lbmZlbmc6IG1lbmZlbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgIGJhb3BhaTogYmFvcGFpLCBob25ncGFpOiBob25ncGFpLCB4dW46IHh1biB9O1xyXG5cclxuICAgIGxldCBhbmFseXplcjtcclxuICAgIGxldCBrYWlqdSA9IHsgaWQ6IDAsIHJ1bGU6IE1hamlhbmcucnVsZSgpLCBxaWppYTogMCB9O1xyXG5cclxuICAgIGlmICgkKCdmb3JtIGlucHV0W25hbWU9XCJoZWluZm9cIl0nKS5wcm9wKCdjaGVja2VkJykpIHtcclxuXHJcbiAgICAgICAgYW5hbHl6ZXIgPSBuZXcgTWFqaWFuZy5VSS5BbmFseXplcigkKCcjYm9hcmQgPi5hbmFseXplcicpLCBrYWlqdSwgcGFpKTtcclxuXHJcbiAgICAgICAgaGVpbmZvID0gbWluaXBhaXB1KGFuYWx5emVyLCBiYXNlaW5mbywgaGVpbmZvLCB0cnVlKTtcclxuXHJcbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWksIGF1ZGlvLCBhbmFseXplci5tb2RlbCk7XHJcbiAgICAgICAgdmlldy5ub19wbGF5ZXJfbmFtZSA9IHRydWU7XHJcbiAgICAgICAgdmlldy5vcGVuX2hlICAgICAgICA9IHRydWU7XHJcbiAgICAgICAgdmlldy5yZWRyYXcoKTtcclxuXHJcbiAgICAgICAgbGV0IHppbW8gPSBhbmFseXplci5zaG91cGFpLl96aW1vXHJcbiAgICAgICAgaWYgKHppbW8pIHtcclxuICAgICAgICAgICAgaWYgKHppbW8ubGVuZ3RoID09IDIpXHJcbiAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX3ppbW8oeyBsOiBtZW5mZW5nLCBwOiB6aW1vIH0pO1xyXG4gICAgICAgICAgICBlbHNlICAgIGFuYWx5emVyLmFjdGlvbl9mdWxvdSh7IGw6IG1lbmZlbmcsIG06IHppbW8gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbCA9IGFuYWx5emVyLm1vZGVsLmx1bmJhbjtcclxuICAgICAgICAgICAgaWYgKGwgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwID0gYW5hbHl6ZXIubW9kZWwuaGVbbF0uX3BhaS5zbGljZSgtMSlbMF07XHJcbiAgICAgICAgICAgICAgICBhbmFseXplci5hY3Rpb25fZGFwYWkoeyBsOiBsLCBwOiBwIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX3FpcGFpKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQgYW5hbHl6ZXInKTtcclxuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgYW5hbHl6ZXIgPSBuZXcgTWFqaWFuZy5VSS5BbmFseXplcigkKCcjZGVtbyA+LmFuYWx5emVyJyksIGthaWp1LCBwYWkpO1xyXG5cclxuICAgICAgICBtaW5pcGFpcHUoYW5hbHl6ZXIsIGJhc2VpbmZvKTtcclxuXHJcbiAgICAgICAgbmV3IE1hamlhbmcuVUkuU2hhbigkKCcjZGVtbyAuc2hhbicpLCBwYWksIGFuYWx5emVyLnNoYW4pLnJlZHJhdygpO1xyXG4gICAgICAgIG5ldyBNYWppYW5nLlVJLlNob3VwYWkoJCgnI2RlbW8gLnNob3VwYWknKSwgcGFpLCBhbmFseXplci5zaG91cGFpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZHJhdyh0cnVlKTtcclxuXHJcbiAgICAgICAgbGV0IHppbW8gPSBhbmFseXplci5zaG91cGFpLl96aW1vXHJcbiAgICAgICAgaWYgKHppbW8pIHtcclxuICAgICAgICAgICAgaWYgKHppbW8ubGVuZ3RoID09IDIpXHJcbiAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX3ppbW8oeyBsOiBtZW5mZW5nLCBwOiB6aW1vIH0pO1xyXG4gICAgICAgICAgICBlbHNlICAgIGFuYWx5emVyLmFjdGlvbl9mdWxvdSh7IGw6IG1lbmZlbmcsIG06IHppbW8gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZhZGVJbigkKCcuc2hhbiwgLnNob3VwYWksIC5hbmFseXplcicsICQoJyNkZW1vJykpKTtcclxuXHJcbiAgICAgICAgaGVpbmZvID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwYWlzdHIgPSBhbmFseXplci5zaG91cGFpLnRvU3RyaW5nKCk7XHJcbiAgICAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKHBhaXN0cik7XHJcblxyXG4gICAgYmFvcGFpID0gYW5hbHl6ZXIuc2hhbi5iYW9wYWk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcShpKS52YWwoYmFvcGFpW2ldIHx8ICcnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGVpbmZvKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspICB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJoZXN0clwiXScpLmVxKGkpLnZhbChoZWluZm9baV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgZnJhZ21lbnQgPSAnIydcclxuICAgICAgICAgICAgICAgICArIFsgcGFpc3RyLCB6aHVhbmdmZW5nLCBtZW5mZW5nLCBiYW9wYWkuam9pbignLCcpXS5qb2luKCcvJyk7XHJcbiAgICBpZiAoISBob25ncGFpKSBmcmFnbWVudCArPSAnLzEnO1xyXG5cclxuICAgIGlmIChoZWluZm8pIGZyYWdtZW50ICs9ICcmJyArIGhlaW5mby5qb2luKCcvJyk7XHJcbiAgICBlbHNlICAgICAgICBmcmFnbWVudCArPSAnLysnICsgeHVuO1xyXG5cclxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgZnJhZ21lbnQpXHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRfY29udHJvbGxlcihyb290KSB7XHJcbiAgICByb290LmFkZENsYXNzKCdwYWlwdScpO1xyXG4gICAgJCh3aW5kb3cpLm9uKCdrZXl1cCcsIChldik9PntcclxuICAgICAgICBpZiAoZXYua2V5ID09ICdxJyB8fCBldi5rZXkgPT0gJ0VzY2FwZScpIHtcclxuICAgICAgICAgICAgaWYgKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycpICE9ICdkZW1vJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZGVtbycpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgaGlkZSgkKCc+IGltZycsIHJvb3QpKTtcclxuICAgIHNob3coJCgnPiBpbWcuZXhpdCcsIHJvb3QpLm9uKCdjbGljaycsICgpPT4kKCdib2R5JykuYXR0cignY2xhc3MnLCdkZW1vJykpKTtcclxufVxyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cclxuICAgIHBhaSA9IE1hamlhbmcuVUkucGFpKCcjbG9hZGRhdGEnKTtcclxuICAgIGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygnI2xvYWRkYXRhJyk7XHJcblxyXG4gICAgJCgnZm9ybSBpbnB1dFtuYW1lPVwiaGVpbmZvXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgIHNob3coJCgnZm9ybSAuaGVpbmZvJykpO1xyXG4gICAgICAgICAgICBoaWRlKCQoJ2Zvcm0gLnh1bicpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZGUoJCgnZm9ybSAuaGVpbmZvJykpO1xyXG4gICAgICAgICAgICBzaG93KCQoJ2Zvcm0gLnh1bicpKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGhpZGUoJCgnZm9ybSAuaGVpbmZvJykpO1xyXG5cclxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0Jywgc3VibWl0KTtcclxuXHJcbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgZnVuY3Rpb24oKXtcclxuICAgICAgICBoaWRlKCQoJy5zaGFuLCAuc2hvdXBhaSwgLmFuYWx5emVyJywgJCgnI2RlbW8nKSkpO1xyXG4gICAgICAgIGhpZGUoJCgnZm9ybSAuaGVpbmZvJykpO1xyXG4gICAgICAgICQoJ2Zvcm0gaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpPT5zY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpKTtcclxuXHJcbiAgICBzZXRfY29udHJvbGxlcigkKCcjYm9hcmQgLmNvbnRyb2xsZXInKSk7XHJcblxyXG4gICAgbGV0IGZyYWdtZW50ID0gbG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpO1xyXG4gICAgaW5pdChmcmFnbWVudCk7XHJcbn0pO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
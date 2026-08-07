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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFwYWktMS4yLjE5LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTs7QUFFYixRQUFRLHFDQUFxQztBQUM3Qzs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLG1CQUFtQjtBQUMzQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsT0FBTztBQUNuQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxrQkFBa0I7O0FBRWxCOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLHFCQUFxQjtBQUNoRSw0Q0FBNEMscUJBQXFCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsWUFBWTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLHFCQUFxQjtBQUNoRSw0Q0FBNEMscUJBQXFCO0FBQ2pFO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTs7QUFFQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9kYXBhaS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqICDpm7vohLPpurvlsIY6IOS9leWIh+OCi+ino+etlOapnyB2MS4wLjBcbiAqXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqICBodHRwczovL2dpdGh1Yi5jb20va29iYWxhYi9NYWppYW5nL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBmYWRlT3V0LCBzY2FsZSB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuY29uc3QgbWluaXBhaXB1ID0gTWFqaWFuZy5BSS5taW5pcGFpcHU7XG5cbmxldCBwYWksIGF1ZGlvO1xuXG5mdW5jdGlvbiBpbml0KGZyYWdtZW50KSB7XG5cbiAgICBpZiAoZnJhZ21lbnQpIHtcblxuICAgICAgICBsZXQgWyBiYXNlaW5mbywgaGVpbmZvIF0gPSBmcmFnbWVudC5zcGxpdCgvJi8pO1xuXG4gICAgICAgIGxldCB4dW4sIHBhcmFtID0gYmFzZWluZm8uc3BsaXQoL1xcLy8pO1xuICAgICAgICBpZiAocGFyYW0ubGVuZ3RoICYmIHBhcmFtW3BhcmFtLmxlbmd0aC0xXVswXSA9PSAnKycpIHh1biA9IHBhcmFtLnBvcCgpO1xuICAgICAgICBsZXQgWyBwYWlzdHIsIHpodWFuZ2ZlbmcsIG1lbmZlbmcsIGJhb3BhaSwgaG9uZ3BhaSBdID0gcGFyYW07XG4gICAgICAgIGJhb3BhaSAgPSAoYmFvcGFpICAgfHwgJycpLnNwbGl0KC8sLyk7XG4gICAgICAgIGhvbmdwYWkgPSAhIGhvbmdwYWk7XG5cbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbChwYWlzdHIpO1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInpodWFuZ2ZlbmdcIl0nKS52YWwoK3podWFuZ2Zlbmd8fDApO1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cIm1lbmZlbmdcIl0nKS52YWwoK21lbmZlbmd8fDApO1xuICAgICAgICAkKCdzZWxlY3RbbmFtZT1cInh1blwiXScpLnZhbCgreHVufHw3KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYW9wYWkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJiYW9wYWlcIl0nKS5lcShpKS52YWwoYmFvcGFpW2ldKTtcbiAgICAgICAgfVxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiaG9uZ3BhaVwiXScpLnByb3AoJ2NoZWNrZWQnLCBob25ncGFpKTtcblxuICAgICAgICBpZiAoaGVpbmZvICE9IG51bGwpIHtcbiAgICAgICAgICAgICQoJ2Zvcm0gaW5wdXRbbmFtZT1cImhlaW5mb1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgICAgICAgbGV0IGhlc3RyID0gaGVpbmZvLnNwbGl0KC9cXC8vKTtcbiAgICAgICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgNDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImhlc3RyXCJdJykuZXEobCkudmFsKGhlc3RyW2xdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN1Ym1pdCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbCgnbTEyM3AxMjM0Nzg5czMzOHM4JykuZm9jdXMoKTtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLmVxKDApLnZhbCgnczMnKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN1Ym1pdChldikge1xuXG4gICAgaGlkZSgkKCcuc2hhbiwgLnNob3VwYWksIC5hbmFseXplcicsICQoJyNkZW1vJykpKTtcblxuICAgIGxldCBwYWlzdHIgPSAkKCdpbnB1dFtuYW1lPVwicGFpc3RyXCJdJykudmFsKCk7XG4gICAgaWYgKCEgcGFpc3RyKSByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgemh1YW5nZmVuZyA9ICsgJCgnc2VsZWN0W25hbWU9XCJ6aHVhbmdmZW5nXCJdJykudmFsKCk7XG4gICAgbGV0IG1lbmZlbmcgICAgPSArICQoJ3NlbGVjdFtuYW1lPVwibWVuZmVuZ1wiXScpLnZhbCgpO1xuICAgIGxldCB4dW4gICAgICAgID0gKyAkKCdzZWxlY3RbbmFtZT1cInh1blwiXScpLnZhbCgpO1xuICAgIGxldCBiYW9wYWkgICAgID0gJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLm1hcCgoaSxuKT0+JChuKS52YWwoKSkudG9BcnJheSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4gTWFqaWFuZy5TaG91cGFpLnZhbGlkX3BhaShwKSk7XG4gICAgbGV0IGhvbmdwYWkgICAgPSAkKCdpbnB1dFtuYW1lPVwiaG9uZ3BhaVwiXScpLnByb3AoJ2NoZWNrZWQnKTtcblxuICAgIGlmICghIGJhb3BhaS5sZW5ndGgpIGJhb3BhaSA9IFsnejInXTtcblxuICAgIGxldCBoZWluZm8gPSAkKCdpbnB1dFtuYW1lPVwiaGVzdHJcIl0nKS5tYXAoKGksbik9PiQobikudmFsKCkpLnRvQXJyYXkoKTtcblxuICAgIGlmICghIGhvbmdwYWkpIHtcbiAgICAgICAgcGFpc3RyID0gcGFpc3RyLnJlcGxhY2UoLzAvLCc1Jyk7XG4gICAgICAgIGJhb3BhaSA9IGJhb3BhaS5tYXAocCA9PiBwLnJlcGxhY2UoLzAvLCc1JykpO1xuICAgICAgICBoZWluZm8gPSBoZWluZm8ubWFwKGhlc3RyID0+IGhlc3RyLnJlcGxhY2UoLzAvLCc1JykpO1xuICAgIH1cblxuICAgIGxldCBiYXNlaW5mbyA9IHsgcGFpc3RyOiBwYWlzdHIsIHpodWFuZ2Zlbmc6IHpodWFuZ2ZlbmcsIG1lbmZlbmc6IG1lbmZlbmcsXG4gICAgICAgICAgICAgICAgICAgICBiYW9wYWk6IGJhb3BhaSwgaG9uZ3BhaTogaG9uZ3BhaSwgeHVuOiB4dW4gfTtcblxuICAgIGxldCBhbmFseXplcjtcbiAgICBsZXQga2FpanUgPSB7IGlkOiAwLCBydWxlOiBNYWppYW5nLnJ1bGUoKSwgcWlqaWE6IDAgfTtcblxuICAgIGlmICgkKCdmb3JtIGlucHV0W25hbWU9XCJoZWluZm9cIl0nKS5wcm9wKCdjaGVja2VkJykpIHtcblxuICAgICAgICBhbmFseXplciA9IG5ldyBNYWppYW5nLlVJLkFuYWx5emVyKCQoJyNib2FyZCA+LmFuYWx5emVyJyksIGthaWp1LCBwYWkpO1xuXG4gICAgICAgIGhlaW5mbyA9IG1pbmlwYWlwdShhbmFseXplciwgYmFzZWluZm8sIGhlaW5mbywgdHJ1ZSk7XG5cbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFpLCBhdWRpbywgYW5hbHl6ZXIubW9kZWwpO1xuICAgICAgICB2aWV3Lm5vX3BsYXllcl9uYW1lID0gdHJ1ZTtcbiAgICAgICAgdmlldy5vcGVuX2hlICAgICAgICA9IHRydWU7XG4gICAgICAgIHZpZXcucmVkcmF3KCk7XG5cbiAgICAgICAgbGV0IHppbW8gPSBhbmFseXplci5zaG91cGFpLl96aW1vXG4gICAgICAgIGlmICh6aW1vKSB7XG4gICAgICAgICAgICBpZiAoemltby5sZW5ndGggPT0gMilcbiAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX3ppbW8oeyBsOiBtZW5mZW5nLCBwOiB6aW1vIH0pO1xuICAgICAgICAgICAgZWxzZSAgICBhbmFseXplci5hY3Rpb25fZnVsb3UoeyBsOiBtZW5mZW5nLCBtOiB6aW1vIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGwgPSBhbmFseXplci5tb2RlbC5sdW5iYW47XG4gICAgICAgICAgICBpZiAobCAhPSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCBwID0gYW5hbHl6ZXIubW9kZWwuaGVbbF0uX3BhaS5zbGljZSgtMSlbMF07XG4gICAgICAgICAgICAgICAgYW5hbHl6ZXIuYWN0aW9uX2RhcGFpKHsgbDogbCwgcDogcCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuYWx5emVyLmFjdGlvbl9xaXBhaSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkIGFuYWx5emVyJyk7XG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhbmFseXplciA9IG5ldyBNYWppYW5nLlVJLkFuYWx5emVyKCQoJyNkZW1vID4uYW5hbHl6ZXInKSwga2FpanUsIHBhaSk7XG5cbiAgICAgICAgbWluaXBhaXB1KGFuYWx5emVyLCBiYXNlaW5mbyk7XG5cbiAgICAgICAgbmV3IE1hamlhbmcuVUkuU2hhbigkKCcjZGVtbyAuc2hhbicpLCBwYWksIGFuYWx5emVyLnNoYW4pLnJlZHJhdygpO1xuICAgICAgICBuZXcgTWFqaWFuZy5VSS5TaG91cGFpKCQoJyNkZW1vIC5zaG91cGFpJyksIHBhaSwgYW5hbHl6ZXIuc2hvdXBhaSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVkcmF3KHRydWUpO1xuXG4gICAgICAgIGxldCB6aW1vID0gYW5hbHl6ZXIuc2hvdXBhaS5femltb1xuICAgICAgICBpZiAoemltbykge1xuICAgICAgICAgICAgaWYgKHppbW8ubGVuZ3RoID09IDIpXG4gICAgICAgICAgICAgICAgICAgIGFuYWx5emVyLmFjdGlvbl96aW1vKHsgbDogbWVuZmVuZywgcDogemltbyB9KTtcbiAgICAgICAgICAgIGVsc2UgICAgYW5hbHl6ZXIuYWN0aW9uX2Z1bG91KHsgbDogbWVuZmVuZywgbTogemltbyB9KTtcbiAgICAgICAgfVxuICAgICAgICBmYWRlSW4oJCgnLnNoYW4sIC5zaG91cGFpLCAuYW5hbHl6ZXInLCAkKCcjZGVtbycpKSk7XG5cbiAgICAgICAgaGVpbmZvID0gbnVsbDtcbiAgICB9XG5cbiAgICBwYWlzdHIgPSBhbmFseXplci5zaG91cGFpLnRvU3RyaW5nKCk7XG4gICAgJCgnaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLnZhbChwYWlzdHIpO1xuXG4gICAgYmFvcGFpID0gYW5hbHl6ZXIuc2hhbi5iYW9wYWk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImJhb3BhaVwiXScpLmVxKGkpLnZhbChiYW9wYWlbaV0gfHwgJycpO1xuICAgIH1cblxuICAgIGlmIChoZWluZm8pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspICB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiaGVzdHJcIl0nKS5lcShpKS52YWwoaGVpbmZvW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBmcmFnbWVudCA9ICcjJ1xuICAgICAgICAgICAgICAgICArIFsgcGFpc3RyLCB6aHVhbmdmZW5nLCBtZW5mZW5nLCBiYW9wYWkuam9pbignLCcpXS5qb2luKCcvJyk7XG4gICAgaWYgKCEgaG9uZ3BhaSkgZnJhZ21lbnQgKz0gJy8xJztcblxuICAgIGlmIChoZWluZm8pIGZyYWdtZW50ICs9ICcmJyArIGhlaW5mby5qb2luKCcvJyk7XG4gICAgZWxzZSAgICAgICAgZnJhZ21lbnQgKz0gJy8rJyArIHh1bjtcblxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgZnJhZ21lbnQpXG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNldF9jb250cm9sbGVyKHJvb3QpIHtcbiAgICByb290LmFkZENsYXNzKCdwYWlwdScpO1xuICAgICQod2luZG93KS5vbigna2V5dXAnLCAoZXYpPT57XG4gICAgICAgIGlmIChldi5rZXkgPT0gJ3EnIHx8IGV2LmtleSA9PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgaWYgKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycpICE9ICdkZW1vJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2RlbW8nKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGhpZGUoJCgnPiBpbWcnLCByb290KSk7XG4gICAgc2hvdygkKCc+IGltZy5leGl0Jywgcm9vdCkub24oJ2NsaWNrJywgKCk9PiQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2RlbW8nKSkpO1xufVxuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICBwYWkgPSBNYWppYW5nLlVJLnBhaSgnI2xvYWRkYXRhJyk7XG4gICAgYXVkaW8gPSBNYWppYW5nLlVJLmF1ZGlvKCcjbG9hZGRhdGEnKTtcblxuICAgICQoJ2Zvcm0gaW5wdXRbbmFtZT1cImhlaW5mb1wiXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgIHNob3coJCgnZm9ybSAuaGVpbmZvJykpO1xuICAgICAgICAgICAgaGlkZSgkKCdmb3JtIC54dW4nKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoaWRlKCQoJ2Zvcm0gLmhlaW5mbycpKTtcbiAgICAgICAgICAgIHNob3coJCgnZm9ybSAueHVuJykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaGlkZSgkKCdmb3JtIC5oZWluZm8nKSk7XG5cbiAgICAkKCdmb3JtJykub24oJ3N1Ym1pdCcsIHN1Ym1pdCk7XG5cbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgaGlkZSgkKCcuc2hhbiwgLnNob3VwYWksIC5hbmFseXplcicsICQoJyNkZW1vJykpKTtcbiAgICAgICAgaGlkZSgkKCdmb3JtIC5oZWluZm8nKSk7XG4gICAgICAgICQoJ2Zvcm0gaW5wdXRbbmFtZT1cInBhaXN0clwiXScpLmZvY3VzKCk7XG4gICAgfSk7XG5cbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpPT5zY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpKTtcblxuICAgIHNldF9jb250cm9sbGVyKCQoJyNib2FyZCAuY29udHJvbGxlcicpKTtcblxuICAgIGxldCBmcmFnbWVudCA9IGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKTtcbiAgICBpbml0KGZyYWdtZW50KTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
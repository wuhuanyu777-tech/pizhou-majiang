/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/js/paipu.js ***!
  \*************************/
/*!
 *  電脳麻将: 牌譜ビューア v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { hide, show, fadeIn, scale   } = Majiang.UI.Util;

$(function(){

    const tenhou_log = 'https://kobalab.net/majiang/tenhou-log/';

    const pai   = Majiang.UI.pai($('#loaddata'));
    const audio = Majiang.UI.audio($('#loaddata'));

    const rule  = Majiang.rule(
                    JSON.parse(localStorage.getItem('Majiang.rule')||'{}'));

    let file;
    let _viewer;

    const analyzer = (kaiju)=>{
        $('body').addClass('analyzer');
        return new Majiang.UI.Analyzer($('#board > .analyzer'), kaiju, pai,
                                        ()=>$('body').removeClass('analyzer'));
    };
    const viewer = (paipu)=>{
        $('#board .controller').addClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        _viewer = new Majiang.UI.Paipu(
                        $('#board'), paipu, pai, audio, 'Majiang.pref',
                        ()=>{ fadeIn($('body').attr('class','file'));
                              _viewer = null },
                        analyzer);
        return _viewer;
    };
    const stat = (paipu_list)=>{
        fadeIn($('body').attr('class','stat'));
        return new Majiang.UI.PaipuStat($('#stat'), paipu_list,
                        ()=>fadeIn($('body').attr('class','file')));
    };
    const preview = (paipu)=>{
        $('#board .controller').addClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        _viewer = new Majiang.UI.Paipu(
                        $('#board'), paipu, pai, audio, 'Majiang.pref',
                        ()=>{ fadeIn($('body').attr('class','editor'));
                              _viewer = null },
                        analyzer);
        delete _viewer._view.dummy_name;
        return _viewer;
    };
    const editor = (paipu, save)=>{
        new Majiang.UI.PaipuEditor($('#editor'), paipu, rule, pai,
                        ()=>{ file.storage(true);
                              fadeIn($('body').attr('class','file')) },
                        save, preview);
        fadeIn($('body').attr('class','editor'));
    };

    if (location.search) {
        file = new Majiang.UI.PaipuFile(
                                $('#file'), 'Majiang.paipu',
                                viewer, stat, editor,
                                tenhou_log,
                                location.search.replace(/^\?/,''),
                                location.hash.replace(/^#/,''));
    }
    else {
        file = new Majiang.UI.PaipuFile(
                                $('#file'), 'Majiang.paipu',
                                viewer, stat, editor,
                                tenhou_log);
    }
    file.redraw();

    $(window).on('resize', ()=>scale($('#board'), $('#space')));
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpcHUtMS4yLjguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNhOztBQUViLFFBQVEsOEJBQThCOztBQUV0Qzs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0VBQXdFOztBQUV4RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUIsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUIsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QixzRUFBc0U7QUFDdEU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9wYWlwdS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqICDpm7vohLPpurvlsIY6IOeJjOitnOODk+ODpeODvOOCoiB2MS4wLjBcbiAqXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqICBodHRwczovL2dpdGh1Yi5jb20va29iYWxhYi9NYWppYW5nL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSAgIH0gPSBNYWppYW5nLlVJLlV0aWw7XG5cbiQoZnVuY3Rpb24oKXtcblxuICAgIGNvbnN0IHRlbmhvdV9sb2cgPSAnaHR0cHM6Ly9rb2JhbGFiLm5ldC9tYWppYW5nL3RlbmhvdS1sb2cvJztcblxuICAgIGNvbnN0IHBhaSAgID0gTWFqaWFuZy5VSS5wYWkoJCgnI2xvYWRkYXRhJykpO1xuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XG5cbiAgICBjb25zdCBydWxlICA9IE1hamlhbmcucnVsZShcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJyl8fCd7fScpKTtcblxuICAgIGxldCBmaWxlO1xuICAgIGxldCBfdmlld2VyO1xuXG4gICAgY29uc3QgYW5hbHl6ZXIgPSAoa2FpanUpPT57XG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYW5hbHl6ZXInKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLkFuYWx5emVyKCQoJyNib2FyZCA+IC5hbmFseXplcicpLCBrYWlqdSwgcGFpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpPT4kKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2FuYWx5emVyJykpO1xuICAgIH07XG4gICAgY29uc3Qgdmlld2VyID0gKHBhaXB1KT0+e1xuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5hZGRDbGFzcygncGFpcHUnKVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuICAgICAgICBfdmlld2VyID0gbmV3IE1hamlhbmcuVUkuUGFpcHUoXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk9PnsgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdmlld2VyID0gbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIpO1xuICAgICAgICByZXR1cm4gX3ZpZXdlcjtcbiAgICB9O1xuICAgIGNvbnN0IHN0YXQgPSAocGFpcHVfbGlzdCk9PntcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ3N0YXQnKSk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5QYWlwdVN0YXQoJCgnI3N0YXQnKSwgcGFpcHVfbGlzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSk7XG4gICAgfTtcbiAgICBjb25zdCBwcmV2aWV3ID0gKHBhaXB1KT0+e1xuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5hZGRDbGFzcygncGFpcHUnKVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuICAgICAgICBfdmlld2VyID0gbmV3IE1hamlhbmcuVUkuUGFpcHUoXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk9PnsgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2VkaXRvcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF92aWV3ZXIgPSBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmFseXplcik7XG4gICAgICAgIGRlbGV0ZSBfdmlld2VyLl92aWV3LmR1bW15X25hbWU7XG4gICAgICAgIHJldHVybiBfdmlld2VyO1xuICAgIH07XG4gICAgY29uc3QgZWRpdG9yID0gKHBhaXB1LCBzYXZlKT0+e1xuICAgICAgICBuZXcgTWFqaWFuZy5VSS5QYWlwdUVkaXRvcigkKCcjZWRpdG9yJyksIHBhaXB1LCBydWxlLCBwYWksXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+eyBmaWxlLnN0b3JhZ2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZSwgcHJldmlldyk7XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdlZGl0b3InKSk7XG4gICAgfTtcblxuICAgIGlmIChsb2NhdGlvbi5zZWFyY2gpIHtcbiAgICAgICAgZmlsZSA9IG5ldyBNYWppYW5nLlVJLlBhaXB1RmlsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2ZpbGUnKSwgJ01hamlhbmcucGFpcHUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ZXIsIHN0YXQsIGVkaXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuaG91X2xvZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoL15cXD8vLCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eIy8sJycpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNmaWxlJyksICdNYWppYW5nLnBhaXB1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0LCBlZGl0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmhvdV9sb2cpO1xuICAgIH1cbiAgICBmaWxlLnJlZHJhdygpO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKT0+c2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKSk7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
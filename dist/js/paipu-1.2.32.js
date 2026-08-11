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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpcHUtMS4yLjMyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTtBQUNiO0FBQ0EsUUFBUSw4QkFBOEI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5Qiw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5Qiw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCLHNFQUFzRTtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvcGFpcHUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqICDpm7vohLPpurvlsIY6IOeJjOitnOODk+ODpeODvOOCoiB2MS4wLjBcclxuICpcclxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXHJcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgc2NhbGUgICB9ID0gTWFqaWFuZy5VSS5VdGlsO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cclxuICAgIGNvbnN0IHRlbmhvdV9sb2cgPSAnaHR0cHM6Ly9rb2JhbGFiLm5ldC9tYWppYW5nL3RlbmhvdS1sb2cvJztcclxuXHJcbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcclxuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XHJcblxyXG4gICAgY29uc3QgcnVsZSAgPSBNYWppYW5nLnJ1bGUoXHJcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJyl8fCd7fScpKTtcclxuXHJcbiAgICBsZXQgZmlsZTtcclxuICAgIGxldCBfdmlld2VyO1xyXG5cclxuICAgIGNvbnN0IGFuYWx5emVyID0gKGthaWp1KT0+e1xyXG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYW5hbHl6ZXInKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuQW5hbHl6ZXIoJCgnI2JvYXJkID4gLmFuYWx5emVyJyksIGthaWp1LCBwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKT0+JCgnYm9keScpLnJlbW92ZUNsYXNzKCdhbmFseXplcicpKTtcclxuICAgIH07XHJcbiAgICBjb25zdCB2aWV3ZXIgPSAocGFpcHUpPT57XHJcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcclxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xyXG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XHJcbiAgICAgICAgX3ZpZXdlciA9IG5ldyBNYWppYW5nLlVJLlBhaXB1KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+eyBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3ZpZXdlciA9IG51bGwgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIpO1xyXG4gICAgICAgIHJldHVybiBfdmlld2VyO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHN0YXQgPSAocGFpcHVfbGlzdCk9PntcclxuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnc3RhdCcpKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuUGFpcHVTdGF0KCQoJyNzdGF0JyksIHBhaXB1X2xpc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgcHJldmlldyA9IChwYWlwdSk9PntcclxuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5hZGRDbGFzcygncGFpcHUnKVxyXG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkJyk7XHJcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcclxuICAgICAgICBfdmlld2VyID0gbmV3IE1hamlhbmcuVUkuUGFpcHUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNib2FyZCcpLCBwYWlwdSwgcGFpLCBhdWRpbywgJ01hamlhbmcucHJlZicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT57IGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdlZGl0b3InKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF92aWV3ZXIgPSBudWxsIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcclxuICAgICAgICBkZWxldGUgX3ZpZXdlci5fdmlldy5kdW1teV9uYW1lO1xyXG4gICAgICAgIHJldHVybiBfdmlld2VyO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGVkaXRvciA9IChwYWlwdSwgc2F2ZSk9PntcclxuICAgICAgICBuZXcgTWFqaWFuZy5VSS5QYWlwdUVkaXRvcigkKCcjZWRpdG9yJyksIHBhaXB1LCBydWxlLCBwYWksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT57IGZpbGUuc3RvcmFnZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZSwgcHJldmlldyk7XHJcbiAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2VkaXRvcicpKTtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGxvY2F0aW9uLnNlYXJjaCkge1xyXG4gICAgICAgIGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2ZpbGUnKSwgJ01hamlhbmcucGFpcHUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdlciwgc3RhdCwgZWRpdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmhvdV9sb2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoL15cXD8vLCcnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoL14jLywnJykpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZmlsZSA9IG5ldyBNYWppYW5nLlVJLlBhaXB1RmlsZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZmlsZScpLCAnTWFqaWFuZy5wYWlwdScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0LCBlZGl0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuaG91X2xvZyk7XHJcbiAgICB9XHJcbiAgICBmaWxlLnJlZHJhdygpO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpcHUtMS4yLjI1LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTs7QUFFYixRQUFRLDhCQUE4Qjs7QUFFdEM7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHdFQUF3RTs7QUFFeEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUIsc0VBQXNFO0FBQ3RFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvcGFpcHUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDniYzorZzjg5Pjg6Xjg7zjgqIgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgc2NhbGUgICB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICBjb25zdCB0ZW5ob3VfbG9nID0gJ2h0dHBzOi8va29iYWxhYi5uZXQvbWFqaWFuZy90ZW5ob3UtbG9nLyc7XG5cbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcbiAgICBjb25zdCBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJCgnI2xvYWRkYXRhJykpO1xuXG4gICAgY29uc3QgcnVsZSAgPSBNYWppYW5nLnJ1bGUoXG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ01hamlhbmcucnVsZScpfHwne30nKSk7XG5cbiAgICBsZXQgZmlsZTtcbiAgICBsZXQgX3ZpZXdlcjtcblxuICAgIGNvbnN0IGFuYWx5emVyID0gKGthaWp1KT0+e1xuICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2FuYWx5emVyJyk7XG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5BbmFseXplcigkKCcjYm9hcmQgPiAuYW5hbHl6ZXInKSwga2FpanUsIHBhaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKT0+JCgnYm9keScpLnJlbW92ZUNsYXNzKCdhbmFseXplcicpKTtcbiAgICB9O1xuICAgIGNvbnN0IHZpZXdlciA9IChwYWlwdSk9PntcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICAgICAgX3ZpZXdlciA9IG5ldyBNYWppYW5nLlVJLlBhaXB1KFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2JvYXJkJyksIHBhaXB1LCBwYWksIGF1ZGlvLCAnTWFqaWFuZy5wcmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT57IGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3ZpZXdlciA9IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcbiAgICAgICAgcmV0dXJuIF92aWV3ZXI7XG4gICAgfTtcbiAgICBjb25zdCBzdGF0ID0gKHBhaXB1X2xpc3QpPT57XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdzdGF0JykpO1xuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuUGFpcHVTdGF0KCQoJyNzdGF0JyksIHBhaXB1X2xpc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkpO1xuICAgIH07XG4gICAgY29uc3QgcHJldmlldyA9IChwYWlwdSk9PntcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykuYWRkQ2xhc3MoJ3BhaXB1JylcbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcbiAgICAgICAgX3ZpZXdlciA9IG5ldyBNYWppYW5nLlVJLlBhaXB1KFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2JvYXJkJyksIHBhaXB1LCBwYWksIGF1ZGlvLCAnTWFqaWFuZy5wcmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT57IGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdlZGl0b3InKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdmlld2VyID0gbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZXIpO1xuICAgICAgICBkZWxldGUgX3ZpZXdlci5fdmlldy5kdW1teV9uYW1lO1xuICAgICAgICByZXR1cm4gX3ZpZXdlcjtcbiAgICB9O1xuICAgIGNvbnN0IGVkaXRvciA9IChwYWlwdSwgc2F2ZSk9PntcbiAgICAgICAgbmV3IE1hamlhbmcuVUkuUGFpcHVFZGl0b3IoJCgnI2VkaXRvcicpLCBwYWlwdSwgcnVsZSwgcGFpLFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk9PnsgZmlsZS5zdG9yYWdlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmUsIHByZXZpZXcpO1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZWRpdG9yJykpO1xuICAgIH07XG5cbiAgICBpZiAobG9jYXRpb24uc2VhcmNoKSB7XG4gICAgICAgIGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNmaWxlJyksICdNYWppYW5nLnBhaXB1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLCBzdGF0LCBlZGl0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmhvdV9sb2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCcnKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWxlID0gbmV3IE1hamlhbmcuVUkuUGFpcHVGaWxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZmlsZScpLCAnTWFqaWFuZy5wYWlwdScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdlciwgc3RhdCwgZWRpdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5ob3VfbG9nKTtcbiAgICB9XG4gICAgZmlsZS5yZWRyYXcoKTtcblxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
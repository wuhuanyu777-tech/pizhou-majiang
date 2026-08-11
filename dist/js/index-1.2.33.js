/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/*!
 *  電脳麻将 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const { hide, show, fadeIn, scale,
        setSelector, clearSelector  } = Majiang.UI.Util;

let loaded;

$(function(){

    let game;
    const pai   = Majiang.UI.pai($('#loaddata'));
    const audio = Majiang.UI.audio($('#loaddata'));

    const analyzer = (kaiju)=>{
        $('body').addClass('analyzer');
        return new Majiang.UI.Analyzer($('#board > .analyzer'), kaiju, pai,
                                        ()=>$('body').removeClass('analyzer'));
    };
    const viewer = (paipu)=>{
        $('#board .controller').addClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        const _viewer
                = new Majiang.UI.Paipu(
                        $('#board'), paipu, pai, audio, 'Majiang.pref',
                        ()=>fadeIn($('body').attr('class','file')),
                        analyzer);
        delete _viewer._view.dummy_name;
        return _viewer;
    };
    const stat = (paipu_list)=>{
        fadeIn($('body').attr('class','stat'));
        return new Majiang.UI.PaipuStat($('#stat'), paipu_list,
                        ()=>fadeIn($('body').attr('class','file')));
    };
    const file = new Majiang.UI.PaipuFile($('#file'), 'Majiang.game',
                                            viewer, stat);
    const rule = Majiang.rule(
                    JSON.parse(localStorage.getItem('Majiang.rule')||'{}'));

    // 主页"打几圈"选择：应用保存的圈数，并监听变更
    const rounds = localStorage.getItem('Majiang.rounds');
    if (rounds) rule['場数'] = +rounds;
    $('#title .rounds-option select').val(rounds || '2')
        .on('change', function(){
            localStorage.setItem('Majiang.rounds', this.value);
        });

    function start() {
        let players = [ new Majiang.UI.Player($('#board'), pai, audio) ];
        for (let i = 1; i < 4; i++) {
            players[i] = new Majiang.AI();
        }
        game = new Majiang.Game(players, end, rule);
        game.view = new Majiang.UI.Board($('#board .board'),
                                        pai, audio, game.model);

        $('#board .controller').removeClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));

        new Majiang.UI.GameCtl($('#board'), 'Majiang.pref', game, game._view);
        game.kaiju();
    }

    function end(paipu) {
        if (paipu) file.add(paipu, 10);
        fadeIn($('body').attr('class','file'));
        file.redraw();
    }

    $('#file .start').on('click', start);

    $(window).on('resize', ()=>scale($('#board'), $('#space')));

    setTimeout(()=>{
        $(window).on('load', function(){
            // 打开主页总是显示标题页（含圈数选择），不再因历史牌谱直接跳转
            hide($('#title .loading'));
            $('#title .start')
                .attr('tabindex', 0).attr('role','button')
                .on('click', ()=>{
                    clearSelector('title');
                    start();
                });
            show(setSelector($('#title .start'), 'title',
                            { focus: null, touch: false }));
        });
        if (loaded) $(window).trigger('load');
    }, 1000);
});

$(window).on('load', ()=> loaded = true);

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtMS4yLjMzLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTtBQUNiO0FBQ0EsUUFBUTtBQUNSLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsT0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSw4QkFBOEIsMkJBQTJCO0FBQ3pELFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxyXG4gKiAg6Zu76ISz6bq75bCGIHYxLjAuMFxyXG4gKlxyXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcclxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSxcclxuICAgICAgICBzZXRTZWxlY3RvciwgY2xlYXJTZWxlY3RvciAgfSA9IE1hamlhbmcuVUkuVXRpbDtcclxuXHJcbmxldCBsb2FkZWQ7XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgbGV0IGdhbWU7XHJcbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcclxuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XHJcblxyXG4gICAgY29uc3QgYW5hbHl6ZXIgPSAoa2FpanUpPT57XHJcbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdhbmFseXplcicpO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWFqaWFuZy5VSS5BbmFseXplcigkKCcjYm9hcmQgPiAuYW5hbHl6ZXInKSwga2FpanUsIHBhaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpPT4kKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2FuYWx5emVyJykpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHZpZXdlciA9IChwYWlwdSk9PntcclxuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5hZGRDbGFzcygncGFpcHUnKVxyXG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkJyk7XHJcbiAgICAgICAgc2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKTtcclxuICAgICAgICBjb25zdCBfdmlld2VyXHJcbiAgICAgICAgICAgICAgICA9IG5ldyBNYWppYW5nLlVJLlBhaXB1KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjYm9hcmQnKSwgcGFpcHUsIHBhaSwgYXVkaW8sICdNYWppYW5nLnByZWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVyKTtcclxuICAgICAgICBkZWxldGUgX3ZpZXdlci5fdmlldy5kdW1teV9uYW1lO1xyXG4gICAgICAgIHJldHVybiBfdmlld2VyO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHN0YXQgPSAocGFpcHVfbGlzdCk9PntcclxuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnc3RhdCcpKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hamlhbmcuVUkuUGFpcHVTdGF0KCQoJyNzdGF0JyksIHBhaXB1X2xpc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpPT5mYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnZmlsZScpKSk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZmlsZSA9IG5ldyBNYWppYW5nLlVJLlBhaXB1RmlsZSgkKCcjZmlsZScpLCAnTWFqaWFuZy5nYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ZXIsIHN0YXQpO1xyXG4gICAgY29uc3QgcnVsZSA9IE1hamlhbmcucnVsZShcclxuICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JykpO1xyXG5cclxuICAgIC8vIOS4u+mhtVwi5omT5Yeg5ZyIXCLpgInmi6nvvJrlupTnlKjkv53lrZjnmoTlnIjmlbDvvIzlubbnm5HlkKzlj5jmm7RcclxuICAgIGNvbnN0IHJvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJvdW5kcycpO1xyXG4gICAgaWYgKHJvdW5kcykgcnVsZVsn5aC05pWwJ10gPSArcm91bmRzO1xyXG4gICAgJCgnI3RpdGxlIC5yb3VuZHMtb3B0aW9uIHNlbGVjdCcpLnZhbChyb3VuZHMgfHwgJzInKVxyXG4gICAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ01hamlhbmcucm91bmRzJywgdGhpcy52YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgICAgICAgbGV0IHBsYXllcnMgPSBbIG5ldyBNYWppYW5nLlVJLlBsYXllcigkKCcjYm9hcmQnKSwgcGFpLCBhdWRpbykgXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICBwbGF5ZXJzW2ldID0gbmV3IE1hamlhbmcuQUkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2FtZSA9IG5ldyBNYWppYW5nLkdhbWUocGxheWVycywgZW5kLCBydWxlKTtcclxuICAgICAgICBnYW1lLnZpZXcgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWksIGF1ZGlvLCBnYW1lLm1vZGVsKTtcclxuXHJcbiAgICAgICAgJCgnI2JvYXJkIC5jb250cm9sbGVyJykucmVtb3ZlQ2xhc3MoJ3BhaXB1JylcclxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xyXG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XHJcblxyXG4gICAgICAgIG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLCBnYW1lLCBnYW1lLl92aWV3KTtcclxuICAgICAgICBnYW1lLmthaWp1KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5kKHBhaXB1KSB7XHJcbiAgICAgICAgaWYgKHBhaXB1KSBmaWxlLmFkZChwYWlwdSwgMTApO1xyXG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xyXG4gICAgICAgIGZpbGUucmVkcmF3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnI2ZpbGUgLnN0YXJ0Jykub24oJ2NsaWNrJywgc3RhcnQpO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xyXG5cclxuICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAvLyDmiZPlvIDkuLvpobXmgLvmmK/mmL7npLrmoIfpopjpobXvvIjlkKvlnIjmlbDpgInmi6nvvInvvIzkuI3lho3lm6Dljoblj7LniYzosLHnm7TmjqXot7PovaxcclxuICAgICAgICAgICAgaGlkZSgkKCcjdGl0bGUgLmxvYWRpbmcnKSk7XHJcbiAgICAgICAgICAgICQoJyN0aXRsZSAuc3RhcnQnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RhYmluZGV4JywgMCkuYXR0cigncm9sZScsJ2J1dHRvbicpXHJcbiAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgKCk9PntcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclNlbGVjdG9yKCd0aXRsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2hvdyhzZXRTZWxlY3RvcigkKCcjdGl0bGUgLnN0YXJ0JyksICd0aXRsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZvY3VzOiBudWxsLCB0b3VjaDogZmFsc2UgfSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChsb2FkZWQpICQod2luZG93KS50cmlnZ2VyKCdsb2FkJyk7XHJcbiAgICB9LCAxMDAwKTtcclxufSk7XHJcblxyXG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+IGxvYWRlZCA9IHRydWUpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtMS4yLjMwLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTs7QUFFYixRQUFRO0FBQ1Isc0NBQXNDOztBQUV0Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0U7O0FBRXhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLDhCQUE4QiwyQkFBMkI7QUFDekQsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMLENBQUM7O0FBRUQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqICDpm7vohLPpurvlsIYgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgc2NhbGUsXG4gICAgICAgIHNldFNlbGVjdG9yLCBjbGVhclNlbGVjdG9yICB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG5sZXQgbG9hZGVkO1xuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICBsZXQgZ2FtZTtcbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcbiAgICBjb25zdCBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJCgnI2xvYWRkYXRhJykpO1xuXG4gICAgY29uc3QgYW5hbHl6ZXIgPSAoa2FpanUpPT57XG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnYW5hbHl6ZXInKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLkFuYWx5emVyKCQoJyNib2FyZCA+IC5hbmFseXplcicpLCBrYWlqdSwgcGFpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpPT4kKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2FuYWx5emVyJykpO1xuICAgIH07XG4gICAgY29uc3Qgdmlld2VyID0gKHBhaXB1KT0+e1xuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5hZGRDbGFzcygncGFpcHUnKVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuICAgICAgICBjb25zdCBfdmlld2VyXG4gICAgICAgICAgICAgICAgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdShcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNib2FyZCcpLCBwYWlwdSwgcGFpLCBhdWRpbywgJ01hamlhbmcucHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKT0+ZmFkZUluKCQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2ZpbGUnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmFseXplcik7XG4gICAgICAgIGRlbGV0ZSBfdmlld2VyLl92aWV3LmR1bW15X25hbWU7XG4gICAgICAgIHJldHVybiBfdmlld2VyO1xuICAgIH07XG4gICAgY29uc3Qgc3RhdCA9IChwYWlwdV9saXN0KT0+e1xuICAgICAgICBmYWRlSW4oJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnc3RhdCcpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWppYW5nLlVJLlBhaXB1U3RhdCgkKCcjc3RhdCcpLCBwYWlwdV9saXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk9PmZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpKTtcbiAgICB9O1xuICAgIGNvbnN0IGZpbGUgPSBuZXcgTWFqaWFuZy5VSS5QYWlwdUZpbGUoJCgnI2ZpbGUnKSwgJ01hamlhbmcuZ2FtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdlciwgc3RhdCk7XG4gICAgY29uc3QgcnVsZSA9IE1hamlhbmcucnVsZShcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJyl8fCd7fScpKTtcblxuICAgIC8vIOS4u+mhtVwi5omT5Yeg5ZyIXCLpgInmi6nvvJrlupTnlKjkv53lrZjnmoTlnIjmlbDvvIzlubbnm5HlkKzlj5jmm7RcbiAgICBjb25zdCByb3VuZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5yb3VuZHMnKTtcbiAgICBpZiAocm91bmRzKSBydWxlWyfloLTmlbAnXSA9ICtyb3VuZHM7XG4gICAgJCgnI3RpdGxlIC5yb3VuZHMtb3B0aW9uIHNlbGVjdCcpLnZhbChyb3VuZHMgfHwgJzInKVxuICAgICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnTWFqaWFuZy5yb3VuZHMnLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgbGV0IHBsYXllcnMgPSBbIG5ldyBNYWppYW5nLlVJLlBsYXllcigkKCcjYm9hcmQnKSwgcGFpLCBhdWRpbykgXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgIHBsYXllcnNbaV0gPSBuZXcgTWFqaWFuZy5BSSgpO1xuICAgICAgICB9XG4gICAgICAgIGdhbWUgPSBuZXcgTWFqaWFuZy5HYW1lKHBsYXllcnMsIGVuZCwgcnVsZSk7XG4gICAgICAgIGdhbWUudmlldyA9IG5ldyBNYWppYW5nLlVJLkJvYXJkKCQoJyNib2FyZCAuYm9hcmQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWksIGF1ZGlvLCBnYW1lLm1vZGVsKTtcblxuICAgICAgICAkKCcjYm9hcmQgLmNvbnRyb2xsZXInKS5yZW1vdmVDbGFzcygncGFpcHUnKVxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuXG4gICAgICAgIG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLCBnYW1lLCBnYW1lLl92aWV3KTtcbiAgICAgICAgZ2FtZS5rYWlqdSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZChwYWlwdSkge1xuICAgICAgICBpZiAocGFpcHUpIGZpbGUuYWRkKHBhaXB1LCAxMCk7XG4gICAgICAgIGZhZGVJbigkKCdib2R5JykuYXR0cignY2xhc3MnLCdmaWxlJykpO1xuICAgICAgICBmaWxlLnJlZHJhdygpO1xuICAgIH1cblxuICAgICQoJyNmaWxlIC5zdGFydCcpLm9uKCdjbGljaycsIHN0YXJ0KTtcblxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xuXG4gICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8g5omT5byA5Li76aG15oC75piv5pi+56S65qCH6aKY6aG177yI5ZCr5ZyI5pWw6YCJ5oup77yJ77yM5LiN5YaN5Zug5Y6G5Y+y54mM6LCx55u05o6l6Lez6L2sXG4gICAgICAgICAgICBoaWRlKCQoJyN0aXRsZSAubG9hZGluZycpKTtcbiAgICAgICAgICAgICQoJyN0aXRsZSAuc3RhcnQnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCd0YWJpbmRleCcsIDApLmF0dHIoJ3JvbGUnLCdidXR0b24nKVxuICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICBjbGVhclNlbGVjdG9yKCd0aXRsZScpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2hvdyhzZXRTZWxlY3RvcigkKCcjdGl0bGUgLnN0YXJ0JyksICd0aXRsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmb2N1czogbnVsbCwgdG91Y2g6IGZhbHNlIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChsb2FkZWQpICQod2luZG93KS50cmlnZ2VyKCdsb2FkJyk7XG4gICAgfSwgMTAwMCk7XG59KTtcblxuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCk9PiBsb2FkZWQgPSB0cnVlKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
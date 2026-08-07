/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!****************************!*\
  !*** ./src/js/autoplay.js ***!
  \****************************/
/*!
 *  電脳麻将: 自動対戦 v1.0.0
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

    const rule = Majiang.rule(
                    JSON.parse(localStorage.getItem('Majiang.rule')||'{}'));

    // 主页"打几圈"选择：应用保存的圈数，并监听变更
    const rounds = localStorage.getItem('Majiang.rounds');
    if (rounds) rule['場数'] = +rounds;
    $('#title .rounds-option select').val(rounds || '2')
        .on('change', function(){
            localStorage.setItem('Majiang.rounds', this.value);
        });

    let open_shoupai = false;
    let open_he      = false;

    function start() {
        if (game) {
            open_shoupai = game._view.open_shoupai;
            open_he      = game._view.open_he;
        }
        let players = [];
        for (let i = 0; i < 4; i++) {
            players[i] = new Majiang.AI();
        }
        game = new Majiang.Game(players, start, rule);
        game.view = new Majiang.UI.Board($('#board .board'),
                                        pai, audio, game.model);
        game.wait  = 5000;
        game._model.title
            = game._model.title.replace(/^[^\n]*/, $('title').text());
        game._view.open_shoupai = open_shoupai;
        game._view.open_he      = open_he;

        $('body').attr('class','board');
        scale($('#board'), $('#space'));

        $(window).off('keyup').on('keyup', (ev)=>{
            if (ev.key == ' ') {
                if (gamectl.stoped) gamectl.start();
                else                gamectl.stop();
                game.handler = ()=> gamectl.stop();
            }
            else if (ev.key == 's') gamectl.shoupai();
            else if (ev.key == 'h') gamectl.he();
            return false;
        });
        $('#board .board').off('click').on('click', ()=>{
            if (gamectl.stoped) gamectl.start();
            else                gamectl.stop();
            game.handler = ()=> gamectl.stop();
        });
        $('#board .board > .shoupai')
            .off('click', '.pai')
            .on('click', '.pai', ()=>gamectl.shoupai());
        $('#board .board > .he')
            .off('click', '.pai')
            .on('click', '.pai', ()=>gamectl.he());

        const gamectl = new Majiang.UI.GameCtl($('#board'), 'Majiang.pref',
                                                game, game._view);
        game.kaiju();
    }

    $(window).on('resize', ()=>scale($('#board'), $('#space')));

    $(window).on('load', function(){
        hide($('#title .loading'));
        $('#title .start').on('click', start)
        show($('#title .start'));
    });
    if (loaded) $(window).trigger('load');
});

$(window).on('load', ()=> loaded = true);

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3BsYXktMS4yLjI0LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTs7QUFFYixRQUFRO0FBQ1Isc0NBQXNDOztBQUV0Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3RUFBd0U7O0FBRXhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsT0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxDQUFDOztBQUVEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvYXV0b3BsYXkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDoh6rli5Xlr77miKYgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7IGhpZGUsIHNob3csIGZhZGVJbiwgc2NhbGUsXG4gICAgICAgIHNldFNlbGVjdG9yLCBjbGVhclNlbGVjdG9yICB9ID0gTWFqaWFuZy5VSS5VdGlsO1xuXG5sZXQgbG9hZGVkO1xuXG4kKGZ1bmN0aW9uKCl7XG5cbiAgICBsZXQgZ2FtZTtcbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcbiAgICBjb25zdCBhdWRpbyA9IE1hamlhbmcuVUkuYXVkaW8oJCgnI2xvYWRkYXRhJykpO1xuXG4gICAgY29uc3QgcnVsZSA9IE1hamlhbmcucnVsZShcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5ydWxlJyl8fCd7fScpKTtcblxuICAgIC8vIOS4u+mhtVwi5omT5Yeg5ZyIXCLpgInmi6nvvJrlupTnlKjkv53lrZjnmoTlnIjmlbDvvIzlubbnm5HlkKzlj5jmm7RcbiAgICBjb25zdCByb3VuZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnTWFqaWFuZy5yb3VuZHMnKTtcbiAgICBpZiAocm91bmRzKSBydWxlWyfloLTmlbAnXSA9ICtyb3VuZHM7XG4gICAgJCgnI3RpdGxlIC5yb3VuZHMtb3B0aW9uIHNlbGVjdCcpLnZhbChyb3VuZHMgfHwgJzInKVxuICAgICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnTWFqaWFuZy5yb3VuZHMnLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICBsZXQgb3Blbl9zaG91cGFpID0gZmFsc2U7XG4gICAgbGV0IG9wZW5faGUgICAgICA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmIChnYW1lKSB7XG4gICAgICAgICAgICBvcGVuX3Nob3VwYWkgPSBnYW1lLl92aWV3Lm9wZW5fc2hvdXBhaTtcbiAgICAgICAgICAgIG9wZW5faGUgICAgICA9IGdhbWUuX3ZpZXcub3Blbl9oZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGxheWVycyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgcGxheWVyc1tpXSA9IG5ldyBNYWppYW5nLkFJKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2FtZSA9IG5ldyBNYWppYW5nLkdhbWUocGxheWVycywgc3RhcnQsIHJ1bGUpO1xuICAgICAgICBnYW1lLnZpZXcgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFpLCBhdWRpbywgZ2FtZS5tb2RlbCk7XG4gICAgICAgIGdhbWUud2FpdCAgPSA1MDAwO1xuICAgICAgICBnYW1lLl9tb2RlbC50aXRsZVxuICAgICAgICAgICAgPSBnYW1lLl9tb2RlbC50aXRsZS5yZXBsYWNlKC9eW15cXG5dKi8sICQoJ3RpdGxlJykudGV4dCgpKTtcbiAgICAgICAgZ2FtZS5fdmlldy5vcGVuX3Nob3VwYWkgPSBvcGVuX3Nob3VwYWk7XG4gICAgICAgIGdhbWUuX3ZpZXcub3Blbl9oZSAgICAgID0gb3Blbl9oZTtcblxuICAgICAgICAkKCdib2R5JykuYXR0cignY2xhc3MnLCdib2FyZCcpO1xuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ2tleXVwJykub24oJ2tleXVwJywgKGV2KT0+e1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PSAnICcpIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZWN0bC5zdG9wZWQpIGdhbWVjdGwuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgIGdhbWVjdGwuc3RvcCgpO1xuICAgICAgICAgICAgICAgIGdhbWUuaGFuZGxlciA9ICgpPT4gZ2FtZWN0bC5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldi5rZXkgPT0gJ3MnKSBnYW1lY3RsLnNob3VwYWkoKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2LmtleSA9PSAnaCcpIGdhbWVjdGwuaGUoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJyNib2FyZCAuYm9hcmQnKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgKCk9PntcbiAgICAgICAgICAgIGlmIChnYW1lY3RsLnN0b3BlZCkgZ2FtZWN0bC5zdGFydCgpO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICBnYW1lY3RsLnN0b3AoKTtcbiAgICAgICAgICAgIGdhbWUuaGFuZGxlciA9ICgpPT4gZ2FtZWN0bC5zdG9wKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcjYm9hcmQgLmJvYXJkID4gLnNob3VwYWknKVxuICAgICAgICAgICAgLm9mZignY2xpY2snLCAnLnBhaScpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5wYWknLCAoKT0+Z2FtZWN0bC5zaG91cGFpKCkpO1xuICAgICAgICAkKCcjYm9hcmQgLmJvYXJkID4gLmhlJylcbiAgICAgICAgICAgIC5vZmYoJ2NsaWNrJywgJy5wYWknKVxuICAgICAgICAgICAgLm9uKCdjbGljaycsICcucGFpJywgKCk9PmdhbWVjdGwuaGUoKSk7XG5cbiAgICAgICAgY29uc3QgZ2FtZWN0bCA9IG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZSwgZ2FtZS5fdmlldyk7XG4gICAgICAgIGdhbWUua2FpanUoKTtcbiAgICB9XG5cbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpPT5zY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpKTtcblxuICAgICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGhpZGUoJCgnI3RpdGxlIC5sb2FkaW5nJykpO1xuICAgICAgICAkKCcjdGl0bGUgLnN0YXJ0Jykub24oJ2NsaWNrJywgc3RhcnQpXG4gICAgICAgIHNob3coJCgnI3RpdGxlIC5zdGFydCcpKTtcbiAgICB9KTtcbiAgICBpZiAobG9hZGVkKSAkKHdpbmRvdykudHJpZ2dlcignbG9hZCcpO1xufSk7XG5cbiQod2luZG93KS5vbignbG9hZCcsICgpPT4gbG9hZGVkID0gdHJ1ZSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
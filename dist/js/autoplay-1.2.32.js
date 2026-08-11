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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3BsYXktMS4yLjMyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTtBQUNiO0FBQ0EsUUFBUTtBQUNSLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQztBQUNEO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9hdXRvcGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogIOmbu+iEs+m6u+Wwhjog6Ieq5YuV5a++5oimIHYxLjAuMFxyXG4gKlxyXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcclxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSxcclxuICAgICAgICBzZXRTZWxlY3RvciwgY2xlYXJTZWxlY3RvciAgfSA9IE1hamlhbmcuVUkuVXRpbDtcclxuXHJcbmxldCBsb2FkZWQ7XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgbGV0IGdhbWU7XHJcbiAgICBjb25zdCBwYWkgICA9IE1hamlhbmcuVUkucGFpKCQoJyNsb2FkZGF0YScpKTtcclxuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XHJcblxyXG4gICAgY29uc3QgcnVsZSA9IE1hamlhbmcucnVsZShcclxuICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JykpO1xyXG5cclxuICAgIC8vIOS4u+mhtVwi5omT5Yeg5ZyIXCLpgInmi6nvvJrlupTnlKjkv53lrZjnmoTlnIjmlbDvvIzlubbnm5HlkKzlj5jmm7RcclxuICAgIGNvbnN0IHJvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJvdW5kcycpO1xyXG4gICAgaWYgKHJvdW5kcykgcnVsZVsn5aC05pWwJ10gPSArcm91bmRzO1xyXG4gICAgJCgnI3RpdGxlIC5yb3VuZHMtb3B0aW9uIHNlbGVjdCcpLnZhbChyb3VuZHMgfHwgJzInKVxyXG4gICAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ01hamlhbmcucm91bmRzJywgdGhpcy52YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgbGV0IG9wZW5fc2hvdXBhaSA9IGZhbHNlO1xyXG4gICAgbGV0IG9wZW5faGUgICAgICA9IGZhbHNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgICAgIGlmIChnYW1lKSB7XHJcbiAgICAgICAgICAgIG9wZW5fc2hvdXBhaSA9IGdhbWUuX3ZpZXcub3Blbl9zaG91cGFpO1xyXG4gICAgICAgICAgICBvcGVuX2hlICAgICAgPSBnYW1lLl92aWV3Lm9wZW5faGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBwbGF5ZXJzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgcGxheWVyc1tpXSA9IG5ldyBNYWppYW5nLkFJKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdhbWUgPSBuZXcgTWFqaWFuZy5HYW1lKHBsYXllcnMsIHN0YXJ0LCBydWxlKTtcclxuICAgICAgICBnYW1lLnZpZXcgPSBuZXcgTWFqaWFuZy5VSS5Cb2FyZCgkKCcjYm9hcmQgLmJvYXJkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWksIGF1ZGlvLCBnYW1lLm1vZGVsKTtcclxuICAgICAgICBnYW1lLndhaXQgID0gNTAwMDtcclxuICAgICAgICBnYW1lLl9tb2RlbC50aXRsZVxyXG4gICAgICAgICAgICA9IGdhbWUuX21vZGVsLnRpdGxlLnJlcGxhY2UoL15bXlxcbl0qLywgJCgndGl0bGUnKS50ZXh0KCkpO1xyXG4gICAgICAgIGdhbWUuX3ZpZXcub3Blbl9zaG91cGFpID0gb3Blbl9zaG91cGFpO1xyXG4gICAgICAgIGdhbWUuX3ZpZXcub3Blbl9oZSAgICAgID0gb3Blbl9oZTtcclxuXHJcbiAgICAgICAgJCgnYm9keScpLmF0dHIoJ2NsYXNzJywnYm9hcmQnKTtcclxuICAgICAgICBzY2FsZSgkKCcjYm9hcmQnKSwgJCgnI3NwYWNlJykpO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub2ZmKCdrZXl1cCcpLm9uKCdrZXl1cCcsIChldik9PntcclxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PSAnICcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnYW1lY3RsLnN0b3BlZCkgZ2FtZWN0bC5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICBnYW1lY3RsLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgIGdhbWUuaGFuZGxlciA9ICgpPT4gZ2FtZWN0bC5zdG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYua2V5ID09ICdzJykgZ2FtZWN0bC5zaG91cGFpKCk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2LmtleSA9PSAnaCcpIGdhbWVjdGwuaGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJyNib2FyZCAuYm9hcmQnKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgKCk9PntcclxuICAgICAgICAgICAgaWYgKGdhbWVjdGwuc3RvcGVkKSBnYW1lY3RsLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgZ2FtZWN0bC5zdG9wKCk7XHJcbiAgICAgICAgICAgIGdhbWUuaGFuZGxlciA9ICgpPT4gZ2FtZWN0bC5zdG9wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI2JvYXJkIC5ib2FyZCA+IC5zaG91cGFpJylcclxuICAgICAgICAgICAgLm9mZignY2xpY2snLCAnLnBhaScpXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAnLnBhaScsICgpPT5nYW1lY3RsLnNob3VwYWkoKSk7XHJcbiAgICAgICAgJCgnI2JvYXJkIC5ib2FyZCA+IC5oZScpXHJcbiAgICAgICAgICAgIC5vZmYoJ2NsaWNrJywgJy5wYWknKVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5wYWknLCAoKT0+Z2FtZWN0bC5oZSgpKTtcclxuXHJcbiAgICAgICAgY29uc3QgZ2FtZWN0bCA9IG5ldyBNYWppYW5nLlVJLkdhbWVDdGwoJCgnI2JvYXJkJyksICdNYWppYW5nLnByZWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lLCBnYW1lLl92aWV3KTtcclxuICAgICAgICBnYW1lLmthaWp1KCk7XHJcbiAgICB9XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKT0+c2NhbGUoJCgnI2JvYXJkJyksICQoJyNzcGFjZScpKSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBoaWRlKCQoJyN0aXRsZSAubG9hZGluZycpKTtcclxuICAgICAgICAkKCcjdGl0bGUgLnN0YXJ0Jykub24oJ2NsaWNrJywgc3RhcnQpXHJcbiAgICAgICAgc2hvdygkKCcjdGl0bGUgLnN0YXJ0JykpO1xyXG4gICAgfSk7XHJcbiAgICBpZiAobG9hZGVkKSAkKHdpbmRvdykudHJpZ2dlcignbG9hZCcpO1xyXG59KTtcclxuXHJcbiQod2luZG93KS5vbignbG9hZCcsICgpPT4gbG9hZGVkID0gdHJ1ZSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
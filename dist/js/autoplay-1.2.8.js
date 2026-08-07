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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3BsYXktMS4yLjguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNhOztBQUViLFFBQVE7QUFDUixzQ0FBc0M7O0FBRXRDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdFQUF3RTs7QUFFeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9hdXRvcGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqICDpm7vohLPpurvlsIY6IOiHquWLleWvvuaIpiB2MS4wLjBcbiAqXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcbiAqICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqICBodHRwczovL2dpdGh1Yi5jb20va29iYWxhYi9NYWppYW5nL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHsgaGlkZSwgc2hvdywgZmFkZUluLCBzY2FsZSxcbiAgICAgICAgc2V0U2VsZWN0b3IsIGNsZWFyU2VsZWN0b3IgIH0gPSBNYWppYW5nLlVJLlV0aWw7XG5cbmxldCBsb2FkZWQ7XG5cbiQoZnVuY3Rpb24oKXtcblxuICAgIGxldCBnYW1lO1xuICAgIGNvbnN0IHBhaSAgID0gTWFqaWFuZy5VSS5wYWkoJCgnI2xvYWRkYXRhJykpO1xuICAgIGNvbnN0IGF1ZGlvID0gTWFqaWFuZy5VSS5hdWRpbygkKCcjbG9hZGRhdGEnKSk7XG5cbiAgICBjb25zdCBydWxlID0gTWFqaWFuZy5ydWxlKFxuICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJ1bGUnKXx8J3t9JykpO1xuXG4gICAgLy8g5Li76aG1XCLmiZPlh6DlnIhcIumAieaLqe+8muW6lOeUqOS/neWtmOeahOWciOaVsO+8jOW5tuebkeWQrOWPmOabtFxuICAgIGNvbnN0IHJvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdNYWppYW5nLnJvdW5kcycpO1xuICAgIGlmIChyb3VuZHMpIHJ1bGVbJ+WgtOaVsCddID0gK3JvdW5kcztcbiAgICAkKCcjdGl0bGUgLnJvdW5kcy1vcHRpb24gc2VsZWN0JykudmFsKHJvdW5kcyB8fCAnMicpXG4gICAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdNYWppYW5nLnJvdW5kcycsIHRoaXMudmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgIGxldCBvcGVuX3Nob3VwYWkgPSBmYWxzZTtcbiAgICBsZXQgb3Blbl9oZSAgICAgID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgaWYgKGdhbWUpIHtcbiAgICAgICAgICAgIG9wZW5fc2hvdXBhaSA9IGdhbWUuX3ZpZXcub3Blbl9zaG91cGFpO1xuICAgICAgICAgICAgb3Blbl9oZSAgICAgID0gZ2FtZS5fdmlldy5vcGVuX2hlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwbGF5ZXJzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBwbGF5ZXJzW2ldID0gbmV3IE1hamlhbmcuQUkoKTtcbiAgICAgICAgfVxuICAgICAgICBnYW1lID0gbmV3IE1hamlhbmcuR2FtZShwbGF5ZXJzLCBzdGFydCwgcnVsZSk7XG4gICAgICAgIGdhbWUudmlldyA9IG5ldyBNYWppYW5nLlVJLkJvYXJkKCQoJyNib2FyZCAuYm9hcmQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWksIGF1ZGlvLCBnYW1lLm1vZGVsKTtcbiAgICAgICAgZ2FtZS53YWl0ICA9IDUwMDA7XG4gICAgICAgIGdhbWUuX21vZGVsLnRpdGxlXG4gICAgICAgICAgICA9IGdhbWUuX21vZGVsLnRpdGxlLnJlcGxhY2UoL15bXlxcbl0qLywgJCgndGl0bGUnKS50ZXh0KCkpO1xuICAgICAgICBnYW1lLl92aWV3Lm9wZW5fc2hvdXBhaSA9IG9wZW5fc2hvdXBhaTtcbiAgICAgICAgZ2FtZS5fdmlldy5vcGVuX2hlICAgICAgPSBvcGVuX2hlO1xuXG4gICAgICAgICQoJ2JvZHknKS5hdHRyKCdjbGFzcycsJ2JvYXJkJyk7XG4gICAgICAgIHNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZigna2V5dXAnKS5vbigna2V5dXAnLCAoZXYpPT57XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09ICcgJykge1xuICAgICAgICAgICAgICAgIGlmIChnYW1lY3RsLnN0b3BlZCkgZ2FtZWN0bC5zdGFydCgpO1xuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgZ2FtZWN0bC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgZ2FtZS5oYW5kbGVyID0gKCk9PiBnYW1lY3RsLnN0b3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2LmtleSA9PSAncycpIGdhbWVjdGwuc2hvdXBhaSgpO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXYua2V5ID09ICdoJykgZ2FtZWN0bC5oZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnI2JvYXJkIC5ib2FyZCcpLm9mZignY2xpY2snKS5vbignY2xpY2snLCAoKT0+e1xuICAgICAgICAgICAgaWYgKGdhbWVjdGwuc3RvcGVkKSBnYW1lY3RsLnN0YXJ0KCk7XG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgIGdhbWVjdGwuc3RvcCgpO1xuICAgICAgICAgICAgZ2FtZS5oYW5kbGVyID0gKCk9PiBnYW1lY3RsLnN0b3AoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJyNib2FyZCAuYm9hcmQgPiAuc2hvdXBhaScpXG4gICAgICAgICAgICAub2ZmKCdjbGljaycsICcucGFpJylcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAnLnBhaScsICgpPT5nYW1lY3RsLnNob3VwYWkoKSk7XG4gICAgICAgICQoJyNib2FyZCAuYm9hcmQgPiAuaGUnKVxuICAgICAgICAgICAgLm9mZignY2xpY2snLCAnLnBhaScpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5wYWknLCAoKT0+Z2FtZWN0bC5oZSgpKTtcblxuICAgICAgICBjb25zdCBnYW1lY3RsID0gbmV3IE1hamlhbmcuVUkuR2FtZUN0bCgkKCcjYm9hcmQnKSwgJ01hamlhbmcucHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lLCBnYW1lLl92aWV3KTtcbiAgICAgICAgZ2FtZS5rYWlqdSgpO1xuICAgIH1cblxuICAgICQod2luZG93KS5vbigncmVzaXplJywgKCk9PnNjYWxlKCQoJyNib2FyZCcpLCAkKCcjc3BhY2UnKSkpO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaGlkZSgkKCcjdGl0bGUgLmxvYWRpbmcnKSk7XG4gICAgICAgICQoJyN0aXRsZSAuc3RhcnQnKS5vbignY2xpY2snLCBzdGFydClcbiAgICAgICAgc2hvdygkKCcjdGl0bGUgLnN0YXJ0JykpO1xuICAgIH0pO1xuICAgIGlmIChsb2FkZWQpICQod2luZG93KS50cmlnZ2VyKCdsb2FkJyk7XG59KTtcblxuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCk9PiBsb2FkZWQgPSB0cnVlKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/js/paiga.js ***!
  \*************************/
/*!
 *  電脳麻将: 牌画入力 v1.0.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */


const example = 'このような記述ができます。\n'
              + '{s067z1 z1}(ツモ) {p2-13} {z666=6} {_z77_} {  }(ドラ){m1}';

const imgbase = 'https://kobalab.github.io/paiga/2/';

function markup(paistr, w, h) {

    let url, v = 0;
    let html = '<span style="white-space:pre;">';

    for (let pai of paistr.match(/[mpsz](?:\d\d\=|\d\-|\d)+|[ _]|.+/g)||[]) {

        if (pai == ' ') {
            html += '&nbsp;';
        }
        else if (pai == '_') {
            url = imgbase + 'pai.png';
            html += `<img src="${url}" width="${w}" height="${h}"`
                  + ` alt="${pai}">`;
        }
        else if (pai.match(/^[mpsz](?:\d\d\=|\d\-|\d)+$/)) {
            let s = pai[0];
            for (let n of pai.match(/\d\d\=|\d\-|\d/g)) {
                let url = imgbase, x, y;
                if (n.slice(-1) == '=') {
                    url += s + n.slice(0,2) + '_.png';
                    x = h; y = w * 2;
                }
                else if (n.slice(-1) == '-') {
                    url += s + n.slice(0,1) + '_.png';
                    x = h; y = w;
                }
                else {
                    url += s + n + '.png';
                    x = w; y = h;
                }
                html += `<img src="${url}" width="${x}" height="${y}"`
                            + ` alt="${s+n}">`;
            }
        }
        else {
            html += `<span style="color:red;">${pai}</span>`;
        }
    }
    html += '</span>';
    return html;
}

function parse(text, w, h) {
    return text.replace(/\\.|{(.+?)}/g, (match, mark)=>
        match[0] == '\\' ? match.slice(1)
                         : markup(mark, w, h)
    );
}

$(function(){

    $('textarea[name="text"]').val(example).focus();

    $('form').on('submit', ()=>{

        let [ , w, h ] = $('input[name="size"]:checked').val()
                                                        .match(/^(\d+)x(\d+)$/);
        let text = $('textarea[name="text"]').val();
        let html = parse(text, w, h);
        $('.paiga div')
            .empty()
            .append($(`<p  style="white-space:pre-line">${html}</p>`));
        $('.paiga textarea').val(html).select();

        return false;
    });

    $('form').on('reset', ()=>{
        $('.paiga div').empty();
        $('.paiga textarea').val('');
        $('textarea[name="text"]').focus();
    });
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpZ2EtMS4yLjMyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTtBQUNiO0FBQ0E7QUFDQSxrQkFBa0IsVUFBVSxNQUFNLFFBQVEsU0FBUyxXQUFXLEtBQUssR0FBRztBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLElBQUksV0FBVyxFQUFFLFlBQVksRUFBRTtBQUNoRSw2QkFBNkIsSUFBSTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0EscUNBQXFDLElBQUksV0FBVyxFQUFFLFlBQVksRUFBRTtBQUNwRSx1Q0FBdUMsSUFBSTtBQUMzQztBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsSUFBSSxJQUFJO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLE1BQU07QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxLQUFLO0FBQy9EO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXpob3UtbWFqaWFuZy8uL3NyYy9qcy9wYWlnYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogIOmbu+iEs+m6u+Wwhjog54mM55S75YWl5YqbIHYxLjAuMFxyXG4gKlxyXG4gKiAgQ29weXJpZ2h0KEMpIDIwMTcgU2F0b3NoaSBLb2JheWFzaGlcclxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IGV4YW1wbGUgPSAn44GT44Gu44KI44GG44Gq6KiY6L+w44GM44Gn44GN44G+44GZ44CCXFxuJ1xyXG4gICAgICAgICAgICAgICsgJ3tzMDY3ejEgejF9KOODhOODoikge3AyLTEzfSB7ejY2Nj02fSB7X3o3N199IHsgIH0o44OJ44OpKXttMX0nO1xyXG5cclxuY29uc3QgaW1nYmFzZSA9ICdodHRwczovL2tvYmFsYWIuZ2l0aHViLmlvL3BhaWdhLzIvJztcclxuXHJcbmZ1bmN0aW9uIG1hcmt1cChwYWlzdHIsIHcsIGgpIHtcclxuXHJcbiAgICBsZXQgdXJsLCB2ID0gMDtcclxuICAgIGxldCBodG1sID0gJzxzcGFuIHN0eWxlPVwid2hpdGUtc3BhY2U6cHJlO1wiPic7XHJcblxyXG4gICAgZm9yIChsZXQgcGFpIG9mIHBhaXN0ci5tYXRjaCgvW21wc3pdKD86XFxkXFxkXFw9fFxcZFxcLXxcXGQpK3xbIF9dfC4rL2cpfHxbXSkge1xyXG5cclxuICAgICAgICBpZiAocGFpID09ICcgJykge1xyXG4gICAgICAgICAgICBodG1sICs9ICcmbmJzcDsnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChwYWkgPT0gJ18nKSB7XHJcbiAgICAgICAgICAgIHVybCA9IGltZ2Jhc2UgKyAncGFpLnBuZyc7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gYDxpbWcgc3JjPVwiJHt1cmx9XCIgd2lkdGg9XCIke3d9XCIgaGVpZ2h0PVwiJHtofVwiYFxyXG4gICAgICAgICAgICAgICAgICArIGAgYWx0PVwiJHtwYWl9XCI+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocGFpLm1hdGNoKC9eW21wc3pdKD86XFxkXFxkXFw9fFxcZFxcLXxcXGQpKyQvKSkge1xyXG4gICAgICAgICAgICBsZXQgcyA9IHBhaVswXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbiBvZiBwYWkubWF0Y2goL1xcZFxcZFxcPXxcXGRcXC18XFxkL2cpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gaW1nYmFzZSwgeCwgeTtcclxuICAgICAgICAgICAgICAgIGlmIChuLnNsaWNlKC0xKSA9PSAnPScpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gcyArIG4uc2xpY2UoMCwyKSArICdfLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IGg7IHkgPSB3ICogMjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG4uc2xpY2UoLTEpID09ICctJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBzICsgbi5zbGljZSgwLDEpICsgJ18ucG5nJztcclxuICAgICAgICAgICAgICAgICAgICB4ID0gaDsgeSA9IHc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gcyArIG4gKyAnLnBuZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHc7IHkgPSBoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGltZyBzcmM9XCIke3VybH1cIiB3aWR0aD1cIiR7eH1cIiBoZWlnaHQ9XCIke3l9XCJgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArIGAgYWx0PVwiJHtzK259XCI+YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaHRtbCArPSBgPHNwYW4gc3R5bGU9XCJjb2xvcjpyZWQ7XCI+JHtwYWl9PC9zcGFuPmA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaHRtbCArPSAnPC9zcGFuPic7XHJcbiAgICByZXR1cm4gaHRtbDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2UodGV4dCwgdywgaCkge1xyXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvXFxcXC58eyguKz8pfS9nLCAobWF0Y2gsIG1hcmspPT5cclxuICAgICAgICBtYXRjaFswXSA9PSAnXFxcXCcgPyBtYXRjaC5zbGljZSgxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgOiBtYXJrdXAobWFyaywgdywgaClcclxuICAgICk7XHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHJcbiAgICAkKCd0ZXh0YXJlYVtuYW1lPVwidGV4dFwiXScpLnZhbChleGFtcGxlKS5mb2N1cygpO1xyXG5cclxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0JywgKCk9PntcclxuXHJcbiAgICAgICAgbGV0IFsgLCB3LCBoIF0gPSAkKCdpbnB1dFtuYW1lPVwic2l6ZVwiXTpjaGVja2VkJykudmFsKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWF0Y2goL14oXFxkKyl4KFxcZCspJC8pO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gJCgndGV4dGFyZWFbbmFtZT1cInRleHRcIl0nKS52YWwoKTtcclxuICAgICAgICBsZXQgaHRtbCA9IHBhcnNlKHRleHQsIHcsIGgpO1xyXG4gICAgICAgICQoJy5wYWlnYSBkaXYnKVxyXG4gICAgICAgICAgICAuZW1wdHkoKVxyXG4gICAgICAgICAgICAuYXBwZW5kKCQoYDxwICBzdHlsZT1cIndoaXRlLXNwYWNlOnByZS1saW5lXCI+JHtodG1sfTwvcD5gKSk7XHJcbiAgICAgICAgJCgnLnBhaWdhIHRleHRhcmVhJykudmFsKGh0bWwpLnNlbGVjdCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgKCk9PntcclxuICAgICAgICAkKCcucGFpZ2EgZGl2JykuZW1wdHkoKTtcclxuICAgICAgICAkKCcucGFpZ2EgdGV4dGFyZWEnKS52YWwoJycpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhW25hbWU9XCJ0ZXh0XCJdJykuZm9jdXMoKTtcclxuICAgIH0pO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
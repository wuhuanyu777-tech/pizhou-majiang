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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpZ2EtMS4yLjIxLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYTs7QUFFYjtBQUNBLGtCQUFrQixVQUFVLE1BQU0sUUFBUSxTQUFTLFdBQVcsS0FBSyxHQUFHOztBQUV0RTs7QUFFQTs7QUFFQTtBQUNBLDZDQUE2Qzs7QUFFN0M7O0FBRUE7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLElBQUksV0FBVyxFQUFFLFlBQVksRUFBRTtBQUNoRSw2QkFBNkIsSUFBSTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0EscUNBQXFDLElBQUksV0FBVyxFQUFFLFlBQVksRUFBRTtBQUNwRSx1Q0FBdUMsSUFBSTtBQUMzQztBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsSUFBSSxJQUFJO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4QkFBOEIsTUFBTTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsS0FBSztBQUMvRDs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3BpemhvdS1tYWppYW5nLy4vc3JjL2pzL3BhaWdhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogIOmbu+iEs+m6u+Wwhjog54mM55S75YWl5YqbIHYxLjAuMFxuICpcbiAqICBDb3B5cmlnaHQoQykgMjAxNyBTYXRvc2hpIEtvYmF5YXNoaVxuICogIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9rb2JhbGFiL01hamlhbmcvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgZXhhbXBsZSA9ICfjgZPjga7jgojjgYbjgaroqJjov7DjgYzjgafjgY3jgb7jgZnjgIJcXG4nXG4gICAgICAgICAgICAgICsgJ3tzMDY3ejEgejF9KOODhOODoikge3AyLTEzfSB7ejY2Nj02fSB7X3o3N199IHsgIH0o44OJ44OpKXttMX0nO1xuXG5jb25zdCBpbWdiYXNlID0gJ2h0dHBzOi8va29iYWxhYi5naXRodWIuaW8vcGFpZ2EvMi8nO1xuXG5mdW5jdGlvbiBtYXJrdXAocGFpc3RyLCB3LCBoKSB7XG5cbiAgICBsZXQgdXJsLCB2ID0gMDtcbiAgICBsZXQgaHRtbCA9ICc8c3BhbiBzdHlsZT1cIndoaXRlLXNwYWNlOnByZTtcIj4nO1xuXG4gICAgZm9yIChsZXQgcGFpIG9mIHBhaXN0ci5tYXRjaCgvW21wc3pdKD86XFxkXFxkXFw9fFxcZFxcLXxcXGQpK3xbIF9dfC4rL2cpfHxbXSkge1xuXG4gICAgICAgIGlmIChwYWkgPT0gJyAnKSB7XG4gICAgICAgICAgICBodG1sICs9ICcmbmJzcDsnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhaSA9PSAnXycpIHtcbiAgICAgICAgICAgIHVybCA9IGltZ2Jhc2UgKyAncGFpLnBuZyc7XG4gICAgICAgICAgICBodG1sICs9IGA8aW1nIHNyYz1cIiR7dXJsfVwiIHdpZHRoPVwiJHt3fVwiIGhlaWdodD1cIiR7aH1cImBcbiAgICAgICAgICAgICAgICAgICsgYCBhbHQ9XCIke3BhaX1cIj5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhaS5tYXRjaCgvXlttcHN6XSg/OlxcZFxcZFxcPXxcXGRcXC18XFxkKSskLykpIHtcbiAgICAgICAgICAgIGxldCBzID0gcGFpWzBdO1xuICAgICAgICAgICAgZm9yIChsZXQgbiBvZiBwYWkubWF0Y2goL1xcZFxcZFxcPXxcXGRcXC18XFxkL2cpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IGltZ2Jhc2UsIHgsIHk7XG4gICAgICAgICAgICAgICAgaWYgKG4uc2xpY2UoLTEpID09ICc9Jykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gcyArIG4uc2xpY2UoMCwyKSArICdfLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgIHggPSBoOyB5ID0gdyAqIDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG4uc2xpY2UoLTEpID09ICctJykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gcyArIG4uc2xpY2UoMCwxKSArICdfLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgIHggPSBoOyB5ID0gdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBzICsgbiArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgeCA9IHc7IHkgPSBoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBodG1sICs9IGA8aW1nIHNyYz1cIiR7dXJsfVwiIHdpZHRoPVwiJHt4fVwiIGhlaWdodD1cIiR7eX1cImBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArIGAgYWx0PVwiJHtzK259XCI+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxzcGFuIHN0eWxlPVwiY29sb3I6cmVkO1wiPiR7cGFpfTwvc3Bhbj5gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGh0bWwgKz0gJzwvc3Bhbj4nO1xuICAgIHJldHVybiBodG1sO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0ZXh0LCB3LCBoKSB7XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvXFxcXC58eyguKz8pfS9nLCAobWF0Y2gsIG1hcmspPT5cbiAgICAgICAgbWF0Y2hbMF0gPT0gJ1xcXFwnID8gbWF0Y2guc2xpY2UoMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICA6IG1hcmt1cChtYXJrLCB3LCBoKVxuICAgICk7XG59XG5cbiQoZnVuY3Rpb24oKXtcblxuICAgICQoJ3RleHRhcmVhW25hbWU9XCJ0ZXh0XCJdJykudmFsKGV4YW1wbGUpLmZvY3VzKCk7XG5cbiAgICAkKCdmb3JtJykub24oJ3N1Ym1pdCcsICgpPT57XG5cbiAgICAgICAgbGV0IFsgLCB3LCBoIF0gPSAkKCdpbnB1dFtuYW1lPVwic2l6ZVwiXTpjaGVja2VkJykudmFsKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hdGNoKC9eKFxcZCspeChcXGQrKSQvKTtcbiAgICAgICAgbGV0IHRleHQgPSAkKCd0ZXh0YXJlYVtuYW1lPVwidGV4dFwiXScpLnZhbCgpO1xuICAgICAgICBsZXQgaHRtbCA9IHBhcnNlKHRleHQsIHcsIGgpO1xuICAgICAgICAkKCcucGFpZ2EgZGl2JylcbiAgICAgICAgICAgIC5lbXB0eSgpXG4gICAgICAgICAgICAuYXBwZW5kKCQoYDxwICBzdHlsZT1cIndoaXRlLXNwYWNlOnByZS1saW5lXCI+JHtodG1sfTwvcD5gKSk7XG4gICAgICAgICQoJy5wYWlnYSB0ZXh0YXJlYScpLnZhbChodG1sKS5zZWxlY3QoKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAkKCdmb3JtJykub24oJ3Jlc2V0JywgKCk9PntcbiAgICAgICAgJCgnLnBhaWdhIGRpdicpLmVtcHR5KCk7XG4gICAgICAgICQoJy5wYWlnYSB0ZXh0YXJlYScpLnZhbCgnJyk7XG4gICAgICAgICQoJ3RleHRhcmVhW25hbWU9XCJ0ZXh0XCJdJykuZm9jdXMoKTtcbiAgICB9KTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
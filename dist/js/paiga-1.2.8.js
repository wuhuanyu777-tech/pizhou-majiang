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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFpZ2EtMS4yLjguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNhOztBQUViO0FBQ0Esa0JBQWtCLFVBQVUsTUFBTSxRQUFRLFNBQVMsV0FBVyxLQUFLLEdBQUc7O0FBRXRFOztBQUVBOztBQUVBO0FBQ0EsNkNBQTZDOztBQUU3Qzs7QUFFQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsSUFBSSxXQUFXLEVBQUUsWUFBWSxFQUFFO0FBQ2hFLDZCQUE2QixJQUFJO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQSxxQ0FBcUMsSUFBSSxXQUFXLEVBQUUsWUFBWSxFQUFFO0FBQ3BFLHVDQUF1QyxJQUFJO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxJQUFJLElBQUk7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QixNQUFNO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxLQUFLO0FBQy9EOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGl6aG91LW1hamlhbmcvLi9zcmMvanMvcGFpZ2EuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiAg6Zu76ISz6bq75bCGOiDniYznlLvlhaXlipsgdjEuMC4wXG4gKlxuICogIENvcHlyaWdodChDKSAyMDE3IFNhdG9zaGkgS29iYXlhc2hpXG4gKiAgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiAgaHR0cHM6Ly9naXRodWIuY29tL2tvYmFsYWIvTWFqaWFuZy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBleGFtcGxlID0gJ+OBk+OBruOCiOOBhuOBquiomOi/sOOBjOOBp+OBjeOBvuOBmeOAglxcbidcbiAgICAgICAgICAgICAgKyAne3MwNjd6MSB6MX0o44OE44OiKSB7cDItMTN9IHt6NjY2PTZ9IHtfejc3X30geyAgfSjjg4njg6kpe20xfSc7XG5cbmNvbnN0IGltZ2Jhc2UgPSAnaHR0cHM6Ly9rb2JhbGFiLmdpdGh1Yi5pby9wYWlnYS8yLyc7XG5cbmZ1bmN0aW9uIG1hcmt1cChwYWlzdHIsIHcsIGgpIHtcblxuICAgIGxldCB1cmwsIHYgPSAwO1xuICAgIGxldCBodG1sID0gJzxzcGFuIHN0eWxlPVwid2hpdGUtc3BhY2U6cHJlO1wiPic7XG5cbiAgICBmb3IgKGxldCBwYWkgb2YgcGFpc3RyLm1hdGNoKC9bbXBzel0oPzpcXGRcXGRcXD18XFxkXFwtfFxcZCkrfFsgX118LisvZyl8fFtdKSB7XG5cbiAgICAgICAgaWYgKHBhaSA9PSAnICcpIHtcbiAgICAgICAgICAgIGh0bWwgKz0gJyZuYnNwOyc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFpID09ICdfJykge1xuICAgICAgICAgICAgdXJsID0gaW1nYmFzZSArICdwYWkucG5nJztcbiAgICAgICAgICAgIGh0bWwgKz0gYDxpbWcgc3JjPVwiJHt1cmx9XCIgd2lkdGg9XCIke3d9XCIgaGVpZ2h0PVwiJHtofVwiYFxuICAgICAgICAgICAgICAgICAgKyBgIGFsdD1cIiR7cGFpfVwiPmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFpLm1hdGNoKC9eW21wc3pdKD86XFxkXFxkXFw9fFxcZFxcLXxcXGQpKyQvKSkge1xuICAgICAgICAgICAgbGV0IHMgPSBwYWlbMF07XG4gICAgICAgICAgICBmb3IgKGxldCBuIG9mIHBhaS5tYXRjaCgvXFxkXFxkXFw9fFxcZFxcLXxcXGQvZykpIHtcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gaW1nYmFzZSwgeCwgeTtcbiAgICAgICAgICAgICAgICBpZiAobi5zbGljZSgtMSkgPT0gJz0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBzICsgbi5zbGljZSgwLDIpICsgJ18ucG5nJztcbiAgICAgICAgICAgICAgICAgICAgeCA9IGg7IHkgPSB3ICogMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobi5zbGljZSgtMSkgPT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBzICsgbi5zbGljZSgwLDEpICsgJ18ucG5nJztcbiAgICAgICAgICAgICAgICAgICAgeCA9IGg7IHkgPSB3O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHMgKyBuICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgICAgICB4ID0gdzsgeSA9IGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxpbWcgc3JjPVwiJHt1cmx9XCIgd2lkdGg9XCIke3h9XCIgaGVpZ2h0PVwiJHt5fVwiYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgYCBhbHQ9XCIke3Mrbn1cIj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaHRtbCArPSBgPHNwYW4gc3R5bGU9XCJjb2xvcjpyZWQ7XCI+JHtwYWl9PC9zcGFuPmA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaHRtbCArPSAnPC9zcGFuPic7XG4gICAgcmV0dXJuIGh0bWw7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHRleHQsIHcsIGgpIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9cXFxcLnx7KC4rPyl9L2csIChtYXRjaCwgbWFyayk9PlxuICAgICAgICBtYXRjaFswXSA9PSAnXFxcXCcgPyBtYXRjaC5zbGljZSgxKVxuICAgICAgICAgICAgICAgICAgICAgICAgIDogbWFya3VwKG1hcmssIHcsIGgpXG4gICAgKTtcbn1cblxuJChmdW5jdGlvbigpe1xuXG4gICAgJCgndGV4dGFyZWFbbmFtZT1cInRleHRcIl0nKS52YWwoZXhhbXBsZSkuZm9jdXMoKTtcblxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0JywgKCk9PntcblxuICAgICAgICBsZXQgWyAsIHcsIGggXSA9ICQoJ2lucHV0W25hbWU9XCJzaXplXCJdOmNoZWNrZWQnKS52YWwoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWF0Y2goL14oXFxkKyl4KFxcZCspJC8pO1xuICAgICAgICBsZXQgdGV4dCA9ICQoJ3RleHRhcmVhW25hbWU9XCJ0ZXh0XCJdJykudmFsKCk7XG4gICAgICAgIGxldCBodG1sID0gcGFyc2UodGV4dCwgdywgaCk7XG4gICAgICAgICQoJy5wYWlnYSBkaXYnKVxuICAgICAgICAgICAgLmVtcHR5KClcbiAgICAgICAgICAgIC5hcHBlbmQoJChgPHAgIHN0eWxlPVwid2hpdGUtc3BhY2U6cHJlLWxpbmVcIj4ke2h0bWx9PC9wPmApKTtcbiAgICAgICAgJCgnLnBhaWdhIHRleHRhcmVhJykudmFsKGh0bWwpLnNlbGVjdCgpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgICQoJ2Zvcm0nKS5vbigncmVzZXQnLCAoKT0+e1xuICAgICAgICAkKCcucGFpZ2EgZGl2JykuZW1wdHkoKTtcbiAgICAgICAgJCgnLnBhaWdhIHRleHRhcmVhJykudmFsKCcnKTtcbiAgICAgICAgJCgndGV4dGFyZWFbbmFtZT1cInRleHRcIl0nKS5mb2N1cygpO1xuICAgIH0pO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
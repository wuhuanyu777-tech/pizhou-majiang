/*
 *  Majiang.UI.mianzi
 */
"use strict";

const $ = require('jquery');

module.exports = function(pai) {

    return function(m, mingang, open) {

        let mianzi = $('<span class="mianzi">');
        let s = m[0];
        if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1$/)) {
            let nn = m.match(/\d/g);
            mianzi.attr('aria-label','暗坎')
                  .addClass('ankan');
            if (open) {
                // 自己看：中间那张亮出牌面（认得暗刻的牌），首尾保持背面
                mianzi.append($('<span class="akan-pai">').append(pai('_')))
                      .append($('<span class="akan-pai">').append(pai(s+nn[0])))
                      .append($('<span class="akan-pai">').append(pai('_')));
            }
            else {
                // 别人看：三张背面扣着
                mianzi.append($('<span class="akan-pai">').append(pai('_')))
                      .append($('<span class="akan-pai">').append(pai('_')))
                      .append($('<span class="akan-pai">').append(pai('_')));
            }
        }
        else if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1\1$/)) {
            let nn = m.match(/\d/g);
            if (mingang) {
                // 暗坎升级的明杠（自摸补第4张）：四张全亮
                mianzi.attr('aria-label','明杠')
                      .append(pai(s+nn[0]))
                      .append(pai(s+nn[1]))
                      .append(pai(s+nn[2]))
                      .append($('<span class="rotate">').append(pai(s+nn[3])));
            }
            else {
                mianzi.attr('aria-label','アンカン')
                      .append(pai('_'))
                      .append(pai(s+nn[2]))
                      .append(pai(s+nn[3]))
                      .append(pai('_'));
            }
        }
        else if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1/)) {
            let jiagang = m.match(/[\+\=\-]\d$/);
            let d       = m.match(/[\+\=\-]/);
            let nn      = m.match(/\d/g);
            let pai_s   = pai(s+nn[0]);
            let pai_r   = $('<span class="rotate">')
                            .append(jiagang ? nn.slice(-2).map(n=>pai(s+n))
                                            : nn.slice(-1).map(n=>pai(s+n)));
            let pai_l   = (! jiagang && nn.length == 4)
                                            ? nn.slice(1, 3).map(n=>pai(s+n))
                                            : nn.slice(1, 2).map(n=>pai(s+n));
            let label   = (  d == '+' ? 'シモチャから'
                           : d == '=' ? 'トイメンから'
                           :            'カミチャから' )
                        + (  jiagang        ? 'カカン'
                           : nn.length == 4 ? 'カン'
                           :                  'ポン' );
            mianzi.attr('aria-label', label);
            if (d == '+') mianzi.append(pai_s).append(pai_l).append(pai_r);
            if (d == '=') mianzi.append(pai_s).append(pai_r).append(pai_l);
            if (d == '-') mianzi.append(pai_r).append(pai_s).append(pai_l);
        }
        else {
            let nn = m.match(/\d(?=\-)/).concat(m.match(/\d(?!\-)/g));
            mianzi.attr('aria-label','チー')
                  .append($('<span class="rotate">')
                            .append(pai(s+nn[0])))
                  .append(pai(s+nn [1]))
                  .append(pai(s+nn [2]));
        }
        return mianzi;
    }
}

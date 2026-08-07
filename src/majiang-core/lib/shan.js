/*
 *  Majiang.Shan  (邳州麻将版)
 *
 *  120张牌：条(m) 筒(p) 万(s) 1-9 各4张 + 中发白(z5/z6/z7) 各4张
 *  无风牌、无赤牌、无宝牌。牌山保留 14 张底牌（7堆），摸完即流局。
 */
"use strict";

const Majiang = { Shoupai: require('./shoupai') };

module.exports = class Shan {

    constructor(rule) {

        this._rule = rule || {};

        let pai = [];
        for (let s of ['m','p','s']) {
            for (let n = 1; n <= 9; n++) {
                for (let i = 0; i < 4; i++) {
                    pai.push(s+n);
                }
            }
        }
        // 中发白 = z7(中) z5(白) z6(发)
        for (let n of [5, 6, 7]) {
            for (let i = 0; i < 4; i++) {
                pai.push('z'+n);
            }
        }

        this._pai = [];
        while (pai.length) {
            this._pai.push(pai.splice(Math.floor(Math.random()*pai.length), 1)[0]);
        }

        this._baopai     = [];
        this._fubaopai   = null;
        this._weikaigang = false;
        this._closed     = false;
    }

    zimo() {
        if (this._closed)     throw new Error(this);
        if (this.paishu == 0) throw new Error(this);
        if (this._weikaigang) throw new Error(this);
        return this._pai.pop();
    }

    gangzimo() {
        if (this._closed)     throw new Error(this);
        if (this.paishu == 0) throw new Error(this);
        if (this._weikaigang) throw new Error(this);
        this._weikaigang = false;
        return this._pai.shift();
    }

    kaigang() {
        this._weikaigang = false;
        return this;
    }

    close() { this._closed = true; return this }

    get paishu() { return this._pai.length - 14 }

    get baopai() { return [] }

    get fubaopai() { return null }
}

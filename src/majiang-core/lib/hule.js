/*
 *  Majiang.Util.hule  (邳州麻将·查胡麻将版)
 *
 *  和牌牌型：
 *    平胡   ：一对将 + 4面子（顺子/坎/杠）
 *    飘荤   ：无顺子，全部由对子/坎/杠组成（碰碰胡形）或七对子形
 *    塌牌   ：起手有杠，直接胡牌（荤10分 / 幺30分）
 *  计分（胡数/幺数体系）：
 *    胡牌者固定 +10 胡（底胡）
 *    幺头牌（1、9 的万筒条及中发白）：
 *      对子2胡，坎4胡1幺，送杠8胡2幺，自杠12胡3幺
 *    其他牌：
 *      对子1胡，坎2胡，送杠4胡，自杠6胡
 *    庄家胡数 ×2；飘荤胡数再 ×2（幺数永远不翻倍），额外每家 +30 荤底
 *    得分 = 胡数×胡底分 + 幺数×幺底分
 */
"use strict";

const Majiang = {
    rule: require('./rule')
};

/* ---------------- 和牌形枚举 ---------------- */

function mianzi(s, bingpai, n = 1) {

    if (n > 9) return [[]];

    if (bingpai[n] == 0) return mianzi(s, bingpai, n+1);

    let shunzi = [];
    if (n <= 7 && bingpai[n] > 0 && bingpai[n+1] > 0 && bingpai[n+2] > 0) {
        bingpai[n]--; bingpai[n+1]--; bingpai[n+2]--;
        shunzi = mianzi(s, bingpai, n);
        bingpai[n]++; bingpai[n+1]++; bingpai[n+2]++;
        for (let s_mianzi of shunzi) {
            s_mianzi.unshift(s+(n)+(n+1)+(n+2));
        }
    }

    let kezi = [];
    if (bingpai[n] == 3) {
        bingpai[n] -= 3;
        kezi = mianzi(s, bingpai, n+1);
        bingpai[n] += 3;
        for (let k_mianzi of kezi) {
            k_mianzi.unshift(s+n+n+n);
        }
    }

    return shunzi.concat(kezi);
}

function mianzi_all(shoupai) {

    let shupai_all = [[]];
    for (let s of ['m','p','s']) {
        let new_mianzi = [];
        for (let mm of shupai_all) {
            for (let nn of mianzi(s, shoupai._bingpai[s])) {
                new_mianzi.push(mm.concat(nn));
            }
        }
        shupai_all = new_mianzi;
    }

    let zipai = [];
    for (let n = 5; n <= 7; n++) {
        if (shoupai._bingpai.z[n] == 0) continue;
        if (shoupai._bingpai.z[n] != 3) return [];
        zipai.push('z'+n+n+n);
    }

    let fulou = shoupai._fulou.map(m => m.replace(/0/g,'5'));

    return shupai_all.map(shupai => shupai.concat(zipai).concat(fulou));
}

function add_hulepai(mianzi, p) {

    let [s, n, d] = p;
    let regexp   = new RegExp(`^(${s}.*${n})`);
    let replacer = `$1${d}!`;

    let new_mianzi = [];

    for (let i = 0; i < mianzi.length; i++) {
        if (mianzi[i].match(/[\+\=\-]|\d{4}/)) continue;
        if (i > 0 && mianzi[i] == mianzi[i-1]) continue;
        let m = mianzi[i].replace(regexp, replacer);
        if (m == mianzi[i]) continue;
        let tmp_mianzi = mianzi.concat();
        tmp_mianzi[i] = m;
        new_mianzi.push(tmp_mianzi);
    }

    return new_mianzi;
}

function hule_mianzi_yiban(shoupai, hulepai) {

    let mianzi = [];

    for (let s of ['m','p','s','z']) {
        let bingpai = shoupai._bingpai[s];
        for (let n = 1; n < bingpai.length; n++) {
            if (bingpai[n] < 2) continue;
            bingpai[n] -= 2;
            let jiangpai = s+n+n;
            for (let mm of mianzi_all(shoupai)) {
                mm.unshift(jiangpai);
                if (mm.length != 5) continue;
                mianzi = mianzi.concat(add_hulepai(mm, hulepai));
            }
            bingpai[n] += 2;
        }
    }

    return mianzi;
}

function hule_mianzi_qidui(shoupai, hulepai) {

    if (shoupai._fulou.length > 0) return [];

    let mianzi = [];

    for (let s of ['m','p','s','z']) {
        let bingpai = shoupai._bingpai[s];
        for (let n = 1; n < bingpai.length; n++) {
            if (bingpai[n] == 0) continue;
            if (bingpai[n] == 2) {
                let m = (s+n == hulepai.slice(0,2))
                            ? s+n+n + hulepai[2] + '!'
                            : s+n+n;
                mianzi.push(m);
            }
            else return [];
        }
    }

    return (mianzi.length == 7) ? [ mianzi ] : [];
}

function hule_mianzi(shoupai, rongpai) {

    let new_shoupai = shoupai.clone();
    if (rongpai) new_shoupai.zimo(rongpai);

    if (! new_shoupai._zimo || new_shoupai._zimo.length > 2) return [];
    let hulepai = (rongpai || new_shoupai._zimo + '_').replace(/0/,'5');

    return [].concat(hule_mianzi_yiban(new_shoupai, hulepai))
             .concat(hule_mianzi_qidui(new_shoupai, hulepai));
}

/* ---------------- 邳州麻将计分 ---------------- */

function yaojiu_pai(s, n) {
    return s == 'z' ? n >= 5 : n == 1 || n == 9;
}

/* 单张牌的胡数（对子用） */
function pai_hu(s, n) {
    return yaojiu_pai(s, n) ? 2 : 1;
}

/* 面子（顺子/坎/杠）的胡数与幺数 */
function mianzi_hu_yao(m, shoupai) {

    let h = m.replace(/0/g,'5');
    let dir = h.match(/[\+\=\-]/);
    let s = h[0];
    let nn = h.match(/\d/g).map(Number);

    if (nn.length == 3 && nn[0]+1 == nn[1] && nn[1]+1 == nn[2]) {
        return { hu: 0, yao: 0 };                       // 顺子不算胡
    }

    let yao = yaojiu_pai(s, nn[0]);

    if (nn.length == 3) {                               // 坎（含碰）
        return yao ? { hu: 4, yao: 1 } : { hu: 2, yao: 0 };
    }
    if (nn.length == 4) {                               // 杠
        if (! dir) {
            // 暗坎升级的明杠（自摸补第4张）→ 按明杠算；真暗杠 → 按自杠算
            if (shoupai && shoupai._mingang
                    && shoupai._mingang.find(x => x == m))
            {
                return yao ? { hu: 8, yao: 2 } : { hu: 4, yao: 0 };
            }
            return yao ? { hu: 12, yao: 3 } : { hu: 6, yao: 0 };
        }
        else {                                          // 送杠（明杠）
            return yao ? { hu: 8, yao: 2 } : { hu: 4, yao: 0 };
        }
    }
    throw new Error(m);
}

/*
 * 计算一种和牌形的胡数/幺数/牌型名
 * mianzi_list: 面子数组（一般形第0个为将牌，七对形全为对子）
 */
function calc_score(mianzi_list, shoupai, rongpai) {

    let n_shunzi = 0;
    let hu  = 0;
    let yao = 0;
    let is_qidui = mianzi_list.length == 7;

    // 七对形：7个对子都是将
    if (is_qidui) {
        for (let i = 0; i < mianzi_list.length; i++) {
            let m = mianzi_list[i].replace(/!$/,'');
            let h = m.replace(/0/g,'5');
            hu += pai_hu(h[0], +h[1]);
        }
        return { hu, yao, is_piaohun: true, is_qidui: true };
    }

    // 一般形：将牌（第0个）+ 4面子
    let jiang = mianzi_list[0];
    let jiang_zimo = ! rongpai && jiang.includes('!');  // 将牌为自摸张（点炮不算自摸）
    if (jiang_zimo) {
        // 听2对：将牌自摸 幺九 4胡1幺 / 2-8 2胡（权威规则：自摸算4胡1幺/2胡）
        let yao_p = yaojiu_pai(jiang[0], +jiang[1]);
        hu += yao_p ? 4 : 2;
        yao += yao_p ? 1 : 0;
    }
    else {
        hu += pai_hu(jiang[0], +jiang[1]);      // 将牌点炮/查胡：幺九 2 / 2-8 1
    }

    for (let i = 1; i < mianzi_list.length; i++) {
        let m = mianzi_list[i].replace(/!$/,'');
        let h = m.replace(/0/g,'5');
        let nn = h.match(/\d/g).map(Number);
        if (nn.length == 3 && nn[0]+1 == nn[1] && nn[1]+1 == nn[2]) {
            n_shunzi++;
        }
        let rv = mianzi_hu_yao(m, shoupai);
        hu  += rv.hu;
        yao += rv.yao;
    }

    // 飘荤 = 无顺子（碰碰胡）或七对子
    let is_piaohun = is_qidui || n_shunzi == 0;

    return { hu, yao, is_piaohun, is_qidui };
}

function get_hupai_name(score, param) {

    let name;
    if (param.hupai && param.hupai.qipai_gang) {
        name = '塌牌';
    }
    else if (score.is_qidui) {
        name = '飘荤(七对)';
    }
    else if (score.is_piaohun) {
        name = '飘荤';
    }
    else {
        name = '平胡';
    }
    return name;
}

function get_defen(score, param, rongpai) {

    let rule   = param.rule;
    let menfeng = param.menfeng;
    let zhuang = menfeng == (param.zhuang_seat ?? 0);   // 胡牌者是否本局庄家

    let hu_difen = rule['胡底分'] ?? 1;
    let yao_difen= rule['幺底分'] ?? 10;
    let hun_di   = rule['荤底']   ?? 30;
    let di_hu    = rule['底胡']   ?? 10;

    let is_piaohun = score.is_piaohun;
    let qipai_gang = param.hupai && param.hupai.qipai_gang;

    let hu_shu, yao_shu, V_huler;

    if (qipai_gang) {
        // 塌牌（炸）：2-8 炸 10 分，幺九炸 40 分；庄闲都不翻倍（炸不连庄见 game.js）
        let has_yaojiu = hand_has_yaojiu(param);
        V_huler = has_yaojiu ? 40 : 10;
        hu_shu  = V_huler;
        yao_shu = 0;
    }
    else {
        hu_shu = di_hu + score.hu;          // 底胡 + 面子胡数
        yao_shu= score.yao;

        // 倍数：庄家 ×2，飘荤再 ×2（胡数翻倍，幺数不翻倍）
        let mul = 1;
        if (is_piaohun) mul *= 2;
        if (zhuang)     mul *= 2;

        V_huler = (hu_shu * mul) * hu_difen + yao_shu * yao_difen;

        // 飘荤：额外每家加荤底（胡牌者共多得 3×荤底）
        if (is_piaohun) V_huler += hun_di * 3;
    }

    /* 查胡：每局结束后 4 家分别亮牌算胡数，两两差额结算 */
    let V = [0, 0, 0, 0];
    V[menfeng] = V_huler;

    if (param.cha_hu) {
        for (let l = 0; l < 4; l++) {
            if (l == menfeng) continue;
            let shoupai = param.cha_hu[l];
            if (! shoupai) continue;
            let ch = calc_cha_hu(shoupai);
            V[l] = ch.hu * hu_difen + ch.yao * yao_difen;
        }
    }

    let fenpei = cha_hu_fenpei(V, param, rongpai);

    return { defen: V_huler, hu_shu, yao_shu, is_piaohun, fenpei,
             V: V };
}

/*
 * 查胡：计算未胡牌者的手牌胡数/幺数
 * 吃掉的顺子不算胡，只算手中的对子/坎/杠 及 副露的碰/杠
 * 三张同牌默认"不坎"（只算对子+单张）；
 * 玩家行牌中主动"坎"过的（_kan 标记），按坎计分（4胡/2胡 + 1幺）
 */
function calc_cha_hu(shoupai) {

    let hu = 0, yao = 0;

    // 副露面子
    for (let m of shoupai._fulou) {
        let h = m.replace(/0/g,'5');
        let dir = h.match(/[\+\=\-]/);
        let nn = h.match(/\d/g).map(Number);
        if (! nn || nn.length < 3) continue;
        if (nn.length == 3 && nn[0]+1 == nn[1] && nn[1]+1 == nn[2]) continue;
        let yao_p = yaojiu_pai(h[0], nn[0]);
        if (nn.length == 4) {                       // 杠
            if (dir) { hu += yao_p ? 8 : 4;  yao += yao_p ? 2 : 0; }  // 送杠（明杠）
            else if (shoupai._mingang
                        && shoupai._mingang.find(x => x == m)) {
                                                    // 暗坎升级的明杠（自摸补第4张）
                hu += yao_p ? 8 : 4;
                yao += yao_p ? 2 : 0;
            }
            else     { hu += yao_p ? 12 : 6; yao += yao_p ? 3 : 0; }  // 自杠（暗杠）
        }
        else {                                      // 坎（碰）
            hu += yao_p ? 4 : 2;
            yao += yao_p ? 1 : 0;
        }
    }

    // 手中牌（坎过的已作为暗坎面子在 _fulou 中计分）
    for (let s of ['m','p','s','z']) {
        let bingpai = shoupai._bingpai[s];
        for (let n = 1; n < bingpai.length; n++) {
            let c = bingpai[n];
            if (c == 0) continue;
            let yao_p = yaojiu_pai(s, n);
            if      (c >= 4) {                                   // 自杠
                hu += yao_p ? 12 : 6;
                yao += yao_p ? 3 : 0;
            }
            else if (c == 3) {                                   // 未坎：对子+单张
                hu += yao_p ? 2 : 1;
            }
            else if (c == 2) {                                   // 对子
                hu += yao_p ? 2 : 1;
            }
        }
    }

    return { hu, yao };
}

/*
 * 查胡差额结算：4 家两两结算胡数差，净额 = 4×V[i] - ΣV
 * 包庄：包庄者一人支付胡牌者应收的三家差额
 */
function cha_hu_fenpei(V, param, rongpai) {

    let fenpei = [0,0,0,0];
    let menfeng = param.menfeng;

    let baojia = param.baojia;

    if (baojia != null && rongpai) {
        // 包庄：胡牌者应收三家差额（V_huler > 各家才收），由包庄者一人付
        let D = 0;
        for (let l = 0; l < 4; l++) {
            if (l == menfeng) continue;
            let d = V[menfeng] - V[l];
            if (d > 0) D += d;
        }
        fenpei[menfeng] += D;
        fenpei[baojia]  -= D;
        // 其他两家之间照常按差额结算
        let rest = [0,1,2,3].filter(l => l != menfeng && l != baojia);
        let a = rest[0], b = rest[1];
        if (V[a] > V[b]) { fenpei[a] += V[a]-V[b]; fenpei[b] -= V[a]-V[b]; }
        else             { fenpei[b] += V[b]-V[a]; fenpei[a] -= V[b]-V[a]; }
        return fenpei;
    }

    // 普通查胡：4家两两差额
    let sum = V.reduce((x,y)=>x+y, 0);
    for (let l = 0; l < 4; l++) {
        fenpei[l] += 4 * V[l] - sum;
    }

    return fenpei;
}

function hand_has_yaojiu(param) {
    // 塌牌时判断起手杠（炸）的牌是否幺九（1、9、中发白）
    // 权威规则：起手杠按杠的那张牌算 —— 2-8 炸 10 分，幺九炸 40 分
    let shoupai = param._shoupai;
    if (! shoupai) return false;
    for (let s of ['m','p','s']) {
        for (let n = 1; n <= 9; n++) {
            if (shoupai._bingpai[s][n] >= 4
                    && (n == 1 || n == 9)) return true;
        }
    }
    for (let n = 5; n <= 7; n++) {
        if (shoupai._bingpai.z[n] >= 4) return true;
    }
    return false;
}

/* ---------------- 主函数 ---------------- */

function hule(shoupai, rongpai, param) {

    if (rongpai) {
        if (! rongpai.match(/[\+\=\-]$/)) throw new Error(rongpai);
        rongpai = rongpai.slice(0,2) + rongpai.slice(-1);
    }

    param._shoupai = shoupai;

    let max;

    // 塌牌：起手杠直接胡
    if (param.hupai && param.hupai.qipai_gang) {
        let rv = get_defen({ hu: 0, yao: 0, is_piaohun: false, is_qidui: false },
                           param, rongpai);
        return {
            hupai:  [{ name: '塌牌', fanshu: 1 }],
            fu:     rv.defen,
            fanshu: 0,
            defen:  rv.defen,
            fenpei: rv.fenpei,
            hu_shu: rv.hu_shu,
            yao_shu: 0
        };
    }

    for (let mianzi_list of hule_mianzi(shoupai, rongpai)) {

        let score  = calc_score(mianzi_list, shoupai, rongpai);
        let name   = get_hupai_name(score, param);
        let rv     = get_defen(score, param, rongpai);

        let hupai = [{ name: name, fanshu: score.is_piaohun ? 2 : 1 }];
        let defen = rv.defen;

        if (! max || defen > max.defen) {
            max = {
                hupai:  hupai,
                fu:     rv.hu_shu,        // 胡数
                fanshu: rv.yao_shu,       // 幺数
                defen:  defen,
                fenpei: rv.fenpei,
                hu_shu: rv.hu_shu,
                yao_shu: rv.yao_shu
            };
        }
    }

    return max;
}

function hule_param(param = {}) {

    let rv = {
        rule:           param.rule       ?? Majiang.rule(),
        zhuangfeng:     param.zhuangfeng ?? 0,
        menfeng:        param.menfeng    ?? 1,
        hupai: {
            lizhi:      param.lizhi      ?? 0,
            yifa:       param.yifa       ?? false,
            qianggang:  param.qianggang  ?? false,
            lingshang:  param.lingshang  ?? false,
            haidi:      param.haidi      ?? 0,
            tianhu:     param.tianhu     ?? 0,
            qipai_gang: param.qipai_gang ?? false
        },
        baopai:         param.baopai   ? [].concat(param.baopai)   : [],
        fubaopai:       param.fubaopai ? [].concat(param.fubaopai) : null,
        jicun: {
            changbang:  param.changbang  ?? 0,
            lizhibang:  param.lizhibang  ?? 0
        }
    };

    return rv;
}

module.exports = {
    hule:        hule,
    hule_param:  hule_param,
    hule_mianzi: hule_mianzi,
};

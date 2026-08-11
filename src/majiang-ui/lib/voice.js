/*
 *  Majiang.UI.voice  (邳州麻将报牌语音)
 *
 *  出什么牌播什么语音；吃/碰/坎/胡/自摸等播报动作词。
 *  语音来源：八大碗麻将 APK 提取（邳州男/女声，WAV）
 */
"use strict";

/* 牌 → 语音文件名映射（z5=白板 z6=发财 z7=红中） */
const PAI_MAP = {
    m: n => 'wan_'  + n,
    p: n => 'bing_' + n,
    s: n => 'tiao_' + n,
    z: n => n == 5 ? 'baiban' : n == 6 ? 'facai' : n == 7 ? 'hongzhong' : null,
};

/* 动作 → 语音文件名（随机变体） */
const ACTION_MAP = {
    chi:   ['chi'],
    peng:  ['peng'],
    gang:  ['kanzi', 'zikai'],     // 杠：坎子/自开 随机
    rong:  ['hu'],
    zimo:  ['zimo'],
    luoyi: ['luoyi'],
    guanmen:['guanmen'],
    tale:  ['tale'],
};

const SEX_DIR = { M: 'M', W: 'W' };

const _cache = {};       // 已加载的 Audio 缓存
let _sex = 'M';          // 当前音色：M=男声 W=女声

function load(file) {
    if (_cache[file]) return _cache[file];
    let a = new Audio('audio/voice/' + _sex + '/' + file + '.wav');
    a.volume = 1;
    _cache[file] = a;
    return a;
}

/* 随机取一个变体文件（同名文件取 1~N） */
function random_variant(base) {
    // 最多尝试 4 个变体
    for (let n = 4; n >= 1; n--) {
        let f = base + '_' + n;
        if (_cache[f] || _exists(f)) return f;
    }
    return base + '_1';
}
function _exists(file) {
    let a = new Audio('audio/voice/' + _sex + '/' + file + '.wav');
    a.onerror = ()=> { delete _cache[file]; };
    _cache[file] = a;
    return true;   // 存在性由 play 时容错（onerror 静默）
}

function play(file) {
    try {
        let a = load(file);
        a.currentTime = 0;
        a.play().catch(()=>{});
    }
    catch (e) { /* 静默失败 */ }
}

const voice = {

    set_sex(sex) {
        if (SEX_DIR[sex]) _sex = sex;
    },

    /* 播报牌名：p = 'm1'/'p5'/'s8'/'z7' */
    pai(p) {
        let s = p[0], n = +p[1] || 5;
        let base = PAI_MAP[s] && PAI_MAP[s](n);
        if (! base) return;
        let file = random_variant(base);
        play(file);
    },

    /* 播报动作：name = chi/peng/gang/rong/zimo/luoyi/guanmen/tale */
    action(name) {
        let list = ACTION_MAP[name];
        if (! list) return;
        let base = list[Math.floor(Math.random() * list.length)];
        play(random_variant(base));
    },
};

module.exports = voice;

/*
 *  Majiang.UI.voice  (邳州麻将报牌语音)
 *
 *  出什么牌播什么语音；吃/碰/坎/胡/自摸等播报动作词。
 *  语音来源：八大碗麻将 APK 提取（邳州男/女声，WAV）
 *  文件命名：BDW_F_MJ_PZ_{M|W}_牌名_变体号.wav
 */
"use strict";

const MANIFEST = require('./voice_manifest');

/* 牌 → 语音文件名（z5=白板 z6=发财 z7=红中） */
const PAI_MAP = {
    m: n => 'wan_'  + n,
    p: n => 'bing_' + n,
    s: n => 'tiao_' + n,
    z: n => n == 5 ? 'baiban' : n == 6 ? 'facai' : n == 7 ? 'hongzhong' : null,
};

/* 动作 → 语音基名（多个时随机） */
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

const PREFIX = { M: 'BDW_F_MJ_PZ_M_', W: 'BDW_F_MJ_PZ_W_' };

const _cache = {};
let _sex = 'M';          // 当前音色：M=男声 W=女声

/* 取某基名的实际文件名（从 manifest 随机选一个存在的变体） */
function pick_file(base) {
    let list = MANIFEST[_sex] && MANIFEST[_sex][base];
    if (! list || ! list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function play(file) {
    if (! file) return;
    let key = _sex + '/' + file;
    let a = _cache[key] || (_cache[key] = new Audio(
        'audio/voice/' + _sex + '/' + PREFIX[_sex] + file + '.wav'));
    try {
        a.volume = 1;
        a.currentTime = 0;
        let p = a.play();
        if (p && p.catch) p.catch(()=>{});
    }
    catch (e) { /* 浏览器自动播放限制等，静默 */ }
}

const voice = {

    set_sex(sex) {
        if (PREFIX[sex]) _sex = sex;
    },

    /* 播报牌名：p = 'm1'/'p5'/'s8'/'z7'（含 _ 等尾标记时取前两位） */
    pai(p) {
        let s = p[0], n = +p[1] || 5;
        let base = PAI_MAP[s] && PAI_MAP[s](n);
        play(pick_file(base));
    },

    /* 播报动作：name = chi/peng/gang/rong/zimo/luoyi/guanmen/tale */
    action(name) {
        let list = ACTION_MAP[name];
        if (! list) return;
        let base = list[Math.floor(Math.random() * list.length)];
        play(pick_file(base));
    },
};

module.exports = voice;

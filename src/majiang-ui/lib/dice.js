/*
 *  dice.js  开局掷骰子动画（邳州麻将）
 *
 *  全屏半透明遮罩 + 两枚 CSS 骰子：
 *    滚动 1.6s（面随机切换） → 定格显示真实点数 0.5s → 淡出 0.3s
 *  总时长约 2.4s，与 player.js action_kaiju 的延迟一致
 */
"use strict";

const DICE_ANIM_MS = 2400;

let _style_injected = false;
let _playing = false;

/* 3x3 网格骰子点布局：位置 0-8（行优先），返回该点数哪些格子有点 */
const DICE_DOTS = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
};

function inject_style() {
    if (_style_injected) return;
    _style_injected = true;
    const css = `
.mj-dice-mask{position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,20,10,.55);z-index:10000;display:flex;
    flex-direction:column;justify-content:center;align-items:center;
    opacity:1;transition:opacity .3s ease;}
.mj-dice-mask.fade{opacity:0;}
.mj-dice-title{color:#ffe9a8;font-size:30px;letter-spacing:4px;
    margin-bottom:36px;text-shadow:0 2px 6px rgba(0,0,0,.5);}
.mj-dice-box{display:flex;gap:28px;}
.mj-dice{width:64px;height:64px;background:#fff;border-radius:12px;
    box-shadow:0 6px 18px rgba(0,0,0,.45), inset 0 -3px 0 rgba(0,0,0,.08);
    display:grid;grid-template-columns:repeat(3,1fr);
    grid-template-rows:repeat(3,1fr);padding:7px;box-sizing:border-box;}
.mj-dice .d{display:flex;justify-content:center;align-items:center;}
.mj-dice .d i{width:9px;height:9px;border-radius:50%;background:#222;}
.mj-dice.shake{animation:mj-dice-shake 1.6s ease-in-out;}
@keyframes mj-dice-shake{
    0%{transform:rotate(0deg) translateY(0);}
    15%{transform:rotate(120deg) translateY(-10px);}
    35%{transform:rotate(240deg) translateY(8px);}
    55%{transform:rotate(400deg) translateY(-12px);}
    75%{transform:rotate(560deg) translateY(6px);}
    100%{transform:rotate(720deg) translateY(0);}
}
.mj-dice.hit{animation:mj-dice-hit .3s ease-out;}
@keyframes mj-dice-hit{
    0%{transform:scale(1.25);}100%{transform:scale(1);}
}
`;
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
}

/* 渲染一枚骰子（value 1-6） */
function render_dice(value) {
    const d = document.createElement('div');
    d.className = 'mj-dice';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'd';
        if (DICE_DOTS[value] && DICE_DOTS[value].indexOf(i) >= 0) {
            cell.appendChild(document.createElement('i'));
        }
        d.appendChild(cell);
    }
    return d;
}

/**
 * 播放掷骰子动画
 * @param {number} d1 第一个骰子真实点数
 * @param {number} d2 第二个骰子真实点数
 * @param {function} [done] 动画结束回调
 */
function play(d1, d2, done) {
    if (_playing) { if (done) done(); return; }
    _playing = true;
    inject_style();

    // 遮罩
    const mask = document.createElement('div');
    mask.className = 'mj-dice-mask';
    const title = document.createElement('div');
    title.className = 'mj-dice-title';
    title.textContent = '掷 骰 定 庄';
    mask.appendChild(title);
    const box = document.createElement('div');
    box.className = 'mj-dice-box';
    const die1 = render_dice(1);
    const die2 = render_dice(2);
    die1.classList.add('shake');
    die2.classList.add('shake');
    box.appendChild(die1);
    box.appendChild(die2);
    mask.appendChild(box);
    document.body.appendChild(mask);

    // 滚动阶段：随机切换点数
    const roll = setInterval(()=>{
        if (die1.classList.contains('shake') == false) return;
        die1.innerHTML = render_dice(1 + Math.floor(Math.random()*6)).innerHTML;
        die2.innerHTML = render_dice(1 + Math.floor(Math.random()*6)).innerHTML;
    }, 80);

    // 1.6s 后定格真实点数
    setTimeout(()=>{
        clearInterval(roll);
        die1.classList.remove('shake');
        die2.classList.remove('shake');
        die1.innerHTML = render_dice(d1).innerHTML;
        die2.innerHTML = render_dice(d2).innerHTML;
        die1.classList.add('hit');
        die2.classList.add('hit');
    }, 1600);

    // 2.1s 后开始淡出，2.4s 移除
    setTimeout(()=> mask.classList.add('fade'), 2100);
    setTimeout(()=>{
        if (mask.parentNode) mask.parentNode.removeChild(mask);
        _playing = false;
        if (done) done();
    }, DICE_ANIM_MS);
}

module.exports = { play, DICE_ANIM_MS };

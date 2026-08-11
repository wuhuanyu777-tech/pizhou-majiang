/* 邳州查胡规则引擎验证脚本（手牌格式：花色在前，如 m123p456s789z777m55） */
"use strict";
const Majiang = {
    rule:    require('./src/majiang-core/lib/rule'),
    Shoupai: require('./src/majiang-core/lib/shoupai'),
    Shan:    require('./src/majiang-core/lib/shan'),
    Util:    Object.assign(require('./src/majiang-core/lib/xiangting'),
                           require('./src/majiang-core/lib/hule'))
};

let n_ok = 0, n_fail = 0;
function check(name, actual, expect) {
    let ok = JSON.stringify(actual) === JSON.stringify(expect);
    if (ok) n_ok++; else n_fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
    if (!ok) { console.log(`      期望: ${JSON.stringify(expect)}`); console.log(`      实际: ${JSON.stringify(actual)}`); }
}

/* 1. 牌山：120 张、无风牌、流局剩 16 张 */
{
    let shan = new Majiang.Shan();
    check('牌山 120 张(含16底)', shan.paishu + 16, 120);
    check('可摸 104 张', shan.paishu, 104);
    let all = [];
    for (let i = 0; i < shan.paishu; i++) all.push(shan.zimo());
    check('无风牌(z1-z4)', all.some(p => /^z[1-4]/.test(p)), false);
    check('有中发白(z5-z7)', all.some(p => /^z[5-7]/.test(p)), true);
}

let base = { rule: Majiang.rule(), menfeng: 1, zhuang_seat: 0, hupai: {} };
function hule_of(s, opt = {}) {
    let sp = Majiang.Shoupai.fromString(s);
    return Majiang.Util.hule(sp, null, Object.assign({}, base, opt));
}

/* 2. 平胡（闲家）：m123 p456 s789 z777(中坎) m55 将 */
{
    let h = hule_of('m123p456s789z777m55m5');
    check('平胡可胡', !!h, true);
    if (h) { check('平胡名称', h.hupai[0].name, '平胡');
             check('平胡分值(闲)=16胡1幺=26(将自摸2胡)', h.defen, 26); }
}

/* 3. 平胡（庄家）：胡数×2 */
{
    let h = hule_of('m123p456s789z777m55m5', { menfeng: 0, zhuang_seat: 0 });
    check('平胡分值(庄)=32胡1幺=42(将自摸2胡)', h && h.defen, 42);
}

/* 4. 飘荤（碰碰胡）：m111 p222 s333 p444 + m55 */
{
    let h = hule_of('m111p222s333p444m55m5');
    check('飘荤可胡', !!h, true);
    if (h) { check('飘荤名称', h.hupai[0].name, '飘荤');
             check('飘荤分值=44胡1幺+90=144(将自摸2胡)', h.defen, 144); }
}

/* 5. 七对 */
{
    let h = hule_of('m11m22p33p44s55s66s77');
    check('七对可胡', !!h, true);
    if (h) check('七对名称', h.hupai[0].name, '飘荤(七对)');
}

/* 6. 塌牌（炸）：按杠牌判幺九，庄闲都不翻倍 */
{
    let h2m = hule_of('m2222p111s333m44p55', { menfeng: 0, zhuang_seat: 0, hupai: { qipai_gang: true } });
    check('塌牌 2m杠(庄)=10', h2m && h2m.defen, 10);
    let h1m = hule_of('m1111p222s333m44p55', { menfeng: 0, zhuang_seat: 0, hupai: { qipai_gang: true } });
    check('塌牌 1m杠(庄)=40', h1m && h1m.defen, 40);
    let hz7 = hule_of('z7777m222p333m44p55', { menfeng: 0, zhuang_seat: 0, hupai: { qipai_gang: true } });
    check('塌牌 z7杠(庄)=40', hz7 && hz7.defen, 40);
    let hx = hule_of('m1111p222s333m44p55', { menfeng: 1, hupai: { qipai_gang: true } });
    check('塌牌 1m杠(闲)=40', hx && hx.defen, 40);
}

/* 7. 幺九坎计分：m123 p111(1p坎) s789 m999(9m坎) + m55 */
{
    let h = hule_of('m123p111s789m999m55');
    check('幺九坎可胡', !!h, true);
    if (h) check('幺九坎分值=20胡2幺=40(将自摸2胡)', h.defen, 40);
}

/* 8. 非胡牌型 */
{
    let h = hule_of('m123p456s789z777m56');
    check('非胡牌不可胡', h === undefined, true);
}

/* 9. 查胡结算：fenpei 两两差额，总和为 0 */
{
    let sp = Majiang.Shoupai.fromString('m123p456s789z777m55m5');
    let h = Majiang.Util.hule(sp, null, Object.assign({}, base, { cha_hu: [sp, sp, sp, sp] }));
    if (h) {
        check('查胡 fenpei 长度 4', h.fenpei.length, 4);
        check('查胡 fenpei 总和为 0', h.fenpei.reduce((a,b)=>a+b,0), 0);
    }
}

console.log(`\n结果: ${n_ok} 通过, ${n_fail} 失败`);
process.exit(n_fail ? 1 : 0);

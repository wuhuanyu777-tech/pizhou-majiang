/*
 * build-css.js  — 编译 stylus 输出到 dist/css/majiang-<version>.css
 *
 * 替代原硬编码版本号的 stylus CLI 调用，让 CSS 文件名跟随 package.json 的 version 字段，
 * 与 build:html (pug → version.pug) 和 build:js (webpack → [name]-${version}.js) 保持一致。
 */
const stylus = require('stylus');
const fs     = require('fs');
const path   = require('path');
const pkg    = require('./package.json');

const src  = path.resolve('src/css/index.styl');
const out  = path.resolve(`dist/css/majiang-${pkg.version}.css`);
const text = fs.readFileSync(src, 'utf8');

// 关键：set('filename', src) 让 stylus 正确解析 @import 相对路径（entry point 的绝对路径）
stylus(text).set('filename', src).render((err, css) => {
    if (err) { console.error('stylus 编译失败:', err); process.exit(1); }
    fs.writeFileSync(out, css);
    console.log(`compiled ${out}`);
});
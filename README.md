# 邳州麻将（查胡麻将）HTML5

基于 [kobalab/Majiang](https://github.com/kobalab/Majiang)（電脳麻将，MIT License）改造的邳州本地麻将，纯前端 HTML5 + JavaScript 实现，无需后端即可运行。

## 玩法特色

- **查胡麻将规则**：120 张牌 · 胡数/幺数计分 · 飘荤/塌牌/包庄
- **单机人机对战**：你 + 3 个 AI
- **自动演示**：4 个 AI 自动对局，观战模式
- 本地无需服务器，静态页面直接跑

## 快速开始

需要 Node.js（>= 18）。

```bash
# 安装依赖
npm install

# 构建（HTML + CSS + JS）
npm run build

# 方式一：起本地静态服务器后浏览器访问
cd dist
python -m http.server 8123
# 打开 http://127.0.0.1:8123
```

| 页面 | 说明 |
|------|------|
| `index.html` | 主页，点「开始游戏」进入人机对战 |
| `autoplay.html` | 自动演示（4 个 AI 自己打） |
| `rule.html` / `paipu.html` / `hule.html` / `drill.html` 等 | 规则、牌谱、计分、练习等工具页 |

## 技术栈

- 构建：`pug`（HTML 模板）+ `stylus`（CSS）+ `webpack`（JS 打包）
- 依赖：`jquery` + 三个本地子包 `majiang-core`（引擎）/ `majiang-ai`（AI）/ `majiang-ui`（界面）

## 目录结构

```
├── src/
│   ├── js/               应用主程序（页面逻辑）
│   ├── html/             pug 模板（page/ 页面 + inc/ 片段）
│   ├── css/              stylus 样式
│   ├── majiang-core/     麻将引擎（手牌/牌山/向听/和了计算）
│   ├── majiang-ai/       AI 思考逻辑
│   └── majiang-ui/       界面渲染（牌面/棋盘/牌谱）
├── dist/                 构建产物
└── package.json
```

## 界面定制（本仓库已改）

- 玩家名旁的门风徽章只保留庄家「庄」字（去掉东/南/西/北金色字）
- 玩家信息条去掉了黑底、边框和阴影
- 主页去掉了「打几圈」下拉选择框（默认 2 圈 8 局）

## 版权与许可

本项目基于 [kobalab/Majiang](https://github.com/kobalab/Majiang)（MIT License，作者 Satoshi Kobayashi）改造，遵循 MIT 协议。

## 联系

- 微信号：**Air20222222**

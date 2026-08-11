/*
 *  Majiang.Game  (邳州麻将·查胡麻将版)
 *
 *  流程特色：
 *    - 起手杠（塌牌）可直接胡牌
 *    - 起手第一巡每家打出同一张牌 → 流局
 *    - 牌山只剩7堆（14张）→ 流局
 *    - 非庄家胡牌 → 轮庄；庄家胡牌 → 连庄；流局 → 轮庄
 *    - 胡牌者固定 +10 胡，庄家胡数 ×2，飘荤胡数 ×2 并每家 +30 荤底
 *    - 包庄：单调胡被放枪（手牌4面子+1单张）→ 放枪者包庄
 */
"use strict";

const Majiang = {
    rule:    require('./rule'),
    Shoupai: require('./shoupai'),
    Shan:    require('./shan'),
    He:      require('./he'),
    Util:    Object.assign(require('./xiangting'),
                           require('./hule'))
};

module.exports = class Game {

    constructor(players, callback, rule, title) {

        this._players  = players;
        this._callback = callback || (()=>{});
        this._rule     = rule || Majiang.rule();

        this._model = {
            title:      title || '邳州麻将\n' + new Date().toLocaleString(),
            player:     ['我','下家','对家','上家'],
            qijia:      0,
            zhuangfeng: 0,
            jushu:      0,
            changbang:  0,
            lizhibang:  0,
            defen:      [0,0,0,0].map(x=>this._rule['配給原点']),
            shan:       null,
            shoupai:    [],
            he:         [],
            player_id:  [ 0, 1, 2, 3 ]
        };

        this._view;

        this._status;
        this._reply = [];

        this._sync  = false;
        this._stop  = null;
        this._speed = 3;
        this._wait  = 0;
        this._timeout_id;

        this._handler;
    }

    get model()      { return this._model  }
    set view(view)   { this._view = view   }
    get speed()      { return this._speed  }
    set speed(speed) { this._speed = speed }
    set wait(wait)   { this._wait = wait   }

    set handler(callback) { this._handler = callback }

    add_paipu(paipu) {
        this._paipu.log[this._paipu.log.length - 1].push(paipu);
    }

    delay(callback, timeout) {

        if (this._sync) return callback();

        timeout = this._speed == 0 ? 0
                : timeout == null  ? Math.max(500, this._speed * 200)
                :                    timeout;
        setTimeout(callback, timeout);
    }

    say(name, l) {
        if (this._view) this._view.say(name, l);
    }

    stop(callback = ()=>{}) {
        this._stop = callback;
    }

    start() {
        if (this._timeout_id) return;
        this._stop = null;
        this._timeout_id = setTimeout(()=>this.next(), 0);
    }

    notify_players(type, msg) {

        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            if (this._sync)
                    this._players[id].action(msg[l]);
            else    setTimeout(()=>{
                        this._players[id].action(msg[l]);
                    }, 0);
        }
    }

    call_players(type, msg, timeout) {

        timeout = this._speed == 0 ? 0
                : timeout == null  ? this._speed * 200
                :                    timeout;
        this._status = type;
        this._reply  = [];
        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            if (this._sync)
                    this._players[id].action(
                            msg[l], reply => this.reply(id, reply));
            else    setTimeout(()=>{
                        this._players[id].action(
                            msg[l], reply => this.reply(id, reply));
                    }, 0);
        }
        if (! this._sync)
                this._timeout_id = setTimeout(()=>this.next(), timeout);
    }

    reply(id, reply) {
        this._reply[id] = reply || {};
        if (this._sync) return;
        if (this._reply.filter(x=>x).length < 4) return;
        if (! this._timeout_id)
                this._timeout_id = setTimeout(()=>this.next(), 0);
    }

    next() {
        this._timeout_id = clearTimeout(this._timeout_id);
        if (this._reply.filter(x=>x).length < 4) return;
        if (this._stop) return this._stop();

        if      (this._status == 'kaiju')    this.reply_kaiju();
        else if (this._status == 'qipai')    this.reply_qipai();
        else if (this._status == 'zimo')     this.reply_zimo();
        else if (this._status == 'dapai')    this.reply_dapai();
        else if (this._status == 'fulou')    this.reply_fulou();
        else if (this._status == 'gang')     this.reply_gang();
        else if (this._status == 'gangzimo') this.reply_zimo();
        else if (this._status == 'hule')     this.reply_hule();
        else if (this._status == 'pingju')   this.reply_pingju();
        else                                 this._callback(this._paipu);
    }

    do_sync() {

        this._sync  = true;

        this.kaiju();

        for (;;) {
            if      (this._status == 'kaiju')    this.reply_kaiju();
            else if (this._status == 'qipai')    this.reply_qipai();
            else if (this._status == 'zimo')     this.reply_zimo();
            else if (this._status == 'dapai')    this.reply_dapai();
            else if (this._status == 'fulou')    this.reply_fulou();
            else if (this._status == 'gang')     this.reply_gang();
            else if (this._status == 'gangzimo') this.reply_zimo();
            else if (this._status == 'hule')     this.reply_hule();
            else if (this._status == 'pingju')   this.reply_pingju();
            else                                 break;
        }

        this._callback(this._paipu);

        return this;
    }

    kaiju(qijia) {

        this._model.qijia = qijia ?? Math.floor(Math.random() * 4);

        this._max_jushu = this._rule['場数'] == 0 ? 0
                        : this._rule['場数'] * 4 - 1;

        this._paipu = {
            title:  this._model.title,
            player: this._model.player,
            qijia:  this._model.qijia,
            log:    [],
            defen:  this._model.defen.concat(),
            point:  [],
            rank:   []
        };

        let msg = [];
        for (let id = 0; id < 4; id++) {
            msg[id] = JSON.parse(JSON.stringify({
                kaiju: {
                    id:     id,
                    rule:   this._rule,
                    title:  this._paipu.title,
                    player: this._paipu.player,
                    qijia:  this._paipu.qijia
                }
            }));
        }
        this.call_players('kaiju', msg, 0);

        if (this._view) this._view.kaiju();
    }

    qipai(shan) {

        let model = this._model;

        model.shan = shan || new Majiang.Shan(this._rule);
        for (let l = 0; l < 4; l++) {
            let qipai = [];
            for (let i = 0; i < 13; i++) {
                qipai.push(model.shan.zimo());
            }
            model.shoupai[l]   = new Majiang.Shoupai(qipai);
            model.he[l]        = new Majiang.He();
            // 座位固定：玩家不换座；第 jushu 局庄家座位 = jushu（东→南→西→北轮转）
            model.player_id[l] = (model.qijia + l) % 4;
        }
        // 庄家（座位 jushu）先摸牌：lunban 先置为庄家的上一家，zimo() 会 +1 到庄家
        model.lunban = (5 - model.jushu) % 4;

        this._diyizimo = true;
        this._qipai_gang = [0,0,0,0];       // 起手杠（塌牌）标记
        this._has_dapai   = [0,0,0,0];      // 是否已打过牌
        this._qipai_dou   = true;           // 起手同牌流局标记
        this._dapai_first = null;           // 第一巡首张打出牌

        this._dapai = null;
        this._gang  = null;

        this._n_gang    = [ 0, 0, 0, 0 ];
        this._neng_rong = [ 1, 1, 1, 1 ];

        this._hule        = [];
        this._hule_option = null;
        this._no_game     = false;
        this._lianzhuang  = false;
        this._changbang   = model.changbang;
        this._fenpei      = null;

        this._paipu.defen = model.defen.concat();
        this._paipu.log.push([]);
        let paipu = {
            qipai: {
                zhuangfeng: model.zhuangfeng,
                jushu:      model.jushu,
                changbang:  model.changbang,
                lizhibang:  model.lizhibang,
                defen:      model.player_id.map(id => model.defen[id]),
                shoupai:    model.shoupai.map(shoupai => shoupai.toString())
            }
        };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            for (let i = 0; i < 4; i++) {
                if (i != l) msg[l].qipai.shoupai[i] = '';
            }
        }
        this.call_players('qipai', msg, 0);

        if (this._view) this._view.redraw();
    }

    zimo() {

        let model = this._model;

        model.lunban = (model.lunban + 3) % 4;

        let zimo = model.shan.zimo();
        model.shoupai[model.lunban].zimo(zimo);

        let paipu = { zimo: { l: model.lunban, p: zimo } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            if (l != model.lunban) msg[l].zimo.p = '';
        }
        this.call_players('zimo', msg);

        if (this._view) this._view.update(paipu);
    }

    dapai(dapai) {

        let model = this._model;

        model.shoupai[model.lunban].dapai(dapai);
        model.he[model.lunban].dapai(dapai);

        // 起手同牌流局判定：第一巡每家打出的第一张牌是否同一张
        if (this._diyizimo) {
            if (this._dapai_first == null) this._dapai_first = dapai.slice(0,2);
            if (this._dapai_first != dapai.slice(0,2))
                                            this._qipai_dou = false;
        }
        else                                this._qipai_dou = false;

        if (Majiang.Util.xiangting(model.shoupai[model.lunban]) == 0
            && Majiang.Util.tingpai(model.shoupai[model.lunban])
                            .find(p=>model.he[model.lunban].find(p)))
        {
            this._neng_rong[model.lunban] = false;
        }

        this._has_dapai[model.lunban] = true;

        this._dapai = dapai;

        let paipu = { dapai: { l: model.lunban, p: dapai } };
        this.add_paipu(paipu);

        if (this._gang) this.kaigang();

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('dapai', msg);

        if (this._view) this._view.update(paipu);
    }

    fulou(fulou) {

        let model = this._model;

        this._diyizimo = false;

        model.he[model.lunban].fulou(fulou);

        let d = fulou.match(/[\+\=\-]/);
        model.lunban = (model.lunban + (4 - '_-=+'.indexOf(d)) % 4) % 4;

        model.shoupai[model.lunban].fulou(fulou);

        if (fulou.match(/^[mpsz]\d{4}/)) {
            this._gang = fulou;
            this._n_gang[model.lunban]++;
        }

        let paipu = { fulou: { l: model.lunban, m: fulou } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('fulou', msg);

        if (this._view) this._view.update(paipu);
    }

    gang(gang) {

        let model = this._model;

        model.shoupai[model.lunban].gang(gang);

        let paipu = { gang: { l: model.lunban, m: gang } };
        this.add_paipu(paipu);

        if (this._gang) this.kaigang();

        this._gang = gang;
        this._n_gang[model.lunban]++;

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('gang', msg);

        if (this._view) this._view.update(paipu);
    }

    gangzimo() {

        let model = this._model;

        this._diyizimo = false;

        let zimo = model.shan.gangzimo();
        model.shoupai[model.lunban].zimo(zimo);

        let paipu = { gangzimo: { l: model.lunban, p: zimo } };
        this.add_paipu(paipu);

        if (this._gang) this.kaigang();

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            if (l != model.lunban) msg[l].gangzimo.p = '';
        }
        this.call_players('gangzimo', msg);

        if (this._view) this._view.update(paipu);
    }

    kaigang() {

        this._gang = null;

        let model = this._model;

        let paipu = { kaigang: { baopai: '' } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.notify_players('kaigang', msg);

        if (this._view) this._view.update(paipu);
    }

    /* 判定胡牌者是否满足"包庄"（单调胡被放枪） */
    check_baojia(shoupai, rongpai) {

        if (! rongpai) return null;

        // 枚举胡牌形
        let mianzi_list = Majiang.Util.hule_mianzi(shoupai, rongpai);
        for (let mm of mianzi_list) {
            if (mm.length != 5) continue;
            let jiang = mm[0];
            // 将牌含胡牌 → 单调胡（手牌原为 4面子+1单张）
            if (! jiang.match(/!\s*$/)) continue;
            let nn = jiang.match(/\d/g).map(Number);
            if (nn.length != 2 || nn[0] != nn[1]) continue;
            // 其余4面子是否全为刻/杠（无顺子）
            let has_shunzi = false;
            for (let i = 1; i < mm.length; i++) {
                let m = mm[i].replace(/!$/,'');
                let n2 = m.match(/\d/g).map(Number);
                if (n2.length == 3 && n2[0]+1 == n2[1] && n2[1]+1 == n2[2]) {
                    has_shunzi = true;
                }
            }
            return { piaohun: ! has_shunzi };
        }
        return null;
    }

    hule() {

        let model = this._model;

        if (this._status != 'hule') {
            model.shan.close();
            this._hule_option = this._status == 'gang'     ? 'qianggang'
                              : this._status == 'gangzimo' ? 'lingshang'
                              :                              null;
        }

        let menfeng  = this._hule.length ? this._hule.shift() : model.lunban;
        let rongpai  = menfeng == model.lunban ? null
                     : (this._hule_option == 'qianggang'
                            ? this._gang[0] + this._gang.slice(-1)
                            : this._dapai.slice(0,2)
                       ) + '_-=+'[(4 + model.lunban - menfeng) % 4];
        let shoupai  = model.shoupai[menfeng].clone();
        let fubaopai = null;

        let baojia = this.check_baojia(model.shoupai[menfeng], rongpai);

        let param = {
            rule:           this._rule,
            zhuangfeng:     model.zhuangfeng,
            menfeng:        menfeng,
            zhuang_seat:    (4 - model.jushu) % 4,            // 本局庄家座位（0东1南2西3北）
            hupai: {
                qipai_gang: this._qipai_gang[menfeng] && ! this._has_dapai[menfeng],
                qianggang:  this._hule_option == 'qianggang',
                lingshang:  this._hule_option == 'lingshang',
                haidi:      model.shan.paishu > 0
                            || this._hule_option == 'lingshang' ? 0 : 1
            },
            baopai:         [],
            fubaopai:       fubaopai,
            jicun:          { changbang: model.changbang,
                              lizhibang: model.lizhibang },
            baojia:         baojia ? (model.lunban == menfeng ? null
                                      : model.lunban) : null,
            cha_hu:         model.shoupai
        };
        if (baojia) param.baojia_type = baojia.piaohun ? 'piaohun' : 'normal';

        let hule = Majiang.Util.hule(shoupai, rongpai, param);

        // 庄家胡牌连庄；塌牌（炸）不连庄（权威规则：炸不连庄）
        let is_tapai = this._qipai_gang[menfeng] && ! this._has_dapai[menfeng];
        if (menfeng == (4 - model.jushu) % 4 && ! is_tapai) this._lianzhuang = true;
        if (this._rule['場数'] == 0) this._lianzhuang = false;
        this._fenpei = hule.fenpei;

        let paipu = {
            hule: {
                l:          menfeng,
                shoupai:    rongpai ? shoupai.zimo(rongpai).toString()
                                    : shoupai.toString(),
                baojia:     rongpai ? model.lunban : null,
                fubaopai:   fubaopai,
                fu:         hule.fu,
                fanshu:     hule.fanshu,
                damanguan:  hule.damanguan,
                defen:      hule.defen,
                hupai:      hule.hupai,
                fenpei:     hule.fenpei
            }
        };
        for (let key of ['fu','fanshu','damanguan']) {
            if (paipu.hule[key] == null) delete paipu.hule[key];
        }
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('hule', msg, this._wait);

        if (this._view) this._view.update(paipu);
    }

    pingju(name, shoupai = ['','','','']) {

        let model = this._model;

        let fenpei  = [0,0,0,0];

        if (! name) {
            name = '流局(牌山摸完)';
        }
        else if (name == '起手同牌') {
            name = '流局(起手同牌)';
        }

        this._lianzhuang = false;           // 邳州：流局轮庄

        if (this._rule['場数'] == 0) this._lianzhuang = true;

        this._fenpei = fenpei;

        let paipu = {
            pingju: { name: name, shoupai: shoupai, fenpei: fenpei }
        };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('pingju', msg, this._wait);

        if (this._view) this._view.update(paipu);
    }

    last() {

        let model = this._model;

        model.lunban = -1;
        if (this._view) this._view.update();

        if (! this._lianzhuang) {
            model.jushu++;
            model.zhuangfeng += (model.jushu / 4)|0;
            model.jushu = model.jushu % 4;
        }

        let jieju = false;
        let guanjun = -1;
        const defen = model.defen;
        for (let i = 0; i < 4; i++) {
            let id = (model.qijia + i) % 4;
            if (defen[id] < 0 && this._rule['トビ終了あり'])    jieju = true;
            if (defen[id] >= 30000
                && (guanjun < 0 || defen[id] > defen[guanjun])) guanjun = id;
        }

        // 邳州麻将：按"圈"计（一圈 = 从头家坐庄到末家下庄，庄位轮转一轮）
        // 庄家胡牌连庄，一圈的局数 ≥ 4；場数 = 圈数，打满 N 圈结束
        let rounds = this._rule['場数'];
        let sum_jushu = model.zhuangfeng * 4 + model.jushu;

        if (rounds > 0) {
            // 打满 N 圈：庄位轮转 N 轮（zhuangfeng 达到 N）即结束
            if (model.zhuangfeng >= rounds)                     jieju = true;
            if (15 < sum_jushu)                                 jieju = true;
        }
        else {
            // 場数==0：一局战（只打第一局）
            if (this._max_jushu < sum_jushu)                    jieju = true;
        }

        if (jieju)  this.delay(()=>this.jieju(), 0);
        else        this.delay(()=>this.qipai(), 0);
    }

    jieju() {

        let model = this._model;

        let paiming = [];
        const defen = model.defen;
        for (let i = 0; i < 4; i++) {
            let id = (model.qijia + i) % 4;
            for (let j = 0; j < 4; j++) {
                if (j == paiming.length || defen[id] > defen[paiming[j]]) {
                    paiming.splice(j, 0, id);
                    break;
                }
            }
        }
        defen[paiming[0]] += model.lizhibang * 1000;
        this._paipu.defen = defen;

        let rank = [0,0,0,0];
        for (let i = 0; i < 4; i++) {
            rank[paiming[i]] = i + 1;
        }
        this._paipu.rank = rank;

        const round = ! this._rule['順位点'].find(p=>p.match(/\.\d$/));
        let point = [0,0,0,0];
        for (let i = 1; i < 4; i++) {
            let id = paiming[i];
            point[id] = (defen[id] - 30000) / 1000
                      + + this._rule['順位点'][i];
            if (round) point[id] = Math.round(point[id]);
            point[paiming[0]] -= point[id];
        }
        this._paipu.point = point.map(p=> p.toFixed(round ? 0 : 1));

        let paipu = { jieju: this._paipu };

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('jieju', msg, this._wait);

        if (this._view) this._view.summary(this._paipu);

        if (this._handler) this._handler();
    }

    get_reply(l) {
        let model = this._model;
        return this._reply[model.player_id[l]];
    }

    reply_kaiju() { this.delay(()=>this.qipai(), 0) }

    reply_qipai() {

        let model = this._model;

        // 检测各家起手杠（塌牌）
        for (let l = 0; l < 4; l++) {
            let sp = model.shoupai[l];
            let has_gang = false;
            for (let s of ['m','p','s','z']) {
                for (let n = 1; n < sp._bingpai[s].length; n++) {
                    if (sp._bingpai[s][n] == 4) has_gang = true;
                }
            }
            this._qipai_gang[l] = has_gang;
        }

        this.delay(()=>this.zimo(), 0);
    }

    reply_zimo() {

        let model = this._model;

        let reply = this.get_reply(model.lunban);
        if (reply.hule) {
            if (this.allow_hule()) {
                this.say('zimo', model.lunban);
                return this.delay(()=>this.hule());
            }
        }
        else if (reply.gang) {
            if (this.get_gang_mianzi().find(m => m == reply.gang)) {
                this.say('gang', model.lunban);
                return this.delay(()=>this.gang(reply.gang));
            }
        }
        else if (reply.kan) {
            // 坎牌（暗刻）：三张从手牌取出扣在面前，一旦坎上不可取消
            let p = reply.kan.replace(/0/g,'5').slice(0,2);
            let sp = model.shoupai[model.lunban];
            if (sp._bingpai[p[0]][+p[1]] >= 3 && sp.kan(p)) {
                let msg = [];
                for (let l = 0; l < 4; l++) {
                    msg[l] = JSON.parse(JSON.stringify(
                                { zimo: { l: model.lunban, p: '', kan: true } }));
                }
                return this.delay(()=>{
                    this.call_players('zimo', msg, 0);
                    // 通知前端更新画面并播报"坎"（必须同步 view，否则前端收不到）
                    if (this._view) this._view.update(
                        { zimo: { l: model.lunban, p: '', kan: true } });
                }, 0);
            }
        }
        else if (reply.dapai) {
            let dapai = reply.dapai.replace(/\*$/,'');
            if (this.get_dapai().find(p => p == dapai)) {
                return this.delay(()=>this.dapai(dapai), 0);
            }
        }

        let p = this.get_dapai().pop();
        this.delay(()=>this.dapai(p), 0);
    }

    reply_dapai() {

        let model = this._model;

        for (let i = 1; i < 4; i++) {
            let l = (model.lunban + 4 - i) % 4;
            let reply = this.get_reply(l);
            if (reply.hule && this.allow_hule(l)) {
                this.say('rong', l);
                this._hule.push(l);
            }
            else {
                let shoupai = model.shoupai[l].clone().zimo(this._dapai);
                if (Majiang.Util.xiangting(shoupai) == -1)
                                                this._neng_rong[l] = false;
            }
        }
        if (this._hule.length) {
            return this.delay(()=>this.hule());
        }

        // 起手同牌流局：第一巡各家打出同一张牌（第4家打完时检查）
        if (this._diyizimo && model.lunban == (5 - model.jushu) % 4) {
            this._diyizimo = false;
            if (this._qipai_dou) {
                let shoupai = model.shoupai.map(s=>s.toString());
                return this.delay(()=>this.pingju('起手同牌', shoupai), 0);
            }
        }

        // 牌山剩7堆（14张）流局
        if (! model.shan.paishu) {
            let shoupai = ['','','',''];
            for (let l = 0; l < 4; l++) {
                let reply = this.get_reply(l);
                if (reply.daopai) shoupai[l] = reply.daopai;
            }
            return this.delay(()=>this.pingju('', shoupai), 0);
        }

        for (let i = 1; i < 4; i++) {
            let l = (model.lunban + 4 - i) % 4;
            let reply = this.get_reply(l);
            if (reply.fulou) {
                let m = reply.fulou.replace(/0/g,'5');
                if (m.match(/^[mpsz](\d)\1\1\1/)) {
                    if (this.get_gang_mianzi(l).find(m => m == reply.fulou)) {
                        this.say('gang', l);
                        return this.delay(()=>this.fulou(reply.fulou));
                    }
                }
                else if (m.match(/^[mpsz](\d)\1\1/)) {
                    if (this.get_peng_mianzi(l).find(m => m == reply.fulou)) {
                        this.say('peng', l);
                        return this.delay(()=>this.fulou(reply.fulou));
                    }
                }
            }
        }
        let l = (model.lunban + 3) % 4;
        let reply = this.get_reply(l);
        if (reply.fulou) {
            if (this.get_chi_mianzi(l).find(m => m == reply.fulou)) {
                this.say('chi', l);
                return this.delay(()=>this.fulou(reply.fulou));
            }
        }

        this.delay(()=>this.zimo(), 0);
    }

    reply_fulou() {

        let model = this._model;

        if (this._gang) {
            return this.delay(()=>this.gangzimo(), 0);
        }

        let reply = this.get_reply(model.lunban);
        if (reply.dapai) {
            if (this.get_dapai().find(p => p == reply.dapai)) {
                return this.delay(()=>this.dapai(reply.dapai), 0);
            }
        }

        let p = this.get_dapai().pop();
        this.delay(()=>this.dapai(p), 0);
    }

    reply_gang() {

        let model = this._model;

        if (this._gang.match(/^[mpsz]\d{4}$/)) {
            return this.delay(()=>this.gangzimo(), 0);
        }

        for (let i = 1; i < 4; i++) {
            let l = (model.lunban + 4 - i) % 4;
            let reply = this.get_reply(l);
            if (reply.hule && this.allow_hule(l)) {
                this.say('rong', l);
                this._hule.push(l);
            }
            else {
                let p = this._gang[0] + this._gang.slice(-1);
                let shoupai = model.shoupai[l].clone().zimo(p);
                if (Majiang.Util.xiangting(shoupai) == -1)
                                                this._neng_rong[l] = false;
            }
        }
        if (this._hule.length) {
            return this.delay(()=>this.hule());
        }

        this.delay(()=>this.gangzimo(), 0);
    }

    reply_hule() {

        let model = this._model;

        for (let l = 0; l < 4; l++) {
            model.defen[model.player_id[l]] += this._fenpei[l];
        }
        model.changbang = 0;
        model.lizhibang = 0;

        if (this._hule.length) {
            return this.delay(()=>this.hule());
        }
        else {
            return this.delay(()=>this.last(), 0);
        }
    }

    reply_pingju() {

        let model = this._model;

        for (let l = 0; l < 4; l++) {
            model.defen[model.player_id[l]] += this._fenpei[l];
        }
        model.changbang++;

        this.delay(()=>this.last(), 0);
    }

    get_dapai() {
        let model = this._model;
        return Game.get_dapai(this._rule, model.shoupai[model.lunban]);
    }

    get_chi_mianzi(l) {
        let model = this._model;
        let d = '_-=+'[(4 + model.lunban - l) % 4];
        return Game.get_chi_mianzi(this._rule, model.shoupai[l],
                                   this._dapai + d, model.shan.paishu);
    }

    get_peng_mianzi(l) {
        let model = this._model;
        let d = '_-=+'[(4 + model.lunban - l) % 4];
        return Game.get_peng_mianzi(this._rule, model.shoupai[l],
                                    this._dapai + d, model.shan.paishu);
    }

    get_gang_mianzi(l) {
        let model = this._model;
        if (l == null) {
            return Game.get_gang_mianzi(this._rule, model.shoupai[model.lunban],
                                        null, model.shan.paishu,
                                        this._n_gang.reduce((x, y)=> x + y));
        }
        else {
            let d = '_-=+'[(4 + model.lunban - l) % 4];
            return Game.get_gang_mianzi(this._rule, model.shoupai[l],
                                        this._dapai + d, model.shan.paishu,
                                        this._n_gang.reduce((x, y)=> x + y));
        }
    }

    allow_hule(l) {
        let model = this._model;
        if (l == null) {
            let hupai = {
                qipai_gang: this._qipai_gang[model.lunban]
                            && ! this._has_dapai[model.lunban]
            };
            return Game.allow_hule(this._rule,
                                   model.shoupai[model.lunban], null,
                                   model.zhuangfeng, model.lunban, hupai);
        }
        else {
            let p = (this._status == 'gang'
                        ? this._gang[0] + this._gang.slice(-1)
                        : this._dapai
                    ) + '_-=+'[(4 + model.lunban - l) % 4];
            let hupai = {
                qipai_gang: this._qipai_gang[l] && ! this._has_dapai[l]
            };
            return Game.allow_hule(this._rule,
                                   model.shoupai[l], p,
                                   model.zhuangfeng, l, hupai,
                                   this._neng_rong[l]);
        }
    }

    static get_dapai(rule, shoupai) {
        return shoupai.get_dapai(false);
    }

    static get_chi_mianzi(rule, shoupai, p, paishu) {

        let mianzi = shoupai.get_chi_mianzi(p, rule['喰い替え許可レベル'] == 0);
        if (! mianzi) return mianzi;
        return paishu == 0 ? [] : mianzi;
    }

    static get_peng_mianzi(rule, shoupai, p, paishu) {

        let mianzi = shoupai.get_peng_mianzi(p);
        if (! mianzi) return mianzi;
        return paishu == 0 ? [] : mianzi;
    }

    static get_gang_mianzi(rule, shoupai, p, paishu, n_gang) {

        let mianzi = shoupai.get_gang_mianzi(p);
        if (! mianzi || mianzi.length == 0) return mianzi;
        return paishu == 0 || n_gang == 4 ? [] : mianzi;
    }

    static allow_hule(rule, shoupai, p, zhuangfeng, menfeng, hupai, neng_rong) {

        if (p && ! neng_rong) return false;

        let new_shoupai = shoupai.clone();
        if (p) new_shoupai.zimo(p);

        // 塌牌：起手杠直接胡牌（仅自摸，不分庄闲）
        if (hupai && hupai.qipai_gang && ! p) {
            let has_gang = false;
            for (let s of ['m','p','s','z']) {
                for (let n = 1; n < new_shoupai._bingpai[s].length; n++) {
                    if (new_shoupai._bingpai[s][n] == 4) has_gang = true;
                }
            }
            if (has_gang) return true;
        }

        if (Majiang.Util.xiangting(new_shoupai) != -1) return false;

        return true;
    }

    static allow_pingju(rule, shoupai, diyizimo) {
        return false;
    }

    static allow_lizhi(rule, shoupai, p, paishu, defen) {
        return false;               // 邳州麻将无立直
    }

    static allow_no_daopai(rule, shoupai, paishu) {
        return false;               // 邳州麻将无弃胡声明
    }
}

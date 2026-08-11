/*
 *  Majiang.UI.Board
 */
"use strict";

const $ = require('jquery');

const Shoupai    = require('./shoupai');
const Shan       = require('./shan');
const He         = require('./he');
const HuleDialog = require('./dialog');
const summary    = require('./summary');
const voice      = require('./voice');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

// 方位映射：0=自己(main/下) 1=下家 2=对家(上) 3=上家
// 南北互换：南(下家)显示在左(shangjia位)，北(上家)显示在右(xiajia位)
const class_name = ['main','shangjia','duimian','xiajia'];
const feng_hanzi = ['我','下家','对家','上家'];
const menfeng_hanzi = ['东','南','西','北'];     // 座位 l 的门风
const shu_hanzi  = ['一','二','三','四'];
const dummy_name = ['我','下家','对家','上家'];

const say_text   = { chi:   '吃',
                     peng:  '碰',
                     gang:  '杠',
                     lizhi: '立直',
                     rong:  '胡',
                     zimo:  '自摸'    };

class Score {

    constructor(root, model) {
        this._model = model;
        this._view = {
            root:      root,
            jushu:     $('.jushu', root),
            changbang: $('.changbang', root),
            lizhibang: $('.lizhibang', root),
            defen:     [],
        };
        this._viewpoint = 0;
        hide(this._view.root);
    }

    redraw(viewpoint) {

        if (viewpoint != null) this._viewpoint = viewpoint;

        show(this._view.root);

        let jushu = menfeng_hanzi[(4 - this._model.jushu) % 4]
                  + shu_hanzi[this._model.jushu] + '局';
        this._view.jushu.text(jushu);
        this._view.changbang.text(this._model.changbang);
        this._view.lizhibang.text(this._model.lizhibang);

        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            let defen = '' + this._model.defen[id];
            defen = defen.replace(/(\d)(\d{3})$/,'$1,$2');
            defen = `${menfeng_hanzi[l]}: ${defen}`;
            let c = class_name[(id + 4 - this._viewpoint) % 4];
            this._view.defen[l] = $(`.defen .${c}`, this._root);
            this._view.defen[l].removeClass('lunban zhuang').text(defen);
            if (l == this._model.lunban) this._view.defen[l].addClass('lunban');
            if (l == (4 - this._model.jushu) % 4)  this._view.defen[l].addClass('zhuang'); // 本局庄家座位(逆时针轮庄)
        }
        return this;
    }

    update() {
        let lunban = this._model.lunban < 0 ? 0 : this._model.lunban;
        for (let l = 0; l < 4; l++) {
            if (l == lunban) this._view.defen[l].addClass('lunban');
            else             this._view.defen[l].removeClass('lunban');
        }
        return this;
    }
}

module.exports = class Board {

    constructor(root, pai, audio, model) {
        this._root  = root;
        this._model = model;
        this._pai   = pai;
        this._view  = {
            score:   new Score($('.score', root), model),
            shan:    null,
            shoupai: [],
            he:      [],
            say:     [],
            dialog:  null,
            summary: hide($('> .summary', root)),
            kaiju:   hide($('> .kaiju', root)),
        };
        this._say = [];
        this._lizhi = false;

        this.viewpoint = 0;
        this.sound_on  = true
        this.open_shoupai;
        this.open_he;
        this.dummy_name = null;
        this.no_player_name = true;   // 隐藏玩家名，只保留庄家"庄"徽章

        this._timeout_id;

        this.set_audio(audio);

        $('> .player', this._root).removeClass('disconnect');

        $(window).on('resize', ()=>this._view.shoupai.forEach(s=>s.adjust()));
    }

    set_audio(audio) {
        this._audio = {};
        for (let name of ['dapai','chi','peng','gang','rong','zimo','lizhi']) {
            this._audio[name] = [];
            for (let l = 0; l < 4; l++) {
                this._audio[name][l] = audio(name);
            }
        }
        this._audio.gong = audio('gong');
        return this;
    }

    redraw() {

        this._timeout_id = clearTimeout(this._timeout_id);
        hide(this._view.summary);
        hide(this._view.kaiju);

        this._view.score.redraw(this.viewpoint);

        this._view.shan = new Shan($('.score .shan', this._root), this._pai,
                                    this._model.shan).redraw();

        for (let l = 0; l < 4; l++) {
            let id   = this._model.player_id[l];
            let c    = class_name[(id + 4 - this.viewpoint) % 4];

            let pl = show($(`> .player.${c}`, this._root));
            // 门风标注：去掉东/南/西/北，仅庄家座位显示"庄"
            if (l == (4 - this._model.jushu) % 4) {
                pl.find('.menfeng').text('庄').show();
            }
            else {
                hide(pl.find('.menfeng'));
            }
            if (this.no_player_name) {
                hide(pl.find('.name'));
            }
            else {
                let name = (this.dummy_name == null)
                                ? this._model.player[id].replace(/\n.*$/,'')
                                : dummy_name[(4 + id - this.dummy_name) % 4];
                pl.find('.name').text(name);
                show(pl.find('.name'));
            }

            let open = this._model.player_id[l] == this.viewpoint;
            this._view.shoupai[l]
                    = new Shoupai(show($(`.shoupai.${c}`, this._root)),
                                    this._pai, this._model.shoupai[l])
                        .redraw(open || this.open_shoupai).adjust();

            this._view.he[l]
                    = new He(show($(`.he.${c}`, this._root)),
                                    this._pai, this._model.he[l])
                        .redraw(this.open_he);

            this._view.say[l] = hide($(`.say.${c}`, this._root).text(''));
            this._say[l] = null;
        }

        this._lunban = this._model.lunban;
        this._view.score.update();

        this._view.dialog
            = new HuleDialog($('.hule-dialog', this._root), this._pai,
                            this._model, this.viewpoint).hide();

        return this;
    }

    update(data = {}) {

        if (this._lunban >= 0 && this._lunban != this._model.lunban) {
            if (this._say[this._lunban]) {
                fadeOut(this._view.say[this._lunban]);
                this._say[this._lunban] = null;
            }
            else {
                hide(this._view.say[this._lunban].text(''));
            }
            if (this._lizhi) {
                this._view.score.redraw();
                this._lizhi = false;
            }
            this._view.he[this._lunban].redraw();
            this._view.shoupai[this._lunban].redraw();
        }

        if (   (this._say[this._lunban] == 'lizhi')
            || (this._say[this._lunban] == 'chi'   && ! data.fulou)
            || (this._say[this._lunban] == 'peng'  && ! data.fulou)
            || (this._say[this._lunban] == 'gang'
                            && !(data.fulou || data.gang || data.kaigang)))
        {
            fadeOut(this._view.say[this._lunban]);
            this._say[this._lunban] = null;
        }

        if (data.zimo) {
            this._view.shan.update();
            this._view.shoupai[data.zimo.l].redraw().adjust();
            // 坎牌（暗刻）：zimo.kan = true 时播报"坎"
            if (this.sound_on && data.zimo.kan) voice.action('kan');
        }
        else if (data.dapai) {
            this._view.shoupai[data.dapai.l].dapai(data.dapai.p);
            if (this.sound_on) {
                // 邳州报牌：出什么牌播什么语音（原 dahai11.wav 已去除，避免重复）
                voice.pai(data.dapai.p);
            }
            this._view.he[data.dapai.l].dapai(data.dapai.p);
            this._lizhi = data.dapai.p.slice(-1) == '*';
        }
        else if (data.fulou) {
            this._view.shoupai[data.fulou.l].redraw().adjust();
        }
        else if (data.gang) {
            this._view.shoupai[data.gang.l].redraw().adjust();
        }
        else if (data.gangzimo) {
            this._view.shan.update();
            this._view.shoupai[data.gangzimo.l].redraw().adjust();
        }
        else if (data.kaigang) {
            this._view.shan.redraw();
        }
        else if (data.hule) {
            this.hule(data.hule);
        }
        else if (data.pingju) {
            this.pingju(data.pingju);
        }
        else {
            this._view.score.redraw();
        }

        this._lunban = this._model.lunban;
        if (this._lunban >= 0) this._view.score.update();

        return this;
    }

    hule(hule) {

        for (let l = 0; l < 4; l++) {
            fadeOut(this._view.say[l]);
            this._say[l] = null;
        }

        this._timeout_id = setTimeout(()=>{
            this._view.shoupai[hule.l].redraw(true);
            this._view.dialog.hule(hule);
            if (this.sound_on && hule.damanguan) this._audio.gong.play();
        }, 400);
    }

    pingju(pingju) {

        for (let l = 0; l < 4; l++) {
            fadeOut(this._view.say[l]);
            this._say[l] = null;
        }
        let duration = 0;
        if (pingju.name.match(/^三家和/)) {
            duration = 400;
        }
        else {
            this._view.he[this._lunban].redraw();
            this._view.shoupai[this._lunban].redraw();
        }

        this._timeout_id = setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let open = this._model.player_id[l] == this.viewpoint
                            || pingju.shoupai[l];
                this._view.shoupai[l].redraw(open);
            }
            this._view.dialog.pingju(pingju);
        }, duration);
    }

    say(name, l) {
        if (this.sound_on) {
            // 邳州动作播报（原 chii/pon/kan/ron/tsumo 音效已去除，避免重复）
            voice.action(name);
        }
        show(this._view.say[l].text(say_text[name]));
        this._say[l] = name;
    }

    kaiju(viewpoint) {
        if (viewpoint != null) this.viewpoint = viewpoint;
        hide($('> *', this._root));
        let title = $('<span>').text(this._model.title).html()
                                            .replace(/\n/g,'<br>');
        $('.title', this._view.kaiju).html(title);
        for (let id = 0; id < 4; id++) {
            let c = class_name[(4 - this.viewpoint + id) % 4];
            let name = (this.dummy_name == null)
                            ? this._model.player[id].replace(/\n.*$/,'')
                            : dummy_name[(4 + id - this.dummy_name) % 4];
            // 门风 = 玩家id相对起家的位置（0东 1南 2西 3北）
            let menfeng = (id - this._model.qijia + 8) % 4;
            let pl = $(`.player .${c}`, this._view.kaiju);
            // 门风徽章：去掉东/南/西/北，仅起家（庄家）显示"庄"
            if (menfeng == 0) {
                pl.find('.menfeng').text('庄').show();
            }
            else {
                hide(pl.find('.menfeng'));
            }
            if (this.no_player_name) {
                hide(pl.find('.name'));
            }
            else {
                pl.find('.name').text(name);
                show(pl.find('.name'));
            }
        }
        show(this._view.kaiju);
    }

    summary(paipu) {
        this._timeout_id = clearTimeout(this._timeout_id);
        this._view.dialog.hide();
        this._view.summary.scrollTop(0);
        let name;
        if (this.dummy_name != null) {
            name = [];
            for (let id = 0; id < 4; id++) {
                name[id] = dummy_name[(4 + id - this.dummy_name) % 4];
            }
        }
        if (paipu) fadeIn(summary(this._view.summary, paipu, this.viewpoint,
                                  name));
        else       hide(this._view.summary);
    }

    players(players) {
        for (let id = 0; id < 4; id++) {
            let c = class_name[(id + 4 - this.viewpoint) % 4];
            if (players[id])
                    $(`> .player.${c}`, this._root).removeClass('disconnect');
            else    $(`> .player.${c}`, this._root).addClass('disconnect');
        }
    }
}

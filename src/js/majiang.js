/*!
 *  邳州麻将 v1.2.2
 *  基于 kobalab/Majiang（電脳麻将，MIT License）改造
 *  规则：查胡麻将 · 120张牌 · 胡数/幺数计分 · 飘荤/塌牌/包庄
 */
"use strict";
global.Majiang = require('@kobalab/majiang-core');
global.Majiang.AI = require('@kobalab/majiang-ai');
global.Majiang.UI = require('@kobalab/majiang-ui');
global.Majiang.VERSION = '1.2.32';
global.jQuery  = require('jquery');
global.$ = jQuery;

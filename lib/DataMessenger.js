"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataMessenger = DataMessenger;

var _Utils = require("./Utils");

var _Cascader = require("./Cascader");

var _ChataUtils = require("./ChataUtils");

var _Constants = require("./Constants");

var _Svg = require("./Svg");

var _Tooltips = require("./Tooltips");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

require('load-styles')("/* vanilla-autoql */\n.autoql-vanilla-chata-drawer *, .autoql-vanilla-chata-drawer *:before, .autoql-vanilla-chata-drawer *:after{\n    -webkit-box-sizing: border-box !important;\n            box-sizing: border-box !important;\n    padding: 0px;\n    margin: 0px;\n}\n\n.autoql-vanilla-chata-drawer path{\n    fill: currentColor;\n}\n\n.autoql-vanilla-chata-drawer line{\n    fill: currentColor;\n}\n\n.autoql-vanilla-chata-body-drawer-open{\n    overflow: hidden;\n    -ms-touch-action: none;\n        touch-action: none;\n}\n\n.autoql-vanilla-drawer-handle .autoql-vanilla-chata-bubbles-icon{\n    margin-top: 12px;\n    display: block;\n}\n\n.autoql-vanilla-drawer-handle:hover{\n    cursor: pointer;\n}\n.autoql-vanilla-drawer-handle{\n    position: fixed;\n    cursor: pointer;\n    z-index: 10;\n    text-align: center;\n    line-height: 40px;\n    font-size: 16px;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n        -ms-flex-align: center;\n            align-items: center;\n    vertical-align:middle;\n    background-color: #26a7df;\n    color: #fff;\n    /* color: #28a8e0; */\n    /* background: var(--chata-drawer-background-color); */\n    /* left: -40px;\n    border-radius: 4px 0 0 4px; */\n    -webkit-box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);\n            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);\n\n    -webkit-transition: opacity 0.5s ease;\n    transition: opacity 0.5s ease;\n    overflow: hidden;\n    width: 50px;\n    height: 50px;\n    border-radius: 50%;\n}\n\n.autoql-vanilla-icon-blue{\n    color: #28a8e0;\n}\n\n.autoql-vanilla-drawer-handle.right-btn{\n    top: 55px;\n    right: 10px;\n}\n\n.autoql-vanilla-drawer-handle.left-btn{\n    top: 55px;\n    left: 10px;\n}\n\n.autoql-vanilla-drawer-handle.bottom-btn{\n    bottom: 10px;\n    left: calc(50% - 20px);\n}\n\n.autoql-vanilla-drawer-handle.top-btn{\n    top: 10px;\n    left: calc(50% - 20px);\n}\n\n#notification-icon{\n    font-size: 26px;\n    margin-top: 13px;\n}\n\n.autoql-vanilla-drawer-wrapper{\n    background: #000;\n    opacity: .3;\n    width: 100%;\n    position: fixed;\n    height: 100%;\n    top: 0;\n    left: 0;\n    -webkit-transition: opacity 0.3 cubic-bezier(0.78, 0.14, 0.15, 0.86), height 0s ease 0.3s;\n    transition: opacity 0.3 cubic-bezier(0.78, 0.14, 0.15, 0.86), height 0s ease 0.3s;\n    z-index: 2;\n}\nbody{\n    -webkit-transition: -webkit-transform 0.3s ease-in-out;\n    transition: -webkit-transform 0.3s ease-in-out;\n    transition: transform 0.3s ease-in-out;\n    transition: transform 0.3s ease-in-out, -webkit-transform 0.3s ease-in-out;\n}\n.autoql-vanilla-chata-drawer{\n    z-index: 10;\n    background: white;\n    position: fixed;\n    /* right: 0; */\n    height: 100%;\n    /* top: 0px; */\n    width: 0px;\n    -webkit-box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);\n            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);\n    /* transition: transform 0.3 cubic-bezier(0.78, 0.14, 0.15, 0.86), opacity 0.3 cubic-bezier(0.78, 0.14, 0.15, 0.86), box-shadow 0.3 cubic-bezier(0.78, 0.14, 0.15, 0.86); */\n    /* transform: translateX(500px); */\n    -webkit-transition: -webkit-transform 0.3s ease-in-out;\n    transition: -webkit-transform 0.3s ease-in-out;\n    transition: transform 0.3s ease-in-out;\n    transition: transform 0.3s ease-in-out, -webkit-transform 0.3s ease-in-out;\n    background: var(--chata-drawer-background-color);\n    border-radius: 4px;\n}\n\n.autoql-vanilla-chat-header-container {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: justify;\n    -webkit-justify-content: space-between;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n    width: 100%;\n    height: 60px;\n    background: var(--chata-drawer-accent-color);\n    -webkit-box-shadow: 0 0 14px 1px rgba(0, 0, 0, 0.15);\n            box-shadow: 0 0 14px 1px rgba(0, 0, 0, 0.15);\n    -webkit-box-flex: 0;\n    -webkit-flex-grow: 0;\n        -ms-flex-positive: 0;\n            flex-grow: 0;\n    -webkit-flex-shrink: 0;\n        -ms-flex-negative: 0;\n            flex-shrink: 0;\n    z-index: 2;\n    word-wrap: break-word;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n        -ms-flex-align: center;\n            align-items: center;\n    color:white;\n    position: relative;\n    z-index: 100000003;\n}\n\n.autoql-vanilla-popover-container{\n    z-index: 9999;\n    border: 1px solid #ababab52;\n    border-radius: 4px;\n    -webkit-box-shadow: 0px 0 8px rgba(0, 0, 0, 0.15);\n            box-shadow: 0px 0 8px rgba(0, 0, 0, 0.15);\n    position: absolute;\n    right: 5px;\n    top: 50px;\n    opacity: 0;\n    display: block;\n    visibility: hidden;\n    -webkit-transition: all 0.35s ease 0s;\n    transition: all 0.35s ease 0s;\n    /* background: white; */\n}\n\n.autoql-vanilla-chata-confirm-text {\n    text-align: center;\n    width: 100%;\n}\n\n.autoql-vanilla-clear-messages-confirm-popover {\n    color: var(--chata-drawer-text-color-primary);\n    background: var(--chata-drawer-background-color);\n    text-align: right;\n    padding: 18px !important;\n    width: 266px;\n}\n.autoql-vanilla-chata-confirm-btn {\n    margin: 7px 0px 0 2px !important;\n    border-radius: 4px !important;\n    cursor: pointer !important;\n    outline: none !important;\n    -webkit-transition: all 0.2s ease;\n    transition: all 0.2s ease;\n    border-width: 2px;\n    display: inline-block;\n    text-align: center;\n    -webkit-box-align: start;\n    -webkit-align-items: flex-start;\n        -ms-flex-align: start;\n            align-items: flex-start;\n    cursor: default;\n    -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n    margin: 0em;\n    padding: 3px 6px !important;\n    border-width: 2px;\n    border-style: outset;\n    -o-border-image: initial;\n       border-image: initial;\n    font-size: 14px !important;\n}\n\n.autoql-vanilla-chata-confirm-btn.no {\n    color: inherit;\n    border: 1px solid rgba(0,0,0,.15);\n    background: inherit\n}\n\n.autoql-vanilla-chata-confirm-btn.yes {\n    background: var(--chata-drawer-accent-color) !important;\n    border: 2px outset var(--chata-drawer-accent-color) !important;\n    color: white;\n}\n\n.autoql-vanilla-chata-confirm-btn:hover{\n    opacity: .7;\n}\n.autoql-vanilla-chata-confirm-icon {\n    color: #faad14;\n    display: inline-block;\n}\n\n.autoql-vanilla-chata-header-center-container {\n    position: relative;\n    line-height: 60px;\n    font-size: 18px;\n    letter-spacing: 0.05em;\n    font-weight: 600;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 18px;\n    letter-spacing: 0.05em;\n}\n\n.autoql-vanilla-chat-header-container button {\n    background: transparent;\n    border: none;\n    color: white;\n    margin: 10px;\n    margin-right: 0;\n    font-size: 20px;\n    cursor: pointer;\n    outline: none !important;\n}\n\n.autoql-vanilla-chat-message-toolbar.right .autoql-vanilla-chata-toolbar-btn path{\n    fill: unset;\n}\n\n.autoql-vanilla-chat-message-toolbar.right .autoql-vanilla-chata-toolbar-btn svg{\n    font: unset;\n}\n\n.autoql-vanilla-chata-button{\n    background: none !important;\n}\n.autoql-vanilla-chata-button.close-action svg {\n    width: 30px;\n    height: 30px;\n    padding-top: 3px;\n}\n\n.autoql-vanilla-chat-header-container button svg {\n    width: 22px;\n    height: 22px;\n    padding-right: 2px;\n    padding-top: 2px;\n}\n\n.autoql-vanilla-chat-header-container .autoql-vanilla-chata-button:hover{\n    /* color: var(--chata-drawer-hover-color); */\n    opacity: .7;\n}\n\n.autoql-vanilla-chata-button.clear-all {\n    margin-right: 11px;\n}\n\n.autoql-vanilla-drawer-content{\n    width: calc(100%);\n    height: 100%;\n    max-height: calc(100% - 150px);\n    /* overflow: hidden; */\n    /* overflow-y: auto;\n    overflow-x: visible; */\n    /* padding: 20px; */\n    -webkit-box-flex: 1;\n    -webkit-flex: 1;\n        -ms-flex: 1;\n            flex: 1;\n    -webkit-flex-grow: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -webkit-flex-shrink: 1;\n        -ms-flex-negative: 1;\n            flex-shrink: 1;\n    -webkit-flex-basis: 0%;\n        -ms-flex-preferred-size: 0%;\n            flex-basis: 0%;\n    background: var(--chata-drawer-background-color);\n    /* position: relative; */\n}\n\n.autoql-vanilla-drawer-content:hover{\n    /* overflow: auto; */\n    /* overflow-y: auto; */\n    /* width: 100%; */\n}\n\n.autoql-vanilla-chata-scrollbox {\n  width: 100%;\n  height: 100%;\n  max-height: calc(100% - 150px);\n  overflow: auto;\n  visibility: hidden;\n  scroll-behavior: smooth;\n}\n\n.autoql-vanilla-drawer-content, .autoql-vanilla-chata-scrollbox:hover, .autoql-vanilla-chata-scrollbox:focus {\n  visibility: visible;\n}\n\n.autoql-vanilla-chat-single-message-container .autoql-vanilla-chat-message-bubble {\n    position: relative;\n    /* margin: 10px 0px 10px 10px; */\n    margin: 10px -10px 10px 10px;\n    padding: 13px;\n    border-radius: 10px;\n    max-width: calc(100% - 20px);\n    word-wrap: break-word;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 14px;\n    letter-spacing: 0.04em;\n    border: 1px solid var(--chata-drawer-border-color);\n    background: var(--chata-drawer-background-color);\n    color: var(--chata-drawer-text-color-primary);\n    min-width: 317px;\n}\n\n.autoql-vanilla-chat-message-bubble.single{\n    min-width: auto;\n}\n\n.autoql-vanilla-chat-message-bubble.simple-response{\n    min-width: 125px;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n\n.autoql-vanilla-chat-message-bubble.no-hover-response .autoql-vanilla-chata-single-response:hover{\n    text-decoration: none;\n    color: rgb(93,93,93);\n    cursor: default;\n}\n\n.autoql-vanilla-chat-single-message-container .autoql-vanilla-chat-message-bubble.text {\n    max-width: 85%;\n}\n\n.autoql-vanilla-chat-single-message-container.response {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: start;\n    -webkit-justify-content: flex-start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n    margin-left: 10px;\n    max-height: 85%;\n    -webkit-animation: scale-up-bl 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;\n    animation: scale-up-bl 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;\n    /* z-index: 1000; */\n    position: relative;\n}\n\n.autoql-vanilla-chata-animation-message{\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: start;\n    -webkit-justify-content: flex-start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n    margin-left: 10px;\n    max-height: 85%;\n    -webkit-animation: scale-up-bl 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;\n    animation: scale-up-bl 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;\n}\n\n.autoql-vanilla-chata-response-content-container {\n    background-color: inherit;\n    font-size: 14px;\n    height: 100%;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n        -ms-flex-align: center;\n            align-items: center;\n    background-color: inherit;\n    font-size: 14px;\n    height: 100%;\n    width: 100%;\n    overflow: hidden;\n}\n\n.autoql-vanilla-chat-single-message-container.request {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: end;\n    -webkit-justify-content: flex-end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n    margin-right: 20px;\n    -webkit-animation: scale-up-br 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;\n    animation: scale-up-br 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;\n}\n\n.autoql-vanilla-chat-single-message-container.request .autoql-vanilla-chat-message-bubble {\n    background: var(--chata-drawer-accent-color);\n    border: 1px solid var(--chata-drawer-accent-color);\n    color: white;\n    /* box-shadow: 2px 3px 8px 1px rgba(0, 0, 0, 0.1); */\n}\n\n.autoql-vanilla-chata-bar-container {\n    position: relative;\n}\n\n.autoql-vanilla-chata-bar-container.query-input{\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n}\n\n.autoql-vanilla-wrapper-input{\n    position: relative;\n    width: 100%;\n}\n\n.autoql-vanilla-watermark {\n    color: var(--chata-drawer-text-color-primary);\n    text-align: center;\n    opacity: 0.2;\n    display: block;\n    margin-bottom: 7px;\n    width: calc(100% - 10px);\n    font-size: 13px;\n    font-family: sans-serif;\n}\n\n.autoql-vanilla-text-bar{\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    position: relative;\n}\n.autoql-vanilla-text-bar-animation{\n    -webkit-animation: 0.5s ease 0s 1 normal none running slideDown;\n            animation: 0.5s ease 0s 1 normal none running slideDown;\n}\n.autoql-vanilla-chata-input {\n    padding: 10px !important;\n    padding-left: 20px !important;\n    margin: 10px !important;\n    height: 42px !important;\n    -webkit-box-sizing: border-box !important;\n            box-sizing: border-box !important;\n    border-radius: 24px !important;\n    font-size: 16px !important;\n    font-family: var(--chata-drawer-font-family) !important;\n    letter-spacing: 0.04em !important;\n    outline: none !important;\n    width: calc(100% - 20px);\n    background: transparent !important;\n    border: 1px solid var(--chata-drawer-border-color) !important;\n    color: var(--chata-drawer-text-color-primary) !important;\n}\n.autoql-vanilla-chata-input-full-width{\n    width: 100%;\n}\n.autoql-vanilla-chata-input:hover, .autoql-vanilla-chata-input-renderer:hover{\n    -webkit-box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1) !important;\n            box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1) !important;\n}\n\n.autoql-vanilla-chata-input:focus, .autoql-vanilla-chata-input-renderer:focus{\n    border-color: transparent !important;\n    -webkit-box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1) !important;\n            box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1) !important;\n}\n\n.autoql-vanilla-chata-input::-webkit-input-placeholder{\n    color: var(--chata-drawer-text-color-placeholder);\n}\n\n.autoql-vanilla-chata-input::-moz-placeholder{\n    color: var(--chata-drawer-text-color-placeholder);\n}\n\n.autoql-vanilla-chata-input::-ms-input-placeholder{\n    color: var(--chata-drawer-text-color-placeholder);\n}\n\n.autoql-vanilla-chata-input::placeholder{\n    color: var(--chata-drawer-text-color-placeholder);\n}\n\n.autoql-vanilla-chata-input-renderer {\n    padding: 10px !important;\n    padding-left: 20px !important;\n    margin: 10px !important;\n    height: 42px !important;\n    -webkit-box-sizing: border-box !important;\n            box-sizing: border-box !important;\n    border-radius: 24px !important;\n    font-size: 16px !important;\n    font-family: var(--chata-drawer-font-family) !important;\n    letter-spacing: 0.04em !important;\n    outline: none !important;\n    width: calc(100% - 20px) !important;\n    background: white !important;\n    border: 1px solid #d3d3d352 !important;\n    color: #5d5d5d !important;\n}\n\n.autoql-vanilla-chat-voice-record-button {\n    width: 40px;\n    height: 40px;\n    border-radius: 24px;\n    margin: 10px;\n    margin-left: 0;\n    font-size: 18px;\n    line-height: 24px;\n    outline: none !important;\n    position: relative;\n    cursor: pointer;\n    overflow: hidden;\n    background: var(--chata-drawer-accent-color);\n    color: var(--chata-drawer-text-color-primary);\n    border: none;\n    /* transition: box-shadow 0.2s ease; */\n    -webkit-flex-shrink: 0;\n        -ms-flex-negative: 0;\n            flex-shrink: 0;\n    -webkit-box-flex: 0;\n    -webkit-flex-grow: 0;\n        -ms-flex-positive: 0;\n            flex-grow: 0;\n}\n\n.autoql-vanilla-chat-bar-text{\n    display: block;\n    width: 100%;\n    position: relative;\n}\n\n.autoql-vanilla-chat-bar-auto-complete-suggestions{\n    overflow: hidden;\n    position: absolute;\n    width: calc(100% - 17px);\n    margin-left: 10px;\n    border-radius: 24px;\n    z-index: 100;\n}\n\n.autoql-vanilla-chat-bar-autocomplete{\n    padding-left: 0 !important;\n    padding-right: 0 !important;\n}\n\n.autoql-vanilla-chat-bar-auto-complete-suggestions.bottom{\n    top: 45px;\n}\n\n.autoql-vanilla-chat-bar-auto-complete-suggestions.top{\n    bottom: 45px;\n}\n\n.autoql-vanilla-chat-bar-input-icon {\n    position: absolute;\n    left: 30px;\n    top: 20px;\n}\n\n.autoql-vanilla-chat-bar-loading-container {\n    position: absolute;\n    left: 30px;\n    top: 20px;\n}\n\n.autoql-vanilla-chata-input-renderer.left-padding {\n    padding-left: 54px !important;\n}\n\n.autoql-vanilla-chat-bar-auto-complete-suggestions ul {\n    -webkit-box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);\n            box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);\n    overflow: hidden;\n    border-radius: 24px;\n    border: 1px solid #d3d3d352;\n    background: #fff;\n    color: #5d5d5d;\n    list-style: none;\n    bottom: 60px;\n    width: calc(100% - 5px);\n    display: none;\n}\n.autoql-vanilla-chat-bar-auto-complete-suggestions ul li{\n    display: block;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 15px;\n    font-weight: normal;\n    width: 100%;\n    display: block;\n    padding: 3px 0px 3px 15px;\n    cursor: pointer;\n    letter-spacing: 0.05em;\n}\n\n\n.autoql-vanilla-auto-complete-suggestions{\n    position: relative;\n /* padding-left: 20px; */\n    margin-left: 10px;\n    z-index: 100000000;\n}\n\n\n.autoql-vanilla-auto-complete-suggestions ul{\n    -webkit-box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);\n            box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);\n    overflow: hidden;\n    border-radius: 24px;\n    z-index: 3;\n    border: 1px solid var(--chata-drawer-border-color);\n    background: var(--chata-drawer-background-color);\n    color: var(--chata-drawer-text-color-primary);\n    position: fixed;\n    list-style: none;\n    bottom: 60px;\n    width: calc(100% - 72px);\n    display: none;\n}\n.autoql-vanilla-auto-complete-suggestions ul li{\n    display: block;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 15px;\n    font-weight: normal;\n    width: 100%;\n    display: block;\n    padding: 3px 0px 3px 15px;\n    cursor: pointer;\n    letter-spacing: 0.05em;\n}\n\n.autoql-vanilla-auto-complete-suggestions ul li:hover{\n    background-color: var(--chata-drawer-hover-color);\n}\n\n.autoql-vanilla-chat-bar-auto-complete-suggestions ul li:hover{\n    background-color: #ececec;\n}\n\n/* response loading dots */\n.input-response-loading-container {\n    position: absolute;\n    right: 23px;\n    top: -2px;\n}\n.response-loading-container {\n  position: absolute;\n  bottom: 45px;\n  left: 20px;\n}\n\n.chat-bar-loading{\n    position: absolute;\n    top: 0;\n    right: 20px;\n}\n\n.response-loading {\n    display: inline-block;\n    position: relative;\n    width: 64px;\n    height: 64px;\n}\n.response-loading div {\n    position: absolute;\n    top: 27px;\n    width: 11px;\n    height: 11px;\n    border-radius: 50%;\n    background: #e2e2e2;\n    -webkit-animation-timing-function: cubic-bezier(0, 1, 1, 0);\n            animation-timing-function: cubic-bezier(0, 1, 1, 0);\n}\n.response-loading div:nth-child(1) {\n    left: 6px;\n    -webkit-animation: response-loading1 0.6s infinite;\n            animation: response-loading1 0.6s infinite;\n}\n.response-loading div:nth-child(2) {\n    left: 6px;\n    -webkit-animation: response-loading2 0.6s infinite;\n            animation: response-loading2 0.6s infinite;\n}\n.response-loading div:nth-child(3) {\n    left: 26px;\n    -webkit-animation: response-loading2 0.6s infinite;\n            animation: response-loading2 0.6s infinite;\n}\n.response-loading div:nth-child(4) {\n    left: 45px;\n    -webkit-animation: response-loading3 0.6s infinite;\n            animation: response-loading3 0.6s infinite;\n}\n\n.autoql-vanilla-chat-single-message-container .autoql-vanilla-chat-message-bubble.full-width {\n    /* max-width: calc(100% - 30px); */\n    width: 100%;\n}\n\n.autoql-vanilla-chata-response-content-container {\n    background-color: inherit;\n    font-size: 14px;\n    height: 100%;\n    font-family: var(--chata-drawer-font-family);\n    letter-spacing: 0.04em;\n}\n\n.autoql-vanilla-chata-suggestion-btn, .autoql-vanilla-chata-suggestion-btn-renderer {\n    padding: 6px 14px;\n    background: transparent;\n    border-radius: 4px;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 12px;\n    margin-top: 5px;\n    outline: none !important;\n    cursor: pointer;\n    letter-spacing: 0.05em;\n    -webkit-transition: all 0.1s ease;\n    transition: all 0.1s ease;\n    /* border: 1px solid rgba(0, 0, 0, 0.15); */\n    border-color: #e2e2e26e;\n    color: inherit;\n}\n\n.autoql-vanilla-chata-suggestion-btn:hover, .autoql-vanilla-chata-suggestion-btn-renderer:hover{\n    color: white !important;\n    background: var(--chata-drawer-accent-color) !important;\n    border-color: transparent !important;\n}\n\n.autoql-vanilla-chata-suggestion-btn:focus, .autoql-vanilla-chata-suggestion-btn-renderer:focus{\n    background: transparent;\n}\n\n.autoql-vanilla-chata-scrollbox::-webkit-scrollbar {\n    display: unset;\n    background-color: transparent;\n    width: 7px;\n    height: 7px;\n}\n\n.autoql-vanilla-chata-scrollbox::-webkit-scrollbar-thumb {\n    background-color: rgba(0, 0, 0, 0.2);\n    border-radius: 7px;\n    border: 0px;\n}\n\n.autoql-vanilla-chata-table-scrollbox{\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n    visibility: visible;\n}\n\n.chata-hidden-scrollbox{\n    overflow: hidden;\n}\n\n.autoql-vanilla-chata-table-scrollbox::-webkit-scrollbar-thumb {\n    background-color: rgba(0, 0, 0, 0.2);\n    border-radius: 7px;\n    border: 0px;\n}\n\n.autoql-vanilla-chata-table-scrollbox::-webkit-scrollbar {\n    display: unset;\n    background-color: var(--chata-drawer-background-color);\n    width: 7px;\n    height: 7px;\n}\n\n.autoql-vanilla-chata-table-scrollbox::-webkit-scrollbar-corner{\n    background-color: var(--chata-drawer-background-color);\n}\n\ninput[type=text]:disabled {\n    /* background-color: var(--chata-drawer-text-color-placeholder); */\n}\n\n.tabulator-filter{\n    bottom: 42px !important;\n    right: 13px !important;\n}\n\n/* .chata-table-vertical-scrollbox{\n    width: 100%;\n    height: 100vh;\n    display: block;\n    overflow-y: auto;\n    overflow-x: hidden;\n    visibility: hidden;\n} */\n\n[data-indexrow]{\n    visibility: visible;\n}\n\n.autoql-vanilla-chata-table-container, .autoql-vanilla-chata-chart-container, .autoql-vanilla-chata-table-container-renderer,\n.autoql-vanilla-chata-table-scrollbox:hover, .autoql-vanilla-chata-table-scrollbox:focus,\n.chata-table-vertical-scrollbox:hover, .chata-table-vertical-scrollbox:focus {\n  visibility: visible;\n}\n\n.autoql-vanilla-chata-table-container {\n    height: 100%;\n    background-color: inherit;\n    visibility: visible;\n    /* overflow: scroll; */\n    /* overflow: hidden; */\n}\n\n/* .chata-table-container:hover{\n    overflow: scroll;\n} */\n\n.autoql-vanilla-table-response, .autoql-vanilla-table-response-renderer{\n    border-collapse: collapse;\n    border-spacing: 0;\n}\n\n.autoql-vanilla-chata-response-content-container .autoql-vanilla-table-header,\n.autoql-vanilla-chata-table-scrollbox .autoql-vanilla-table-header{\n    border-bottom: 2px solid var(--chata-drawer-border-color);\n    position: sticky !important;\n    position: -webkit-sticky !important;\n    top: 0 !important;\n    display: block;\n    visibility: visible;\n}\n\n.autoql-vanilla-table-response-renderer tr:first-of-type{\n    border-bottom: 2px solid #d3d3d352;\n}\n\n.autoql-vanilla-chata-table-scrollbox .autoql-vanilla-table-header th, .autoql-vanilla-table-response-renderer tr th{\n    padding: 8px 12px !important;\n    -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n    width: 100%;\n    white-space: nowrap;\n    font-weight: 700;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    vertical-align: bottom;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 14px;\n    letter-spacing: 0.04em;\n    background: var(--chata-drawer-background-color);\n    position: relative;\n    text-align: center;\n}\n\ntr th.chata-hidden{\n    display: none;\n    width: 0px;\n    visibility: hidden;\n}\n\ntr td.chata-hidden{\n    display: none;\n    width: 0px;\n    visibility: hidden;\n}\n\n.autoql-vanilla-tabulator-arrow {\n  position: absolute;\n  right: 5px;\n  bottom: 13px;\n  display: none;\n}\n.autoql-vanilla-tabulator-arrow.up{\n    width: 0;\n    height: 0;\n    border-left: 6px solid transparent;\n    border-right: 6px solid transparent;\n    border-bottom: 6px solid #bbb;\n}\n.autoql-vanilla-tabulator-arrow.down {\n  width: 0;\n  height: 0;\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-top: 6px solid #bbb;\n}\n\n.autoql-vanilla-table-response tr{\n    border-bottom: 1px solid var(--chata-drawer-border-color);\n    background: var(--chata-drawer-background-color);\n    margin-top: 10px;\n    margin-bottom: 10px;\n    width: 100%;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    overflow: hidden;\n}\n\n.autoql-vanilla-chata-table-scrollbox tr th:hover{\n    background-color: var(--chata-drawer-hover-color);\n    cursor: pointer;\n}\n.autoql-vanilla-chata-table-scrollbox tr th:hover .autoql-vanilla-tabulator-arrow, .autoql-vanilla-table-response-renderer tr th:hover .autoql-vanilla-tabulator-arrow{\n    display: block;\n}\n.autoql-vanilla-table-response tr:hover {\n    background-color: var(--chata-drawer-hover-color);\n    cursor: pointer;\n}\n\n.autoql-vanilla-table-response tr td{\n    text-align: center;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 14px;\n    letter-spacing: 0.04em;\n    color: var(--chata-drawer-text-color-primary);\n    padding: 8px;\n    height: 37px;\n    vertical-align: middle;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n\n.autoql-vanilla-table-response-renderer tr th:hover{\n    background-color: #ececec;\n    cursor: pointer;\n}\n.autoql-vanilla-table-response-renderer tr:hover {\n    background-color: #ececec;\n    cursor: pointer;\n}\n.autoql-vanilla-table-response-renderer tr:first-child:hover {\n    background-color: transparent;\n}\n\n.autoql-vanilla-table-response-renderer tr td{\n    text-align: center;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 14px;\n    letter-spacing: 0.04em;\n    color: #5d5d5d;\n    padding: 8px;\n    height: 37px;\n    vertical-align: middle;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n\n.autoql-vanilla-table-response-renderer tr{\n    border-bottom: 1px solid #d3d3d352;\n    background: #fff;\n    margin-top: 10px;\n    margin-bottom: 10px;\n    width: 100%;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    overflow: hidden;\n}\n\n.autoql-vanilla-chata-toolbar-btn {\n    height: 28px;\n    width: 28px;\n    background: none;\n    border: none;\n    font-size: 16px;\n    line-height: 28px;\n    vertical-align: top;\n    color: var(--chata-drawer-accent-color);\n    cursor: pointer;\n    outline: none !important;\n}\n\n.autoql-vanilla-chata-toolbar-btn:focus{\n    background: none !important;\n}\n\n.autoql-vanilla-chata-toolbar-btn:hover{\n    opacity: .7;\n}\n\n.autoql-vanilla-chat-message-toolbar {\n    display: none;\n    position: absolute;\n    background: var(--chata-drawer-background-color);\n    top: -22px;\n    padding: 5px;\n    border-radius: 6px;\n    line-height: 28px;\n    z-index: 10;\n    border: 1px solid var(--chata-drawer-border-color);\n}\n\n.autoql-vanilla-chat-message-toolbar.right {\n    right: -9px;\n}\n.autoql-vanilla-chat-message-toolbar.left {\n    left: -9px;\n}\n.autoql-vanilla-chat-message-bubble:hover .autoql-vanilla-chat-message-toolbar{\n    display: block;\n}\n\n.autoql-vanilla-chat-message-bubble button:focus{\n    background: inherit;\n}\n\n.autoql-vanilla-table-response .column::-moz-selection { /* Code for Firefox */\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-table-response .column::selection {\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-table-response .column-pivot::-moz-selection { /* Code for Firefox */\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-table-response .column-pivot::selection {\n  color: inherit;\n  background: inherit;\n}\n\n/* .autoql-vanilla-table-response-renderer .column, .column-pivot{\n    padding: 5px 18px !important;\n} */\n.autoql-vanilla-table-response-renderer .column::-moz-selection { /* Code for Firefox */\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-table-response-renderer .column::selection {\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-table-response-renderer .column-pivot::-moz-selection { /* Code for Firefox */\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-table-response-renderer .column-pivot::selection {\n  color: inherit;\n  background: inherit;\n}\n\n.autoql-vanilla-sticky-col {\n    border-right: 2px solid #ddd;\n    text-align: left !important;\n    /* left: 0;\n    position: absolute;\n    top: auto;\n    width: auto; */\n}\n.hm0{\n    opacity: 0.5 !important;\n    fill: currentColor !important;\n}\n.hm1 {\n    fill: currentColor !important;\n}\n.hm2 {\n    opacity: 0.15 !important;\n    fill: currentColor !important;\n    enable-background: new;\n}\n.hm3 {\n    opacity: 0.6 !important;\n    fill: currentColor !important;\n    enable-background: new;\n}\n.hm4 {\n    opacity: 0.65 !important;\n    fill: currentColor !important;\n    enable-background: new;\n}\n.hm5 {\n    fill: currentColor !important;\n}\n\n.hm6 {\n    fill: currentColor !important;\n}\n\n.domain{\n    stroke: transparent;\n    fill: transparent !important;\n}\n.tick{\n    stroke: var(--chata-drawer-border-color);\n    fill-opacity: 0.7;\n}\n.autoql-vanilla-chata-response-content-container line{\n    stroke-width: 1px;\n    stroke: currentColor;\n    opacity: 0.15;\n    shape-rendering: crispedges;\n}\n.autoql-vanilla-chata-response-content-container text{\n    font-family: var(--chata-drawer-font-family);\n    letter-spacing: 0.04em;\n    fill: var(--chata-drawer-text-color-primary);\n}\n\n/* RESPONSE RENDERER */\n.autoql-vanilla-renderer-container{\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n        -ms-flex-align: center;\n            align-items: center;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-align-self: center;\n        -ms-flex-item-align: center;\n            align-self: center;\n}\n.autoql-vanilla-renderer-container line{\n    stroke-width: 1px;\n    stroke: currentColor;\n    opacity: 0.15;\n    shape-rendering: crispedges;\n}\n.autoql-vanilla-renderer-container text{\n    font-family: var(--chata-drawer-font-family);\n    letter-spacing: 0.04em;\n    fill: #5d5d5d;\n}\n\n.autoql-vanilla-chata-chart-container{\n    /* width: 100%;\n    height: 100%; */\n    /* display: block; */\n}\n\ntext.autoql-vanilla-x-axis-label, text.autoql-vanilla-y-axis-label {\n    fill: currentColor;\n    fill-opacity: 0.7;\n    text-anchor: middle;\n    font-weight: bold;\n    font-size: 12px;\n    font-family: var(--chata-drawer-font-family);\n    letter-spacing: 0.04em;\n    white-space: nowrap;\n}\n\n.autoql-vanilla-chata-chart-container .bar.active,\n.autoql-vanilla-chata-chart-container .circle.active,\n.autoql-vanilla-chata-chart-container .square.active,\n.autoql-vanilla-chata-chart-container .line-dot.active {\n    fill: #a5cd39 !important;\n}\n\n.chart-full-width{\n    width: 100%;\n}\n\n.grid line {stroke: currentColor; stroke-opacity: 1;shape-rendering: crispEdges;}\n.grid path {stroke-width: 0;}\n\n.autoql-vanilla-chata-safety-net-container {\n    width: 100%;\n}\n\n.autoql-vanilla-chata-safety-net-description{\n    margin-bottom: 14px;\n}\n\n.autoql-vanilla-chata-safety-net-query {\n    text-align: center;\n}\n\n.autoql-vanilla-chata-safety-net-selector-container {\n    display: inline-block;\n    position: relative;\n    margin-left: -5px;\n}\n\n/* .autoql-vanilla-chata-safetynet-select {\n    position: relative;\n    display: inline-block;\n    height: 30px;\n    background: none;\n    outline: none !important;\n    border: none;\n    font-family: var(--chata-drawer-font-family);\n    letter-spacing: 0.05em;\n    color: #28a8e0;\n    font-size: inherit;\n} */\n\n.autoql-vanilla-chata-select {\n    border: 1px solid rgba(0,0,0,.1);\n    border-radius: 4px;\n    background: #fff;\n    display: inline-block;\n    font-size: 13px;\n    line-height: 32px;\n    height: 34px;\n    margin: 0 3px;\n    padding: 0 11px;\n    color: var(--chata-drawer-accent-color);\n\n    -webkit-transition: all .2s ease;\n\n    transition: all .2s ease;\n    cursor: pointer;\n}\n\n.autoql-vanilla-chata-safetynet-select {\n    -moz-text-align-last: center;\n         text-align-last: center;\n    position: relative;\n    display: inline-block;\n    height: 2em;\n    background: none;\n    outline: none!important;\n    letter-spacing: .05em;\n    font-family: inherit;\n    font-size: inherit;\n    margin: 0 .4em;\n    padding: 0px 5px;\n    border-radius: 0;\n    border: none;\n    border-bottom: 1px dashed;\n    color: var(--chata-drawer-accent-color);\n    cursor: pointer;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    -ms-appearance: none;\n    appearance: none;\n    background-image: none;\n}\n\n.autoql-vanilla-chata-safetynet-select::-ms-expand {\n    display: none;\n}\n\n.autoql-vanilla-chata-safety-net-delete-button {\n    position: relative;\n    cursor: pointer;\n    margin-bottom: -2px;\n}\n\n/* .autoql-vanilla-chata-execute-query-icon {\n    height: 15px;\n    width: 24px;\n    vertical-align: top;\n    fill: #28a8e0;\n} */\n\n.autoql-vanilla-chata-execute-query-icon {\n    font-size: 18px;\n}\n\n.autoql-vanilla-chata-execute-query-icon svg {\n    height: 19px;\n    width: 19px;\n    margin-top: 4px;\n    margin-right: 4px;\n    vertical-align: top;\n    fill: var(--chata-drawer-accent-color);\n}\n\n/* .autoql-vanilla-chata-safety-net-execute-btn {\n    height: 30px;\n    background: none;\n    border-radius: 4px;\n    margin-top: 24px;\n    width: 100%;\n    color: inherit;\n    cursor: pointer;\n    outline: none !important;\n    border-color: #e2e2e26e;\n    transition: all 0.2s ease;\n} */\n\n.autoql-vanilla-chata-safety-net-execute-btn {\n    height: 38px;\n    background: none;\n    border-radius: 4px;\n    margin-top: 24px;\n    width: 100%;\n    color: inherit;\n    cursor: pointer;\n    outline: none!important;\n    border-color: hsla(0,0%,88.6%,.43);\n    -webkit-transition: all .2s ease;\n    transition: all .2s ease;\n}\n\n.autoql-vanilla-chata-safety-net-execute-btn:hover {\n    border-color: #28a8e0;\n}\n\n.chata-execute-query-icon svg {\n    height: 19px;\n    width: 19px;\n    margin-top: 4px;\n    margin-right: 4px;\n    vertical-align: top;\n    fill: var(--chata-output-accent-color);\n}\n\n.autoql-vanilla-chata-help-link-btn {\n    padding: 6px 14px;\n    background: transparent;\n    border-radius: 5px;\n    font-family: var(--chata-drawer-font-family);\n    font-size: 12px;\n    margin-top: 5px;\n    outline: none !important;\n    cursor: pointer;\n    letter-spacing: 0.05em;\n    -webkit-transition: all 0.1s ease;\n    transition: all 0.1s ease;\n    border-color: #e2e2e26e;\n    color: inherit;\n}\n\n.autoql-vanilla-chata-help-link-icon {\n    width: 15px;\n    height: 15px;\n    margin-bottom: -3px;\n    margin-right: 3px;\n}\n\n.autoql-vanilla-stacked-rect:hover{\n    opacity: 1;\n}\n\n.legendCells .disable-group {\n    opacity: 0.2 !important;\n}\n\n.legendCells .cell{\n    cursor: pointer;\n}\n\n.legendCells .cell .label{\n    letter-spacing: 0.04em !important;\n}\n\n.autoql-vanilla-stacked-rect.hidden{\n    opacity: 0;\n}\n\n.label{\n    fill: currentcolor;\n    fill-opacity: 0.7;\n    font-family: inherit;\n    font-size: 10px;\n}\n\n.autoql-vanilla-interpretation-icon {\n    color: var(--chata-drawer-text-color-primary);\n    vertical-align: top;\n    height: 26px;\n    margin: -2px 4px;\n    font-size: 18px;\n}\n\n.autoql-vanilla-tabulator-header-filter {\n    position: relative;\n    -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n    margin-top: 3px;\n    width: 100%;\n    text-align: center;\n    display: none;\n}\n\n.autoql-vanilla-tabulator-header-filter input{\n    border: 1px solid var(--chata-drawer-border-color) !important;\n    border-radius: 4px !important;\n    background: transparent;\n    padding: 4px 9px !important;\n    outline: none !important;\n    width: 100%;\n    font-family: var(--chata-drawer-font-family) !important;\n    color: var(--chata-drawer-text-color-primary) !important;\n    height: 24px !important;\n    -webkit-box-shadow: none !important;\n            box-shadow: none !important;\n    margin: 0px !important;\n    -webkit-box-sizing: border-box !important;\n            box-sizing: border-box !important;\n}\n\n.autoql-vanilla-tabulator-header-filter input:focus{\n    border-color: #28a8e0 !important;\n}\n\n.chart-icon-svg-0, .chata-icon-svg-0 {\n    fill: currentColor;\n}\n\n.pie_chart{\n\n    fill: currentColor !important;\n}\n\n.tippy-tooltip.chata-theme {\n  background-color: black;\n  /* color: var(--chata-drawer-hover-color); */\n  color: white;\n  font-size: 15px;\n  font-family: sans-serif;\n}\n\n.tippy-box[data-theme~='chata-theme'] {\n    background-color: black;\n    /* color: var(--chata-drawer-hover-color); */\n    color: white;\n    font-size: 15px;\n    font-family: sans-serif;\n}\n\n.autoql-vanilla-chata-response-content-container *:focus {\n    outline: none !important;\n}\n\n.autoql-vanilla-chata-single-response:hover{\n    color: rgba(0,0,0,1);\n    text-decoration: underline;\n    cursor: pointer;\n}\n\n.autoql-vanilla-page-switcher-shadow-container {\n  position: absolute;\n  background: transparent;\n  overflow: hidden;\n}\n.autoql-vanilla-page-switcher-shadow-container.right {\n  top: 80px;\n  left: -60px;\n  width: 60px;\n  overflow: hidden;\n}\n.autoql-vanilla-page-switcher-shadow-container.left {\n  top: 80px;\n  right: -60px;\n  width: 60px;\n}\n.autoql-vanilla-page-switcher-shadow-container.top {\n  left: calc(50% - 85px);\n  bottom: -60px;\n  height: 60px;\n}\n.autoql-vanilla-page-switcher-shadow-container.bottom {\n  left: calc(50% - 85px);\n  top: -60px;\n  height: 60px;\n}\n\n/* Container holding the tabs */\n.autoql-vanilla-page-switcher-container.right {\n  margin-top: 20px;\n  margin-left: 20px;\n  margin-bottom: 20px;\n  margin-right: -5px;\n}\n.autoql-vanilla-page-switcher-container.left {\n  margin-top: 20px;\n  margin-right: 20px;\n  margin-bottom: 20px;\n  margin-left: -5px;\n}\n.autoql-vanilla-page-switcher-container.top {\n  margin-right: 20px;\n  margin-left: 20px;\n  margin-bottom: 20px;\n}\n.autoql-vanilla-page-switcher-container.bottom {\n  margin-top: 20px;\n  margin-left: 20px;\n  margin-right: 20px;\n}\n\n/* Individual Tabs */\n.autoql-vanilla-page-switcher-container .tab {\n  position: relative;\n  z-index: 1;\n\n  background: var(--chata-drawer-accent-color);\n  color: #fff;\n\n  padding-left: 0px;\n  padding-top: 10px;\n  padding-bottom: 10px;\n\n  font-size: 18px;\n  text-align: center;\n  -webkit-transform: translate(0, 0);\n          transform: translate(0, 0);\n  -webkit-box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);\n          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);\n  cursor: pointer;\n\n  -webkit-transition-property: background,color,line-height,height,width,margin-right,margin-top,margin-left,margin-bottom,z-index,opacity,-webkit-transform;\n\n  transition-property: background,color,line-height,height,width,margin-right,margin-top,margin-left,margin-bottom,z-index,opacity,-webkit-transform;\n\n  transition-property: background,color,transform,line-height,height,width,margin-right,margin-top,margin-left,margin-bottom,z-index,opacity;\n\n  transition-property: background,color,transform,line-height,height,width,margin-right,margin-top,margin-left,margin-bottom,z-index,opacity,-webkit-transform;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n}\n.autoql-vanilla-page-switcher-container.right .tab {\n  text-align: left;\n  padding-left: 13px;\n  height: 65px;\n  width: 45px;\n  line-height: 52px;\n}\n.autoql-vanilla-page-switcher-container.left .tab {\n  text-align: left;\n  padding-left: 13px;\n  height: 65px;\n  width: 45px;\n  line-height: 52px;\n}\n.autoql-vanilla-page-switcher-container.top .tab,\n.autoql-vanilla-page-switcher-container.bottom .tab {\n  padding-top: 4px;\n  height: 45px;\n  width: 65px;\n  line-height: 45px;\n}\n.autoql-vanilla-page-switcher-container.top .tab {\n  vertical-align: top;\n}\n.autoql-vanilla-page-switcher-container.bottom .tab {\n  background: var(--chata-drawer-background-color);\n  color: var(--chata-drawer-text-color-primary);\n}\n.autoql-vanilla-page-switcher-container .tab.active {\n  background: var(--chata-drawer-background-color);\n  color: var(--chata-drawer-text-color-primary);\n  font-weight: bold;\n  position: relative;\n  z-index: 2;\n}\n.autoql-vanilla-page-switcher-container.bottom .tab.active {\n  background: var(--chata-drawer-accent-color);\n  color: #fff;\n  font-weight: bold;\n}\n.autoql-vanilla-page-switcher-container.top .tab,\n.autoql-vanilla-page-switcher-container.bottom .tab {\n  display: inline-block;\n  margin-right: -4px !important;\n  /* position: absolute; */\n}\n.autoql-vanilla-page-switcher-container .tab:not(.active):hover {\n    opacity: .8;\n}\n\n/* Curve appropriate corners depending on placement */\n.autoql-vanilla-page-switcher-container.right .tab:first-child,\n.autoql-vanilla-page-switcher-container.bottom .tab:first-child {\n  border-top-left-radius: 10px;\n}\n.autoql-vanilla-page-switcher-container.right .tab:last-child,\n.autoql-vanilla-page-switcher-container.top .tab:first-child {\n  border-bottom-left-radius: 10px;\n}\n.autoql-vanilla-page-switcher-container.bottom .tab:last-child,\n.autoql-vanilla-page-switcher-container.left .tab:first-child {\n  border-top-right-radius: 10px;\n}\n.autoql-vanilla-page-switcher-container.left .tab:last-child,\n.autoql-vanilla-page-switcher-container.top .tab:last-child {\n  border-bottom-right-radius: 10px;\n}\n\n.autoql-vanilla-chata-input:disabled {\n    background: rgba(0,0,0,.03) !important;\n}\n\n.autoql-vanilla-chata-input.left-padding {\n    padding-left: 54px !important;\n}\n\n.autoql-vanilla-chat-bar-input-icon {\n    position: absolute;\n    left: 30px;\n    top: 20px;\n    color: #28a8e0;\n}\n\n.autoql-vanilla-querytips-container{\n    font-family: sans-serif;\n    line-height: 1.5;\n    font-size: 14px;\n}\n\n.autoql-vanilla-query-tips-result-container {\n    color: var(--chata-drawer-text-color-primary);\n    padding: 0 20px;\n    text-align: center;\n    max-width: 550px;\n    margin: 0 auto;\n}\n\n.autoql-vanilla-query-tips-result-container .query-tips-result-placeholder {\n    margin-top: 50px;\n    opacity: .6;\n}\n\n.autoql-vanilla-query-tips-result-container .query-tips-result-placeholder p {\n    display: block;\n    -webkit-margin-before: 1em;\n            margin-block-start: 1em;\n    -webkit-margin-after: 1em;\n            margin-block-end: 1em;\n    -webkit-margin-start: 0px;\n            margin-inline-start: 0px;\n    -webkit-margin-end: 0px;\n            margin-inline-end: 0px;\n}\n\n.autoql-vanilla-spinner-loader {\n    display: inline-block;\n    width: 14px;\n    height: 14px;\n    margin-right: 6px;\n}\n\n.autoql-vanilla-spinner-loader:after {\n    content: \" \";\n    display: block;\n    width: 16px;\n    height: 16px;\n    margin: 0px;\n    border-radius: 50%;\n    border: 1px solid currentColor;\n    border-color: currentColor transparent currentColor transparent;\n    -webkit-animation: spinner-loader 1.2s linear infinite;\n            animation: spinner-loader 1.2s linear infinite;\n}\n\n.chat-bar-loading-spinner {\n  position: absolute;\n  right: 20px;\n  top: 22px;\n}\n\n.autoql-vanilla-query-tips-result-container .query-tip-list-container {\n    margin-bottom: 20px;\n}\n\n.autoql-vanilla-query-tips-result-container .query-tip-item:first-child {\n    border-top: none;\n    -webkit-animation-delay: .08s;\n            animation-delay: .08s;\n}\n\n.autoql-vanilla-query-tips-result-container .query-tip-item {\n    position: relative;\n    padding: 13px;\n    border-top: 1px solid rgba(0,0,0,.04);\n    cursor: pointer;\n}\n\n.autoql-vanilla-query-tips-result-container .animated-item {\n    -webkit-animation: fadeIn .3s linear;\n    animation: fadeIn .3s linear;\n    -webkit-animation-fill-mode: both;\n    animation-fill-mode: both;\n}\n\n.autoql-vanilla-query-tips-result-container .query-tip-item:hover {\n    font-weight: bold;\n    color: var(--chata-drawer-accent-color);\n}\n\n.autoql-vanilla-chata-paginate {\n    position: relative;\n    background: transparent;\n    padding: 8px !important;\n    width: 80%;\n    margin: auto;\n    text-align: center;\n}\n\n.autoql-vanilla-chata-paginate ul {\n    display: inline-block;\n    padding-left: 0;\n    margin-bottom: 0;\n    list-style-type: disc;\n    -webkit-margin-before: 1em;\n            margin-block-start: 1em;\n    -webkit-margin-after: 1em;\n            margin-block-end: 1em;\n    -webkit-margin-start: 0px;\n            margin-inline-start: 0px;\n    -webkit-margin-end: 0px;\n            margin-inline-end: 0px;\n    -webkit-padding-start: 40px;\n            padding-inline-start: 40px;\n}\n.autoql-vanilla-chata-paginate .pagination-next, .chata-paginate .pagination-previous {\n    position: absolute;\n    font-size: 18px;\n}\n\n.autoql-vanilla-chata-paginate .pagination-previous {\n    left: 20px;\n}\n\n.autoql-vanilla-chata-paginate .pagination-next a, .chata-paginate .pagination-previous a {\n    color: var(--chata-drawer-accent-color);\n}\n\n.autoql-vanilla-chata-paginate li {\n    display: inline-block;\n    color: var(--chata-drawer-text-color-primary);\n    cursor: pointer;\n    margin-right: 3px;\n    border-radius: 5px;\n    margin-bottom: 0;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n    text-align: center;\n}\n\n.autoql-vanilla-chata-paginate li a {\n    display: inline-block;\n    color: var(--chata-drawer-text-color-primary);\n    outline: none;\n    width: 28px;\n    height: 28px;\n    line-height: 28px;\n    font-size: 14px !important;\n    font-family: var(--chata-drawer-font-family),sans-serif !important;\n    padding: 0px !important;\n}\n\n.autoql-vanilla-chata-paginate li.selected {\n    background: var(--chata-drawer-accent-color);\n    border-radius: 50%;\n    outline: none;\n}\n\n.autoql-vanilla-chata-paginate li.selected a {\n    color: #fff;\n}\n\n.autoql-vanilla-chata-paginate li {\n    display: inline-block;\n    color: var(--chata-drawer-text-color-primary);\n    cursor: pointer;\n    margin-right: 3px;\n    border-radius: 5px;\n    margin-bottom: 0;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n}\n\n.autoql-vanilla-chata-paginate .pagination-next {\n    right: 20px;\n}\n\n.autoql-vanilla-chata-paginate .pagination-next.disabled, .chata-paginate .pagination-previous.disabled {\n    opacity: .5;\n    pointer-events: none;\n}\n\n.autoql-vanilla-chata-btn {\n    border-radius: 4px;\n    cursor: pointer;\n    outline: none!important;\n    -webkit-transition: all .2s ease;\n    transition: all .2s ease;\n    width: auto;\n    display: inline-block;\n}\n\n.autoql-vanilla-chata-btn.disabled {\n    opacity: .4;\n    cursor: not-allowed;\n    pointer-events: none;\n}\n\n.autoql-vanilla-chata-btn.default {\n    color: inherit;\n    border: 1px solid rgba(0,0,0,.15);\n    background: inherit;\n}\n\n.autoql-vanilla-chata-btn.large {\n    padding: 5px 16px;\n    margin: 2px 5px;\n}\n\n.autoql-vanilla-chata-btn.danger:hover {\n    background-color: #ca0b00;\n    color: #fff;\n}\n\n.autoql-vanilla-chata-btn.danger {\n    color: #ca0b00;\n    border: 1px solid #ca0b00;\n    background: inherit;\n}\n\n.autoql-vanilla-chata-btn.primary {\n    background: var(--chata-drawer-accent-color);\n    border: 1px solid var(--chata-drawer-accent-color);\n    color: #fff;\n}\n\n.autoql-vanilla-chata-btn.default:hover{\n    border-color: var(--chata-drawer-accent-color);\n    color: var(--chata-drawer-accent-color);\n}\n\n.autoql-vanilla-chata-btn.primary:hover{\n     opacity: 0.8;\n}\n\n.autoql-vanilla-chata-toolbar-btn.btn-green {\n    color: #2ecc40;\n}\n\n.autoql-vanilla-chata-drawer-resize-handle.right {\n    top: 0;\n    left: -5px;\n    width: 7px;\n    height: 100vh;\n    cursor: ew-resize;\n}\n\n.autoql-vanilla-chata-btn.disabled {\n    opacity: 0.4;\n    cursor: not-allowed;\n    pointer-events: none;\n}\n\n.autoql-vanilla-chata-drawer-resize-handle.left {\n    top: 0;\n    right: -7px;\n    width: 7px;\n    height: 100vh;\n    cursor: ew-resize;\n}\n\n.autoql-vanilla-chata-drawer-resize-handle.bottom {\n    top: -7px;\n    left: 0;\n    height: 7px;\n    width: 100vw;\n    cursor: ns-resize;\n}\n\n.autoql-vanilla-chata-drawer-resize-handle.top {\n    bottom: -7px;\n    left: 0;\n    height: 7px;\n    width: 100vw;\n    cursor: ns-resize;\n}\n\n.autoql-vanilla-chata-drawer-resize-handle {\n    position: absolute;\n    background: transparent;\n    z-index: 100;\n    /* background: red; */\n}\n\n.autoql-vanilla-comparison-value-positive {\n    color: #2ecc40 !important;\n}\n\n.autoql-vanilla-comparison-value-negative {\n    color: #e80000 !important;\n}\n\n.autoql-vanilla-chata-tiny-popover-container {\n    z-index: 9999;\n    border: 1px solid hsla(0,0%,67.1%,.32);\n    border-radius: 4px;\n    -webkit-box-shadow: 0 0 8px rgba(0,0,0,.15);\n            box-shadow: 0 0 8px rgba(0,0,0,.15);\n    -webkit-transition: all .2s ease 0s!important;\n    transition: all .2s ease 0s!important;\n    position: absolute;\n    overflow: hidden;\n}\n\n.autoql-vanilla-chata-tiny-popover-container .chata-context-menu {\n    background: var(--chata-drawer-background-color);\n    width: 150px;\n    padding: 10px 0;\n}\n\n.autoql-vanilla-chata-tiny-popover-container .chata-context-menu .chata-context-menu-list {\n    list-style-type: none;\n    width: 100%;\n    margin: 0;\n    padding: 0;\n}\n\n.autoql-vanilla-chata-tiny-popover-container .chata-context-menu .chata-context-menu-list .chata-context-menu-list li {\n    color: var(--chata-response-text-color-primary);\n    width: 100%;\n    height: 35px;\n    line-height: 35px;\n    padding: 0 20px;\n    cursor: pointer;\n}\n\n.autoql-vanilla-chata-tiny-popover-container .chata-context-menu .chata-context-menu-list li:hover {\n    background: rgba(0,0,0,.05);\n}\n\n.autoql-vanilla-report-problem-text-area {\n    border-radius: 4px;\n    border: 1px solid rgba(0,0,0,.15);\n    margin-top: 10px;\n    padding: 5px 10px;\n    outline: none!important;\n    overflow: auto;\n    resize: vertical;\n}\n\n.autoql-vanilla-no-columns-error-message {\n    /* position: absolute; */\n    height: 100%;\n    width: 100%;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    text-align: center;\n    padding: 20px;\n    font-size: 13px;\n}\n\n.autoql-vanilla-no-columns-error-message .warning-icon {\n    font-size: 22px;\n    display: block;\n    margin-bottom: -13px;\n}\n\n.autoql-vanilla-no-columns-error-message .warning-icon svg line{\n    opacity: 1 !important;\n    color: black;\n}\n\n.autoql-vanilla-no-columns-error-message .warning-icon svg * {\n    fill: unset;\n}\n\n.autoql-vanilla-no-columns-error-message .eye-icon svg * {\n    fill: unset;\n}\n\n.autoql-vanilla-no-columns-error-message .eye-icon {\n    vertical-align: bottom;\n    line-height: 18px;\n}\n\n.autoql-vanilla-chata-axis-selector-arrow{\n    opacity: 1 !important;\n}\n.autoql-vanilla-x-axis-label-border, .autoql-vanilla-y-axis-label-border {\n    stroke: transparent;\n    opacity: .5;\n    -webkit-transition: stroke .3s ease;\n    transition: stroke .3s ease;\n    z-index: 3;\n}\n\n.autoql-vanilla-x-axis-label-border:hover, .autoql-vanilla-y-axis-label-border:hover{\n}\n\n.autoql-vanilla-chart-selector{\n    cursor: pointer;\n}\n.autoql-vanilla-chart-selector:hover .autoql-vanilla-x-axis-label-border,\n.autoql-vanilla-chart-selector:hover .autoql-vanilla-y-axis-label-border {\n    stroke: #508bb8;\n}\n\n.autoql-vanilla-axis-selector-container{\n    z-index: 9999;\n    background: var(--chata-drawer-background-color);\n    padding: 5px 0;\n    max-height: 300px;\n    min-width: 150px;\n    overflow-y: auto;\n}\n\n.autoql-vanilla-axis-selector-container .number-selector-header {\n    margin-top: 10px;\n    font-size: 12px;\n    padding: 0 18px 7px;\n    font-weight: 500;\n    opacity: .6;\n}\n\n.autoql-vanilla-chata-selectable-list{\n\n}\n\n.autoql-vanilla-chata-list-item:not(:last-child) {\n    border-bottom: 1px solid hsla(0,0%,82.7%,.29);\n}\n\n.autoql-vanilla-chata-list-item {\n    padding: 0 20px;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: justify;\n    -webkit-justify-content: space-between;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n    line-height: 36px;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n}\n\n.autoql-vanilla-chata-list-item {\n    padding-left: 25px;\n    padding-right: 15px;\n    font-size: 12px;\n    line-height: 28px;\n}\n.autoql-vanilla-chata-list-item:hover {\n    background: rgba(0,0,0,.03);\n}\n\n.autoql-vanilla-m-checkbox__input {\n    border-color: var(--chata-drawer-accent-color);\n    -webkit-box-sizing: border-box !important;\n            box-sizing: border-box !important;\n    padding: 0 !important;\n    opacity: 1 !important;\n}\n\n.autoql-vanilla-chata-list-item .autoql-vanilla-m-checkbox__input{\n    width: 18px !important;\n    height: 18px !important;\n}\n\n.autoql-vanilla-chata-list-item .autoql-vanilla-m-checkbox__input .autoql-vanilla-chata-checkbox-tick{\n    top: 3px;\n}\n\n@-webkit-keyframes fadeIn {\n  0% {\n    opacity: 0;\n    top: 100px;\n  }\n  75% {\n    opacity: 0.5;\n    top: 0px;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@-webkit-keyframes spinner-loader {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n\n@keyframes spinner-loader {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n\n@-webkit-keyframes bounceIn {\n    0% {\n        opacity: .25;\n        /* -webkit-transform: scale(.3); */\n    }\n    50% {\n        opacity: 50;\n        /* -webkit-transform: scale(1.05); */\n    }\n    70% {\n        opacity: .75;\n        /* -webkit-transform: scale(.9); */\n    }\n    100% {\n        opacity: 1;\n        /* -webkit-transform: scale(1); */\n    }\n}\n@keyframes bounceIn {\n    0% {\n        opacity: .25;\n        /* opacity: 0;\n        transform: scale(.3); */\n    }\n    50% {\n        opacity: 50;\n        /* opacity: 1;\n        transform: scale(1.05); */\n    }\n    70% {\n        opacity: .75;\n        /* transform: scale(.9); */\n    }\n    100% {\n        opacity: 1;\n        /* transform: scale(1); */\n    }\n}\n\n\n/* animations */\n@-webkit-keyframes scale-up-br {\n    0% {\n        -webkit-transform: scale(0.5);\n                transform: scale(0.5);\n        -webkit-transform-origin: 100% 100%;\n                transform-origin: 100% 100%;\n    }\n    100% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n        -webkit-transform-origin: 100% 100%;\n                transform-origin: 100% 100%;\n    }\n}\n@keyframes scale-up-br {\n    0% {\n        -webkit-transform: scale(0.5);\n                transform: scale(0.5);\n        -webkit-transform-origin: 100% 100%;\n                transform-origin: 100% 100%;\n    }\n    100% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n        -webkit-transform-origin: 100% 100%;\n                transform-origin: 100% 100%;\n    }\n}\n\n@-webkit-keyframes scale-up-bl {\n    0% {\n        -webkit-transform: scale(0.5);\n                transform: scale(0.5);\n        -webkit-transform-origin: 0% 100%;\n                transform-origin: 0% 100%;\n    }\n    100% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n        -webkit-transform-origin: 0% 100%;\n                transform-origin: 0% 100%;\n    }\n}\n\n@keyframes scale-up-bl {\n    0% {\n        -webkit-transform: scale(0.5);\n                transform: scale(0.5);\n        -webkit-transform-origin: 0% 100%;\n                transform-origin: 0% 100%;\n    }\n    100% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n        -webkit-transform-origin: 0% 100%;\n                transform-origin: 0% 100%;\n    }\n}\n\n/* animations */\n@-webkit-keyframes response-loading1 {\n    0% {\n        -webkit-transform: scale(0);\n                transform: scale(0);\n    }\n    100% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n    }\n}\n@keyframes response-loading1 {\n    0% {\n        -webkit-transform: scale(0);\n                transform: scale(0);\n    }\n    100% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n    }\n}\n@-webkit-keyframes response-loading3 {\n    0% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n    }\n    100% {\n        -webkit-transform: scale(0);\n                transform: scale(0);\n    }\n}\n@keyframes response-loading3 {\n    0% {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n    }\n    100% {\n        -webkit-transform: scale(0);\n                transform: scale(0);\n    }\n}\n@-webkit-keyframes response-loading2 {\n    0% {\n        -webkit-transform: translate(0, 0);\n                transform: translate(0, 0);\n    }\n    100% {\n        -webkit-transform: translate(19px, 0);\n                transform: translate(19px, 0);\n    }\n}\n@keyframes response-loading2 {\n    0% {\n        -webkit-transform: translate(0, 0);\n                transform: translate(0, 0);\n    }\n    100% {\n        -webkit-transform: translate(19px, 0);\n                transform: translate(19px, 0);\n    }\n}\n\n@-webkit-keyframes slideDown {\n  0% {\n    -webkit-transform: translateY(-100%);\n            transform: translateY(-100%);\n  }\n  100% {\n    -webkit-transform: translateY(0%);\n            transform: translateY(0%);\n  }\n}\n\n@keyframes slideDown {\n  0% {\n    -webkit-transform: translateY(-100%);\n            transform: translateY(-100%);\n  }\n  100% {\n    -webkit-transform: translateY(0%);\n            transform: translateY(0%);\n  }\n}\n");

function DataMessenger(elem, options) {
  var _this = this;

  var obj = this;
  obj.options = {
    authentication: {
      token: undefined,
      apiKey: undefined,
      customerId: undefined,
      userId: undefined,
      username: undefined,
      domain: undefined,
      demo: false
    },
    dataFormatting: {
      currencyCode: 'USD',
      languageCode: 'en-US',
      currencyDecimals: 2,
      quantityDecimals: 1,
      comparisonDisplay: 'PERCENT',
      monthYearFormat: 'MMM YYYY',
      dayMonthYearFormat: 'MMM D, YYYY'
    },
    autoQLConfig: {
      debug: false,
      test: false,
      enableAutocomplete: true,
      enableQueryValidation: true,
      enableQuerySuggestions: true,
      enableColumnVisibilityManager: true,
      enableDrilldowns: true
    },
    themeConfig: {
      theme: 'light',
      chartColors: ['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'],
      accentColor: '#26a7df',
      fontFamily: 'sans-serif'
    },
    isVisible: false,
    placement: 'right',
    width: 500,
    height: 500,
    resizable: true,
    title: 'Data Messenger',
    showHandle: true,
    handleStyles: {},
    onVisibleChange: function onVisibleChange(datamessenger) {},
    onHandleClick: function onHandleClick(datamessenger) {},
    showMask: true,
    shiftScreen: false,
    onMaskClick: function onMaskClick(datamessenger) {},
    maskClosable: true,
    userDisplayName: 'there',
    maxMessages: -1,
    clearOnClose: false,
    enableVoiceRecord: true,
    autocompleteStyles: {},
    enableExploreQueriesTab: true,
    inputPlaceholder: 'Type your queries here',
    enableDynamicCharting: true,
    queryQuickStartTopics: undefined,
    activeIntegrator: '',
    xhr: new XMLHttpRequest()
  };
  obj.autoCompleteTimer = undefined;
  obj.speechToText = (0, _Utils.getSpeech)();
  obj.finalTranscript = '';
  obj.isRecordVoiceActive = false;
  obj.zIndexBubble = 1000000;
  var rootElem = document.querySelector(elem);

  if ('authentication' in options) {
    for (var _i = 0, _Object$entries = Object.entries(options['authentication']); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      obj.options.authentication[key] = value;
    }
  }

  if ('dataFormatting' in options) {
    for (var _i2 = 0, _Object$entries2 = Object.entries(options['dataFormatting']); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          key = _Object$entries2$_i[0],
          value = _Object$entries2$_i[1];

      obj.options.dataFormatting[key] = value;
    }
  }

  if ('autoQLConfig' in options) {
    for (var _i3 = 0, _Object$entries3 = Object.entries(options['autoQLConfig']); _i3 < _Object$entries3.length; _i3++) {
      var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          key = _Object$entries3$_i[0],
          value = _Object$entries3$_i[1];

      obj.options.autoQLConfig[key] = value;
    }
  }

  if ('themeConfig' in options) {
    for (var _i4 = 0, _Object$entries4 = Object.entries(options['themeConfig']); _i4 < _Object$entries4.length; _i4++) {
      var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
          key = _Object$entries4$_i[0],
          value = _Object$entries4$_i[1];

      obj.options.themeConfig[key] = value;
    }
  }

  for (var _i5 = 0, _Object$entries5 = Object.entries(options); _i5 < _Object$entries5.length; _i5++) {
    var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
        key = _Object$entries5$_i[0],
        value = _Object$entries5$_i[1];

    if (_typeof(value) !== 'object') {
      obj.options[key] = value;
    }
  }

  if ('queryQuickStartTopics' in options) {
    obj.options['queryQuickStartTopics'] = options.queryQuickStartTopics;
  }

  if (!('introMessage' in options)) {
    obj.options.introMessage = "Hi " + obj.options.userDisplayName + "! Let’s dive into your data. What can I help you discover today?";
  }

  if (!('onMaskClick' in options)) {
    obj.options.onMaskClick = obj.options.onHandleClick;
  }

  obj.rootElem = rootElem;
  rootElem.classList.add('autoql-vanilla-chata-drawer');
  obj.options.activeIntegrator = (0, _Utils.getActiveIntegrator)(obj.options.authentication.domain);

  obj.setOption = function (option, value) {
    switch (option) {
      case 'authentication':
        obj.setObjectProp('authentication', value);
        break;

      case 'dataFormatting':
        obj.setObjectProp('dataFormatting', value);
        break;

      case 'autoQLConfig':
        obj.setObjectProp('autoQLConfig', value);
        break;

      case 'themeConfig':
        obj.setObjectProp('themeConfig', value);
        obj.applyStyles();
        break;

      case 'isVisible':
        if (!value) obj.closeDrawer();else obj.openDrawer();
        break;

      case 'placement':
        obj.rootElem.removeAttribute('style');
        obj.drawerButton.classList.remove(obj.options.placement + '-btn');
        obj.queryTabs.classList.remove(obj.options.placement);
        obj.queryTabsContainer.classList.remove(obj.options.placement);
        obj.resizeHandler.classList.remove(obj.options.placement);
        obj.options.placement = value;
        obj.drawerButton.classList.add(obj.options.placement + '-btn');
        obj.queryTabs.classList.add(obj.options.placement);
        obj.queryTabsContainer.classList.add(obj.options.placement);
        obj.resizeHandler.classList.add(obj.options.placement);
        obj.openDrawer();
        obj.closeDrawer();
        break;

      case 'width':
        obj.options.width = parseInt(value);

        if (obj.options.isVisible && ['left', 'right'].includes(obj.options.placement)) {
          obj.rootElem.style.width = value;
        }

        break;

      case 'height':
        obj.options.height = parseInt(value);

        if (obj.options.isVisible && ['top', 'bottom'].includes(obj.options.placement)) {
          obj.rootElem.style.height = value;
        }

        break;

      case 'resizable':
        obj.options.resizable = value;
        if (!value) obj.resizeHandler.style.visibility = 'hidden';else obj.resizeHandler.style.visibility = 'visible';
        break;

      case 'title':
        obj.options.title = value;
        obj.headerTitle.innerHTML = obj.options.title;
        break;

      case 'showHandle':
        obj.options.showHandle = value;

        if (value && !obj.options.isVisible) {
          obj.drawerButton.style.display = 'flex';
        } else obj.drawerButton.style.display = 'none';

        break;

      case 'handleStyles':
        obj.applyHandleStyles();
        break;

      case 'showMask':
        obj.options.showMask = value;

        if (value) {
          if (obj.options.isVisible) {
            obj.wrapper.style.opacity = .3;
            obj.wrapper.style.height = '100%';
          } else {
            obj.wrapper.style.opacity = 0;
            obj.wrapper.style.height = 0;
          }
        } else {
          obj.wrapper.style.opacity = 0;
          obj.wrapper.style.height = 0;
        }

        break;

      case 'maxMessages':
        obj.options.maxMessages = value;
        obj.checkMaxMessages();
        break;

      case 'enableVoiceRecord':
        obj.options.autoQLConfig.enableVoiceRecord = value;
        var display = value ? 'block' : 'none';
        obj.voiceRecordButton.style.display = display;
        break;

      case 'enableExploreQueriesTab':
        obj.options.enableExploreQueriesTab = value;

        if (value && obj.options.isVisible) {
          obj.queryTabs.style.visibility = 'visible';
        } else obj.queryTabs.style.visibility = 'hidden';

        break;

      case 'inputPlaceholder':
        obj.options.inputPlaceholder = value;
        obj.input.setAttribute('placeholder', value);

      case 'userDisplayName':
        obj.options.userDisplayName = value;
        obj.options.introMessage = "Hi " + obj.options.userDisplayName + "! Let\u2019s dive into your data.\n                What can I help you discover today?";
        obj.introMessageBubble.textContent = obj.options.introMessage;
        break;

      case 'introMessage':
        obj.options.introMessage = value;
        obj.introMessageBubble.textContent = value;
        break;

      default:
        obj.options[option] = value;
    }
  };

  obj.setObjectProp = function (key, _obj) {
    for (var _i6 = 0, _Object$entries6 = Object.entries(_obj); _i6 < _Object$entries6.length; _i6++) {
      var _Object$entries6$_i = _slicedToArray(_Object$entries6[_i6], 2),
          keyValue = _Object$entries6$_i[0],
          value = _Object$entries6$_i[1];

      obj.options[key][keyValue] = value;
    }
  };

  obj.applyHandleStyles = function () {
    for (var _i7 = 0, _Object$entries7 = Object.entries(obj.options.handleStyles); _i7 < _Object$entries7.length; _i7++) {
      var _Object$entries7$_i = _slicedToArray(_Object$entries7[_i7], 2),
          key = _Object$entries7$_i[0],
          value = _Object$entries7$_i[1];

      obj.drawerButton.style.setProperty(key, value, '');
    }
  };

  obj.createDrawerButton = function () {
    var drawerButton = document.createElement("div");
    var drawerIcon = document.createElement("div");
    drawerIcon.setAttribute("height", "22px");
    drawerIcon.setAttribute("width", "22px");
    drawerIcon.classList.add('autoql-vanilla-chata-bubbles-icon');
    drawerIcon.classList.add('open-action');
    drawerIcon.innerHTML = _Svg.CHATA_BUBBLES_ICON;
    drawerButton.classList.add('autoql-vanilla-drawer-handle');
    drawerButton.classList.add('open-action');
    drawerButton.classList.add(obj.options.placement + '-btn');
    drawerButton.appendChild(drawerIcon);
    drawerButton.addEventListener('click', function (e) {
      obj.options.onHandleClick(obj);
      obj.openDrawer();
    });
    document.body.appendChild(drawerButton);
    obj.drawerButton = drawerButton;

    if (!obj.options.showHandle) {
      obj.drawerButton.style.display = 'none';
    }

    obj.applyHandleStyles();
  };

  obj.openDrawer = function () {
    document.body.classList.add('autoql-vanilla-chata-body-drawer-open');
    obj.rootElem.style.zIndex = 2000;
    obj.options.isVisible = true;
    obj.input.focus();
    obj.initialScroll = window.scrollY;
    var body = document.body;

    if (obj.options.enableExploreQueriesTab) {
      obj.queryTabs.style.visibility = 'visible';
    }

    if (obj.options.showMask) {
      obj.wrapper.style.opacity = .3;
      obj.wrapper.style.height = '100%';
    }

    if (obj.options.placement == 'right') {
      obj.rootElem.style.width = obj.options.width + 'px';
      obj.rootElem.style.height = 'calc(100vh)';
      obj.drawerButton.style.display = 'none';
      obj.rootElem.style.right = 0;
      obj.rootElem.style.top = 0;

      if (obj.options.shiftScreen) {
        window.scrollTo(0, 0);
        body.style.position = 'relative';
        body.style.overflow = 'hidden';
        body.style.transform = 'translateX(-' + obj.options.width + 'px)';
        obj.rootElem.style.transform = 'translateX(' + obj.options.width + 'px)';
      } else {
        obj.rootElem.style.transform = 'translateX(0px)';
      }
    } else if (obj.options.placement == 'left') {
      obj.rootElem.style.width = obj.options.width + 'px';
      obj.rootElem.style.height = 'calc(100vh)';
      obj.rootElem.style.left = 0;
      obj.rootElem.style.top = 0;
      obj.drawerButton.style.display = 'none';

      if (obj.options.shiftScreen) {
        window.scrollTo(0, 0);
        body.style.position = 'relative';
        body.style.overflow = 'hidden';
        body.style.transform = 'translateX(' + obj.options.width + 'px)';
        obj.rootElem.style.transform = 'translateX(-' + obj.options.width + 'px)';
      } else {
        obj.rootElem.style.transform = 'translateX(0px)';
      }
    } else if (obj.options.placement == 'bottom') {
      obj.rootElem.style.width = '100%';
      obj.rootElem.style.height = obj.options.height + 'px';
      obj.rootElem.style.bottom = 0;
      obj.rootElem.style.left = 0;
      obj.drawerButton.style.display = 'none';

      if (obj.options.shiftScreen) {
        window.scrollTo(0, document.body.scrollHeight);
        body.style.position = 'relative';
        body.style.overflow = 'hidden';
        body.style.transform = 'translateY(-' + obj.options.height + 'px)';
        obj.rootElem.style.transform = 'translateY(' + obj.options.height + 'px)';
      } else {
        obj.rootElem.style.transform = 'translateY(0)';
      }
    } else if (obj.options.placement == 'top') {
      obj.rootElem.style.width = '100%';
      obj.rootElem.style.height = obj.options.height + 'px';
      obj.rootElem.style.top = 0;
      obj.rootElem.style.left = 0;
      obj.drawerButton.style.display = 'none';

      if (obj.options.shiftScreen) {
        window.scrollTo(0, 0);
        body.style.position = 'relative';
        body.style.overflow = 'hidden';
        body.style.transform = 'translateY(' + obj.options.height + 'px)';
      } else {
        obj.rootElem.style.transform = 'translateY(0)';
      }
    }

    obj.options.onVisibleChange(obj);
  };

  obj.closeDrawer = function () {
    obj.closePopOver(obj.clearMessagePop);
    (0, _Utils.closeAllChartPopovers)();
    document.body.classList.remove('autoql-vanilla-chata-body-drawer-open');
    obj.options.isVisible = false;
    obj.wrapper.style.opacity = 0;
    obj.wrapper.style.height = 0;
    obj.queryTabs.style.visibility = 'hidden';
    var body = document.body;

    if (obj.options.placement == 'right') {
      obj.rootElem.style.right = 0;
      obj.rootElem.style.top = 0;

      if (obj.options.showHandle) {
        obj.drawerButton.style.display = 'flex';
      }

      if (obj.options.shiftScreen) {
        body.style.transform = 'translateX(0px)';
        window.scrollTo(0, obj.initialScroll);
      } else {
        obj.rootElem.style.transform = 'translateX(' + obj.options.width + 'px)';
      }
    } else if (obj.options.placement == 'left') {
      obj.rootElem.style.left = 0;
      obj.rootElem.style.top = 0;

      if (obj.options.showHandle) {
        obj.drawerButton.style.display = 'flex';
      }

      if (obj.options.shiftScreen) {
        body.style.transform = 'translateX(0px)';
        window.scrollTo(0, obj.initialScroll);
      } else {
        obj.rootElem.style.transform = 'translateX(-' + obj.options.width + 'px)';
      }
    } else if (obj.options.placement == 'bottom') {
      obj.rootElem.style.bottom = '0';
      obj.rootElem.style.transform = 'translateY(' + obj.options.height + 'px)';

      if (obj.options.showHandle) {
        obj.drawerButton.style.display = 'flex';
      }

      if (obj.options.shiftScreen) {
        window.scrollTo(0, obj.initialScroll);
      }
    } else if (obj.options.placement == 'top') {
      obj.rootElem.style.top = '0';
      obj.rootElem.style.transform = 'translateY(-' + obj.options.height + 'px)';

      if (obj.options.showHandle) {
        obj.drawerButton.style.display = 'flex';
      }

      if (obj.options.shiftScreen) {
        window.scrollTo(0, obj.initialScroll);
      }
    }

    if (obj.options.clearOnClose) {
      obj.clearMessages();
    }

    body.removeAttribute('style');
    obj.options.onVisibleChange(obj);
  };

  obj.createWrapper = function () {
    var wrapper = document.createElement('div');
    var body = document.body;
    body.appendChild(wrapper, obj.rootElem);
    wrapper.classList.add('autoql-vanilla-drawer-wrapper');
    obj.wrapper = wrapper;

    if (!obj.options.showMask) {
      obj.wrapper.style.opacity = 0;
      obj.wrapper.style.height = 0;
    }

    wrapper.onclick = function (evt) {
      if (obj.options.showMask && obj.options.maskClosable) {
        obj.options.onMaskClick(_this);
      }
    };
  };

  obj.onLoadHandler = function (evt) {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      obj.initialScroll = window.scrollY;
      obj.createDrawerButton();
      obj.createWrapper();
      obj.applyStyles();
      obj.createHeader();
      obj.createDrawerContent();
      obj.createIntroMessageTopics();
      obj.createBar();
      obj.createResizeHandler();
      obj.createQueryTabs();
      obj.createQueryTips();
      obj.createNotifications();
      obj.speechToTextEvent();
      obj.registerWindowClicks();
      obj.openDrawer();
      obj.closeDrawer();
      (0, _Tooltips.refreshTooltips)();
      var isVisible = obj.options.isVisible;

      if (isVisible) {
        obj.openDrawer();
      } else {
        obj.closeDrawer();
      } // obj.rootElem.addEventListener('click', (evt) => {
      //     // REPLACE WITH onclick event
      //
      // });

    }
  };

  obj.tabsAnimation = function (displayNodes, displayBar) {
    var nodes = obj.drawerContent.childNodes;

    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.display = displayNodes;
    }

    obj.chataBarContainer.style.display = displayBar;

    if (displayNodes == 'none') {
      obj.headerTitle.innerHTML = 'Explore Queries';
      obj.headerRight.style.visibility = 'hidden';
    } else {
      obj.headerTitle.innerHTML = obj.options.title;
      obj.headerRight.style.visibility = 'visible';
    }
  };

  obj.queryTipsAnimation = function (display) {
    obj.queryTips.style.display = display;
  };

  obj.createNotifications = function () {
    var container = (0, _Utils.htmlToElement)("\n            <div\n                style=\"text-align: center; margin-top: 100px;\">\n                <span style=\"opacity: 0.6;\">\n                    You don't have any notifications yet.</span>\n                <br>\n            </div>\n        ");
    var button = (0, _Utils.htmlToElement)("\n            <button class=\"autoql-vanilla-chata-btn primary\"\n            style=\"padding: 5px 16px; margin: 10px 5px 2px;\">\n                Create a New Notification\n            </button>\n        ");
    container.appendChild(button);

    button.onclick = function (evt) {
      var configModal = new Modal({
        withFooter: true,
        destroyOnClose: true
      });
      var modalView = new NotificationSettingsModal();
      configModal.chataModal.style.width = 'vw';
      configModal.addView(modalView);
      configModal.setTitle('Custom Notification');
      configModal.show();
    };

    container.style.display = 'none';
    obj.notificationsContainer = container;
    obj.drawerContent.appendChild(container);
  };

  obj.notificationsAnimation = function (display) {
    obj.notificationsContainer.style.display = display;
  };

  obj.createQueryTabs = function () {
    var orientation = obj.options.placement;
    var pageSwitcherShadowContainer = document.createElement('div');
    var pageSwitcherContainer = document.createElement('div');
    var tabChataUtils = document.createElement('div');
    var tabQueryTips = document.createElement('div');
    var tabNotifications = document.createElement('div');
    var dataMessengerIcon = (0, _Utils.htmlToElement)(_Svg.DATA_MESSENGER);
    var queryTabsIcon = (0, _Utils.htmlToElement)(_Svg.QUERY_TIPS);
    var notificationTabIcon = (0, _Utils.htmlToElement)(_Svg.NOTIFICATIONS_ICON);
    pageSwitcherShadowContainer.classList.add('autoql-vanilla-page-switcher-shadow-container');
    pageSwitcherShadowContainer.classList.add(orientation);
    pageSwitcherContainer.classList.add('autoql-vanilla-page-switcher-container');
    pageSwitcherContainer.classList.add(orientation);
    pageSwitcherShadowContainer.appendChild(pageSwitcherContainer);
    tabChataUtils.classList.add('tab');
    tabChataUtils.classList.add('active');
    tabChataUtils.setAttribute('data-tippy-content', 'Data Messenger');
    tabQueryTips.classList.add('tab');
    tabQueryTips.setAttribute('data-tippy-content', 'Explore Queries');
    tabNotifications.classList.add('tab');
    tabNotifications.setAttribute('data-tippy-content', 'Notifications');
    tabChataUtils.appendChild(dataMessengerIcon);
    tabQueryTips.appendChild(queryTabsIcon);
    tabNotifications.appendChild(notificationTabIcon);
    pageSwitcherContainer.appendChild(tabChataUtils);
    pageSwitcherContainer.appendChild(tabQueryTips); // pageSwitcherContainer.appendChild(tabNotifications)

    tabChataUtils.onclick = function (event) {
      tabChataUtils.classList.add('active');
      tabQueryTips.classList.remove('active');
      tabNotifications.classList.remove('active');
      obj.tabsAnimation('flex', 'block');
      obj.queryTipsAnimation('none');
      obj.notificationsAnimation('none');
    };

    tabQueryTips.onclick = function (event) {
      tabQueryTips.classList.add('active');
      tabChataUtils.classList.remove('active');
      tabNotifications.classList.remove('active');
      obj.tabsAnimation('none', 'none');
      obj.queryTipsAnimation('block');
      obj.notificationsAnimation('none');
    };

    tabNotifications.onclick = function (event) {
      tabNotifications.classList.add('active');
      tabQueryTips.classList.remove('active');
      tabChataUtils.classList.remove('active');
      obj.tabsAnimation('none', 'none');
      obj.queryTipsAnimation('none');
      obj.notificationsAnimation('block');
    };

    var tabs = pageSwitcherShadowContainer;
    obj.rootElem.appendChild(tabs);
    obj.queryTabs = tabs;
    obj.queryTabsContainer = pageSwitcherContainer;
    obj.tabChataUtils = tabChataUtils;
    obj.tabQueryTips = tabQueryTips;
    obj.tabNotifications = tabNotifications;
    (0, _Tooltips.refreshTooltips)();
  };

  obj.createQueryTips = function () {
    var searchIcon = (0, _Utils.htmlToElement)(_Svg.SEARCH_ICON);
    var container = document.createElement('div');
    var textBar = document.createElement('div');
    var queryTipsResultContainer = document.createElement('div');
    var queryTipsResultPlaceHolder = document.createElement('div');
    var chatBarInputIcon = document.createElement('div');
    var input = document.createElement('input');
    textBar.classList.add('autoql-vanilla-text-bar');
    textBar.classList.add('autoql-vanilla-text-bar-animation');
    chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
    container.classList.add('autoql-vanilla-querytips-container');
    queryTipsResultContainer.classList.add('autoql-vanilla-query-tips-result-container');
    queryTipsResultPlaceHolder.classList.add('query-tips-result-placeholder');
    queryTipsResultPlaceHolder.innerHTML = "\n            <p>\n                Discover what you can ask by entering\n                a topic in the search bar above.\n            <p>\n            <p>\n                Simply click on any of the returned options\n                to run the query in Data Messenger.\n            <p>\n        ";
    queryTipsResultContainer.appendChild(queryTipsResultPlaceHolder);
    chatBarInputIcon.appendChild(searchIcon);
    textBar.appendChild(input);
    textBar.appendChild(chatBarInputIcon);
    container.appendChild(textBar);
    container.appendChild(queryTipsResultContainer);

    input.onkeypress = function (event) {
      if (event.keyCode == 13 && this.value) {
        var chatBarLoadingSpinner = document.createElement('div');
        var searchVal = this.value;
        var spinnerLoader = document.createElement('div');
        spinnerLoader.classList.add('autoql-vanilla-spinner-loader');
        chatBarLoadingSpinner.classList.add('chat-bar-loading-spinner');
        chatBarLoadingSpinner.appendChild(spinnerLoader);
        textBar.appendChild(chatBarLoadingSpinner);
        var options = obj.options;
        var URL = obj.getRelatedQueriesPath(1, searchVal, obj.options);

        _ChataUtils.ChataUtils.safetynetCall(URL, function (response, s) {
          textBar.removeChild(chatBarLoadingSpinner);
          obj.putRelatedQueries(response, queryTipsResultContainer, container, searchVal);
        }, obj.options);
      }
    };

    container.style.display = 'none';
    input.classList.add('autoql-vanilla-chata-input');
    input.classList.add('left-padding');
    input.setAttribute('placeholder', 'Search relevant queries by topic');
    obj.queryTips = container;
    obj.drawerContent.appendChild(container);
    obj.queryTipsInput = input;
  };

  obj.keyboardAnimation = function (text) {
    var chataInput = obj.input;
    chataInput.focus();
    var subQuery = '';
    var index = 0;

    var _int = setInterval(function () {
      subQuery += text[index];

      if (index >= text.length) {
        clearInterval(_int);
        var ev = new KeyboardEvent('keypress', {
          keyCode: 13,
          type: "keypress",
          which: 13
        });
        chataInput.dispatchEvent(ev);
      } else {
        chataInput.value = subQuery;
      }

      index++;
    }, 85);
  };

  obj.putRelatedQueries = function (response, queryTipsResultContainer, container, searchVal) {
    var delay = 0.08;
    var list = response.data.items;
    var queryTipListContainer = document.createElement('div');
    var paginationContainer = document.createElement('div');
    var pagination = document.createElement('ul');
    var paginationPrevious = document.createElement('li');
    var aPrevious = document.createElement('a');
    var aNext = document.createElement('a');
    var paginationNext = document.createElement('li');
    var options = obj.options;
    var nextPath = response.data.pagination.next_url;
    var previousPath = response.data.pagination.previous_url;
    var nextUrl = "".concat(options.authentication.domain).concat(nextPath);
    var previousUrl = "".concat(options.authentication.domain).concat(previousPath);
    var pageSize = response.data.pagination.page_size;
    var totalItems = response.data.pagination.total_items;
    var pages = response.data.pagination.total_pages;
    var currentPage = response.data.pagination.current_page;
    aPrevious.textContent = '←';
    aNext.textContent = '→';
    paginationContainer.classList.add('autoql-vanilla-chata-paginate');
    paginationContainer.classList.add('animated-item');
    paginationContainer.classList.add('pagination');
    paginationPrevious.classList.add('pagination-previous');
    paginationNext.classList.add('pagination-next');
    paginationPrevious.appendChild(aPrevious);
    paginationNext.appendChild(aNext);
    pagination.appendChild(paginationPrevious);
    queryTipListContainer.classList.add('query-tip-list-container');

    if (!nextPath) {
      paginationNext.classList.add('disabled');
    }

    if (!previousPath) {
      paginationPrevious.classList.add('disabled');
    }

    paginationNext.onclick = function (evt) {
      if (!evt.target.classList.contains('disabled')) {
        _ChataUtils.ChataUtils.safetynetCall(nextUrl, function (response, s) {
          obj.putRelatedQueries(response, queryTipsResultContainer, container, searchVal);
        }, obj.options);
      }
    };

    paginationPrevious.onclick = function (evt) {
      if (!evt.target.classList.contains('disabled')) {
        _ChataUtils.ChataUtils.safetynetCall(previousUrl, function (response, s) {
          obj.putRelatedQueries(response, queryTipsResultContainer, container, searchVal);
        }, obj.options);
      }
    };

    var dotEvent = function dotEvent(evt) {
      var page = evt.target.dataset.page;
      var path = obj.getRelatedQueriesPath(page, searchVal, obj.options);

      _ChataUtils.ChataUtils.safetynetCall(path, function (response, s) {
        obj.putRelatedQueries(response, queryTipsResultContainer, container, searchVal);
      }, obj.options);
    };

    for (var i = 0; i < list.length; i++) {
      var item = document.createElement('div');
      item.classList.add('animated-item');
      item.classList.add('query-tip-item');
      item.innerHTML = list[i];
      item.style.animationDelay = delay * i + 's';

      item.onclick = function (event) {
        obj.tabChataUtils.classList.add('active');
        obj.tabQueryTips.classList.remove('active');
        obj.tabsAnimation('flex', 'block');
        obj.queryTipsAnimation('none');
        obj.notificationsAnimation('none');
        var selectedQuery = event.target.textContent;
        obj.keyboardAnimation(selectedQuery);
      };

      queryTipListContainer.appendChild(item);
    }

    queryTipsResultContainer.innerHTML = '';
    queryTipsResultContainer.appendChild(queryTipListContainer); // var totalPages = pages > 5 ? 5 : pages;

    for (var i = 0; i < 3; i++) {
      if (i >= pages) break;
      var li = document.createElement('li');
      var a = document.createElement('a');

      if (i == currentPage - 1) {
        li.classList.add('selected');
      }

      li.appendChild(a);
      pagination.appendChild(li);

      if (i == 2) {
        if (currentPage == 3) {
          a.textContent = currentPage;
          var rightDots = document.createElement('li');
          var aDots = document.createElement('a');
          aDots.textContent = '...';
          rightDots.appendChild(aDots);
          pagination.appendChild(rightDots);
          aDots.setAttribute('data-page', currentPage + 1);
          rightDots.onclick = dotEvent;
        } else if (currentPage > 3 && currentPage <= pages - 2) {
          a.textContent = currentPage;
          li.classList.add('selected');
          var rightDots = document.createElement('li');
          var aDots = document.createElement('a');
          aDots.textContent = '...';
          rightDots.appendChild(aDots);
          aDots.setAttribute('data-page', currentPage + 1);
          var leftDots = document.createElement('li');
          var aDotsLeft = document.createElement('a');
          aDotsLeft.textContent = '...';
          leftDots.appendChild(aDotsLeft);
          aDotsLeft.setAttribute('data-page', currentPage - 1);
          pagination.insertBefore(leftDots, li);

          if (currentPage < pages - 2) {
            pagination.appendChild(rightDots);
          }

          rightDots.onclick = dotEvent;
          leftDots.onclick = dotEvent;
        } else {
          a.textContent = '...';
        }
      } else {
        a.textContent = i + 1;
      }

      if (currentPage > pages - 2) {
        a.setAttribute('data-page', currentPage - 1);
      } else {
        a.setAttribute('data-page', i + 1);
      }

      li.onclick = dotEvent;
    }

    if (pages > 3) {
      for (var i = pages - 2; i < pages; i++) {
        if (i >= pages) break;
        var li = document.createElement('li');
        var a = document.createElement('a');

        if (i == currentPage - 1) {
          li.classList.add('selected');
        }

        li.appendChild(a);
        a.textContent = i + 1;
        a.setAttribute('data-page', i + 1);

        li.onclick = function (evt) {
          var page = evt.target.dataset.page;
          var path = obj.getRelatedQueriesPath(page, searchVal, obj.options);

          _ChataUtils.ChataUtils.safetynetCall(path, function (response, s) {
            obj.putRelatedQueries(response, queryTipsResultContainer, container, searchVal);
          }, obj.options);
        };

        pagination.appendChild(li);
      }
    }

    pagination.appendChild(paginationNext);

    if (totalItems != 0) {
      paginationContainer.appendChild(pagination);
    } else {
      queryTipsResultContainer.appendChild(document.createTextNode("\n                Sorry, I couldn\u2019t find any queries matching your input. Try entering a different topic or keyword instead.\n            "));
    }

    container.appendChild(paginationContainer);

    if (obj.pagination) {
      container.removeChild(obj.pagination);
    }

    obj.pagination = paginationContainer;
  };

  obj.getRelatedQueriesPath = function (page, searchVal, options) {
    var url = options.authentication.demo ? "https://backend-staging.chata.ai/autoql/api/v1/query/related-queries" : "".concat(options.authentication.domain, "/autoql/api/v1/query/related-queries?key=").concat(options.authentication.apiKey, "&search=").concat(searchVal, "&page_size=15&page=").concat(page);
    return url;
  };

  obj.getRecommendationPath = function (options, text) {
    return "".concat(options.authentication.domain, "/autoql/api/v1/query/related-queries?key=").concat(options.authentication.apiKey, "&search=").concat(text, "&scope=narrow");
  };

  obj.createResizeHandler = function () {
    var resize = document.createElement('div');
    var startX, startY, startWidth, startHeight;
    var timer;
    resize.classList.add('autoql-vanilla-chata-drawer-resize-handle');
    resize.classList.add(obj.options.placement);

    function resizeItem(e) {
      var newWidth;
      var newHeight;

      switch (obj.options.placement) {
        case 'left':
          newWidth = startWidth + e.clientX - startX;
          break;

        case 'right':
          newWidth = startWidth + startX - e.clientX;
          break;

        case 'top':
          newHeight = startHeight + e.clientY - startY;
          break;

        case 'bottom':
          newHeight = startHeight + startY - e.clientY;
          break;

        default:
      }

      if (['left', 'right'].includes(obj.options.placement)) {
        obj.rootElem.style.width = newWidth + 'px';
        obj.options.width = newWidth;
      } else {
        obj.rootElem.style.height = newHeight + 'px';
        obj.options.height = newHeight;
      }

      clearTimeout(timer);
      timer = setTimeout(function () {
        window.dispatchEvent(new CustomEvent('chata-resize', {}));
      }, 100);
    }

    function stopResize(e) {
      window.removeEventListener('mousemove', resizeItem, false);
      window.removeEventListener('mouseup', stopResize, false);
    }

    function initResize(e) {
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(obj.rootElem).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(obj.rootElem).height, 10);
      window.addEventListener('mousemove', resizeItem, false);
      window.addEventListener('mouseup', stopResize, false);
    }

    resize.addEventListener('mousedown', initResize, false);
    obj.rootElem.appendChild(resize);
    obj.resizeHandler = resize;

    if (!obj.options.resizable) {
      obj.resizeHandler.style.visibility = 'hidden';
    }
  };

  obj.registerWindowClicks = function () {
    var excludeElementsForClearMessages = ['clear-all', 'autoql-vanilla-clear-messages-confirm-popover', 'autoql-vanilla-chata-confirm-text', 'autoql-vanilla-chata-confirm-icon'];
    obj.rootElem.addEventListener('click', function (evt) {
      var closePop = true;
      var closeAutoComplete = true;

      if (evt.target.classList.contains('autoql-vanilla-chata-input')) {
        closeAutoComplete = false;
      }

      for (var i = 0; i < excludeElementsForClearMessages.length; i++) {
        var c = excludeElementsForClearMessages[i];

        if (evt.target.classList.contains(c)) {
          closePop = false;
          break;
        }
      }

      if (closePop) {
        obj.closePopOver(obj.clearMessagePop);
      }

      if (closeAutoComplete) {
        obj.autoCompleteList.style.display = 'none';
      }

      if (evt.target.classList.contains('suggestion')) {
        obj.autoCompleteList.style.display = 'none';
        obj.sendMessage(evt.target.textContent, 'data_messenger.user');
      }
    });
  };

  obj.createDrawerContent = function () {
    var drawerContent = document.createElement('div');
    var firstMessage = document.createElement('div');
    var chatMessageBubble = document.createElement('div');
    var scrollBox = document.createElement('div');
    scrollBox.classList.add('autoql-vanilla-chata-scrollbox');
    chatMessageBubble.textContent = obj.options.introMessage;
    drawerContent.classList.add('autoql-vanilla-drawer-content');
    firstMessage.classList.add('autoql-vanilla-chat-single-message-container');
    firstMessage.classList.add('response');
    chatMessageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    chatMessageBubble.classList.add('text');
    firstMessage.appendChild(chatMessageBubble);
    drawerContent.appendChild(firstMessage);
    scrollBox.appendChild(drawerContent);
    obj.rootElem.appendChild(scrollBox);
    obj.drawerContent = drawerContent;
    obj.scrollBox = scrollBox;
    obj.introMessageBubble = chatMessageBubble;
  };

  obj.createIntroMessageTopics = function () {
    var topics = obj.options.queryQuickStartTopics;

    if (topics) {
      var topicsWidget = new _Cascader.Cascader(topics, obj);
      obj.drawerContent.appendChild(topicsWidget._elem);
      obj.topicsWidget = topicsWidget;
    }
  };

  obj.createHeader = function () {
    var chatHeaderContainer = document.createElement('div');
    var closeButton = (0, _Utils.htmlToElement)("\n            <button\n                class=\"autoql-vanilla-chata-button close-action\"\n                data-tippy-content=\"Close Drawer\" currentitem=\"false\">\n                ".concat(_Svg.CLOSE_ICON, "\n            </button>\n        "));
    var clearAllButton = (0, _Utils.htmlToElement)("\n            <button class=\"autoql-vanilla-chata-button clear-all\"\n            data-tippy-content=\"Clear Messages\">\n                ".concat(_Svg.CLEAR_ALL, "\n            </button>\n        "));
    var headerLeft = (0, _Utils.htmlToElement)("\n            <div class=\"chata-header-left\">\n            </div>\n        ");
    var headerTitle = (0, _Utils.htmlToElement)("\n            <div class=\"autoql-vanilla-chata-header-center-container\">\n                ".concat(obj.options.title, "\n            </div>\n        "));
    var headerRight = (0, _Utils.htmlToElement)("\n            <div class=\"chata-header-right-container\">\n            </div>\n        ");
    var popover = (0, _Utils.htmlToElement)("\n            <div class=\"autoql-vanilla-popover-container\">\n                <div class=\"autoql-vanilla-clear-messages-confirm-popover\">\n                    <div class=\"autoql-vanilla-chata-confirm-text\">\n                        ".concat(_Svg.POPOVER_ICON, "\n                        Clear all queries & responses?\n                    </div>\n                    <button class=\"autoql-vanilla-chata-confirm-btn no\">\n                        Cancel\n                    </button>\n                    <button class=\"autoql-vanilla-chata-confirm-btn yes\">\n                        Clear\n                    </button>\n                </div>\n            </div>\n        "));
    chatHeaderContainer.classList.add('autoql-vanilla-chat-header-container');

    closeButton.onclick = function (evt) {
      obj.closeDrawer();
    };

    clearAllButton.onclick = function (evt) {
      (0, _Utils.closeAllChartPopovers)();
      popover.style.visibility = 'visible';
      popover.style.opacity = 1;
    };

    popover.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('autoql-vanilla-chata-confirm-btn')) {
        obj.closePopOver(popover);

        if (evt.target.classList.contains('yes')) {
          obj.clearMessages();
        }
      }
    });
    headerLeft.appendChild(closeButton);
    headerRight.appendChild(clearAllButton);
    headerRight.appendChild(popover);
    chatHeaderContainer.appendChild(headerLeft);
    chatHeaderContainer.appendChild(headerTitle);
    chatHeaderContainer.appendChild(headerRight);
    obj.rootElem.appendChild(chatHeaderContainer);
    obj.headerRight = headerRight;
    obj.headerTitle = headerTitle;
    obj.clearMessagePop = popover;
  };

  obj.closePopOver = function (popover) {
    popover.style.visibility = 'hidden';
    popover.style.opacity = 0;
  };

  obj.clearMessages = function () {
    var size = 0;
    if (obj.options.queryQuickStartTopics) size = 1;
    [].forEach.call(obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container'), function (e, index) {
      if (index > size) {
        e.parentNode.removeChild(e);
      }
    });
  };

  obj.autoCompleteHandler = function (evt) {
    if (obj.options.autoQLConfig.enableAutocomplete) {
      obj.autoCompleteList.style.display = 'none';
      clearTimeout(obj.autoCompleteTimer);

      if (evt.target.value) {
        obj.autoCompleteTimer = setTimeout(function () {
          _ChataUtils.ChataUtils.autocomplete(evt.target.value, obj.autoCompleteList, 'suggestion', obj.options);
        }, 150);
      }
    }
  };

  obj.onEnterHandler = function (evt) {
    if (evt.keyCode == 13 && obj.input.value) {
      try {
        obj.options.xhr.abort();
      } catch (e) {}

      clearTimeout(obj.autoCompleteTimer);
      obj.autoCompleteList.style.display = 'none';
      obj.sendMessage(obj.input.value, 'data_messenger.user');
    }
  };

  obj.createBar = function () {
    var placeholder = obj.options.inputPlaceholder;
    var chataBarContainer = document.createElement('div');
    var autoComplete = document.createElement('div');
    var autoCompleteList = document.createElement('ul');
    var textBar = document.createElement('div');
    var chataInput = document.createElement('input');
    var voiceRecordButton = document.createElement('button');
    var display = obj.options.enableVoiceRecord ? 'block' : 'none';
    var watermark = (0, _Utils.htmlToElement)("\n            <div class=\"autoql-vanilla-watermark\">\n                ".concat(_Svg.WATERMARK, "\n                We run on AutoQL by Chata\n            </div>\n        "));
    chataBarContainer.classList.add('autoql-vanilla-chata-bar-container');
    chataBarContainer.classList.add('autoql-vanilla-chat-drawer-chat-bar');
    chataBarContainer.classList.add('autoql-vanilla-autosuggest-top');
    autoComplete.classList.add('autoql-vanilla-auto-complete-suggestions');
    autoCompleteList.classList.add('autoql-vanilla-auto-complete-list');
    textBar.classList.add('autoql-vanilla-text-bar');
    chataInput.classList.add('autoql-vanilla-chata-input');
    chataInput.setAttribute('autocomplete', 'off');
    chataInput.setAttribute('placeholder', placeholder);
    voiceRecordButton.classList.add('autoql-vanilla-chat-voice-record-button');
    voiceRecordButton.classList.add('chata-voice');
    voiceRecordButton.setAttribute('data-tippy-content', 'Hold for voice-to-text');
    voiceRecordButton.innerHTML = _Svg.VOICE_RECORD_IMAGE;
    autoComplete.appendChild(autoCompleteList);
    textBar.appendChild(chataInput);
    textBar.appendChild(voiceRecordButton);
    chataBarContainer.appendChild(watermark);
    chataBarContainer.appendChild(autoComplete);
    chataBarContainer.appendChild(textBar);

    chataInput.onfocus = function (evt) {
      obj.autoCompleteHandler(evt);
    };

    voiceRecordButton.onmouseup = function (evt) {
      obj.speechToText.stop();
      voiceRecordButton.style.backgroundColor = obj.options.themeConfig.accentColor;
      obj.input.value = obj.finalTranscript;
      obj.isRecordVoiceActive = false;
    };

    voiceRecordButton.onmousedown = function (evt) {
      obj.speechToText.start();
      voiceRecordButton.style.backgroundColor = '#FF471A';
      obj.isRecordVoiceActive = true;
    };

    obj.chataBarContainer = chataBarContainer;
    obj.input = chataInput;
    obj.voiceRecordButton = voiceRecordButton;
    obj.autoCompleteList = autoCompleteList;
    obj.rootElem.appendChild(chataBarContainer);
    obj.input.onkeyup = obj.autoCompleteHandler;
    obj.input.onkeypress = obj.onEnterHandler;
  };

  obj.speechToTextEvent = function () {
    if (obj.speechToText) {
      obj.speechToText.onresult = function (e) {
        var interimTranscript = '';

        for (var i = e.resultIndex, len = e.results.length; i < len; i++) {
          var transcript = e.results[i][0].transcript;

          if (e.results[i].isFinal) {
            obj.finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (obj.finalTranscript !== '') {
          obj.input.value = obj.finalTranscript;
          obj.speechToText.stop();
          obj.voiceRecordButton.style.backgroundColor = obj.options.themeConfig.accentColor;
        }
      };
    }
  };

  obj.applyStyles = function () {
    var themeStyles = obj.options.themeConfig.theme === 'light' ? _Constants.LIGHT_THEME : DARK_THEME;

    if (options.themeConfig) {
      if ('accentColor' in options.themeConfig) {
        themeStyles['--chata-drawer-accent-color'] = options.themeConfig.accentColor;
        obj.options.themeConfig.accentColor = options.themeConfig.accentColor;
      }
    }

    for (var property in themeStyles) {
      document.documentElement.style.setProperty(property, themeStyles[property]);
    }

    obj.rootElem.style.setProperty('--chata-drawer-font-family', obj.options.themeConfig['fontFamily']);
  };

  obj.checkMaxMessages = function () {
    if (obj.options.maxMessages > 2) {
      var messages = obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container');

      if (messages.length > obj.options.maxMessages) {
        messages[1].parentNode.removeChild(messages[1]);
      }
    }
  };

  obj.getActionOption = function (svg, text, onClick, params) {
    return _ChataUtils.ChataUtils.getActionOption(svg, text, onClick, params);
  };

  obj.getPopover = function () {
    return _ChataUtils.ChataUtils.getPopover();
  };

  obj.getMoreOptionsMenu = function (options, idRequest, type) {
    return _ChataUtils.ChataUtils.getMoreOptionsMenu(options, idRequest, type);
  };

  obj.getReportProblemMenu = function (toolbar, idRequest, type) {
    return _ChataUtils.ChataUtils.getReportProblemMenu(toolbar, idRequest, type, obj.options);
  };

  obj.getActionButton = function (svg, tooltip, idRequest, onClick, evtParams) {
    return _ChataUtils.ChataUtils.getActionButton(svg, tooltip, idRequest, onClick, evtParams);
  };

  obj.reportProblemHandler = function (evt, idRequest, reportProblem, toolbar) {
    closeAllToolbars();
    reportProblem.classList.toggle('show');
    toolbar.classList.toggle('show');
    var y = mouseY(evt) + reportProblem.clientHeight + 120;
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
  };

  obj.moreOptionsHandler = function (evt, idRequest, moreOptions, toolbar) {
    closeAllToolbars();
    var y = mouseY(evt) + moreOptions.clientHeight + 120;
    moreOptions.classList.toggle('show');
    toolbar.classList.toggle('show');
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
  };

  obj.filterTableHandler = function (evt, idRequest) {
    var table = document.querySelector("[data-componentid=\"".concat(idRequest, "\"]"));
    var tabulator = table.tabulator;
    tabulator.toggleFilters();
  };

  obj.openColumnEditorHandler = function (evt, idRequest) {
    obj.showColumnEditor(idRequest);
  };

  obj.getLastMessageBubble = function () {
    var bubbles = obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container');
    return bubbles[bubbles.length - 1];
  };

  obj.deleteMessageHandler = function (evt, idRequest) {
    var bubble = obj.drawerContent.querySelector("[data-bubble-id=\"".concat(idRequest, "\"]"));
    obj.drawerContent.removeChild(bubble);

    if (bubble.relatedMessage) {
      obj.drawerContent.removeChild(bubble.relatedMessage);
    }
  };

  obj.getActionToolbar = function (idRequest, type, displayType) {
    var request = _ChataUtils.ChataUtils.responses[idRequest];
    var moreOptionsArray = [];
    var toolbar = (0, _Utils.htmlToElement)("\n            <div class=\"autoql-vanilla-chat-message-toolbar right\">\n            </div>\n        ");
    var reportProblem = obj.getReportProblemMenu(toolbar, idRequest, type);
    reportProblem.classList.add('report-problem');
    var reportProblemButton = obj.getActionButton(_Svg.REPORT_PROBLEM, 'Report a problem', idRequest, obj.reportProblemHandler, [reportProblem, toolbar]);

    switch (type) {
      case 'simple':
        if (request['reference_id'] !== '1.1.420' && request['reference_id'] !== '1.9.502') {
          toolbar.appendChild(reportProblemButton);
          moreOptionsArray.push('copy_sql');
        }

        toolbar.appendChild(obj.getActionButton(_Svg.DELETE_MESSAGE, 'Delete Message', idRequest, obj.deleteMessageHandler, [reportProblem, toolbar]));
        break;

      case 'csvCopy':
        var filterBtn = obj.getActionButton(_Svg.FILTER_TABLE, 'Filter Table', idRequest, obj.filterTableHandler, []);
        toolbar.appendChild(filterBtn);
        filterBtn.setAttribute('data-name-option', 'filter-action');
        var columnVisibility = obj.options.autoQLConfig.enableColumnVisibilityManager;

        if (columnVisibility && displayType !== 'pivot_table') {
          toolbar.appendChild(obj.getActionButton(_Svg.COLUMN_EDITOR, 'Show/Hide Columns', idRequest, obj.openColumnEditorHandler, []));
        }

        if (request['reference_id'] !== '1.1.420') {
          toolbar.appendChild(reportProblemButton);
        }

        toolbar.appendChild(obj.getActionButton(_Svg.DELETE_MESSAGE, 'Delete Message', idRequest, obj.deleteMessageHandler, [reportProblem, toolbar]));
        moreOptionsArray.push('csv');
        moreOptionsArray.push('copy');
        moreOptionsArray.push('copy_sql');
        break;

      case 'chart-view':
        if (request['reference_id'] !== '1.1.420') {
          toolbar.appendChild(reportProblemButton);
        }

        toolbar.appendChild(obj.getActionButton(_Svg.DELETE_MESSAGE, 'Delete Message', idRequest, obj.deleteMessageHandler, [reportProblem, toolbar]));
        moreOptionsArray.push('png');
        moreOptionsArray.push('copy_sql');
        break;

      case 'safety-net':
        toolbar.appendChild(obj.getActionButton(_Svg.DELETE_MESSAGE, 'Delete Message', idRequest, obj.deleteMessageHandler, [reportProblem, toolbar]));
        break;

      default:
    }

    var moreOptions = obj.getMoreOptionsMenu(moreOptionsArray, idRequest, type);
    var moreOptionsBtn = obj.getActionButton(_Svg.VERTICAL_DOTS, 'More options', idRequest, obj.moreOptionsHandler, [moreOptions, toolbar]);
    moreOptionsBtn.classList.add('autoql-vanilla-more-options');

    if (request['reference_id'] !== '1.1.420' && type !== 'safety-net' && request['reference_id'] !== '1.9.502') {
      toolbar.appendChild(moreOptionsBtn);
      toolbar.appendChild(moreOptions);
      toolbar.appendChild(reportProblem);
    }

    return toolbar;
  };

  obj.getParentFromComponent = function (component) {
    var messageBubble = component.parentElement.parentElement.parentElement;

    if (messageBubble.classList.contains('autoql-vanilla-chata-response-content-container')) {
      messageBubble = messageBubble.parentElement;
    }

    return messageBubble;
  };

  obj.setHeightBubble = function (oldComponent) {
    var messageBubble = obj.getParentFromComponent(oldComponent);
    var chartContainer = oldComponent.getElementsByTagName('svg');

    if (chartContainer.length) {
      if (messageBubble.parentElement.style.maxHeight == '85%') {
        messageBubble.parentElement.style.maxHeight = parseInt(chartContainer[0].getAttribute('height')) + 55 + 'px';
      }
    } else {
      messageBubble.parentElement.style.maxHeight = '85%';
    }
  };

  obj.refreshToolbarButtons = function (oldComponent, ignore) {
    (0, _Utils.closeAllChartPopovers)();
    var messageBubble = obj.getParentFromComponent(oldComponent);

    if (['table', 'pivot_table'].includes(ignore)) {
      messageBubble.classList.remove('full-width');
    } else {
      messageBubble.classList.add('full-width');
    }

    var scrollBox = messageBubble.querySelector('.autoql-vanilla-chata-table-scrollbox');
    var toolbarLeft = messageBubble.getElementsByClassName('left')[0];
    var toolbarRight = messageBubble.getElementsByClassName('right')[0];

    if (oldComponent.noColumnsElement) {
      oldComponent.parentElement.removeChild(oldComponent.noColumnsElement);
      oldComponent.noColumnsElement = null;
      oldComponent.style.display = 'block';
    }

    scrollBox.scrollLeft = 0;
    var actionType = ['table', 'pivot_table', 'date_pivot'].includes(ignore) ? 'csvCopy' : 'chart-view';
    toolbarLeft.innerHTML = '';
    var displayTypes = obj.getDisplayTypesButtons(oldComponent.dataset.componentid, ignore);

    for (var i = 0; i < displayTypes.length; i++) {
      toolbarLeft.appendChild(displayTypes[i]);
    }

    var newToolbarRight = obj.getActionToolbar(oldComponent.dataset.componentid, actionType, ignore);
    messageBubble.replaceChild(newToolbarRight, toolbarRight);
    obj.setScrollBubble(messageBubble);
    (0, _Tooltips.refreshTooltips)();
  };

  obj.setScrollBubble = function (messageBubble) {
    setTimeout(function () {
      messageBubble.parentElement.scrollIntoView(); // obj.scrollBox.scrollTop = messageBubble.dataset.chataScrollValue;
    }, 200);
  };

  obj.sendDrilldownMessage = function (json, indexData, options) {
    var queryId = json['data']['query_id'];
    var params = {};
    var groupables = getGroupableFields(json);

    if (indexData != -1) {
      for (var i = 0; i < groupables.length; i++) {
        var index = groupables[i].indexCol;
        var value = json['data']['rows'][parseInt(indexData)][index];
        var colData = json['data']['columns'][index]['name'];
        params[colData] = value.toString();
      }
    }

    var URL = options.authentication.demo ? "https://backend-staging.chata.ai/api/v1/chata/query/drilldown" : "".concat(options.authentication.domain, "/autoql/api/v1/query/").concat(queryId, "/drilldown?key=").concat(options.authentication.apiKey);
    var data;

    if (options.authentication.demo) {
      data = {
        query_id: queryId,
        group_bys: params,
        username: 'demo',
        debug: options.autoQLConfig.debug
      };
    } else {
      var cols = [];

      for (var _i8 = 0, _Object$entries8 = Object.entries(params); _i8 < _Object$entries8.length; _i8++) {
        var _Object$entries8$_i = _slicedToArray(_Object$entries8[_i8], 2),
            key = _Object$entries8$_i[0],
            value = _Object$entries8$_i[1];

        cols.push({
          name: key,
          value: value
        });
      }

      data = {
        debug: options.autoQLConfig.debug,
        columns: cols
      };
    }

    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');
    responseLoadingContainer.classList.add('response-loading-container');
    responseLoading.classList.add('response-loading');

    for (var i = 0; i <= 3; i++) {
      responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    obj.drawerContent.appendChild(responseLoadingContainer);

    _ChataUtils.ChataUtils.ajaxCallPost(URL, function (response, status) {
      obj.drawerContent.removeChild(responseLoadingContainer);

      if (!response['data']['rows']) {
        obj.putClientResponse(ERROR_MESSAGE);
      } else if (response['data']['rows'].length > 0) {
        obj.putTableResponse(response, true);
      } else {
        obj.putSimpleResponse(response, '', true);
      }

      (0, _Tooltips.refreshTooltips)();
    }, data, options);
  };

  obj.createLoadingDots = function () {
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');
    responseLoadingContainer.classList.add('response-loading-container');
    responseLoading.classList.add('response-loading');

    for (var i = 0; i <= 3; i++) {
      responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    return responseLoadingContainer;
  };

  obj.sendDrilldownClientSide = function (json, indexValue, filterBy) {
    // console.log('FILTER BY ' + filterBy);
    var newJson = cloneObject(json);
    var newData = [];
    var oldData = newJson['data']['rows'];

    for (var i = 0; i < oldData.length; i++) {
      if (oldData[i][indexValue] === filterBy) newData.push(oldData[i]);
    }

    var loading = obj.createLoadingDots();
    obj.drawerContent.appendChild(loading);

    if (newData.length > 0) {
      newJson.data.rows = newData;
      setTimeout(function () {
        obj.putTableResponse(newJson, true);
        obj.drawerContent.removeChild(loading);
      }, 400);
    } else {
      setTimeout(function () {
        console.log('AQUIIIIIIIIIIIIIIIIII');
        obj.putClientResponse('No data found.', true, json);
        obj.drawerContent.removeChild(loading);
      }, 400);
    }
  };

  obj.rowClick = function (evt, idRequest) {
    var json = _ChataUtils.ChataUtils.responses[idRequest];
    var row = evt.target.parentElement;
    var indexData = row.dataset.indexrow;

    if (row.dataset.hasDrilldown === 'true') {
      obj.sendDrilldownMessage(json, indexData, obj.options);
    }
  };

  obj.chartElementClick = function (evt, idRequest) {
    var json = cloneObject(_ChataUtils.ChataUtils.responses[idRequest]);
    var indexData = evt.target.dataset.chartindex;
    var colValue = evt.target.dataset.colvalue1;
    var indexValue = evt.target.dataset.filterindex;
    var groupableCount = getNumberOfGroupables(json['data']['columns']);

    if (groupableCount == 1 || groupableCount == 2) {
      obj.sendDrilldownMessage(json, indexData, obj.options);
    } else {
      obj.sendDrilldownClientSide(json, indexValue, colValue);
    }
  };

  obj.stackedChartElementClick = function (evt, idRequest) {
    var json = cloneObject(_ChataUtils.ChataUtils.responses[idRequest]);
    json['data']['rows'][0][0] = evt.target.dataset.unformatvalue1;
    json['data']['rows'][0][1] = evt.target.dataset.unformatvalue2;
    json['data']['rows'][0][2] = evt.target.dataset.unformatvalue3;
    obj.sendDrilldownMessage(json, 0, obj.options);
  };

  obj.updateSelectedBar = function (evt, component) {
    var oldSelect = component.querySelector('.active');
    if (oldSelect) oldSelect.classList.remove('active');
    if (evt.target.tagName !== 'TD') evt.target.classList.add('active');
  };

  obj.componentClickHandler = function (handler, component, selector) {
    var elements = component.querySelectorAll(selector);

    for (var i = 0; i < elements.length; i++) {
      elements[i].onclick = function (evt) {
        handler.apply(null, [evt, component.dataset.componentid]);
        obj.updateSelectedBar(evt, component);
      };
    }
  };

  obj.registerDrilldownChartEvent = function (component) {
    obj.componentClickHandler(obj.chartElementClick, component, '[data-chartindex]');
  };

  obj.registerDrilldownStackedChartEvent = function (component) {
    obj.componentClickHandler(obj.stackedChartElementClick, component, '[data-stackedchartindex]');
  };

  obj.registerDrilldownTableEvent = function (table) {
    obj.componentClickHandler(obj.rowClick, table, 'tr');
  };

  obj.getComponent = function (request) {
    return obj.drawerContent.querySelector("[data-componentid='".concat(request, "']"));
  };

  obj.getRequest = function (id) {
    return _ChataUtils.ChataUtils.responses[id];
  };

  obj.displayTableHandler = function (evt, idRequest) {
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'table');
    var table = new ChataTable(idRequest, obj.options, obj.onRowClick);
    component.tabulator = table;
    table.parentContainer = obj.getParentFromComponent(component);
    allColHiddenMessage(component);
    obj.setHeightBubble(component);
    chataD3.select(window).on('chata-resize.' + idRequest, null);
  };

  obj.displayColumChartHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'column');
    createColumnChart(component, json, obj.options, obj.registerDrilldownChartEvent);
    obj.setHeightBubble(component);
    obj.registerDrilldownChartEvent(component);
  };

  obj.displayBarChartHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'bar');
    createBarChart(component, json, obj.options, obj.registerDrilldownChartEvent);
    obj.setHeightBubble(component);
    obj.registerDrilldownChartEvent(component);
  };

  obj.displayPieChartHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'pie');
    createPieChart(component, json, obj.options);
    obj.setHeightBubble(component);
    obj.registerDrilldownChartEvent(component);
  };

  obj.displayLineChartHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'line');
    createLineChart(component, json, obj.options, obj.registerDrilldownChartEvent);
    obj.setHeightBubble(component);
    obj.registerDrilldownChartEvent(component);
  };

  obj.displayPivotTableHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'pivot_table');
    var table = new ChataPivotTable(idRequest, obj.options, obj.onCellClick);
    obj.setHeightBubble(component);
    chataD3.select(window).on('chata-resize.' + idRequest, null);
    component.tabulator = table;
  };

  obj.displayHeatmapHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'heatmap');
    createHeatmap(component, json, obj.options);
    obj.setHeightBubble(component);
    obj.registerDrilldownChartEvent(component);
  };

  obj.displayBubbleCharthandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'bubble');
    createBubbleChart(component, json, obj.options);
    obj.setHeightBubble(component);
    obj.registerDrilldownChartEvent(component);
  };

  obj.displayStackedColumnHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'stacked_column');
    createStackedColumnChart(component, cloneObject(json), obj.options, obj.registerDrilldownStackedChartEvent);
    obj.setHeightBubble(component);
    obj.registerDrilldownStackedChartEvent(component);
  };

  obj.displayStackedBarHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'stacked_bar');
    createStackedBarChart(component, cloneObject(json), obj.options, obj.registerDrilldownStackedChartEvent);
    obj.setHeightBubble(component);
    obj.registerDrilldownStackedChartEvent(component);
  };

  obj.displayAreaHandler = function (evt, idRequest) {
    var json = obj.getRequest(idRequest);
    var component = obj.getComponent(idRequest);
    obj.refreshToolbarButtons(component, 'stacked_line');
    createAreaChart(component, cloneObject(json), obj.options, obj.registerDrilldownStackedChartEvent);
    obj.setHeightBubble(component);
  };

  obj.getDisplayTypeButton = function (idRequest, svg, tooltip, onClick) {
    var button = (0, _Utils.htmlToElement)("\n            <button\n                class=\"autoql-vanilla-chata-toolbar-btn\"\n                data-tippy-content=\"".concat(tooltip, "\"\n                data-id=\"").concat(idRequest, "\">\n                ").concat(svg, "\n            </button>\n        "));

    button.onclick = function (evt) {
      onClick(evt, idRequest);
    };

    return button;
  };

  obj.getDisplayTypesButtons = function (idRequest, ignore) {
    var json = _ChataUtils.ChataUtils.responses[idRequest];
    var buttons = [];
    var displayTypes = (0, _Utils.getSupportedDisplayTypes)(json);

    for (var i = 0; i < displayTypes.length; i++) {
      var button = void 0;
      if (displayTypes[i] == ignore) continue;

      if (displayTypes[i] == 'table') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.TABLE_ICON, 'Table', obj.displayTableHandler);
      }

      if (displayTypes[i] == 'column') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.COLUMN_CHART_ICON, 'Column Chart', obj.displayColumChartHandler);
      }

      if (displayTypes[i] == 'bar') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.BAR_CHART_ICON, 'Bar Chart', obj.displayBarChartHandler);
      }

      if (displayTypes[i] == 'pie') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.PIE_CHART_ICON, 'Pie Chart', obj.displayPieChartHandler);
      }

      if (displayTypes[i] == 'line') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.LINE_CHART_ICON, 'Line Chart', obj.displayLineChartHandler);
      }

      if (displayTypes[i] == 'pivot_table') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.PIVOT_ICON, 'Pivot Table', obj.displayPivotTableHandler);
      }

      if (displayTypes[i] == 'heatmap') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.HEATMAP_ICON, 'Heatmap', obj.displayHeatmapHandler);
      }

      if (displayTypes[i] == 'bubble') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.BUBBLE_CHART_ICON, 'Bubble Chart', obj.displayBubbleCharthandler);
      }

      if (displayTypes[i] == 'stacked_column') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.STACKED_COLUMN_CHART_ICON, 'Stacked Column Chart', obj.displayStackedColumnHandler);
      }

      if (displayTypes[i] == 'stacked_bar') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.STACKED_BAR_CHART_ICON, 'Stacked Bar Chart', obj.displayStackedBarHandler);
      }

      if (displayTypes[i] == 'stacked_line') {
        button = obj.getDisplayTypeButton(idRequest, _Svg.STACKED_AREA_CHART_ICON, 'Stacked Area Chart', obj.displayAreaHandler);
      }

      if (button) {
        buttons.push(button);
      }
    }

    return buttons;
  };

  obj.putMessage = function (value) {
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');
    responseLoadingContainer.classList.add('response-loading-container');
    responseLoading.classList.add('response-loading');

    for (var i = 0; i <= 3; i++) {
      responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.classList.add('request');
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    messageBubble.classList.add('single');
    messageBubble.classList.add('text');
    messageBubble.textContent = value;
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.drawerContent.appendChild(responseLoadingContainer);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    obj.checkMaxMessages();
    return responseLoadingContainer;
  };

  obj.onRowClick = function (e, row, json) {
    var index = 0;
    var groupableCount = getNumberOfGroupables(json['data']['columns']);

    if (groupableCount > 0) {
      for (var _i9 = 0, _Object$entries9 = Object.entries(row._row.data); _i9 < _Object$entries9.length; _i9++) {
        var _Object$entries9$_i = _slicedToArray(_Object$entries9[_i9], 2),
            key = _Object$entries9$_i[0],
            value = _Object$entries9$_i[1];

        json['data']['rows'][0][index++] = value;
      }

      obj.sendDrilldownMessage(json, 0, obj.options);
    }
  };

  obj.onCellClick = function (e, cell, json) {
    var columns = json['data']['columns'];
    var selectedColumn = cell._cell.column;
    var row = cell._cell.row;

    if (selectedColumn.definition.index != 0) {
      var entries = Object.entries(row.data)[0];
      json['data']['rows'][0][0] = entries[1];
      json['data']['rows'][0][1] = selectedColumn.definition.field;
      json['data']['rows'][0][2] = cell.getValue();
      obj.sendDrilldownMessage(json, 0, obj.options);
    }
  };

  obj.putTableResponse = function (jsonResponse) {
    var isDrilldown = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var data = jsonResponse['data']['rows'];
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    var tableContainer = document.createElement('div');
    var scrollbox = document.createElement('div');
    var tableWrapper = document.createElement('div');
    var lastBubble = obj.getLastMessageBubble();
    var idRequest = (0, _Utils.uuidv4)();
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.style.maxHeight = '85%';
    containerMessage.setAttribute('data-bubble-id', idRequest);

    if (!isDrilldown) {
      containerMessage.relatedMessage = lastBubble;
    }

    containerMessage.classList.add('response');
    containerMessage.classList.add('autoql-vanilla-chat-message-response');
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble'); // messageBubble.classList.add('full-width');

    _ChataUtils.ChataUtils.responses[idRequest] = jsonResponse;
    var supportedDisplayTypes = obj.getDisplayTypesButtons(idRequest, 'table');
    var actions = obj.getActionToolbar(idRequest, 'csvCopy', 'table');
    var toolbar = undefined;

    if (supportedDisplayTypes.length > 0) {
      toolbar = (0, _Utils.htmlToElement)("\n                <div class=\"autoql-vanilla-chat-message-toolbar left\">\n                </div>\n            ");

      for (var i = 0; i < supportedDisplayTypes.length; i++) {
        toolbar.appendChild(supportedDisplayTypes[i]);
      }
    }

    if (toolbar) {
      messageBubble.appendChild(toolbar);
    }

    messageBubble.appendChild(actions);
    tableContainer.classList.add('autoql-vanilla-chata-table-container');
    scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
    responseContentContainer.classList.add('autoql-vanilla-chata-response-content-container');
    tableWrapper.setAttribute('data-componentid', idRequest);
    tableWrapper.classList.add('autoql-vanilla-chata-table');
    tableContainer.appendChild(tableWrapper);
    scrollbox.appendChild(tableContainer);
    responseContentContainer.appendChild(scrollbox);
    messageBubble.appendChild(responseContentContainer);
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    var table = new ChataTable(idRequest, obj.options, obj.onRowClick);
    tableWrapper.tabulator = table;
    table.parentContainer = obj.getParentFromComponent(tableWrapper);
    setTimeout(function () {
      var sPos = obj.scrollBox.scrollHeight - obj.scrollBox.clientHeight;
      messageBubble.setAttribute('data-chata-scroll-value', sPos);
      obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }, 350);
    allColHiddenMessage(tableWrapper);
    return tableWrapper;
  };

  obj.sendReport = function (idRequest, options, menu, toolbar) {
    return _ChataUtils.ChataUtils.sendReport(idRequest, options, menu, toolbar);
  };

  obj.openModalReport = function (idRequest, options, menu, toolbar) {
    _ChataUtils.ChataUtils.openModalReport(idRequest, options, menu, toolbar);
  };

  obj.showColumnEditor = function (id) {
    _ChataUtils.ChataUtils.showColumnEditor(id, obj.options, function () {
      var component = obj.rootElem.querySelector("[data-componentid='".concat(id, "']"));
      obj.setScrollBubble(obj.getParentFromComponent(component));
    });
  };

  obj.sendResponse = function (text) {
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.classList.add('response');
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    messageBubble.textContent = text;
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
  };

  obj.inputAnimation = function (text) {
    var input = obj.input;
    var selectedQuery = text;
    var subQuery = '';
    var index = 0;

    var _int2 = setInterval(function () {
      subQuery += selectedQuery[index];

      if (index >= selectedQuery.length) {
        clearInterval(_int2);
        var evt = new KeyboardEvent('keypress', {
          keyCode: 13,
          type: "keypress",
          which: 13
        });
        input.dispatchEvent(evt);
      } else {
        input.value = subQuery;
      }

      index++;
    }, 60);
  };

  obj.createSuggestions = function (responseContentContainer, data) {
    for (var i = 0; i < data.length; i++) {
      var div = document.createElement('div');
      var button = document.createElement('button');
      button.classList.add('autoql-vanilla-chata-suggestion-btn');
      button.textContent = data[i];
      div.appendChild(button);
      responseContentContainer.appendChild(div);

      button.onclick = function (evt) {
        obj.inputAnimation(evt.target.textContent);
      };
    }
  };

  obj.putSuggestionResponse = function (jsonResponse) {
    var uuid = (0, _Utils.uuidv4)();
    _ChataUtils.ChataUtils.responses[uuid] = jsonResponse;
    var data = jsonResponse['data']['items'];
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    var lastBubble = obj.getLastMessageBubble();
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.setAttribute('data-bubble-id', uuid); // containerMessage.relatedMessage = lastBubble;

    containerMessage.classList.add('response');
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    responseContentContainer.classList.add('autoql-vanilla-chata-response-content-container');
    messageBubble.appendChild(toolbarButtons = obj.getActionToolbar(uuid, 'safety-net', ''));
    obj.createSuggestions(responseContentContainer, data);
    messageBubble.appendChild(responseContentContainer);
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
  };

  obj.putClientResponse = function (msg) {
    var json = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var withDeleteBtn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var uuid = (0, _Utils.uuidv4)();
    _ChataUtils.ChataUtils.responses[uuid] = json;
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.classList.add('response');
    containerMessage.setAttribute('data-bubble-id', uuid);
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    messageBubble.classList.add('simple-response');
    messageBubble.classList.add('no-hover-response');

    if (withDeleteBtn) {
      toolbarButtons = obj.getActionToolbar(uuid, 'safety-net', '');
      messageBubble.appendChild(toolbarButtons);
    }

    var div = document.createElement('div');
    div.classList.add('autoql-vanilla-chata-single-response');
    div.appendChild(document.createTextNode(msg.toString()));
    messageBubble.appendChild(div);
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
  };

  obj.putSimpleResponse = function (jsonResponse, text) {
    var isDrilldown = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var lastBubble = obj.getLastMessageBubble();
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.classList.add('response');
    if (!isDrilldown) containerMessage.relatedMessage = lastBubble;
    var idRequest = (0, _Utils.uuidv4)();
    _ChataUtils.ChataUtils.responses[idRequest] = jsonResponse;
    containerMessage.setAttribute('data-bubble-id', idRequest);
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    messageBubble.classList.add('simple-response');
    toolbarButtons = obj.getActionToolbar(idRequest, 'simple', 'table');

    if (jsonResponse['reference_id'] !== '1.1.420' && jsonResponse['reference_id'] !== '1.1.430') {
      messageBubble.appendChild(toolbarButtons);
    }

    if (jsonResponse['reference_id'] === '1.1.430') {
      toolbarButtons = obj.getActionToolbar(idRequest, 'safety-net', '');
      messageBubble.appendChild(toolbarButtons);
    }

    if (jsonResponse['reference_id'] === '1.1.211' || jsonResponse['reference_id'] === '1.1.430' || jsonResponse['reference_id'] === '1.9.502') {
      messageBubble.classList.add('no-hover-response');
    }

    var value = '';
    var hasDrilldown = false;

    if (jsonResponse['data'].rows && jsonResponse['data'].rows.length > 0) {
      value = formatData(jsonResponse['data']['rows'][0][0], jsonResponse['data']['columns'][0], obj.options);
      hasDrilldown = true;
    } else {
      value = jsonResponse['message'];
    }

    var div = document.createElement('div');

    if (hasDrilldown) {
      div.onclick = function (evt) {
        obj.sendDrilldownMessage(jsonResponse, 0, obj.options);
      };
    }

    div.classList.add('autoql-vanilla-chata-single-response');
    div.appendChild(document.createTextNode(value.toString()));
    messageBubble.appendChild(div);
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;

    if (jsonResponse['reference_id'] === '1.1.430') {
      containerMessage.setAttribute('suggestion-message', '1');
      var responseLoadingContainer = document.createElement('div');
      var responseLoading = document.createElement('div');
      responseLoadingContainer.classList.add('response-loading-container');
      responseLoading.classList.add('response-loading');

      for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
      }

      responseLoadingContainer.appendChild(responseLoading);
      obj.drawerContent.appendChild(responseLoadingContainer);
      var path = obj.getRecommendationPath(obj.options, text.split(' ').join(','));

      _ChataUtils.ChataUtils.safetynetCall(path, function (response, s) {
        obj.drawerContent.removeChild(responseLoadingContainer);
        obj.putSuggestionResponse(response);
      }, obj.options);
    }
  };

  obj.putSafetynetMessage = function (jsonResponse) {
    var suggestionArray = createSuggestionArray(jsonResponse);
    var div = document.createElement('div');
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var uuid = (0, _Utils.uuidv4)();
    var lastBubble = obj.getLastMessageBubble();
    _ChataUtils.ChataUtils.responses[uuid] = jsonResponse;
    var toolbar = obj.getActionToolbar(uuid, 'safety-net', '');
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.setAttribute('data-bubble-id', uuid);
    containerMessage.relatedMessage = lastBubble;
    containerMessage.classList.add('response');
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    messageBubble.classList.add('full-width');
    messageBubble.appendChild(toolbar);
    messageBubble.append(createSafetynetContent(suggestionArray, obj));
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    (0, _Tooltips.refreshTooltips)();
  };

  obj.createHelpContent = function (link) {
    return "\n        Great news, I can help with that:\n        <br/>\n        <button\n            onclick=\"window.open('".concat(link, "', '_blank')\"\n            class=\"autoql-vanilla-chata-help-link-btn\">\n            ").concat(HELP_ICON, "\n            Bar chart 2\n        </button>\n        ");
  };

  obj.putHelpMessage = function (jsonResponse) {
    var div = document.createElement('div');
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
    containerMessage.style.zIndex = --obj.zIndexBubble;
    containerMessage.classList.add('response');
    messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    messageBubble.classList.add('full-width');
    messageBubble.innerHTML = obj.createHelpContent(jsonResponse['data']['rows'][0]);
    containerMessage.appendChild(messageBubble);
    obj.drawerContent.appendChild(containerMessage);
    obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
  };

  obj.sendMessage = function (textValue, source) {
    obj.input.disabled = true;
    obj.input.value = '';
    var responseLoadingContainer = obj.putMessage(textValue);
    var URL_SAFETYNET = obj.options.authentication.demo ? "https://backend.chata.ai/api/v1/safetynet?q=".concat(encodeURIComponent(textValue), "&projectId=1") : "".concat(obj.options.authentication.domain, "/autoql/api/v1/query/validate?text=").concat(encodeURIComponent(textValue), "&key=").concat(obj.options.authentication.apiKey);

    _ChataUtils.ChataUtils.safetynetCall(URL_SAFETYNET, function (jsonResponse, statusCode) {
      var suggestions = {};

      if (jsonResponse != undefined) {
        var suggestions = jsonResponse['full_suggestion'] || jsonResponse['data']['replacements'];
      }

      if (statusCode != 200) {
        obj.drawerContent.removeChild(responseLoadingContainer);
        obj.input.removeAttribute("disabled");
        obj.sendResponse("\n                    Uh oh.. It looks like you don't have access\n                    to this resource. Please double check that all the\n                    required authentication fields are provided.");
      } else if (suggestions.length > 0 && obj.options.autoQLConfig.enableQueryValidation && textValue != 'None of these') {
        obj.input.removeAttribute("disabled");
        obj.drawerContent.removeChild(responseLoadingContainer);
        obj.putSafetynetMessage(jsonResponse);
      } else {
        _ChataUtils.ChataUtils.ajaxCall(textValue, function (jsonResponse, status) {
          obj.input.removeAttribute("disabled");
          obj.drawerContent.removeChild(responseLoadingContainer);

          switch (jsonResponse['data']['display_type']) {
            case 'suggestion':
              obj.putSuggestionResponse(jsonResponse);
              break;

            case 'table':
              if (jsonResponse['data']['columns'].length == 1) {
                obj.putSimpleResponse(jsonResponse, textValue);
              } else {
                obj.putTableResponse(jsonResponse);
              }

              break;

            case 'data':
              var cols = jsonResponse['data']['columns'];
              var rows = jsonResponse['data']['rows'];

              if (cols.length == 1 && rows.length == 1) {
                if (cols[0]['name'] == 'query_suggestion') {
                  obj.putSuggestionResponse(jsonResponse);
                } else if (cols[0]['name'] == 'Help Link') {
                  obj.putHelpMessage(jsonResponse);
                } else {
                  obj.putSimpleResponse(jsonResponse, textValue);
                }
              } else {
                if (rows.length > 0) {
                  obj.putTableResponse(jsonResponse);
                } else {
                  obj.putSimpleResponse(jsonResponse, textValue);
                }
              }

              break;

            case 'compare_table':
              obj.putTableResponse(jsonResponse);
              break;

            case 'date_pivot':
              obj.putTableResponse(jsonResponse);
              break;

            case 'pivot_table':
              obj.putTableResponse(jsonResponse);
              break;

            case 'line':
              var component = obj.putTableResponse(jsonResponse);
              createLineChart(component, jsonResponse, pbj.options);
              pbj.refreshToolbarButtons(component, 'line');
              break;

            case 'bar':
              var component = obj.putTableResponse(jsonResponse);
              createBarChart(component, jsonResponse, pbj.options);
              pbj.refreshToolbarButtons(component, 'bar');
              break;

            case 'word_cloud':
              obj.putTableResponse(jsonResponse);
              break;

            case 'stacked_column':
              var component = obj.putTableResponse(jsonResponse);
              obj.refreshToolbarButtons(component, 'stacked_column');
              createStackedColumnChart(component, cloneObject(jsonResponse), obj.options);
              break;

            case 'stacked_bar':
              var component = obj.putTableResponse(jsonResponse);
              obj.refreshToolbarButtons(component, 'stacked_bar');
              createStackedBarChart(component, cloneObject(jsonResponse), obj.options);
              break;

            case 'bubble':
              var component = obj.putTableResponse(jsonResponse);
              var cols = jsonResponse['data']['columns'];
              createBubbleChart(component, jsonResponse, obj.options);
              obj.refreshToolbarButtons(component, 'bubble');
              break;

            case 'heatmap':
              var component = obj.putTableResponse(jsonResponse);
              createHeatmap(component, jsonResponse, obj.options);
              obj.refreshToolbarButtons(component, 'heatmap');
              break;

            case 'pie':
              obj.putTableResponse(jsonResponse);
              break;

            case 'column':
              var component = obj.putTableResponse(jsonResponse);
              createColumnChart(component, jsonResponse, obj.options);
              obj.refreshToolbarButtons(component, 'column');
              break;

            case 'help':
              obj.putHelpMessage(jsonResponse);
              break;

            default:
              // temporary
              jsonResponse['data'] = 'Error: There was no data supplied for this table';
              obj.putSimpleResponse(jsonResponse, textValue);
          }

          obj.checkMaxMessages();
          (0, _Tooltips.refreshTooltips)();
        }, obj.options, source);
      }
    }, obj.options);
  };

  document.addEventListener('DOMContentLoaded', obj.onLoadHandler);
  return obj;
}
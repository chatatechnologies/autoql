"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refreshTooltips = refreshTooltips;
exports.tooltipCharts = tooltipCharts;

var _tippy = _interopRequireDefault(require("tippy.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require('load-styles')("/* vanilla-autoql */\n.tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;outline:0;-webkit-transition-property:visibility,opacity,-webkit-transform;transition-property:visibility,opacity,-webkit-transform;transition-property:transform,visibility,opacity;transition-property:transform,visibility,opacity,-webkit-transform}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;-webkit-transform-origin:center top;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;-webkit-transform-origin:center bottom;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;-webkit-transform-origin:center left;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;-webkit-transform-origin:center right;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{-webkit-transition-timing-function:cubic-bezier(.54,1.5,.38,1.11);transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:\"\";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}");

function refreshTooltips() {
  (0, _tippy["default"])('.chata-interpretation', {
    theme: 'chata-theme',
    onShow: function onShow(instance) {
      var data = ChataUtils.responses[instance.reference.dataset.id]['data'];
      var content = "\n                <span class='title-tip'>Interpretation:</span>\n                <span class=\"text-tip\">".concat(data['interpretation'], "</span>\n            ");
      instance.setContent(content);
    }
  });
  (0, _tippy["default"])('[data-tippy-content]', {
    theme: 'chata-theme',
    delay: [500],
    dynamicTitle: true
  });
}

function tooltipCharts() {
  var get2dContent = function get2dContent(instance) {
    var dataset = instance.reference.dataset;
    var content = "\n            <span class='title-tip'>".concat(dataset.col1, ":</span>\n            <span class=\"text-tip\">").concat(dataset.colvalue1, "</span>\n        ");
    content += '<br/>';
    content += "\n        <span class='title-tip'>".concat(dataset.col2, ":</span>\n        <span class=\"text-tip\">").concat(dataset.colvalue2, "</span>\n        ");
    return content;
  };

  (0, _tippy["default"])('.tooltip-2d', {
    theme: 'chata-theme',
    onShow: function onShow(instance) {
      instance.setContent(get2dContent(instance));
    }
  });
  (0, _tippy["default"])('.tooltip-3d', {
    theme: 'chata-theme',
    onShow: function onShow(instance) {
      var dataset = instance.reference.dataset;
      var content = get2dContent(instance);
      content += '<br/>';
      content += "\n                <span class='title-tip'>".concat(dataset.col3, ":</span>\n                <span class=\"text-tip\">").concat(dataset.colvalue3, "</span>\n            ");
      instance.setContent(content);
    }
  });
}
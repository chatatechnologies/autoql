"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cascader = Cascader;

var _Svg = require("./Svg");

var _Utils = require("./Utils");

require('load-styles')("/* vanilla-autoql */\n.autoql-vanilla-topics-container {\n    margin: 5px 0;\n}\n\n.autoql-vanilla-chata-cascader {\n    position: relative;\n    white-space: nowrap;\n    overflow: hidden;\n}\n\n\n.autoql-vanilla-chata-cascader .options-container {\n    -webkit-transition: max-width .3s ease;\n    transition: max-width .3s ease;\n    display: inline-block;\n    vertical-align: top;\n    padding: 0 10px;\n    margin: 10px 0;\n    width: 100%;\n    max-width: calc(100% - 20px);\n}\n\n.autoql-vanilla-chata-cascader .options-container .option .option-execute-icon {\n    opacity: 0;\n    color: #fff;\n    font-size: 16px;\n    vertical-align: middle;\n}\n\n.autoql-vanilla-chata-cascader .options-container .option.active .option-execute-icon,\n.autoql-vanilla-chata-cascader .options-container .option:hover .option-execute-icon {\n    opacity: 1;\n}\n\n.autoql-vanilla-chata-cascader .options-container .options-title {\n    padding: 4px 4px 4px 10px;\n    font-weight: 600;\n}\n\n.autoql-vanilla-chata-cascader .options-container:not(:last-child) {\n    border-right: 1px solid hsla(0,0%,82.7%,.32);\n}\n\n.autoql-vanilla-chata-cascader .options-container.hidden {\n    max-width: 0;\n    visibility: hidden;\n}\n\n.autoql-vanilla-chata-cascader .options-container .option.active,\n.autoql-vanilla-chata-cascader .options-container .option:hover {\n    background: var(--chata-drawer-accent-color);\n    color: #fff;\n}\n\n\n.autoql-vanilla-chata-cascader .options-container .option {\n    cursor: pointer;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: justify;\n    -webkit-justify-content: space-between;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n    border-radius: 2px;\n    padding: 4px 4px 4px 10px;\n}\n\n.autoql-vanilla-chata-cascader .options-container .cascader-back-arrow {\n    position: absolute;\n    cursor: pointer;\n    top: 15px;\n    left: 0;\n}\n\n\n.autoql-vanilla-chata-cascader .options-container .option .option-arrow {\n    opacity: .7;\n    height: 1em;\n    width: 1em;\n    /* margin-bottom: -.1em; */\n}\n\n.autoql-vanilla-intro-qi-link {\n    cursor: pointer;\n    color: var(--chata-drawer-accent-color);\n}\n");

function Cascader(topics, datamessenger) {
  var obj = this;
  var message = document.createElement('div');
  var chatMessageBubble = document.createElement('div');
  var content = document.createElement('div');
  var topicsContainer = document.createElement('div');
  var chataCascader = document.createElement('div');
  var optionsContainer = document.createElement('div');
  var options = [];
  message.classList.add('autoql-vanilla-chat-single-message-container');
  message.classList.add('response');
  topicsContainer.classList.add('autoql-vanilla-topics-container');
  chataCascader.classList.add('autoql-vanilla-chata-cascader');
  optionsContainer.classList.add('options-container');
  chatMessageBubble.classList.add('autoql-vanilla-chat-message-bubble');
  message.appendChild(chatMessageBubble);
  chatMessageBubble.appendChild(content);
  message.style.maxHeight = 'unset';
  obj._elem = message;
  content.appendChild(document.createTextNode('Some things you can ask me:'));
  content.appendChild(document.createElement('br'));

  obj.keyAnimation = function (text) {
    chataInput = datamessenger.input;
    obj.inputAnimation(text, chataInput);
  };

  obj.queryTipsInputAnimation = function (text) {
    var input = datamessenger.queryTipsInput;
    obj.inputAnimation(text, input);
  };

  obj.inputAnimation = function (text, input) {
    input.focus();
    var selectedQuery = text;
    var subQuery = '';
    var index = 0;

    var _int = setInterval(function () {
      subQuery += selectedQuery[index];

      if (index >= selectedQuery.length) {
        clearInterval(_int);
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
    }, 65);
  };

  obj.showQueryTips = function () {
    datamessenger.tabQueryTips.classList.add('active');
    datamessenger.tabChataUtils.classList.remove('active');
    datamessenger.tabsAnimation('none', 'none');
    datamessenger.queryTipsAnimation('block');
  };

  obj.makeOpt = function (opt, svg) {
    var active = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var extraClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    return function (opt) {
      var opt = (0, _Utils.htmlToElement)("\n            <div class=\"option ".concat(active, "\">\n                <span>").concat(opt, " </span>\n                <span class=\"chata-icon ").concat(extraClass, "\">\n                    ").concat(svg, "\n                </span>\n            </div>\n        "));
      return opt;
    }(opt);
  };

  for (var i = 0; i < topics.length; i++) {
    var topic = topics[i].topic;
    var active = i == 0 ? 'active' : '';
    var opt = obj.makeOpt(topic, _Svg.OPTION_ARROW, active, 'option-arrow');
    opt.setAttribute('data-index-topic', i);
    options.push(opt);
    optionsContainer.appendChild(opt);

    opt.onclick = function (evt) {
      var target = evt.target;

      if (!target.classList.contains('option')) {
        target = target.parentElement;
      }

      optionsContainer.classList.add('hidden');
      chataCascader.appendChild(obj.createOptions(target.dataset.indexTopic));
    };
  }

  obj.createOptions = function (parentIndex) {
    var topic = topics[parseInt(parentIndex)];
    var childrenOptionsContainer = document.createElement('div');
    var optionList = [];
    var arrow = (0, _Utils.htmlToElement)("\n            <span class=\"chata-icon cascader-back-arrow\">\n                ".concat(_Svg.TOPICS_ARROW, "\n            </span>"));
    var title = (0, _Utils.htmlToElement)("\n            <div class=\"options-title\">".concat(topic.topic, "</div>\n        "));
    var seeMore = (0, _Utils.htmlToElement)("\n            <div class=\"option\">\n                <span>\n                    <span class=\"chata-icon\">".concat(_Svg.EXPLORE_QUERIES, "</span>\n                     See more...\n                </span>\n            </div>\n        "));
    childrenOptionsContainer.classList.add('options-container');
    childrenOptionsContainer.appendChild(arrow);
    childrenOptionsContainer.appendChild(title);
    console.log(topic.queries);
    var queries = Object.values(topic.queries);

    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      var opt = obj.makeOpt(query, _Svg.OPTION_ARROW_CIRCLE, '', 'option-execute-icon');
      opt.setAttribute('data-index-topic', i);
      childrenOptionsContainer.appendChild(opt);
      optionList.push(opt);
    }

    optionList.map(function (opt) {
      opt.onclick = function (evt) {
        obj.keyAnimation(opt.textContent.trim());
      };
    });

    arrow.onclick = function (evt) {
      optionsContainer.classList.remove('hidden');
      chataCascader.removeChild(childrenOptionsContainer);
    };

    seeMore.onclick = function (evt) {
      obj.showQueryTips();
      obj.queryTipsInputAnimation(topic.topic);
    };

    childrenOptionsContainer.appendChild(seeMore);
    return childrenOptionsContainer;
  };

  content.appendChild(topicsContainer);
  topicsContainer.appendChild(chataCascader);
  chataCascader.appendChild(optionsContainer);
  content.appendChild(document.createTextNode('Use'));
  var link = (0, _Utils.htmlToElement)("\n        <span class=\"autoql-vanilla-intro-qi-link\">\n            <span class=\"chata-icon undefined\" style=\"margin-right: -3px;\">\n                ".concat(_Svg.EXPLORE_QUERIES, "\n            </span> Explore Queries\n        </span>\n    "));
  content.appendChild(link);

  link.onclick = function (evt) {
    obj.showQueryTips();
  };

  content.appendChild(document.createTextNode(' to further explore the possibilities.'));
  return obj;
}
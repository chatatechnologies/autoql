"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChataUtils = void 0;

var _Utils = require("./Utils");

var _Svg = require("./Svg");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var ChataUtils = {
  xhr: new XMLHttpRequest(),
  responses: []
};
exports.ChataUtils = ChataUtils;

ChataUtils.sendReport = function (idRequest, options, menu, toolbar) {
  var json = ChataUtils.responses[idRequest];
  var queryId = json['data']['query_id'];
  var URL = options.authentication.demo ? "https://backend-staging.chata.ai/api/v1/chata/query/drilldown" : "".concat(options.authentication.domain, "/autoql/api/v1/query/").concat(queryId, "?key=").concat(options.authentication.apiKey);
  return new Promise(function (resolve) {
    ChataUtils.putCall(URL, {
      is_correct: false
    }, function (r, s) {
      menu.classList.remove('show');
      toolbar.classList.remove('show');
      new AntdMessage('Thank you for your feedback.', 3000);
      resolve();
    }, options);
  });
};

ChataUtils.getRecommendationPath = function (options, text) {
  return "".concat(options.authentication.domain, "/autoql/api/v1/query/related-queries?key=").concat(options.authentication.apiKey, "&search=").concat(text, "&scope=narrow");
};

ChataUtils.getReportProblemMenu = function (toolbar, idRequest, type, options) {
  var singleMessage = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var menu = ChataUtils.getPopover();

  if (type === 'simple') {
    menu.classList.add('chata-popover-single-message');
  }

  menu.ul.appendChild(ChataUtils.getActionOption('', 'The data is incorrect', ChataUtils.sendReport, [idRequest, options, menu, toolbar]));
  menu.ul.appendChild(ChataUtils.getActionOption('', 'The data is incomplete', ChataUtils.sendReport, [idRequest, options, menu, toolbar]));
  menu.ul.appendChild(ChataUtils.getActionOption('', 'Other...', ChataUtils.openModalReport, [idRequest, options, menu, toolbar]));
  return menu;
};

ChataUtils.reportProblemHandler = function (evt, idRequest, reportProblem, toolbar) {
  // closeAllToolbars();
  reportProblem.classList.toggle('show');
  toolbar.classList.toggle('show');
};

ChataUtils.downloadCsvHandler = function (idRequest) {
  var json = ChataUtils.responses[idRequest];
  var csvData = ChataUtils.createCsvData(json);
  var link = document.createElement("a");
  link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
  link.setAttribute('download', 'table.csv');
  link.click();
};

ChataUtils.copySqlHandler = function (idRequest) {
  var json = ChataUtils.responses[idRequest];
  var sql = json['data']['sql'][0];
  copyTextToClipboard(sql);
  new AntdMessage('Successfully copied generated query to clipboard!', 3000);
};

ChataUtils.copyHandler = function (idRequest) {
  var json = ChataUtils.responses[idRequest];
  copyTextToClipboard(ChataUtils.createCsvData(json, '\t'));
  new AntdMessage('Successfully copied table to clipboard!', 3000);
};

ChataUtils.exportPNGHandler = function (idRequest) {
  var component = document.querySelector("[data-componentid='".concat(idRequest, "']"));
  var svg = component.getElementsByTagName('svg')[0];
  var svgString = getSVGString(svg);
  svgString2Image(svgString, 2 * component.clientWidth, 2 * component.clientHeight);
};

ChataUtils.filterTableHandler = function (evt, idRequest) {
  console.log(idRequest);
  var table = document.querySelector("[data-componentid=\"".concat(idRequest, "\"]"));
  var tabulator = table.tabulator;
  tabulator.toggleFilters();
};

ChataUtils.getMoreOptionsMenu = function (options, idRequest, type) {
  var menu = ChataUtils.getPopover();

  if (type === 'simple') {
    menu.classList.add('chata-popover-single-message');
  }

  for (var i = 0; i < options.length; i++) {
    var opt = options[i];

    switch (opt) {
      case 'csv':
        var action = ChataUtils.getActionOption(_Svg.DOWNLOAD_CSV_ICON, 'Download as CSV', ChataUtils.downloadCsvHandler, [idRequest]);
        action.setAttribute('data-name-option', 'csv-handler');
        menu.ul.appendChild(action);
        break;

      case 'copy':
        var action = ChataUtils.getActionOption(_Svg.CLIPBOARD_ICON, 'Copy table to clipboard', ChataUtils.copyHandler, [idRequest]);
        action.setAttribute('data-name-option', 'copy-csv-handler');
        menu.ul.appendChild(action);
        break;

      case 'copy_sql':
        var action = ChataUtils.getActionOption(_Svg.CLIPBOARD_ICON, 'Copy generated query to clipboard', ChataUtils.copySqlHandler, [idRequest]);
        menu.ul.appendChild(action);
        break;

      case 'png':
        var action = ChataUtils.getActionOption(_Svg.EXPORT_PNG_ICON, 'Download as PNG', ChataUtils.exportPNGHandler, [idRequest]);
        menu.ul.appendChild(action);

      default:
    }
  }

  return menu;
};

ChataUtils.getActionButton = function (svg, tooltip, idRequest, onClick, evtParams) {
  var button = (0, _Utils.htmlToElement)("\n        <button\n            class=\"autoql-vanilla-chata-toolbar-btn\"\n            data-tippy-content=\"".concat(tooltip, "\"\n            data-id=\"").concat(idRequest, "\">\n            ").concat(svg, "\n        </button>\n    "));

  button.onclick = function (evt) {
    onClick.apply(null, [evt, idRequest].concat(_toConsumableArray(evtParams)));
  };

  return button;
};

ChataUtils.getActionOption = function (svg, text, onClick, params) {
  var element = (0, _Utils.htmlToElement)("\n        <li>\n            <span class=\"chata-icon more-options-icon\">\n                ".concat(svg, "\n            </span>\n            ").concat(text, "\n        </li>\n    "));

  element.onclick = function (evt) {
    onClick.apply(null, params);
  };

  return element;
};

ChataUtils.getPopover = function () {
  var optionsMenu = (0, _Utils.htmlToElement)("\n        <div class=\"chata-more-options-menu\">\n        </div>\n    ");
  var menu = (0, _Utils.htmlToElement)("\n        <div class=\"chata-popover-wrapper\">\n        </div>");
  var ul = (0, _Utils.htmlToElement)("\n        <ul class=\"chata-menu-list\">\n        </ul>\n    ");
  menu.ul = ul;
  optionsMenu.appendChild(ul);
  menu.appendChild(optionsMenu);
  return menu;
};

ChataUtils.openModalReport = function (idRequest, options, menu, toolbar) {
  var modal = new Modal({
    destroyOnClose: true,
    withFooter: true
  });
  modal.setTitle('Report a Problem');
  var container = document.createElement('div');
  var textArea = document.createElement('textarea');
  textArea.classList.add('autoql-vanilla-report-problem-text-area');
  var cancelButton = (0, _Utils.htmlToElement)("<div class=\"autoql-vanilla-chata-btn default\"\n        style=\"padding: 5px 16px; margin: 2px 5px;\">Cancel</div>");
  var spinner = (0, _Utils.htmlToElement)("\n        <div class=\"autoql-vanilla-spinner-loader hidden\"></div>\n    ");
  var reportButton = (0, _Utils.htmlToElement)("<div class=\"autoql-vanilla-chata-btn primary\"\n            style=\"padding: 5px 16px; margin: 2px 5px;\">\n        </div>");
  reportButton.appendChild(spinner);
  reportButton.appendChild(document.createTextNode('Report'));
  container.appendChild(document.createTextNode('Please tell us more about the problem you are experiencing:'));
  container.appendChild(textArea);
  modal.addView(container);
  modal.addFooterElement(cancelButton);
  modal.addFooterElement(reportButton);

  cancelButton.onclick = function (evt) {
    modal.close();
  };

  reportButton.onclick = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(evt) {
      var reportMessage;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              reportMessage = textArea.value;
              spinner.classList.remove('hidden');
              _context.next = 4;
              return ChataUtils.sendReport(idRequest, options, menu, toolbar);

            case 4:
              modal.close();

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  modal.show();
};

ChataUtils.getQueryInput = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new QueryInput(options);
};

ChataUtils.getQueryOutput = function (options) {
  return new QueryOutput(options);
};

ChataUtils.sendDrilldownMessage = function (json, indexData, options) {
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'ChataUtils';
  var responseRenderer = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
  var loading = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
  var queryId = json['data']['query_id'];
  var obj = {};
  var groupables = getGroupableFields(json);

  if (indexData != -1) {
    for (var i = 0; i < groupables.length; i++) {
      var index = groupables[i].indexCol;
      var value = json['data']['rows'][parseInt(indexData)][index];
      var colData = json['data']['columns'][index]['name'];
      obj[colData] = value.toString();
    }
  }

  var URL = options.authentication.demo ? "https://backend-staging.chata.ai/api/v1/chata/query/drilldown" : "".concat(options.authentication.domain, "/autoql/api/v1/query/").concat(queryId, "/drilldown?key=").concat(options.authentication.apiKey);
  var data;

  if (options.authentication.demo) {
    data = {
      query_id: queryId,
      group_bys: obj,
      username: 'demo',
      customer_id: options.authentication.customerId || "",
      user_id: options.authentication.userId || "",
      debug: options.autoQLConfig.debug
    };
  } else {
    var cols = [];

    for (var _i = 0, _Object$entries = Object.entries(obj); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

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

  if (context == 'ChataUtils') {
    // var responseLoadingContainer = ChataUtils.putMessage(msg);
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');
    responseLoadingContainer.classList.add('response-loading-container');
    responseLoading.classList.add('response-loading');

    for (var i = 0; i <= 3; i++) {
      responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    ChataUtils.drawerContent.appendChild(responseLoadingContainer);
    ChataUtils.ajaxCallPost(URL, function (response, status) {
      if (response['data']['rows'].length > 0) {
        ChataUtils.putTableResponse(response);
      } else {
        ChataUtils.putSimpleResponse(response);
      }

      ChataUtils.drawerContent.removeChild(responseLoadingContainer);
      refreshTooltips();
    }, data, options);
  } else {
    ChataUtils.ajaxCallPost(URL, function (response, status) {
      responseRenderer.innerHTML = '';
      var topBar = responseRenderer.chataBarContainer.getElementsByClassName('autoql-vanilla-chat-bar-text')[0];
      topBar.removeChild(loading);
      var uuid = uuidv4();
      ChataUtils.responses[uuid] = response;
      var div = document.createElement('div');
      div.classList.add('autoql-vanilla-chata-table-container');
      div.classList.add('autoql-vanilla-chata-table-container-renderer');
      var scrollbox = document.createElement('div');
      scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
      scrollbox.appendChild(div);
      responseRenderer.appendChild(scrollbox);

      if (response['data']['rows'].length == 0) {
        responseRenderer.innerHTML = "<div>No data found.</div>";
      }

      if (response['data']['columns'].length == 1) {
        var data = response['data'];
        responseRenderer.innerHTML = "<div>".concat(data, "</div>");
      } else {
        var table = createTable(response, div, options, 'append', uuid, 'autoql-vanilla-table-response-renderer', '[data-indexrowrenderer]');
        table.classList.add('renderer-table');
        scrollbox.insertBefore(table.headerElement, div);
      }
    }, data, options);
  }
};

ChataUtils.showColumnEditor = function (id, options) {
  var onHideCols = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  var modal = new Modal({
    destroyOnClose: true,
    withFooter: true
  });
  var json = ChataUtils.responses[id];
  var columns = json['data']['columns'];
  var container = document.createElement('div');
  var headerEditor = document.createElement('div');

  var createCheckbox = function createCheckbox(name, checked, colIndex) {
    var isLine = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var tick = (0, _Utils.htmlToElement)("\n            <div class=\"autoql-vanilla-chata-checkbox-tick\">\n            <span class=\"chata-icon\">".concat(TICK, "</span>\n            </div>\n        "));
    var checkboxContainer = document.createElement('div');
    var checkboxWrapper = document.createElement('div');
    var checkboxInput = document.createElement('input');
    checkboxInput.setAttribute('type', 'checkbox');
    checkboxInput.classList.add('autoql-vanilla-m-checkbox__input');

    if (name) {
      checkboxInput.setAttribute('data-col-name', name);
    }

    if (isLine) {
      checkboxInput.setAttribute('data-line', 'true');
    }

    checkboxInput.setAttribute('data-col-index', colIndex);
    checkboxContainer.style.width = '36px';
    checkboxContainer.style.height = '36px';
    checkboxWrapper.style.width = '36px';
    checkboxWrapper.style.height = '36px';
    checkboxWrapper.style.position = 'relative';

    if (checked) {
      checkboxInput.setAttribute('checked', 'true');
    }

    checkboxWrapper.appendChild(checkboxInput);
    checkboxWrapper.appendChild(tick);
    checkboxContainer.appendChild(checkboxWrapper);
    checkboxContainer.input = checkboxInput;
    return checkboxContainer;
  };

  container.style.padding = '0px 15px';
  headerEditor.classList.add('col-visibility-header');
  headerEditor.appendChild((0, _Utils.htmlToElement)("\n        <div>Column Name</div>\n    "));
  var divVisibility = (0, _Utils.htmlToElement)("\n        <div>Visibility</div>\n    ");
  divVisibility.style.display = 'flex';
  container.appendChild(headerEditor);
  modal.chataModal.classList.add('chata-modal-column-editor');
  modal.setTitle('Show/Hide Columns');
  var headerCheckbox = createCheckbox(null, true, -1);
  headerEditor.appendChild(divVisibility);
  headerCheckbox.style.marginLeft = '12px';
  headerCheckbox.style.marginTop = '1px';
  divVisibility.appendChild(headerCheckbox);

  for (var i = 0; i < columns.length; i++) {
    var lineItem = document.createElement('div');
    var isVisible = columns[i]['is_visible'] || false;
    var colStr = columns[i]['display_name'] || columns[i]['name'];
    var colName = formatColumnName(colStr);
    lineItem.classList.add('col-visibility-line-item');
    lineItem.appendChild((0, _Utils.htmlToElement)("\n            <div>".concat(colName, "</div>\n        ")));
    var checkboxContainer = createCheckbox(columns[i]['name'], isVisible, i, true);

    checkboxContainer.input.onchange = function (evt) {
      var headerChecked = true;
      var inputs = container.querySelectorAll('[data-line]');

      for (var x = 0; x < inputs.length; x++) {
        if (!inputs[x].checked) {
          headerChecked = false;
          break;
        }
      }

      headerCheckbox.input.checked = headerChecked;
    };

    if (!isVisible) {
      headerCheckbox.input.checked = false;
    }

    lineItem.appendChild(checkboxContainer);
    container.appendChild(lineItem);
  }

  headerCheckbox.onchange = function (evt) {
    var inputs = container.querySelectorAll('[data-line]');

    for (var i = 0; i < inputs.length; i++) {
      inputs[i].checked = evt.target.checked;
    }
  };

  var cancelButton = (0, _Utils.htmlToElement)("<div\n            class=\"autoql-vanilla-chata-btn default\"\n            style=\"padding: 5px 16px; margin: 2px 5px;\">\n                Cancel\n            </div>");
  var spinner = (0, _Utils.htmlToElement)("\n        <div class=\"autoql-vanilla-spinner-loader hidden\"></div>\n    ");
  var saveButton = (0, _Utils.htmlToElement)("<div\n            class=\"autoql-vanilla-chata-btn primary\"\n            style=\"padding: 5px 16px; margin: 2px 5px;\">\n        </div>");
  saveButton.appendChild(spinner);
  saveButton.appendChild(document.createTextNode('Apply'));

  cancelButton.onclick = function (event) {
    modal.close();
  };

  saveButton.onclick = function (event) {
    var opts = options;
    var url = opts.authentication.demo ? "https://backend-staging.chata.ai/api/v1/chata/query" : "".concat(opts.authentication.domain, "/autoql/api/v1/query/column-visibility?key=").concat(opts.authentication.apiKey);
    this.classList.add('disabled');
    spinner.classList.remove('hidden');
    var inputs = container.querySelectorAll('[data-line]');
    var data = [];
    var table = document.querySelector("[data-componentid='".concat(id, "']"));
    var tableCols = table.tabulator.getColumns();

    for (var i = 0; i < inputs.length; i++) {
      var colName = inputs[i].dataset.colName;
      data.push({
        name: colName,
        is_visible: inputs[i].checked
      });
      json['data']['columns'][i]['is_visible'] = inputs[i].checked;

      if (inputs[i].checked) {
        tableCols[i].show();
      } else {
        tableCols[i].hide();
      }

      table.tabulator.redraw();
    }

    ChataUtils.putCall(url, {
      columns: data
    }, function (response) {
      modal.close();
      allColHiddenMessage(table);
      onHideCols();
    }, opts);
  };

  modal.addView(container);
  modal.addFooterElement(cancelButton);
  modal.addFooterElement(saveButton);
  modal.show();
};

ChataUtils.makeBarChartDomain = function (data, hasNegativeValues) {
  if (hasNegativeValues) {
    return chataD3.extent(data, function (d) {
      return d.value;
    });
  } else {
    return [0, chataD3.max(data, function (d) {
      return d.value;
    })];
  }
};

ChataUtils.getUniqueValues = function (data, getter) {
  var unique = {};
  data.forEach(function (i) {
    console.log();

    if (!unique[getter(i)] && typeof getter(i) === 'string') {
      unique[getter(i)] = true;
    }
  });
  return Object.keys(unique);
};

ChataUtils.formatCompareData = function (col, data, groups) {
  var dataGrouped = [];

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    dataGrouped.push({
      group: group
    });

    for (var x = 0; x < data.length; x++) {
      if (data[x][0] == group) {
        dataGrouped[i]['value1'] = parseFloat(data[x][1]);
        dataGrouped[i]['value2'] = parseFloat(data[x][2]);
      }
    }
  }

  return dataGrouped;
};

ChataUtils.format3dData = function (json, groups, metadata) {
  var dataGrouped = [];
  var data = json['data']['rows'];
  var notGroupableField = getNotGroupableField(json);
  var groupableIndex1 = metadata.groupBy.groupable1;
  var groupableIndex2 = metadata.groupBy.groupable2;
  var notGroupableIndex = notGroupableField.indexCol;

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    dataGrouped.push({
      group: group
    });

    for (var x = 0; x < data.length; x++) {
      if (data[x][groupableIndex2] == group) {
        if (typeof data[x][groupableIndex1] === 'string') {
          dataGrouped[i][data[x][groupableIndex1]] = parseFloat(data[x][notGroupableIndex]);
        }
      }
    }
  }

  return dataGrouped;
};

ChataUtils.groupBy = function (list, keyGetter, indexData) {
  obj = {};
  list.forEach(function (item) {
    var key = keyGetter(item);

    if (!obj.hasOwnProperty(key)) {
      obj[key] = item[indexData];
    } else {
      obj[key] += item[indexData];
    }
  });
  return obj;
};

ChataUtils.sort = function (data, operator, colIndex, colType) {
  var lines = data;
  var values = [];

  for (var i = 0; i < lines.length; i++) {
    var data = lines[i];
    var row = [];

    for (var x = 0; x < data.length; x++) {
      row.push(data[x]);
    }

    values.push(row);
  }

  if (operator == 'asc') {
    var comparator = function comparator(a, b) {
      if (colType == 'DOLLAR_AMT' || colType == 'DATE') {
        return parseFloat(a[colIndex]) > parseFloat(b[colIndex]) ? 1 : -1;
      } else {
        return a[colIndex] > b[colIndex] ? 1 : -1;
      }
    };
  } else {
    var comparator = function comparator(a, b) {
      if (colType == 'DOLLAR_AMT' || colType == 'DATE') {
        return parseFloat(a[colIndex]) < parseFloat(b[colIndex]) ? 1 : -1;
      } else {
        return a[colIndex] < b[colIndex] ? 1 : -1;
      }
    };
  }

  var sortedArray = values.sort(comparator);
  return sortedArray;
};

ChataUtils.refreshPivotTable = function (table, pivotArray) {
  var rows = table.childNodes;
  var cols = ChataUtils.responses[table.dataset.componentid]['columns'];

  for (var i = 0; i < rows.length; i++) {
    rows[i].style.display = 'table-row';
  }

  for (var i = 0; i < pivotArray.length; i++) {
    var tdList = rows[i].childNodes;

    for (var x = 0; x < tdList.length; x++) {
      tdList[x].textContent = pivotArray[i][x];
    }
  }

  for (var i = pivotArray.length; i < rows.length; i++) {
    rows[i].style.display = 'none';
  }
};

ChataUtils.refreshTableData = function (table, newData, options) {
  var rows = newData; //table.childNodes;

  var nodes = table.childNodes;
  var cols = ChataUtils.responses[table.dataset.componentid]['data']['columns'];

  for (var i = 0; i < nodes.length; i++) {
    nodes[i].style.display = 'table-row';
  }

  for (var i = 0; i < newData.length; i++) {
    var tdList = nodes[i].childNodes;

    for (var x = 0; x < tdList.length; x++) {
      tdList[x].textContent = formatData(newData[i][x], cols[x], options);
    }
  }

  for (var i = newData.length; i < nodes.length; i++) {
    nodes[i].style.display = 'none';
  }
};

ChataUtils.onClickColumn = function (evt, tableElement, options) {
  var sortBy;
  var newClassArrow;
  var parent = evt.target;
  evt.preventDefault();

  if (parent.tagName === 'INPUT') {
    return;
  }

  if (parent.tagName === 'TH') {
    parent = parent.childNodes[0];
  }

  if (tableElement.sort === 'asc') {
    sortBy = 'desc';
    newClassArrow = 'down';
  } else {
    sortBy = 'asc';
    newClassArrow = 'up';
  }

  tableElement.sort = sortBy;
  parent.nextSibling.classList.remove('up');
  parent.nextSibling.classList.remove('down');
  parent.nextSibling.classList.add(newClassArrow);
  var data = applyFilter(tableElement.dataset.componentid);
  var sortData = ChataUtils.sort(data, sortBy, parent.dataset.index, parent.dataset.type);
  ChataUtils.refreshTableData(tableElement, sortData, options);
};

ChataUtils.onClickPivotColumn = function (evt, tableElement, options) {
  var pivotArray = [];
  var json = cloneObject(ChataUtils.responses[tableElement.dataset.componentid]);
  var columns = json['data']['columns'];
  var sortBy;
  var newClassArrow;
  var parent = evt.target;
  evt.preventDefault();

  if (parent.tagName === 'INPUT') {
    return;
  }

  if (parent.tagName === 'TH') {
    parent = parent.childNodes[0];
  }

  if (columns[0].type === 'DATE' && columns[0].name.includes('month')) {
    pivotArray = getDatePivotArray(json, options, cloneObject(json['data']['rows']));
  } else {
    pivotArray = getPivotColumnArray(json, options, cloneObject(json['data']['rows']));
  }

  if (tableElement.sort === 'asc') {
    sortBy = 'desc';
    newClassArrow = 'down';
  } else {
    sortBy = 'asc';
    newClassArrow = 'up';
  }

  tableElement.sort = sortBy;
  parent.nextSibling.classList.remove('up');
  parent.nextSibling.classList.remove('down');
  parent.nextSibling.classList.add(newClassArrow);
  var rows = applyFilter(tableElement.dataset.componentid, pivotArray);
  rows.unshift([]); //Simulate header

  var sortData = sortPivot(rows, parent.dataset.index, sortBy); // sortData.unshift([]); //Simulate header

  ChataUtils.refreshPivotTable(tableElement, sortData);
};

ChataUtils.createCsvData = function (json) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';
  var output = '';
  var lines = json['data']['rows'];
  var cols = json['data']['columns'];

  for (var i = 0; i < cols.length; i++) {
    if (!cols[i]['is_visible']) continue;
    var colStr = cols[i]['display_name'] || cols[i]['name'];
    var colName = formatColumnName(colStr);
    output += colName + separator;
  }

  output += '\n';

  for (var i = 0; i < lines.length; i++) {
    var data = lines[i];

    for (var x = 0; x < data.length; x++) {
      if (!cols[x]['is_visible']) continue;
      output += data[x] + separator;
    }

    output += '\n';
  }

  return output;
};

ChataUtils.safetynetCall = function (url, callback, options) {
  var extraHeaders = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var jsonResponse = undefined;

      if (xhr.status == 200) {
        jsonResponse = JSON.parse(xhr.responseText);
      }

      callback(jsonResponse, xhr.status);
    }
  };

  xhr.open('GET', url);

  var _iterator = _createForOfIteratorHelper(extraHeaders),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var obj = _step.value;
      var key = Object.entries(obj)[0];
      xhr.setRequestHeader(key[0], key[1]);
    } // xhr.setRequestHeader("Access-Control-Allow-Origin","*");

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  xhr.setRequestHeader("Authorization", "Bearer ".concat(options.authentication.token));
  xhr.send();
};

ChataUtils.ajaxCall = function (val, callback, options, source) {
  var url = options.authentication.demo ? "https://backend-staging.chata.ai/api/v1/chata/query" : "".concat(options.authentication.domain, "/autoql/api/v1/query?key=").concat(options.authentication.apiKey);
  var data = {
    text: val,
    source: source,
    // username: options.authentication.demo ? 'widget-demo' : options.authentication.userId || 'widget-user',
    // customer_id: options.authentication.customerId || "",
    // user_id: options.authentication.userId || "",
    debug: options.autoQLConfig.debug,
    test: options.autoQLConfig.test
  };

  if (options.authentication.demo) {
    data['user_id'] = 'demo';
    data['customer_id'] = 'demo';
  }

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var jsonResponse = JSON.parse(xhr.responseText);
      callback(jsonResponse, xhr.status);
    }
  };

  xhr.open('POST', url);
  xhr.setRequestHeader("Content-Type", "application/json");

  if (!options.authentication.demo) {
    // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    xhr.setRequestHeader("Authorization", "Bearer ".concat(options.authentication.token));
  }

  xhr.send(JSON.stringify(data));
};

ChataUtils.putCall = function (url, data, callback, options) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var jsonResponse = JSON.parse(xhr.responseText);
      callback(jsonResponse);
    }
  };

  xhr.open('PUT', url);
  xhr.setRequestHeader("Content-Type", "application/json");

  if (!options.authentication.demo) {
    xhr.setRequestHeader("Authorization", "Bearer ".concat(options.authentication.token));
  }

  xhr.send(JSON.stringify(data));
};

ChataUtils.deleteCall = function (url, callback, options) {
  var extraHeaders = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var jsonResponse = JSON.parse(xhr.responseText);
      callback(jsonResponse);
    }
  };

  xhr.open('DELETE', url);

  var _iterator2 = _createForOfIteratorHelper(extraHeaders),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var obj = _step2.value;
      var key = Object.entries(obj)[0];
      xhr.setRequestHeader(key[0], key[1]);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  if (!options.authentication.demo) {
    xhr.setRequestHeader("authorization", "Bearer ".concat(options.authentication.token));
  }

  xhr.send();
};

ChataUtils.ajaxCallPost = function (url, callback, data, options) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", url);
  xmlhttp.setRequestHeader("Content-Type", "application/json");

  if (!options.authentication.demo) {
    xmlhttp.setRequestHeader("Authorization", "Bearer ".concat(options.authentication.token));
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4) {
      var jsonResponse = JSON.parse(xmlhttp.responseText);
      callback(jsonResponse, xmlhttp.status);
    }
  };

  xmlhttp.send(JSON.stringify(data));
};

ChataUtils.ajaxCallAutoComplete = function (url, callback, options) {
  options.xhr.onreadystatechange = function () {
    if (options.xhr.readyState === 4) {
      console.log(options.xhr.responseText);
      var jsonResponse = {
        data: {
          matches: []
        }
      };

      if (options.xhr.responseText) {
        jsonResponse = JSON.parse(options.xhr.responseText);
      }

      callback(jsonResponse);
    }
  }; // ChataUtils.xhr.open('GET', url);
  // ChataUtils.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
  // ChataUtils.xhr.setRequestHeader("Authorization", options.authentication.token ? `Bearer ${options.authentication.token}` : undefined);
  // ChataUtils.xhr.send();


  options.xhr.open('GET', url);
  options.xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  options.xhr.setRequestHeader("Authorization", options.authentication.token ? "Bearer ".concat(options.authentication.token) : undefined);
  options.xhr.send();
};

ChataUtils.autocomplete = function (suggestion, suggestionList) {
  var liClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'suggestion';
  var options = arguments.length > 3 ? arguments[3] : undefined;
  var URL = options.authentication.demo ? "https://backend.chata.ai/api/v1/autocomplete?q=".concat(encodeURIComponent(suggestion), "&projectid=1") : "".concat(options.authentication.domain, "/autoql/api/v1/query/autocomplete?text=").concat(encodeURIComponent(suggestion), "&key=").concat(options.authentication.apiKey); // &customer_id=${options.authentication.customerId}&user_id=${options.authentication.userId}

  ChataUtils.ajaxCallAutoComplete(URL, function (jsonResponse) {
    suggestionList.innerHTML = '';
    var matches = jsonResponse['matches'] || jsonResponse['data']['matches'];

    if (matches.length > 0) {
      for (var _i2 = 0, _Object$entries2 = Object.entries(options.autocompleteStyles); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            key = _Object$entries2$_i[0],
            value = _Object$entries2$_i[1];

        suggestionList.style.setProperty(key, value, '');
      }

      for (var i = matches.length - 1; i >= 0; i--) {
        var li = document.createElement('li');
        li.classList.add(liClass);
        li.textContent = matches[i];
        suggestionList.appendChild(li);
      }

      suggestionList.style.display = 'block';
    } else {
      suggestionList.style.display = 'none';
    }
  }, options);
};

ChataUtils.getSupportedDisplayTypesArray = function () {
  return getSupportedDisplayTypesArray();
};

ChataUtils.createSuggestions = function (responseContentContainer, data) {
  var classButton = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'autoql-vanilla-chata-suggestion-btn';

  for (var i = 0; i < data.length; i++) {
    var div = document.createElement('div');
    var button = document.createElement('button');
    button.classList.add(classButton);
    button.textContent = data[i];
    div.appendChild(button);
    responseContentContainer.appendChild(div);
  }
};

ChataUtils.registerWindowClicks = function (evt) {
  console.log('WINDOW CLICKS!!!');
  console.log(window);
  var excludeElementsForChartSelector = ['autoql-vanilla-x-axis-label-border', 'autoql-vanilla-y-axis-label-border', 'autoql-vanilla-axis-selector-container', 'number-selector-header', 'chata-chart-selector-checkbox', 'autoql-vanilla-chata-col-selector-name', 'autoql-vanilla-button-wrapper-selector', 'autoql-vanilla-chata-list-item'];
  var excludeElementsForToolbars = ['autoql-vanilla-chata-toolbar-btn', 'autoql-vanilla-more-options', 'chata-more-options-menu', 'report_problem'];
  var excludeElementsForSafetynet = ['autoql-vanilla-safetynet-selector', 'autoql-vanilla-chata-safetynet-select'];
  document.body.addEventListener('click', function (evt) {
    console.log('FOOOO');
    var closePop = true;
    var closeChartPopovers = true;
    var closeToolbars = true;
    var closeSafetynetSelectors = true;

    for (var i = 0; i < excludeElementsForSafetynet.length; i++) {
      var c = excludeElementsForSafetynet[i];

      if (evt.target.classList.contains(c)) {
        closeSafetynetSelectors = false;
      }
    }

    for (var i = 0; i < excludeElementsForChartSelector.length; i++) {
      var c = excludeElementsForChartSelector[i];

      if (evt.target.classList.contains(c)) {
        closeChartPopovers = false;
        break;
      }
    }

    for (var i = 0; i < excludeElementsForToolbars.length; i++) {
      var c = excludeElementsForToolbars[i];

      if (evt.target.classList.contains(c)) {
        closeToolbars = false;
        break;
      }
    }

    if (closeChartPopovers) {
      closeAllChartPopovers();
    }

    if (closeToolbars) {
      closeAllToolbars();
    }

    if (closeSafetynetSelectors) {
      closeAllSafetynetSelectors();
    }
  });
};

(function () {
  var initEvents = function initEvents() {
    setTimeout(function () {
      ChataUtils.registerWindowClicks();
    }, 3000);
  };

  document.addEventListener("DOMContentLoaded", function (event) {
    try {
      window.addEventListener("load", initEvents, false);
    } catch (e) {
      window.onload = initEvents;
    }
  });
})();
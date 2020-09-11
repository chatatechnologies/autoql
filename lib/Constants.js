"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERROR_MESSAGE = exports.DISPLAY_TYPES_3D = exports.DISPLAY_TYPES_2D = exports.MONTH_NAMES = exports.DARK_THEME = exports.DASHBOARD_LIGHT_THEME = exports.LIGHT_THEME = void 0;
var LIGHT_THEME = {
  '--chata-drawer-accent-color': '#28a8e0',
  '--chata-drawer-background-color': '#fff',
  '--chata-drawer-border-color': '#d3d3d352',
  '--chata-drawer-hover-color': '#ececec',
  '--chata-drawer-text-color-primary': '#5d5d5d',
  '--chata-drawer-text-color-placeholder': '#0000009c'
};
exports.LIGHT_THEME = LIGHT_THEME;
var DASHBOARD_LIGHT_THEME = {
  '--chata-dashboard-accent-color': '#28a8e0',
  '--chata-dashboard-background-color': '#fff',
  '--chata-dashboard-border-color': '#d3d3d352',
  '--chata-dashboard-hover-color': '#ececec',
  '--chata-dashboard-text-color-primary': '#5d5d5d',
  '--chata-dashboard-text-color-placeholder': '#0000009c'
};
exports.DASHBOARD_LIGHT_THEME = DASHBOARD_LIGHT_THEME;
var DARK_THEME = {
  '--chata-drawer-accent-color': '#525252',
  // dark gray
  // '--chata-drawer-accent-color': '#193a48', // dark blue
  '--chata-drawer-background-color': '#636363',
  '--chata-drawer-border-color': '#d3d3d329',
  '--chata-drawer-hover-color': '#5a5a5a',
  '--chata-drawer-text-color-primary': '#fff',
  '--chata-drawer-text-color-placeholder': '#ffffff9c'
};
exports.DARK_THEME = DARK_THEME;
var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
exports.MONTH_NAMES = MONTH_NAMES;
var DISPLAY_TYPES_2D = ['table', 'column', 'bar', 'line', 'compare_table', 'pie'];
exports.DISPLAY_TYPES_2D = DISPLAY_TYPES_2D;
var DISPLAY_TYPES_3D = ['table', // 'date_pivot',
'pivot_column', 'heatmap', 'bubble', 'stacked_bar', 'stacked_column'];
exports.DISPLAY_TYPES_3D = DISPLAY_TYPES_3D;
var ERROR_MESSAGE = "\nOops! It looks like our system is experiencing an issue.\nTry querying again. If the problem persists,\nplease send an email to our team at support@chata.ai.\nWe'll look into this issue right away and be in touch with you shortly.\n";
exports.ERROR_MESSAGE = ERROR_MESSAGE;
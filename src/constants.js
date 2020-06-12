const LIGHT_THEME = {
  '--chata-drawer-accent-color': '#28a8e0',
  '--chata-drawer-background-color': '#fff',
  '--chata-drawer-border-color': '#d3d3d352',
  '--chata-drawer-hover-color': '#ececec',
  '--chata-drawer-text-color-primary': '#5d5d5d',
  '--chata-drawer-text-color-placeholder': '#0000009c'
}

const DASHBOARD_LIGHT_THEME = {
  '--chata-dashboard-accent-color': '#28a8e0',
  '--chata-dashboard-background-color': '#fff',
  '--chata-dashboard-border-color': '#d3d3d352',
  '--chata-dashboard-hover-color': '#ececec',
  '--chata-dashboard-text-color-primary': '#5d5d5d',
  '--chata-dashboard-text-color-placeholder': '#0000009c'
}


const DARK_THEME = {
  '--chata-drawer-accent-color': '#525252', // dark gray
  // '--chata-drawer-accent-color': '#193a48', // dark blue
  '--chata-drawer-background-color': '#636363',
  '--chata-drawer-border-color': '#d3d3d329',
  '--chata-drawer-hover-color': '#5a5a5a',
  '--chata-drawer-text-color-primary': '#fff',
  '--chata-drawer-text-color-placeholder': '#ffffff9c'
}

const MONTH_NAMES = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

const DISPLAY_TYPES_2D = [
    'table',
    'column',
    'bar',
    'line',
    'compare_table',
    'pie'
];

const DISPLAY_TYPES_3D  = [
    'table',
    // 'date_pivot',
    'pivot_column',
    'heatmap',
    'bubble',
    'stacked_bar',
    'stacked_column'
];

const ERROR_MESSAGE = `
Oops! It looks like our system is experiencing an issue.
Try querying again. If the problem persists,
please send an email to our team at support@chata.ai.
We'll look into this issue right away and be in touch with you shortly.
`

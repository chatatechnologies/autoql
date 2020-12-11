export const LIGHT_THEME = {
    'accent-color': '#28a8e0',
    'background-color-primary': '#fff',
    'background-color-secondary': '#F1F3F5',
    'background-color-tertiary': '#cccccc',
    'border-color': '#e6e6e6',
    'hover-color': '#ececec',
    'text-color-primary': '#5d5d5d',
    'text-color-placeholder': '#00000036',
    'font-family': 'sans-serif',
    'highlight-color': '#000',
    'danger-color': '#ca0b00',
    'warning-color': '#FFCC00'
}

export const DARK_THEME = {
  'accent-color': '#193a48',
  'background-color-primary': '#3B3F46',
  'background-color-secondary': '#20252A',
  'background-color-tertiary': '#292929',
  'border-color': '#53565c',
  'hover-color': '#4a4f56',
  'text-color-primary': '#fff',
  'text-color-placeholder': '#ffffff9c',
  'font-family': 'sans-serif',
  'highlight-color': '#FFF',
  'danger-color': '#ff584e',
  'warning-color': '#FFCC00'
}

export const DASHBOARD_LIGHT_THEME = {
    '--chata-dashboard-accent-color': '#28a8e0',
    '--chata-dashboard-background-color': '#fff',
    '--chata-dashboard-border-color': '#d3d3d352',
    '--chata-dashboard-hover-color': '#ececec',
    '--chata-dashboard-text-color-primary': '#5d5d5d',
    '--chata-dashboard-text-color-placeholder': '#0000009c'
}



export const MONTH_NAMES = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

export const DISPLAY_TYPES_2D = [
    'table',
    'column',
    'bar',
    'line',
    'compare_table',
    'pie'
];

export const DISPLAY_TYPES_3D  = [
    'table',
    // 'date_pivot',
    'pivot_column',
    'heatmap',
    'bubble',
    'stacked_bar',
    'stacked_column'
];

export const ERROR_MESSAGE = `
Oops! It looks like our system is experiencing an issue.
Try querying again. If the problem persists,
please send an email to our team at support@chata.ai.
We'll look into this issue right away and be in touch with you shortly.
`

export const DATA_LIMIT_MESSAGE = `
The display limit for your data has been reached. Try querying a smaller time-frame to ensure all your data is displayed.
`

const CLIPBOARD_ICON = `
<svg stroke="currentColor" class="clipboard" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path class="clipboard" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
    </path>
</svg>
`;

const DOWNLOAD_CSV_ICON = `
<svg stroke="currentColor" class="csv" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="csv"></path>
</svg>
`;

const EXPORT_PNG_ICON = `
<svg stroke="currentColor" class="export_png" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="export_png"></path>
</svg>
`;

const TABLE_ICON = `
<svg class="table" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="chart-icon-svg-0 table" d="M8,0.8c2.3,0,4.6,0,6.9,0c0.8,0,1.1,0.3,1.1,1.1c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.8,5.7,0.8,8,0.8L8,0.8z M5,11.1H1v2.7h4V11.1L5,11.1z M10,13.8v-2.7H6v2.7
        L10,13.8L10,13.8z M11,13.8h4v-2.7h-4V13.8L11,13.8z M1.1,7.5v2.7h4V7.5H1.1L1.1,7.5z M11,10.2c1.3,0,2.5,0,3.8,0
        c0.1,0,0.2-0.1,0.2-0.2c0-0.8,0-1.7,0-2.5h-4C11,8.4,11,9.3,11,10.2L11,10.2z M6,10.1h4V7.5H6V10.1L6,10.1z M5,6.6V3.9H1
        c0,0.8,0,1.6,0,2.4c0,0.1,0.2,0.2,0.3,0.2C2.5,6.6,3.7,6.6,5,6.6L5,6.6z M6,6.5h4V3.9H6V6.5L6,6.5z M14.9,6.5V3.9h-4v2.7L14.9,6.5
        L14.9,6.5z">
    </path>
</svg>
`;

const PIVOT_ICON = `
<svg class="pivot_table" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="pivot_table chart-icon-svg-0" d="M8,0.7c2.3,0,4.6,0,6.9,0C15.7,0.7,16,1,16,1.8c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0 c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.7,5.7,0.7,8,0.7L8,0.7z M5.1,6.4h4.4V3.8H5.1V6.4L5.1,6.4z M14.9,6.4V3.8 h-4.4v2.7L14.9,6.4L14.9,6.4z M5.1,10.1h4.4V7.4H5.1V10.1L5.1,10.1z M14.9,10.1V7.4h-4.4v2.7H14.9L14.9,10.1z M5.1,13.7h4.4V11H5.1 V13.7L5.1,13.7z M14.9,13.7V11h-4.4v2.7L14.9,13.7L14.9,13.7z">
    </path>
</svg>
`;

const COLUMN_CHART_ICON = `
<svg class="column_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="chart-icon-svg-0 column_chart" d="M12.6,0h-2.4C9.4,0,8.8,0.6,8.8,1.4v2.7c0,0,0,0,0,0H6.3c-0.8,0-1.4,0.6-1.4,1.4v3.2c0,0-0.1,0-0.1,0H2.4 C1.6,8.7,1,9.4,1,10.1v4.5C1,15.4,1.6,16,2.4,16h2.4c0,0,0.1,0,0.1,0h1.3c0,0,0.1,0,0.1,0h2.4c0,0,0.1,0,0.1,0H10c0,0,0.1,0,0.1,0 h2.4c0.8,0,1.4-0.6,1.4-1.4V1.4C14,0.6,13.3,0,12.6,0z M6.3,5.5h2.4v9.1H6.3V5.5z M2.4,10.1h2.4v4.5H2.4V10.1z M12.6,14.6h-2.4V1.4 h2.4V14.6z">
    </path>
</svg>
`;

const STACKED_COLUMN_CHART_ICON = `
<svg class="stacked_column_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="chart-icon-svg-0 stacked_column_chart" d="M12.6,0h-2.4C9.4,0,8.8,0.6,8.8,1.4v2.7c0,0,0,0,0,0H6.3c-0.8,0-1.4,0.6-1.4,1.4v3.2c0,0-0.1,0-0.1,0H2.4 C1.6,8.7,1,9.4,1,10.1v4.5C1,15.4,1.6,16,2.4,16h2.4c0,0,0.1,0,0.1,0h1.3c0,0,0.1,0,0.1,0h2.4c0,0,0.1,0,0.1,0H10c0,0,0.1,0,0.1,0 h2.4c0.8,0,1.4-0.6,1.4-1.4V1.4C14,0.6,13.3,0,12.6,0z M6.3,5.5h2.4v9.1H6.3V5.5z M2.4,10.1h2.4v4.5H2.4V10.1z M12.6,14.6h-2.4V1.4 h2.4V14.6z">
    </path>
</svg>
`;

const STACKED_BAR_CHART_ICON = `
<svg class="stacked_bar_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="chart-icon-svg-0 stacked_bar_chart" d="M14.6,1.6H1.4C0.6,1.6,0,2.2,0,3v2.4v0.1v1.2v0.1v2.4v0.1v1.3v0.1v2.4c0,0.8,0.6,1.4,1.4,1.4h4.5 c0.7,0,1.4-0.6,1.4-1.4v-2.4v-0.1h3.2c0.8,0,1.4-0.6,1.4-1.4V6.7l0,0h2.7c0.8,0,1.4-0.6,1.4-1.4V2.9C16,2.2,15.4,1.5,14.6,1.6z M1.4,9.2V6.8h9.1v2.4H1.4z M1.4,13.1v-2.4h4.5v2.4H1.4z M14.6,2.9v2.4H1.4V2.9H14.6z">
    </path>
</svg>
`;


const BAR_CHART_ICON = `
<svg class="bar_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="chart-icon-svg-0 bar_chart" d="M14.6,1.6H1.4C0.6,1.6,0,2.2,0,3v2.4v0.1v1.2v0.1v2.4v0.1v1.3v0.1v2.4c0,0.8,0.6,1.4,1.4,1.4h4.5 c0.7,0,1.4-0.6,1.4-1.4v-2.4v-0.1h3.2c0.8,0,1.4-0.6,1.4-1.4V6.7l0,0h2.7c0.8,0,1.4-0.6,1.4-1.4V2.9C16,2.2,15.4,1.5,14.6,1.6z M1.4,9.2V6.8h9.1v2.4H1.4z M1.4,13.1v-2.4h4.5v2.4H1.4z M14.6,2.9v2.4H1.4V2.9H14.6z">
    </path>
</svg>
`;

const LINE_CHART_ICON = `
<svg class="line_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="chart-icon-svg-0 line_chart" d="M1,12.2c-0.2,0-0.3-0.1-0.5-0.2c-0.3-0.3-0.3-0.7,0-1l3.8-3.9C4.5,7,4.7,7,4.9,7s0.4,0.1,0.5,0.3l2.3,3l6.8-7.1 c0.3-0.3,0.7-0.3,1,0c0.3,0.3,0.3,0.7,0,1l-7.3,7.7C8,11.9,7.8,12,7.6,12s-0.4-0.1-0.5-0.3l-2.3-3L1.5,12C1.4,12.2,1.2,12.2,1,12.2z ">
    </path>
</svg>
`;

const HEATMAP_ICON = `
<svg class="heatmap" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <path class="hm0 heatmap" d="M12,16h2.5c0.8,0,1.5-0.7,1.5-1.5v-2.4l-4,0V16z">
    </path>
    <polygon class="hm1 heatmap" points="8,4.1 8,0 4,0 4,4.1 "></polygon>
    <path class="hm2 heatmap" d="M4,4.1V0L1.5,0C0.7,0,0,0.7,0,1.5l0,2.6h0l0,0L4,4.1z"></path>
    <polygon class="hm3 heatmap" points="8,4.1 8,4.1 8,4.1 4,4.1 4,8.1 8,8.2 "></polygon>
    <polygon class="hm2 heatmap" points="0,4.1 0,8.1 4,8.1 4,4.1 "></polygon>
    <polygon class="hm1 heatmap" points="4,4.1 8,4.1 8,4.1 "></polygon>
    <polygon class="hm1 heatmap" points="4,16 8,16 8,12.1 4,12.1 "></polygon>
    <path class="hm0 heatmap" d="M0,12.1v2.5C0,15.3,0.7,16,1.5,16H4v-3.9L0,12.1z"></path>
    <polygon class="hm0 heatmap" points="0,12.1 4,12.1 4,8.2 0,8.2 "></polygon>
    <polygon class="hm4 heatmap" points="8,12.1 8,8.2 4,8.2 4,12.1 "></polygon>
    <polygon class="hm2 heatmap" points="16,4.1 16,4.1 16,4.1 12,4.1 12,8.2 16,8.2 "></polygon>
    <path class="hm0 heatmap" d="M16,4.1l0-2.6C16,0.7,15.3,0,14.5,0L12,0v4.1L16,4.1z"></path>
    <polygon class="hm4 heatmap" points="12,4.1 12,0 8,0 8,4.1 8,4.1 8,4.1 "></polygon>
    <polygon class="hm5 heatmap" points="12,4.1 8,4.1 8,4.1 "></polygon>
    <polygon class="hm6 heatmap" points="12,4.1 16,4.1 16,4.1 "></polygon>
    <polygon class="hm2 heatmap" points="12,12.1 16,12.1 16,8.2 12,8.2 "></polygon>
    <polygon class="hm1 heatmap" points="12,8.2 8,8.2 8,12.1 12,12.1 "></polygon>
    <polygon class="hm1 heatmap" points="8,12.1 8,16 12,16 12,12.1 "></polygon>
</svg>
`;

const BUBBLE_CHART_ICON = `
<svg class="bubble_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
    <circle class="chart-icon-svg-0 bubble_chart" cx="7.7" cy="11.1" r="1.2"></circle>
    <circle class="chart-icon-svg-0 bubble_chart" cx="2.6" cy="8.8" r="2.6"></circle>
    <circle class="chart-icon-svg-0 bubble_chart" cx="11.7" cy="4.3" r="4.3"></circle>
    <circle class="chart-icon-svg-0 bubble_chart" cx="1.8" cy="14.8" r="1.2"></circle>
</svg>
`;

const HELP_ICON = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="chata-help-link-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 48h-.7c-55.4.2-107.4 21.9-146.6 61.1C69.6 148.4 48 200.5 48 256s21.6 107.6 60.8 146.9c39.1 39.2 91.2 60.9 146.6 61.1h.7c114.7 0 208-93.3 208-208S370.7 48 256 48zm180.2 194h-77.6c-.9-26.7-4.2-52.2-9.8-76.2 17.1-5.5 33.7-12.5 49.7-21 22 28.2 35 61.6 37.7 97.2zM242 242h-61.8c.8-24.5 3.8-47.7 8.8-69.1 17.4 3.9 35.1 6.3 53 7.1v62zm0 28v61.9c-17.8.8-35.6 3.2-53 7.1-5-21.4-8-44.6-8.8-69H242zm28 0h61.3c-.8 24.4-3.8 47.6-8.8 68.9-17.2-3.9-34.8-6.2-52.5-7V270zm0-28v-62c17.8-.8 35.4-3.2 52.5-7 5 21.4 8 44.5 8.8 69H270zm109.4-117.9c-12.3 6.1-25 11.3-38 15.5-7.1-21.4-16.1-39.9-26.5-54.5 24 8.3 45.9 21.6 64.5 39zM315 146.8c-14.7 3.2-29.8 5.2-45 6V79.4c17 9.2 33.6 33.9 45 67.4zM242 79v73.7c-15.4-.8-30.6-2.8-45.5-6.1 11.6-33.8 28.4-58.5 45.5-67.6zm-45.6 6.4c-10.3 14.5-19.2 32.9-26.3 54.1-12.8-4.2-25.4-9.4-37.5-15.4 18.4-17.3 40.1-30.5 63.8-38.7zm-82.9 59.5c15.8 8.4 32.3 15.4 49.2 20.8-5.7 23.9-9 49.5-9.8 76.2h-77c2.6-35.4 15.6-68.8 37.6-97zM75.8 270h77c.9 26.7 4.2 52.3 9.8 76.2-16.9 5.5-33.4 12.5-49.2 20.8-21.9-28.1-34.9-61.5-37.6-97zm56.7 117.9c12.1-6 24.7-11.2 37.6-15.4 7.1 21.3 16 39.6 26.3 54.2-23.7-8.4-45.4-21.5-63.9-38.8zm64-22.6c14.9-3.3 30.2-5.3 45.5-6.1V433c-17.2-9.1-33.9-33.9-45.5-67.7zm73.5 67.3v-73.5c15.2.8 30.3 2.8 45 6-11.4 33.6-28 58.3-45 67.5zm45-5.7c10.4-14.6 19.4-33.1 26.5-54.5 13 4.2 25.8 9.5 38 15.6-18.6 17.3-40.6 30.6-64.5 38.9zm83.5-59.8c-16-8.5-32.6-15.5-49.7-21 5.6-23.9 8.9-49.4 9.8-76.1h77.6c-2.7 35.5-15.6 68.9-37.7 97.1z">
    </path>
</svg>
`;


const CHATA_BUBBLES_ICON = `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
<g>
	<g>
		<g>
			<path fill="#26A7DF" d="M16,5C14.8,2.3,12,0.4,8.8,0.4c-4.4,0-7.6,3.5-7.6,7.9v4c0,2.8-1,3.6-1,3.6c1.3,0.1,2.9-0.4,4-1.5
				c0.4,0.4,1,0.8,1.6,1c0.5,0.2,1,0.4,1.6,0.5c0-0.2-0.1-0.5-0.1-0.7c0-0.2,0-0.5,0-0.7c0-1.6,0.5-3.2,1.3-4.4
				c0.3-0.4,0.6-0.8,1-1.2c0.2-0.2,0.4-0.3,0.6-0.5c0.4-0.3,0.8-0.6,1.2-0.8c0.4-0.2,0.9-0.4,1.4-0.6c0.7-0.2,1.5-0.3,2.3-0.3l0,0
				c0.3,0,0.5,0,0.7,0c0.2,0,0.5,0.1,0.7,0.1C16.4,6,16.2,5.5,16,5z"/>
		</g>
	</g>
	<g>
		<path fill="#A3CC39" d="M22.7,18.3v-4c0-3.3-1.8-6-4.6-7.2c-0.5-0.2-1-0.4-1.6-0.5c0.1,0.5,0.2,1.1,0.2,1.7c0,1.9-0.7,3.6-1.8,4.9
			c-0.5,0.6-1,1-1.7,1.5c-0.4,0.3-0.9,0.5-1.3,0.7c-0.5,0.2-1,0.3-1.5,0.4c-0.5,0.1-1,0.2-1.6,0.2c-0.3,0-0.5,0-0.7,0
			c-0.3,0-0.5-0.1-0.7-0.1c0.1,0.6,0.3,1.1,0.5,1.6c1.2,2.8,3.9,4.6,7.2,4.6c1.8,0,3.5-0.5,4.6-1.6c1,1,2.9,1.8,4.1,1.5
			C23.8,21.9,22.7,21.3,22.7,18.3z"/>
	</g>
	<g>
		<path fill="none" d="M15.1,6.5c-4.4,0-7.8,3.5-7.8,7.9c0,0.5,0.1,1,0.1,1.5c0.5,0.1,1,0.1,1.5,0.1c4.4,0,7.8-3.3,7.8-7.6
			c0-0.6-0.1-1.1-0.2-1.7C16.1,6.5,15.6,6.5,15.1,6.5z"/>
	</g>
	<g>
		<path fill="none" d="M16.3,8.2C16.3,8.2,16.2,8.2,16.3,8.2c-0.1,0-0.1,0-0.2,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3
			c0,0.1,0,0.3,0.1,0.3c0,0.1,0.1,0.1,0.1,0.1c0,0,0.1,0,0.1,0c0,0,0.1-0.1,0.1-0.1c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			C16.3,8.3,16.3,8.2,16.3,8.2z"/>
		<path fill="none" d="M13.4,11C13.4,11,13.4,11,13.4,11c-0.1,0-0.1,0-0.2,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3
			c0,0.2,0,0.3,0.1,0.4c0,0.1,0.1,0.1,0.1,0.1c0,0,0.1,0,0.1,0c0,0,0.1-0.1,0.1-0.1c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			C13.5,11.1,13.5,11.1,13.4,11z"/>
		<path fill="none" d="M13.3,9.1C13.4,9.1,13.4,9.1,13.3,9.1C13.5,9.1,13.5,9,13.5,9c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.3,0.1,0.3
			C13.2,9.1,13.3,9.1,13.3,9.1z"/>
		<path fill="none" d="M11.9,10.6C11.9,10.6,12,10.6,11.9,10.6c0.1-0.1,0.1-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.3,0.1,0.3
			C11.8,10.6,11.9,10.6,11.9,10.6z"/>
		<path fill="none" d="M9.1,12.5C9.1,12.5,9.1,12.5,9.1,12.5c-0.1,0-0.1,0-0.2,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3
			c0,0.1,0,0.3,0.1,0.3c0,0.1,0.1,0.1,0.1,0.1c0,0,0.1,0,0.1,0c0,0,0.1-0.1,0.1-0.1c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			C9.2,12.6,9.2,12.5,9.1,12.5z"/>
		<path fill="none" d="M10.5,10.6C10.5,10.6,10.5,10.6,10.5,10.6c0.1-0.1,0.1-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.3,0.1,0.3
			C10.4,10.5,10.4,10.6,10.5,10.6z"/>
		<path fill="none" d="M7.6,14.9C7.6,14.9,7.7,14.9,7.6,14.9c0.1-0.1,0.1-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.3,0.1,0.3
			C7.5,14.8,7.6,14.9,7.6,14.9z"/>
		<path fill="none" d="M7.6,13.4C7.6,13.4,7.7,13.4,7.6,13.4c0.1-0.1,0.1-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.3,0.1,0.3
			C7.5,13.4,7.6,13.4,7.6,13.4z"/>
		<path fill="none" d="M11.9,9.1C11.9,9.1,12,9.1,11.9,9.1C12,9.1,12.1,9,12.1,9c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.3,0.1,0.3
			C11.8,9.1,11.9,9.1,11.9,9.1z"/>
		<path fill="none" d="M11.9,13.5C11.9,13.5,12,13.5,11.9,13.5c0.1-0.1,0.1-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0.1c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0.1,0.4
			C11.8,13.5,11.8,13.5,11.9,13.5z"/>
		<path fill="none" d="M11.9,12.1C11.9,12.1,12,12,11.9,12.1c0.1-0.1,0.1-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0s-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0.1,0.4
			C11.8,12,11.9,12.1,11.9,12.1z"/>
		<path fill="none" d="M16,7.2c0,0.1,0,0.2,0,0.3c0,0.1,0.1,0.1,0.1,0.1c0,0,0.1,0,0.1,0c0,0,0-0.1,0.1-0.1c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.2,0-0.3c0-0.1,0-0.1-0.1-0.1c0,0,0,0-0.1,0c0,0-0.1,0-0.1,0c0,0-0.1,0.1-0.1,0.2C16.1,7.1,16,7.2,16,7.2z"/>
		<path fill="none" d="M11.9,15C11.9,15,12,14.9,11.9,15c0.1-0.1,0.2-0.1,0.2-0.2c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1-0.1-0.1c0,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0.1c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0.1,0.4
			C11.8,14.9,11.8,15,11.9,15z"/>
		<path fill="none" d="M16.3,9.6C16.3,9.6,16.2,9.6,16.3,9.6c-0.1,0-0.1,0-0.2,0c0,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3
			c0,0.1,0,0.3,0.1,0.4c0,0.1,0.1,0.1,0.1,0.1c0,0,0.1,0,0.1,0s0.1-0.1,0.1-0.1c0-0.1,0-0.2,0-0.4c0-0.1,0-0.2,0-0.3
			C16.3,9.7,16.3,9.6,16.3,9.6z"/>
		<path fill="#A3CC39" d="M11.7,7.6c0.1,0.1,0.1,0.2,0.2,0.2c0,0,0.1,0,0.1-0.1c0,0,0.1-0.1,0.1-0.2c0-0.1,0-0.2,0-0.3
			c0-0.1,0-0.1,0-0.2c0,0-0.1,0-0.1,0c0,0,0,0.1,0,0.1c0,0.1,0,0.3,0,0.3c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0
			C11.8,7.7,11.8,7.6,11.7,7.6c0.1-0.1,0.1-0.2,0.1-0.3c0,0,0,0,0,0c0,0-0.1,0-0.1,0.1C11.6,7.4,11.6,7.5,11.7,7.6z"/>
		<path fill="#A3CC39" d="M13.4,6.7l-0.2,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.1v0.5c0,0.1,0,0.1,0,0.1
			c0,0,0,0,0,0c0,0,0,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0,0,0-0.1L13.4,6.7L13.4,6.7z"/>
		<path fill="#A3CC39" d="M14.8,6.7l-0.2,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.1v0.5c0,0.1,0,0.1,0,0.1
			c0,0,0,0,0,0c0,0,0,0-0.1,0v0H15v0c0,0-0.1,0-0.1,0s0,0,0,0c0,0,0,0,0-0.1L14.8,6.7L14.8,6.7z"/>
		<path fill="#A3CC39" d="M16,7c0,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.1,0.2,0.2,0.2c0,0,0.1,0,0.1-0.1
			c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0-0.2,0-0.3c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0C16,6.8,16,6.9,16,7z
			 M16.2,6.8C16.2,6.8,16.3,6.8,16.2,6.8c0.1,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.3c0,0.1,0,0.1-0.1,0.1
			c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0-0.3C16.1,6.9,16.1,6.9,16.2,6.8
			C16.1,6.8,16.2,6.8,16.2,6.8z"/>
		<path fill="#A3CC39" d="M10.4,9.1C10.4,9.1,10.4,9.1,10.4,9.1c0,0-0.1,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0,0,0-0.1
			V8.2h0l-0.2,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.1V9.1C10.4,9,10.4,9.1,10.4,9.1z"/>
		<path fill="#A3CC39" d="M11.9,9.2c0,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3c0-0.2,0-0.3-0.1-0.4
			c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0.1-0.1,0.2s-0.1,0.2-0.1,0.3c0,0.1,0,0.3,0.1,0.3
			C11.7,9.1,11.8,9.2,11.9,9.2z M11.8,8.4c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3
			C11.7,8.6,11.7,8.5,11.8,8.4z"/>
		<path fill="#A3CC39" d="M13,8.7c0,0.1,0,0.3,0.1,0.3c0.1,0.1,0.1,0.2,0.2,0.2c0,0,0.1,0,0.2-0.1S13.6,9,13.6,9
			c0-0.1,0.1-0.2,0.1-0.3c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0.1-0.1,0.2
			C13,8.5,13,8.6,13,8.7z M13.2,8.4c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3
			c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3C13.2,8.6,13.2,8.5,13.2,8.4z
			"/>
		<path fill="#A3CC39" d="M14.6,8.3C14.6,8.3,14.6,8.3,14.6,8.3c0.1,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0.1,0,0.1V9c0,0.1,0,0.1,0,0.1
			c0,0,0,0,0,0c0,0,0,0-0.1,0v0H15v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1V8.1h0L14.6,8.3L14.6,8.3z"/>
		<path fill="#A3CC39" d="M16.2,8.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0.1-0.1,0.2c0,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.3,0.1,0.3
			c0.1,0.1,0.1,0.2,0.2,0.2c0,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3c0-0.2,0-0.3-0.1-0.4
			C16.4,8.2,16.3,8.1,16.2,8.1z M16.4,9c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1C16,8.9,16,8.8,16,8.7
			c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0s0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3
			C16.4,8.8,16.4,8.9,16.4,9z"/>
		<path fill="#A3CC39" d="M9.1,9.6L8.9,9.7l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.1v0.5c0,0.1,0,0.1,0,0.1
			c0,0,0,0,0,0c0,0,0,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0s0,0,0,0c0,0,0,0,0-0.1L9.1,9.6L9.1,9.6L9.1,9.6z"/>
		<path fill="#A3CC39" d="M10.5,10.6c0,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3c0-0.2,0-0.3-0.1-0.4
			c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0.1-0.1,0.2c0,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.3,0.1,0.3
			C10.3,10.6,10.4,10.6,10.5,10.6z M10.3,9.9c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3
			C10.3,10,10.3,10,10.3,9.9z"/>
		<path fill="#A3CC39" d="M11.7,10.5c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2s0.1-0.2,0.1-0.3
			c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0.1c-0.1,0-0.1,0.1-0.1,0.2c0,0.1-0.1,0.2-0.1,0.3
			C11.6,10.2,11.6,10.4,11.7,10.5z M11.7,9.9c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0s0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3
			C11.7,10,11.7,9.9,11.7,9.9z"/>
		<path fill="#A3CC39" d="M13.3,10.6C13.3,10.6,13.3,10.6,13.3,10.6c0,0-0.1,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0
			c0,0,0-0.1,0-0.1V9.6h0l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.6C13.3,10.5,13.3,10.5,13.3,10.6
			z"/>
		<path fill="#A3CC39" d="M14.6,9.7C14.6,9.7,14.7,9.7,14.6,9.7c0.1,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.6
			c0,0.1,0,0.1,0,0.1s0,0,0,0c0,0,0,0-0.1,0v0H15v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1V9.6h0L14.6,9.7L14.6,9.7z"/>
		<path fill="#A3CC39" d="M16.2,9.6c-0.1,0-0.1,0-0.1,0.1c-0.1,0-0.1,0.1-0.1,0.2s-0.1,0.2-0.1,0.3c0,0.1,0,0.3,0.1,0.4
			c0.1,0.1,0.2,0.2,0.3,0.2c0,0,0.1,0,0.1-0.1c0.1-0.2,0.1-0.5,0.2-0.7c0-0.1,0-0.2-0.1-0.2C16.4,9.6,16.3,9.6,16.2,9.6z M16.4,10.4
			c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.4c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0.1-0.2
			c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3C16.4,10.2,16.4,10.3,16.4,10.4z"/>
		<path fill="#A3CC39" d="M7.8,11.5c0,0.2,0,0.3,0,0.3c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0
			c0,0,0.1,0,0.1-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2-0.1-0.3C7.8,11.3,7.8,11.4,7.8,11.5
			C7.8,11.5,7.8,11.5,7.8,11.5z"/>
		<path fill="#A3CC39" d="M8.9,11.2C8.9,11.1,8.9,11.1,8.9,11.2c0.1,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0.1,0,0.1v0.5
			C9,11.9,9,12,9,12c0,0,0,0,0,0c0,0,0,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1V11h0L8.9,11.2L8.9,11.2z"/>
		<path fill="#A3CC39" d="M10.5,11l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.6c0,0.1,0,0.1,0,0.1
			s0,0,0,0c0,0,0,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1L10.5,11L10.5,11z"/>
		<path fill="#A3CC39" d="M11.7,11.9c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3
			c0-0.2,0-0.3-0.1-0.4C12.1,11,12,11,11.9,11c-0.1,0-0.1,0-0.2,0.1c-0.1,0-0.1,0.1-0.2,0.2c0,0.1-0.1,0.2-0.1,0.3
			C11.6,11.7,11.6,11.8,11.7,11.9z M11.7,11.3c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.4
			C11.7,11.5,11.7,11.4,11.7,11.3z"/>
		<path fill="#A3CC39" d="M13.7,11.5c0-0.2,0-0.3-0.1-0.4C13.5,11,13.4,11,13.3,11c-0.1,0-0.1,0-0.2,0.1c-0.1,0-0.1,0.1-0.2,0.2
			c0,0.1-0.1,0.2-0.1,0.3c0,0.2,0,0.3,0.1,0.4c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2
			C13.7,11.8,13.7,11.7,13.7,11.5z M13.5,11.9c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.4
			c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0.1-0.2c0,0,0.1-0.1,0.1-0.1c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3
			C13.6,11.7,13.5,11.8,13.5,11.9z"/>
		<path fill="#A3CC39" d="M14.7,12C14.7,12,14.7,12,14.7,12c0,0-0.1,0-0.1,0v0H15v0c-0.1,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1
			V11h0l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.6C14.7,12,14.7,12,14.7,12z"/>
		<path fill="#A3CC39" d="M16,11.1L16,11.1C16,11.1,16.1,11.1,16,11.1c0.1,0,0.1,0,0.1,0c0,0,0,0,0,0v0c0-0.1,0-0.1,0.1-0.2L16,11.1
			z"/>
		<path fill="#A3CC39" d="M7.4,13.3c0.1,0.1,0.1,0.2,0.2,0.2c0,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2S8,13.1,8,13
			c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0c0,0,0,0,0,0c-0.1,0.2-0.1,0.4-0.1,0.7C7.3,13.3,7.4,13.3,7.4,13.3
			z M7.5,12.7c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4
			c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3C7.4,12.9,7.4,12.8,7.5,12.7z"/>
		<path fill="#A3CC39" d="M9.4,13c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0.1c-0.1,0-0.1,0.1-0.1,0.2
			c0,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.3,0.1,0.4c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1s0.1-0.1,0.1-0.2
			C9.4,13.2,9.4,13.1,9.4,13z M9.2,13.3c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3
			c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1c0,0.1,0,0.2,0,0.3
			C9.2,13.1,9.2,13.2,9.2,13.3z"/>
		<path fill="#A3CC39" d="M10.3,12.6C10.3,12.5,10.4,12.5,10.3,12.6c0.1,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.6
			c0,0.1,0,0.1,0,0.1c0,0,0,0,0,0c0,0,0,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1v-0.9h0L10.3,12.6L10.3,12.6z"
			/>
		<path fill="#A3CC39" d="M11.7,13.4c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3
			c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.1-0.1-0.2-0.1c-0.1,0-0.1,0-0.2,0.1c-0.1,0-0.1,0.1-0.2,0.2c0,0.1-0.1,0.2-0.1,0.3
			C11.6,13.1,11.6,13.3,11.7,13.4z M11.7,12.7c0-0.1,0-0.2,0.1-0.2c0,0,0.1-0.1,0.1-0.1c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.4
			C11.7,12.9,11.7,12.8,11.7,12.7z"/>
		<path fill="#A3CC39" d="M13.3,13.5C13.3,13.5,13.3,13.5,13.3,13.5c0,0-0.1,0-0.1,0v0h0.4v0c-0.1,0-0.1,0-0.1,0c0,0,0,0,0,0
			c0,0,0-0.1,0-0.1v-1h0l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0s0,0,0,0c0,0,0,0.1,0,0.2v0.6C13.3,13.4,13.3,13.5,13.3,13.5z"/>
		<path fill="#A3CC39" d="M14.8,12.4c-0.1,0-0.1,0-0.2,0.1c-0.1,0-0.1,0.1-0.2,0.2c0,0.1-0.1,0.2-0.1,0.3c0,0.2,0,0.3,0.1,0.4
			c0,0.1,0.1,0.1,0.1,0.2c0,0,0,0,0.1-0.1c0,0,0,0,0-0.1c0-0.1-0.1-0.2-0.1-0.4c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0.1-0.2
			C14.7,12.4,14.8,12.4,14.8,12.4C14.8,12.4,14.9,12.4,14.8,12.4c0.1,0.1,0.2,0.2,0.2,0.2c0,0.1,0,0.2,0,0.3c0,0.1,0,0.2,0,0.2
			c0.1-0.1,0.1-0.2,0.2-0.2c0-0.2,0-0.3-0.1-0.4C14.9,12.4,14.9,12.4,14.8,12.4z"/>
		<path fill="#A3CC39" d="M7.6,14.9c0,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3c0-0.2,0-0.3-0.1-0.4
			c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0.1-0.1,0.2c0,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.3,0.1,0.3
			C7.4,14.9,7.5,14.9,7.6,14.9z M7.5,14.2c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.3
			C7.4,14.4,7.4,14.3,7.5,14.2z"/>
		<path fill="#A3CC39" d="M9,14.9C9,14.9,9,14.9,9,14.9c0,0-0.1,0-0.1,0v0h0.4v0c0,0-0.1,0-0.1,0c0,0,0,0,0,0c0,0,0-0.1,0-0.1v-0.9
			h0L8.8,14l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0s0,0,0,0c0,0,0,0.1,0,0.2v0.6C9,14.8,9,14.9,9,14.9z"/>
		<path fill="#A3CC39" d="M10.4,14.9C10.4,14.9,10.4,14.9,10.4,14.9c0,0-0.1,0-0.1,0v0h0.4v0c-0.1,0-0.1,0-0.1,0c0,0,0,0,0,0
			c0,0,0-0.1,0-0.1v-0.9h0L10.3,14l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.6C10.4,14.8,10.4,14.9,10.4,14.9
			z"/>
		<path fill="#A3CC39" d="M11.6,14.8c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1c0.1,0,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3
			c0-0.2,0-0.3-0.1-0.4c-0.1-0.1-0.2-0.1-0.2-0.1c-0.1,0-0.1,0-0.2,0.1c-0.1,0-0.1,0.1-0.2,0.2c0,0.1-0.1,0.2-0.1,0.3
			C11.5,14.6,11.6,14.7,11.6,14.8z M11.7,14.1c0-0.1,0-0.2,0.1-0.2c0,0,0.1-0.1,0.1-0.1c0,0,0.1,0,0.1,0c0,0,0.1,0.1,0.1,0.1
			c0,0.1,0,0.2,0,0.3c0,0.2,0,0.3,0,0.4c0,0.1,0,0.1-0.1,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1-0.1c0-0.1-0.1-0.2-0.1-0.4
			C11.7,14.3,11.7,14.2,11.7,14.1z"/>
		<path fill="#A3CC39" d="M13.4,13.8l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.5
			c0.1,0,0.1-0.1,0.1-0.1L13.4,13.8L13.4,13.8z"/>
		<path fill="#A3CC39" d="M7.8,15.4c-0.1-0.1-0.1-0.1-0.2-0.1c0,0-0.1,0-0.1,0c-0.1,0-0.1,0.1-0.1,0.2c0,0.1,0,0.2,0,0.3
			c0,0,0,0,0.1,0c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0C7.7,15.4,7.8,15.5,7.8,15.4
			c0,0.2,0,0.3,0,0.4c0,0,0,0,0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0C7.9,15.7,7.9,15.5,7.8,15.4z"/>
		<path fill="#A3CC39" d="M9.3,15.4c-0.1-0.1-0.1-0.1-0.2-0.1c-0.1,0-0.1,0-0.1,0.1c-0.1,0-0.1,0.1-0.1,0.2c0,0.1-0.1,0.2-0.1,0.3
			c0,0,0,0,0,0.1c0,0,0.1,0,0.1,0l0,0c0,0,0,0,0-0.1c0-0.1,0-0.2,0-0.3c0-0.1,0-0.2,0.1-0.2c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0
			C9.2,15.4,9.2,15.5,9.3,15.4c0,0.2,0,0.3,0,0.4c0,0,0,0.1,0,0.1c0,0,0.1,0,0.1,0c0,0,0,0,0-0.1C9.4,15.7,9.4,15.5,9.3,15.4z"/>
		<path fill="#A3CC39" d="M10.5,15.3l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0.1,0,0.2v0.2c0,0,0.1,0,0.1,0
			L10.5,15.3L10.5,15.3L10.5,15.3z"/>
		<path fill="#A3CC39" d="M12,15.2l-0.3,0.1l0,0c0,0,0.1,0,0.1,0c0,0,0,0,0,0C11.9,15.4,11.9,15.3,12,15.2L12,15.2L12,15.2L12,15.2z
			"/>
	</g>
</g>
</svg>
`;

const WATERMARK = `
<svg x="0px" y="0px" width="14px" height="13px" viewBox="0 0 16 14" stroke="currentColor" fill="currentColor" stroke-width="0"><path class="chata-icon-svg-0" d="M15.1,13.5c0,0-0.5-0.3-0.5-1.7V9.6c0-1.9-1.1-3.7-2.9-4.4C11.5,5.1,11.3,5,11,5c-0.1-0.3-0.2-0.5-0.3-0.7l0,0
    C9.9,2.5,8.2,1.4,6.3,1.4c0,0,0,0-0.1,0C5,1.4,3.8,1.9,2.8,2.8C1.9,3.6,1.4,4.8,1.4,6.1c0,0.1,0,0.1,0,0.2v2.2
    c0,1.3-0.4,1.7-0.4,1.7h0l-1,0.7l1.2,0.1c0.8,0,1.7-0.2,2.3-0.7c0.2,0.2,0.5,0.3,0.8,0.4c0.2,0.1,0.5,0.2,0.8,0.2
    c0.1,0.2,0.1,0.5,0.2,0.7c0.8,1.7,2.5,2.8,4.4,2.8c0,0,0.1,0,0.1,0c1,0,2-0.3,2.7-0.7c0.7,0.5,1.6,0.8,2.4,0.7l1.1-0.1L15.1,13.5z
    M10.4,6.2c0,0.9-0.3,1.8-0.9,2.5C9.2,9,8.9,9.3,8.6,9.5C8.3,9.6,8.1,9.7,7.9,9.8C7.6,9.9,7.3,10,7.1,10c-0.3,0.1-0.6,0.1-0.8,0.1
    c-0.1,0-0.3,0-0.4,0c0,0-0.1,0-0.1,0c0,0,0-0.1,0-0.1c0-0.1,0-0.2,0-0.4c0-0.8,0.2-1.6,0.7-2.2C6.5,7.2,6.7,7,6.9,6.8
    C7,6.7,7.1,6.6,7.2,6.5c0.2-0.2,0.4-0.3,0.7-0.4C8.1,6,8.3,5.9,8.6,5.8C9,5.7,9.4,5.6,9.8,5.6c0.1,0,0.3,0,0.4,0c0,0,0.1,0,0.1,0
    C10.4,5.8,10.4,6,10.4,6.2z M3.8,9.3L3.5,9.1L3.2,9.3C2.9,9.7,2.4,9.9,2,10c0.1-0.4,0.2-0.8,0.2-1.5l0-2.2c0,0,0-0.1,0-0.1
    c0-1.1,0.5-2,1.2-2.8c0.7-0.7,1.7-1.1,2.7-1.1c0,0,0.1,0,0.1,0c1.6,0,3.1,0.9,3.8,2.3c0,0.1,0.1,0.2,0.1,0.3c-0.1,0-0.2,0-0.3,0
    c-0.5,0-1,0.1-1.5,0.2C8.1,5.1,7.8,5.2,7.5,5.4C7.2,5.5,6.9,5.7,6.7,5.9C6.6,6,6.4,6.1,6.3,6.2C6.1,6.4,5.9,6.7,5.7,6.9
    C5.2,7.7,4.9,8.6,4.9,9.6c0,0.1,0,0.2,0,0.3c-0.1,0-0.2-0.1-0.3-0.1C4.3,9.7,4,9.5,3.8,9.3z M12.8,12.7l-0.3-0.3l-0.3,0.3
    c-0.5,0.5-1.4,0.8-2.4,0.8c-1.6,0.1-3.1-0.9-3.8-2.3c0-0.1-0.1-0.2-0.1-0.3c0.1,0,0.2,0,0.3,0c0.3,0,0.7,0,1-0.1
    c0.3-0.1,0.6-0.1,0.9-0.3c0.3-0.1,0.6-0.3,0.8-0.4C9.4,9.9,9.7,9.6,10,9.2c0.7-0.8,1.1-1.9,1.1-3c0-0.1,0-0.3,0-0.4
    c0.1,0,0.2,0.1,0.3,0.1c1.5,0.6,2.4,2.1,2.4,3.7v2.2c0,0.7,0.1,1.2,0.3,1.6C13.6,13.3,13.2,13.1,12.8,12.7z"></path>
</svg>
`;

const VOICE_RECORD_ICON = `
PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgd2lkdGg9IjU0NC4ycHgiIGhlaWdodD0iNTQ0LjJweCIgdmlld0JveD0iMCAwIDU0NC4yIDU0NC4yIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1NDQuMiA1NDQuMiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGNsYXNzPSJtaWMtaWNvbiIgZmlsbD0iI0ZGRkZGRiIgZD0iTTQzOS41LDIwOS4zYy01LjcsMC0xMC42LDIuMS0xNC43LDYuMmMtNC4xLDQuMS02LjIsOS4xLTYuMiwxNC43djQxLjljMCw0MC4zLTE0LjMsNzQuOC00MywxMDMuNQoJYy0yOC43LDI4LjctNjMuMiw0My0xMDMuNSw0M2MtNDAuMywwLTc0LjgtMTQuMy0xMDMuNS00M2MtMjguNy0yOC43LTQzLTYzLjItNDMtMTAzLjV2LTQxLjljMC01LjctMi4xLTEwLjYtNi4yLTE0LjcKCWMtNC4xLTQuMS05LjEtNi4yLTE0LjctNi4yYy01LjcsMC0xMC42LDIuMS0xNC43LDYuMmMtNC4xLDQuMS02LjIsOS4xLTYuMiwxNC43djQxLjljMCw0OC4yLDE2LjEsOTAuMSw0OC4yLDEyNS43CgljMzIuMiwzNS43LDcxLjksNTYuMSwxMTkuMiw2MS4zdjQzLjJoLTgzLjdjLTUuNywwLTEwLjYsMi4xLTE0LjcsNi4yYy00LjEsNC4xLTYuMiw5LTYuMiwxNC43YzAsNS43LDIuMSwxMC42LDYuMiwxNC43CgljNC4xLDQuMSw5LDYuMiwxNC43LDYuMmgyMDkuM2M1LjcsMCwxMC42LTIuMSwxNC43LTYuMmM0LjEtNC4xLDYuMi05LjEsNi4yLTE0LjdjMC01LjctMi4xLTEwLjYtNi4yLTE0LjcKCWMtNC4xLTQuMS05LjEtNi4yLTE0LjctNi4ySDI5M3YtNDMuMmM0Ny4zLTUuMiw4Ny0yNS43LDExOS4yLTYxLjNjMzIuMi0zNS42LDQ4LjItNzcuNiw0OC4yLTEyNS43di00MS45YzAtNS43LTIuMS0xMC42LTYuMi0xNC43CglDNDUwLjEsMjExLjQsNDQ1LjIsMjA5LjMsNDM5LjUsMjA5LjN6Ii8+CjxwYXRoIGNsYXNzPSJtaWMtaWNvbiIgZmlsbD0iI0ZGRkZGRiIgZD0iTTIyMi44LDIwMy43aC01NS4zdjM4LjRoNTUuM2M4LjUsMCwxNS4zLDYuOCwxNS4zLDE1LjNzLTYuOCwxNS4zLTE1LjMsMTUuM2gtNTUuMwoJYzAuMiwyOC41LDEwLjQsNTIuOSwzMC43LDczLjNjMjAuNSwyMC41LDQ1LjEsMzAuNyw3My45LDMwLjdjMjguOCwwLDUzLjQtMTAuMiw3My45LTMwLjdjMjAuMy0yMC4zLDMwLjYtNDQuOCwzMC43LTczLjNoLTUzLjQKCWMtOC41LDAtMTUuMy02LjgtMTUuMy0xNS4zczYuOC0xNS4zLDE1LjMtMTUuM2g1My40di0zOC40aC01My40Yy04LjUsMC0xNS4zLTYuOC0xNS4zLTE1LjNzNi44LTE1LjMsMTUuMy0xNS4zaDUzLjR2LTQwLjhoLTUzLjQKCWMtOC41LDAtMTUuMy02LjgtMTUuMy0xNS4zczYuOC0xNS4zLDE1LjMtMTUuM2g1My4zYy0wLjctMjcuNS0xMC44LTUxLjItMzAuNi03MUMzMjUuNSwxMC4yLDMwMC45LDAsMjcyLjEsMAoJYy0yOC44LDAtNTMuNCwxMC4yLTczLjksMzAuN2MtMTkuOCwxOS44LTI5LjksNDMuNS0zMC42LDcxaDU1LjJjOC41LDAsMTUuMyw2LjgsMTUuMywxNS4zcy02LjgsMTUuMy0xNS4zLDE1LjNoLTU1LjN2NDAuOGg1NS4zCgljOC41LDAsMTUuMyw2LjgsMTUuMywxNS4zUzIzMS4yLDIwMy43LDIyMi44LDIwMy43eiIvPgo8L3N2Zz4=
`;

const RUN_QUERY = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="chata-execute-query-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
    </path>
</svg>
`;

const DELETE_ICON = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="chata-safety-net-delete-button" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M331.3 308.7L278.6 256l52.7-52.7c6.2-6.2 6.2-16.4 0-22.6-6.2-6.2-16.4-6.2-22.6 0L256 233.4l-52.7-52.7c-6.2-6.2-15.6-7.1-22.6 0-7.1 7.1-6 16.6 0 22.6l52.7 52.7-52.7 52.7c-6.7 6.7-6.4 16.3 0 22.6 6.4 6.4 16.4 6.2 22.6 0l52.7-52.7 52.7 52.7c6.2 6.2 16.4 6.2 22.6 0 6.3-6.2 6.3-16.4 0-22.6z">
    </path>
    <path d="M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z">
    </path>
</svg>
`

const CLEAR_ALL = `
<svg class="clear-all" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path class="clear-all" d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41
        0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0
        16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12
        12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z">
    </path>
</svg>
`

const INFO_ICON = `
<svg fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" class="interpretation-icon">
    <path class="" d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z">
    </path>
</svg>
`;

const FILTER_TABLE = `
<svg class="filter-table" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path class="filter-table" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
</svg>
`

const PIE_CHART_ICON = `
<svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" class="pie_chart">
    <path class="chart-icon-svg-0 pie_chart" d="M12.6,8.5H7.4V3.3c0-0.4-0.3-0.7-0.7-0.7c-0.9,0-1.8,0.2-2.6,0.5C3.3,3.5,2.6,3.9,2,4.6 C1.3,5.2,0.9,5.9,0.5,6.7C0.2,7.5,0,8.4,0,9.3c0,0.9,0.2,1.8,0.5,2.6C0.9,12.7,1.3,13.4,2,14c0.6,0.6,1.3,1.1,2.1,1.4 C4.9,15.8,5.8,16,6.7,16c0.9,0,1.8-0.2,2.6-0.5c0.8-0.3,1.5-0.8,2.1-1.4c0.6-0.6,1.1-1.3,1.4-2.1c0.3-0.8,0.5-1.7,0.5-2.6 C13.4,8.9,13,8.5,12.6,8.5z M6.7,10h5.2c-0.2,1.1-0.7,2.1-1.5,3c-1,1-2.3,1.5-3.7,1.5C5.3,14.5,4,14,3,13c-1-1-1.5-2.3-1.5-3.7 C1.5,7.9,2,6.6,3,5.6c0.8-0.8,1.8-1.3,3-1.5v5.2C6,9.7,6.3,10,6.7,10z">
    </path>
    <path class="chart-icon-svg-0 pie_chart" d="M15.5,4.1C15.1,3.3,14.7,2.6,14,2c-0.6-0.6-1.3-1.1-2.1-1.4C11.1,0.2,10.2,0,9.3,0C8.9,0,8.6,0.3,8.6,0.7v6 c0,0.4,0.3,0.7,0.7,0.7h6c0.4,0,0.7-0.3,0.7-0.7C16,5.8,15.8,4.9,15.5,4.1z M10,6V1.5c1.1,0.2,2.2,0.7,3,1.5c0.8,0.8,1.3,1.8,1.5,3 H10z">
    </path>
</svg>
`;

const TILE_RUN_QUERY = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
</svg>
`;

const DASHBOARD_DELETE_ICON = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
</svg>
`;

const DATA_MESSENGER = `
<svg x="0px" y="0px" width="23.7px" height="23.7px" viewBox="0 0 23.7 23.7">
    <path class="chata-icon-svg-0" d="M22.2,19.8L22.2,19.8c0,0-0.7-0.5-0.7-2.4v-3.2c0-2.9-1.7-5.5-4.2-6.4c-0.3-0.1-0.6-0.3-1-0.3 c-0.1-0.4-0.3-0.7-0.4-0.9C14.7,4,12.2,2.3,9.4,2.3H9.3c-1.7,0-3.5,0.7-5,2C3,5.6,2.2,7.3,2.2,9.2v3.5c0,1.8-0.5,2.3-0.5,2.3L0,16.2 l2.1,0.2c1.3,0,2.5-0.4,3.3-1c0.3,0.3,0.7,0.4,1.1,0.5c0.2,0.1,0.6,0.3,1.1,0.3c0,0.1,0.1,0.3,0.1,0.4c0,0.2,0.1,0.4,0.2,0.5 c1.2,2.5,3.7,4.1,6.4,4.1h0.1c1.3,0,2.8-0.4,3.9-1c0.9,0.7,2,1,3,1c0.2,0,0.3,0,0.5,0l1.9-0.2L22.2,19.8z M9.3,16.3 c1.3,0,2.7-0.4,4-1.1c2-1.2,3.2-3.4,3.2-5.8V9c0,0,0,0,0,0c0.1,0,0.2,0.1,0.2,0.1c2,0.8,3.4,2.9,3.4,5.2v3.2c0,0.9,0.1,1.6,0.3,2.1 c-0.6-0.2-1.1-0.4-1.6-0.9l-0.5-0.5l-0.5,0.5c-0.7,0.7-2,1.1-3.4,1.1c-2.2,0.1-4.3-1.2-5.3-3.2c0-0.1,0-0.2-0.1-0.2c0,0,0,0,0,0H9.3 z M8.8,14.3c0-1.2,0.4-2.3,1.1-3.4c0.1-0.2,0.3-0.5,0.5-0.7c0.9-0.9,2.5-1.5,4-1.5h0.6c0.1,0.2,0.1,0.5,0.1,0.7 c0,1.5-0.7,3.1-1.9,4.1c-1.1,0.9-2.5,1.4-4.4,1.4h0V14.3z M7.3,14.5c-0.1,0-0.2-0.1-0.3-0.1c-0.1,0-0.1,0-0.1,0 c-0.3-0.1-0.6-0.4-0.9-0.6l0,0c-0.1-0.1-0.3-0.2-0.4-0.3c-0.1-0.1-0.3,0-0.9,0.6c-0.1,0.1-0.2,0.2-0.2,0.2c-0.3,0.2-0.6,0.3-1,0.4 c0.1-0.5,0.2-1.1,0.2-2V9.4c0-1.4,0.5-2.6,1.7-3.9c1-1,2.4-1.5,3.8-1.5h0.1c2.3,0,4.4,1.3,5.4,3.3c0.1,0.2,0.1,0.3,0.1,0.3 c0,0-0.1,0-0.1,0C12.8,7.3,11.1,7.9,9.7,9c-1.5,1.3-2.4,3.2-2.4,5.3V14.5z M7.4,14.7C7.4,14.7,7.4,14.7,7.4,14.7L7.4,14.7L7.4,14.7z ">
    </path>
</svg>
`;

const QUERY_TIPS = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" size="22" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path>
</svg>
`;

const SEARCH_ICON = `
<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="color: rgb(153, 153, 153); width: 19px; height: 20px;">
    <path d="M443.5 420.2L336.7 312.4c20.9-26.2 33.5-59.4 33.5-95.5 0-84.5-68.5-153-153.1-153S64 132.5 64 217s68.5 153 153.1 153c36.6 0 70.1-12.8 96.5-34.2l106.1 107.1c3.2 3.4 7.6 5.1 11.9 5.1 4.1 0 8.2-1.5 11.3-4.5 6.6-6.3 6.8-16.7.6-23.3zm-226.4-83.1c-32.1 0-62.3-12.5-85-35.2-22.7-22.7-35.2-52.9-35.2-84.9 0-32.1 12.5-62.3 35.2-84.9 22.7-22.7 52.9-35.2 85-35.2s62.3 12.5 85 35.2c22.7 22.7 35.2 52.9 35.2 84.9 0 32.1-12.5 62.3-35.2 84.9-22.7 22.7-52.9 35.2-85 35.2z">
    </path>
</svg>
`;

const COLUMN_EDITOR = `
<svg class="show-hide-columns" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path class="show-hide-columns" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z">
    </path>
</svg>
`

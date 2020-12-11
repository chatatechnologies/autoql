const concat = require('gulp-concat');
const order = require('gulp-order');
const minify = require('gulp-minify');
const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');

gulp.task('scripts', function() {
    return gulp.src(['./src/*.js'])
        .pipe(order([
            "src/popper.min.js",
            "src/tippy.min.js",
            "src/muuri.min.js",
            "src/moment.js",
            "src/Tabulator.min.js",
            "src/d3.v4.js",
            "src/d3-legend.js",
            "src/svgIcons.js",
            "src/constants.js",
            "src/utils.js",
            "src/Cascader.js",
            "src/ChataChartHelpers.js",
            "src/Safetynet.js",
            "src/ChataTable.js",
            "src/ChataHeatmapChart.js",
            "src/ChataBubbleChart.js",
            "src/ChataBarChart.js",
            "src/ChataColumnChart.js",
            "src/ChataLineChart.js",
            "src/ChataStackedColumnChart.js",
            "src/ChataStackedBarChart.js",
            "src/ChataAreaChart.js",
            "src/ChataGroupedColumnChart.js",
            "src/ChataGroupedLineChart.js",
            "src/ChataGroupedBarChart.js",
            "src/ChataPieChart.js",
            "src/QueryOutput.js",
            "src/QueryInput.js",
            "src/ChataUtils.js",
            "src/DataMessenger.js",
            "src/Modal.js",
            "src/Tile.js",
            "src/Dashboard.js",
            "src/NotificationList.js",
            "src/Notification.js",
            "src/NotificationSettingsModal.js",
            "src/Settings.js",
            "src/SettingsItem.js",
            "src/split.min.js",
            "src/PopoverChartSelector.js",
            "src/AntdMessage.js"
        ], { base: './' }))
        .pipe(concat('autoql.js'))
        .pipe(minify())
        .pipe(gulp.dest('./build'));
});


gulp.task('css', () => {
  return gulp.src(['./css/*.css'])
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(minify())
    .pipe(concat('autoql-styles.css'))
    .pipe(gulp.dest('./build'));
});

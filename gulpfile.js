const concat = require('gulp-concat');
const order = require('gulp-order');
const minify = require('gulp-minify');
const umd = require('gulp-umd');
const gulp = require('gulp');
gulp.task('scripts', function() {
    return gulp.src(['./src/*.js'])
        .pipe(order([
            "src/d3.v4.js",
            "src/d3.tip.js",
            "src/svgIcons.js",
            "src/constants.js",
            "src/utils.js",
            "src/Safetynet.js",
            "src/ChataTable.js",
            "src/ChataHeatmapChart.js",
            "src/ChataBubbleChart.js",
            "src/ChataBarChart.js",
            "src/ChataColumnChart.js",
            "src/ChataLineChart.js",
            "src/ChataStackedColumnChart.js",
            "src/ChataStackedBarChart.js",
            "src/ResponseRenderer.js",
            "src/ChatBar.js",
            "src/ChatDrawer.js",
        ], { base: './' }))
        .pipe(concat('ChatDrawer.js'))
        .pipe(minify())
        .pipe(umd({
            exports: function(file) {
                return 'ChatDrawer';
            },
            namespace: function(file) {
                return 'ChatDrawer';
            }
        }))
        .pipe(gulp.dest('./build'));
});

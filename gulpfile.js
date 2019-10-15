const concat = require('gulp-concat');
const order = require('gulp-order');
const minify = require('gulp-minify');
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
            "src/ResponseRenderer.js",
            "src/ChatBar.js",
            "src/ChatDrawer.js",
        ], { base: './' }))
        .pipe(concat('chata-widget.js'))
        .pipe(minify())
        .pipe(gulp.dest('./build'));
});

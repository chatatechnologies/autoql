import { select } from 'd3-selection'
import { max } from 'd3-array'
import {
    formatLabel,
    getGroupableFields,
    formatDataToHeatmap
} from './ChataChartHelpers'
import {
    SCALE_BAND,
    SCALE_LINEAR,
    getAxisBottom,
    getAxisLeft,
    setDomainRange,
    getBandWidth,
} from './d3-compatibility'
import {
    formatColumnName,
    formatData,
    formatLabels,
    getNotGroupableField,
} from '../Utils'
import { tooltipCharts } from '../Tooltips'
import { ChataUtils } from '../ChataUtils'

export function createHeatmap(
    component, json, options, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){

    var margin = {top: 5, right: 10, bottom: 50, left: 130},
    width = component.parentElement.clientWidth - margin.left;

    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);
    var groupableIndex1 = groupables[1].indexCol;
    var groupableIndex2 = groupables[0].indexCol;
    var notGroupableIndex = notGroupableField.indexCol;

    var data = formatDataToHeatmap(json, options);
    var labelsX = ChataUtils.getUniqueValues(data, row => row.unformatX)
    var labelsY = ChataUtils.getUniqueValues(data, row => row.unformatY).sort()

    var cols = json['data']['columns'];

    labelsY = formatLabels(
        labelsY, cols[groupableIndex1], options
    ).reverse()
    labelsX = formatLabels(
        labelsX, cols[groupableIndex2], options
    );

    var height;
    var colStr1 = cols[groupableIndex1]['display_name'] || cols[groupableIndex1]['name'];
    var colStr2 = cols[groupableIndex2]['display_name'] || cols[groupableIndex2]['name'];
    var colStr3 = cols[notGroupableIndex]['display_name'] || cols[notGroupableIndex]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    var col3 = formatColumnName(colStr3);
    if(fromChataUtils){
        if(options.placement == 'left' || options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - (margin.top + margin.bottom + 3);
            if(height < 250){
                height = 300;
            }
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight - (margin.bottom + margin.top);
    }
    component.innerHTML = '';
    component.innerHTML = '';
    if(component.headerElement){
        component.parentElement.parentElement.removeChild(
            component.headerElement
        );
        component.headerElement = null;
    }
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('autoql-vanilla-chata-chart-container');
    component.parentElement.parentElement.classList.add(
        'chata-hidden-scrollbox'
    );

    var svg = select(component)
    .append("svg")
    .attr("width", width + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


    const barWidth = width / labelsX.length;
    const barHeight = height / labelsY.length;

    const intervalWidth = Math.ceil((labelsX.length * 16) / width);
    const intervalHeight = Math.ceil((labelsY.length * 16) / height);

    var xTickValues = [];
    var yTickValues = [];
    if (barWidth < 16) {
        labelsX.forEach((element, index) => {
            if (index % intervalWidth === 0) {
                xTickValues.push(element);
            }
        });
    }

    if(barHeight < 16){
        labelsY.forEach((element, index) => {
            if (index % intervalHeight === 0) {
                yTickValues.push(element);
            }
        });
    }

    svg.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.left + margin.right)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    .text(col1);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
    .text(col2);


    var x = SCALE_BAND();
    // chataD3.scaleBand()
    setDomainRange(
        x,
        labelsX.map(function(d) {
            return d
        }),
        0,
        width,
        false,
        0.01
    )
    var xAxis = getAxisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }

    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(d)
        }))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(d);
        }))
        .selectAll("text")
        .style("text-anchor", "center");
    }


    var y = SCALE_BAND();
    setDomainRange(
        y,
        labelsY.map(function(d) {
            return d
        }),
        0,
        height - margin.bottom,
        false,
        0.01
    )

    var yAxis = getAxisLeft(y);

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    svg.append("g")
    .call(yAxis.tickFormat(function(d){
        return formatLabel(d);
    }));

    var colorScale = SCALE_LINEAR()
    .range([0, 1])
    .domain([0, max(data, function(d) { return d.value; })]);


    svg.selectAll()
    .data(data, function(d) {
        var xLabel = '';
        var yLabel = '';

        xLabel = d.labelX;
        yLabel = d.labelY;
        return xLabel+':'+yLabel;
    })
    .enter()
    .append("rect")
    .each(function (d, i) {
        select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-col3', col3)
        .attr('data-colvalue1', d.labelY)
        .attr('data-colvalue2', d.labelX)
        .attr('data-colvalue3', formatData(
            d.value, cols[notGroupableIndex],
            options
        ))
    })
    .attr("x", function(d) {
        return x(d.labelX);

    })
    .attr("y", function(d) {
        return y(d.labelY);
    })
    .attr("width", getBandWidth(x))
    .attr("height", getBandWidth(y))
    .attr("fill", options.themeConfig.chartColors[0])
    .attr('opacity', function(d) { return colorScale(Math.abs(d.value))})
    .attr('class', 'tooltip-3d square')

    tooltipCharts();

    select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createHeatmap(
                component,
                json,
                options,
                fromChataUtils,
                valueClass,
                renderTooltips
            )
        }
    );
}

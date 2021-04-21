import { select } from 'd3-selection'
import { ChataChartListPopover } from './ChataChartListPopover'
import { ChataChartSeriesPopover } from './ChataChartSeriesPopover'
import { MultiSeriesSelector } from './MultiSeriesSelector'
import {
    enumerateCols,
    getIndexesByType,
    getMetadataElement,
    makeGroups,
    getMinAndMaxValues,
    formatLabel,
    getVisibleSeries,
    toggleSerie
} from './ChataChartHelpers'
import {
    SCALE_BAND,
    SCALE_LINEAR,
    getAxisBottom,
    getAxisLeft,
    setDomainRange,
    getBandWidth,
    getColorScale,
    getLegend
} from './d3-compatibility'
import {
    formatColumnName,
    getStringWidth,
    formatData,
    formatChartData,
    closeAllChartPopovers,
    getFirstDateCol,
    getGroupableCount
} from '../Utils'
import { tooltipCharts } from '../Tooltips'

export function createColumnChart(
    component, json, options, onUpdate=()=>{}, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){
    var margin = {
        top: 15,
        right: 10,
        bottom: 60,
        left: 90,
        marginLabel: 50,
        bottomChart: 50
    },
    width = component.parentElement.clientWidth - margin.left;
    var height;

    var cols = enumerateCols(json);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];
    let chartWidth;
    var legendOrientation = 'horizontal';
    var shapePadding = 100;
    let groupableCount = getGroupableCount(json)
    let tooltipClass = groupableCount === 2 ? 'tooltip-3d' : 'tooltip-2d'
    const legendBoxMargin = 15;

    if(indexList['STRING']){
        xIndexes.push(...indexList['STRING'])
    }

    if(indexList['DATE']){
        xIndexes.push(...indexList['DATE'])
    }

    if(indexList['DATE_STRING']){
        xIndexes.push(...indexList['DATE_STRING'])
    }

    if(indexList['DOLLAR_AMT']){
        yIndexes = indexList['DOLLAR_AMT'];
    }else if(indexList['QUANTITY']){
        yIndexes = indexList['QUANTITY'];
    }

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata){
        var dateCol = getFirstDateCol(cols)
        let i = dateCol !== -1 ? dateCol : xIndexes[0].index
        metadataComponent.metadata = {
            groupBy: {
                index: i,
                currentLi: 0,
            },
            series: yIndexes
        }
    }

    var xAxisIndex = metadataComponent.metadata.groupBy.index;
    var activeSeries = metadataComponent.metadata.series;
    var data = makeGroups(json, options, activeSeries, cols[xAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);
    var index1 = activeSeries[0].index;
    var index2 = cols[xAxisIndex].index;

    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];

    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    const barWidth = width / data.length;
    const rotateLabels = barWidth < 135;
    const interval = Math.ceil((data.length * 16) / width);
    var xTickValues = [];
    var allLengths = [];
    if (barWidth < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                xTickValues.push(element.label);
            }
        });
    }
    xTickValues.sort();
    var labelsNames = data.map(function(d) { return d.label; });
    var groupNames = data[0].values.map(function(d) { return d.group; });
    var hasLegend = groupNames.length > 1;


    if(hasLegend && groupNames.length < 3){
        margin.bottom = 70;
        margin.marginLabel = 10;
    }

    if(groupNames.length < 3){
        chartWidth = width;
    }else{
        chartWidth = width - 135;
        legendOrientation = 'vertical';
        shapePadding = 5;
    }

    data.forEach((item) => {
        allLengths.push(formatLabel(item.label).length);
    });

    let longestString = 0;
    var extraMargin = hasLegend ? 15 : 0;
    var increment = 5;
    longestString = Math.max.apply(null, allLengths);
    if(longestString <= 4)longestString = 5;
    if(!hasLegend)increment = 3;

    if(legendOrientation == 'horizontal'){
        if(rotateLabels){
            let m = longestString * increment + extraMargin;
            if(hasLegend && m <= 50) m = 55;
            margin.bottomChart = m;
        }else{
            margin.bottomChart = 13 + extraMargin;
        }

    }else{
        if(rotateLabels){
            let m = longestString * 3;
            margin.bottomChart = m + 9;
        }else{
            margin.bottomChart = 13;
        }

    }

    if(fromChataUtils){
        if(options.placement == 'left' || options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight
            - (margin.top + margin.bottom + 3);
            if(height < 250){
                height = 300;
            }
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight
        - (margin.bottom + margin.top);
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
    component.parentElement.classList.add(
        'autoql-vanilla-chata-chart-container'
    );
    component.parentElement.parentElement.classList.add(
        'chata-hidden-scrollbox'
    );

    var x0 = SCALE_BAND()
    var x1 = SCALE_BAND();
    var y = SCALE_LINEAR();

    setDomainRange(x0, labelsNames, 0, chartWidth, false, .1)
    var x1Range = minMaxValues.max === 0 ? 0 : getBandWidth(x0)

    setDomainRange(x1, groupNames, 0, x1Range, false, .1)

    y
    .range([ height - (margin.bottomChart), 0 ])
    .domain([minMaxValues.min, minMaxValues.max]).nice()

    var xAxis = getAxisBottom(x0)
    var yAxis = getAxisLeft(y)


    var colorScale = getColorScale(
        groupNames,
        options.themeConfig.chartColors
    );

    var svg = select(component)
    .append("svg")
    .attr("width", width + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")

    var labelXContainer = svg.append('g');
    var labelYContainer = svg.append('g');

    // Y AXIS
    var textContainerY = labelYContainer.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.left + margin.right + 5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')

    textContainerY.append('tspan')
    .text(col2)

    if(yIndexes.length > 1 && options.enableDynamicCharting){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
        labelYContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;

        labelYContainer.append('rect')
        .attr('x', 66)
        .attr('y', -(height/2 + (xWidthRect/2) + (paddingRect/2)))
        .attr('height', xWidthRect + paddingRect)
        .attr('width', 24)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('transform', 'rotate(-180)')
        .attr('class', 'autoql-vanilla-y-axis-label-border')

        labelYContainer.on('mouseup', () => {
            closeAllChartPopovers();
            new ChataChartSeriesPopover({
                left: event.clientX,
                top: event.clientY
            }, cols, activeSeries, (evt, popover, _activeSeries) => {
                metadataComponent.metadata.series = _activeSeries;
                createColumnChart(
                    component,
                    json,
                    options,
                    onUpdate,
                    fromChataUtils,
                    valueClass,
                    renderTooltips
                )
                popover.close();
            });
        })
    }


    // X AXIS
    var textContainerX = labelXContainer.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.marginLabel - 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

    textContainerX.append('tspan')
    .text(col1);

    if(xIndexes.length > 1 && options.enableDynamicCharting){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')

        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col1) + paddingRect;
        var _y = 0;
        const _x = (chartWidth / 2) - (xWidthRect/2) - (paddingRect/2);
        if(hasLegend && groupNames.length < 3){
            _y = height - (margin.marginLabel/2) - 3;
        }else{
            _y = height + (margin.marginLabel/2) + 6;
        }
        labelXContainer.append('rect')
        .attr('x', _x)
        .attr('y', _y)
        .attr('height', 24)
        .attr('width', xWidthRect + paddingRect)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('class', 'autoql-vanilla-x-axis-label-border')

        labelXContainer.on('mouseup', () => {
            closeAllChartPopovers();
            const selectedItem = metadataComponent.metadata.groupBy.currentLi;
            var popoverSelector = new ChataChartListPopover({
                left: event.clientX,
                top: event.clientY
            }, xIndexes, (evt, popover) => {
                var xAxisIndex = evt.target.dataset.popoverIndex;
                var currentLi = evt.target.dataset.popoverPosition;
                metadataComponent.metadata.groupBy.index = xAxisIndex;
                metadataComponent.metadata.groupBy.currentLi = currentLi;
                createColumnChart(
                    component,
                    json,
                    options,
                    onUpdate,
                    fromChataUtils,
                    valueClass,
                    renderTooltips
                )
                popover.close();
            }, true);

            popoverSelector.setSelectedItem(selectedItem)
        })
    }

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }

    if(rotateLabels){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            let fLabel = formatChartData(d, cols[index2], options);
            if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
            return formatLabel(fLabel);
        }))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            let fLabel = formatChartData(d, cols[index2], options);
            if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
            return formatLabel(fLabel);
        }))
        .selectAll("text")
        .style("text-anchor", "center")
    }

    svg.append("g")
    .attr("class", "grid")
    .call(
        yAxis
        .tickSize(-chartWidth)
        .tickFormat(function(d){
            return formatChartData(d, cols[index1], options)}
        )
    )

    const calculateHeight = (d) => {
        if(minMaxValues.min < 0){
            return Math.abs(y(d.value) - y(0));
        }else{
            return (height - margin.bottomChart) - y(d.value);
        }
    }

    var slice = undefined;
    function createBars(){
        var rectIndex = 0;
        var cloneData = getVisibleSeries(data);
        if(slice)slice.remove();
        slice = svg.selectAll(".slice")
        .remove()
        .data(cloneData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) {
            return "translate(" + x0(d.label) + ",0)";
        });

        slice.selectAll("rect")
        .data(function(d) {
            for (var i = 0; i < d.values.length; i++) {
                d.values[i].label = d.label;
            }
            return d.values;
        })
        .enter().append("rect")
        .each(function (d) {

            if(groupableCount === 2){
                let index3 = index2 === 0 ? 1 : 0
                let colStr3 = cols[index3]['display_name']
                || cols[index1]['name']
                let col3 = formatColumnName(colStr3);
                toolTipColValue1 = formatData(
                    d.label, cols[index2],
                    options
                )
                let unformatvalue1 = undefined
                let unformatvalue2 = undefined
                let unformatvalue3 = undefined

                if(index3 === 0){
                    unformatvalue1 = d.group
                    unformatvalue2 = d.label
                }else{
                    unformatvalue1 = d.label
                    unformatvalue2 = d.group
                }
                unformatvalue3 = d.value
                select(this).attr(valueClass, rectIndex)
                .attr('data-col1', col1)
                .attr('data-col2', col2)
                .attr('data-col3', col3)
                .attr('data-colvalue1', toolTipColValue1)
                .attr('data-colvalue2',formatData(
                    d.value, cols[index1],
                    options
                ))
                .attr('data-colvalue3', formatData(
                    d.group, cols[index3],
                    options
                ))
                .attr('data-unformatvalue1', unformatvalue1)
                .attr('data-unformatvalue2', unformatvalue2)
                .attr('data-unformatvalue3', unformatvalue3)
                .attr('data-is-stacked-drill', '1')
            }else{
                var group = col2;
                if(groupNames.length > 1)group = d.group
                var toolTipColValue1 = d.label
                toolTipColValue1 = formatData(
                    d.label, cols[index2],
                    options
                )
                if(toolTipColValue1 === 'Invalid date')
                toolTipColValue1 = 'undefined'

                select(this).attr(valueClass, rectIndex)
                .attr('data-col1', col1)
                .attr('data-col2', group)
                .attr('data-colvalue1', toolTipColValue1)
                .attr('data-colvalue2', formatData(
                    d.value, cols[index1],
                    options
                ))
                .attr('data-filterindex', index2)
            }
            rectIndex++
        })
        .attr("width", getBandWidth(x1))
        .attr("x", function(d) { return x1(d.group); })
        .style("fill", function(d) { return colorScale(d.group) })
        .attr('fill-opacity', '0.7')
        .attr('class', `${tooltipClass} bar`)
        .attr("y", function(d) { return y(Math.max(0, d.value)); })
        .attr("height", function(d) { return calculateHeight(d) })

        onUpdate(component);
        tooltipCharts();
    }

    if(hasLegend){
        if(groupableCount !== 2){
            let legendText = svg.append('text')
            .attr('x', chartWidth + 40)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .attr("class", "autoql-vanilla-x-axis-label")
            legendText.append('tspan')
            .text('Category');
        }else{
            new MultiSeriesSelector(svg, {
                x: (chartWidth + 15),
                y: 10,
                colName: col1
            })
        }

        var svgLegend = svg.append('g')
        .style('fill', 'currentColor')
        .style('fill-opacity', '0.7')
        .style('font-family', 'inherit')
        .style('font-size', '10px')

        const legendWrapLength = width / 2 - 50
        var legendOrdinal = getLegend(
            colorScale,
            legendWrapLength,
            legendOrientation
        );

        legendOrdinal.shapePadding(shapePadding);


        legendOrdinal.on('cellclick', function(d) {
            var words = []
            var nodes = d.currentTarget.getElementsByTagName('tspan')
            for (var i = 0; i < nodes.length; i++) {
                words.push(nodes[i].textContent)
            }
            data = toggleSerie(data, words.join(' '));

            createBars();
            const legendCell = select(this);
            legendCell.classed(
                'disable-group', !legendCell.classed('disable-group')
            );
        });
        svgLegend.call(legendOrdinal)

        if(legendOrientation === 'vertical'){
            const newX = chartWidth + legendBoxMargin
            svgLegend
              .attr('transform', `translate(${newX}, ${25})`)
        }else{

            let legendBBox
            const legendElement = svgLegend.node()
            if (legendElement) {
                legendBBox = legendElement.getBBox()
            }

            const legendWidth = legendBBox.width
            const legendXPosition = width / 2 - (legendWidth/2)
            const legendYPosition = height + 35
            svgLegend
            .attr(
                'transform',
                `translate(${legendXPosition}, ${legendYPosition})`
            )
        }
    }

    select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createColumnChart(
                component,
                json,
                options,
                onUpdate,
                fromChataUtils,
                valueClass,
                renderTooltips
            )
        }
    );

    createBars();
}

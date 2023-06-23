import { select } from 'd3-selection'
import { ChataChartListPopover } from './ChataChartListPopover'
import { ChataChartSeriesPopover } from './ChataChartSeriesPopover'
import {
    enumerateCols,
    getIndexesByType,
    getMetadataElement,
    makeGroups,
    getMinAndMaxValues,
    formatLabel,
    getVisibleSeries,
    groupBy,
    toggleSerie,
    styleLegendTitleNoBorder,
    styleLegendTitleWithBorder
} from './ChataChartHelpers'
import {
    SCALE_BAND,
    SCALE_LINEAR,
    getAxisBottom,
    getAxisLeft,
    setDomainRange,
    getBandWidth,
    getColorScale,
    getLegend,
    getLine
} from './d3-compatibility'
import {
    formatColumnName,
    getStringWidth,
    formatData,
    formatChartData,
    closeAllChartPopovers,
    getFirstDateCol,
    getGroupableCount,
    getChartLeftMargin,
    getChartColorVars
} from '../Utils'
import { tooltipCharts } from '../Tooltips'
import { strings } from '../Strings'

export function createLineChart(
    component, json, options, onUpdate=()=>{}, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){

    var margin = {
        top: 15,
        right: 10,
        bottom: 50,
        left: 90,
        marginLabel: 40,
        bottomChart: 0
    },
    width = component.parentElement.clientWidth - margin.left;
    var height;
    var cols = enumerateCols(json);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];
    let chartWidth = width;
    var legendOrientation = 'horizontal';
    var shapePadding = 100;
    let groupableCount = getGroupableCount(json)
    let tooltipClass = groupableCount === 2 ? 'tooltip-3d' : 'tooltip-2d'
    var { chartColors } = getChartColorVars();
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
    }else if(indexList['PERCENT']){
        yIndexes = indexList['PERCENT'];
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
    var legendGroups = {}
    var labelsNames = data.map(function(d) { return d.label; });
    var allGroup = data[0].values.map(function(d) { return d.group; });
    var groupable2Index = index2 === 0 ? 1 : 0
    allGroup.map(group => {
        legendGroups[
            formatChartData(group, cols[groupable2Index], options)
        ] = {
            value: group
        }
    })
    const hasLegend = false;

    // var hasLegend = allGroup.length > 1;
    // if(hasLegend && allGroup.length < 3){
    //     margin.bottom = 70;
    //     margin.marginLabel = 10;
    // }
    var allData = [];

    var colorScale = getColorScale(
        allGroup,
        chartColors
    );

    data.map(function(d) {
        d.values.map(function(v){
            v.label = d.label
            allData.push(v)
        })
    })
    var grouped = groupBy(allData, 'group');


    const barWidth = width / data.length;
    const interval = Math.ceil((data.length * 16) / width);
    const rotateLabels = barWidth < 135;

    var xTickValues = [];
    var allLengths = [];
    if (barWidth < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                xTickValues.push(element.label);
            }
        });
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

    // if(allGroup.length < 3){
    //     chartWidth = width;
    // }else{
    //     chartWidth = width - 135;
    //     legendOrientation = 'vertical';
    //     shapePadding = 5;
    // }

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

    const stringWidth = getChartLeftMargin(minMaxValues.max.toString())
    const labelSelectorPadding = stringWidth > 0 ? (margin.left + stringWidth / 2)
    : (margin.left - 15)
    const labelContainerPos = stringWidth > 0 ? (66 + stringWidth) : 66
    chartWidth -= stringWidth
    var svg = select(component)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + (margin.left+ stringWidth) + "," + margin.top + ")");

    var labelXContainer = svg.append('g');
    var labelYContainer = svg.append('g');

    // Y AXIS
    var textContainerY = labelYContainer.append('text')
    .attr('x', -(height / 2))
    .attr('y', -(labelSelectorPadding))
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
        .attr('x', labelContainerPos)
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
                createLineChart(
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
    .attr('y', height + margin.marginLabel + 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

    textContainerX.append('tspan')
    .text(col1);

    const onSelectorClick = (evt, showOnBaseline, legendEvent) => {
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
            if(legendEvent){
                let ind = xAxisIndex == 1 ? 0 : 1
                metadataComponent.metadata.groupBy.index = ind;
            }
            createLineChart(
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
    }

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
        if(hasLegend && allGroup.length < 3){
            _y = height - (margin.marginLabel/2) + 3;
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

        labelXContainer.on('mouseup', onSelectorClick)
    }


    var x = SCALE_BAND();
    setDomainRange(x, labelsNames, 0, chartWidth);

    var xAxis = getAxisBottom(x);
    const xShift = getBandWidth(x) / 2;

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

    var y = SCALE_LINEAR()
    .domain([minMaxValues.min, minMaxValues.max])
    .range([ height - margin.bottomChart, 0 ]).nice();
    var yAxis = getAxisLeft(y);

    svg.append("g")
    .attr("class", "autoql-vanilla-axes-grid")
    .call(yAxis.tickFormat(function(d){
        return formatChartData(d, cols[index1], options)}
    )
    .tickSize(-chartWidth)
    ).select(".domain").remove();

    let lines;
    let points;
    var line = getLine(
        (d) => { return x(d.label) + xShift },
        (d) => { return y(d.value)}
    )

    function createLines(){
        if(lines)lines.remove()
        if(points)points.remove()
        var cloneData = getVisibleSeries(data);
        var visibleGroups = cloneData[0].values.map(function(d) {
            return d.group;
        });
        var dataReady = visibleGroups.map( function(grpName) {
            return {
                name: grpName,
                values: grouped[grpName]
            };
        });

        lines = svg.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("d", function(d){ return line(d.values) } )
        .attr("stroke", function(d){ return colorScale(d.name) })
        .style("stroke-width", 1)
        .style("fill", "none")
        .attr('opacity', '0.7')

        points = svg
        .selectAll("dot")
        .data(dataReady)
        .enter()
        .append("g")
        .style("fill", function(d){ return colorScale(d.name) })
        .selectAll("myDots")
        .data(function(d){
            for (var i = 0; i < d.values.length; i++) {
                d.values[i].name = d.name;
            }
            return d.values;
        })
        .enter()
        .append("circle")
        .each(function (d, i) {
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
                select(this).attr(valueClass, i)
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
                if(allGroup.length > 1)group = d.group
                var toolTipColValue1 = d.label
                toolTipColValue1 = formatData(
                    d.label, cols[index2],
                    options
                )
                if(toolTipColValue1 === 'Invalid date')
                toolTipColValue1 = 'undefined'

                select(this).attr(valueClass, i)
                .attr('data-col1', col1)
                .attr('data-col2', group)
                .attr('data-colvalue1', toolTipColValue1)
                .attr('data-colvalue2',formatData(
                    d.value, cols[index1],
                    options
                ))
                .attr('data-filterindex', index2)
            }

        })
        .attr("cx", function(d) {
            return x(d.label) + xShift
        })
        .attr("cy", function(d) { return y(d.value) })
        .attr("r", 3)
        .attr('stroke', function(d) { return colorScale(d.name) })
        .attr('stroke-width', '2')
        .attr('stroke-opacity', '0.7')
        .attr("fill", 'white')
        .attr('class', `${tooltipClass} line-dot`)
        .style('opacity', '0')
        tooltipCharts();
        onUpdate(component)
    }

    if(hasLegend){
        const legendValues = allGroup.map(elem => {
            return formatChartData(elem, cols[groupable2Index], options);
        })
        var legendScale = getColorScale(
            legendValues,
            chartColors
        )
        var svgLegend = svg.append('g')
        .style('fill', 'currentColor')
        .style('fill-opacity', '1')
        .style('font-family', 'inherit')
        .style('font-size', '10px')

        const legendWrapLength = width / 2 - 50
        var legendOrdinal = getLegend(
            legendScale,
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
            var unformatGroup = legendGroups[words.join(' ')].value;
            data = toggleSerie(data, unformatGroup)
            createLines();
            const legendCell = select(this);
            legendCell.classed(
                'disable-group', !legendCell.classed('disable-group')
            );
        })

        if(groupableCount !== 2){
            if(allGroup.length > 2){
                legendOrdinal.title(strings.category).titleWidth(100)
            }
        }else{
            if(legendOrientation === 'vertical'){
                var colStr3 = cols[groupable2Index]['display_name']
                || cols[groupable2Index]['name'];
                var col3 = formatColumnName(colStr3)
                legendOrdinal.title(col3).titleWidth(100)
            }
        }

        svgLegend.call(legendOrdinal)

        if(groupableCount !== 2){
            styleLegendTitleNoBorder(svgLegend)
        }else{
            if(allGroup.length > 2){
                legendOrdinal.title(strings.category).titleWidth(100)
                styleLegendTitleWithBorder(svgLegend, {
                    showOnBaseline: true,
                    legendEvent: true
                }, onSelectorClick)
            }
        }

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
            const legendYPosition = height + 45
            svgLegend
            .attr(
                'transform',
                `translate(${legendXPosition}, ${legendYPosition})`
            )
        }
    }

    createLines();

    select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createLineChart(
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
}

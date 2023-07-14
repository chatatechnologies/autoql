import { aggregateData } from 'autoql-fe-utils'
import { select } from 'd3-selection'
import { ChataChartListPopover } from './ChataChartListPopover'
import { ChataChartSeriesPopover } from './ChataChartSeriesPopover'
import { ChartRowSelector } from './ChartRowSelector'
import {
    enumerateCols,
    getIndexesByType,
    getMetadataElement,
    makeGroups,
    getMinAndMaxValues,
    formatLabel,
    getVisibleSeries,
    toggleSerie,
    styleLegendTitleWithBorder,
    styleLegendTitleNoBorder,
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
    formatData,
    formatChartData,
    closeAllChartPopovers,
    getFirstDateCol,
    getGroupableCount,
    getChartLeftMargin,
    getChartColorVars,
} from '../Utils'
import { tooltipCharts } from '../Tooltips'
import { strings } from '../Strings'
import { ChartLoader } from './ChartLoader'

export function createColumnChart(
    component, origJson, options, onUpdate=()=>{}, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){
    
    if (!component.chartLoader) {
        var chartLoader = new ChartLoader(component)
        component.chartLoader = chartLoader
    }

    var margin = {
        top: 20,
        right: 10,
        bottom: 60,
        bottomChart: 50,
        left: 90,
        chartLeft: 120,
        marginLabel: 50,
        marginRowSelector: 0,
    }

    var hasRowSelector = options.pageSize < origJson?.data?.count_rows
    if (hasRowSelector) {
        margin.marginRowSelector = 20
        margin.bottom += margin.marginRowSelector
    }
   
    var width = component.parentElement.clientWidth - margin.left;
    var height;

    var cols = enumerateCols(origJson);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];
    let chartWidth = width;
    var legendOrientation = 'horizontal';
    var shapePadding = 100;
    let groupableCount = getGroupableCount(origJson)
    let tooltipClass = groupableCount === 2 ? 'tooltip-3d' : 'tooltip-2d'
    var { chartColors } = getChartColorVars();

    const paddingRectVert = 4;
    const paddingRectHoz = 8;
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
            series: [yIndexes[0]]
        }
    }

    var xAxisIndex = metadataComponent.metadata.groupBy.index;
    var activeSeries = metadataComponent.metadata.series;
    var index1 = activeSeries[0].index;
    var index2 = cols[xAxisIndex].index;
    var rows = aggregateData({
        data: origJson.data.rows,
        columns: origJson.data.columns,
        aggColIndex: xAxisIndex,
        numberIndices: yIndexes.map(indexObj => indexObj.index),
        dataFormatting: options.dataFormatting,
    });

    var json = {
        ...origJson,
        data: {
            ...origJson.data,
            rows,
        },
    };

    var data = makeGroups(json, options, activeSeries, cols[xAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);

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
    var legendGroups = {}
    var labelsNames = data.map(function(d) { return d.label; });
    var groupNames = data[0].values.map(function(d) { return d.group; });
    var groupable2Index = index2 === 0 ? 1 : 0
    groupNames.map(group => {
        legendGroups[
            formatChartData(group, cols[groupable2Index], options)
        ] = {
            value: group
        }
    })

    var hasLegend = false; 
    var hasLegend = groupNames.length > 1;
    if(hasLegend && groupNames.length < 3){
        margin.bottom = 70;
        margin.marginLabel = 10;
    }
    
    if(groupNames.length < 3){
        chartWidth = width;
    }else{
        chartWidth = width - margin.chartLeft;
        legendOrientation = 'vertical';
        shapePadding = 5;
    }

    data.forEach((item) => {
        const formattedValue = formatData(item.label, cols[index2], options)
        allLengths.push(formatLabel(formattedValue).length);
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

    const stringWidth = getChartLeftMargin(formatData(minMaxValues.max, cols[index1], options))
    const labelSelectorPadding = stringWidth > 0 
        ? (margin.left + stringWidth / 2)
        : (margin.left - 15)

    chartWidth -= stringWidth

    var x0 = SCALE_BAND()
    var x1 = SCALE_BAND();
    var y = SCALE_LINEAR();
    setDomainRange(x0, labelsNames, 0, chartWidth, false, .1)
    var x1Range = minMaxValues.max === 0 ? 0 : getBandWidth(x0)

    setDomainRange(x1, groupNames, 0, x1Range, false, .1)

    y
    .range([ height - margin.bottomChart - margin.marginRowSelector, 0 ])
    .domain([minMaxValues.min, minMaxValues.max]).nice()

    var xAxis = getAxisBottom(x0)
    var yAxis = getAxisLeft(y)

    var colorScale = getColorScale(
        groupNames,
        chartColors
    );

    var svg = select(component)
    .append("svg")
    .attr("width", width + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" +( margin.left + stringWidth) + "," + margin.top + ")")

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

        var yLabelBBox = labelYContainer.node().getBBox()

        labelYContainer.append('rect')
            .attr('transform', labelYContainer.attr('transform'))
            .attr('class', 'autoql-vanilla-y-axis-label-border')
            .attr('x', yLabelBBox.x - paddingRectVert)
            .attr('y', yLabelBBox.y - paddingRectHoz)
            .attr('height', yLabelBBox.height + paddingRectHoz * 2)
            .attr('width', yLabelBBox.width + paddingRectVert * 2)
            .attr('rx', '4')

        labelYContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();
            new ChataChartSeriesPopover(evt, 'right', 'middle', cols, activeSeries, (evt, popover, _activeSeries) => {
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
        .attr('y', height + margin.marginLabel - 5)
        .attr('text-anchor', 'middle')
        .attr('class', 'autoql-vanilla-x-axis-label')

    textContainerX.append('tspan').text(col1);

    const onSelectorClick = (placement, align, evt, legendEvent) =>{
        closeAllChartPopovers();
        const selectedItem = metadataComponent.metadata.groupBy.currentLi;
        var popoverSelector = new ChataChartListPopover(evt, xIndexes, (evt, popover) => {
            var xAxisIndex = evt.target.dataset.popoverIndex;
            var currentLi = evt.target.dataset.popoverPosition;
            metadataComponent.metadata.groupBy.index = xAxisIndex;
            metadataComponent.metadata.groupBy.currentLi = currentLi;
            if(legendEvent){
                let ind = xAxisIndex == 1 ? 0 : 1
                metadataComponent.metadata.groupBy.index = ind;
            }
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
        }, placement, align);

        popoverSelector.setSelectedItem(selectedItem)
    }

    if(xIndexes.length > 1 && options.enableDynamicCharting){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')

        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')

        var xLabelBBox = labelXContainer.node().getBBox()

        labelXContainer.append('rect')
            .attr('class', 'autoql-vanilla-x-axis-label-border')
            .attr('x', xLabelBBox.x - paddingRectHoz)
            .attr('y', xLabelBBox.y - paddingRectVert)
            .attr('height', xLabelBBox.height + paddingRectVert * 2)
            .attr('width', xLabelBBox.width + paddingRectHoz * 2)
            .attr('rx', '4')

        labelXContainer.on('mouseup', (e) => onSelectorClick('top', 'middle', e))
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
    .attr("class", "autoql-vanilla-axes-grid")
    .call(
        yAxis
        .tickSize(-chartWidth)
        .tickFormat(function(d){
            return formatChartData(d, cols[index1], options)}
        )
    )

    const calculateHeight = (d) => {
        return Math.abs(y(d.value) - y(0));
    }

    var slice = undefined;
    function createBars(){
        var rectIndex = 0;
        var cloneData = getVisibleSeries(data);
        if(slice)slice.remove();
        slice = svg.select('.autoql-vanilla-axes-grid').selectAll(".autoql-vanilla-chart-bar")
        .remove()
        .data(cloneData)
        .enter().insert("g", ":first-child")
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
        .attr("x", function(d) { 
            return x1(d.group); 
        })
        .style("fill", function(d) { return colorScale(d.group) })
        .attr('fill-opacity', '1')
        .attr('class', `${tooltipClass} autoql-vanilla-chart-bar`)
        .attr("y", function(d) { 
            return y(Math.max(0, d.value)); })
        .attr("height", function(d) { return calculateHeight(d) })

        onUpdate(component);
        tooltipCharts();
    }

    if(hasLegend){
        const legendValues = groupNames.map(elem => {
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

            createBars();
            const legendCell = select(this);
            legendCell.classed(
                'disable-group', !legendCell.classed('disable-group')
            );
        })

        if(groupableCount !== 2){
            if(groupNames.length > 2){
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
            if(groupNames.length > 2){
                styleLegendTitleWithBorder(svgLegend, { legendEvent: true }, onSelectorClick)
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


    const onDataFetching = () => component.chartLoader?.setChartLoading(true)
    
    const onNewData = (newJson) => {
        createColumnChart(
            component,
            newJson,
            options,
            onUpdate,
            fromChataUtils,
            valueClass,
            renderTooltips
        )
        component.chartLoader?.setChartLoading(false)
    } 
    const onDataFetchError = (error) =>  {
        console.error(error)
        component.chartLoader?.setChartLoading(false)
    }

    if (hasRowSelector) {
        new ChartRowSelector(
            svg,
            json,
            onDataFetching,
            onNewData,
            onDataFetchError,
            metadataComponent,
            {
                x: width / 2,
                y: height + margin.marginLabel + margin.marginRowSelector,
            }
        );
    }

    component.appendChild(component.chartLoader)

    createBars();
}

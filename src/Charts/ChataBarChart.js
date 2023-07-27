import { aggregateData, scaleZero, cloneObject, onlyUnique, getBandScale } from 'autoql-fe-utils'
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
    getChartColorVars,
    getStringWidth,
} from '../Utils'
import { tooltipCharts } from '../Tooltips'
import { strings } from '../Strings'
import { ChartLoader } from './ChartLoader'
import { CSS_PREFIX } from '../Constants'

export function createBarChart(
    component, origJson, options, onUpdate=()=>{}, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){

    var chartLoader = new ChartLoader(component)

    var margin = {
        top: 5,
        right: 10,
        bottom: 60,
        left: 30,
        chartLeft: 120,
        bottomChart: 0,
        marginLabel: 30,
        marginRowSelector: 0,
    }

    var hasRowSelector = options.pageSize < origJson?.data?.count_rows
    if (hasRowSelector) {
        margin.marginRowSelector = 20
        margin.bottomChart += margin.marginRowSelector
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
    var { chartColors } = getChartColorVars(CSS_PREFIX);

    const paddingRectVert = 4;
    const paddingRectHoz = 8;
    const legendBoxMargin = 15;

    if(indexList['STRING']){
        yIndexes.push(...indexList['STRING'])
    }

    if(indexList['DATE']){
        yIndexes.push(...indexList['DATE'])
    }

    if(indexList['DATE_STRING']){
        yIndexes.push(...indexList['DATE_STRING'])
    }

    if(indexList['DOLLAR_AMT']){
        xIndexes = indexList['DOLLAR_AMT'];
    }else if(indexList['QUANTITY']){
        xIndexes = indexList['QUANTITY'];
    }else if(indexList['PERCENT']){
        xIndexes = indexList['PERCENT'];
    }

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata){
        var dateCol = getFirstDateCol(cols)
        let i = dateCol !== -1 ? dateCol : yIndexes[0]?.index
        metadataComponent.metadata = {
            groupBy: {
                index: i,
                currentLi: 0,
            },
            series: [xIndexes[0]]
        }
    }
    var yAxisIndex = metadataComponent.metadata.groupBy.index;
    var activeSeries = metadataComponent.metadata.series;
    var index1 = activeSeries[0].index;
    var index2 = cols[yAxisIndex].index;

    var rows = aggregateData({
        data: origJson.data.rows,
        columns: cols,
        aggColIndex: yAxisIndex,
        numberIndices: xIndexes.map(indexObj => indexObj.index),
        dataFormatting: options.dataFormatting,
    });

    var json = cloneObject(origJson)
    json.data.rows = rows

    var data = makeGroups(json, options, activeSeries, cols[yAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);

    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    const tickWidth = (width - margin.left - margin.right) / 6
    const rotateLabels = tickWidth < 135;
    
    let totalVerticalMargins = margin.bottom + margin.top - margin.marginRowSelector - margin.marginLabel

    if(fromChataUtils){
        if(options.placement == 'left' || options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - totalVerticalMargins;
        
            if(height < 250){
                height = 300;
            }
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight - totalVerticalMargins;
    }

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
    var legendGroups = {}
    var categoriesNames = data.map(function(d) { return d.label; });
    var groupNames = data[0].values.map(function(d) { return d.group; });
    var groupable2Index = index2 === 0 ? 1 : 0
    groupNames.map(group => {
        legendGroups[
            formatChartData(group, cols[groupable2Index], options)
        ] = {
            value: group
        }
    })
    var hasLegend = groupNames.length > 1;
    if(hasLegend && groupNames.length < 3){
        margin.bottom = 80;
        margin.marginLabel = 0;
    }

    if(groupNames.length < 3){
        chartWidth = width;
    }else{
        chartWidth = width - 100;
        legendOrientation = 'vertical';
        shapePadding = 5;
    }

    const barHeight = height / data.length;
    const interval = Math.ceil((data.length * 16) / height);
    var yTickValues = [];
    var allLengths = [];
    if (barHeight < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                yTickValues.push(element.label);
            }
        });
    }
    if(yTickValues.length > 0){
        for (var i = 0; i < yTickValues.length; i++) {
            allLengths.push(getStringWidth(formatLabel(yTickValues[i], cols[index2], options)));
        }
    }else{
        data.forEach((item) => {
            allLengths.push(getStringWidth(formatLabel(item.label, cols[index2], options)));
        });
    }

    let longestStringWidth = Math.max(allLengths);
    
    let legendMargin = 0
    if (hasLegend && legendOrientation == 'horizontal') {
        legendMargin = 30
    }
    
    // var increment = 5;
    // var factor = 10;
    // if(longestStringHeight <= 4)longestStringHeight = 5;
    // if(!hasLegend)increment = 1;
    const labelSelectorPadding = longestStringWidth > 0 ? 10 : (margin.left - 15)
    chartWidth -= longestStringWidth

    // margin.left = longestStringWidth + labelSelectorPadding;
    // margin.chartLeft = longestStringWidth + labelSelectorPadding;
    // if(margin.chartLeft <= 80) margin.chartLeft = 90;
    // if(margin.chartLeft > 150) margin.chartLeft = 150;
    
    const fontSize = 12
    let xLabelsHeight = fontSize
    if (rotateLabels) {
        // const allXLabelHeights = []
        // data.forEach((item) => {
        //     const fontSize = 12
        //     const labelWidth = getStringWidth(formatChartData(item.label, cols[index], options))
        //     const labelWidthHoz = (labelWidth + fontSize) / Math.sqrt(2)
            
        //     allXLabelHeights.push(labelWidthHoz);
        // });
        const labelWidth = getStringWidth(formatLabel(minMaxValues.max, cols[index1], options));
        const longestStringHeight = (labelWidth + fontSize) / Math.sqrt(2)
        xLabelsHeight = longestStringHeight
    }

    margin.bottomChart = xLabelsHeight + margin.marginRowSelector + legendMargin;
    // margin.bottom = margin.marginLabel + legendMargin

    // if(legendOrientation == 'horizontal'){
        // if(rotateLabels){
        //     let m = xLabelsHeight * increment + extraMargin;
        //     if(hasLegend && m <= 50) m = 55;
        //     margin.bottomChart = m;
        // }else{
            
        // }
    // }else{
    //     margin.bottomChart = xLabelsHeight;
    // }

    var y0 = SCALE_BAND();
    var y1 = SCALE_BAND();

    var x = SCALE_LINEAR()
    .range([0, chartWidth]);
    setDomainRange(
        y0,
        categoriesNames,
        height - margin.bottomChart - margin.marginRowSelector,
        0,
        false,
        .1
    );
    x.domain([minMaxValues.min, minMaxValues.max]).nice();


    var y1Range = minMaxValues.max === 0 ? 0 : getBandWidth(y0)
    setDomainRange(
        y1,
        groupNames,
        0,
        y1Range,
        false,
        .1
    )
    var xAxis = getAxisBottom(x).tickSize(0)
    var yAxis = getAxisLeft(y0)

    var colorScale = getColorScale(groupNames, chartColors);

    var svg = select(component)
        .append("svg")
        .attr("width", width + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left + longestStringWidth}, ${margin.top})`);

    var labelXContainer = svg.append('g');
    var labelYContainer = svg.append('g');

    // Y AXIS
    var textContainerY = labelYContainer.append('text')
        .attr('x', -(height / 2))
        .attr('y', -(longestStringWidth + labelSelectorPadding))
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('class', 'autoql-vanilla-y-axis-label')
    
    textContainerY.append('tspan').text(col1)

    const onSelectorClick = (placement, align, evt, legendEvent) => {
        closeAllChartPopovers();
        const selectedItem = metadataComponent.metadata.groupBy.currentLi;
        var popoverSelector = new ChataChartListPopover(evt, yIndexes, (evt, popover) => {
            var yAxisIndex = evt.target.dataset.popoverIndex;
            var currentLi = evt.target.dataset.popoverPosition;
            metadataComponent.metadata.groupBy.index = yAxisIndex;
            metadataComponent.metadata.groupBy.currentLi = currentLi;
            if(legendEvent){
                let ind = yAxisIndex == 1 ? 0 : 1
                metadataComponent.metadata.groupBy.index = ind;
            }
            createBarChart(
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

        labelYContainer.on('mouseup', (e) => onSelectorClick('right', 'middle', e))
    }

    // X AXIS
    var textContainerX = labelXContainer.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', height - margin.marginLabel - margin.marginRowSelector)
        .attr('text-anchor', 'middle')
        .attr("class", "autoql-vanilla-x-axis-label")
        textContainerX.append('tspan')
        .text(col2);

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

        labelXContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();

            new ChataChartSeriesPopover(evt, 'top', 'middle', cols, activeSeries, (evt, popover, _activeSeries) => {
                metadataComponent.metadata.series = _activeSeries;
                createBarChart(
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

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    var xAxisElement;
    if(rotateLabels){
        xAxisElement = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart - margin.marginRowSelector) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(d, cols[index1], options)}
        ))
        
        xAxisElement.selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        xAxisElement = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart - margin.marginRowSelector) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(d, cols[index1], options)}
        ))
        
        xAxisElement.selectAll("text")
        .style("text-anchor", "center");
    }

    svg.append("g")
        .attr("class", "autoql-vanilla-axes-grid")
        .call(xAxis
            .tickSize(height - margin.bottomChart - margin.marginRowSelector)
            .tickFormat("")
        );

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis.tickFormat(function(d){
        // let fLabel = formatChartData(d, cols[index2], options);
        // if(fLabel === 'Invalid date') {
        //     fLabel = 'Untitled Category'
        // }
        return formatLabel(d, cols[index2], options);
    }))
    let slice;
    function createBars(){
        var rectIndex = 0;
        var cloneData = getVisibleSeries(data);
        if(slice) slice.remove()
        slice = svg.select('.autoql-vanilla-axes-grid').selectAll(".autoql-vanilla-chart-bar")
        .data(cloneData)
        .enter().insert("g", ":first-child")
        .attr("class", "g")
        .attr("transform",function(d) {
            return "translate(0,"+ y0(d.label) +")";
        });

        const calculateWidth = (d) => {
            return Math.abs(x(d.value) - scaleZero(x))
        }

        const getXRect = (d) => {
            if(minMaxValues.min < 0){
                return x(Math.min(0, d.value));
            }else{
                return 0;
            }
        }

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
                    d.value,
                    cols[index1],
                    options
                ))
                .attr('data-filterindex', index2)
            }
            rectIndex++
        })
        .attr("width", function(d) { return calculateWidth(d) })
        .attr("x", function(d) { return getXRect(d) })
        .attr("y", function(d) { return y1(d.group); })
        .attr("height", function() { return getBandWidth(y1) })
        .attr('class', `${tooltipClass} autoql-vanilla-chart-bar`)
        .style("fill", function(d) { return colorScale(d.group) })

        tooltipCharts();
        onUpdate(component);
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
            createBars()
            const legendCell = select(this)
            legendCell.classed(
                'disable-group', !legendCell.classed('disable-group')
            )
        });
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
            const legendYPosition = height + 25
            svgLegend
            .attr(
                'transform',
                `translate(${legendXPosition}, ${legendYPosition})`
            )
        }
    }

    select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createBarChart(
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

    const onDataFetching = () => chartLoader?.setChartLoading(true)

    const onNewData = (newJson) => {
        if (newJson?.data?.rows) {
            origJson.data.rows = newJson.data.rows
            origJson.data.row_limit = newJson.data.row_limit

            createBarChart(
                component,
                origJson,
                options,
                onUpdate,
                fromChataUtils,
                valueClass,
                renderTooltips,
            )
        }

        chartLoader?.setChartLoading(false)
    } 
    const onDataFetchError = (error) =>  {
        console.error(error)
        chartLoader?.setChartLoading(false)
    }

    const popoverPosition = {
        x: chartWidth / 2,
        y: height - margin.marginRowSelector,
    }

    if (hasRowSelector) {
        new ChartRowSelector(
            svg,
            origJson,
            onDataFetching,
            onNewData,
            onDataFetchError,
            metadataComponent,
            popoverPosition,
            options,
        );
    }
    
    component.appendChild(chartLoader)

    createBars();
}

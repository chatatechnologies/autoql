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
    getStringWidth,
    formatData,
    formatChartData,
    closeAllChartPopovers,
    getFirstDateCol,
    getGroupableCount
} from '../Utils'
import { tooltipCharts } from '../Tooltips'


export function createBarChart(
    component, json, options, onUpdate=()=>{}, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){
    var margin = {
        top: 5,
        right: 10,
        bottom: 60,
        left: 160,
        marginLabel: 50,
        chartLeft: 120,
        bottomChart: 60
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
    }

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata){
        var dateCol = getFirstDateCol(cols)
        let i = dateCol !== -1 ? dateCol : yIndexes[0].index
        metadataComponent.metadata = {
            groupBy: {
                index: i,
                currentLi: 0,
            },
            series: xIndexes
        }
    }
    var yAxisIndex = metadataComponent.metadata.groupBy.index;
    var activeSeries = metadataComponent.metadata.series;
    var data = makeGroups(json, options, activeSeries, cols[yAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);
    var index1 = activeSeries[0].index;
    var index2 = cols[yAxisIndex].index;


    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    const tickWidth = (width - margin.left - margin.right) / 6
    const rotateLabels = tickWidth < 135;

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
    var categoriesNames = data.map(function(d) { return d.label; });
    var groupNames = data[0].values.map(function(d) { return d.group; });
    var hasLegend = groupNames.length > 1;
    if(hasLegend && groupNames.length < 3){
        margin.bottom = 80;
        margin.marginLabel = 0;
    }

    if(groupNames.length < 3){
        chartWidth = width;
    }else{
        chartWidth = width - margin.chartLeft;
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
            allLengths.push(formatLabel(yTickValues[i]).length);
        }
    }else{
        data.forEach((item) => {
            allLengths.push(formatLabel(item.label).length);
        });
    }
    let longestStringWidth = Math.max.apply(null, allLengths);
    let longestStringHeight = minMaxValues.max.toString().length;
    var extraMargin = hasLegend ? 15 : 0;
    var increment = 5;
    var factor = 10;
    if(longestStringHeight <= 4)longestStringHeight = 5;
    if(!hasLegend)increment = 2;

    margin.chartLeft = longestStringWidth * factor;
    if(margin.chartLeft <= 80) margin.chartLeft = 90;
    if(margin.chartLeft > 150) margin.chartLeft = 150;

    if(legendOrientation == 'horizontal'){
        if(rotateLabels){
            let m = longestStringHeight * increment + extraMargin;
            if(hasLegend && m <= 50) m = 55;
            margin.bottomChart = m;
        }else{
            margin.bottomChart = 13 + extraMargin;
        }

    }else{
        if(rotateLabels){
            let m = longestStringHeight * 3;
            margin.bottomChart = m;
        }else{
            margin.bottomChart = 13;
        }

    }

    var y0 = SCALE_BAND();
    var y1 = SCALE_BAND();

    var x = SCALE_LINEAR()
    .range([0, chartWidth]);
    setDomainRange(
        y0,
        categoriesNames,
        height - margin.bottomChart,
        0,
        false,
        .1
    );

    var y1Range = minMaxValues.max === 0 ? 0 : getBandWidth(y0)

    setDomainRange(
        y1,
        groupNames,
        0,
        y1Range,
        false,
        .1
    )
    var xAxis = getAxisBottom(x)
    .tickSize(0)

    var yAxis = getAxisLeft(y0)
    x.domain([minMaxValues.min, minMaxValues.max]).nice();

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
    "translate(" + margin.chartLeft + "," + margin.top + ")");

    var labelXContainer = svg.append('g');
    var labelYContainer = svg.append('g');

    // Y AXIS
    var textContainerY = labelYContainer.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.chartLeft + margin.right + 5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    textContainerY.append('tspan')
    .text(col1)

    const onSelectorClick = (evt, showOnBaseline, legendEvent) => {
        closeAllChartPopovers();
        const selectedItem = metadataComponent.metadata.groupBy.currentLi;
        var popoverSelector = new ChataChartListPopover({
            left: evt.clientX,
            top: evt.clientY
        }, yIndexes, (evt, popover) => {
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
        }, showOnBaseline);

        popoverSelector.setSelectedItem(selectedItem)
    }

    if(yIndexes.length > 1 && options.enableDynamicCharting){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
        labelYContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col1) + paddingRect;

        labelYContainer.append('rect')
        .attr('x', margin.chartLeft - 25)
        .attr('y', -(height/2 + (xWidthRect/2) + (paddingRect/2)))
        .attr('height', xWidthRect + paddingRect)
        .attr('width', 24)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('transform', 'rotate(-180)')
        .attr('class', 'autoql-vanilla-y-axis-label-border')

        labelYContainer.on('mouseup', (evt) => { onSelectorClick(evt, false) })
    }

    // X AXIS
    var textContainerX = labelXContainer.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.marginLabel)
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
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;
        var _y = 0;
        const _x = (chartWidth / 2) - (xWidthRect/2) - (paddingRect/2);
        if(hasLegend && groupNames.length < 3){
            _y = height - (margin.marginLabel/2) + 3;
        }else{
            _y = height + (margin.marginLabel/2) + 28;
        }
        labelXContainer.append('rect')
        .attr('x', _x)
        .attr('y', _y - 20)
        .attr('height', 24)
        .attr('width', xWidthRect + paddingRect)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('class', 'autoql-vanilla-x-axis-label-border')

        labelXContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();

            new ChataChartSeriesPopover({
                left: evt.clientX,
                top: evt.clientY
            }, cols, activeSeries, (evt, popover, _activeSeries) => {
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
            }, true);
        })
    }

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    if(rotateLabels){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[index1], options)}
        ))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[index1], options)}
        ))
        .selectAll("text")
        .style("text-anchor", "center");
    }

    svg.append("g")
        .attr("class", "grid")
        .call(xAxis
            .tickSize(height - margin.bottomChart)
            .tickFormat("")
        );

    svg.append("g")
    .attr("class", "y axis")
    .style('opacity','1')
    .call(yAxis.tickFormat(function(d){
        let fLabel = formatChartData(d, cols[index2], options);
        if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
        return formatLabel(fLabel);
    }))
    let slice;
    function createBars(){
        var rectIndex = 0;
        var cloneData = getVisibleSeries(data);
        if(slice)slice.remove()
        slice = svg.selectAll(".slice")
        .data(cloneData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) {
            return "translate(0,"+ y0(d.label) +")";
        });

        const calculateWidth = (d) => {
            if(minMaxValues.min < 0){
                return Math.abs(x(d.value) - x(0));
            }else{
                return x(d.value);
            }
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
        .attr('fill-opacity', '0.7')
        .attr('class', `${tooltipClass} bar`)
        .style("fill", function(d) { return colorScale(d.group) })

        tooltipCharts();
        onUpdate(component);
    }
    if(hasLegend){
        var groupable2Index = index2 === 0 ? 1 : 0
        const legendValues = groupNames.map(elem => {
            return formatChartData(elem, cols[groupable2Index], options);
        })
        var legendScale = getColorScale(
            legendValues,
            options.themeConfig.chartColors
        )
        var svgLegend = svg.append('g')
        .style('fill', 'currentColor')
        .style('fill-opacity', '0.7')
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
            data = toggleSerie(data, words.join(' '));
            createBars();
            const legendCell = select(this);
            legendCell.classed('disable-group', !legendCell.classed('disable-group'));
        });
        if(groupableCount !== 2){
            if(groupNames.length > 2){
                legendOrdinal.title('Category').titleWidth(100)
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

    createBars();
}

import { select } from 'd3-selection'
import { max } from 'd3-array'
import { ChataChartListPopover } from './ChataChartListPopover'
import { refreshTooltips } from '../Tooltips'
import {
    getGroupableFields,
    getMetadataElement,
    formatLabel,
    getVisibleGroups,
    styleLegendTitleWithBorder
} from './ChataChartHelpers'
import {
    getColorScale,
    getLegend,
    SCALE_BAND,
    SCALE_LINEAR,
    getAxisBottom,
    getAxisLeft,
    setDomainRange,
    getStackedAreaData,
} from './d3-compatibility'
import {
    getStringWidth,
    getNotGroupableField,
    cloneObject,
    formatChartData,
    formatColumnName,
    closeAllChartPopovers,
    formatData,
    getChartLeftMargin,
} from '../Utils'
import { ChataUtils } from '../ChataUtils'
import { area } from 'd3-shape'
import { CSS_PREFIX } from '../Constants'
import { getChartColorVars } from 'autoql-fe-utils'

export function createAreaChart(component, json, options, onUpdate=()=>{}, fromChataUtils=true, valueClass='data-stackedchartindex', renderTooltips=true) {
    var margin = {top: 15, right: 10, bottom: 50, left: 80},
    width = component.parentElement.clientWidth - margin.left;
    var wLegendBox = 140;
    var chartWidth = width - wLegendBox;
    var height;
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);
    var { chartColors } = getChartColorVars(CSS_PREFIX);

    const paddingRectVert = 4;
    const paddingRectHoz = 8;
    const legendBoxMargin = 15;

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata3D){
        metadataComponent.metadata3D = {
            groupBy: {
                groupable1: 0,
                groupable2: 1,
            },
        }
    }

    var groupableIndex1 = metadataComponent.metadata3D.groupBy.groupable1;
    var groupableIndex2 = metadataComponent.metadata3D.groupBy.groupable2;
    var notGroupableIndex = notGroupableField.indexCol;
    var groupCols = groupables.map((groupable, i) => {
        return {col: groupable.jsonCol, index: i}
    });

    var data = cloneObject(json['data']['rows']);
    var groups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex2], true
    );
    groups = groups.sort();
    var subgroups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex1], true
    );
    subgroups.sort();
    var allSubgroups = {}
    var cols = json['data']['columns'];
    var legendGroups = {};

    subgroups.map(subgroup => {
        allSubgroups[subgroup] = {
            isVisible: true
        };
        legendGroups[
            formatChartData(subgroup, cols[groupableIndex1], options)
        ] = {
            value: subgroup
        }
    })


    data = ChataUtils.format3dData(
        json, groups, metadataComponent.metadata3D
    );
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
    const barWidth = chartWidth / groups.length;
    const rotateLabels = barWidth < 135;
    const interval = Math.ceil((groups.length * 16) / width);
    var xTickValues = [];
    var allLengths = [];
    if (barWidth < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                xTickValues.push(element);
            }
        });
    }

    groups.map(element => allLengths.push(formatLabel(element).length));
    let longestString = Math.max.apply(null, allLengths);

    if(rotateLabels){
        var m = longestString * 3;
        margin.bottomChart = m + 15;
    }else{
        margin.bottomChart = 13;
    }
    var maxValue = max(data, function(d) {
        var sum = 0;
        for (var [key, value] of Object.entries(d)){
            if(key == 'group')continue;
            sum += parseFloat(value);
        }
        return sum;
    });

    const stringWidth = getChartLeftMargin(maxValue.toString(), cols[notGroupableIndex], options)
    const labelSelectorPadding = stringWidth > 0 ? (margin.left + stringWidth / 2)
    : (margin.left - 15)
    chartWidth -= stringWidth

    var svg = select(component)
    .append("svg")
    .attr("width", width + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + ( margin.left + stringWidth) + "," + margin.top + ")");


    svg.append('text')
    .attr('x', -(height / 2))
    .attr('y', -(labelSelectorPadding))
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    .text(col3);

    var axesGrid = svg.append("g").attr('class', 'autoql-vanilla-axes-grid')

    // X AXIS
    var labelXContainer = svg.append('g');
    var textContainerX = labelXContainer.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + (margin.bottom - 10))
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
    textContainerX.append('tspan')
    .text(col2);

    const onSelectorClick = (placement, align, evt, legendEvent) => {
        closeAllChartPopovers();
        new ChataChartListPopover(evt, groupCols, (evt, popover) => {
            var selectedIndex = evt.target.dataset.popoverIndex;
            var oldGroupable
            = metadataComponent.metadata3D.groupBy.groupable2;
            if(selectedIndex != oldGroupable && !legendEvent){
                metadataComponent.metadata3D.groupBy.groupable2 = selectedIndex
                metadataComponent.metadata3D.groupBy.groupable1 = oldGroupable
            }
            if(legendEvent){
                let ind = selectedIndex == 1 ? 0 : 1
                if(ind === 1)oldGroupable = 0
                if(selectedIndex == oldGroupable){
                    metadataComponent.metadata3D.groupBy.groupable2 = ind
                    metadataComponent.metadata3D.groupBy.groupable1 = oldGroupable
                }
            }
            createAreaChart(
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
    }

    if(options.enableDynamicCharting){
        textContainerX.append('tspan')
            .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
            .text('▼')
            .style('font-size', '8px')
        
        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')

        var xLabelBBox = labelXContainer.node().getBBox()

        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;
        const X = (chartWidth / 2) - (xWidthRect/2) - (paddingRect/2);
        const Y = height + (margin.bottom/2);

        labelXContainer.append('rect')
            .attr('class', 'autoql-vanilla-x-axis-label-border')
            .attr('x', xLabelBBox.x - paddingRectHoz)
            .attr('y', xLabelBBox.y - paddingRectVert)
            .attr('height', xLabelBBox.height + paddingRectVert * 2)
            .attr('width', xLabelBBox.width + paddingRectHoz * 2)
            .attr('rx', '4')

        labelXContainer.on('mouseup', onSelectorClick.bind('top', 'middle'))
    }


    var x = SCALE_BAND()
    setDomainRange(
        x,
        groups,
        0,
        chartWidth,
        false,
        0
    )

    x.paddingInner(1)
    .paddingOuter(0)

    var xAxis = getAxisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }

    if(rotateLabels){
        axesGrid.append("g")
        .classed('x-axis', true)
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(
                formatChartData(d, cols[groupableIndex2], options)
            )
        }))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        axesGrid.append("g")
        .classed('x-axis', true)
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(
                formatChartData(d, cols[groupableIndex2], options)
            )
        }))
        .selectAll("text")
        .style("text-anchor", "center");
    }

    var y = SCALE_LINEAR()
    .domain([0, maxValue])
    .range([ height - margin.bottomChart, 0]).nice();
    var yAxis = getAxisLeft(y)
        .tickFormat(function(d){
            return formatChartData(d, cols[notGroupableIndex], options)}
        )
        .tickSize(-chartWidth)

    var color = getColorScale(subgroups, chartColors)

    axesGrid.append("g")
        .classed('y-axis', true)
        .call(yAxis);

    let layers;
    let layerPoints;

    function createLayers(){
        var visibleGroups = getVisibleGroups(allSubgroups);
        var stackedData = getStackedAreaData(visibleGroups, data);

        var points = []
        if(layers)layers.remove();
        if(layerPoints)layerPoints.remove();

        layers = axesGrid
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .insert("path", ":first-child")
        .style("fill", function(d) {
            if(d.key) return color(d.key); else return 'transparent'
        })
        .each((d) => {

            d.map((layer) => {
                var pos = layer[1];
                var sum = 0;
                var seriesValues = layer.data
                for (var [key, value] of Object.entries(seriesValues)) {
                    if(key === 'group')continue;
                    if(!layer[0] && !layer[1] && !value) continue
                    sum += parseFloat(value);
                    if(sum == pos){
                        points.push({
                            group: seriesValues.group,
                            key: key,
                            valueY: value,
                            y: layer[groupableIndex2],
                        })
                    }
                }
            })
        })
        .attr("d", area()
            .x(function(d) { return x(d.data.group); })
            .y0(function(d) { return y(d[0]) || 0; })
            .y1(function(d) { return y(d[1]) || 0; })
        )

        layerPoints = svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr('class', 'line-dot')
        .attr('stroke-width', '3')
        .attr("fill", 'transparent')
        .attr('stroke', function() {'transparent' })
        .each(function(d, i){
            var unformatvalue1 = d.key
            var unformatvalue2 = d.group
            if(groupableIndex1 !== 0){
                unformatvalue1 = d.group
                unformatvalue2 = d.key
            }
            if(d.valueY && d.group && d.key){
                select(this).attr(valueClass, i)
                .attr('data-col1', col1)
                .attr('data-col2', col2)
                .attr('data-col3', col3)
                .attr('data-colvalue1', formatData(
                    d.key, cols[groupableIndex1], options
                ))
                .attr('data-colvalue2', formatData(
                    d.group, cols[groupableIndex2], options
                ))
                .attr('data-colvalue3', formatData(
                    d.valueY, cols[notGroupableIndex],
                    options
                ))
                .attr('data-unformatvalue1', unformatvalue1)
                .attr('data-unformatvalue2', unformatvalue2)
                .attr('data-unformatvalue3', d.valueY)
                .attr('class', 'tooltip-3d line-dot')
            }
        })
        .on("mouseover", function(d){
            select(this).
            attr("stroke", color(d.group))
            .attr('fill', 'white')
        })
        .on("mouseout", function(){
            select(this)
            .attr("stroke", 'transparent')
            .attr('fill', 'transparent')
        })
        .attr("cx", function(d) {
            return x(d.group);
        })
        .attr("cy", function(d) { return y(d.y); });

        refreshTooltips();
        onUpdate(component);
    }

    // new MultiSeriesSelector(svg, {
    //     x: (chartWidth + 15),
    //     y: 10,
    //     colName: col1,
    //     showOnBaseline: true,
    //     legendEvent: true
    // }, onSelectorClick)

    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    const legendWrapLength = wLegendBox - 28;
    var legendScale = getColorScale(
        subgroups.map(elem => {
            return formatChartData(elem, cols[groupableIndex1], options);
        }),
        chartColors
    )
    var legendOrdinal = getLegend(legendScale, legendWrapLength, 'vertical')

    legendOrdinal.on('cellclick', function(d) {
        var words = []
        var nodes = d.currentTarget.getElementsByTagName('tspan')
        for (var i = 0; i < nodes.length; i++) {
            words.push(nodes[i].textContent)
        }

        var unformatGroup = legendGroups[words.join(' ')].value;
        allSubgroups[unformatGroup].isVisible =
        !allSubgroups[unformatGroup].isVisible;

        createLayers();
        const legendCell = select(this);
        legendCell.classed('disable-group', !legendCell.classed('disable-group'));
    });
    legendOrdinal.title(col1).titleWidth(100)
    svgLegend.call(legendOrdinal)
    styleLegendTitleWithBorder(svgLegend, {
        showOnBaseline: true,
        legendEvent: true
    }, onSelectorClick.bind('bottom', 'middle'))

    const newX = chartWidth + legendBoxMargin
    svgLegend
      .attr('transform', `translate(${newX}, ${25})`)

    select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createAreaChart(
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

    createLayers();
}

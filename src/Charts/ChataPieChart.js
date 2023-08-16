import { select } from 'd3-selection'
import {
    enumerateCols,
    getIndexesByType,
    getMetadataElement,
    getPieGroups,
} from './ChataChartHelpers'
import {
    getColorScale,
    getLegend,
    getArc,
    getPie
} from './d3-compatibility'
import {
    formatColumnName,
    formatData,
    getFirstDateCol,
    getChartColorVars
} from '../Utils'
import { refreshTooltips } from '../Tooltips'
import { ChataUtils } from '../ChataUtils'
import { CSS_PREFIX } from '../Constants'

export function createPieChart(
    component, json, options, onUpdate=()=>{}, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){

    var margin = 20;
    var width = component.parentElement.clientWidth;
    var pieWidth;
    var height;
    var cols = json['data']['columns'];
    var colsEnum = enumerateCols(json);
    var indexList = getIndexesByType(colsEnum);
    var xIndexes = [];
    var yIndexes = [];
    var { chartColors } = getChartColorVars(CSS_PREFIX);

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
        var dateCol = getFirstDateCol(colsEnum)
        let i = dateCol !== -1 ? dateCol : yIndexes[0].index
        metadataComponent.metadata = {
            groupBy: {
                index: i,
                currentLi: 0,
            },
            series: [yIndexes[0]]
        }
    }

    var index1 = metadataComponent.metadata.groupBy.index;
    var index2 = metadataComponent.metadata.series[0].index;
    var data = ChataUtils.groupBy(
        json['data']['rows'], row => row[index1], index2
    );

    var groups = {}
    var legendGroups = {}
    for(let [key, value] of Object.entries(data)){
        groups[key] = {
            isVisible: true
        }
        legendGroups[
            formatData(key, cols[index1], options) + ": " +
            formatData(value, cols[index2], options)
        ] = {
            value: key
        }
    }

    var colStr1 = cols[index1]['display_name'] || cols[index1]['name'];
    var colStr2 = cols[index2]['display_name'] || cols[index2]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    if(fromChataUtils){
        if(options.placement == 'left' || options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - (margin + 3);
            if(height < 250){
                height = 300;
            }
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight - (margin);
    }
    if (width < height) {
        pieWidth = width / 2 - margin;
    } else if (height * 2 < width) {
        pieWidth = height - margin;
    } else {
        pieWidth = width / 2 - margin;
    }

    var outerRadius = pieWidth / 2
    var innerRadius = outerRadius - 40 > 15 ? outerRadius - 40 : 0

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
    .append('svg')
    .attr('width', width)
    .attr('height', height)

    var arc = getArc(
        innerRadius,
        outerRadius
    )

    var pie = getPie(
        (d) => { return d.value }
    )

    let slicesContainer;
    var pieChartContainer = svg.append('g')
    
    const entries = (map, visibleGroups) => {
        var entries = [];
        visibleGroups.map((group) => {
            entries.push(
                {key: group.key, value: map[group.key], index: group.index}
            )
        })
        return entries;
    }

    const createSlices = () => {
        if (slicesContainer)slicesContainer.remove()
        slicesContainer = pieChartContainer.append('g').attr("transform", `translate(${width / 2 + outerRadius}, ${height / 2})`);
        
        var visibleGroups = getPieGroups(groups);
        var dataReady = pie(entries(data, visibleGroups))

        var colorLabels = []
        for(let [key] of Object.entries(data)){
            colorLabels.push(key);
        }
        var color = getColorScale(colorLabels, chartColors)

        slicesContainer.selectAll('path')
        .data(dataReady)
        .enter()
        .append('path')
        .each(function(d){
            select(this).attr(valueClass, d.data.index)
            .attr('data-filterindex', index1)
            .attr('data-col1', col1)
            .attr('data-col2', col2)
            .attr('data-colvalue1', formatData(d.data.key, cols[index1], options))
            .attr('data-colvalue2', formatData(
                d.value, cols[index2],
                options
            ))
            select(this)._groups[0][0].style.fill = color(d.data.key)
        })
        .attr('d', arc)
        .style('fill-opacity', 1)
        .on('mouseover', function() {
            select(this).style('fill-opacity', 0.7)
        })
        .on('mouseout', function() {
            select(this).style('fill-opacity', 1)
        })
        .on('click', function() {
            svg
            .selectAll('path.slice')
            .each(function(data) {
                data._expanded = false
            })
            .transition()
            .duration(500)
            .attr('transform', function(){
                return 'translate(0,0)';
            });

            select(this)
            .transition()
            .duration(500)
            .attr('transform', function(d) {
                if (!d._expanded) {
                    d._expanded = true
                    const a =
                    d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2
                    const x = Math.cos(a) * 10
                    const y = Math.sin(a) * 10
                    return 'translate(' + x + ',' + y + ')'
                } else {
                    d._expanded = false
                    return 'translate(0,0)'
                }
            })
        })
        .attr('class', 'tooltip-2d pie-slice slice')

        var chartCenter = width / 2
        var bbox = pieChartContainer?.node()?.getBBox?.()
        if (bbox) {
            var bboxCenterX = bbox.x + bbox.width / 2
            pieChartContainer.attr('transform', `translate(${chartCenter - bboxCenterX}, 0)`)
        }

        refreshTooltips();
        onUpdate(component)
    }


    // define legend
    var svgLegend = pieChartContainer.append('g')
        .style('fill', 'currentColor')
        .style('fill-opacity', '1')
        .style('font-family', 'inherit')
        .style('font-size', '10px')

    var labels = []

    for(let [key, value] of Object.entries(data)){
        labels.push(
            formatData(
                    key, cols[index1],
                    options) + ": " +
            formatData(
                    value, cols[index2],
                    options
            )
        );
    }

    const legendWrapLength = width / 2 - 50
    var legendScale = getColorScale(labels, chartColors)
    var legendOrdinal = getLegend(legendScale, legendWrapLength, 'vertical');

    svgLegend.call(legendOrdinal)

    let legendBBox
    const legendElement = svgLegend.node()
    if (legendElement) {
        legendBBox = legendElement.getBBox()
    }

    const legendHeight = legendBBox.height
    const legendWidth = legendBBox.width
    const legendXPosition = width / 2 - legendWidth - 10
    const legendYPosition =
      legendHeight < height - 20 ? (height - legendHeight) / 2 : 15

    svgLegend.attr(
        'transform', `translate(${legendXPosition}, ${legendYPosition})`
    )

    legendOrdinal.on('cellclick', function(d) {
        var words = []
        var nodes = d.currentTarget.getElementsByTagName('tspan')
        for (var i = 0; i < nodes.length; i++) {
            words.push(nodes[i].textContent)
        }
        var unformatGroup = legendGroups[words.join(' ')]?.value;
        groups[unformatGroup].isVisible = !groups[unformatGroup].isVisible;
        createSlices();
        const legendCell = select(this);
        legendCell.classed(
            'disable-group', !legendCell.classed('disable-group')
        );
    });


    select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createPieChart(
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

    createSlices()
}

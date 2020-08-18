function createPieChart(component, json, options, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = 20;
    var width = component.parentElement.clientWidth;
    var pieWidth;
    var height;
    var cols = json['data']['columns'];
    var colsEnum = enumerateCols(json);
    var indexList = getIndexesByType(colsEnum);
    var groupableField = getGroupableField(json);
    var notGroupableField = getNotGroupableField(json);
    var xIndexes = [];
    var yIndexes = [];

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
        metadataComponent.metadata = {
            groupBy: {
                index: xIndexes[0].index,
                currentLi: 0,
            },
            series: yIndexes
        }
    }

    var index1 = metadataComponent.metadata.groupBy.index;
    var index2 = metadataComponent.metadata.series[0].index;
    var data = ChataUtils.groupBy(
        json['data']['rows'], row => row[index1], index2
    );

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

    var legendRectSize = 15;
    var legendSpacing = 1;

    // define color scale
    var color = getColorScale(data, options.themeConfig.chartColors)

    var svg = d3.select(component)
    .append('svg')
    .attr('width', width)
    .attr('height', height)


    var pieChartContainer = svg.append('g')
    .attr("transform", "translate(" + (width / 2 + outerRadius) + "," + (height / 2) + ")");

    var arc = getArc(
        innerRadius,
        outerRadius
    )

    var pie = getPie(
        (d) => { return d.value }
    )
    var dataReady = pie(d3.entries(data))

    // creating the chart
    var path = pieChartContainer.selectAll('path')
    .data(dataReady)
    .enter()
    .append('path')
    .each(function(d, i){
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', formatData(d.data.key, cols[index1], options))
        .attr('data-colvalue2', formatData(
            d.value, cols[index2],
            options
        ))
        // ._groups[0][0].style.fill = color(d.data.key)
    })
    .attr('d', arc)
    .style('fill-opacity', 0.85)
    .on('mouseover', function(d) {
        d3.select(this).style('fill-opacity', 1)
    })
    .on('mouseout', function(d) {
        d3.select(this).style('fill-opacity', 0.85)
    })
    .on('click', function(d) {
        svg
        .selectAll('path.slice')
        .each(function(data) {
            data._expanded = false
        })
        .transition()
        .duration(500)
        .attr('transform', function(d){
            return 'translate(0,0)';
        });

        d3.select(this)
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
    tooltipCharts();


    // define legend
    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('fill-opacity', '0.7')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    var labels = []

    for (var i = 0; i < dataReady.length; i++) {
        var d = dataReady[i]
        labels.push(
            formatData(
                    d.data.key, cols[index1],
                    options) + ": " +
            formatData(
                    d.value, cols[index2],
                    options
            )
        );
    }

    const legendWrapLength = width / 2 - 50
    legendScale = getColorScale(labels, options.themeConfig.chartColors)
    // d3.scaleOrdinal()
    //     .domain(labels)
    //     .range(options.themeConfig.chartColors)

    var legendOrdinal = d3.legendColor()
    .shape(
        'path',
        d3.symbol()
        .type(d3.symbolCircle)
        .size(75)()
    )
    .orient('vertical')
    .shapePadding(5)
    .labelWrap(legendWrapLength)
    .scale(legendScale)

    // var legendV = d3.legend.color()
    // .shapeWidth(20)
    // .cells(10)
    // .title("Linear")
    // .labelFormat(d3.format('.0f'))
    // .scale(linearV);

    svgLegend.call(legendOrdinal)

    let legendBBox
    const legendElement = svgLegend.node()
    if (legendElement) {
        legendBBox = legendElement.getBBox()
    }

    const legendHeight = legendBBox.height
    const legendWidth = legendBBox.width
    const legendXPosition = width / 2 - legendWidth
    const legendYPosition =
      legendHeight < height - 20 ? (height - legendHeight) / 2 : 15

    svgLegend
      .attr('transform', `translate(${legendXPosition}, ${legendYPosition})`)


    d3.select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createPieChart(
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

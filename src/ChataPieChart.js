function createPieChart(component, data, options, cols, fromDataMessenger=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = 20;
    var width = component.parentElement.clientWidth;
    var pieWidth;
    var height;
    var col1 = formatColumnName(cols[0]['name']);
    var col2 = formatColumnName(cols[1]['name']);
    if(fromDataMessenger){
        if(DataMessenger.options.placement == 'left' || DataMessenger.options.placement == 'right'){
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
    component.parentElement.classList.add('chata-chart-container');
    component.parentElement.parentElement.classList.add(
        'chata-hidden-scrollbox'
    );

    var legendRectSize = 15;
    var legendSpacing = 1;

    // define color scale
    var color = d3.scaleOrdinal()
    .domain(data)
    .range(options.chartColors)

    var svg = d3.select(component)
    .append('svg')
    .attr('width', width)
    .attr('height', height)


    var pieChartContainer = svg.append('g')
    .attr("transform", "translate(" + (width / 2 + outerRadius) + "," + (height / 2) + ")");

    var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

    var pie = d3.pie()
    .value(function(d) {return d.value; })
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
        .attr('data-colvalue1', formatData(d.data.key, cols[0], options))
        .attr('data-colvalue2', formatData(
            d.value, cols[1],
            options
        ))
    })
    .attr('d', arc)
    .attr('fill', function(d){ return(color(d.data.key)) })
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
                    d.data.key, cols[0],
                    options) + ": " +
            formatData(
                    d.value, cols[1],
                    options
            )
        );
    }

    const legendWrapLength = width / 2 - 50
    legendScale = d3.scaleOrdinal()
        .domain(labels)
        .range(options.chartColors)

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
}

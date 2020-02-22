function createStackedBarChart(component, data, groups, subgroups, cols, options, fromDataMessenger=true, valueClass='data-stackedchartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 30, left: 100},
    width = component.parentElement.clientWidth - margin.left;
    var wLegendBox = 140;
    var chartWidth = width - wLegendBox;
    var height;
    var legendBoxMargin = 15;
    var col1 = formatColumnName(cols[0]['name']);
    var col2 = formatColumnName(cols[1]['name']);
    var col3 = formatColumnName(cols[2]['name']);
    const tickWidth = (width - margin.left - margin.right) / 6
    if(fromDataMessenger){
        if(DataMessenger.options.placement == 'left' || DataMessenger.options.placement == 'right'){
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
    component.parentElement.classList.add('chata-chart-container');
    component.parentElement.parentElement.classList.add(
        'chata-hidden-scrollbox'
    );
    const barHeight = height / groups.length;
    const interval = Math.ceil((groups.length * 16) / height);
    var yTickValues = [];
    if (barHeight < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                yTickValues.push(element);
                // if(element.length < 18){
                // }
            }
        });
    }
    var svg = d3.select(component)
    .append("svg")
    .attr("width", width + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

    svg.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.left + margin.right)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'y-axis-label')
    .text(col2);

    svg.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .attr('class', 'x-axis-label')
    .text(col3);

    var maxValue = d3.max(data, function(d) {
        var sum = 0;
        for (var [key, value] of Object.entries(d)){
            if(key == 'group')continue;
            sum += parseFloat(value);
        }
        return sum;
    });

    var x = d3.scaleLinear()
    .domain([0, maxValue])
    .range([ 0, chartWidth ]);

    if(tickWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).ticks(9).tickSize(1).tickFormat(function(d){
            return formatChartData(d, cols[2], options)}
        ))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickFormat(function(d){
            return formatChartData(d, cols[2], options)}
        ))
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }


    // Add Y axis
    var y = d3.scaleBand()
    .domain(groups)
    .range([height - margin.bottom, 0])
    .padding([0.2])
    var yAxis = d3.axisLeft(y);

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.chartColors)

    svg.append("g")
    .call(yAxis.tickFormat(function(d){
        return formatChartData(d, cols[1], options);
    })).select(".domain").remove();

    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisBottom(x)
        .tickSize(height - margin.bottom)
        .tickFormat("")
    );

    var stackedData = d3.stack()
    .keys(subgroups)
    (data)

    svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", function(d) { return color(d.key) })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .each(function (d, i) {
        var pos = d[1];
        var sum = 0;
        for (var [key, value] of Object.entries(d.data)){
            if(key == 'group')continue;
            sum += parseFloat(value);
            if(sum == pos){
                d.value = value;
                d.labelY = key;
                break;
            }
        }
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-col3', col3)
        .attr('data-colvalue1', d.labelY)
        .attr('data-colvalue2', formatData(
            d.data.group, cols[1], options
        ))
        .attr('data-colvalue3', formatData(
            d.value, cols[2],
            options
        ))
        .attr('data-unformatvalue1', d.labelY)
        .attr('data-unformatvalue2', d.data.group)
        .attr('data-unformatvalue3', d.value)

    })
    .attr('opacity', '0.7')
    .attr('class', 'tooltip-3d stacked-rect')
    .attr("x", function(d) {
        return x(d[0]);
    })
    .attr("y", function(d) { return y(d.data.group) })
    .attr("height", function(d) {
        return y.bandwidth();
    })
    .attr("width",function(d){
        var d1 = d[1];
        if(isNaN(d1)){
            return 0;
        }
        return Math.abs(x(d[0]) - x(d[1]));
    })

    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('fill-opacity', '0.7')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    const legendWrapLength = wLegendBox - 28;
    legendScale = d3.scaleOrdinal()
        .domain(subgroups.sort())
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

    const newX = chartWidth + legendBoxMargin
    svgLegend
      .attr('transform', `translate(${newX}, ${0})`)

    tooltipCharts();
}

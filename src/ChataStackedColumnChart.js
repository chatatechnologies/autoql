function createStackedColumnChart(component, data, groups, subgroups, cols, options, fromDataMessenger=true, valueClass='data-stackedchartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 80},
    width = component.parentElement.clientWidth - margin.left;
    var wLegendBox = 140;
    var chartWidth = width - wLegendBox;
    var height;
    var legendBoxMargin = 15;
    var colStr1 = cols[0]['display_name'] || cols[0]['name'];
    var colStr2 = cols[1]['display_name'] || cols[1]['name'];
    var colStr3 = cols[2]['display_name'] || cols[2]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    var col3 = formatColumnName(colStr3);
    if(fromDataMessenger){
        if(DataMessenger.options.placement == 'left' || DataMessenger.options.placement == 'right'){
            height = component.parentElement.offsetHeight - (margin.top + margin.bottom + 3);
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
    const barWidth = chartWidth / groups.length;
    const interval = Math.ceil((groups.length * 16) / width);
    var xTickValues = [];
    if (barWidth < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                if(element.length < 15){
                    xTickValues.push(element);
                }else{
                    xTickValues.push(element.slice(0, 15)+ '...');
                }
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
    .text(col3);

    svg.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .attr('class', 'x-axis-label')
    .text(col2);


    var x = d3.scaleBand()
    .domain(groups.map(function(element){
        if(element.length < 15){
            return element;
        }else{
            return element.slice(0, 15) + '...';
        }
    }))
    .range([0, chartWidth])
    .padding([0.2]);

    var xAxis = d3.axisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }
    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[1], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[1], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }

    var maxValue = d3.max(data, function(d) {
        var sum = 0;
        for (var [key, value] of Object.entries(d)){
            if(key == 'group')continue;
            sum += parseFloat(value);
        }
        return sum;
    });
    console.log(maxValue);

    var y = d3.scaleLinear()
    .domain([0, maxValue])
    .range([ height - margin.bottom, 0 ]);
    var yAxis = d3.axisLeft(y);

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.themeConfig.chartColors)


    svg.append("g")
    .attr("class", "grid")
    .call(yAxis.tickFormat(function(d){
            return formatChartData(d, cols[2], options)}
        )
        .tickSize(-chartWidth)
    );
    svg.append("g")
    .call(yAxis).select(".domain").remove();
    console.log(subgroups);
    var stackedData = d3.stack()
    .keys(subgroups)
    (data)

    svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", function(d) {
        return color(d.key);
    })
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
        if(d.data.group.length < 15){
            return x(d.data.group);
        }else{
            return x(d.data.group.slice(0,15)+'...');
        }
    })
    .attr("y", function(d) {
        if(isNaN(d[1])){
            return 0;
        }else{
            return Math.abs(y(d[1])) + 0.5;
        }
    })
    .attr("height", function(d) {
        if(isNaN([d[1]])){
            return 0;
        }else{
            return Math.abs(y(d[0]) - y(d[1]) - 0.5);
        }
    })
    .attr("width",x.bandwidth())

    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('fill-opacity', '0.7')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    const legendWrapLength = wLegendBox - 28;
    legendScale = d3.scaleOrdinal()
        .domain(subgroups.sort())
        .range(options.themeConfig.chartColors)

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

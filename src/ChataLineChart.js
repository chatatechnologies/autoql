function createLineChart(component, data, col1, col2, col2Type, hasNegativeValues, options, fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 90},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    console.log(col2Type);
    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
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
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('chata-chart-container');
    const barWidth = width / data.length;
    const interval = Math.ceil((data.length * 16) / width);
    var xTickValues = [];
    if (barWidth < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                if(element.label.length < 18){
                    xTickValues.push(element.label);
                }else{
                    xTickValues.push(element.label.slice(0, 18));
                }
            }
        });
    }
    var svg = d3.select(component)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
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
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'x-axis-label')
    .text(col1);

    var x = d3.scaleBand()
    .domain(data.map(function(d) {
        if(d.label.length < 18){
            return d.label;
        }else{
            return d.label.slice(0, 18);
        }
    }))
    .range([ 0, width]);

    var xAxis = d3.axisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }
    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center")
    }

    minValue = 0;

    if(hasNegativeValues){
        minValue = d3.min(data, function(d) {return d.value});
    }

    // Add Y axis
    var y = d3.scaleLinear()
    .range([ height - (margin.bottom), 0 ])
    .domain([minValue, d3.max(data, function(d) { return d.value; })]);
    var yAxis = d3.axisLeft(y);
    // Add the line
    svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", options.chartColors[0])
    .attr("stroke-width", 1)
    .attr('opacity', '0.7')
    .attr("d", d3.line()
    .x(function(d) {
        if(d.label.length < 18){
            return x(d.label);
        }else{
            return x(d.label.slice(0, 18));
        }
     })
    .y(function(d) { return y(d.value) })
    )
    svg.append("g")
    .attr("class", "grid")
    .call(yAxis.tickFormat(function(d){
        return formatData(d, col2Type, options.languageCode, options.currencyCode, 0)}
    )
    .tickSize(-width)
    );
    svg.append("g").call(yAxis).select(".domain").remove();

    svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', d.label)
        .attr('data-colvalue2',formatData(
            d.value, col2Type,
            options.languageCode,
            options.currencyCode,
            options.currencyDecimals
        ))
    })
    .attr("cx", function(d) {
        if(d.label.length < 18){
            return x(d.label);
        }else{
            return x(d.label.slice(0, 18));
        }
     } )
    .attr("cy", function(d) { return y(d.value) } )
    .attr("r", 3)
    .attr('stroke', options.chartColors[0])
    .attr('stroke-width', '2')
    .attr('stroke-opacity', '0.7')
    .attr("fill", 'white')
    .attr('class', 'tooltip-2d line-dot')

    tooltipCharts();
}

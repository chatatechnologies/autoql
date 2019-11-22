function createStackedBarChart(component, data, groups, subgroups, col1, col2, col3, options, fromChatDrawer=true, valueClass='data-stackedchartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 30, left: 120},
    width = component.parentElement.clientWidth - margin.left;
    var wLegendBox = 180;
    var legspacing = 15;
    var chartWidth = width - wLegendBox;
    var height;
    var legendBoxMargin = 25
    const tickWidth = (width - margin.left - margin.right) / 6
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
        .call(d3.axisBottom(x).tickFormat(function(d){
            return formatData(d, 'DOLLAR_AMT', options.languageCode, options.currencyCode)}
        ))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickFormat(function(d){
            return formatData(d, 'DOLLAR_AMT', options.languageCode, options.currencyCode)}
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

    svg.append("g")
    .call(yAxis);

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.chartColors)

    svg.append("g")
    .call(yAxis).select(".domain").remove();

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
        .attr('data-colvalue2', d.data.group)
        .attr('data-colvalue3', formatData(d.value, 'DOLLAR_AMT', options.languageCode, options.currencyCode))
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

    var legend = svg.selectAll(".legend")
        .data(subgroups.sort())
        .enter()
        .append("g")

    legend.append("circle")
        .attr("fill", color)
        .attr("width", 20)
        .attr("height", 20)
        .attr("cy", function (d, i) {
            return i * legspacing + margin.top;
        })
        .attr('opacity', '0.7')
        .attr("cx", chartWidth + legspacing)
        .attr("r", 5);

    legend.append("text")
        .attr("class", "label")
        .attr('opacity', '0.7')
        .attr("y", function (d, i) {
            return i * legspacing + margin.top + 2;
        })
        .attr("x", chartWidth + legendBoxMargin)
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return subgroups[i];
        })
    tooltipCharts();
}

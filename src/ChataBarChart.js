function createBarChart(component, data, col1, col2, col2Type, hasNegativeValues, options, fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 130},
    width = component.parentElement.clientWidth - margin.left;
    var height;
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
    const barHeight = height / data.length;
    const interval = Math.ceil((data.length * 16) / height);
    var yTickValues = [];
    if (barHeight < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                if(element.label.length < 18){
                    yTickValues.push(element.label);
                }else{
                    yTickValues.push(element.label.slice(0, 18) + '...');
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
    .text(col1);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .attr("class", "x-axis-label")
    .text(col2);

    // Add X axis
    var x = d3.scaleLinear()
    .domain(ChatDrawer.makeBarChartDomain(data, hasNegativeValues))
    .range([ 0, width]);
    var xAxis = d3.axisBottom(x);
    xAxis.tickSize(0);

    xAxis.tickFormat(function(d){
        return formatData(d, col2Type, options.languageCode, options.currencyCode, 0);
    });

    if(tickWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }


    // Y axis
    var y = d3.scaleBand()
    .range([ 0, height - margin.bottom ])
    .domain(data.map(function(d) {
        if(d.label.length < 18){
            return d.label;
        }else{
            return d.label.slice(0, 18) + '...';
        }
    }))
    .padding(.1);

    var yAxis = d3.axisLeft(y);

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    svg.append("g")
    .call(yAxis);

    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisBottom(x)
        .tickSize(height - margin.bottom)
        .tickFormat("")
    );

    //Bars
    svg.selectAll("rect_bar")
    .data(data)
    .enter()
    .append("rect")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', d.label)
        .attr('data-colvalue2', formatData(
            d.value,
            col2Type,
            options.languageCode,
            options.currencyCode,
            options.currencyDecimals
        ))
    })
    .attr("x", function(d) { return x(Math.min(0, d.value)); })
    .attr("y", function(d) {
        if(d.label.length < 18){
            return y(d.label);
        }else{
            return y(d.label.slice(0, 18) + '...');
        }
    })
    .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
    .attr("height", y.bandwidth())
    .attr("fill", options.chartColors[0])
    .attr('fill-opacity', '0.7')
    .attr('class', 'tooltip-2d bar')
    tooltipCharts();
}

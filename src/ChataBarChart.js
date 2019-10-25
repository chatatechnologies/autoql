function createBarChart(component, data, col1, col2, hasNegativeValues, options, fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 130},
    width = component.parentElement.clientWidth - margin.left;
    var height;

    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - (margin.top + margin.bottom + 3);
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

    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        var val = formatData(
            d.value, 'DOLLAR_AMT',
            options.languageCode,
            options.currencyCode
        );
        return `
        <span class='title-tip'>${col1}:</span> <span class="text-tip">${d.label}</span> <br/>
        <span class='title-tip'>${col2}:</span> <span class="text-tip">${val}</span>`;
    })

    svg.call(tip);

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
        return formatData(d, 'DOLLAR_AMT', options.languageCode, options.currencyCode);
    });

    svg.append("g")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("color", '#fff')
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

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
        d3.select(this).attr(valueClass, i);
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
    .attr('class', 'bar')
    .on('mouseover', function(d) {
        if(renderTooltips){
            tip.attr('class', 'd3-tip animate').show(d)
        }

    })
    .on('mouseout', function(d) {
        if(renderTooltips){
            tip.attr('class', 'd3-tip').show(d)
            tip.hide()
        }
    });
}

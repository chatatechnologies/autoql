function createAreaChart(component, json, options, fromChataUtils=true, valueClass='data-stackedchartindex', renderTooltips=true) {
    var margin = {top: 5, right: 10, bottom: 50, left: 80},
    width = component.parentElement.clientWidth - margin.left;
    var wLegendBox = 140;
    var chartWidth = width - wLegendBox;
    var height;
    var legendBoxMargin = 15;
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);

    var groupableIndex1 = groupables[0].indexCol;
    var groupableIndex2 = groupables[1].indexCol;
    var notGroupableIndex = notGroupableField.indexCol;
    var columns = json['data']['columns'];
    var data = cloneObject(json['data']['rows']);
    var groups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex2]
    );
    groups = groups.sort().reverse();
    var subgroups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex1]
    );
    var cols = json['data']['columns'];
    // var data = responseToArrayObjects(json, groups);
    var data = ChataUtils.format3dData(json, groups);
    console.log(data);
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
    .attr('class', 'autoql-vanilla-y-axis-label')
    .text(col3);

    svg.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
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
            return formatChartData(d, cols[groupableIndex2], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[groupableIndex2], options);
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
            return formatChartData(d, cols[notGroupableIndex], options)}
        )
        .tickSize(-chartWidth)
    );
    svg.append("g")
    .call(yAxis).select(".domain").remove();

    // var sumstat = d3.nest()
    // .key(function(d) { return d.group;})
    // .entries(data);

    // console.log(sumstat);
    // console.log(subgroups);
    var stackedData = d3.stack()
    .keys(subgroups)
    .value(function(d, key){
        // if(isNaN())
        var val = parseFloat(d[key]);
        if(isNaN(val)){
            return 0
        }
        return val;
    })
    (data)

    console.log(stackedData);

    svg.selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .style("fill", function(d, i) { return color(d[i].data.group); })
    .attr('opacity', '0.7')
    .attr("d", d3.area()
        .x(function(d, i) { return x(d.data.group); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    )

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

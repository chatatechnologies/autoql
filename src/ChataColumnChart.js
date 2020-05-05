function createColumnChart(component, json, options, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){
    var data = makeGroups(json, options, [], -1);
    const minMaxValues = getMinAndMaxValues(data);
    var margin = {top: 5, right: 10, bottom: 50, left: 90},
    width = component.parentElement.clientWidth - margin.left;
    var height;

    var cols = json['data']['columns'];

    var groupableField = getGroupableField(json);
    var notGroupableField = getNotGroupableField(json);

    var index1 = notGroupableField.indexCol;
    var index2 = groupableField.indexCol;

    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];

    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);

    if(fromChataUtils){
        if(options.placement == 'left' || options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight
            - (margin.top + margin.bottom + 3);
            if(height < 250){
                height = 300;
            }
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight
        - (margin.bottom + margin.top);
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
    component.parentElement.classList.add(
        'autoql-vanilla-chata-chart-container'
    );
    component.parentElement.parentElement.classList.add(
        'chata-hidden-scrollbox'
    );

    const barWidth = width / data.length;
    const interval = Math.ceil((data.length * 16) / width);
    var xTickValues = [];
    if (barWidth < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                xTickValues.push(getLabel(element.label));
            }
        });
    }

    var x0 = d3.scaleBand()
    .rangeRound([0, width]).padding(.1);
    var x1 = d3.scaleBand();
    var y = d3.scaleLinear()
    .range([ height - (margin.bottom), 0 ])

    var xAxis = d3.axisBottom(x0)
    var yAxis = d3.axisLeft(y)

    var labelsNames = data.map(function(d) { return getLabel(d.label); });
    var groupNames = data[0].values.map(function(d) { return d.group; });

    x0.domain(labelsNames);
    x1.domain(groupNames).rangeRound([0, x0.bandwidth()]).padding(.1);
    y.domain([minMaxValues.min, minMaxValues.max]).nice();

    var axisLeft = d3.axisLeft(y);

    var color = d3.scaleOrdinal()
    .range(options.themeConfig.chartColors);


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
    .text(col2);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
    .text(col1);

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

    svg.append("g")
    .attr("class", "grid")
    .call(
        yAxis
        .tickSize(-width)
        .tickFormat(function(d){
            return formatChartData(d, cols[index1], options)}
        )
    )

    var slice = svg.selectAll(".slice")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(" + x0(getLabel(d.label)) + ",0)";
    });

    slice.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, d.index)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', data[d.index].label)
        .attr('data-colvalue2', formatData(
            d.value, cols[index1],
            options
        ))
    })
    .attr("width", x1.bandwidth())
    .attr("x", function(d) { return x1(d.group); })
    .style("fill", function(d) { return color(d.group) })
    .attr('fill-opacity', '0.7')
    .attr('class', 'tooltip-2d bar')
    .attr("y", function(d) { return y(Math.max(0, d.value)); })
    .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })

    // slice.selectAll("rect")
    // .transition()
    // .delay(function (d) {return Math.random()*1000;})
    // .duration(1000)
    // .attr("y", function(d) { return y(d.value); })
    // .attr("height", function(d) { return height - y(d.value); });

    // var svg = d3.select(component)
    // .append("svg")
    // .attr("width", width + margin.left)
    // .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    // .attr("transform",
    // "translate(" + margin.left + "," + margin.top + ")");
    //
    // svg.append('text')
    // .attr('x', -(height / 2))
    // .attr('y', -margin.left + margin.right)
    // .attr('transform', 'rotate(-90)')
    // .attr('text-anchor', 'middle')
    // .attr('class', 'autoql-vanilla-y-axis-label')
    // .text(col2);
    //
    // svg.append('text')
    // .attr('x', width / 2)
    // .attr('y', height + margin.bottom - 3)
    // .attr('text-anchor', 'middle')
    // .attr('class', 'autoql-vanilla-x-axis-label')
    // .text(col1);
    //
    // minValue = 0;
    //
    // if(hasNegativeValues){
    //     minValue = d3.min(data, function(d) {return d.value});
    // }
    // // Y axis
    // var y = d3.scaleLinear()
    // .range([ height - (margin.bottom), 0 ])
    // .domain([minValue, d3.max(data, function(d) { return d.value; })]).nice();
    // var axisLeft = d3.axisLeft(y);
    //
    // svg.append("g")
    // .attr("class", "grid")
    // .call(
    //     axisLeft
    //     .tickSize(-width)
    //     .tickFormat(function(d){return formatChartData(d, cols[index1], options)})
    // );
    //
    //
    // var x = d3.scaleBand()
    // .domain(data.map(function(d) {
    //     if(d.label.length < 18){
    //         return d.label;
    //     }else{
    //         return d.label.slice(0, 18);
    //     }
    // }))
    // .range([ 0, width]).padding(0.1);
    //
    // var xAxis = d3.axisBottom(x);
    //
    // if(xTickValues.length > 0){
    //     xAxis.tickValues(xTickValues);
    // }
    //
    // if(barWidth < 135){
    //     svg.append("g")
    //     .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    //     .call(xAxis)
    //     .selectAll("text")
    //     .style("color", '#fff')
    //     .attr("transform", "translate(-10,0)rotate(-45)")
    //     .style("text-anchor", "end")
    // }else{
    //     svg.append("g")
    //     .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    //     .call(xAxis)
    //     .selectAll("text")
    //     .style("color", '#fff')
    //     .style("text-anchor", "center")
    // }
    //
    //
    // //Bars
    // svg.selectAll("rect")
    // .data(data)
    // .enter()
    // .append("rect")
    // .each(function (d, i) {
    //     d3.select(this).attr(valueClass, i)
    //     .attr('data-col1', col1)
    //     .attr('data-col2', col2)
    //     .attr('data-colvalue1', d.label)
    //     .attr('data-colvalue2', formatData(
    //         d.value, cols[index1],
    //         options
    //     ))
    // })
    // .attr("x", function(d) {
    //     if(d.label.length < 18){
    //         return x(d.label);
    //     }else{
    //         return x(d.label.slice(0, 18));
    //     }
    // } )
    // .attr("y", function(d) { return y(Math.max(0, d.value)); })
    // .attr("width", x.bandwidth() )
    // .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })
    // .attr("fill", options.themeConfig.chartColors[0])
    // .attr('fill-opacity', '0.7')
    // .attr('class', 'tooltip-2d bar')
    tooltipCharts();
}

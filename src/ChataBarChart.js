function createBarChart(component, json, options, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var data = makeGroups(json, options, [], -1);
    const minMaxValues = getMinAndMaxValues(data);
    var margin = {top: 5, right: 10, bottom: 50, left: 130},
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
    const tickWidth = (width - margin.left - margin.right) / 6
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
        height = component.parentElement.offsetHeight - (margin.bottom + margin.top);
    }
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
    const barHeight = height / data.length;
    const interval = Math.ceil((data.length * 16) / height);
    var yTickValues = [];
    if (barHeight < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                yTickValues.push(getLabel(element.label));
            }
        });
    }

    var y0 = d3.scaleBand()
    .rangeRound([0, height]).padding(.1);

    var y1 = d3.scaleBand();

    var x = d3.scaleLinear()
    .range([0, width]).nice();

    var xAxis = d3.axisBottom(x)
    .tickSize(0)

    var yAxis = d3.axisLeft(y0)

    var color = d3.scaleOrdinal()
    .range(options.themeConfig.chartColors);

    var categoriesNames = data.map(function(d) { return getLabel(d.label); });
    var groupNames = data[0].values.map(function(d) { return d.group; });

    y0.domain(categoriesNames);
    y1.domain(groupNames).rangeRound([0, y0.bandwidth()]).padding(.1);
    x.domain([minMaxValues.min, minMaxValues.max]);

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
    .text(col1);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .attr("class", "autoql-vanilla-x-axis-label")
    .text(col2);

    if(tickWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }

    svg.append("g")
        .attr("class", "grid")
        .call(xAxis
            .tickSize(height)
            .tickFormat("")
        );

    svg.append("g")
    .attr("class", "y axis")
    .style('opacity','1')
    .call(yAxis)

    var slice = svg.selectAll(".slice")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(0,"+ y0(getLabel(d.label)) +")";
    });

    slice.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', data[d.index].label)
        .attr('data-colvalue2', formatData(
            d.value,
            cols[index1],
            options
        ))
    })
    .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
    .attr("x", function(d) { return x(Math.min(0, d.value)); })
    .attr("y", function(d) { return y1(d.group); })
    .attr("height", function(d) { return y1.bandwidth() })
    .attr('fill-opacity', '0.7')
    .attr('class', 'tooltip-2d bar')
    .style("fill", function(d) { return color(d.group) })


    // // Add X axis
    // var x = d3.scaleLinear()
    // .domain(ChataUtils.makeBarChartDomain(data, hasNegativeValues))
    // .range([ 0, width]).nice();
    // var xAxis = d3.axisBottom(x);
    // xAxis.tickSize(0);
    //
    // xAxis.tickFormat(function(d){
    //     return formatChartData(d, cols[index1], options);
    // });
    //
    // if(tickWidth < 135){
    //     svg.append("g")
    //     .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    //     .call(xAxis)
    //     .selectAll("text")
    //     .style("color", '#fff')
    //     .attr("transform", "translate(-10,0)rotate(-45)")
    //     .style("text-anchor", "end");
    // }else{
    //     svg.append("g")
    //     .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    //     .call(xAxis)
    //     .selectAll("text")
    //     .style("color", '#fff')
    //     .style("text-anchor", "center");
    // }
    //
    //
    // // Y axis
    // var y = d3.scaleBand()
    // .range([ 0, height - margin.bottom ])
    // .domain(data.map(function(d) {
    //     if(d.label.length < 18){
    //         return d.label;
    //     }else{
    //         return d.label.slice(0, 18) + '...';
    //     }
    // }))
    // .padding(.1);
    //
    // var yAxis = d3.axisLeft(y);
    //
    // if(yTickValues.length > 0){
    //     yAxis.tickValues(yTickValues);
    // }
    //
    // svg.append("g")
    // .call(yAxis);
    //
    // svg.append("g")
    // .attr("class", "grid")
    // .call(d3.axisBottom(x)
    //     .tickSize(height - margin.bottom)
    //     .tickFormat("")
    // );
    //
    // //Bars
    // svg.selectAll("rect_bar")
    // .data(data)
    // .enter()
    // .append("rect")
    // .each(function (d, i) {
    //     d3.select(this).attr(valueClass, i)
    //     .attr('data-col1', col1)
    //     .attr('data-col2', col2)
    //     .attr('data-colvalue1', d.label)
    //     .attr('data-colvalue2', formatData(
    //         d.value,
    //         cols[index1],
    //         options
    //     ))
    // })
    // .attr("x", function(d) { return x(Math.min(0, d.value)); })
    // .attr("y", function(d) {
    //     if(d.label.length < 18){
    //         return y(d.label);
    //     }else{
    //         return y(d.label.slice(0, 18) + '...');
    //     }
    // })
    // .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
    // .attr("height", y.bandwidth())
    // .attr("fill", options.themeConfig.chartColors[0])
    // .attr('fill-opacity', '0.7')
    // .attr('class', 'tooltip-2d bar')
    tooltipCharts();

}

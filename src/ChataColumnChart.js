function createColumnChart(component, json, options, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){

    var margin = {top: 5, right: 10, bottom: 50, left: 90},
    width = component.parentElement.clientWidth - margin.left;
    var height;

    var values = formatDataToBarChart(json, options);
    var data = values[0];
    var hasNegativeValues = values[1];
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
    var x0 = d3.scaleBand()
    .rangeRound([0, width]).padding(.1);

    var x1 = d3.scaleBand();

    var y = d3.scaleLinear()
    .range([height, 0]);

    var xAxis = d3.axisBottom(x0)
    .tickSize(0)

    var yAxis = d3.axisLeft(y)

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

    var data = [
        {
            "label": "Student",
            "values": [
                {
                    "value": 0,
                    "rate": "Not at all"
                },
                {
                    "value": 4,
                    "rate": "Not very much"
                },
                {
                    "value": 12,
                    "rate": "Medium"
                },
                {
                    "value": 6,
                    "rate": "Very much"
                },
                {
                    "value": 0,
                    "rate": "Tremendously"
                }
            ]
        },
        {
            "label": "Liberal Profession",
            "values": [
                {
                    "value": 1,
                    "rate": "Not at all"
                },
                {
                    "value": 21,
                    "rate": "Not very much"
                },
                {
                    "value": 13,
                    "rate": "Medium"
                },
                {
                    "value": 18,
                    "rate": "Very much"
                },
                {
                    "value": 6,
                    "rate": "Tremendously"
                }
            ]
        },
        {
            "label": "Salaried Staff",
            "values": [
            {
                "value": 3,
                "rate": "Not at all"
            },
            {
                "value": 22,
                "rate": "Not very much"
            },
            {
                "value": 6,
                "rate": "Medium"
            },
            {
                "value": 15,
                "rate": "Very much"
            },
            {
                "value": 3,
                "rate": "Tremendously"
            }
            ]
        },
        {
            "label": "Employee",
            "values": [
            {
                "value": 12,
                "rate": "Not at all"
            },
            {
                "value": 7,
                "rate": "Not very much"
            },
            {
                "value": 18,
                "rate": "Medium"
            },
            {
                "value": 13,
                "rate": "Very much"
            },
            {
                "value": 6,
                "rate": "Tremendously"
            }
            ]
        },
        {
            "label": "Craftsman",
            "values": [
            {
                "value": 6,
                "rate": "Not at all"
            },
            {
                "value": 15,
                "rate": "Not very much"
            },
            {
                "value": 9,
                "rate": "Medium"
            },
            {
                "value": 12,
                "rate": "Very much"
            },
            {
                "value": 3,
                "rate": "Tremendously"
            }
            ]
        },
        {
            "label": "Inactive",
            "values": [
            {
                "value": 6,
                "rate": "Not at all"
            },
            {
                "value": 6,
                "rate": "Not very much"
            },
            {
                "value": 6,
                "rate": "Medium"
            },
            {
                "value": 2,
                "rate": "Very much"
            },
            {
                "value": 3,
                "rate": "Tremendously"
            }
            ]
        }
        ]

    var labelsNames = data.map(function(d) { return d.label; });
    var rateNames = data[0].values.map(function(d) { return d.rate; });

    x0.domain(labelsNames);
    x1.domain(rateNames).rangeRound([0, x0.bandwidth()]).padding(.1);
    y.domain([0, d3.max(data, function(label) { return d3.max(label.values, function(d) { return d.value; }); })]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "grid")
    .call(
        yAxis
        .tickSize(-width)
        // .tickFormat(function(d){return formatChartData(d, cols[index1], options)})
    )
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style('font-weight','bold')
    .text("Value");

    var slice = svg.selectAll(".slice")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(" + x0(d.label) + ",0)";
    });

    slice.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    .attr("width", x1.bandwidth())
    .attr("x", function(d) { return x1(d.rate); })
    .style("fill", function(d) { return color(d.rate) })
    .attr("y", function(d) { return y(0); })
    .attr("height", function(d) { return height - y(0); })
    .on("mouseover", function(d) {
        d3.select(this).style("fill", d3.rgb(color(d.rate)).darker(2));
    })
    .on("mouseout", function(d) {
        d3.select(this).style("fill", color(d.rate));
    });

    slice.selectAll("rect")
    .transition()
    .delay(function (d) {return Math.random()*1000;})
    .duration(1000)
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); });
    // const barWidth = width / data.length;
    // const interval = Math.ceil((data.length * 16) / width);
    // var xTickValues = [];
    // if (barWidth < 16) {
    //     data.forEach((element, index) => {
    //         if (index % interval === 0) {
    //             if(element.label.length < 18){
    //                 xTickValues.push(element.label);
    //             }else{
    //                 xTickValues.push(element.label.slice(0, 18));
    //             }
    //         }
    //     });
    // }
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

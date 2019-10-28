function createGroupedLineChart(component, groups, data, col1, col2, col3, options, fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 140, left: 80},
    width = component.parentElement.clientWidth - margin.left;
    var hLegendBox = 100;
    var legspacing = 15;
    var chartWidth = width;
    var height;
    var legendBoxMargin = 25;
    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - (margin.top + margin.bottom + 3);
            height -= hLegendBox;
        }else{
            height = 180;
        }
    }else{
        height = component.parentElement.offsetHeight - (margin.bottom + margin.top);
    }
    component.innerHTML = '';
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('chata-chart-container');
    var subgroups = ['value1', 'value2'];
    const barWidth = chartWidth / groups.length;
    const interval = Math.ceil((groups.length * 16) / width);
    var xTickValues = [];
    if (barWidth < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                if(element.length < 18){
                    xTickValues.push(element);
                }else{
                    xTickValues.push(element);
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
    .text(col2);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + 110)
    .attr('text-anchor', 'middle')
    .attr('class', 'x-axis-label')
    .text(col1);


    var dataReady = subgroups.map( function(grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function(d) {
                return {group: d.group, value: +d[grpName]};
            })
        };
    });

    console.log(dataReady);

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.chartColors)


    var x = d3.scaleBand()
    .domain(groups.map(function(d) {
        if(d < 18){
            return d;
        }else{
            return d;
        }
    }))
    .range([0, width])
    .padding([0.2]);

    var xAxis = d3.axisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }

    svg.append("g")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("color", '#fff')
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Add Y axis
    var maxValue = d3.max(data, function(d) {
        var sum = 0;
        return Math.max(d['value1'], d['value2']);
    });

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, maxValue])
    .range([ height, 0 ]);
    var axisLeft = d3.axisLeft(y);

    svg.append("g")
    .attr("class", "grid")
    .call(
        axisLeft
        .tickSize(-width)
        .tickFormat(function(d){return formatData(d, 'DOLLAR_AMT', options.languageCode, options.currencyCode)})
    );

    // Add the lines
    var line = d3.line()
    .x(function(d) { return x(d.group) })
    .y(function(d) { return y(+d.value) })
    svg.selectAll("myLines")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("d", function(d){
        console.log(d.values);
        return line(d.values)
    })
    .attr("stroke", function(d){ return color(d.name) })
    .style("stroke-width", 1)
    .style("fill", "none")
    .attr('opacity', '0.7')

    // Add the points
    svg
    // First we need to enter in a group
    .selectAll("myDots")
    .data(dataReady)
    .enter()
    .append('g')
    .style("fill", function(d){ return color(d.name) })
    // Second we need to enter in the 'values' part of this group
    .selectAll("myPoints")
    .data(function(d){ return d.values })
    .enter()
    .append("circle")
    .attr("cx", function(d) { return x(d.group) } )
    .attr("cy", function(d) { return y(d.value) } )
    .attr("r", 3)

    var nodeWidth = (d) => d.getBBox().width;

    const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(0,0)');

    const lg = legend.selectAll('g')
    .data(subgroups.sort())
    .enter()
    .append('g')
    .attr('transform', (d,i) => `translate(${i * 100},${height + 15})`);

    lg.append('circle')
    .style('fill', color)
    .attr('cx', 9)
    .attr('cy', 5)
    .attr('r', 4)

    lg.append('text')
    .style('font-size', '10px')
    .attr('opacity', '.7')
    .attr('x', 17.5)
    .attr('y', 10)
    .text(function(d, i){
        if(i == 0)return col2;
        else if(i == 1)return col3;
    });

    let offset = 0;
    lg.attr('transform', function(d, i) {
        let x = offset;
        offset += nodeWidth(this) + 10;
        return `translate(${x},${height + 25 + hLegendBox})`;
    });

    legend.attr('transform', function() {
        return `translate(${(width - nodeWidth(this)) / 2},${0})`
    });


}

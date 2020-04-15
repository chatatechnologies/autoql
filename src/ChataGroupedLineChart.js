function createGroupedLineChart(component, groups, data, cols, options, fromDataMessenger=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 140, left: 80},
    width = component.parentElement.clientWidth - margin.left;
    var hLegendBox = 100;
    var legspacing = 15;
    var chartWidth = width;
    var height;
    var legendBoxMargin = 25;
    var colStr1 = cols[0]['display_name'] || cols[0]['name'];
    var colStr2 = cols[1]['display_name'] || cols[1]['name'];
    var colStr3 = cols[2]['display_name'] || cols[2]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    var col3 = formatColumnName(colStr3);
    if(fromDataMessenger){
        if(DataMessenger.options.placement == 'left' || DataMessenger.options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - (margin.top + margin.bottom + 6);
            if(height < 250){
                height = 300;
            }
            // height -= hLegendBox;
        }else{
            height = 180;
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
    .attr('class', 'autoql-vanilla-y-axis-label')
    .text(col2);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + 110)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
    .text(col1);


    var dataReady = subgroups.map( function(grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function(d) {
                return {group: d.group, value: +d[grpName]};
            })
        };
    });

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.themeConfig.chartColors)


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

    if(barWidth < 135){
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

    // Add Y axis
    var maxValue = d3.max(data, function(d) {
        var sum = 0;
        return Math.max(d['value1'], d['value2']);
    });

    var minValue = d3.min(data, function(d) {
        var sum = 0;
        return Math.min(d['value1'], d['value2']);
    });

    if(minValue > 0){
        minValue = 0;
    }

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([ height, 0 ]);
    var axisLeft = d3.axisLeft(y);

    svg.append("g")
    .attr("class", "grid")
    .call(
        axisLeft
        .tickSize(-width)
        .tickFormat(function(d){return formatChartData(d, cols[1], options)})
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
    .data(function(d){
        for (var i = 0; i < d.values.length; i++) {
            d.values[i].name = d.name;
        }
        return d.values;
    })
    .enter()
    .append("circle")
    .each(function (d, i) {
        var nameCol2 = d.key == 'value1' ? col2 : col3;
        d3.select(this)
        .attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', nameCol2)
        .attr('data-colvalue1', d.group)
        .attr('data-colvalue2', formatData(
            d.value, cols[1],
            options
        ))
    })
    .attr('class', 'tooltip-2d line-dot')
    .attr("cx", function(d) { return x(d.group) } )
    .attr("cy", function(d) { return y(d.value) } )
    .attr("r", 3)
    .attr('stroke', function(d) { return color(d.name)} )
    .attr('stroke-width', '2')
    .attr('stroke-opacity', '0.7')
    .attr("fill", 'white')
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

    tooltipCharts();

}

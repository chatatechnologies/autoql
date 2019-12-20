function createGroupedBarChart(component, groups, data, cols, options, fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 140, left: 130},
    width = component.parentElement.clientWidth - margin.left;
    var hLegendBox = 100;
    var legspacing = 15;
    var chartWidth = width;
    var height;
    var legendBoxMargin = 25;
    var col1 = formatColumnName(cols[0]['name']);
    var col2 = formatColumnName(cols[1]['name']);
    var col3 = formatColumnName(cols[2]['name']);
    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
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
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('chata-chart-container');
    var subgroups = ['value1', 'value2'];
    const barHeight = height / groups.length;
    const interval = Math.ceil((groups.length * 16) / height);
    var yTickValues = [];
    if (barHeight < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                if(element.length < 18){
                    yTickValues.push(element);
                }else{
                    yTickValues.push(element.slice(0, 18));
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

    var maxValue = d3.max(data, function(d) {
        return Math.max(d['value1'], d['value2']);
    });

    var x = d3.scaleLinear()
    .domain([0, maxValue])
    .range([0, width]);
    var xAxis = d3.axisBottom(x);
    xAxis.tickSize(0);

    xAxis.tickFormat(function(d){
        return formatChartData(d, cols[1], options);
    });
    svg.append("g")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("color", '#fff')
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");


    // Add Y axis
    var y = d3.scaleBand()
    .domain(
        groups.map(function(d) {
            if(d < 18){
                return d;
            }else{
                return d.slice(0, 18);
            }
        })
    )
    .range([ 0, height ])
    .padding([0.02]);
    var axisLeft = d3.axisLeft(y);

    if(yTickValues.length > 0){
        axisLeft.tickValues(yTickValues);
    }


    svg.append("g")
    .call(axisLeft);

    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisBottom(x)
        .tickSize(height)
        .tickFormat("")
    );

    var xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, y.bandwidth()])
    .padding([0.01])

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.chartColors)

    // Show the bars
    svg.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function(d) {
        if(d.group < 18){
            return "translate(0,"+ y(d.group) +")";
        }else{
            return "translate(0,"+ y(d.group.slice(0, 18)) +")";
        }
    })
    .selectAll("rect")
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key], group: d.group};  }); })
    .enter().append("rect")
    .each(function (d, i) {
        var nameCol2 = d.key == 'value1' ? col2 : col3;
        d3.select(this)
        .attr('data-col1', col1)
        .attr('data-col2', nameCol2)
        .attr('data-colvalue1', d.group)
        .attr('data-colvalue2', formatData(
            d.value, cols[1],
            options
        ));
    })
    .attr('class', 'tooltip-2d bar')
    .attr("x", function(d) { return x(Math.min(0, d.value)); })
    .attr("y", function(d) { return xSubgroup(d.key); })
    .attr("width", function(d) {return Math.abs(x(d.value) - x(0));})
    .attr("height", xSubgroup.bandwidth() )
    .attr("fill", function(d) { return color(d.key); })
    .attr('fill-opacity', '0.7');
    //
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

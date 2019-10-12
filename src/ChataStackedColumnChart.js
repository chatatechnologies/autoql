function createStackedColumnChart(component, data, groups, subgroups, col1, col2, fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 40, left: 110},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
            height = 600;
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.clientHeight;
    }
    component.innerHTML = '';
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('chata-chart-container');

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
    .attr('class', 'x-axis-label')
    .text(col2);

    var x = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding([0.2])
    svg.append("g")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .style("color", '#fff')
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    var y = d3.scaleLinear()
    .domain([0, 200000])
    .range([ height - margin.bottom, 0 ]);
    svg.append("g")
    .call(d3.axisLeft(y));

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#355C7D','#6C5B7B','#C06C84', '#F67280', '#F8B195'])

    svg.append("g")
    .call(d3.axisLeft(y)).select(".domain").remove();

    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
    );

    var stackedData = d3.stack()
    .keys(subgroups)
    (data)

    svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", function(d) { return color(d.key); })
    .attr('opacity', '0.7')
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("x", function(d) { return x(d.data.group); })
    .attr("y", function(d) {
        if(isNaN(d[1])){
            return 0;
        }else{
            return Math.abs(y(d[1])) + 0.5;
        }
    })
    .attr("height", function(d) {
        if(isNaN([d[1]])){
            return 0;
        }else{
            return Math.abs(y(d[0]) - y(d[1]) - 0.5);
        }
    })
    .attr("width",x.bandwidth())

}

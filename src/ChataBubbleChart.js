function createBubbleChart(component, labelsX, labelsY, data, col1, col2, col3, fillColor='#28a8e0', fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 130},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
            height = 600;
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight - (margin.bottom + margin.top);
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


    const barWidth = width / labelsX.length;
    const barHeight = height / labelsY.length;

    const intervalWidth = Math.ceil((labelsX.length * 16) / width);
    const intervalHeight = Math.ceil((labelsY.length * 16) / height);

    var xTickValues = [];
    var yTickValues = [];
    if (barWidth < 16) {
        labelsX.forEach((element, index) => {
            if (index % intervalWidth === 0) {
                if(element.length < 18){
                    xTickValues.push(element);
                }else{
                    xTickValues.push(element.slice(0, 18));
                }
            }
        });
    }

    if(barHeight < 16){
        labelsY.forEach((element, index) => {
            if (index % intervalHeight === 0) {
                if(element.length < 18){
                    yTickValues.push(element);
                }else{
                    yTickValues.push(element.slice(0, 18));
                }
            }
        });
    }

    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return `
        <span class='title-tip'>${col2}:</span> <span class="text-tip">${d.labelX}</span> <br/>
        <span class='title-tip'>${col1}:</span> <span class="text-tip">${d.labelY}</span> <br/>
        <span class='title-tip'>${col3}:</span> <span class="text-tip">${d.value}</span>`;
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
    .attr('class', 'x-axis-label')
    .text(col2);


    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(labelsX.map(function(d) {
        if(d.length < 18){
            return d;
        }else{
            return d.slice(0, 18);
        }
    }))
    .padding(0.01);

    var xAxis = d3.axisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }

    svg.append("g")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("color", '#fff')
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");


    var y = d3.scaleBand()
    .range([ height - margin.bottom, 0])
    .domain(labelsY.map(function(d) {
        if(d.length < 18){
            return d;
        }else{
            return d.slice(0, 18);
        }
    }))
    .padding(0.01);

    var yAxis = d3.axisLeft(y);

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    svg.append("g")
    .call(yAxis);

    var radiusScale = d3.scaleLinear()
    .range([0, 2 * Math.min(x.bandwidth(), y.bandwidth())])
    .domain([0, d3.max(data, function(d) { return d.value; })]);

    svg.selectAll()
    .data(data, function(d) {
        var xLabel = '';
        var yLabel = '';

        if(d.labelX.length < 18){
            xLabel = d.labelX;
        }else{
            xLabel = d.labelX.slice(0, 18);
        }

        if(d.labelY.length < 18){
            yLabel = d.labelY;
        }else{
            yLabel = d.labelY.slice(0, 18);
        }
        return xLabel+':'+yLabel;
    })
    .enter()
    .append("circle")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i);
    })
    .attr("cx", function (d) {
        if(d.labelX.length < 18){
            return x(d.labelX) + x.bandwidth() / 2;
        }else{
            return x(d.labelX.slice(0, 18)) + x.bandwidth() / 2;
        }
    })
    .attr("cy", function (d) {
        if(d.labelY.length < 18){
            return y(d.labelY) + y.bandwidth() / 2;
        }else{
            return y(d.labelY.slice(0, 18)) + y.bandwidth() / 2;
        }
    })
    .attr("r", function (d) { return d.value < 0 ? 0 : radiusScale(d.value); })
    .attr("fill", fillColor)
    .attr("opacity", "0.7")
    .attr('class', 'circle')
    .on('mouseover', function(d) {
        if(renderTooltips){
            tip.attr('class', 'd3-tip animate').show(d);
        }
    })
    .on('mouseout', function(d) {
        if(renderTooltips){
            tip.attr('class', 'd3-tip').show(d);
            tip.hide();
        }
    });
}

function createHeatmap(component, labelsX, labelsY, data, cols, options, fromDataMessenger=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 130},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    var colStr1 = cols[0]['display_name'] || cols[0]['name'];
    var colStr2 = cols[1]['display_name'] || cols[1]['name'];
    var colStr3 = cols[2]['display_name'] || cols[2]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    var col3 = formatColumnName(colStr3);
    if(fromDataMessenger){
        if(DataMessenger.options.placement == 'left' || DataMessenger.options.placement == 'right'){
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
    component.parentElement.classList.add('chata-chart-container');
    component.parentElement.parentElement.classList.add(
        'chata-hidden-scrollbox'
    );

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

    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }


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

    var colorScale = d3.scaleLinear()
    .range([0, 1])
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
    .append("rect")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-col3', col3)
        .attr('data-colvalue1', d.labelY)
        .attr('data-colvalue2', d.labelX)
        .attr('data-colvalue3', formatData(
            d.value, cols[2],
            options
        ))
    })
    .attr("x", function(d) {
        if(d.labelX.length < 18){
            return x(d.labelX);
        }else{
            return x(d.labelX.slice(0, 18));
        }
    })
    .attr("y", function(d) {
        if(d.labelY.length < 18){
            return y(d.labelY);
        }else{
            return y(d.labelY.slice(0, 18));
        }
    })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", options.themeConfig.chartColors[0])
    .attr('opacity', function(d) { return colorScale(Math.abs(d.value))})
    .attr('class', 'tooltip-3d square')

    tooltipCharts();
}

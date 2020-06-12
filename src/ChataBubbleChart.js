function createBubbleChart(component, json, options, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 130},
    width = component.parentElement.clientWidth - margin.left;

    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);
    var groupableIndex1 = groupables[0].indexCol;
    var groupableIndex2 = groupables[1].indexCol;
    var notGroupableIndex = notGroupableField.indexCol;

    var data = formatDataToHeatmap(json, options);
    var labelsX = ChataUtils.getUniqueValues(data, row => row.unformatX);
    var labelsY = ChataUtils.getUniqueValues(data, row => row.unformatY);
    var cols = json['data']['columns'];

    labelsY = formatLabels(
        labelsY, cols[groupableIndex1], options
    );
    labelsX = formatLabels(
        labelsX, cols[groupableIndex2], options
    );


    var height;
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
                xTickValues.push(getLabel(element));
            }
        });
    }

    if(barHeight < 16){
        labelsY.forEach((element, index) => {
            if (index % intervalHeight === 0) {
                yTickValues.push(getLabel(element));
            }
        });
    }


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
    .attr('class', 'autoql-vanilla-x-axis-label')
    .text(col2);


    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(labelsX.map(function(d) {
        return getLabel(d)
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
        return getLabel(d)
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

        xLabel = getLabel(d.labelX);
        yLabel = getLabel(d.labelY);
        return xLabel+':'+yLabel;
    })
    .enter()
    .append("circle")
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
    .attr("cx", function (d) {
        return x(getLabel(d.labelX)) + x.bandwidth() / 2;
    })
    .attr("cy", function (d) {
        return y(getLabel(d.labelY)) + y.bandwidth() / 2;
    })
    .attr("r", function (d) { return d.value < 0 ? 0 : radiusScale(d.value); })
    .attr("fill", options.themeConfig.chartColors[0])
    .attr("opacity", "0.7")
    .attr('class', 'tooltip-3d circle')
    tooltipCharts();

    d3.select(window).on(
        "resize." + component.dataset.componentid, () => {
            createBubbleChart(
                component,
                json,
                options,
                fromChataUtils,
                valueClass,
                renderTooltips
            )
        }
    );
}

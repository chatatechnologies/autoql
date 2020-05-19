function createLineChart(component, json, options, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 90, marginLabel: 40},
    width = component.parentElement.clientWidth - margin.left;
    var height;

    var cols = json['data']['columns'];

    var groupableField = getGroupableField(json);
    var notGroupableField = getNotGroupableField(json);
    var groupables = getGroupables(json);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];

    console.log(groupables);

    if(indexList['STRING']){
        xIndexes.push(...indexList['STRING'])
    }

    if(indexList['DATE']){
        xIndexes.push(...indexList['DATE'])
    }

    if(indexList['DATE_STRING']){
        xIndexes.push(...indexList['DATE_STRING'])
    }

    console.log(yIndexes);

    if(!indexList['DOLLAR_AMT']){
        yIndexes = indexList['DOLLAR_AMT'];
    }else if(indexList['QUANTITY']){
        yIndexes = indexList['QUANTITY'];
    }

    console.log(xIndexes);
    console.log(yIndexes);

    var data = makeGroups(json, options, yIndexes, xIndexes[0].index);
    const minMaxValues = getMinAndMaxValues(data);
    var index1 = yIndexes[0].index;
    var index2 = xIndexes[0].index;


    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);

    var labelsNames = data.map(function(d) { return d.label; });
    var allGroup = data[0].values.map(function(d) { return d.group; });
    var hasLegend = allGroup.length > 1;
    if(hasLegend){
        margin.bottom = 70;
        margin.marginLabel = 10;
    }
    var allData = [];
    var colorScale = d3.scaleOrdinal()
    .domain(allGroup)
    .range(options.themeConfig.chartColors);

    data.map(function(d) {
        d.values.map(function(v){
            v.label = d.label
            allData.push(v)
        })
    })
    var grouped = groupBy(allData, 'group');
    var dataReady = allGroup.map( function(grpName) {
        return {
            name: grpName,
            values: grouped[grpName]
        };
    });

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
    var svg = d3.select(component)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

    var labelXContainer = svg.append('g');
    var labelYContainer = svg.append('g');

    // Y AXIS
    var textContainerY = labelYContainer.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.left + margin.right)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    textContainerY.append('tspan')
    .text(col2)

    if(hasLegend){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
    }


    // X AXIS
    var textContainerX = labelXContainer.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.marginLabel + 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

    textContainerX.append('tspan')
    .text(col1);

    if(yIndexes.length > 0){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')

        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const yWidthRect = getStringWidth(col1) + paddingRect;
        const _x = (width / 2) - (yWidthRect/2) - (paddingRect/2);
        const _y = height - (margin.marginLabel/2) + 3;
        labelXContainer.append('rect')
        .attr('x', _x)
        .attr('y', _y)
        .attr('height', 24)
        .attr('width', yWidthRect + paddingRect)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('class', 'autoql-vanilla-x-axis-label-border')

        labelXContainer.on('mouseup', (evt) => {
            var popoverSelector = new PopoverChartSelector({
                left: d3.event.clientX + 'px',
                top: d3.event.clientY + 'px'
            }, xIndexes);
            // console.log(d3.mouse(this)[0]);
        })
    }


    var x = d3.scaleBand()
    .domain(data.map(function(d) {
        return getLabel(d.label)
    }))
    .range([ 0, width]);

    var xAxis = d3.axisBottom(x);
    const xShift = x.bandwidth() / 2;

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

    var y = d3.scaleLinear()
    .domain([minMaxValues.min, minMaxValues.max])
    .range([ height - margin.bottom, 0 ]).nice();
    var yAxis = d3.axisLeft(y);

    svg.append("g")
    .attr("class", "grid")
    .call(yAxis.tickFormat(function(d){
        return formatChartData(d, cols[index1], options)}
    )
    .tickSize(-width)
    );
    svg.append("g").call(yAxis).select(".domain").remove();

    var line = d3.line()
    .x(function(d) { return x(getLabel(d.label)) + xShift })
    .y(function(d) { return y(d.value) })
    svg.selectAll("myLines")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("d", function(d){ return line(d.values) } )
    .attr("stroke", function(d){ return colorScale(d.name) })
    .style("stroke-width", 1)
    .style("fill", "none")
    .attr('opacity', '0.7')

    svg
    .selectAll("dot")
    .data(dataReady)
    .enter()
    .append("g")
    .style("fill", function(d){ return colorScale(d.name) })
    .selectAll("myDots")
    .data(function(d){
        for (var i = 0; i < d.values.length; i++) {
            d.values[i].name = d.name;
        }
        return d.values;
    })
    .enter()
    .append("circle")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', d.label)
        .attr('data-colvalue2',formatData(
            d.value, cols[index1],
            options
        ))
    })
    .attr("cx", function(d) {
        return x(getLabel(d.label)) + xShift
    })
    .attr("cy", function(d) { return y(d.value) })
    .attr("r", 3)
    .attr('stroke', function(d) { return colorScale(d.name) })
    .attr('stroke-width', '2')
    .attr('stroke-opacity', '0.7')
    .attr("fill", 'white')
    .attr('class', 'tooltip-2d line-dot')

    if(hasLegend){
        var svgLegend = svg.append('g')
        .style('fill', 'currentColor')
        .style('fill-opacity', '0.7')
        .style('font-family', 'inherit')
        .style('font-size', '10px')

        const legendWrapLength = width / 2 - 50
        var legendOrdinal = d3.legendColor()
        .shape(
            'path',
            d3.symbol()
            .type(d3.symbolCircle)
            .size(70)()
        )
        .orient('horizontal')
        .shapePadding(100)
        .labelWrap(legendWrapLength)
        .scale(colorScale)
        svgLegend.call(legendOrdinal)

        let legendBBox
        const legendElement = svgLegend.node()
        if (legendElement) {
            legendBBox = legendElement.getBBox()
        }

        const legendHeight = legendBBox.height
        const legendWidth = legendBBox.width
        const legendXPosition = width / 2 - (legendWidth/2)
        const legendYPosition = height + 45
        svgLegend
        .attr('transform', `translate(${legendXPosition}, ${legendYPosition})`)
    }

    tooltipCharts();
}

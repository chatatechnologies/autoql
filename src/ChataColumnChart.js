function createColumnChart(component, json, options, fromChataUtils=true,
    valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 90, marginLabel: 50},
    width = component.parentElement.clientWidth - margin.left;
    var height;

    var cols = enumerateCols(json);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata){
        metadataComponent.metadata = {
            xAxis: {
                xAxisIndex: 0,
                currentLi: 0,
            }
        }
    }
    if(indexList['STRING']){
        xIndexes.push(...indexList['STRING'])
    }

    if(indexList['DATE']){
        xIndexes.push(...indexList['DATE'])
    }

    if(indexList['DATE_STRING']){
        xIndexes.push(...indexList['DATE_STRING'])
    }

    if(indexList['DOLLAR_AMT']){
        yIndexes = indexList['DOLLAR_AMT'];
    }else if(indexList['QUANTITY']){
        yIndexes = indexList['QUANTITY'];
    }

    var xAxisIndex = metadataComponent.metadata.xAxis.xAxisIndex;
    var data = makeGroups(json, options, yIndexes, cols[xAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);
    var index1 = yIndexes[0].index;
    var index2 = cols[xAxisIndex].index;

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

    var x0 = d3.scaleBand()
    .rangeRound([0, width]).padding(.1);
    var x1 = d3.scaleBand();
    var y = d3.scaleLinear()

    var xAxis = d3.axisBottom(x0)
    var yAxis = d3.axisLeft(y)

    var labelsNames = data.map(function(d) { return getLabel(d.label); });
    var groupNames = data[0].values.map(function(d) { return d.group; });
    var hasLegend = groupNames.length > 1;
    if(hasLegend){
        margin.bottom = 90;
        margin.marginLabel = 10;
    }
    x0.domain(labelsNames);
    x1.domain(groupNames).rangeRound([0, x0.bandwidth()]).padding(.1);
    y
    .range([ height - (margin.bottom), 0 ])
    .domain([minMaxValues.min, minMaxValues.max]).nice()

    var colorScale = d3.scaleOrdinal()
    .domain(groupNames)
    .range(options.themeConfig.chartColors);



    var svg = d3.select(component)
    .append("svg")
    .attr("width", width + margin.left)
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

    if(yIndexes.length > 1){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
    }


    // X AXIS
    var textContainerX = labelXContainer.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.marginLabel - 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

    textContainerX.append('tspan')
    .text(col1);

    if(xIndexes.length > 1){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')

        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const yWidthRect = getStringWidth(col1) + paddingRect;
        var _y = 0;
        const _x = (width / 2) - (yWidthRect/2) - (paddingRect/2);
        if(hasLegend){
            _y = height - (margin.marginLabel/2) - 3;
        }else{
            _y = height + (margin.marginLabel/2) + 6;
        }
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
            const selectedItem = metadataComponent.metadata.xAxis.currentLi;
            var popoverSelector = new ChataChartListPopover({
                left: d3.event.clientX + 'px',
                top: d3.event.clientY + 'px'
            }, xIndexes, (evt, popover) => {
                var xAxisIndex = evt.target.dataset.popoverIndex;
                var currentLi = evt.target.dataset.popoverPosition;
                metadataComponent.metadata.xAxis.xAxisIndex = xAxisIndex;
                metadataComponent.metadata.xAxis.currentLi = currentLi;
                createColumnChart(
                    component,
                    json,
                    options,
                    fromChataUtils,
                    valueClass,
                    renderTooltips
                )
                popover.close();
            });

            popoverSelector.setSelectedItem(selectedItem)
        })
    }

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }

    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[index2], options)
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[index2], options)
        }))
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center")
    }

    svg.append("g")
    .attr("class", "grid")
    .call(
        yAxis
        .tickSize(-width)
        .tickFormat(function(d){
            return formatChartData(d, cols[index1], options)}
        )
    )

    var slice = svg.selectAll(".slice")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(" + x0(getLabel(d.label)) + ",0)";
    });

    slice.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    .each(function (d, i) {
        console.log(d.index);
        console.log(i);
        d3.select(this).attr(valueClass, d.index)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', formatData(
            data[d.index].label, cols[index2],
            options
        ))
        .attr('data-colvalue2', formatData(
            d.value, cols[index1],
            options
        ))
    })
    .attr("width", x1.bandwidth())
    .attr("x", function(d) { return x1(d.group); })
    .style("fill", function(d) { return colorScale(d.group) })
    .attr('fill-opacity', '0.7')
    .attr('class', 'tooltip-2d bar')
    .attr("y", function(d) { return y(Math.max(0, d.value)); })
    .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })

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
        const legendYPosition = height + 25
        svgLegend
        .attr('transform', `translate(${legendXPosition}, ${legendYPosition})`)
    }

    tooltipCharts();
}

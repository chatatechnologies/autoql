function createLineChart(component, json, options, onUpdate=()=>{}, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 50, left: 90, marginLabel: 40},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    var cols = enumerateCols(json);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];
    let chartWidth;
    var legendOrientation = 'horizontal';
    var shapePadding = 100;
    const legendBoxMargin = 15;

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
    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata){
        metadataComponent.metadata = {
            groupBy: {
                index: xIndexes[0].index,
                currentLi: 0,
            },
            series: yIndexes
        }
    }

    console.log();

    var xAxisIndex = metadataComponent.metadata.groupBy.index;
    var activeSeries = metadataComponent.metadata.series;
    var data = makeGroups(json, options, activeSeries, cols[xAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);
    var index1 = activeSeries[0].index;
    var index2 = cols[xAxisIndex].index;
    console.log(cols[xAxisIndex]);

    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);

    var labelsNames = data.map(function(d) { return d.label; });
    var allGroup = data[0].values.map(function(d) { return d.group; });
    var hasLegend = allGroup.length > 1;
    if(hasLegend && allGroup.length < 3){
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

    if(allGroup.length < 3){
        chartWidth = width;
    }else{
        chartWidth = width - 135;
        legendOrientation = 'vertical';
        shapePadding = 5;
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
    .attr('y', -margin.left + margin.right + 5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    textContainerY.append('tspan')
    .text(col2)

    if(yIndexes.length > 1 && options.enableDynamicCharting){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
        labelYContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;

        labelYContainer.append('rect')
        .attr('x', 66)
        .attr('y', -(height/2 + (xWidthRect/2) + (paddingRect/2)))
        .attr('height', xWidthRect + paddingRect)
        .attr('width', 24)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('transform', 'rotate(-180)')
        .attr('class', 'autoql-vanilla-y-axis-label-border')

        labelYContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();
            var popoverSelector = new ChataChartSeriesPopover({
                left: d3.event.clientX,
                top: d3.event.clientY
            }, cols, activeSeries, (evt, popover, _activeSeries) => {
                metadataComponent.metadata.series = _activeSeries;
                createLineChart(
                    component,
                    json,
                    options,
                    onUpdate,
                    fromChataUtils,
                    valueClass,
                    renderTooltips
                )
                popover.close();
            });
        })
    }

    // X AXIS
    var textContainerX = labelXContainer.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.marginLabel + 3)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

    textContainerX.append('tspan')
    .text(col1);

    if(xIndexes.length > 1 && options.enableDynamicCharting){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')

        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col1) + paddingRect;
        var _y = 0;
        const _x = (chartWidth / 2) - (xWidthRect/2) - (paddingRect/2);
        if(hasLegend && allGroup.length < 3){
            _y = height - (margin.marginLabel/2) + 3;
        }else{
            _y = height + (margin.marginLabel/2) + 6;
        }
        labelXContainer.append('rect')
        .attr('x', _x)
        .attr('y', _y)
        .attr('height', 24)
        .attr('width', xWidthRect + paddingRect)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('class', 'autoql-vanilla-x-axis-label-border')

        labelXContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();
            const selectedItem = metadataComponent.metadata.groupBy.currentLi;
            var popoverSelector = new ChataChartListPopover({
                left: d3.event.clientX,
                top: d3.event.clientY
            }, xIndexes, (evt, popover) => {
                var xAxisIndex = evt.target.dataset.popoverIndex;
                var currentLi = evt.target.dataset.popoverPosition;
                metadataComponent.metadata.groupBy.index = xAxisIndex;
                metadataComponent.metadata.groupBy.currentLi = currentLi;
                createLineChart(
                    component,
                    json,
                    options,
                    onUpdate,
                    fromChataUtils,
                    valueClass,
                    renderTooltips
                )
                popover.close();
            });

            popoverSelector.setSelectedItem(selectedItem)
        })
    }


    var x = d3.scaleBand()
    .domain(data.map(function(d) {
        return getLabel(d.label)
    }))
    .range([ 0, chartWidth]);

    var xAxis = d3.axisBottom(x);
    const xShift = x.bandwidth() / 2;

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }
    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[index2], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[index2], options);
        }))
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
    .tickSize(-chartWidth)
    );
    svg.append("g").call(yAxis).select(".domain").remove();

    let lines;
    let points;
    var line = d3.line()
    .x(function(d) { return x(getLabel(d.label)) + xShift })
    .y(function(d) { return y(d.value) })

    function createLines(){
        if(lines)lines.remove()
        if(points)points.remove()
        var cloneData = getVisibleSeries(data);
        var visibleGroups = cloneData[0].values.map(function(d) {
            return d.group;
        });
        var dataReady = visibleGroups.map( function(grpName) {
            return {
                name: grpName,
                values: grouped[grpName]
            };
        });

        lines = svg.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("d", function(d){ return line(d.values) } )
        .attr("stroke", function(d){ return colorScale(d.name) })
        .style("stroke-width", 1)
        .style("fill", "none")
        .attr('opacity', '0.7')

        points = svg
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
            .attr('data-col2', d.group)
            .attr('data-colvalue1', formatData(
                d.label, cols[index2],
                options
            ))
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
        tooltipCharts();
        onUpdate(component)
    }

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
        .orient(legendOrientation)
        .shapePadding(shapePadding)
        .labelWrap(legendWrapLength)
        .scale(colorScale)
        .on('cellclick', function(d) {
            data = toggleSerie(data, d.trim());
            createLines();
            const legendCell = d3.select(this);
            legendCell.classed('hidden', !legendCell.classed('hidden'));
        });
        svgLegend.call(legendOrdinal)

        if(legendOrientation === 'vertical'){
            const newX = chartWidth + legendBoxMargin
            svgLegend
              .attr('transform', `translate(${newX}, ${0})`)
        }else{

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
            .attr(
                'transform',
                `translate(${legendXPosition}, ${legendYPosition})`
            )
        }
    }

    createLines();

    d3.select(window).on(
        "resize." + component.dataset.componentid, () => {
            createLineChart(
                component,
                json,
                options,
                onUpdate,
                fromChataUtils,
                valueClass,
                renderTooltips
            )
        }
    );
}

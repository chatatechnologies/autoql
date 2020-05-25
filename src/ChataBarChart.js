function createBarChart(component, json, options, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 60, left: 130, marginLabel: 50},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    var cols = enumerateCols(json);
    var indexList = getIndexesByType(cols);
    var xIndexes = [];
    var yIndexes = [];

    if(indexList['STRING']){
        yIndexes.push(...indexList['STRING'])
    }

    if(indexList['DATE']){
        yIndexes.push(...indexList['DATE'])
    }

    if(indexList['DATE_STRING']){
        yIndexes.push(...indexList['DATE_STRING'])
    }

    if(indexList['DOLLAR_AMT']){
        xIndexes = indexList['DOLLAR_AMT'];
    }else if(indexList['QUANTITY']){
        xIndexes = indexList['QUANTITY'];
    }

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata){
        metadataComponent.metadata = {
            groupBy: {
                index: 0,
                currentLi: 0,
            },
            series: xIndexes
        }
    }
    var yAxisIndex = metadataComponent.metadata.groupBy.index;
    var activeSeries = metadataComponent.metadata.series;
    var data = makeGroups(json, options, activeSeries, cols[yAxisIndex].index);
    const minMaxValues = getMinAndMaxValues(data);
    var index1 = activeSeries[0].index;
    var index2 = cols[yAxisIndex].index;


    var colStr1 = cols[index2]['display_name'] || cols[index2]['name'];
    var colStr2 = cols[index1]['display_name'] || cols[index1]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    const tickWidth = (width - margin.left - margin.right) / 6
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
    const barHeight = height / data.length;
    const interval = Math.ceil((data.length * 16) / height);
    var yTickValues = [];
    if (barHeight < 16) {
        data.forEach((element, index) => {
            if (index % interval === 0) {
                yTickValues.push(getLabel(element.label));
            }
        });
    }

    var y0 = d3.scaleBand();
    var y1 = d3.scaleBand();

    var x = d3.scaleLinear()
    .range([0, width]);

    var xAxis = d3.axisBottom(x)
    .tickSize(0)

    var yAxis = d3.axisLeft(y0)


    var categoriesNames = data.map(function(d) { return getLabel(d.label); });
    var groupNames = data[0].values.map(function(d) { return d.group; });


    var hasLegend = groupNames.length > 1;
    if(hasLegend){
        margin.bottom = 80;
        margin.marginLabel = 0;
    }

    y0
    .rangeRound([height - margin.bottom, 0])
    .domain(categoriesNames)
    .padding(.1);

    y1.domain(groupNames).rangeRound([0, y0.bandwidth()]).padding(.1);
    x.domain([minMaxValues.min, minMaxValues.max]).nice();

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
    .attr('y', -margin.left + margin.right + 5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    textContainerY.append('tspan')
    .text(col1)

    if(yIndexes.length > 1){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
        labelYContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col1) + paddingRect;

        labelYContainer.append('rect')
        .attr('x', 105)
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
            const selectedItem = metadataComponent.metadata.groupBy.currentLi;
            var popoverSelector = new ChataChartListPopover({
                left: d3.event.clientX,
                top: d3.event.clientY
            }, yIndexes, (evt, popover) => {
                var yAxisIndex = evt.target.dataset.popoverIndex;
                var currentLi = evt.target.dataset.popoverPosition;
                metadataComponent.metadata.groupBy.index = yAxisIndex;
                metadataComponent.metadata.groupBy.currentLi = currentLi;
                createBarChart(
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

    // X AXIS
    var textContainerX = labelXContainer.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.marginLabel)
    .attr('text-anchor', 'middle')
    .attr("class", "autoql-vanilla-x-axis-label")
    textContainerX.append('tspan')
    .text(col2);

    if(xIndexes.length > 1){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')

        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;
        var _y = 0;
        const _x = (width / 2) - (xWidthRect/2) - (paddingRect/2);
        if(hasLegend){
            _y = height - (margin.marginLabel/2) + 3;
        }else{
            _y = height + (margin.marginLabel/2) + 28;
        }
        labelXContainer.append('rect')
        .attr('x', _x)
        .attr('y', _y - 20)
        .attr('height', 24)
        .attr('width', xWidthRect + paddingRect)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('class', 'autoql-vanilla-x-axis-label-border')

        labelXContainer.on('mouseup', (evt) => {
            const selectedItem = metadataComponent.metadata.groupBy.currentLi;
            var popoverSelector = new ChataChartSeriesPopover({
                left: d3.event.clientX,
                top: d3.event.clientY
            }, cols, activeSeries, (evt, popover, _activeSeries) => {
                metadataComponent.metadata.series = _activeSeries;
                createBarChart(
                    component,
                    json,
                    options,
                    fromChataUtils,
                    valueClass,
                    renderTooltips
                )
                popover.close();
            });
        })
    }

    if(tickWidth < 135){
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

    svg.append("g")
        .attr("class", "grid")
        .call(xAxis
            .tickSize(height - margin.bottom)
            .tickFormat("")
        );

    svg.append("g")
    .attr("class", "y axis")
    .style('opacity','1')
    .call(yAxis.tickFormat(function(d){
        return formatData(d, cols[index2], options)
    }))

    var slice = svg.selectAll(".slice")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(0,"+ y0(getLabel(d.label)) +")";
    });

    slice.selectAll("rect")
    .data(function(d) {
        for (var i = 0; i < d.values.length; i++) {
            d.values[i].label = d.label;
        }
        return d.values;
    })
    .enter().append("rect")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', formatData(
            d.label,
            cols[index2],
            options
        ))
        .attr('data-colvalue2', formatData(
            d.value,
            cols[index1],
            options
        ))
    })
    .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
    .attr("x", function(d) { return x(Math.min(0, d.value)); })
    .attr("y", function(d) { return y1(d.group); })
    .attr("height", function(d) { return y1.bandwidth() })
    .attr('fill-opacity', '0.7')
    .attr('class', 'tooltip-2d bar')
    .style("fill", function(d) { return colorScale(d.group) })


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

function createAreaChart(component, json, options, onUpdate=()=>{}, fromChataUtils=true, valueClass='data-stackedchartindex', renderTooltips=true) {
    var margin = {top: 5, right: 10, bottom: 50, left: 80},
    width = component.parentElement.clientWidth - margin.left;
    var wLegendBox = 140;
    var chartWidth = width - wLegendBox;
    var height;
    var legendBoxMargin = 15;
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);

    var metadataComponent = getMetadataElement(component, fromChataUtils);
    if(!metadataComponent.metadata3D){
        metadataComponent.metadata3D = {
            groupBy: {
                groupable1: 0,
                groupable2: 1,
            },
        }
    }

    var groupableIndex1 = metadataComponent.metadata3D.groupBy.groupable1;
    var groupableIndex2 = metadataComponent.metadata3D.groupBy.groupable2;
    var notGroupableIndex = notGroupableField.indexCol;
    var groupCols = groupables.map((groupable, i) => {
        return {col: groupable.jsonCol, index: i}
    });

    var columns = json['data']['columns'];
    var data = cloneObject(json['data']['rows']);
    var groups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex2]
    );
    groups = groups.sort().reverse();
    var subgroups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex1]
    );
    var allSubgroups = {}
    subgroups.map(subgroup => {
        allSubgroups[subgroup] = {
            isVisible: true
        };
    })

    var cols = json['data']['columns'];
    // var data = responseToArrayObjects(json, groups);
    var data = ChataUtils.format3dData(
        json, groups, metadataComponent.metadata3D
    );
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
    const barWidth = chartWidth / groups.length;
    const rotateLabels = barWidth < 135;
    const interval = Math.ceil((groups.length * 16) / width);
    var xTickValues = [];
    var allLengths = [];
    if (barWidth < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                if(element.length < 15){
                    xTickValues.push(element);
                }else{
                    xTickValues.push(element.slice(0, 15)+ '...');
                }
            }
        });
    }

    groups.map(element => allLengths.push(getLabel(element).length));
    let longestString = Math.max.apply(null, allLengths);

    if(rotateLabels){
        var m = longestString * 3;
        margin.bottomChart = m;
    }else{
        margin.bottomChart = 13;
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
    .text(col3);

    // X AXIS
    var labelXContainer = svg.append('g');
    var textContainerX = labelXContainer.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + (margin.bottom - 10))
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
    textContainerX.append('tspan')
    .text(col2);


    if(options.enableDynamicCharting){
        textContainerX.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
        labelXContainer.attr('class', 'autoql-vanilla-chart-selector')

        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;
        const X = (chartWidth / 2) - (xWidthRect/2) - (paddingRect/2);
        const Y = height + (margin.bottom/2);

        labelXContainer.append('rect')
        .attr('x', X)
        .attr('y', Y)
        .attr('height', 20)
        .attr('width', xWidthRect + paddingRect)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('class', 'autoql-vanilla-x-axis-label-border')

        labelXContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();
            var popoverSelector = new ChataChartListPopover({
                left: d3.event.clientX,
                top: d3.event.clientY
            }, groupCols, (evt, popover) => {

                var selectedIndex = evt.target.dataset.popoverIndex;
                var oldGroupable = metadataComponent.metadata3D.groupBy.groupable2;
                if(selectedIndex != oldGroupable){
                    metadataComponent.metadata3D.groupBy.groupable2 = selectedIndex;
                    metadataComponent.metadata3D.groupBy.groupable1 = oldGroupable;
                    createAreaChart(
                        component,
                        json,
                        options,
                        onUpdate,
                        fromChataUtils,
                        valueClass,
                        renderTooltips
                    )
                }
                popover.close();
            });

        })
    }




    var x = d3.scaleBand()
    .domain(groups.map(function(element){
        if(element.length < 15){
            return element;
        }else{
            return element.slice(0, 15) + '...';
        }
    }))
    .range([0, chartWidth])
    .padding([0.2]);

    var xAxis = d3.axisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }
    if(rotateLabels){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[groupableIndex2], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[groupableIndex2], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }

    var maxValue = d3.max(data, function(d) {
        var sum = 0;
        for (var [key, value] of Object.entries(d)){
            if(key == 'group')continue;
            sum += parseFloat(value);
        }
        return sum;
    });

    var y = d3.scaleLinear()
    .domain([0, maxValue])
    .range([ height - margin.bottomChart, 0 ]);
    var yAxis = d3.axisLeft(y);

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(options.themeConfig.chartColors)


    svg.append("g")
    .attr("class", "grid")
    .call(yAxis.tickFormat(function(d){
            return formatChartData(d, cols[notGroupableIndex], options)}
        )
        .tickSize(-chartWidth)
    );
    svg.append("g")
    .call(yAxis).select(".domain").remove();
    console.log(allSubgroups);
    let layers;
    let layerPoints;
    function createLayers(){
        var visibleGroups = getVisibleGroups(allSubgroups);
        var stackedData = d3.stack()
        .keys(visibleGroups)
        .value(function(d, key){
            var val = parseFloat(d[key]);
            if(isNaN(val)){
                return 0
            }
            return val;
        })
        (data)

        console.log(stackedData);

        if(layers)layers.remove();
        if(layerPoints)layers.remove();

        var points = [];
        for (var i = 0; i < stackedData.length; i++) {
            for (var _x = 0; _x < stackedData[i].length; _x++) {
                var seriesValues = stackedData[i][_x].data;
                for (var [key, value] of Object.entries(seriesValues)) {
                    if(key === 'group')continue;
                    points.push({
                        group: seriesValues.group,
                        y: value,
                        y1: stackedData[i][_x][groupableIndex2],
                        y0: stackedData[i][_x][groupableIndex1]
                    })
                }
            }
        }

        layers = svg.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function(d, i) { return color(d[i].data.group); })
        .attr('opacity', '0.7')
        .attr("d", d3.area()
            .x(function(d, i) { return x(d.data.group); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
        )

        layerPoints = svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr('class', 'tooltip-2d line-dot')
        .attr('stroke', function(d) {'transparent' })
        .attr('stroke-width', '3')
        .attr('stroke-opacity', '0.7')
        .attr("fill", 'transparent')
        .attr("fill-opacity", '1')
        .on("mouseover", function(d, i){
            d3.select(this).
            attr("stroke", color(d.group))
            .attr('fill', 'white')
        })
        .on("mouseout", function(d, i){
            d3.select(this).
            attr("stroke", 'transparent')
            .attr('fill', 'transparent')
        })
        .attr("cx", function(d) { return x(d.group); })
        .attr("cy", function(d) { return y(d.y); });

        tooltipCharts();
        onUpdate(component);
    }

    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('fill-opacity', '0.7')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    const legendWrapLength = wLegendBox - 28;
    legendScale = d3.scaleOrdinal()
        .domain(subgroups.sort().map(elem => {
            return formatChartData(elem, cols[groupableIndex1], options);
        }))
        .range(options.themeConfig.chartColors)

    var legendOrdinal = d3.legendColor()
    .shape(
        'path',
        d3.symbol()
        .type(d3.symbolCircle)
        .size(75)()
    )
    .orient('vertical')
    .shapePadding(5)
    .labelWrap(legendWrapLength)
    .scale(legendScale)
    .on('cellclick', function(d) {
        allSubgroups[d].isVisible = !allSubgroups[d].isVisible;
        createLayers();
        const legendCell = d3.select(this);
        legendCell.classed('hidden', !legendCell.classed('hidden'));
    });
    svgLegend.call(legendOrdinal)

    const newX = chartWidth + legendBoxMargin
    svgLegend
      .attr('transform', `translate(${newX}, ${0})`)

    d3.select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createAreaChart(
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

    createLayers();
}

function createStackedColumnChart(component, json, options, onUpdate=()=>{}, fromChataUtils=true, valueClass='data-stackedchartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 60, left: 80, bottomChart: 0},
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
    var groupCols = groupables.map((groupable, i) => {
        return {col: groupable.jsonCol, index: i}
    });
    var notGroupableIndex = notGroupableField.indexCol;


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
    var data = ChataUtils.format3dData(
        json, groups, metadataComponent.metadata3D
    );

    var colStr1 = cols[groupableIndex1]['display_name'] || cols[groupableIndex1]['name'];
    var colStr2 = cols[groupableIndex2]['display_name'] || cols[groupableIndex2]['name'];
    var colStr3 = cols[notGroupableIndex]['display_name'] || cols[notGroupableIndex]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    var col3 = formatColumnName(colStr3);
    const barWidth = chartWidth / groups.length;
    const rotateLabels = barWidth < 135;
    const interval = Math.ceil((groups.length * 16) / width);
    var allLengths = [];
    var xTickValues = [];
    if (barWidth < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                xTickValues.push(element);
            }
        });
    }

    groups.map(element => allLengths.push(formatLabel(element).length));
    let longestString = Math.max.apply(null, allLengths);

    if(rotateLabels){
        var m = longestString * 3;
        margin.bottomChart = m;
    }else{
        margin.bottomChart = 13;
    }

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
        const _x = (chartWidth / 2) - (xWidthRect/2) - (paddingRect/2);
        const _y = height + (margin.bottom/2) + 5;

        labelXContainer.append('rect')
        .attr('x', _x)
        .attr('y', _y)
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
                    createStackedColumnChart(
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


    // var x = d3.scaleBand()
    // .domain(groups.map(function(element){
    //     return element;
    // }))
    // .range([0, chartWidth])
    // .padding([0.2]);

    var x = SCALE_BAND()
    setDomainRange(
        x,
        groups,
        0,
        chartWidth,
        false,
        0.2
    )

    var xAxis = getAxisBottom(x);

    if(xTickValues.length > 0){
        xAxis.tickValues(xTickValues);
    }
    if(rotateLabels){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(
                formatChartData(d, cols[groupableIndex2], options)
            );
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottomChart) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatLabel(
                formatChartData(d, cols[groupableIndex2], options)
            );
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

    var y = SCALE_LINEAR()
    .domain([0, maxValue])
    .range([ height - margin.bottomChart, 0 ]);
    var yAxis = getAxisLeft(y);

    var color = getColorScale(subgroups, options.themeConfig.chartColors)
    // d3.scaleOrdinal()
    // .domain(subgroups)
    // .range(options.themeConfig.chartColors)

    svg.append("g")
    .attr("class", "grid")
    .call(yAxis.tickFormat(function(d){
            return formatChartData(d, cols[notGroupableIndex], options)}
        )
        .tickSize(-chartWidth)
    );
    svg.append("g")
    .call(yAxis).select(".domain").remove();

    let stackedG;

    function barsV3(stackedG, stackedData){
        var stackedG = svg.selectAll("g.cost")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "cost")
        .style("fill", function(d, i) {
            if(d[i]) return color(d[i].component); else return 'transparent'
        })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .each(function(d, i){
            // console.log(d);
            if(!d)return;
            d3.select(this).attr(valueClass, i)
            .attr('data-col1', col1)
            .attr('data-col2', col2)
            .attr('data-col3', col3)
            .attr('data-colvalue1', d.component)
            .attr('data-colvalue2', formatData(
                d.x, cols[groupableIndex2], options
            ))
            .attr('data-colvalue3', formatData(
                d.y, cols[notGroupableIndex],
                options
            ))
            .attr('data-unformatvalue1', d.component)
            .attr('data-unformatvalue2', d.x)
            .attr('data-unformatvalue3', d.y)
            .attr('class', 'tooltip-3d autoql-vanilla-stacked-rect')
        })
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y0 + d.y) + 0.5; })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
        .attr("width", getBandWidth(x))
        .attr('opacity', '0.7')
    }

    function barsV4(stackedG, stackedData){
        stackedG = svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) {
            return color(d.key);
        })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .each(function (d, i) {
            var pos = d[1];
            var sum = 0;
            for (var [key, value] of Object.entries(d.data)){
                if(key == 'group')continue;
                sum += parseFloat(value);
                if(sum == pos){
                    d.value = value;
                    d.labelY = key;
                    break;
                }
            }
            if(d.labelY && d.data.group && d.value){
                d3.select(this).attr(valueClass, i)
                .attr('data-col1', col1)
                .attr('data-col2', col2)
                .attr('data-col3', col3)
                .attr('data-colvalue1', d.labelY)
                .attr('data-colvalue2', formatData(
                    d.data.group, cols[groupableIndex2], options
                ))
                .attr('data-colvalue3', formatData(
                    d.value, cols[notGroupableIndex],
                    options
                ))
                .attr('data-unformatvalue1', d.labelY)
                .attr('data-unformatvalue2', d.data.group)
                .attr('data-unformatvalue3', d.value)
                .attr('class', 'tooltip-3d autoql-vanilla-stacked-rect')
            }else{
                d3.select(this).attr('class','autoql-vanilla-stacked-rect')
            }
        })
        .attr('opacity', '0.7')
        .attr("x", function(d) {
            return x(d.data.group);
        })
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
        .attr("width", x.bandwidth())
    }

    function createBars(){
        var visibleGroups = getVisibleGroups(allSubgroups);
        var stackedData = getStackedData(visibleGroups, data);
        if(stackedG)stackedG.remove();

        if(MAJOR_D3_VERSION === '3'){
            barsV3(stackedG, stackedData);
        }else{
            barsV4(stackedG, stackedData);
        }
        tooltipCharts();
        onUpdate(component);
    }

    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('fill-opacity', '0.7')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    const legendWrapLength = wLegendBox - 28;
    const legendValues = subgroups.sort().map(elem => {
        return formatChartData(elem, cols[groupableIndex1], options);
    });
    legendScale = getColorScale(
        legendValues,
        options.themeConfig.chartColors
    )

    var legendOrdinal = getLegend(legendScale, legendWrapLength, 'vertical')
    .on('cellclick', function(d) {
        allSubgroups[d].isVisible = !allSubgroups[d].isVisible;
        createBars();
        const legendCell = d3.select(this);
        legendCell.classed('hidden', !legendCell.classed('hidden'));
    });
    svgLegend.call(legendOrdinal)

    const newX = chartWidth + legendBoxMargin
    svgLegend
      .attr('transform', `translate(${newX}, ${0})`)


    d3.select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createStackedColumnChart(
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

    createBars();
}

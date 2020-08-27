function createStackedBarChart(component, json, options, onUpdate=()=>{}, fromChataUtils=true, valueClass='data-stackedchartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 30, left: 142, chartLeft: 140},
    width = component.parentElement.clientWidth - margin.left;
    margin.chartLeft = 90;
    var height;
    var legendBoxMargin = 15;
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);
    var metadataComponent = getMetadataElement(component, fromChataUtils);
    var allLengths = [];
    if(!metadataComponent.metadata3D){
        metadataComponent.metadata3D = {
            groupBy: {
                groupable1: 0,
                groupable2: 1,
            },
        }
    }


    var groupCols = groupables.map((groupable, i) => {
        return {col: groupable.jsonCol, index: i}
    });

    var groupableIndex1 = metadataComponent.metadata3D.groupBy.groupable1;
    var groupableIndex2 = metadataComponent.metadata3D.groupBy.groupable2;
    var notGroupableIndex = notGroupableField.indexCol;

    var data = cloneObject(json['data']['rows']);
    var groups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex2]
    );

    groups = groups.sort().reverse();
    var subgroups = ChataUtils.getUniqueValues(
        data, row => row[groupableIndex1]
    );

    groups.map(element => allLengths.push(formatLabel(element).length));
    let longestString = Math.max.apply(null, allLengths);

    margin.chartLeft = longestString * 10;

    if(margin.chartLeft < 90) margin.chartLeft = 90;
    if(margin.chartLeft > 140) margin.chartLeft = 140;

    var chartWidth = width - margin.chartLeft;
    var wLegendBox = width - chartWidth;


    var allSubgroups = {}
    var legendGroups = {};
    var cols = json['data']['columns'];
    subgroups.map(subgroup => {
        allSubgroups[subgroup] = {
            isVisible: true
        };
        legendGroups[
            formatChartData(subgroup, cols[groupableIndex1], options)
        ] = {
            value: subgroup
        }
    })

    var data = ChataUtils.format3dData(
        json, groups, metadataComponent.metadata3D
    );

    var colStr1 = cols[groupableIndex1]['display_name'] || cols[groupableIndex1]['name'];
    var colStr2 = cols[groupableIndex2]['display_name'] || cols[groupableIndex2]['name'];
    var colStr3 = cols[notGroupableIndex]['display_name'] || cols[notGroupableIndex]['name'];
    var col1 = formatColumnName(colStr1);
    var col2 = formatColumnName(colStr2);
    var col3 = formatColumnName(colStr3);

    const tickWidth = (width - margin.left - margin.right) / 6
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
    const barHeight = height / groups.length;
    const interval = Math.ceil((groups.length * 16) / height);
    var yTickValues = [];
    if (barHeight < 16) {
        groups.forEach((element, index) => {
            if (index % interval === 0) {
                yTickValues.push(element);
                // if(element.length < 18){
                // }
            }
        });
    }
    var svg = chataD3.select(component)
    .append("svg")
    .attr("width", width + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.chartLeft + "," + margin.top + ")");

    var labelYContainer = svg.append('g');

    // Y AXIS
    var textContainerY = labelYContainer.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.chartLeft + margin.right + 4.5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')

    textContainerY.append('tspan')
    .text(col2);

    if(options.enableDynamicCharting){
        textContainerY.append('tspan')
        .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
        .text('▼')
        .style('font-size', '8px')
        labelYContainer.attr('class', 'autoql-vanilla-chart-selector')
        const paddingRect = 15;
        const xWidthRect = getStringWidth(col2) + paddingRect;

        labelYContainer.append('rect')
        .attr('x', margin.chartLeft - 25)
        .attr('y', -(height/2 + (xWidthRect/2) + (paddingRect/2)))
        .attr('height', xWidthRect + paddingRect)
        .attr('width', 23)
        .attr('fill', 'transparent')
        .attr('stroke', '#508bb8')
        .attr('stroke-width', '1px')
        .attr('rx', '4')
        .attr('transform', 'rotate(-180)')
        .attr('class', 'autoql-vanilla-y-axis-label-border')

        labelYContainer.on('mouseup', (evt) => {
            closeAllChartPopovers();
            var popoverSelector = new ChataChartListPopover({
                left: chataD3.event.clientX,
                top: chataD3.event.clientY
            }, groupCols, (evt, popover) => {
                var selectedIndex = evt.target.dataset.popoverIndex;
                var oldGroupable = metadataComponent.metadata3D.groupBy.groupable2;
                if(selectedIndex != oldGroupable){
                    metadataComponent.metadata3D.groupBy.groupable2 = selectedIndex;
                    metadataComponent.metadata3D.groupBy.groupable1 = oldGroupable;
                    createStackedBarChart(
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

    svg.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height + margin.bottom - 7)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')
    .text(col3);

    var maxValue = chataD3.max(data, function(d) {
        var sum = 0;
        for (var [key, value] of Object.entries(d)){
            if(key == 'group')continue;
            sum += parseFloat(value);
        }
        return sum;
    });

    var x = SCALE_LINEAR()
    .domain([0, maxValue])
    .range([ 0, chartWidth ]).nice();

    if(tickWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(getAxisBottom(x).ticks(9).tickSize(1).tickFormat(function(d){
            return formatChartData(d, cols[2], options)}
        ))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(getAxisBottom(x).tickFormat(function(d){
            return formatChartData(d, cols[2], options)}
        ))
        .selectAll("text")
        .style("color", '#fff')
        .style("text-anchor", "center");
    }


    // Add Y axis
    var y = SCALE_BAND()
    setDomainRange(
        y,
        groups,
        height - margin.bottom,
        0,
        false,
        0.2
    )

    var yAxis = getAxisLeft(y);

    if(yTickValues.length > 0){
        yAxis.tickValues(yTickValues);
    }

    var color = getColorScale(subgroups, options.themeConfig.chartColors)

    svg.append("g")
    .call(yAxis.tickFormat(function(d){
        return formatLabel(formatChartData(d, cols[groupableIndex2], options));
    })).select(".domain").remove();

    svg.append("g")
    .attr("class", "grid")
    .call(getAxisBottom(x)
        .tickSize(height - margin.bottom)
        .tickFormat("")
    );

    let stackedG;

    function createBars(){
        var visibleGroups = getVisibleGroups(allSubgroups);
        var stackedData = getStackedData(visibleGroups, data);
        if(stackedG)stackedG.remove();

        stackedG = svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key) })
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
            chataD3.select(this).attr(valueClass, i)
            .attr('data-col1', col1)
            .attr('data-col2', col2)
            .attr('data-col3', col3)
            .attr('data-colvalue1', formatData(
                d.labelY, cols[groupableIndex1], options
            ))
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

        })
        .attr('opacity', '0.7')
        .attr('class', 'tooltip-3d autoql-vanilla-stacked-rect')
        .attr("x", function(d) {
            return x(d[0]);
        })
        .attr("y", function(d) { return y(d.data.group) })
        .attr("height", function(d) {
            return y.bandwidth();
        })
        .attr("width",function(d){
            var d1 = d[1];
            if(isNaN(d1)){
                return 0;
            }
            return Math.abs(x(d[0]) - x(d[1]));
        })

        tooltipCharts();
        onUpdate(component);

    }


    var svgLegend = svg.append('g')
    .style('fill', 'currentColor')
    .style('fill-opacity', '0.7')
    .style('font-family', 'inherit')
    .style('font-size', '10px')

    const legendWrapLength = wLegendBox;
    const legendValues = subgroups.map(elem => {
        return formatChartData(elem, cols[groupableIndex1], options);
    });
    legendScale = getColorScale(
        legendValues,
        options.themeConfig.chartColors
    )

    var legendOrdinal = getLegend(legendScale, legendWrapLength, 'vertical')
    legendOrdinal.on('cellclick', function(d) {
        var unformatGroup = legendGroups[d].value;
        allSubgroups[unformatGroup].isVisible =
        !allSubgroups[unformatGroup].isVisible;

        createBars();
        const legendCell = chataD3.select(this);
        legendCell.classed('disable-group', !legendCell.classed('disable-group'));
    });
    svgLegend.call(legendOrdinal)

    const newX = chartWidth + legendBoxMargin
    svgLegend
      .attr('transform', `translate(${newX}, ${0})`)

    chataD3.select(window).on(
        "chata-resize." + component.dataset.componentid, () => {
            createStackedBarChart(
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

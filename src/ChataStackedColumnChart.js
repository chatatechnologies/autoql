function createStackedColumnChart(component, json, options, onUpdate=()=>{}, fromChataUtils=true, valueClass='data-stackedchartindex', renderTooltips=true){
    var margin = {top: 5, right: 10, bottom: 60, left: 80},
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
    const interval = Math.ceil((groups.length * 16) / width);
    var xTickValues = [];
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
    if(barWidth < 135){
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis.tickFormat(function(d){
            return formatChartData(d, cols[groupableIndex2], options);
        }))
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    }else{
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
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
    .range([ height - margin.bottom, 0 ]);
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

    let stackedG;

    function createBars(){
        var visibleGroups = getVisibleGroups(allSubgroups);
        var stackedData = d3.stack()
        .keys(visibleGroups)
        (data)
        if(stackedG)stackedG.remove();

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
        })
        .attr('opacity', '0.7')
        .attr('class', 'tooltip-3d autoql-vanilla-stacked-rect')
        .attr("x", function(d) {
            if(d.data.group.length < 15){
                return x(d.data.group);
            }else{
                return x(d.data.group.slice(0,15)+'...');
            }
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
        .attr("width",x.bandwidth())

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
        createBars();
        const legendCell = d3.select(this);
        legendCell.classed('hidden', !legendCell.classed('hidden'));
    });
    svgLegend.call(legendOrdinal)

    const newX = chartWidth + legendBoxMargin
    svgLegend
      .attr('transform', `translate(${newX}, ${0})`)


    d3.select(window).on(
        "resize." + component.dataset.componentid, () => {
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

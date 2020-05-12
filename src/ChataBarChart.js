function createBarChart(component, json, options, fromChataUtils=true, valueClass='data-chartindex', renderTooltips=true){
    var data = makeGroups(json, options, [], -1);
    const minMaxValues = getMinAndMaxValues(data);
    var margin = {top: 5, right: 10, bottom: 50, left: 130, marginLabel: 50},
    width = component.parentElement.clientWidth - margin.left;
    var height;
    var cols = json['data']['columns'];

    var groupableField = getGroupableField(json);
    var notGroupableField = getNotGroupableField(json);

    var index1 = notGroupableField.indexCol;
    var index2 = groupableField.indexCol;

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

    svg.append('text')
    .attr('x', -(height / 2))
    .attr('y', -margin.left + margin.right)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')
    .text(col1);

    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.marginLabel)
    .attr('text-anchor', 'middle')
    .attr("class", "autoql-vanilla-x-axis-label")
    .text(col2);

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
    .call(yAxis)

    var slice = svg.selectAll(".slice")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(0,"+ y0(getLabel(d.label)) +")";
    });

    slice.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    .each(function (d, i) {
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', data[d.index].label)
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

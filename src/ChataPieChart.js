function createPieChart(component, data, options, col1, col2,  fromChatDrawer=true, valueClass='data-chartindex', renderTooltips=true){
    var margin = 20;
    var width = component.parentElement.clientWidth;
    var pieWidth;
    var height;
    if(fromChatDrawer){
        if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
            height = component.parentElement.parentElement.clientHeight - (margin + 3);
            if(height < 250){
                height = 300;
            }
        }else{
            height = 250;
        }
    }else{
        height = component.parentElement.offsetHeight - (margin);
    }
    var _data = {a: 9, b: 20, c:30, d:8, e:12};
    console.log(_data);
    if (width < height) {
      pieWidth = width / 2 - margin;
    } else if (height * 2 < width) {
      pieWidth = height - margin;
    } else {
      pieWidth = width / 2 - margin;
    }

    var outerRadius = pieWidth / 2
    var innerRadius = outerRadius - 40 > 15 ? outerRadius - 40 : 0

    component.innerHTML = '';
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('chata-chart-container');


    var svg = d3.select(component)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")


    var color = d3.scaleOrdinal()
    .domain(data)
    .range(options.chartColors)

    var pie = d3.pie()
    .value(function(d) {return d.value; })
    var dataReady = pie(d3.entries(data))

    svg
    .append('g')
    .attr("transform", "translate(" + (width / 2 + outerRadius + margin) + "," + (height / 2 - margin) + ")")
    .selectAll('.slices')
    .data(dataReady)
    .enter()
    .append('path')
    .each(function(d, i){
        console.log(d);
        d3.select(this).attr(valueClass, i)
        .attr('data-col1', col1)
        .attr('data-col2', col2)
        .attr('data-colvalue1', d.data.key)
        .attr('data-colvalue2', formatData(d.value, 'DOLLAR_AMT', options.languageCode, options.currencyCode))
    })
    .attr('class', 'slice')
    .attr('d', d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
    )
    .attr('fill', function(d){ return(color(d.data.key)) })
    .style('fill-opacity', 0.85)
    .on('mouseover', function(d) {
        d3.select(this).style('fill-opacity', 1)
    })
    .on('mouseout', function(d) {
        d3.select(this).style('fill-opacity', 0.85)
    })
    .on('click', function(d) {
        if (!d._expanded) {
            svg
            .selectAll('path.slice')
            .each(function(data) {
                data._expanded = false
            })
            .transition()
            .duration(500)
        }

        d3.select(this)
        .transition()
        .duration(500)
        .attr('transform', function(d) {
            if (!d._expanded) {
                d._expanded = true
                const a =
                d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2
                const x = Math.cos(a) * 20
                const y = Math.sin(a) * 20
                return 'translate(' + x + ',' + y + ')'
            } else {
                d._expanded = false
                return 'translate(0,0)'
            }
        })
    })
    .attr('class', 'tooltip-2d')

    var legendBoxMargin = 25;
    var legspacing = 15;
    var legendMargin = 0;
    var legend = svg.selectAll(".legend")
        .data(dataReady)
        .enter()
        .append("g")
        .attr("transform", "translate(0,0)");

    legend.append("circle")
        .attr("fill", function(d){ return(color(d.data.key))})
        .attr("width", 20)
        .attr("height", 20)
        .attr("cy", function (d, i) {
            return i * legspacing + 10;
        })
        .attr('opacity', '0.7')
        .attr("cx", legendMargin + legspacing)
        .attr("r", 5);

    legend.append("text")
        .attr("class", "label")
        .attr('opacity', '0.7')
        .attr("y", function (d, i) {
            return i * legspacing + 10 + 2;
        })
        .attr("x", legendMargin + legendBoxMargin)
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return d.data.key + ": " + d.data.value;
        })


        const containerBBox = svg
        .node()
        .getBBox()

        const containerWidth = containerBBox.width
        const currentXPosition = containerBBox.x
        const finalXPosition = (width - containerWidth) / 2
        const xDelta = finalXPosition - currentXPosition

        svg.attr(
            'transform',
            `translate(${xDelta},0)`
        )
        tooltipCharts();
    }

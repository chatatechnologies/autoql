export function MultiSeriesSelector(svg, params){
    var labelContainer = svg.append('g');
    const {
        x,
        y,
        xRect,
        yRect,
        rotate,
        hRect,
        wRect,
        colName
    } = params

    var textContainer = labelContainer.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('transform', rotate)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

    textContainer.append('tspan')
    .text(colName);

    textContainer.append('tspan')
    .attr('class', 'autoql-vanilla-chata-axis-selector-arrow')
    .text('▼')
    .style('font-size', '8px')
    labelContainer.attr('class', 'autoql-vanilla-chart-selector')

    labelContainer.append('rect')
    .attr('x', xRect)
    .attr('y', yRect)
    .attr('height', hRect)
    .attr('width', wRect)
    .attr('fill', 'transparent')
    .attr('stroke', '#508bb8')
    .attr('stroke-width', '1px')
    .attr('rx', '4')
    .attr('transform', 'rotate(-180)')
    .attr('class', 'autoql-vanilla-x-axis-label-border')
}

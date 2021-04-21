import {
    getStringWidth
} from '../Utils'

export function MultiSeriesSelector(svg, params, onClick){
    var labelContainer = svg.append('g');
    const {
        x,
        y,
        colName
    } = params

    const paddingRect = 15;
    const xWidthRect = getStringWidth(colName) + paddingRect;

    var textContainer = labelContainer.append('text')
    .attr('x', x + (xWidthRect / 2))
    .attr('y', y)
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
    .attr('x', x - (paddingRect/2))
    .attr('y', -(y/2))
    .attr('height', 24)
    .attr('width', xWidthRect + paddingRect)
    .attr('fill', 'transparent')
    .attr('stroke', '#508bb8')
    .attr('stroke-width', '1px')
    .attr('rx', '4')
    .attr('class', 'autoql-vanilla-x-axis-label-border')

    labelContainer.on('mouseup', onClick)

}

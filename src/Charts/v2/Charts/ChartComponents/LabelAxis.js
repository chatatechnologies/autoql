export function LabelAxis(options) {
  const {
    type,
    svg,
    name,
    x,
    y,
  } = options

  const labelContainer = svg.append('g');

  const textContainer = labelContainer.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', 'middle');
  
  textContainer.append('tspan')
    .text(name);

  if(type === 'LEFT') {
    textContainer
      .attr('transform', 'rotate(-90)')
      .attr('class', 'autoql-vanilla-y-axis-label')
  }

  if(type === 'BOTTOM') {
    textContainer
      .attr('class', 'autoql-vanilla-x-axis-label')
  }

  return labelContainer
}
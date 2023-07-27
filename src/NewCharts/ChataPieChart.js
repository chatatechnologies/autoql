import {
    applyStylesForHiddenSeries,
    formatElement,
    getColorScale,
    getPieChartData,
    getThemeValue,
    getTooltipContent,
    legendColor,
} from 'autoql-fe-utils';
import { select } from 'd3-selection';
import { arc } from 'd3-shape';
import { CSS_PREFIX } from '../Constants';

export function PieChartNew(container, params = {}) {
    const {
        columnIndexConfig = {},
        options = {},
        data,
        legend,
        columns,
        activeKey,
        colorScales,
        chartColors,
        legendColumn,
        outerWidth: width,
        outerHeight: height,
    } = params;

    const { stringColumnIndex, numberColumnIndex } = columnIndexConfig;
    const { dataFormatting } = options;

    const self = this;

    const legendLabels = legend?.labels;
    const colorScale = colorScales?.colorScale;

    // this.colorScale = getColorScale(
    //     data.map((d) => d[stringColumnIndex]),
    //     chartColors,
    // );

    // const legendLabels = data.map((d, i) => {
    //     const legendString = `${formatElement({
    //         element: d[stringColumnIndex] || 'Untitled Category',
    //         column: columns?.[stringColumnIndex],
    //     })}: ${formatElement({
    //         element: d[numberColumnIndex] || 0,
    //         column: columns?.[numberColumnIndex],
    //         config: columns?.[dataFormatting],
    //     })}`;
    //     return {
    //         label: legendString.trim(),
    //         hidden: false,
    //         dataIndex: i,
    //     };
    // });

    console.log({ legendLabels });

    this.setRadius = () => {
        let margin = 40;

        let pieWidth;
        if (width < height) {
            pieWidth = width / 2 - margin;
        } else if (height * 2 < width) {
            pieWidth = height - margin;
        } else {
            pieWidth = width / 2 - margin;
        }

        this.outerRadius = pieWidth / 2;
        this.innerRadius = this.outerRadius - 50 > 15 ? this.outerRadius - 50 : 0;
    };

    this.onSliceClick = (d) => {
        // TODO
        console.log('on click!', { d });
        const newActiveKey = d?.data?.key;
        if (newActiveKey === activeKey) {
            // Put it back if it is expanded
        } else {
            // onChartClick({
            //   row: d.data.value,
            //   columnIndex: numberColumnIndex,
            //   columns: columns,
            //   stringColumnIndex: stringColumnIndex,
            //   legendColumn: legendColumn,
            //   activeKey: newActiveKey,
            // })
            // activeKey = newActiveKey
        }
    };

    this.renderPieSlices = () => {
        this.slicesContainer = this.pieChartContainer
            .append('g')
            .attr('class', 'autoql-vanilla-pie-chart-slices')
            .attr('transform', `translate(${width / 2 + this.outerRadius},${height / 2})`);

        this.slicesContainer
            .selectAll('.autoql-vanilla-pie-chart-slices')
            .data(self.dataReady)
            .enter()
            .append('path')
            .attr('class', 'autoql-vanilla-pie-chart-slice')
            .attr('d', arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius))
            .attr('fill', (d, i) => {
                console.log('getting fill color:', { d, i });
                return colorScale?.(i);
            })
            .attr('data-tippy-content-chart', true)
            .attr('data-tippy-content', function (d) {
                return getTooltipContent({
                    row: d.data.value,
                    columns: columns,
                    colIndex: numberColumnIndex,
                    colIndex2: stringColumnIndex,
                    legendColumn: legendColumn,
                    dataFormatting: dataFormatting,
                });
            })
            .style('fill-opacity', 0.85)
            .attr('stroke-width', '0.5px')
            .attr('stroke', getThemeValue('background-color-secondary', CSS_PREFIX))
            .on('mouseover', function (d) {
                select(this).style('fill-opacity', 1);
            })
            .on('mouseout', function (d) {
                select(this).style('fill-opacity', 0.85);
            })
            .on('click', this.onSliceClick);

        // render active pie slice if there is one
        self.pieChartContainer.selectAll('path.autoql-vanilla-pie-chart-slice').each(function (slice) {
            select(this)
                .transition()
                .duration(500)
                .attr('transform', function (d) {
                    if (d.data.key === activeKey) {
                        const a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                        const x = Math.cos(a) * 10;
                        const y = Math.sin(a) * 10;
                        // move it away from the circle center
                        return 'translate(' + x + ',' + y + ')';
                    }
                });
        });
    };

    this.applyStylesForHiddenSeries = () => {
        try {
            // const legendLabelTexts = legendLabels.filter((l) => l.hidden).map((l) => l.label);

            // console.log({ legendLabels, legendD3: this.legend });
            // this.legendSwatchElements = this.legend.select(`.label tspan`);

            // console.log('legend swatch elements:', this.legendSwatchElements);

            // this.legendSwatchElements.each(function (d) {
            //     console.log('IN FOR EACH!', this);
            //     const cellNode = select(this).node();
            //     const swatchElement = cellNode.parentElement.parentElement.querySelector('.swatch');
            //     swatchElement.style.strokeWidth = '2px';

            //     if (legendLabelTexts.includes(cellNode.textContent)) {
            //         swatchElement.style.opacity = 0.3;
            //     } else {
            //         swatchElement.style.opacity = 1;
            //     }
            // });

            applyStylesForHiddenSeries({ legendElement: this.legend?.node(), legendLabels });
        } catch (error) {
            console.error(error);
        }
    };

    this.renderLegend = () => {
        // The legend wrap length threshold should be half of the width
        // Because the pie will never be larger than half the width
        const legendWrapLength = width / 2 - 70; // 70 for the width of the circles and padding
        this.legend = this.pieChartContainer
            .append('g')
            .attr('class', 'legendOrdinal')
            .style('fill', 'currentColor')
            .style('fill-opacity', '0.7')
            .style('font-family', 'inherit')
            .style('font-size', '10px')
            .style('stroke-width', '2px');

        var legendOrdinal = legendColor()
            .orient('vertical')
            .shapePadding(5)
            .labels(legendLabels.map((labelObj) => labelObj.label))
            .labelWrap(legendWrapLength)
            .labelOffset(10)
            .scale(self.legendScale)
            .on('cellclick', (d) => {
                // TODO
                console.log('on legend click', { d });
            });

        console.log({ legendOrdinal });

        this.legend.call(legendOrdinal);

        const legendBBox = this.legend?.node()?.getBBox() ?? {};
        const legendHeight = legendBBox?.height ?? 0;
        const legendWidth = legendBBox?.width ?? 0;
        const legendXPosition = width / 2 - legendWidth - 20;
        const legendYPosition = legendHeight < height - 20 ? (height - legendHeight) / 2 : 15;

        this.legend.attr('transform', `translate(${legendXPosition}, ${legendYPosition})`);
        this.applyStylesForHiddenSeries();
    };

    this.centerVisualization = () => {
        try {
            const containerBBox = this.pieChartContainer?.node()?.getBBox();

            if (!containerBBox) {
                return;
            }

            const containerWidth = containerBBox?.width ?? 0;
            const currentXPosition = containerBBox?.x ?? 0;
            const finalXPosition = (width - containerWidth) / 2;
            const xDelta = finalXPosition - currentXPosition;

            this.pieChartContainer.attr('transform', `translate(${xDelta},0)`);
        } catch (error) {
            console.error(error);
        }
    };

    this.renderPie = () => {
        this.setRadius();

        const { pieChartFn, legendScale } = getPieChartData({
            data: data,
            numberColumnIndex,
            legendLabels,
            chartColors,
        });

        this.dataReady = pieChartFn;
        this.legendScale = legendScale;

        this.pieChartContainer = container
            .append('g')
            .attr('class', 'autoql-vanilla-pie-chart-container')
            .attr('id', `autoql-vanilla-pie-chart-container-${this.CHART_ID}`);

        this.renderPieSlices();
        this.renderLegend();
        this.centerVisualization();
    };

    this.renderPie();

    return this;
}

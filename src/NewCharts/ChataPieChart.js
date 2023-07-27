import {
    applyStylesForHiddenSeries,
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
        outerWidth,
        outerHeight,
        chartColors,
        legendColumn,
    } = params;

    this.innerChartWrapper = container.append('g').attr('class', 'autoql-vanilla-pie-chart-container');

    const { stringColumnIndex, numberColumnIndex } = columnIndexConfig;
    const { dataFormatting } = options;

    const self = this;

    const legendLabels = legend?.labels;

    this.setRadius = () => {
        const PADDING = 20;

        const pieWidth = Math.min(outerWidth / 2 - PADDING, outerHeight - PADDING);

        this.outerRadius = pieWidth / 2;
        this.innerRadius = this.outerRadius - 50 > 15 ? this.outerRadius - 50 : 0;
    };

    this.onSliceClick = (d) => {
        // TODO
        console.log('drilldown click!', { d });
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
        this.slicesContainer = this.innerChartWrapper
            .append('g')
            .attr('class', 'autoql-vanilla-pie-chart-slices')
            .attr('transform', `translate(${outerWidth / 2 + this.outerRadius},${outerHeight / 2})`);

        this.slicesContainer
            .selectAll('.autoql-vanilla-pie-chart-slices')
            .data(self.pieData)
            .enter()
            .append('path')
            .attr('class', 'autoql-vanilla-pie-chart-slice')
            .attr('d', arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius))
            .attr('fill', (d) => d.data?.value?.legendLabel?.color)
            .attr('data-tippy-chart', true)
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
                select(this).style('fill-opacity', 0.7);
            })
            .on('mouseout', function (d) {
                select(this).style('fill-opacity', 1);
            })
            .on('click', this.onSliceClick);

        // render active pie slice if there is one
        self.innerChartWrapper.selectAll('path.autoql-vanilla-pie-chart-slice').each(function (slice) {
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
            // this.legendSwatchElements = this.legend.select(`.label tspan`);
            // this.legendSwatchElements.each(function (d) {
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

    this.onLegendCellClick = (label) => {
        if (!label) {
            console.warn('unable to find legend item that was clicked');
            return;
        }

        const visibleLegendLabels = legendLabels?.filter((l) => !l.hidden);
        const allowClick = label.hidden || visibleLegendLabels?.length > 1;
        if (allowClick) {
            legend.onLegendClick?.(label);
        }
    };

    this.renderLegend = () => {
        // TODO: use existing legend component instead of this custom legend
        // The legend wrap length threshold should be half of the width
        // Because the pie will never be larger than half the width
        const legendWrapLength = outerWidth / 2 - 70; // 70 for the width of the circles and padding
        this.legend = this.innerChartWrapper
            .append('g')
            .attr('class', 'legendOrdinal')
            .style('fill', 'currentColor')
            .style('fill-opacity', 1)
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
            .on('cellclick', function (e, d) {
                const cellElement = e.target?.parentElement?.parentElement;
                const cellDataJson = JSON.parse(select(cellElement).data());
                self.onLegendCellClick(cellDataJson);
            });

        this.legend.call(legendOrdinal);

        const legendBBox = this.legend?.node()?.getBBox() ?? {};
        const legendHeight = legendBBox?.height ?? 0;
        const legendWidth = legendBBox?.width ?? 0;
        const legendXPosition = outerWidth / 2 - legendWidth - 20;
        const legendYPosition = legendHeight < outerHeight - 20 ? (outerHeight - legendHeight) / 2 : 15;

        this.legend.attr('transform', `translate(${legendXPosition}, ${legendYPosition})`);
        this.applyStylesForHiddenSeries();
    };

    this.centerVisualization = () => {
        const chartBBox = this.innerChartWrapper?.node()?.getBBox();

        if (chartBBox) {
            const currentXPosition = chartBBox.x;
            const finalXPosition = (outerWidth - chartBBox.width) / 2;
            const deltaX = finalXPosition - currentXPosition;

            this.innerChartWrapper.attr('transform', `translate(${deltaX},0)`);
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

        this.pieData = pieChartFn;
        this.legendScale = legendScale;

        this.renderPieSlices();
        this.renderLegend();
        this.centerVisualization();
    };

    try {
        this.renderPie();
    } catch (error) {
        this.innerChartWrapper?.select('*')?.remove();
        console.error(error);
    }

    return this;
}

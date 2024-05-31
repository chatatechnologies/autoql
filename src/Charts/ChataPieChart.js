import { getDrilldownData, getPieChartData, getThemeValue, getTooltipContent, legendColor } from 'autoql-fe-utils';
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
        outerWidth,
        outerHeight,
        legendColumn,
        onChartClick,
        activeKey,
    } = params;

    this.innerChartWrapper = container.append('g').attr('class', 'autoql-vanilla-pie-chart-container');

    const { stringColumnIndex, numberColumnIndex } = columnIndexConfig;
    const { dataFormatting } = options;

    const self = this;

    this.activeKey = activeKey;

    const legendLabels = legend?.labels;

    this.setRadius = () => {
        const PADDING = 20;

        const pieWidth = Math.min(outerWidth / 2 - PADDING, outerHeight - PADDING);

        this.outerRadius = pieWidth / 2;
        this.innerRadius = this.outerRadius - 50 > 15 ? this.outerRadius - 50 : 0;
    };

    this.onSliceClick = (element, e) => {
        const sliceData = element['__data__']?.data;

        if (!sliceData) {
            return;
        }

        const newActiveKey = sliceData?.key;

        self.innerChartWrapper.selectAll('path.autoql-vanilla-pie-chart-slice').each(function (slice) {
            select(this)
                // .transition()
                // .duration(500)
                .attr('transform', function (d) {
                    if (d.data.key === newActiveKey) {
                        const a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                        const x = Math.cos(a) * 10;
                        const y = Math.sin(a) * 10;
                        return `translate(${x},${y})`;
                    }

                    return `translate(0,0)`;
                });
        });

        this.activeKey = newActiveKey;

        const drilldownData = getDrilldownData({
            row: Object.values(sliceData.value),
            colIndex: numberColumnIndex,
            columns: columns,
            legendColumn,
            columnIndexConfig,
        });

        onChartClick(drilldownData);
    };

    this.renderPieSlices = () => {
        // Remove if already exists
        this.slicesContainer?.remove();

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
                    legendColumn,
                    dataFormatting,
                    row: d.data.value,
                    columns: columns,
                    colIndex: numberColumnIndex,
                    colIndex2: stringColumnIndex,
                });
            })
            .style('fill-opacity', 1)
            .attr('stroke-width', '0.5px')
            .attr('stroke', getThemeValue('background-color-secondary', CSS_PREFIX))
            .on('mouseover', function (d) {
                select(this).style('fill-opacity', 0.7);
            })
            .on('mouseout', function (d) {
                select(this).style('fill-opacity', 1);
            })
            .on('click', function (e) {
                self.onSliceClick(this, e);
            });

        // render active pie slice if there is one
        self.innerChartWrapper.selectAll('path.autoql-vanilla-pie-chart-slice').each(function (slice) {
            select(this)
                // .transition()
                // .duration(500)
                .attr('transform', function (d) {
                    if (d.data.key === this.activeKey) {
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
            this.legend.selectAll('.cell').each(function (label) {
                let legendLabel;
                try {
                    legendLabel = JSON.parse(label);

                    if (legendLabel) {
                        if (legendLabel.hidden) {
                            select(this).attr('class', 'cell hidden');
                        } else {
                            select(this).attr('class', 'cell visible');
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    this.onLegendCellClick = (legendObjStr) => {
        let legendObj;

        try {
            legendObj = JSON.parse(legendObjStr);
        } catch (error) {
            console.error(error);
            return;
        }

        const index = legendObj?.dataIndex;
        const label = legendLabels?.[index];

        if (!label) {
            console.warn('unable to find legend item that was clicked');
            return;
        }

        const isHidingLabel = !label.hidden;
        const visibleLegendLabels = legendLabels?.filter((l) => !l.hidden);
        const allowClick = !isHidingLabel || visibleLegendLabels?.length > 1;
        if (allowClick) {
            label.hidden = !label.hidden;
            this.renderPie();
        }
    };

    this.renderLegend = () => {
        // Remove if already exists
        this.legend?.remove();

        // TODO: use existing legend component instead of this custom legend
        // The legend wrap length threshold should be half of the width
        // Because the pie will never be larger than half the width

        const legendWrapLength = outerWidth / 2 - 70; // 70 for the width of the circles and padding
        this.legend = this.innerChartWrapper
            .append('g')
            .attr('class', 'autoql-vanilla-chart-legend')
            .style('fill', 'currentColor')
            .style('fill-opacity', 1)
            .style('font-family', 'inherit')
            .style('font-size', '10px')
            .style('stroke-width', '2px')
            .style('stroke', 'none');

        var legendOrdinal = legendColor()
            .orient('vertical')
            .shapePadding(8)
            .labels(legendLabels.map((labelObj) => labelObj.label))
            .labelWrap(legendWrapLength)
            .labelOffset(10)
            .scale(self.legendScale)
            .on('cellclick', function () {
                self.onLegendCellClick(select(this)?.data());
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
            data,
            numberColumnIndex,
            legendLabels,
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

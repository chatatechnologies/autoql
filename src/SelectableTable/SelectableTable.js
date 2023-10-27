import { getDataFormatting } from 'autoql-fe-utils';
import { PopoverChartSelector } from '../../Charts/PopoverChartSelector';
import { CARET_DOWN_ICON } from '../../Svg';
import { createIcon, uuidv4 } from '../../Utils';

import './SelectableTable.scss';

export default function SelectableTable({
    options = {},
    selectedColumns = [],
    disabledColumns = [],
    queryResponse = null,
    onColumnSelection = () => {},
    radio = false,
    showEndOfPreviewMessage = true,
}) {
    this.ID = uuidv4();

    const rows = queryResponse?.data?.data?.rows;
    const columns = queryResponse?.data?.data?.columns;
    const config = getDataFormatting(options.dataFormatting);

    this.createSelectableTable = () => {};

    this.createSelectableTable();

    return this.selectableTable;
}

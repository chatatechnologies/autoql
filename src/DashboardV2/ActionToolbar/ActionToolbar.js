import {
    ChataUtils
} from '../../ChataUtils'
import{
    REPORT_PROBLEM,
    FILTER_TABLE,
    COLUMN_EDITOR,
    VERTICAL_DOTS
} from '../../Svg'
import {
    htmlToElement,
    getSupportedDisplayTypes
} from '../../Utils'
import './ActionToolbar.css'

export function ActionToolbar(idRequest, tileView, tile) {


    var toolbar = htmlToElement(`
        <div class="autoql-vanilla-tile-toolbar actions-toolbar">
        </div>
    `);
    var displayType = tileView.internalDisplayType
    toolbar.getToolbarActionType = (json, displayType) => {
        var toolbarType = 'simple';
        var displayTypes = getSupportedDisplayTypes(json);
        if(displayTypes.length > 1){
            switch (displayType) {
                case 'table':
                case 'pivot_table':
                toolbarType = 'csvCopy';
                break;
                case 'column':
                case 'bar':
                case 'pie':
                case 'line':
                case 'pivot_table':
                case 'heatmap':
                case 'bubble':
                case 'stacked_column':
                case 'stacked_bar':
                toolbarType = 'chart-view';
                default:
            }
        }
        return toolbarType;
    }

    var request = ChataUtils.responses[idRequest];
    let moreOptionsArray = [];
    var type = toolbar.getToolbarActionType(request, displayType);
    var reportProblem = ChataUtils.getReportProblemMenu(
        toolbar,
        idRequest,
        type,
        tile.dashboard.options,
    );

    var reportProblemButton = ChataUtils.getActionButton(
        REPORT_PROBLEM,
        'Report a problem',
        idRequest,
        tileView.reportProblemHandler,
        [reportProblem, toolbar]
    )

    switch (type) {
        case 'simple':
            if(request['reference_id'] !== '1.1.420'){
                toolbar.appendChild(
                    reportProblemButton
                );
                moreOptionsArray.push('copy_sql');
                reportProblem.classList.remove(
                    'chata-popover-single-message'
                );
            }
            break;
        case 'csvCopy':
            var filterBtn = ChataUtils.getActionButton(
                FILTER_TABLE,
                'Filter Table',
                idRequest,
                ChataUtils.filterTableHandler,
                []
            )
            toolbar.appendChild(
                filterBtn
            );
            filterBtn.setAttribute('data-name-option', 'filter-action');

            var columnVisibility = tile.dashboard.options.
            autoQLConfig.enableColumnVisibilityManager
            if(columnVisibility && displayType !== 'pivot_table'){
                toolbar.appendChild(
                    ChataUtils.getActionButton(
                        COLUMN_EDITOR,
                        'Show/Hide Columns',
                        idRequest,
                        tileView.openColumnEditorHandler,
                        [tile.dashboard.options]
                    )
                );
            }
            if(request['reference_id'] !== '1.1.420'){
                toolbar.appendChild(
                    reportProblemButton
                );
            }
            moreOptionsArray.push('csv');
            moreOptionsArray.push('copy');
            moreOptionsArray.push('copy_sql');
            moreOptionsArray.push('notification');
            break;
        case 'chart-view':
            if(request['reference_id'] !== '1.1.420'){
                toolbar.appendChild(
                    reportProblemButton
                );
            }
            moreOptionsArray.push('png');
            moreOptionsArray.push('copy_sql');
            moreOptionsArray.push('notification');
        break;
        case 'safety-net':
        break;
        default:

    }

    let val = ''

    if(tileView.isSecond){
        // val = obj.inputToolbar.input.value;
        // obj.internalQuery = val;
        val = tile.inputQuery.value;
    }else{
        val = tile.inputQuery.value;
    }

    var moreOptions = ChataUtils.getMoreOptionsMenu(
        moreOptionsArray,
        idRequest,
        type,
        {
            caller: tile.dashboard,
            query: val
        }
    );

    var moreOptionsBtn = ChataUtils.getActionButton(
        VERTICAL_DOTS,
        'More options',
        idRequest,
        tileView.moreOptionsHandler,
        [moreOptions, toolbar]
    )
    moreOptionsBtn.classList.add('autoql-vanilla-more-options');

    if(type === 'simple'){
        moreOptions.classList.remove('chata-popover-single-message');
    }

    if(request['reference_id'] !== '1.1.420' && type !== 'safety-net'){
        toolbar.appendChild(
            moreOptionsBtn
        );
        toolbar.appendChild(moreOptions);
        toolbar.appendChild(reportProblem);
    }

    return toolbar;

}

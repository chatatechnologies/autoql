import { getSupportedDisplayTypes } from 'autoql-fe-utils'
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
    showBadge
} from '../../Utils'
import { strings } from '../../Strings'
import './ActionToolbar.css'

export function ActionToolbar(idRequest, tileView, tile) {

    const getBadge = () => {
        return htmlToElement(
            `<div class="autoql-vanilla-badge"></div>`
        )
    }

    var toolbar = htmlToElement(`
        <div
        class="
            autoql-vanilla-tile-toolbar
            actions-toolbar
            autoql-vanilla-viz-toolbar">
        </div>
    `);
    var displayType = tileView.internalDisplayType
    toolbar.getToolbarActionType = (json, displayType) => {
        var toolbarType = 'simple';
        var displayTypes = getSupportedDisplayTypes({ response: { data: json }});
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
                case 'heatmap':
                case 'bubble':
                case 'stacked_column':
                case 'stacked_bar':
                case 'stacked_line':
                toolbarType = 'chart-view';
                break
                default:
            }
        }
        return toolbarType;
    }

    var request = ChataUtils.responses[idRequest];
    let moreOptionsArray = [];
    var type = toolbar.getToolbarActionType(request, displayType);
    var reportProblem = ChataUtils.makeReportProblemMenu(
        toolbar,
        idRequest,
        type,
        tile.dashboard.options,
    );

    var reportProblemButton = ChataUtils.getActionButton(
        REPORT_PROBLEM,
        strings.reportProblemTitle,
        idRequest,
        tileView.reportProblemHandler,
        [reportProblem, toolbar]
    )

    const autoQLConfig = tile.dashboard?.options?.autoQLConfig ?? {}

    switch (type) {
        case 'simple':
            if(request['reference_id'] !== '1.1.420'){
                toolbar.appendChild(
                    reportProblemButton
                );
				autoQLConfig.debug && moreOptionsArray.push('copy_sql');
                autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
                reportProblem.classList.remove(
                    'chata-popover-single-message'
                );
            }
            break;
        case 'csvCopy':
            var filterBtn = ChataUtils.getActionButton(
                FILTER_TABLE,
                strings.filterTable,
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
                let badge = getBadge()
                let editorBtn = ChataUtils.getActionButton(
                    COLUMN_EDITOR,
                    strings.showHideCols,
                    idRequest,
                    tileView.openColumnEditorHandler,
                    [tile.dashboard.options, badge]
                )

                editorBtn.appendChild(badge)
                toolbar.appendChild(
                    editorBtn
                );

                if(showBadge(request)){
                    badge.style.visibility = 'visible'
                }else{
                    badge.style.visibility = 'hidden'
                }
            }
            if(request['reference_id'] !== '1.1.420'){
                toolbar.appendChild(
                    reportProblemButton
                );
            }
            autoQLConfig.enableCSVDownload && moreOptionsArray.push('csv');
            moreOptionsArray.push('copy');
			autoQLConfig.debug && moreOptionsArray.push('copy_sql');
            autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
            break;
        case 'chart-view':
            if(request['reference_id'] !== '1.1.420'){
                toolbar.appendChild(
                    reportProblemButton
                );
            }
            moreOptionsArray.push('png');
			autoQLConfig.debug && moreOptionsArray.push('copy_sql');
            autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
        break;
        case 'safety-net':
        break;
        default:

    }

    let val = ''

    val = tileView.getQuery()

    var moreOptions = ChataUtils.getMoreOptionsMenu(
        moreOptionsArray,
        idRequest,
        type,
        {
            caller: tile.dashboard,
            query: val
        }
    );

    let moreOptionsBtn

    moreOptionsBtn = ChataUtils.getActionButton(
        VERTICAL_DOTS,
        strings.moreOptions,
        idRequest,
        tileView.moreOptionsHandler,
        [moreOptionsArray, toolbar]
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
    }

    toolbar.moreOptionsBtn = moreOptionsBtn
    toolbar.reportProblemButton = reportProblemButton

    return toolbar;

}

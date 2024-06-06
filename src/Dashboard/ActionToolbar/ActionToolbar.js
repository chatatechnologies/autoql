import tippy from 'tippy.js';
import MobileDetect from 'mobile-detect';
import { getDefaultDisplayType, getSupportedDisplayTypes, isChartType, isTableType } from 'autoql-fe-utils';

import {
    REPORT_PROBLEM,
    FILTER_TABLE,
    COLUMN_EDITOR,
    VERTICAL_DOTS,
    DOWNLOAD_CSV_ICON,
    CLIPBOARD_ICON,
    EXPORT_PNG_ICON,
    COPY_SQL,
    NOTIFICATION_BUTTON,
} from '../../Svg';

import { strings } from '../../Strings';
import { ChataUtils } from '../../ChataUtils';
import { ChataPopover } from '../../ChataComponents';
import { closeAllToolbars, htmlToElement, showBadge } from '../../Utils';
import { DataAlertCreationModal } from '../../Notifications/DataAlerts/Components/DataAlertCreationModal';

import './ActionToolbar.scss';

var md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile() === null ? false : true;

const getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
    var button = htmlToElement(`
        <button
            class="autoql-vanilla-chata-toolbar-btn"
            data-id="${idRequest}">
            ${svg}
        </button>
    `);
    const buttonTooltip = tippy(button);
    if (!isMobile) {
        buttonTooltip.setContent(tooltip);
        buttonTooltip.setProps({
            theme: 'chata-theme',
            delay: [500],
        });
    } else {
        buttonTooltip.disable();
    }
    button.onclick = (evt) => {
        onClick?.apply?.(null, [evt, idRequest, ...evtParams]);
    };

    return button;
};

export function ActionToolbar(idRequest, tileView, tile) {
    var request = ChataUtils.responses[idRequest];

    const getBadge = () => {
        return htmlToElement(`<div class="autoql-vanilla-badge"></div>`);
    };

    const toolbar = htmlToElement(`
        <div
        class="
            autoql-vanilla-tile-toolbar
            actions-toolbar
            autoql-vanilla-viz-toolbar">
        </div>
    `);

    var displayType = tileView?.queryOutput?.displayType ?? getDefaultDisplayType({ data: request });

    toolbar.getToolbarActionType = (json, displayType) => {
        var toolbarType = 'simple';
        var displayTypes = getSupportedDisplayTypes({ response: { data: json } });
        if (displayTypes.length > 1) {
            if (isChartType(displayType)) {
                toolbarType = 'chart-view';
            } else if (isTableType(displayType)) {
                toolbarType = 'csvCopy';
            }
        }
        return toolbarType;
    };

    let moreOptionsArray = [];
    var type = toolbar.getToolbarActionType(request, displayType);
    var reportProblem = ChataUtils.makeReportProblemMenu(toolbar, idRequest, type, tile.dashboard.options);

    var reportProblemButton = getActionButton(
        REPORT_PROBLEM,
        strings.reportProblemTitle,
        idRequest,
        () => {
            ChataUtils.openModalReport(idRequest, tileView?.queryOutput?.options);
        },
        [reportProblem, toolbar],
    );

    const autoQLConfig = tile.dashboard?.options?.autoQLConfig ?? {};

    switch (type) {
        case 'simple':
            if (request['reference_id'] !== '1.1.420') {
                toolbar.appendChild(reportProblemButton);
                autoQLConfig.debug && moreOptionsArray.push('copy_sql');
                autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
                reportProblem.classList.remove('chata-popover-single-message');
            }
            break;
        case 'csvCopy':
            var filterBtn = getActionButton(
                FILTER_TABLE,
                strings.filterTable,
                idRequest,
                () => {
                    tileView?.queryOutput?.toggleTableFiltering();
                },
                [],
            );
            toolbar.appendChild(filterBtn);
            filterBtn.setAttribute('data-name-option', 'filter-action');

            var columnVisibility = tile.dashboard.options.autoQLConfig.enableColumnVisibilityManager;

            if (columnVisibility && displayType !== 'pivot_table') {
                let badge = getBadge();
                let editorBtn = getActionButton(
                    COLUMN_EDITOR,
                    strings.showHideCols,
                    idRequest,
                    tileView.openColumnEditorHandler,
                    [tile.dashboard.options, badge],
                );

                editorBtn.appendChild(badge);
                toolbar.appendChild(editorBtn);

                if (showBadge(request)) {
                    badge.style.visibility = 'inherit';
                } else {
                    badge.style.visibility = 'hidden';
                }
            }
            if (request['reference_id'] !== '1.1.420') {
                toolbar.appendChild(reportProblemButton);
            }
            autoQLConfig.enableCSVDownload && moreOptionsArray.push('csv');
            moreOptionsArray.push('copy');
            autoQLConfig.debug && moreOptionsArray.push('copy_sql');
            autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
            break;
        case 'chart-view':
            if (request['reference_id'] !== '1.1.420') {
                toolbar.appendChild(reportProblemButton);
            }
            moreOptionsArray.push('png');
            autoQLConfig.debug && moreOptionsArray.push('copy_sql');
            autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
            break;
        case 'safety-net':
            break;
        default:
    }

    let val = '';

    val = tileView.getQuery();

    let moreOptionsBtn;

    const makeMoreOptionsMenu = (idRequest, chataPopover, options, extraParams = {}) => {
        var ul = document.createElement('ul');
        ul.classList.add('chata-menu-list');
        for (var i = 0; i < options.length; i++) {
            let opt = options[i];
            let action;
            switch (opt) {
                case 'csv':
                    action = ChataUtils.getActionOption(
                        DOWNLOAD_CSV_ICON,
                        strings.downloadCSV,
                        () => {
                            const showSuccessMessage = true;
                            tileView?.queryOutput?.downloadCSV(showSuccessMessage);
                        },
                        [idRequest],
                    );
                    action.setAttribute('data-name-option', 'csv-handler');
                    ul.appendChild(action);
                    break;
                case 'copy':
                    action = ChataUtils.getActionOption(
                        CLIPBOARD_ICON,
                        strings.copyTable,
                        () => {
                            tileView?.queryOutput?.copyTableToClipboard();
                        },
                        [idRequest],
                    );
                    action.setAttribute('data-name-option', 'copy-csv-handler');
                    ul.appendChild(action);
                    break;
                case 'copy_sql':
                    action = ChataUtils.getActionOption(
                        COPY_SQL,
                        strings.viewSQL,
                        () => {
                            tileView?.queryOutput?.copySQL?.();
                        },
                        [idRequest],
                    );
                    ul.appendChild(action);
                    break;
                case 'png':
                    action = ChataUtils.getActionOption(
                        EXPORT_PNG_ICON,
                        strings.downloadPNG,
                        () => {
                            tileView?.queryOutput?.exportToPNG?.();
                        },
                        [idRequest],
                    );
                    ul.appendChild(action);
                    break;
                case 'notification':
                    action = ChataUtils.getActionOption(
                        NOTIFICATION_BUTTON,
                        strings.createAlert,
                        () => {
                            const modal = new DataAlertCreationModal({
                                queryResponse: request,
                                authentication: tile?.dashboard?.options?.authentication,
                                options: tile?.dashboard?.options,
                            });
                            modal.show();
                        },
                        [idRequest, extraParams],
                    );
                    ul.appendChild(action);
                    break;
                default:
            }
        }
        return ul;
    };

    moreOptionsBtn = getActionButton(
        VERTICAL_DOTS,
        strings.moreOptions,
        idRequest,
        (evt, idRequest, moreOptions, toolbar) => {
            closeAllToolbars();

            var popover = new ChataPopover({ baseParent: toolbar, placement: 'top', alignment: 'end' });
            popover.classList.add('autoql-vanilla-dashboard-action-toolbar-popover');

            const opts = makeMoreOptionsMenu(idRequest, popover, moreOptions, {
                caller: tile.dashboard,
                query: tileView.getQuery(),
            });

            popover.appendChild(opts);
            popover?.show?.();
        },

        [moreOptionsArray, toolbar],
    );

    moreOptionsBtn.classList.add('autoql-vanilla-more-options');

    if (request['reference_id'] !== '1.1.420' && type !== 'safety-net') {
        toolbar.appendChild(moreOptionsBtn);
    }

    toolbar.moreOptionsBtn = moreOptionsBtn;
    toolbar.reportProblemButton = reportProblemButton;

    return toolbar;
}

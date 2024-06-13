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
    TRASH_ICON,
} from '../Svg';

import { strings } from '../Strings';
import { ChataUtils } from '../ChataUtils';
import { ChataPopover } from '../ChataComponents';
import { closeAllToolbars, htmlToElement, showBadge } from '../Utils';
import { DataAlertCreationModal } from '../Notifications/DataAlerts/Components/DataAlertCreationModal';

import './OptionsToolbar.scss';

var md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile() === null ? false : true;

const getActionOption = (svg, text, onClick, params) => {
    var element = htmlToElement(`
        <li>
            <span class="chata-icon more-options-icon">
                ${svg}
            </span>
            ${text}
        </li>
    `);

    element.onclick = () => {
        onClick.apply(null, params);
    };

    return element;
};

const getActionButton = (svg, tooltip, idRequest, onClick, evtParams = []) => {
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

export function OptionsToolbar(idRequest, queryOutput, options) {
    const toolbar = document.createElement('div');

    var request = ChataUtils.responses[queryOutput?.uuid];

    if (!request) {
        return toolbar;
    }

    if (!options.deleteCallback) {
        options.deleteCallback = () => {};
    }

    toolbar.classList.add('autoql-vanilla-tile-toolbar');
    toolbar.classList.add('actions-toolbar');
    toolbar.classList.add('autoql-vanilla-viz-toolbar');

    const Badge = () => htmlToElement(`<div class="autoql-vanilla-badge"></div>`);

    const renderOptions = () => {
        toolbar.innerHTML = '';

        var displayType = queryOutput?.displayType ?? getDefaultDisplayType({ data: request });

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

        var reportProblemButton = getActionButton(REPORT_PROBLEM, strings.reportProblemTitle, idRequest, () => {
            ChataUtils.openModalReport(idRequest, queryOutput?.options);
        });

        const autoQLConfig = options?.autoQLConfig ?? {};

        switch (type) {
            case 'simple':
                if (request['reference_id'] !== '1.1.420') {
                    toolbar.appendChild(reportProblemButton);
                    autoQLConfig.debug && moreOptionsArray.push('copy_sql');
                    autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
                }
                break;
            case 'csvCopy':
                var filterBtn = getActionButton(FILTER_TABLE, strings.filterTable, idRequest, () => {
                    queryOutput?.toggleTableFiltering();
                });
                toolbar.appendChild(filterBtn);
                filterBtn.setAttribute('data-name-option', 'filter-action');

                var columnVisibility = options.autoQLConfig.enableColumnVisibilityManager;

                if (columnVisibility && displayType !== 'pivot_table') {
                    let badge = Badge();
                    let editorBtn = getActionButton(COLUMN_EDITOR, strings.showHideCols, idRequest, (evt, id) => {
                        ChataUtils.showColumnEditor(
                            id,
                            options,
                            () => {
                                if (showBadge(request)) {
                                    badge.style.visibility = 'visible';
                                } else {
                                    badge.style.visibility = 'hidden';
                                }
                            },
                            queryOutput,
                        );
                    });

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

        if (options.enableDeleteBtn) {
            const deleteBtn = getActionButton(
                TRASH_ICON,
                strings.deleteDataResponse,
                idRequest,
                options.deleteCallback,
            );
            deleteBtn.setAttribute('data-name-option', 'delete-action');
            toolbar.appendChild(deleteBtn);
        }

        let moreOptionsBtn;

        const makeMoreOptionsMenu = (idRequest, options) => {
            var ul = document.createElement('ul');
            ul.classList.add('chata-menu-list');
            for (var i = 0; i < options.length; i++) {
                let opt = options[i];
                let action;
                switch (opt) {
                    case 'csv':
                        action = getActionOption(DOWNLOAD_CSV_ICON, strings.downloadCSV, () => {
                            const showSuccessMessage = true;
                            queryOutput?.downloadCSV(showSuccessMessage);
                        });
                        action.setAttribute('data-name-option', 'csv-handler');
                        ul.appendChild(action);
                        break;
                    case 'copy':
                        action = getActionOption(CLIPBOARD_ICON, strings.copyTable, () => {
                            queryOutput?.copyTableToClipboard();
                        });
                        action.setAttribute('data-name-option', 'copy-csv-handler');
                        ul.appendChild(action);
                        break;
                    case 'copy_sql':
                        action = getActionOption(COPY_SQL, strings.viewSQL, () => {
                            queryOutput?.copySQL?.();
                        });
                        ul.appendChild(action);
                        break;
                    case 'png':
                        action = getActionOption(EXPORT_PNG_ICON, strings.downloadPNG, () => {
                            queryOutput?.exportToPNG?.();
                        });
                        ul.appendChild(action);
                        break;
                    case 'notification':
                        action = getActionOption(NOTIFICATION_BUTTON, strings.createAlert, () => {
                            const modal = new DataAlertCreationModal({
                                queryResponse: request,
                                authentication: options?.authentication,
                                options: options,
                            });
                            modal.show();
                        });
                        ul.appendChild(action);
                        break;
                    default:
                }
            }
            return ul;
        };

        moreOptionsBtn = getActionButton(VERTICAL_DOTS, strings.moreOptions, idRequest, () => {
            closeAllToolbars();

            var popover = new ChataPopover({
                baseParent: toolbar,
                placement: obj.popoverPlacement ?? 'top',
                alignment: 'end',
            });
            popover.classList.add('autoql-vanilla-dashboard-action-toolbar-popover');

            const opts = makeMoreOptionsMenu(request, moreOptionsArray);

            popover.appendChild(opts);
            popover?.show?.();
        });

        moreOptionsBtn.classList.add('autoql-vanilla-more-options');

        if (request['reference_id'] !== '1.1.420' && type !== 'safety-net') {
            toolbar.appendChild(moreOptionsBtn);
        }

        toolbar.moreOptionsBtn = moreOptionsBtn;
        toolbar.reportProblemButton = reportProblemButton;
    };

    renderOptions();

    toolbar.refreshToolbar = renderOptions;

    return toolbar;
}

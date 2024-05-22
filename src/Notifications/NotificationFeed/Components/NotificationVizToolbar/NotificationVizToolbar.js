import { getSupportedDisplayTypes, DisplayTypes, isChartType } from 'autoql-fe-utils';

import { strings } from '../../../../Strings';
import { createIcon } from '../../../../Utils';
import { MoreOptionsVizToolbar } from '../MoreOptionsVizToolbar';
import { FILTER_TABLE, MORE_OPTIONS, DISPLAY_TYPE_ICONS } from '../../../../Svg';

import './NotificationVizToolbar.scss';

export function NotificationVizToolbar({ response, notificationItem }) {
    const container = document.createElement('div');

    // var rightButtons = document.createElement('div');
    // var leftButtons = document.createElement('div');

    const moreOptionsPopup = new MoreOptionsVizToolbar({ notificationItem });
    this.displayType = response?.data?.data.display_type;
    this.selectedBtn = undefined;

    this.createToolbarButton = (svg) => {
        const icon = createIcon(svg);
        const button = document.createElement('button');

        button.classList.add('autoql-vanilla-toolbar-btn');
        button.appendChild(icon);
        return button;
    };

    this.createToolbar = () => {
        const toolbar = document.createElement('div');
        toolbar.classList.add('autoql-vanilla-autoql-toolbar');
        return toolbar;
    };

    this.createLeftButtons = () => {
        if (container.leftButtons) {
            container.leftButtons.innerHTML = '';
        }

        const leftButtons = this.createToolbar();
        leftButtons.classList.add('autoql-vanilla-viz-toolbar');
        const supportedDisplayTypes = getSupportedDisplayTypes({ response });

        supportedDisplayTypes.forEach((dType) => {
            const btn = this.createToolbarButton(DISPLAY_TYPE_ICONS[dType]);

            if (btn) {
                btn.setAttribute('data-tippy-content', strings.displayTypes[dType]);
                btn.onclick = () => {
                    this.displayType = dType;
                    this.selectedBtn.classList.remove('autoql-vanilla-toolbar-btn-selected');
                    btn.classList.add('autoql-vanilla-toolbar-btn-selected');
                    this.selectedBtn = btn;
                    notificationItem.showResponse(dType);
                    moreOptionsPopup.close();
                    this.createRightButtons();
                };
                leftButtons.appendChild(btn);
            }

            if (this.displayType === dType || (this.displayType == 'data' && dType == DisplayTypes.TABLE)) {
                btn.classList.add('autoql-vanilla-toolbar-btn-selected');
                this.selectedBtn = btn;
            }
        });

        container.leftButtons = leftButtons;
        container.appendChild(leftButtons);
    };

    this.createRightButtons = () => {
        if (container.rightButtons) {
            container.rightButtons.innerHTML = '';
        }

        const rightButtons = this.createToolbar();

        rightButtons.innerHTML = '';
        rightButtons.classList.add('autoql-vanilla-options-toolbar');
        const filterButton = this.createToolbarButton(FILTER_TABLE);
        const moreOptionsBtn = this.createToolbarButton(MORE_OPTIONS);

        filterButton.onclick = () => {
            moreOptionsPopup.close();

            if (this.displayType !== DisplayTypes.TABLE) {
                notificationItem.showResponse(DisplayTypes.TABLE);
                this.displayType = DisplayTypes.TABLE;
            }

            notificationItem.handleFilterClick();
        };

        moreOptionsBtn.onclick = () => {
            const right = 210;
            const bottom = 60;
            const pos = moreOptionsBtn.getBoundingClientRect();
            moreOptionsPopup.open({
                x: pos.left - right,
                y: pos.top - bottom,
                displayType: this.displayType,
            });
        };

        filterButton.setAttribute('data-tippy-content', strings.filterTable);
        moreOptionsBtn.setAttribute('data-tippy-content', strings.moreOptions);

        rightButtons.appendChild(filterButton);
        rightButtons.appendChild(moreOptionsBtn);

        container.rightButtons = rightButtons;
        container.appendChild(rightButtons);
    };

    container.classList.add('autoql-vanilla-notification-toolbar-container');

    this.createLeftButtons();
    this.createRightButtons();

    return container;
}

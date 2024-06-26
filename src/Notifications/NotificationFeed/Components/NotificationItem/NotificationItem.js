import {
    deleteNotification,
    dismissNotification,
    fetchNotificationData,
    markNotificationAsUnread,
    getFormattedTimestamp,
} from 'autoql-fe-utils';

import { CALENDAR, CARET_DOWN_ICON, VERTICAL_DOTS, WARNING_TRIANGLE } from '../../../../Svg';
import { createIcon } from '../../../../Utils';
import { NotificationMessageError } from '../NotificationMessageError';
import { NotificationSummary } from '../NotificationSummary';
import { NotificationDataContainer } from '../NotificationDataContainer';
import { refreshTooltips } from '../../../../Tooltips';
import { MoreOptionsPopup } from '../MoreOptionsPopup';
import { DataAlertEditModal } from '../../../DataAlerts/Components/DataAlertEditModal/DataAlertEditModal';

import './NotificationItem.scss';

const dataAlertErrorName = 'Data Alert Error';
const DELAY = 0.08;

export function NotificationItem({ itemData, authentication, index, onClick, widgetOptions, dataAlert }) {
    const item = document.createElement('div');
    const moreOptionsPopup = new MoreOptionsPopup({
        notificationItem: this,
        dataAlert,
        authentication,
    });

    this.queryResponse = undefined;
    this.isOpen = false;

    this.getLoadingDots = () => {
        const loading = document.createElement('div');
        const dotsContainer = document.createElement('div');
        loading.classList.add('autoql-vanilla-loading-wrapper');
        loading.classList.add('autoql-vanilla-notification-content-loading');
        dotsContainer.classList.add('autoql-vanilla-response-loading');

        for (let index = 0; index < 4; index++) {
            dotsContainer.appendChild(document.createElement('div'));
        }

        loading.appendChild(dotsContainer);
        return loading;
    };

    this.createMessageError = () => {
        return new NotificationMessageError({ itemData, authentication });
    };

    this.createSummary = () => {
        return new NotificationSummary({ itemData, queryResponse: this.queryResponse });
    };

    this.createNotificationResponse = () => {
        return new NotificationDataContainer({ queryResponse: this.queryResponse, widgetOptions });
    };

    this.createStrip = () => {
        const strip = document.createElement('div');
        strip.classList.add('autoql-vanilla-notification-alert-strip');

        return strip;
    };

    this.createHoverOverlay = () => {
        const overlay = document.createElement('div');
        overlay.classList.add('autoql-vanilla-notification-item-hover-overlay');

        return overlay;
    };

    this.showDataAlertEditModal = () => {
        const modal = new DataAlertEditModal({ dataAlertItem: item, dataAlert, authentication });
        modal.show();
        moreOptionsPopup.close();
    };

    this.delete = async () => {
        try {
            item.classList.add('autoql-vanilla-notification-item-deleted');
            moreOptionsPopup.close();
            await deleteNotification({ notificationId: itemData.id, ...authentication });
            setTimeout(() => {
                item.remove();
            }, 500);
        } catch (error) {
            console.error(error);
        }
    };

    this.createMoreOptionsBtn = () => {
        const btnContainer = document.createElement('div');
        const moreOptions = createIcon(VERTICAL_DOTS);

        btnContainer.classList.add('autoql-vanilla-notification-options-btn-container');
        moreOptions.classList.add('autoql-vanilla-notification-options-btn');
        btnContainer.appendChild(moreOptions);

        moreOptions.onclick = (event) => {
            event.stopPropagation();
            const right = 290;
            const pos = moreOptions.getBoundingClientRect();
            moreOptionsPopup.open({ x: pos.left - right, y: pos.top + 2 });
        };
        return btnContainer;
    };

    this.createExpandArrow = () => {
        const expandArrow = document.createElement('div');
        const caredDown = createIcon(CARET_DOWN_ICON);

        expandArrow.classList.add('autoql-vanilla-notification-item-expand-arrow');
        expandArrow.appendChild(caredDown);

        return expandArrow;
    };

    this.handleDismissClick = async () => {
        const response = await this.dismissNotification();
        if (response.status === 200) {
            item.setAsRead();
        }
    };

    this.handleMarkAsUnreadClick = async () => {
        const response = await this.markNotificationAsUnread();
        if (response.status === 200) {
            item.setAsUnread();
        }
    };

    this.dismissNotification = async () => {
        const response = await dismissNotification({
            notificationId: itemData.id,
            ...authentication,
        });

        return response;
    };

    this.markNotificationAsUnread = async () => {
        const response = await markNotificationAsUnread({
            notificationId: itemData.id,
            ...authentication,
        });

        return response;
    };

    this.hasError = () => {
        return itemData.outcome === 'ERROR' && this.queryResponse?.data?.hasQueryResult !== false;
    };

    this.isUnread = () => {
        return itemData.state !== 'DISMISSED';
    };

    this.createContent = () => {
        const content = document.createElement('div');
        const contentContainer = document.createElement('div');
        const loading = this.getLoadingDots();

        content.classList.add('autoql-vanilla-notification-expanded-content');
        content.classList.add('autoql-vanilla-notification-content-collapsed');
        contentContainer.classList.add('autoql-vanilla-notification-content-container');

        content.appendChild(contentContainer);
        content.appendChild(loading);

        this.content = content;
        this.contentContainer = contentContainer;

        this.loading = loading;

        return content;
    };

    this.fetchNotification = async () => {
        try {
            const response = await fetchNotificationData({ ...authentication, id: itemData.id });
            return response;
        } catch (error) {
            console.error(error);
        }
    };

    this.handleExpand = async () => {
        onClick(item);
        if (this.isOpen) {
            item.collapse();
        } else {
            item.expand();
        }
        item.toggleOpen();
    };

    this.createItem = () => {
        const { title, message } = itemData;
        const header = document.createElement('div');
        const displayNameContainer = document.createElement('div');
        const displayName = document.createElement('div');
        const description = document.createElement('div');
        const timestampContainer = document.createElement('div');
        const timestamp = document.createElement('span');

        header.classList.add('autoql-vanilla-notification-list-item-header');
        displayNameContainer.classList.add('autoql-vanilla-notification-display-name-container');
        displayName.classList.add('autoql-vanilla-notification-display-name');
        description.classList.add('autoql-vanilla-notification-description');
        timestampContainer.classList.add('autoql-vanilla-notification-timestamp-container');
        timestamp.classList.add('autoql-vanilla-notification-timestamp');

        if (!this.hasError()) {
            displayName.textContent = title;
            description.textContent = message;
        } else {
            displayName.appendChild(createIcon(WARNING_TRIANGLE));
            displayName.appendChild(document.createTextNode(dataAlertErrorName));
            description.textContent = `Your Data Alert "${title}" encountered a problem. Click for more information.`;
        }

        const formattedTimeStamp = getFormattedTimestamp?.(itemData.created_at);

        timestamp.appendChild(createIcon(CALENDAR));
        timestamp.appendChild(document.createTextNode(formattedTimeStamp));

        timestampContainer.appendChild(timestamp);
        displayNameContainer.appendChild(displayName);
        displayNameContainer.appendChild(description);
        displayNameContainer.appendChild(timestampContainer);

        header.appendChild(displayNameContainer);
        header.appendChild(this.createMoreOptionsBtn());
        header.appendChild(this.createExpandArrow());
        item.appendChild(header);
        item.appendChild(this.createContent());

        item.appendChild(this.createHoverOverlay());
        this.header = header;
        this.header.onclick = this.handleExpand;
    };

    if (this.hasError()) {
        item.classList.add('autoql-vanilla-notification-error');
    }
    if (this.isUnread()) {
        item.classList.add('autoql-vanilla-notification-unread');
    }
    item.appendChild(this.createStrip());

    item.expand = async () => {
        this.content.classList.remove('autoql-vanilla-notification-content-collapsed');
        this.content.classList.add('autoql-vanilla-notification-expanded');
        item.classList.remove('autoql-vanilla-notification-collapsed');
        if (this.isUnread()) {
            this.handleDismissClick();
        }

        this.createContentResponse();
    };

    this.createContentResponse = async () => {
        if (this.queryResponse !== undefined) return;

        const response = await this.fetchNotification();

        this.queryResponse = response;

        this.loading.remove();

        if (this.hasError()) {
            this.contentContainer.appendChild(this.createMessageError());
            return;
        }

        if (response && response.data?.hasQueryResult !== false) {
            this.contentContainer.appendChild(this.createSummary());
            this.contentContainer.appendChild(this.createNotificationResponse());
        }

        refreshTooltips();
    };

    item.collapse = () => {
        this.content.classList.add('autoql-vanilla-notification-content-collapsed');
        this.content.classList.remove('autoql-vanilla-notification-expanded');
        item.classList.add('autoql-vanilla-notification-collapsed');
    };

    item.toggleOpen = () => {
        this.isOpen = !this.isOpen;
    };

    item.setIsOpen = (val) => {
        this.isOpen = val;
    };

    item.setAsRead = () => {
        item.classList.remove('autoql-vanilla-notification-unread');
        itemData.state = 'DISMISSED';
    };

    item.setAsUnread = () => {
        item.classList.add('autoql-vanilla-notification-unread');
        itemData.state = 'ACKNOWLEDGED';
    };

    this.createItem();
    item.classList.add('autoql-vanilla-notification-list-item');
    item.classList.add('autoql-vanilla-notification-collapsed');
    item.style.animationDelay = DELAY * index + 's';

    return item;
}

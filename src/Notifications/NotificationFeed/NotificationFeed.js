import { dismissAllNotifications, fetchDataAlerts, fetchNotificationFeed } from "autoql-fe-utils";
import { MARK_ALL } from "../../Svg";
import { checkAndApplyTheme, createIcon } from "../../Utils";
import { NotificationItem } from "./Components/NotificationItem/NotificationItem";
import { refreshTooltips } from "../../Tooltips";
import { Popup } from "../../Popup";
import emptyStateImg from '../../images/notifications_empty_state.png'

import './NotificationFeed.scss';

export function NotificationFeed(selector, options) {
  checkAndApplyTheme();
  const container = document.createElement('div');
  const parent = document.querySelector(selector);
  const itemsContainer = document.createElement('div');
  
  itemsContainer.classList.add('autoql-vanilla-notification-feed-list');
  parent.classList.add('autoql-vanilla-notifiation-list');
  
  this.expandedNotification = undefined;
  
  container.options = {
    authentication: {
      token: undefined,
      apiKey: undefined,
      customerId: undefined,
      userId: undefined,
      username: undefined,
        domain: undefined,
        demo: false,
        ...(options.authentication ?? {}),
      },
      dataFormatting: {
        currencyCode: 'USD',
        languageCode: 'en-US',
        currencyDecimals: 2,
        quantityDecimals: 1,
        comparisonDisplay: 'PERCENT',
        monthYearFormat: 'MMM YYYY',
        dayMonthYearFormat: 'MMM D, YYYY',
        ...(options.dataFormatting ?? {}),
      },
      autoQLConfig: {
        debug: false,
        test: false,
        enableAutocomplete: true,
        enableQueryValidation: true,
        enableQuerySuggestions: true,
        enableColumnVisibilityManager: true,
        enableDrilldowns: true,
        ...(options.autoQLConfig ?? {}),
      },
      enableDynamicCharting: true,
      onExpandCallback: () => {},
      onCollapseCallback: () => {},
      activeNotificationData: undefined,
      showNotificationDetails: true,
      showDescription: true,
      onErrorCallback: () => {},
      onSuccessCallback: () => {},
      autoChartAggregations: true,
      pageSize: 500,
      ...options
    };
    
    container.limit = 10;
    container.offset = 0;
    
  this.createConfirmPopup = () => {
    const confirmPopup = new Popup();
    const confirmContent = document.createElement('div');
    const popoverTitle = document.createElement('div');
    const buttonContainer = document.createElement('div');
    const btnCancel = document.createElement('button');
    const btnConfirm = document.createElement('button');
    confirmContent.classList.add('autoql-vanilla-confirm-popover-content');
    popoverTitle.classList.add('autoql-vanilla-confirm-popover-title');
    buttonContainer.classList.add('autoql-vanilla-confirm-popover-button-container');
    btnCancel.classList.add('autoql-vanilla-chata-btn');
    btnCancel.classList.add('autoql-vanilla-default');
    btnCancel.classList.add('autoql-vanilla-medium');
    btnConfirm.classList.add('autoql-vanilla-chata-btn');
    btnConfirm.classList.add('autoql-vanilla-primary');
    btnConfirm.classList.add('autoql-vanilla-medium');
    
    popoverTitle.textContent = 'Mark all as read?';
    btnCancel.textContent = 'Cancel';
    btnConfirm.textContent = 'Yes';
    
    btnCancel.onclick = () => {
      confirmPopup.close();
    }
    
    btnConfirm.onclick = async() => {
      const {
        authentication
      } = container.options;
      confirmPopup.close();
      await dismissAllNotifications({ ...authentication });
      const items = itemsContainer.childNodes;
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        element.setAsRead();
      }
    }
    
    buttonContainer.appendChild(btnCancel);
    buttonContainer.appendChild(btnConfirm);
    confirmContent.appendChild(popoverTitle);
    confirmContent.appendChild(buttonContainer);
    confirmPopup.appendChild(confirmContent);
    
    return confirmPopup;
  }
  
  this.createTopOptions = () => {
    const optionsContainer = document.createElement('div');
    const gap = document.createElement('div');
    const confirmPopoverButton = document.createElement('div');
    const markAllButton = document.createElement('div');
    const popup = this.createConfirmPopup();

    markAllButton.classList.add('autoql-vanilla-notification-mark-all');
    confirmPopoverButton.classList.add('autoql-vanilla-confirm-popover-click-wrapper');
    optionsContainer.classList.add('autoql-vanilla-notification-feed-top-options-container');
    
    markAllButton.appendChild(createIcon(MARK_ALL));
    markAllButton.appendChild(document.createTextNode('Mark all as read'));

    markAllButton.onclick = () => {
      const pos = markAllButton.getBoundingClientRect();
      const right = 100;

      popup.show({ x: pos.left - right, y: pos.bottom + 2 });
    }
    
    confirmPopoverButton.appendChild(markAllButton);
    optionsContainer.appendChild(gap);
    optionsContainer.appendChild(confirmPopoverButton);
    
    return optionsContainer;
  }
  
  this.fetchFeed = async() => {
    const {
      domain,
      apiKey,
      token,
    } = container.options.authentication;
    
    const {
      offset,
      limit
    } = container;
    const response = await fetchNotificationFeed({
      domain,
      apiKey,
      token,
      offset,
      limit
    });

    return response;
  }

  this.showLoading = () => {
    const loading = document.createElement('div');
    const dotsContainer = document.createElement('div');
    loading.classList.add('autoql-vanilla-loading-wrapper');
    dotsContainer.classList.add('autoql-vanilla-response-loading');

    for (let index = 0; index < 4; index++) {
      dotsContainer.appendChild(document.createElement('div'))
    }
    
    loading.appendChild(dotsContainer);
    container.appendChild(loading);
    return loading;
  }

  this.collapsePreviousNotification = (newItem) => {
    if(this.expandedNotification === newItem) return;

    if(this.expandedNotification) {
      this.expandedNotification.collapse();
      this.expandedNotification.setIsOpen(false);
    }

    this.expandedNotification = newItem;
  }

  this.createErrorMessage = () => {}

  this.createEmptyListMessage = () => {
    const emptyListMessage = document.createElement('div');
    emptyListMessage.classList.add('autoql-vanilla-notification-feed-empty-list');

    const emptyListImg = document.createElement('img');
    emptyListImg.src = emptyStateImg;
    emptyListImg.width = '250';
    emptyListImg.height = '250';

    const emptyListTextLine1 = document.createElement('div');
    emptyListTextLine1.innerHTML = 'No notifications yet.';
    emptyListTextLine1.classList.add('autoql-vanila-empty-notifications-title')

    const emptyListTextLine2 = document.createElement('div');
    emptyListTextLine2.innerHTML = 'Stay tuned!';

    emptyListMessage.appendChild(emptyListImg);
    emptyListMessage.appendChild(emptyListTextLine1);
    emptyListMessage.appendChild(emptyListTextLine2);
    itemsContainer?.appendChild(emptyListMessage);
  }

  this.createPaginateItems = async () => {
    try {
      const notificationFeed = await this.fetchFeed();
      const items = notificationFeed?.items;
      this.items = items
  
      if (!items?.length) {
        this.createEmptyListMessage()
        return
      }
    
      const { authentication } = container.options;
      items.forEach((itemData, index) => {
        const dataAlert = this.dataAlerts.find((d) => d.id === itemData.data_alert_id);
        const item = new NotificationItem({
          itemData,
          index,
          authentication,
          dataAlert,
          onClick: this.collapsePreviousNotification,
          widgetOptions: container.options,
        });
        itemsContainer.appendChild(item);
      });
    } catch(error) {
      console.error(error)
    }
    
  }
  
  this.createItems = async() => {
    const { authentication } = container.options;
    const loading = this.showLoading();
    const response = await fetchDataAlerts({
      ...authentication
    });
    const { data } = response;
    this.dataAlerts = data.project_alerts.concat(data.custom_alerts);

    await this.createPaginateItems()
    loading.remove();

    if (this.items?.length) {
      container.appendChild(this.createTopOptions());
    }

    container.appendChild(itemsContainer);
    refreshTooltips();
  }
  
  container.classList.add('autoql-vanilla-notification-list-container');
  
  container.addEventListener('scroll', () => {
    const endOfPage =
    container.clientHeight + container.scrollTop >= container.scrollHeight;
    if (endOfPage) {
      container.offset += 10;
      this.createPaginateItems();
    }
  })

  
  if(parent) parent.appendChild(container);

  this.createItems();
  
  return container;
}
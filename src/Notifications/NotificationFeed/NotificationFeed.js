import { fetchNotificationFeed } from "autoql-fe-utils";
import { MARK_ALL } from "../../Svg";
import { checkAndApplyTheme, createIcon } from "../../Utils";
import './NotificationFeed.scss';
import { NotificationItem } from "./Components/NotificationItem/NotificationItem";

export function NotificationFeed(selector, options) {
  checkAndApplyTheme();
  const container = document.createElement('div');
  const parent = document.querySelector(selector);
  
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
      ...options
  };
  
  container.limit = 10;
  container.offset = 0;
  
  this.createTopOptions = () => {
    const optionsContainer = document.createElement('div');
    const gap = document.createElement('div');
    const confirmPopoverButton = document.createElement('div');
    const markAllButton = document.createElement('div');
    
    markAllButton.classList.add('autoql-vanilla-notification-mark-all');
    confirmPopoverButton.classList.add('autoql-vanilla-confirm-popover-click-wrapper');
    optionsContainer.classList.add('autoql-vanilla-notification-feed-top-options-container');
    
    markAllButton.appendChild(createIcon(MARK_ALL));
    markAllButton.appendChild(document.createTextNode('Mark all as read'));
    
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
  
  this.createItems = async() => {
    const loading = this.showLoading();
    const { items } = await this.fetchFeed();
    const itemsContainer = document.createElement('div');
    itemsContainer.classList.add('autoql-vanilla-notification-feed-list');
    
    items.forEach((itemData, index) => {
      const item = new NotificationItem({ itemData, index });
      itemsContainer.appendChild(item);
    });
    loading.remove();
    container.appendChild(this.createTopOptions());
    container.appendChild(itemsContainer);
  }
  
  container.classList.add('autoql-vanilla-notification-list-container');
  
  this.createItems();
  
  if(parent) parent.appendChild(container);
  
  return container;
}
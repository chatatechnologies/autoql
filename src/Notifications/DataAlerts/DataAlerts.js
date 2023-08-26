import { checkAndApplyTheme } from '../../Utils'
import { fetchDataAlerts } from 'autoql-fe-utils'
import { DataAlertItem } from './Components/DataAlertItem';
import './DataAlerts.scss'

export function DataAlerts(selector, options) {
  checkAndApplyTheme();
  const parent = document.querySelector(selector);
  const listContainer = document.createElement('div');
  const settingsContainer = document.createElement('div');
  const wrapper = document.createElement('div');
  
  wrapper.classList.add('autoql-vanilla-notification-settings');
  listContainer.classList.add('autoql-vanilla-data-alerts-list-container');
  settingsContainer.classList.add('autoql-vanilla-notification-settings-container');
  
  wrapper.options = {
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
    autoQLConfig: {
        debug: false,
        test: false,
        enableAutocomplete: true,
        enableQueryValidation: true,
        enableQuerySuggestions: true,
        enableColumnVisibilityManager: true,
        ...(options.autoQLConfig ?? {}),
    },
    onErrorCallback: () => {},
    ...options
  };
  
  wrapper.createTitle = () => {
    const title = document.createElement('div');
    const titleWrapper = document.createElement('div');
    const sectionTitle = document.createElement('div');
    const sectionSubtitle = document.createElement('div');
    const subtitleWrapper = document.createElement('span');
  
    title.classList.add('autoql-vanilla-data-alert-section-title-container');
    sectionTitle.classList.add('autoql-vanilla-data-alert-section-title');
    sectionSubtitle.classList.add('autoql-vanilla-data-alert-section-subtitle');
    sectionTitle.textContent = 'Custom Data Alerts';
    subtitleWrapper.innerHTML = `
        View and manage your Custom Alerts here. 
        To create a new Custom Alert, simply click on the "Create Data Alert" option from a query result in 
        <a>DataMessenger</a> or a <a>Dashboard</a>.`;
  
    sectionSubtitle.appendChild(subtitleWrapper);
    titleWrapper.appendChild(sectionTitle);
    titleWrapper.appendChild(sectionSubtitle);
    title.appendChild(titleWrapper);
    wrapper.appendChild(title);
  }
  
  wrapper.showLoadingDots = () => {
    wrapper.classList.add('flex');
    const responseLoadingContainer = document.createElement('div');
    const responseLoading = document.createElement('div');
  
    responseLoadingContainer.classList.add('autoql-vanilla-response-loading-container');
    responseLoading.classList.add('autoql-vanilla-response-loading');
    for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
    }
  
    responseLoadingContainer.appendChild(responseLoading);
    wrapper.appendChild(responseLoadingContainer);
    wrapper.loading = responseLoadingContainer;
  };
  
  wrapper.hideLoadingDots = () => {
    wrapper.classList.remove('flex');
    wrapper.removeChild(wrapper.loading);
  };
  
  wrapper.loadAlerts = async () => {
    const {
        domain,
        apiKey,
        token
    } = wrapper.options.authentication;
    const response = await fetchDataAlerts({
        domain,
        apiKey,
        token,
    });
    wrapper.hideLoadingDots();
    wrapper.createTitle();
    listContainer.appendChild(settingsContainer);
    wrapper.appendChild(listContainer);
    const { data } = response;
    const dataAlerts = data.project_alerts.concat(data.custom_alerts);
    dataAlerts.forEach((dataAlert, index) => {
      const item = new DataAlertItem({
          dataAlert,
          authentication: wrapper.options.authentication,
          showHeader: index === 0 ? true : false,
      });
      settingsContainer.appendChild(item);
    });
  }
  
  wrapper.showLoadingDots();
  wrapper.loadAlerts();
  
  if (parent) parent.appendChild(wrapper);
  
  return wrapper;
}

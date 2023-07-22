import { Modal } from '../../Modal'
import { ChataConfirmDialog } from '../../ChataComponents'
import { htmlToElement, checkAndApplyTheme } from '../../Utils'
import { strings } from '../../Strings'
import { fetchDataAlerts } from 'autoql-fe-utils'

import './DataAlerts.scss'

export function DataAlerts(selector, options) {
    checkAndApplyTheme();

    const parent = document.querySelector(selector);
    const listContainer = document.createElement('div');
    var wrapper = document.createElement('div');

    wrapper.classList.add('autoql-vanilla-notification-settings');
    listContainer.classList.add('autoql-vanilla-data-alerts-list-container');

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
        const responseLoadingContainer = document.createElement('div');
        const responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        wrapper.appendChild(responseLoadingContainer);
        wrapper.loading = responseLoadingContainer;
    };

    wrapper.hideLoadingDots = () => {
        wrapper.removeChild(wrapper.loading);
    };

   /* wrapper.loadRules = async () => {
        const URL = `${options.authentication.domain}/autoql/api/v1/data-alerts?key=${options.authentication.apiKey}&type=user`;
        var response = await apiCallGet(URL, wrapper.options);
        var jsonResponse = response.data;
        var status = response.status;
        if (status !== 200) {
            wrapper.options.onErrorCallback(jsonResponse.message);
        }
        var items = jsonResponse['data']['project_alerts'];
        if (items.length > 0) {
            wrapper.appendChild(new TitleContainer(strings.dataAlertsTitle, strings.dataAlertsMessage1, false));

            let notificationSettingsContainer = document.createElement('div');
            notificationSettingsContainer.classList.add('chata-notification-settings-container');
            wrapper.classList.add('chata-settings-container');
            wrapper.appendChild(notificationSettingsContainer);

            for (var i = 0; i < items.length; i++) {
                items[i].authentication = wrapper.options.authentication;
                notificationSettingsContainer.appendChild(new NotificationSettingsItem(wrapper.options, items[i]));
            }
        }

        var customItems = jsonResponse['data']['custom_alerts'];
        if (customItems.length > 0) {
            const onAddClick = () => {
                var cancelButton = htmlToElement(
                    `<div class="autoql-vanilla-chata-btn default"
                        style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`,
                );
                var spinner = htmlToElement(`
                    <div class="autoql-vanilla-spinner-loader hidden"></div>
                `);
                var saveButton = htmlToElement(
                    `<div class="autoql-vanilla-chata-btn primary disabled"
                        style="padding: 5px 16px; margin: 2px 5px;"></div>`,
                );

                saveButton.appendChild(spinner);
                saveButton.appendChild(document.createTextNode('Save'));

                var modalView = new NotificationSettingsModal(wrapper.options);
                var configModal = new Modal(
                    {
                        withFooter: true,
                        destroyOnClose: true,
                    },
                    () => {
                        modalView.step1.expand();
                    },
                    () => {
                        new ChataConfirmDialog(
                            'Are you sure you want to leave this page?',
                            'All unsaved changes will be lost.',
                            () => {
                                configModal.closeAnimation();
                                setTimeout(() => {
                                    configModal.hideContainer();
                                }, 250);
                            },
                        );
                    },
                );
                configModal.chataModal.style.width = '95vw';

                modalView.checkSteps = () => {
                    if (modalView.isValid()) {
                        saveButton.classList.remove('disabled');
                    } else {
                        saveButton.classList.add('disabled');
                    }
                };

                configModal.addView(modalView);
                configModal.setTitle('Create New Data Alert');
                configModal.addFooterElement(cancelButton);
                configModal.addFooterElement(saveButton);
                configModal.show();
                refreshTooltips();
                cancelButton.onclick = () => {
                    new ChataConfirmDialog(
                        'Are you sure you want to leave this page?',
                        'All unsaved changes will be lost.',
                        () => {
                            configModal.close();
                        },
                    );
                };
                saveButton.onclick = async () => {
                    spinner.classList.remove('hidden');
                    saveButton.setAttribute('disabled', 'true');
                    var o = wrapper.options;
                    const URL = `${o.authentication.domain}/autoql/api/v1/data-alerts?key=${o.authentication.apiKey}`;
                    var response = await apiCallPost(URL, modalView.getValues(), o);
                    var status = response.status;
                    var json = response.data;
                    if (status !== 200) {
                        wrapper.options.onErrorCallback(json.message);
                    }
                    json['data'].authentication = wrapper.options.authentication;
                    notificationSettingsContainer.insertAdjacentElement(
                        'afterbegin',
                        new NotificationSettingsItem(wrapper.options, json['data']),
                    );
                    configModal.close();
                };
            };

            wrapper.appendChild(
                new TitleContainer(strings.dataAlertsTitleCustom, strings.dataAlertsMessage2, true, onAddClick),
            );
            let notificationSettingsContainer = document.createElement('div');
            notificationSettingsContainer.classList.add('chata-notification-settings-container');
            wrapper.classList.add('chata-settings-container');
            wrapper.appendChild(notificationSettingsContainer);

            for (let i = 0; i < customItems.length; i++) {
                customItems[i].authentication = wrapper.options.authentication;
                notificationSettingsContainer.appendChild(
                    new NotificationSettingsItem(wrapper.options, customItems[i]),
                );
            }
        }
        wrapper.hideLoadingDots();
    };

    wrapper.classList.add('autoql-vanilla-data-alerts-settings');
    wrapper.showLoadingDots();
    wrapper.loadRules();
    setTimeout(function () {
        refreshTooltips();
    }, 3000); */

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
        console.log(response);
    }

    wrapper.showLoadingDots();
    wrapper.loadAlerts();
    
    wrapper.appendChild(listContainer);

    if (parent) parent.appendChild(wrapper);

    return wrapper;
}

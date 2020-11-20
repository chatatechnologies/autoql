import { NotificationSettingsItem } from './NotificationSettingsItem'
import { NotificationSettingsModal } from './NotificationSettingsModal'
import { Modal } from '../Modal'
import { ChataConfirmDialog } from '../ChataComponents'
import { htmlToElement, apiCallGet, apiCallPost } from '../Utils'
import { refreshTooltips } from '../Tooltips'
import {
    ADD_NOTIFICATION
} from '../Svg'
import { LIGHT_THEME, DARK_THEME } from '../Constants'
import {
    TitleContainer
} from './TitleContainer'
import '../../css/NotificationSettings.css'


export function DataAlerts(selector, options){
    var parent = document.querySelector(selector);
    var wrapper = document.createElement('div');
    wrapper.options = {
        authentication: {
            token: undefined,
            apiKey: undefined,
            customerId: undefined,
            userId: undefined,
            username: undefined,
            domain: undefined,
            demo: false
        },
        autoQLConfig: {
            debug: false,
            test: false,
            enableAutocomplete: true,
            enableQueryValidation: true,
            enableQuerySuggestions: true,
            enableColumnVisibilityManager: true,
            enableDrilldowns: true
        },
        themeConfig: {
            theme: 'light',
            chartColors: [
                '#26A7E9', '#A5CD39',
                '#DD6A6A', '#FFA700',
                '#00C1B2'
            ],
            accentColor: '#26a7df',
            fontFamily: 'sans-serif',
        },
        onErrorCallback: (message) => {}
    }

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            wrapper.options.authentication[key] = value;
        }
    }

    if('autoQLConfig' in options){
        for (var [key, value] of Object.entries(options['autoQLConfig'])) {
            wrapper.options.autoQLConfig[key] = value;
        }
    }

    if('themeConfig' in options){
        for (var [key, value] of Object.entries(options['themeConfig'])) {
            wrapper.options.themeConfig[key] = value;
        }
    }

    wrapper.applyStyles = () => {
        const themeStyles = wrapper.options.themeConfig.theme === 'light'
        ? LIGHT_THEME : DARK_THEME
        themeStyles['accent-color']
        = wrapper.options.themeConfig.accentColor;

        for (let property in themeStyles) {
            document.documentElement.style.setProperty(
                '--autoql-vanilla-' + property,
                themeStyles[property],
            );
        }

        wrapper.style.setProperty(
            '--autoql-vanilla-font-family',
            wrapper.options.themeConfig['fontFamily']
        );
    }

    wrapper.loadRules = async() => {
        const URL = `${options.authentication.domain}/autoql/api/v1/data-alerts?key=${options.authentication.apiKey}&type=user`;
        var response = await apiCallGet(URL, wrapper.options)
        var jsonResponse = response.data
        var status = response.status
        if(status !== 200){
            wrapper.options.onErrorCallback(jsonResponse.message)
        }
        var items = jsonResponse['data']['project_alerts'];
        if(items.length > 0){
            wrapper.appendChild(
                new TitleContainer(
                    'Subscribe to a Data Alert',
                    `Choose from a range of ready-to-use
                    Alerts that have been set up for you`,
                    false
                )
            )

            var notificationSettingsContainer = document.createElement('div');
            notificationSettingsContainer.classList.add(
                'chata-notification-settings-container'
            );
            wrapper.classList.add('chata-settings-container');
            wrapper.appendChild(notificationSettingsContainer);

            for (var i = 0; i < items.length; i++) {
                items[i].authentication = wrapper.options.authentication;
                notificationSettingsContainer.appendChild(
                    new NotificationSettingsItem(wrapper.options, items[i])
                );
            }
        }


        var customItems = jsonResponse['data']['custom_alerts'];
        if(customItems.length > 0){
            const onAddClick = (evt) => {
                var cancelButton = htmlToElement(
                    `<div class="autoql-vanilla-chata-btn default"
                        style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
                )
                var spinner = htmlToElement(`
                    <div class="autoql-vanilla-spinner-loader hidden"></div>
                `)
                var saveButton = htmlToElement(
                    `<div class="autoql-vanilla-chata-btn primary disabled"
                        style="padding: 5px 16px; margin: 2px 5px;"></div>`
                )

                saveButton.appendChild(spinner);
                saveButton.appendChild(document.createTextNode('Save'));

                var modalView = new NotificationSettingsModal(wrapper.options);
                var configModal = new Modal({
                    withFooter: true,
                    destroyOnClose: true
                }, () => {
                    modalView.step1.expand();
                })
                configModal.chataModal.style.width = '95vw';

                modalView.checkSteps = () => {
                    if(modalView.isValid()){
                        saveButton.classList.remove('disabled')
                    }else{
                        saveButton.classList.add('disabled')
                    }
                }

                configModal.addView(modalView);
                configModal.setTitle('Create New Data Alert');
                configModal.addFooterElement(cancelButton);
                configModal.addFooterElement(saveButton);
                configModal.show();
                refreshTooltips();
                cancelButton.onclick = (e) => {
                    new ChataConfirmDialog(
                        'Are you sure you want to leave this page?',
                        'All unsaved changes will be lost.',
                        (evt) => {
                            configModal.close()
                        }
                    )
                }
                saveButton.onclick = async (e) => {
                    spinner.classList.remove('hidden')
                    saveButton.setAttribute('disabled', 'true')
                    var o = wrapper.options
                    const URL = `${o.authentication.domain}/autoql/api/v1/data-alerts?key=${o.authentication.apiKey}`;
                    var response = apiCallPost(URL, modalView.getValues, o)
                    var status = response.status
                    var json = response.data
                    if(status !== 200){
                        wrapper.options.onErrorCallback(json.message)
                    }
                    json['data'].authentication = wrapper.options.authentication;
                    notificationSettingsContainer.insertAdjacentElement(
                        'afterbegin', new NotificationSettingsItem(
                            wrapper.options, json['data']
                        )
                    )
                    configModal.close();
                }
            }

            wrapper.appendChild(
                new TitleContainer(
                    'Custom Notifications',
                    `Create your own customized
                    notifications tailored to your needs`,
                    true,
                    onAddClick
                )
            )
            var notificationSettingsContainer = document.createElement('div');
            notificationSettingsContainer.classList.add(
                'chata-notification-settings-container'
            );
            wrapper.classList.add('chata-settings-container');
            wrapper.appendChild(notificationSettingsContainer);

            for (var i = 0; i < customItems.length; i++) {
                customItems[i].authentication = wrapper.options.authentication;
                notificationSettingsContainer.appendChild(
                    new NotificationSettingsItem(
                        wrapper.options, customItems[i]
                    )
                );
            }
        }

    }

    wrapper.applyStyles();
    wrapper.loadRules();
    if(parent)parent.appendChild(wrapper);
    return wrapper
}

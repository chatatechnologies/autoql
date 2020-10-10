import { NotificationSettingsItem } from './NotificationSettingsItem'
import { NotificationSettingsModal } from './NotificationSettingsModal'
import { ChataUtils } from '../ChataUtils'
import { Modal } from '../Modal'
import { ChataConfirmDialog } from '../ChataComponents'
import { htmlToElement } from '../Utils'
import { refreshTooltips } from '../Tooltips'
import {
    ADD_NOTIFICATION
} from '../Svg'
import '../../css/NotificationSettings.css'


export function DataAlertsSettings(selector, options){
    console.log(options);
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

    var titleContainer = document.createElement('div');
    var helpMessage = htmlToElement(`
        <div style="padding-left: 10px; opacity: 0.8;">
            <div style="font-size: 17px;">Custom Notifications</div>
            <div style="font-size: 11px; opacity: 0.6;">
                Create your own customized notifications tailored to your needs
            </div>
        </div>
    `)

    var notificationSettingsContainer = document.createElement('div');
    var notificationAddContainer = document.createElement('div');
    var notificationAddBtn = document.createElement('div');
    var notificationIcon = htmlToElement(ADD_NOTIFICATION);

    titleContainer.classList.add('chata-notification-title-container');
    notificationSettingsContainer.classList.add(
        'chata-notification-settings-container'
    );
    notificationAddContainer.classList.add(
        'chata-notification-add-btn-container'
    );
    notificationAddBtn.classList.add('chata-notification-add-btn');

    wrapper.classList.add('chata-settings-container');

    notificationAddBtn.appendChild(notificationIcon);
    notificationAddContainer.appendChild(notificationAddBtn);

    titleContainer.appendChild(helpMessage);
    titleContainer.appendChild(notificationAddContainer);

    wrapper.appendChild(titleContainer);
    wrapper.appendChild(notificationSettingsContainer);

    wrapper.loadRules = () => {
        const URL = `${options.authentication.domain}/autoql/api/v1/rules?key=${options.authentication.apiKey}&type=user`;
        ChataUtils.safetynetCall(URL, (jsonResponse, status) => {
            if(status !== 200){
                wrapper.options.onErrorCallback(jsonResponse.message)
            }
            var items = jsonResponse['data']['rules'];
            for (var i = 0; i < items.length; i++) {
                items[i].authentication = wrapper.options.authentication;
                notificationSettingsContainer.appendChild(
                    new NotificationSettingsItem(items[i])
                );
            }
        }, wrapper.options)
    }

    notificationAddContainer.onclick = (evt) => {
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

        var modalView = new NotificationSettingsModal();
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
        configModal.setTitle('Custom Notification');
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
        saveButton.onclick = (e) => {
            spinner.classList.remove('hidden')
            saveButton.setAttribute('disabled', 'true')
            var o = wrapper.options
            const URL = `${o.authentication.domain}/autoql/api/v1/rules?key=${o.authentication.apiKey}`;
            ChataUtils.ajaxCallPost(URL, (json, status) => {
                if(status !== 200){
                    wrapper.options.onErrorCallback(json.message)
                }
                json['data'].authentication = wrapper.options.authentication;
                notificationSettingsContainer.insertAdjacentElement(
                    'afterbegin', new NotificationSettingsItem(json['data'])
                )
                configModal.close();
            }, modalView.getValues(), o)
        }
    }

    wrapper.loadRules();
    if(parent)parent.appendChild(wrapper);
    return wrapper
}

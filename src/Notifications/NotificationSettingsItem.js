import { ChataUtils } from '../ChataUtils'
import { NotificationSettingsModal } from './NotificationSettingsModal'
import { Modal } from '../Modal'
import { ChataConfirmDialog } from '../ChataComponents'
import { htmlToElement } from '../Utils'
import { refreshTooltips } from '../Tooltips'
import {
    EDIT_ALERT
} from '../Svg'

export function NotificationSettingsItem(parentOptions, options) {
    var wrapper = document.createElement('div');
    wrapper.options = options;
    wrapper.parentOptions = parentOptions;
    var header = document.createElement('div');
    var settingsDisplayName = document.createElement('div');

    var displayName = document.createElement('span');
    var displayNameMessage = document.createElement('span');
    var settingsActions = document.createElement('div');
    var chataSwitch = htmlToElement(`
        <label class="chata-switch">
        </label>`
    );

    var checkbox = htmlToElement(`<input type="checkbox">`);
    var slider = htmlToElement('<div class="chata-slider round"></div>');

    chataSwitch.appendChild(checkbox);
    chataSwitch.appendChild(slider);
    if(['ACTIVE', 'WAITING'].includes(options.status)){
        checkbox.checked = true;
    }
    var chataCheckbox = htmlToElement(`
        <div class="chata-checkbox">
        </div>
    `);

    checkbox.onchange = (evt) => {
        var payload = {
            status: 'ACTIVE'
        }

        if(!evt.target.checked){
            payload.status = 'INACTIVE'
        }
        const URL = `${wrapper.options.authentication.domain}/autoql/api/v1/rules/${wrapper.options.id}?key=${options.authentication.apiKey}`;
        ChataUtils.putCall(URL, payload, (jsonResponse) => {
        }, wrapper.options)
    }

    chataCheckbox.appendChild(chataSwitch);
    var editIcon = htmlToElement(`
        <span class="chata-icon chata-notification-action-btn edit">
            ${EDIT_ALERT}
        </span>
    `)

    wrapper.classList.add('chata-notification-setting-item');
    header.classList.add('chata-notification-setting-item-header');
    settingsDisplayName.classList.add('chata-notification-setting-display-name');
    displayName.classList.add('chata-notification-setting-display-name-title');
    displayNameMessage.classList.add('chata-notification-setting-display-name-message');
    settingsActions.classList.add('chata-notification-setting-actions')
    displayName.innerHTML = wrapper.options.title;
    if(wrapper.options.message){
        displayNameMessage.innerHTML = ' - ' + wrapper.options.message;
    }

    wrapper.updateView = () => {
        const {
            title,
            message
        } = wrapper.options

        displayName.innerHTML = title

        if(message){
            displayNameMessage.innerHTML = ' - ' + message;
        }
    }

    const onDeleteNotification = (evt, modal) => {
        var o = wrapper.options
        const URL = `${o.authentication.domain}/autoql/api/v1/rules/${o.id}?key=${o.authentication.apiKey}`;
        ChataUtils.deleteCall(URL, (json) => {
            if(json.message === 'ok'){
                wrapper.parentNode.removeChild(wrapper);
            }
            modal.close();
        }, o)
    }

    settingsActions.appendChild(editIcon);
    settingsActions.appendChild(chataCheckbox)
    settingsDisplayName.appendChild(displayName);
    settingsDisplayName.appendChild(displayNameMessage);
    header.appendChild(settingsDisplayName);
    header.appendChild(settingsActions);
    header.onclick = function(evt){
        var target = evt.target;
        if(!target.classList.contains('chata-slider')
            && target.tagName !== 'INPUT'){
            var modalView = new NotificationSettingsModal(
                wrapper.parentOptions,
                'edit', wrapper.options
            );
            var configModal = new Modal({
                withFooter: true,
                destroyOnClose: true
            }, () => {
                modalView.step1.expand();
            })
            configModal.chataModal.style.width = '95vw';
            var footerWrapper = document.createElement('div');
            footerWrapper.style.display = 'flex';
            footerWrapper.style.justifyContent = 'space-between';
            var wrap = htmlToElement('<div></div>');
            var wrap2 = htmlToElement('<div></div>');

            var deleteButton = htmlToElement(`
                <button
                    class="autoql-vanilla-chata-btn danger large">
                        Delete Data Alert
                </button>
            `)

            deleteButton.onclick = (evt) => {
                onDeleteNotification(evt, configModal);
            };
            var spinner = htmlToElement(`
                <div class="autoql-vanilla-spinner-loader hidden"></div>
            `)
            var cancelButton = htmlToElement(
                `<div class="autoql-vanilla-chata-btn default"
                    style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
            )
            var saveButton = htmlToElement(
                `<div class="autoql-vanilla-chata-btn primary "
                    style="padding: 5px 16px; margin: 2px 5px;"></div>`
            )

            modalView.checkSteps = () => {
                if(modalView.isValid()){
                    saveButton.classList.remove('disabled')
                }else{
                    saveButton.classList.add('disabled')
                }
            }

            saveButton.appendChild(spinner);
            saveButton.appendChild(document.createTextNode('Save'));

            wrap.appendChild(deleteButton);
            wrap2.appendChild(cancelButton);
            wrap2.appendChild(saveButton);
            footerWrapper.appendChild(
                wrap
            )
            footerWrapper.appendChild(
                wrap2
            )

            configModal.addView(modalView);
            configModal.setTitle('Edit Data Alert');
            configModal.addFooterElement(footerWrapper);
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
                const URL = `${o.authentication.domain}/autoql/api/v1/rules/${o.id}?key=${o.authentication.apiKey}`;
                var values = modalView.getValues();
                values.id = wrapper.options.id
                ChataUtils.putCall(URL, values, (jsonResponse) => {
                    for(var[key, value] of Object.entries(jsonResponse.data)){
                        wrapper.options[key] = value
                    }
                    wrapper.updateView();
                    configModal.close();
                }, o)
            }
        }
    }
    wrapper.appendChild(header);
    return wrapper;
}

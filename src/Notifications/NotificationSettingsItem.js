import { NotificationSettingsModal } from './NotificationSettingsModal'
import { Modal } from '../Modal'
import { ChataConfirmDialog } from '../ChataComponents'
import { htmlToElement, apiCallPut, apiCallDelete } from '../Utils'
import { refreshTooltips } from '../Tooltips'
import {
    EDIT_ALERT,
    HOUR_GLASS,
    WARNING
} from '../Svg'
import dayjs from '../Utils/dayjsPlugins'
import { strings } from '../Strings'

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

    checkbox.onchange = async(evt) => {
        var payload = {
            status: 'ACTIVE'
        }

        if(!evt.target.checked){
            payload.status = 'INACTIVE'
        }
        const URL = `${wrapper.options.authentication.domain}/autoql/api/v1/data-alerts/${wrapper.options.id}?key=${options.authentication.apiKey}`;
        await apiCallPut(URL, payload, wrapper.options)

    }

    chataCheckbox.appendChild(chataSwitch);
    var hourGlass = htmlToElement(HOUR_GLASS)
    var editSvg = htmlToElement(EDIT_ALERT)
    editSvg.classList.add('autoql-vanilla-edit-data-alert')
    hourGlass.classList.add('autoql-vanilla-hour-glass')
    var resetDate = htmlToElement(`
        <span class="chata-icon autoq-vanilla-reset-period-info-icon">
        </span>
    `)
    var editIcon = htmlToElement(`
        <span class="chata-icon chata-notification-action-btn edit">
        </span>
    `)
    editIcon.appendChild(editSvg)
    resetDate.appendChild(hourGlass)
    wrapper.classList.add('chata-notification-setting-item');
    header.classList.add('chata-notification-setting-item-header');
    settingsDisplayName.classList.add('chata-notification-setting-display-name');
    displayName.classList.add('chata-notification-setting-display-name-title');
    displayNameMessage.classList.add('chata-notification-setting-display-name-message');
    settingsActions.classList.add('chata-notification-setting-actions')
    const warningIcon = htmlToElement(`
        <span
        class="chata-icon autoql-vanilla-notification-error-status-icon"
        data-tippy-content="There was a problem with this Data Alert. Click for more information.">
            ${WARNING}
        </span>
    `)
    if(['GENERAL_ERROR', 'EVALUATION_ERROR'].includes(options.status)){
        displayName.appendChild(warningIcon)
    }
    displayName.appendChild(document.createTextNode(wrapper.options.title))
    if(wrapper.options.message){
        displayNameMessage.innerHTML = ' - ' + wrapper.options.message;
    }

    wrapper.getTooltip = () => {
        const {
            reset_date,
            time_zone
        } = options

        const formatDate = dayjs.utc(reset_date).format(
            strings.dataAlertFormatDate
        ).toString();
        return `${strings.dataAlertTooltip} ${formatDate} (${time_zone})`;
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

    const onDeleteNotification = async (evt, modal) => {
        var o = wrapper.options
        const URL = `${o.authentication.domain}/autoql/api/v1/data-alerts/${o.id}?key=${o.authentication.apiKey}`;
        var response = await apiCallDelete(URL, o)
        var json = response.data
        if(json.message === 'ok'){
            wrapper.parentNode.removeChild(wrapper);
        }
        modal.close();
    }

    settingsActions.appendChild(editIcon);
    if(options.reset_date){
        resetDate.setAttribute('data-tippy-content', wrapper.getTooltip())
        settingsActions.appendChild(resetDate)
    }
    settingsActions.appendChild(chataCheckbox)
    settingsDisplayName.appendChild(displayName);
    settingsDisplayName.appendChild(displayNameMessage);
    header.appendChild(settingsDisplayName);
    header.appendChild(settingsActions);
    const onClick = function(evt){
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
            }, () => {
                new ChataConfirmDialog(
                    'Are you sure you want to leave this page?',
                    'All unsaved changes will be lost.',
                    () => {
                        configModal.closeAnimation()
                        setTimeout(() => { configModal.hideContainer() }, 250)
                    }
                )
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
            configModal.setTitle(strings.editDataAlert);
            configModal.addFooterElement(footerWrapper);
            configModal.show();
            refreshTooltips();
            cancelButton.onclick = () => {
                new ChataConfirmDialog(
                    'Are you sure you want to leave this page?',
                    'All unsaved changes will be lost.',
                    () => {
                        configModal.close()
                    }
                )
            }
            saveButton.onclick = async () => {
                spinner.classList.remove('hidden')
                saveButton.setAttribute('disabled', 'true')
                var o = wrapper.options
                const URL = `${o.authentication.domain}/autoql/api/v1/data-alerts/${o.id}?key=${o.authentication.apiKey}`;
                var values = modalView.getValues();
                values.id = wrapper.options.id
                var response = await apiCallPut(URL, values, o)
                var jsonResponse = response.data
                for(var[key, value] of Object.entries(jsonResponse.data)){
                    wrapper.options[key] = value
                }
                wrapper.updateView();
                configModal.close();
            }
        }
    }
    editSvg.onclick = onClick
    hourGlass.onclick = onClick
    warningIcon.onclick = onClick
    wrapper.appendChild(header);
    return wrapper;
}

function SettingsItem(title, message){
    var wrapper = document.createElement('div');
    var header = document.createElement('div');
    var settingsDisplayName = document.createElement('div');

    var displayName = document.createElement('span');
    var displayNameMessage = document.createElement('span');
    var settingsActions = document.createElement('div');
    var chataCheckbox = htmlToElement(`
        <div class="chata-checkbox">
            <label class="chata-switch">
                <input type="checkbox">
                <div class="chata-slider round"></div>
            </label>
        </div>
    `);

    wrapper.classList.add('chata-notification-setting-item');
    header.classList.add('chata-notification-setting-item-header');
    settingsDisplayName.classList.add('chata-notification-setting-display-name');
    displayName.classList.add('chata-notification-setting-display-name-title');
    displayNameMessage.classList.add('chata-notification-setting-display-name-message');
    settingsActions.classList.add('chata-notification-setting-actions')
    displayName.innerHTML = title;
    displayNameMessage.innerHTML = message;


    settingsActions.appendChild(chataCheckbox)
    settingsDisplayName.appendChild(displayName);
    settingsDisplayName.appendChild(displayNameMessage);
    header.appendChild(settingsDisplayName);
    header.appendChild(settingsActions);
    header.onclick = function(evt){
        var cancelButton = htmlToElement(
            `<div class="chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
        )
        var saveButton = htmlToElement(
            `<div class="chata-btn primary "
                style="padding: 5px 16px; margin: 2px 5px;">Save</div>`
        )

        var target = evt.target;
        if(!target.classList.contains('chata-slider')
            && target.tagName !== 'INPUT'){
            var configModal = new Modal({
                withFooter: true,
                destroyOnClose: true
            })
            var modalView = new NotificationSettingsModal();
            configModal.chataModal.style.width = '95vw';

            configModal.addView(modalView);
            configModal.setTitle('Custom Notification');
            configModal.addFooterElement(cancelButton);
            configModal.addFooterElement(saveButton);
            configModal.show();
            refreshTooltips();
            cancelButton.onclick = (e) => {
                configModal.close();
            }
            saveButton.onclick = (e) => {
                configModal.close();
            }
        }
    }
    wrapper.appendChild(header);
    return wrapper;
}

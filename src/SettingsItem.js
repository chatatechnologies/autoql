function SettingsItem(title){
    var wrapper = document.createElement('div');
    var header = document.createElement('div');
    var displayName = document.createElement('div');
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
    displayName.classList.add('chata-notification-setting-display-name');
    settingsActions.classList.add('chata-notification-setting-actions')
    displayName.innerHTML = title;

    settingsActions.appendChild(chataCheckbox)
    header.appendChild(displayName);
    header.appendChild(settingsActions);
    header.onclick = function(evt){
        var configModal = new Modal({
            withFooter: true,
            destroyOnClose: true
        })
        configModal.setTitle('Custom Notification');
        configModal.show();
    }
    wrapper.appendChild(header);
    return wrapper;
}

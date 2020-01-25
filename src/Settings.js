function NotificationSettings(items=[]){
    var wrapper = document.createElement('div');
    var notificationSettingsContainer = document.createElement('div');
    var notificationAddContainer = document.createElement('div');
    var notificationAddBtn = document.createElement('div');
    var notificationIcon = htmlToElement(ADD_NOTIFICATION);

    notificationSettingsContainer.classList.add('chata-notification-settings-container');
    notificationAddContainer.classList.add('chata-notification-add-btn-container');
    notificationAddBtn.classList.add('chata-notification-add-btn');

    wrapper.classList.add('chata-settings-container');

    notificationAddBtn.appendChild(notificationIcon);
    notificationAddContainer.appendChild(notificationAddBtn);
    wrapper.appendChild(notificationAddContainer);
    wrapper.appendChild(notificationSettingsContainer);

    for (var i = 0; i < items.length; i++) {
        notificationSettingsContainer.appendChild(items[i]);
    }

    notificationAddContainer.onclick = (evt) => {
        var configModal = new Modal({
            withFooter: true,
            destroyOnClose: true
        })
        var modalView = new NotificationSettingsModal();
        configModal.chataModal.style.width = 'vw';
        configModal.addView(modalView);
        configModal.setTitle('Custom Notification');
        configModal.show();
    }
    return wrapper
}

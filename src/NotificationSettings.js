function NotificationSettings(selector, items=[]){
    var parent = document.querySelector(selector);
    var obj = this;
    var wrapper = document.createElement('div');
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

    if(parent)parent.appendChild(wrapper);
    return wrapper
}

function NotificationSettings(selector, options){
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
    }

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            wrapper.options.authentication[key] = value;
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
        console.log(URL);
        console.log('RULESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS');
    }


    // for (var i = 0; i < items.length; i++) {
    //     notificationSettingsContainer.appendChild(items[i]);
    // }

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

    wrapper.loadRules();
    if(parent)parent.appendChild(wrapper);
    return wrapper
}

function NotificationList(selector, notificationsArray=[]){
    console.log(notificationsArray);
    var parent = document.querySelector(selector);
    var wrapper = document.createElement('div');
    var container = document.createElement('div');
    var dismissAllButton = document.createElement('div');
    var dismissContent = document.createElement('span');
    var dismissIcon = htmlToElement(DISMISS);
    wrapper.style.height = '100vh';
    wrapper.style.background = 'rgb(250, 250, 250)';

    container.classList.add('chata-notification-list-container');
    dismissAllButton.classList.add('chata-notification-dismiss-all');
    dismissContent.appendChild(dismissIcon);
    dismissContent.appendChild(document.createTextNode('Dismiss All'));
    dismissAllButton.appendChild(dismissContent);
    container.appendChild(dismissAllButton);
    wrapper.appendChild(container);

    for (var i = 0; i < notificationsArray.length; i++) {
        container.appendChild(notificationsArray[i]);
    }

    if(parent)parent.appendChild(wrapper);

    return wrapper;
}

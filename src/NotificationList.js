function NotificationList(notificationsArray=[]){
    console.log(notificationsArray);
    var parent = document.createElement('div');
    var container = document.createElement('div');
    var dismissAllButton = document.createElement('div');
    var dismissContent = document.createElement('span');
    var dismissIcon = htmlToElement(DISMISS);
    parent.style.height = '100vh';
    parent.style.background = 'rgb(250, 250, 250)';

    container.classList.add('chata-notification-list-container');
    dismissAllButton.classList.add('chata-notification-dismiss-all');
    dismissContent.appendChild(dismissIcon);
    dismissContent.appendChild(document.createTextNode('Dismiss All'));
    dismissAllButton.appendChild(dismissContent);
    container.appendChild(dismissAllButton);
    parent.appendChild(container);

    for (var i = 0; i < notificationsArray.length; i++) {
        container.appendChild(notificationsArray[i]);
    }

    return parent;
}

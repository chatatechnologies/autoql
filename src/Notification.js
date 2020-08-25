function Notification(options={}){
    var item = document.createElement('div')
    var header = document.createElement('div');
    var displayNameContainer = document.createElement('div');
    var displayName = document.createElement('div');
    var description = document.createElement('div');
    var timestamp = document.createElement('div');
    var dataTitle = document.createElement('div');
    var expandedContent = document.createElement('div');
    var dataContainer = document.createElement('div');
    var chartContainer = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    var notificationDetails = document.createElement('div');
    var notificationDetailsTitle = document.createElement('div');
    var notificationDetailsTitle2 = document.createElement('div');
    var notificationRulesContainer = document.createElement('div');
    var notificationQueryTitle = document.createElement('div');
    var alertStrip = document.createElement('div');
    var detailsContainer = document.createElement('div');
    var dismissIcon = htmlToElement(DISMISS);
    var calendarIcon = htmlToElement(CALENDAR);
    var extraContent = document.createElement('div');
    var btnTurnNotification = document.createElement('button');
    var editNotification = document.createElement('button');
    var turnNotificationText = document.createTextNode(
        'Turn off these notifications'
    );
    var editNotificationText = document.createTextNode('Edit Notification');

    item.classList.add('chata-notification-list-item');
    item.classList.add('triggered');

    displayNameContainer.classList.add(
        'chata-notification-display-name-container'
    );
    header.classList.add('chata-notification-list-item-header');
    displayName.classList.add('chata-notification-display-name');
    dismissIcon.classList.add('chata-notification-dismiss-icon');
    dataTitle.classList.add('chata-notification-data-title');
    expandedContent.classList.add('chata-notification-expanded-content');
    alertStrip.classList.add('chata-notification-alert-strip');
    description.classList.add('chata-notification-description');
    timestamp.classList.add('chata-notification-timestamp');
    detailsContainer.classList.add('chata-notification-details-container');
    dataContainer.classList.add('chata-notification-data-container');
    chartContainer.classList.add('chata-notification-chart-container');
    notificationQueryTitle.classList.add('chata-notification-query-title');
    responseContentContainer.classList.add('chata-response-content-container');
    responseContentContainer.classList.add('table');
    notificationDetails.classList.add('chata-notification-details');
    notificationDetailsTitle.classList.add('chata-notification-details-title');
    notificationDetailsTitle2.classList.add('chata-notification-details-title');
    notificationRulesContainer.classList.add('notification-rules-container');
    notificationRulesContainer.classList.add('read-only');
    extraContent.classList.add('chata-notification-extra-content');
    btnTurnNotification.classList.add('autoql-vanilla-chata-btn');
    btnTurnNotification.classList.add('default');
    btnTurnNotification.classList.add('large');
    editNotification.classList.add('autoql-vanilla-chata-btn');
    editNotification.classList.add('default');
    editNotification.classList.add('large');

    notificationQueryTitle.innerHTML = 'Test title';

    btnTurnNotification.innerHTML = TURN_ON_NOTIFICATION;
    editNotification.innerHTML = EDIT_NOTIFICATION;

    btnTurnNotification.appendChild(turnNotificationText);
    editNotification.appendChild(editNotificationText);

    extraContent.appendChild(btnTurnNotification);
    extraContent.appendChild(editNotification);

    displayName.appendChild(document.createTextNode(options.displayName));

    description.innerHTML = 'Test description';
    notificationDetailsTitle.innerHTML = 'Conditions: ';
    notificationDetailsTitle2.innerHTML = 'Description: ';
    timestamp.appendChild(htmlToElement(`
        <span class="chata-icon calendar">${CALENDAR}<span>
        Today at 11:20am
    `));

    responseContentContainer.innerHTML = '<a class="single-value-response ">$1,361,422.33</a>'
    notificationRulesContainer.appendChild(new NotificationGroup(['Tickets', '>', '1000']))

    chartContainer.appendChild(notificationQueryTitle);
    chartContainer.appendChild(responseContentContainer);
    dataContainer.appendChild(chartContainer);

    notificationDetails.appendChild(notificationDetailsTitle);
    notificationDetails.appendChild(notificationRulesContainer);
    notificationDetails.appendChild(notificationDetailsTitle2);

    detailsContainer.appendChild(dataContainer);
    detailsContainer.appendChild(notificationDetails);

    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestamp);

    header.appendChild(displayNameContainer);
    header.appendChild(dismissIcon);


    item.appendChild(header);
    item.appendChild(expandedContent);
    item.appendChild(alertStrip);

    expandedContent.appendChild(detailsContainer);
    expandedContent.appendChild(extraContent);

    header.onclick = function(evt){
        var expanded = document.getElementsByClassName(
            'chata-notification-expanded-content'
        );
        for (var i = 0; i < expanded.length; i++) {
            if(expanded[i] === expandedContent)continue;
            expanded[i].classList.remove('visible');
        }
        expandedContent.classList.toggle('visible');
    }

    return item;
}

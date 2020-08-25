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
    var notificationQueryTitle = document.createElement('div');
    var alertStrip = document.createElement('div');
    var detailsContainer = document.createElement('div');
    var dismissIcon = htmlToElement(DISMISS);
    var calendarIcon = htmlToElement(CALENDAR);

    // <div class="chata-notification-data-container">
    //     <div class="chata-notificaton-chart-container">
    //         <div class="chata-notification-query-title">Total Tickets</div>
    //         <div id="chata-response-content-container-b39c9135-105c-4b27-b8e5-ee20eba4b76c" class="chata-response-content-container table">
    //             <a class="single-value-response ">$1,361,422.33</a>
    //         </div>
    //     </div>
    // </div>

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
    chartContainer.classList.add('chata-notificaton-chart-container');
    notificationQueryTitle.classList.add('chata-notification-query-title');

    notificationQueryTitle.innerHTML = 'Test title';

    displayName.appendChild(document.createTextNode(options.displayName));

    description.innerHTML = 'Test description';
    timestamp.appendChild(htmlToElement(`
        <span class="chata-icon calendar">${CALENDAR}<span>
        Today at 11:20am
    `));

    chartContainer.appendChild(notificationQueryTitle);
    dataContainer.appendChild(chartContainer);
    detailsContainer.appendChild(dataContainer);

    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestamp);

    header.appendChild(displayNameContainer);
    header.appendChild(dismissIcon);


    item.appendChild(header);
    item.appendChild(expandedContent);
    item.appendChild(alertStrip);

    expandedContent.appendChild(detailsContainer);

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

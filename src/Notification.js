function Notification(options={}){
    var item = document.createElement('div')
    var header = document.createElement('div');
    var displayNameContainer = document.createElement('div');
    var displayName = document.createElement('div');
    var description = document.createElement('div');
    var timestamp = document.createElement('div');
    var dataTitle = document.createElement('div');
    var dataContainer = document.createElement('div');
    var alertStrip = document.createElement('div');

    var dismissIcon = htmlToElement(DISMISS);
    var calendarIcon = htmlToElement(CALENDAR);

    item.classList.add('chata-notification-list-item');
    item.classList.add('triggered');

    displayNameContainer.classList.add(
        'chata-notification-display-name-container'
    );
    header.classList.add('chata-notification-list-item-header');
    displayName.classList.add('chata-notification-display-name');
    dismissIcon.classList.add('chata-notification-dismiss-icon');
    dataTitle.classList.add('chata-notification-data-title');
    dataContainer.classList.add('chata-notification-expanded-content');
    alertStrip.classList.add('chata-notification-alert-strip');
    description.classList.add('chata-notification-description');
    timestamp.classList.add('chata-notification-timestamp');
    displayName.appendChild(document.createTextNode(options.displayName));

    description.innerHTML = 'Test description';
    timestamp.appendChild(htmlToElement(`
        <span class="chata-icon calendar">${CALENDAR}<span>
        Today at 11:20am
    `));

    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestamp);

    header.appendChild(displayNameContainer);
    header.appendChild(dismissIcon);
    // dataTitle.appendChild(calendarIcon);
    // dataTitle.appendChild(htmlToElement(`<em>Triggered on 2020-01-02T13:26:42-06:00</em>`));

    item.appendChild(header);
    item.appendChild(dataContainer);
    item.appendChild(alertStrip);

    item.onclick = function(evt){
        var expanded = document.getElementsByClassName(
            'chata-notification-expanded-content'
        );
        for (var i = 0; i < expanded.length; i++) {
            if(expanded[i] === dataContainer)continue;
            expanded[i].classList.remove('visible');
        }
        dataContainer.classList.toggle('visible');
    }

    return item;
}

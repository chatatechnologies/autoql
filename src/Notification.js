function Notification(options={}){
    var item = document.createElement('div')
    var header = document.createElement('div');
    var displayName = document.createElement('div');
    var dataTitle = document.createElement('div');
    var dataContainer = document.createElement('div');
    var alertStrip = document.createElement('div');

    var dismissIcon = htmlToElement(DISMISS);
    var calendarIcon = htmlToElement(CALENDAR);

    item.classList.add('chata-notification-list-item');
    item.classList.add('triggered');

    header.classList.add('chata-notification-list-item-header');
    displayName.classList.add('chata-notification-display-name');
    dismissIcon.classList.add('chata-notification-dismiss-icon');
    dataTitle.classList.add('chata-notification-data-title');
    dataContainer.classList.add('chata-notification-data-container');
    alertStrip.classList.add('chata-notification-alert-strip');
    displayName.appendChild(document.createTextNode(options.displayName));
    header.appendChild(displayName);
    header.appendChild(dismissIcon);
    dataTitle.appendChild(calendarIcon);
    dataTitle.appendChild(htmlToElement(`<em>Triggered on 2020-01-02T13:26:42-06:00</em>`));

    item.appendChild(header);
    item.appendChild(dataTitle);
    item.appendChild(dataContainer);
    item.appendChild(alertStrip);

    item.onclick = function(evt){
        var expanded = document.getElementsByClassName('expanded');
        for (var i = 0; i < expanded.length; i++) {
            if(expanded[i] === item)continue;
            expanded[i].classList.remove('expanded');
        }
        item.classList.toggle('expanded');
    }

    // <div class="chata-notification-list-item triggered" onclick="toggle(this)">
    //     <div class="chata-notification-list-item-header">
    //         <div class="chata-notification-display-name">Transactions exceeded $1000</div>
    //         <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="chata-notification-dismiss-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    //             <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    //             <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
    //             <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
    //             <path d="M18 8a6 6 0 0 0-9.33-5"></path>
    //             <line x1="1" y1="1" x2="23" y2="23"></line>
    //         </svg>
    //     </div>
    //     <div class="chata-notification-data-title">
    //         <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    //             <rect x="3" y="4" width="18" height="18" rx="2" ry="2">
    //             </rect>
    //             <line x1="16" y1="2" x2="16" y2="6">
    //             </line>
    //             <line x1="8" y1="2" x2="8" y2="6">
    //             </line>
    //             <line x1="3" y1="10" x2="21" y2="10">
    //             </line>
    //         </svg>
    //         <em>Triggered on 2020-01-02T13:26:42-06:00</em>
    //     </div>
    //     <div class="chata-notification-data-container">
    //
    //     </div>
    //     <div class="chata-notification-alert-strip"></div>
    // </div>

    return item;
}

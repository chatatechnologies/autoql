function NotificationGroup(terms){
    // <div class="notification-read-only-group  no-border">
    //     <div>
    //         <span class="read-only-rule-term">Total estimates by ticket type this year</span>
    //         <span class="read-only-rule-term">&gt;</span>
    //         <span class="read-only-rule-term">1000</span>
    //     </div>
    // </div>

    var wrapper = document.createElement('div');
    wrapper.classList.add('notification-read-only-group')

    for (var i = 0; i < terms.length; i++) {
        var term = document.createElement('div');
        term.classList.add('read-only-rule-term');
        term.innerHTML = terms[i];
        wrapper.appendChild(term);
    }

    return wrapper
}

function NotificationGroup(terms){
    var group = document.createElement('div');
    // wrapper.classList.add('notification-read-only-group')

    for (var i = 0; i < terms.length; i++) {
        var term = document.createElement('div');
        term.classList.add('read-only-rule-term');
        term.innerHTML = terms[i];
        group.appendChild(term);
    }

    return group
}

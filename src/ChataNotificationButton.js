(function (global, factory) {
	typeof exports === 'object' &&
    typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ChataNotificationButton = global.ChataNotificationButton || {})));
}(this, (function (exports) { 'use strict';

function NotificationButton(options={}){
    var button = document.createElement('div');
    var icon = document.createElement('span');
    var badge = document.createElement('div');

    badge.classList.add('chata-notifications-badge');
    icon.classList.add('autoql-vanilla-chata-icon');
    icon.classList.add('chata-notifications-button');
    icon.classList.add('notification');
    icon.innerHTML = NOTIFICATION_BUTTON;
    button.classList.add('chata-notifications-button-container');
    button.style.fontSize = '18px';

    badge.innerHTML = '5';

    button.appendChild(icon);
    button.appendChild(badge);

    return button;
}

exports.NotificationButton = NotificationButton;

Object.defineProperty(exports, '__esModule', { value: true });

})));

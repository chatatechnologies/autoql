(function (global, factory) {
	typeof exports === 'object' &&
    typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory(
		(global.ChataNotificationButton = global.ChataNotificationButton || {})
	));
}(this, (function (exports) { 'use strict';

function NotificationButton(selector, options={}){
	var parent = document.querySelector(selector);
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

	parent.appendChild(button);

	this.button = button;
	this.badge = badge;

	button.onclick = (evt) => {
		badge.style.visibility = 'hidden';
	}

	this.setBadgeValue = (val) => {
		this.badge.innerHTML = val;
	}

    return this;
}

exports.NotificationButton = NotificationButton;

Object.defineProperty(exports, '__esModule', { value: true });

})));

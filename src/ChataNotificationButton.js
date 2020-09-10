(function (global, factory) {
	typeof exports === 'object' &&
    typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory(
		(global.ChataNotificationButton = global.ChataNotificationButton || {})
	));
}(this, (function (exports) { 'use strict';

function NotificationButton(selector, options={}){
	const NOTIFICATION_POLLING_INTERVAL = 60000
	this.options = {
		authentication: {
            token: undefined,
            apiKey: undefined,
            customerId: undefined,
            userId: undefined,
            username: undefined,
            domain: undefined,
            demo: false
        },
	}

	if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            obj.options.authentication[key] = value;
        }
    }

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

	this.poolInterval = async () => {
		var response = await this.getNotificationCount();
		console.log(response);
		setInterval(
			() => {

			}, NOTIFICATION_POLLING_INTERVAL
		);
	}

	this.getNotificationCount = (unacknowledged=0) => {
		var o = this.options.authentication
		const url = `${o.domain}/autoql/api/v1/rules/notifications/summary/poll?key=${o.apiKey}&unacknowledged=${unacknowledged}`
		return new Promise(function(resolve, reject) {
			resolve(0);
		});
	}

	this.poolInterval();

    return this;
}

exports.NotificationButton = NotificationButton;

Object.defineProperty(exports, '__esModule', { value: true });

})));

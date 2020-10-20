import { NOTIFICATION_BUTTON } from '../Svg'
import { ChataUtils } from '../ChataUtils'
import '../../css/ChataNotificationButton.css'

export function NotificationIcon(selector, options={}){
	const NOTIFICATION_POLLING_INTERVAL = 18000
	var obj = this;
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
		overflowCount: 99,
		useDot: false,
		clearCountOnClick: true,
		onNewNotification: () => {},
		onErrorCallback: (error) => {}
	}

	obj.unacknowledged = 0;

	if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            obj.options.authentication[key] = value;
        }
    }

	for (var [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            obj.options[key] = value;
        }
    }

	var parent = document.querySelector(selector);
    var button = document.createElement('div');
    var icon = document.createElement('span');
    var badge = document.createElement('div');
	if(obj.options.useDot){
		badge.classList.add('chata-notifications-badge-dot');
	}else{
		badge.classList.add('chata-notifications-badge');

	}
    icon.classList.add('autoql-vanilla-chata-icon');
    icon.classList.add('chata-notifications-button');
    icon.classList.add('notification');
    icon.innerHTML = NOTIFICATION_BUTTON;
    button.classList.add('chata-notifications-button-container');
    button.style.fontSize = '18px';


    button.appendChild(icon);
    button.appendChild(badge);

	parent.appendChild(button);

	this.button = button;
	this.badge = badge;
	badge.style.visibility = 'hidden';

	button.onclick = (evt) => {
		if(obj.options.clearCountOnClick){
			var o = obj.options.authentication
			const url = `${o.domain}/autoql/api/v1/rules/notifications?key=${o.apiKey}`
			ChataUtils.putCall(url, {
				notification_id: null,
				state: 'ACKNOWLEDGED'
			}, (jsonResponse) => {
				if(jsonResponse.message == 'ok'){
					obj.unacknowledged = 0;
				}else{
					obj.options.onErrorCallback(jsonResponse.message)
				}
	        }, obj.options)
			badge.style.visibility = 'hidden';
		}
	}

	this.setOption = (option, value) => {
		switch (option) {
			case 'authentication':
				obj.setObjectProp('authentication', value);
				break;
			default:

		}
	}

	obj.setObjectProp = (key, _obj) => {
		for (var [keyValue, value] of Object.entries(_obj)) {
			obj.options[key][keyValue] = value;
		}
	}

	this.setBadgeValue = (val) => {
		if(parseInt(val) > 0 && !obj.options.useDot){
			badge.style.visibility = 'visible';
			if(val > obj.options.overflowCount)val = `${obj.options.overflowCount}+`
			this.badge.innerHTML = val;
			this.options.onNewNotification()
		}else if(parseInt(val) > 0){
			badge.style.visibility = 'visible';
		}
	}

	this.poolInterval = async () => {
		var response = await this.getNotificationCount();
		if(response.data.unacknowledged){
			obj.unacknowledged = response.data.unacknowledged
		}
		this.setBadgeValue(obj.unacknowledged);
		setInterval(
			async () => {
				var response = await obj.getNotificationCount(
					obj.unacknowledged
				)
				if(response.data.unacknowledged){
					obj.unacknowledged = response.data.unacknowledged
					this.setBadgeValue(obj.unacknowledged);
				}
			}, NOTIFICATION_POLLING_INTERVAL
		);
	}

	this.getNotificationCount = (unacknowledged=0) => {
		var o = this.options.authentication
		const url = `${o.domain}/autoql/api/v1/rules/notifications/summary/poll?key=${o.apiKey}&unacknowledged=${unacknowledged}`
		return new Promise(function(resolve, reject) {
			ChataUtils.safetynetCall(url, (json) => {
				resolve(json);
			}, obj.options)
		});
	}

	this.poolInterval();

    return this;
}
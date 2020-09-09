(function (global, factory) {
	typeof exports === 'object' &&
    typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ChataNotificationButton = global.ChataNotificationButton || {})));
}(this, (function (exports) { 'use strict';

function NotificationButton(options={}){
    console.log(options);
    var button = htmlToElement(`
        <div class="chata-notifications-button-container" style="font-size: 18px;">
        <span class="chata-icon chata-notifications-button notification">
            ${NOTIFICATION_BUTTON}
        </span>
        <div class="chata-notifications-badge">12</div>
        </div>
    `)

    return button;
}

exports.NotificationButton = NotificationButton;

Object.defineProperty(exports, '__esModule', { value: true });

})));

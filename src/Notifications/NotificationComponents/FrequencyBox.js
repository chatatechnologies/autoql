import {
    htmlToElement
} from '../../Utils'
import {
    HOUR_GLASS
} from '../../Svg'

export function FrequencyBox(message){
    var parent = htmlToElement(`
        <div class="frequency-description-box-container">
        </div>`
    );
    var box = document.createElement('div');
    var messageContent = document.createElement('span');
    messageContent.innerHTML = message;
    box.classList.add('frequency-description-box');

    box.appendChild(messageContent);

    parent.setMessage = (val, timezone) => {
        var message = `This Alert may be triggered multiple times, but you will only be notified`
        switch (val) {
            case 'DAY':
                message += ` once per day. Scanning will resume daily at 12am (${timezone}).`
                break;
            case 'MONTH':
                message += ` oonce per month. Scanning will resume next Monday at 12am (${timezone}).`
                break;
            case 'WEEK':
                message += ` once per week. Scanning will resume on the first day of next month at 12am (${timezone}).
                    <span>
                        <br/><br/>
                        <span class="chata-icon">
                            ${HOUR_GLASS}
                            This Alert has been triggered. Scanning will resume on Marzo 07, 2021 at 01:00pm (${timezone})
                        </span>
                    </span>
                `
                break;
            default:
                message = `You will be notified as soon as this happens,
                any time this happens. Scanning will happen continuously.`
        }
        messageContent.innerHTML = message;
    }

    parent.appendChild(box);

    return parent;
}

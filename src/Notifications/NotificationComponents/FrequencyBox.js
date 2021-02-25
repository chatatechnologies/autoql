import {
    htmlToElement
} from '../../Utils'

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

    parent.setMessage = (newMessage) => {
        messageContent.innerHTML = newMessage;
    }
    parent.appendChild(box);

    return parent;
}

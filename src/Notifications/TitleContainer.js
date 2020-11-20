import{
    ADD_NOTIFICATION
} from '../Svg'
import {
    htmlToElement
} from '../Utils'

export function TitleContainer(title, message, canAdd=true, onClick=()=>{}){
    var titleContainer = document.createElement('div')
    titleContainer.classList.add('chata-notification-title-container');

    var helpMessage = htmlToElement(`
        <div style="padding-left: 10px; opacity: 0.8;">
            <div style="font-size: 17px;">${title}</div>
            <div style="font-size: 11px; opacity: 0.6;">
                ${message}
            </div>
        </div>
    `)
    var notificationAddContainer = document.createElement('div')
    notificationAddContainer.classList.add(
        'chata-notification-add-btn-container'
    )

    var notificationAddBtn = document.createElement('div')
    var notificationIcon = htmlToElement(ADD_NOTIFICATION)
    notificationAddBtn.classList.add('chata-notification-add-btn')
    notificationAddBtn.appendChild(notificationIcon)
    notificationAddContainer.appendChild(notificationAddBtn)

    titleContainer.appendChild(helpMessage)
    notificationAddContainer.onclick = (evt) => {
        onClick(evt)
    }
    if(canAdd)titleContainer.appendChild(notificationAddContainer)

    return titleContainer
}

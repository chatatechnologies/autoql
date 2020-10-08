import { Modal } from '../Modal'
import './ChataConfirmDialog.css'

export function ChataConfirmDialog(title, message){
    var titleEl = document.createElement('h3')
    var messageEl = document.createElement('p')

    titleEl.innerHTML = title
    messageEl.innerHTML = message

    var configModal = new Modal({
        withFooter: true,
        destroyOnClose: true,
        withHeader: false
    })
    configModal.chataModal.style.width = '400px';

    configModal.addView(titleEl)
    configModal.addView(messageEl)
    configModal.show()

}

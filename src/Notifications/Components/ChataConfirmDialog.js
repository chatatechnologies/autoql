import { Modal } from '../../Modal'
import { htmlToElement } from '../../Utils'
import { strings } from '../../Strings'
import './ChataConfirmDialog.css'

export function ChataConfirmDialog({ title, message, onDiscard }){
    var titleEl = document.createElement('h3')
    var messageEl = document.createElement('p')

    titleEl.innerHTML = title
    messageEl.innerHTML = message

    var configModal = new Modal({
        withFooter: true,
        destroyOnClose: true,
        withHeader: false
    })
    configModal.chataModal.style.width = '450px';

    var discardButton = htmlToElement(`
        <button
            class="autoql-vanilla-chata-btn danger large">
                ${strings.discardChanges}
        </button>
    `)

    var cancelButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn default"
            style="padding: 5px 16px; margin: 2px 5px;">${strings.back}</div>`
    )

    cancelButton.onclick = () => {
        configModal.close()
    }

    discardButton.onclick = (evt) => {
        configModal.close()
        onDiscard(evt)
    }

    configModal.addView(titleEl)
    configModal.addView(messageEl)
    configModal.addFooterElement(cancelButton)
    configModal.addFooterElement(discardButton)
    configModal.show()

}

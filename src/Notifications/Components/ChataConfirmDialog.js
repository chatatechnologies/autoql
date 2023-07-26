import { Modal } from '../../Modal'
import { htmlToElement } from '../../Utils'
import { strings } from '../../Strings'
import './ChataConfirmDialog.scss'

export function ChataConfirmDialog({ title, message, onDiscard, cancelString = strings.back, discardString = strings.discardChanges }){
    var titleEl = document.createElement('h3')
    var messageEl = document.createElement('p')

    titleEl.classList.add('autoql-vanilla-confirm-title');

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
            class="autoql-vanilla-chata-btn autoql-vanilla-danger autoql-vanilla-large">
                ${discardString}
        </button>
    `)

    var cancelButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn autoql-vanilla-default autoql-vanilla-large">${cancelString}</div>`
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

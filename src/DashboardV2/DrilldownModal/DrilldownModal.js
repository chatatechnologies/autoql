import {
    Modal
} from '../../Modal'

export function DrilldownModal(title, views=[]){

    var modal = new Modal({
        destroyOnClose: true
    })
    modal.chataBody.classList.add('chata-modal-full-height');
    views.map(v => modal.addView(v))
    modal.setTitle(title)

    return modal

}

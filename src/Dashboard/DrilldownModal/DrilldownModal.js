import {
    Modal
} from '../../Modal'
import Split from 'split.js'

export function DrilldownModal(title, views=[]){

    var modal = new Modal({
        destroyOnClose: true
    }, () => {
        if(views.length > 1){
            Split(views, {
                direction: 'vertical',
                sizes: [50, 50],
                minSize: ['35%', '0'],
                gutterSize: 7,
                cursor: 'row-resize',
                onDragEnd: () => {
                    window.dispatchEvent(new CustomEvent('chata-resize', {}))
                }
            })
        }
    })
    modal.chataBody.classList.add('chata-modal-full-height')
    modal.chataModal.style.width = '90vw'
    views.map(v => modal.addView(v))
    modal.setTitle(title)

    return modal

}

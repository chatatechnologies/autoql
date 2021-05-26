import { htmlToElement } from '../Utils'
import {
    DASHBOARD_DELETE_ICON
} from '../Svg'
import './Modal.css'
import './ColumnEditor.css'
import './Spinner.css'

export function Modal(options={}, onShow=()=>{}, onClose=undefined){
    var obj = this;
    obj.options = {
        destroyOnClose: false,
        withFooter: false,
        withHeader: true
    }
    for (var [key, value] of Object.entries(options)) {
        obj.options[key] = value;
    }
    obj.isOpen = false;
    const body = document.getElementsByTagName('body')[0];
    var closeIcon = htmlToElement(DASHBOARD_DELETE_ICON);
    var modalContainer = document.createElement('div');
    var chataModal = document.createElement('div');
    var chataHeader = document.createElement('div');
    var chataBody = document.createElement('div');
    var chataFooter = document.createElement('div');

    modalContainer.classList.add('chata-modal-container');
    chataModal.classList.add('chata-modal');
    chataHeader.classList.add('chata-modal-header');
    closeIcon.classList.add('chata-modal-close-btn');
    chataBody.classList.add('chata-modal-body');
    chataFooter.classList.add('chata-modal-footer');

    if(obj.options.withHeader){
        chataModal.appendChild(chataHeader);
    }
    chataModal.appendChild(chataBody);
    if(obj.options.withFooter){
        chataModal.appendChild(chataFooter);
    }
    modalContainer.appendChild(chataModal);
    body.appendChild(modalContainer);
    obj.modalContainer = modalContainer;
    obj.chataModal = chataModal;
    obj.chataBody = chataBody;
    obj.chataFooter = chataFooter;
    obj.show = function(){
        modalContainer.style.visibility = 'visible';
        setTimeout(() => {
            chataModal.style.transform = 'scale(1)';
        }, .5)

        obj.isOpen = true;
        onShow();
    }
    obj.close = function(){
        obj.closeAnimation()
        setTimeout(() => { obj.hideContainer() }, 250)
    }

    obj.closeAnimation = () => {
        chataModal.style.transform = 'scale(0)';
        obj.isOpen = false;
    }

    obj.hideContainer = () => {
        modalContainer.style.visibility = 'hidden';
        if(obj.options.destroyOnClose){
            obj.destroy();
        }
        obj.clearViews();
    }

    obj.destroy = function(){
        body.removeChild(modalContainer);
    }

    obj.setTitle = function(value){
        chataHeader.innerHTML = value;
        chataHeader.appendChild(closeIcon);
    }

    closeIcon.onclick = function(){
        if(onClose)onClose()
        else obj.close();
    }

    obj.addView = function(view){
        chataBody.appendChild(view);
    }

    obj.clearViews = function(){
        chataBody.innerHTML = '';
    }

    obj.addEvent = function(event, callback){
        obj.modalContainer.addEventListener(event, callback);
    }

    obj.addFooterElement = function(elem){
        chataFooter.appendChild(elem);
    }


    return obj;
}

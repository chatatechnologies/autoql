function Modal(title, originalDisplayType, uuid, content){
    obj = this;
    console.log(content);
    const body = document.getElementsByTagName('body')[0];
    const closeIcon = htmlToElement(DASHBOARD_DELETE_ICON);
    var modalContainer = document.createElement('div');
    var chataModal = document.createElement('div');
    var chataHeader = document.createElement('div');
    var chataBody = document.createElement('div');

    modalContainer.classList.add('chata-modal-container');
    chataModal.classList.add('chata-modal');
    chataHeader.classList.add('chata-modal-header');
    closeIcon.classList.add('chata-modal-close-btn');
    chataBody.classList.add('chata-modal-body');
    chataHeader.innerHTML = title;

    chataHeader.appendChild(closeIcon);
    chataModal.appendChild(chataHeader);
    chataModal.appendChild(chataBody);
    modalContainer.appendChild(chataModal);
    body.appendChild(modalContainer);

    obj.show = function(){
        modalContainer.style.visibility = 'visible';
    }

    obj.close = function(){
        modalContainer.style.visibility = 'hidden';
    }

    closeIcon.onclick = function(event){
        obj.close();
    }

    return obj;
}

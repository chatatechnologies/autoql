function Modal(){
    obj = this;
    obj.isOpen = false;
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

    chataModal.appendChild(chataHeader);
    chataModal.appendChild(chataBody);
    modalContainer.appendChild(chataModal);
    body.appendChild(modalContainer);
    obj.modalContainer = modalContainer;
    obj.show = function(){
        modalContainer.style.visibility = 'visible';
        obj.isOpen = true;
    }

    obj.close = function(){
        modalContainer.style.visibility = 'hidden';
        obj.isOpen = false;
    }

    obj.setTitle = function(value){
        chataHeader.innerHTML = value;
        chataHeader.appendChild(closeIcon);
    }

    closeIcon.onclick = function(event){
        obj.close();
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

    return obj;
}

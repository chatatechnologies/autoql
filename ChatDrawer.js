var ChatDrawer = {};
(function(document, window, ChatDrawer, undefined) {
    ChatDrawer.init = function(elem){
        var rootElem = document.getElementById(elem);
        this.createDrawerContent(rootElem);
        this.createDrawerButton(rootElem);
    }

    ChatDrawer.createDrawerContent = function(rootElem){
        
    }

    ChatDrawer.createDrawerButton = function(rootElem){
        var drawerButton = document.createElement("div");
        var drawerIcon = document.createElement("img");
        drawerIcon.setAttribute("src", "chata-bubles.svg");
        drawerIcon.setAttribute("alt", "chata.ai");
        drawerIcon.setAttribute("height", "22px");
        drawerIcon.setAttribute("width", "22px");
        drawerIcon.classList.add('chata-bubbles-icon');
        drawerButton.classList.add('drawer-handle');
        drawerButton.appendChild(drawerIcon);
        rootElem.appendChild(drawerButton);
    }
})(document, window, ChatDrawer)

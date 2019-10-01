var ChatDrawer = {
    options: {
        projectId: 1,
        token: undefined,
        apiKey: '',
        customerId: '',
        userId: '',
        isVisible: false,
        placement: 'right',
        width: 500,
        height: 350,
        theme: 'light',
        accentColor: '#28a8e0',
        title: 'Chat with your data',
        showHandle: true,
        handleStyles: {},
        onVisibleChange: function() {},
        onHandleClick: function(){},
        showMask: true,
        onMaskClick: function(){},
        maskClosable: true,
        customerName: 'there',
        maxMessages: -1,
        clearOnClose: false,
        enableVoiceRecord: true,
        enableAutocomplete: true,
        autocompleteStyles: {},
        enableSafetyNet: true,
        enableDrilldowns: true,
        demo: false
    },
    responses: [],
    xhr: new XMLHttpRequest()
};

const LIGHT_THEME = {
  '--chata-drawer-accent-color': '#28a8e0',
  '--chata-drawer-background-color': '#fff',
  '--chata-drawer-border-color': '#d3d3d352',
  '--chata-drawer-hover-color': '#ececec',
  '--chata-drawer-text-color-primary': '#5d5d5d',
  '--chata-drawer-text-color-placeholder': '#0000009c'
}

const DARK_THEME = {
  '--chata-drawer-accent-color': '#525252', // dark gray
  // '--chata-drawer-accent-color': '#193a48', // dark blue
  '--chata-drawer-background-color': '#636363',
  '--chata-drawer-border-color': '#d3d3d329',
  '--chata-drawer-hover-color': '#5a5a5a',
  '--chata-drawer-text-color-primary': '#fff',
  '--chata-drawer-text-color-placeholder': '#ffffff9c'
}

const MONTH_NAMES = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    // NOTE: this case only occurs in tests
    if(Number.isNaN(monthIndex)){
        year = '1969';
        day = '31';
        monthIndex = 11;
    }
    return MONTH_NAMES[monthIndex] + ' ' + day + ', ' + year;
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function putLoadingContainer(target){
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');

    responseLoadingContainer.classList.add('chat-bar-loading');
    responseLoading.classList.add('response-loading');
    for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    target.appendChild(responseLoadingContainer);
    return responseLoadingContainer;
}

(function(document, window, ChatDrawer, undefined) {

    ChatDrawer.init = function(elem, options){
        var rootElem = document.getElementById(elem);
        for (var [key, value] of Object.entries(options)) {
            ChatDrawer.options[key] = value;
        }
        if(!('introMessage' in options)){
            ChatDrawer.options.introMessage = "Hi " + ChatDrawer.options.customerName+ " I'm  here to help you access, search and analyze your data.";
        }
        if(!('onMaskClick' in options)){
            ChatDrawer.options.onMaskClick = ChatDrawer.options.onHandleClick;
        }
        ChatDrawer.rootElem = rootElem;
        rootElem.classList.add('chata-drawer');
        this.createHeader();
        this.createDrawerContent();
        this.createBar();
        this.createWrapper();
        this.createDrawerButton();
        this.registerEvents();
        ChatDrawer.openDrawer();
        ChatDrawer.closeDrawer();

        if(ChatDrawer.options.isVisible){
            ChatDrawer.openDrawer();
        }else{
            ChatDrawer.closeDrawer();
        }
        const themeStyles = ChatDrawer.options.theme === 'light' ? LIGHT_THEME : DARK_THEME
        if ('accentColor' in options){
            themeStyles['--chata-drawer-accent-color'] = options.accentColor;
        }
        for (let property in themeStyles) {
            // console.log(property);
            console.log(themeStyles[property]);

            document.documentElement.style.setProperty(
                property,
                themeStyles[property],
            );
        }
        return this;
    }

    ChatDrawer.getChatBar = function(){
        var chataBarContainer = document.createElement('div');
        chataBarContainer.classList.add('chata-bar-container');
        chataBarContainer.classList.add('chat-drawer-chat-bar');
        chataBarContainer.classList.add('autosuggest-top');
        chataBarContainer.innerHTML = `
        <div class="chat-bar-text">
            <div class="chat-bar-auto-complete-suggestions bottom">
                <ul class="chat-bar-autocomplete">
                </ul>
            </div>
            <div class="chat-bar-input-icon"><img class="chata-bubbles-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjQgMjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSIjMjZBN0RGIiBkPSJNMTYsNUMxNC44LDIuMywxMiwwLjQsOC44LDAuNGMtNC40LDAtNy42LDMuNS03LjYsNy45djRjMCwyLjgtMSwzLjYtMSwzLjZjMS4zLDAuMSwyLjktMC40LDQtMS41CgkJCQljMC40LDAuNCwxLDAuOCwxLjYsMWMwLjUsMC4yLDEsMC40LDEuNiwwLjVjMC0wLjItMC4xLTAuNS0wLjEtMC43YzAtMC4yLDAtMC41LDAtMC43YzAtMS42LDAuNS0zLjIsMS4zLTQuNAoJCQkJYzAuMy0wLjQsMC42LTAuOCwxLTEuMmMwLjItMC4yLDAuNC0wLjMsMC42LTAuNWMwLjQtMC4zLDAuOC0wLjYsMS4yLTAuOGMwLjQtMC4yLDAuOS0wLjQsMS40LTAuNmMwLjctMC4yLDEuNS0wLjMsMi4zLTAuM2wwLDAKCQkJCWMwLjMsMCwwLjUsMCwwLjcsMGMwLjIsMCwwLjUsMC4xLDAuNywwLjFDMTYuNCw2LDE2LjIsNS41LDE2LDV6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTIyLjcsMTguM3YtNGMwLTMuMy0xLjgtNi00LjYtNy4yYy0wLjUtMC4yLTEtMC40LTEuNi0wLjVjMC4xLDAuNSwwLjIsMS4xLDAuMiwxLjdjMCwxLjktMC43LDMuNi0xLjgsNC45CgkJCWMtMC41LDAuNi0xLDEtMS43LDEuNWMtMC40LDAuMy0wLjksMC41LTEuMywwLjdjLTAuNSwwLjItMSwwLjMtMS41LDAuNGMtMC41LDAuMS0xLDAuMi0xLjYsMC4yYy0wLjMsMC0wLjUsMC0wLjcsMAoJCQljLTAuMywwLTAuNS0wLjEtMC43LTAuMWMwLjEsMC42LDAuMywxLjEsMC41LDEuNmMxLjIsMi44LDMuOSw0LjYsNy4yLDQuNmMxLjgsMCwzLjUtMC41LDQuNi0xLjZjMSwxLDIuOSwxLjgsNC4xLDEuNQoJCQlDMjMuOCwyMS45LDIyLjcsMjEuMywyMi43LDE4LjN6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNMTUuMSw2LjVjLTQuNCwwLTcuOCwzLjUtNy44LDcuOWMwLDAuNSwwLjEsMSwwLjEsMS41YzAuNSwwLjEsMSwwLjEsMS41LDAuMWM0LjQsMCw3LjgtMy4zLDcuOC03LjYKCQkJYzAtMC42LTAuMS0xLjEtMC4yLTEuN0MxNi4xLDYuNSwxNS42LDYuNSwxNS4xLDYuNXoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xNi4zLDguMkMxNi4zLDguMiwxNi4yLDguMiwxNi4zLDguMmMtMC4xLDAtMC4xLDAtMC4yLDBjMCwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMSwwLDAuMiwwLDAuMwoJCQljMCwwLjEsMCwwLjMsMC4xLDAuM2MwLDAuMSwwLjEsMC4xLDAuMSwwLjFjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEtMC4xLDAuMS0wLjFjMC0wLjEsMC0wLjIsMC0wLjRjMC0wLjEsMC0wLjIsMC0wLjMKCQkJQzE2LjMsOC4zLDE2LjMsOC4yLDE2LjMsOC4yeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMy40LDExQzEzLjQsMTEsMTMuNCwxMSwxMy40LDExYy0wLjEsMC0wLjEsMC0wLjIsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zCgkJCWMwLDAuMiwwLDAuMywwLjEsMC40YzAsMC4xLDAuMSwwLjEsMC4xLDAuMWMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMS0wLjEsMC4xLTAuMWMwLTAuMSwwLTAuMiwwLTAuNGMwLTAuMSwwLTAuMiwwLTAuMwoJCQlDMTMuNSwxMS4xLDEzLjUsMTEuMSwxMy40LDExeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMy4zLDkuMUMxMy40LDkuMSwxMy40LDkuMSwxMy4zLDkuMUMxMy41LDkuMSwxMy41LDksMTMuNSw5YzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDMTMuMiw5LjEsMTMuMyw5LjEsMTMuMyw5LjF6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTExLjksMTAuNkMxMS45LDEwLjYsMTIsMTAuNiwxMS45LDEwLjZjMC4xLTAuMSwwLjEtMC4xLDAuMi0wLjJjMC0wLjEsMC0wLjIsMC0wLjRjMC0wLjEsMC0wLjIsMC0wLjMKCQkJYzAtMC4xLDAtMC4xLTAuMS0wLjFjMCwwLDAsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDBjMCwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUMxMS44LDEwLjYsMTEuOSwxMC42LDExLjksMTAuNnoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNOS4xLDEyLjVDOS4xLDEyLjUsOS4xLDEyLjUsOS4xLDEyLjVjLTAuMSwwLTAuMSwwLTAuMiwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjMKCQkJYzAsMC4xLDAsMC4zLDAuMSwwLjNjMCwwLjEsMC4xLDAuMSwwLjEsMC4xYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLTAuMSwwLjEtMC4xYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCUM5LjIsMTIuNiw5LjIsMTIuNSw5LjEsMTIuNXoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNMTAuNSwxMC42QzEwLjUsMTAuNiwxMC41LDEwLjYsMTAuNSwxMC42YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDMTAuNCwxMC41LDEwLjQsMTAuNiwxMC41LDEwLjZ6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTcuNiwxNC45QzcuNiwxNC45LDcuNywxNC45LDcuNiwxNC45YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDNy41LDE0LjgsNy42LDE0LjksNy42LDE0Ljl6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTcuNiwxMy40QzcuNiwxMy40LDcuNywxMy40LDcuNiwxMy40YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDNy41LDEzLjQsNy42LDEzLjQsNy42LDEzLjR6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTExLjksOS4xQzExLjksOS4xLDEyLDkuMSwxMS45LDkuMUMxMiw5LjEsMTIuMSw5LDEyLjEsOWMwLTAuMSwwLTAuMiwwLTAuNGMwLTAuMSwwLTAuMiwwLTAuMwoJCQljMC0wLjEsMC0wLjEtMC4xLTAuMWMwLDAsMCwwLTAuMSwwYzAsMC0wLjEsMC0wLjEsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4xLDAsMC4zLDAuMSwwLjMKCQkJQzExLjgsOS4xLDExLjksOS4xLDExLjksOS4xeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS45LDEzLjVDMTEuOSwxMy41LDEyLDEzLjUsMTEuOSwxMy41YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMC0wLjEsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDAuMWMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJQzExLjgsMTMuNSwxMS44LDEzLjUsMTEuOSwxMy41eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS45LDEyLjFDMTEuOSwxMi4xLDEyLDEyLDExLjksMTIuMWMwLjEtMC4xLDAuMS0wLjEsMC4yLTAuMmMwLTAuMSwwLTAuMiwwLTAuNGMwLTAuMSwwLTAuMiwwLTAuMwoJCQljMC0wLjEsMC0wLjEtMC4xLTAuMWMwLDAsMCwwLTAuMSwwcy0wLjEsMC0wLjEsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJQzExLjgsMTIsMTEuOSwxMi4xLDExLjksMTIuMXoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNMTYsNy4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4xLDAuMSwwLjEsMC4xLDAuMWMwLDAsMC4xLDAsMC4xLDBjMCwwLDAtMC4xLDAuMS0wLjFjMC0wLjEsMC0wLjIsMC0wLjMKCQkJYzAtMC4xLDAtMC4yLDAtMC4zYzAtMC4xLDAtMC4xLTAuMS0wLjFjMCwwLDAsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDBjMCwwLTAuMSwwLjEtMC4xLDAuMkMxNi4xLDcuMSwxNiw3LjIsMTYsNy4yeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS45LDE1QzExLjksMTUsMTIsMTQuOSwxMS45LDE1YzAuMS0wLjEsMC4yLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMC0wLjEsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDAuMWMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJQzExLjgsMTQuOSwxMS44LDE1LDExLjksMTV6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTE2LjMsOS42QzE2LjMsOS42LDE2LjIsOS42LDE2LjMsOS42Yy0wLjEsMC0wLjEsMC0wLjIsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zCgkJCWMwLDAuMSwwLDAuMywwLjEsMC40YzAsMC4xLDAuMSwwLjEsMC4xLDAuMWMwLDAsMC4xLDAsMC4xLDBzMC4xLTAuMSwwLjEtMC4xYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCUMxNi4zLDkuNywxNi4zLDkuNiwxNi4zLDkuNnoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTEuNyw3LjZjMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMCwwLDAuMSwwLDAuMS0wLjFjMCwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLTAuMiwwLTAuMwoJCQljMC0wLjEsMC0wLjEsMC0wLjJjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAuMSwwLDAuMWMwLDAuMSwwLDAuMywwLDAuM2MwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMAoJCQlDMTEuOCw3LjcsMTEuOCw3LjYsMTEuNyw3LjZjMC4xLTAuMSwwLjEtMC4yLDAuMS0wLjNjMCwwLDAsMCwwLDBjMCwwLTAuMSwwLTAuMSwwLjFDMTEuNiw3LjQsMTEuNiw3LjUsMTEuNyw3LjZ6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTEzLjQsNi43bC0wLjIsMC4xbDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4xdjAuNWMwLDAuMSwwLDAuMSwwLDAuMQoJCQljMCwwLDAsMCwwLDBjMCwwLDAsMC0wLjEsMHYwaDAuNHYwYzAsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAtMC4xTDEzLjQsNi43TDEzLjQsNi43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNC44LDYuN2wtMC4yLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMXYwLjVjMCwwLjEsMCwwLjEsMCwwLjEKCQkJYzAsMCwwLDAsMCwwYzAsMCwwLDAtMC4xLDB2MEgxNXYwYzAsMC0wLjEsMC0wLjEsMHMwLDAsMCwwYzAsMCwwLDAsMC0wLjFMMTQuOCw2LjdMMTQuOCw2Ljd6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTE2LDdjMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4xLDAsMC4yLDAuMSwwLjNjMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMCwwLDAuMSwwLDAuMS0wLjEKCQkJYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLTAuMiwwLTAuM2MwLTAuMiwwLTAuMy0wLjEtMC40Yy0wLjEtMC4xLTAuMS0wLjEtMC4yLTAuMWMwLDAtMC4xLDAtMC4xLDBDMTYsNi44LDE2LDYuOSwxNiw3egoJCQkgTTE2LjIsNi44QzE2LjIsNi44LDE2LjMsNi44LDE2LjIsNi44YzAuMSwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuM2MwLDAuMSwwLDAuMS0wLjEsMC4xCgkJCWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC0wLjNDMTYuMSw2LjksMTYuMSw2LjksMTYuMiw2LjgKCQkJQzE2LjEsNi44LDE2LjIsNi44LDE2LjIsNi44eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMC40LDkuMUMxMC40LDkuMSwxMC40LDkuMSwxMC40LDkuMWMwLDAtMC4xLDAtMC4xLDB2MGgwLjR2MGMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLTAuMQoJCQlWOC4yaDBsLTAuMiwwLjFsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjFWOS4xQzEwLjQsOSwxMC40LDkuMSwxMC40LDkuMXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTEuOSw5LjJjMCwwLDAuMSwwLDAuMi0wLjFjMC4xLDAsMC4xLTAuMSwwLjEtMC4yYzAtMC4xLDAuMS0wLjIsMC4xLTAuM2MwLTAuMiwwLTAuMy0wLjEtMC40CgkJCWMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC4xLTAuMSwwLjJzLTAuMSwwLjItMC4xLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUMxMS43LDkuMSwxMS44LDkuMiwxMS45LDkuMnogTTExLjgsOC40YzAtMC4xLDAtMC4yLDAuMS0wLjJjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjMKCQkJQzExLjcsOC42LDExLjcsOC41LDExLjgsOC40eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMyw4LjdjMCwwLjEsMCwwLjMsMC4xLDAuM2MwLjEsMC4xLDAuMSwwLjIsMC4yLDAuMmMwLDAsMC4xLDAsMC4yLTAuMVMxMy42LDksMTMuNiw5CgkJCWMwLTAuMSwwLjEtMC4yLDAuMS0wLjNjMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC4xLTAuMSwwLjIKCQkJQzEzLDguNSwxMyw4LjYsMTMsOC43eiBNMTMuMiw4LjRjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMC4xLDAuMSwwLjFjMCwwLjEsMCwwLjIsMCwwLjMKCQkJYzAsMC4yLDAsMC4zLDAsMC40YzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuM0MxMy4yLDguNiwxMy4yLDguNSwxMy4yLDguNHoKCQkJIi8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTE0LjYsOC4zQzE0LjYsOC4zLDE0LjYsOC4zLDE0LjYsOC4zYzAuMSwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMVY5YzAsMC4xLDAsMC4xLDAsMC4xCgkJCWMwLDAsMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBIMTV2MGMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAtMC4xLDAtMC4xVjguMWgwTDE0LjYsOC4zTDE0LjYsOC4zeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNi4yLDguMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMS0wLjEsMC4yLTAuMSwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQljMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMCwwLDAuMSwwLDAuMi0wLjFjMC4xLDAsMC4xLTAuMSwwLjEtMC4yYzAtMC4xLDAuMS0wLjIsMC4xLTAuM2MwLTAuMiwwLTAuMy0wLjEtMC40CgkJCUMxNi40LDguMiwxNi4zLDguMSwxNi4yLDguMXogTTE2LjQsOWMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMUMxNiw4LjksMTYsOC44LDE2LDguNwoJCQljMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBzMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuMwoJCQlDMTYuNCw4LjgsMTYuNCw4LjksMTYuNCw5eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik05LjEsOS42TDguOSw5LjdsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjF2MC41YzAsMC4xLDAsMC4xLDAsMC4xCgkJCWMwLDAsMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwczAsMCwwLDBjMCwwLDAsMCwwLTAuMUw5LjEsOS42TDkuMSw5LjZMOS4xLDkuNnoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTAuNSwxMC42YzAsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjNjMC0wLjIsMC0wLjMtMC4xLTAuNAoJCQljLTAuMS0wLjEtMC4xLTAuMS0wLjItMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUMxMC4zLDEwLjYsMTAuNCwxMC42LDEwLjUsMTAuNnogTTEwLjMsOS45YzAtMC4xLDAtMC4yLDAuMS0wLjJjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjMKCQkJQzEwLjMsMTAsMTAuMywxMCwxMC4zLDkuOXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTEuNywxMC41YzAuMSwwLjEsMC4yLDAuMiwwLjMsMC4yYzAuMSwwLDAuMSwwLDAuMi0wLjFjMC4xLDAsMC4xLTAuMSwwLjEtMC4yczAuMS0wLjIsMC4xLTAuMwoJCQljMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwLjFjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMS0wLjEsMC4yLTAuMSwwLjMKCQkJQzExLjYsMTAuMiwxMS42LDEwLjQsMTEuNywxMC41eiBNMTEuNyw5LjljMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBzMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMQoJCQljMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjIsMCwwLjMsMCwwLjRjMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC4zCgkJCUMxMS43LDEwLDExLjcsOS45LDExLjcsOS45eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMy4zLDEwLjZDMTMuMywxMC42LDEzLjMsMTAuNiwxMy4zLDEwLjZjMCwwLTAuMSwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwCgkJCWMwLDAsMC0wLjEsMC0wLjFWOS42aDBsLTAuMywwLjFsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjJ2MC42QzEzLjMsMTAuNSwxMy4zLDEwLjUsMTMuMywxMC42CgkJCXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTQuNiw5LjdDMTQuNiw5LjcsMTQuNyw5LjcsMTQuNiw5LjdjMC4xLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNgoJCQljMCwwLjEsMCwwLjEsMCwwLjFzMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBIMTV2MGMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAtMC4xLDAtMC4xVjkuNmgwTDE0LjYsOS43TDE0LjYsOS43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNi4yLDkuNmMtMC4xLDAtMC4xLDAtMC4xLDAuMWMtMC4xLDAtMC4xLDAuMS0wLjEsMC4ycy0wLjEsMC4yLTAuMSwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuNAoJCQljMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMCwwLDAuMSwwLDAuMS0wLjFjMC4xLTAuMiwwLjEtMC41LDAuMi0wLjdjMC0wLjEsMC0wLjItMC4xLTAuMkMxNi40LDkuNiwxNi4zLDkuNiwxNi4yLDkuNnogTTE2LjQsMTAuNAoJCQljMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC40YzAtMC4xLDAtMC4yLDAtMC4zYzAtMC4xLDAtMC4yLDAuMS0wLjIKCQkJYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuM0MxNi40LDEwLjIsMTYuNCwxMC4zLDE2LjQsMTAuNHoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNNy44LDExLjVjMCwwLjIsMCwwLjMsMCwwLjNjMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDAKCQkJYzAsMCwwLjEsMCwwLjEtMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLTAuMiwwLTAuM2MwLTAuMSwwLTAuMi0wLjEtMC4zQzcuOCwxMS4zLDcuOCwxMS40LDcuOCwxMS41CgkJCUM3LjgsMTEuNSw3LjgsMTEuNSw3LjgsMTEuNXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNOC45LDExLjJDOC45LDExLjEsOC45LDExLjEsOC45LDExLjJjMC4xLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4xdjAuNQoJCQlDOSwxMS45LDksMTIsOSwxMmMwLDAsMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLTAuMSwwLTAuMVYxMWgwTDguOSwxMS4yTDguOSwxMS4yeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMC41LDExbC0wLjMsMC4xbDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNmMwLDAuMSwwLDAuMSwwLDAuMQoJCQlzMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLTAuMSwwLTAuMUwxMC41LDExTDEwLjUsMTF6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTExLjcsMTEuOWMwLjEsMC4xLDAuMiwwLjIsMC4zLDAuMmMwLjEsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjMKCQkJYzAtMC4yLDAtMC4zLTAuMS0wLjRDMTIuMSwxMSwxMiwxMSwxMS45LDExYy0wLjEsMC0wLjEsMC0wLjIsMC4xYy0wLjEsMC0wLjEsMC4xLTAuMiwwLjJjMCwwLjEtMC4xLDAuMi0wLjEsMC4zCgkJCUMxMS42LDExLjcsMTEuNiwxMS44LDExLjcsMTEuOXogTTExLjcsMTEuM2MwLTAuMSwwLTAuMiwwLjEtMC4yYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMQoJCQljMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjIsMCwwLjMsMCwwLjRjMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC40CgkJCUMxMS43LDExLjUsMTEuNywxMS40LDExLjcsMTEuM3oiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTMuNywxMS41YzAtMC4yLDAtMC4zLTAuMS0wLjRDMTMuNSwxMSwxMy40LDExLDEzLjMsMTFjLTAuMSwwLTAuMSwwLTAuMiwwLjFjLTAuMSwwLTAuMSwwLjEtMC4yLDAuMgoJCQljMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjRjMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMC4xLDAsMC4xLDAsMC4yLTAuMWMwLjEsMCwwLjEtMC4xLDAuMS0wLjIKCQkJQzEzLjcsMTEuOCwxMy43LDExLjcsMTMuNywxMS41eiBNMTMuNSwxMS45YzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuNAoJCQljMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLTAuMSwwLjEtMC4xYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xYzAsMC4xLDAsMC4yLDAsMC4zCgkJCUMxMy42LDExLjcsMTMuNSwxMS44LDEzLjUsMTEuOXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTQuNywxMkMxNC43LDEyLDE0LjcsMTIsMTQuNywxMmMwLDAtMC4xLDAtMC4xLDB2MEgxNXYwYy0wLjEsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMGMwLDAsMC0wLjEsMC0wLjEKCQkJVjExaDBsLTAuMywwLjFsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjJ2MC42QzE0LjcsMTIsMTQuNywxMiwxNC43LDEyeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNiwxMS4xTDE2LDExLjFDMTYsMTEuMSwxNi4xLDExLjEsMTYsMTEuMWMwLjEsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMHYwYzAtMC4xLDAtMC4xLDAuMS0wLjJMMTYsMTEuMQoJCQl6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTcuNCwxMy4zYzAuMSwwLjEsMC4xLDAuMiwwLjIsMC4yYzAsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMlM4LDEzLjEsOCwxMwoJCQljMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYy0wLjEsMC4yLTAuMSwwLjQtMC4xLDAuN0M3LjMsMTMuMyw3LjQsMTMuMyw3LjQsMTMuMwoJCQl6IE03LjUsMTIuN2MwLTAuMSwwLTAuMiwwLjEtMC4yYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNAoJCQljMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC4zQzcuNCwxMi45LDcuNCwxMi44LDcuNSwxMi43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik05LjQsMTNjMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwLjFjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMgoJCQljMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4xLDAsMC4zLDAuMSwwLjRjMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMC4xLDAsMC4xLDAsMC4yLTAuMXMwLjEtMC4xLDAuMS0wLjIKCQkJQzkuNCwxMy4yLDkuNCwxMy4xLDkuNCwxM3ogTTkuMiwxMy4zYzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuMwoJCQljMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMC4xLDAuMSwwLjFjMCwwLjEsMCwwLjIsMCwwLjMKCQkJQzkuMiwxMy4xLDkuMiwxMy4yLDkuMiwxMy4zeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMC4zLDEyLjZDMTAuMywxMi41LDEwLjQsMTIuNSwxMC4zLDEyLjZjMC4xLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNgoJCQljMCwwLjEsMCwwLjEsMCwwLjFjMCwwLDAsMCwwLDBjMCwwLDAsMC0wLjEsMHYwaDAuNHYwYzAsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMGMwLDAsMC0wLjEsMC0wLjF2LTAuOWgwTDEwLjMsMTIuNkwxMC4zLDEyLjZ6IgoJCQkvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMS43LDEzLjRjMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMC4xLDAsMC4xLDAsMC4yLTAuMWMwLjEsMCwwLjEtMC4xLDAuMS0wLjJjMC0wLjEsMC4xLTAuMiwwLjEtMC4zCgkJCWMwLTAuMiwwLTAuMy0wLjEtMC40Yy0wLjEtMC4xLTAuMS0wLjEtMC4yLTAuMWMtMC4xLDAtMC4xLDAtMC4yLDAuMWMtMC4xLDAtMC4xLDAuMS0wLjIsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuMwoJCQlDMTEuNiwxMy4xLDExLjYsMTMuMywxMS43LDEzLjR6IE0xMS43LDEyLjdjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLTAuMSwwLjEtMC4xYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjQKCQkJQzExLjcsMTIuOSwxMS43LDEyLjgsMTEuNywxMi43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMy4zLDEzLjVDMTMuMywxMy41LDEzLjMsMTMuNSwxMy4zLDEzLjVjMCwwLTAuMSwwLTAuMSwwdjBoMC40djBjLTAuMSwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwCgkJCWMwLDAsMC0wLjEsMC0wLjF2LTFoMGwtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwczAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNkMxMy4zLDEzLjQsMTMuMywxMy41LDEzLjMsMTMuNXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTQuOCwxMi40Yy0wLjEsMC0wLjEsMC0wLjIsMC4xYy0wLjEsMC0wLjEsMC4xLTAuMiwwLjJjMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJYzAsMC4xLDAuMSwwLjEsMC4xLDAuMmMwLDAsMCwwLDAuMS0wLjFjMCwwLDAsMCwwLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjRjMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMgoJCQlDMTQuNywxMi40LDE0LjgsMTIuNCwxNC44LDEyLjRDMTQuOCwxMi40LDE0LjksMTIuNCwxNC44LDEyLjRjMC4xLDAuMSwwLjIsMC4yLDAuMiwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjIsMCwwLjIKCQkJYzAuMS0wLjEsMC4xLTAuMiwwLjItMC4yYzAtMC4yLDAtMC4zLTAuMS0wLjRDMTQuOSwxMi40LDE0LjksMTIuNCwxNC44LDEyLjR6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTcuNiwxNC45YzAsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjNjMC0wLjIsMC0wLjMtMC4xLTAuNAoJCQljLTAuMS0wLjEtMC4xLTAuMS0wLjItMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUM3LjQsMTQuOSw3LjUsMTQuOSw3LjYsMTQuOXogTTcuNSwxNC4yYzAtMC4xLDAtMC4yLDAuMS0wLjJjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjMKCQkJQzcuNCwxNC40LDcuNCwxNC4zLDcuNSwxNC4yeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik05LDE0LjlDOSwxNC45LDksMTQuOSw5LDE0LjljMCwwLTAuMSwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLTAuMSwwLTAuMXYtMC45CgkJCWgwTDguOCwxNGwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwczAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNkM5LDE0LjgsOSwxNC45LDksMTQuOXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTAuNCwxNC45QzEwLjQsMTQuOSwxMC40LDE0LjksMTAuNCwxNC45YzAsMC0wLjEsMC0wLjEsMHYwaDAuNHYwYy0wLjEsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMAoJCQljMCwwLDAtMC4xLDAtMC4xdi0wLjloMEwxMC4zLDE0bDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNkMxMC40LDE0LjgsMTAuNCwxNC45LDEwLjQsMTQuOQoJCQl6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTExLjYsMTQuOGMwLjEsMC4xLDAuMiwwLjIsMC4zLDAuMmMwLjEsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjMKCQkJYzAtMC4yLDAtMC4zLTAuMS0wLjRjLTAuMS0wLjEtMC4yLTAuMS0wLjItMC4xYy0wLjEsMC0wLjEsMC0wLjIsMC4xYy0wLjEsMC0wLjEsMC4xLTAuMiwwLjJjMCwwLjEtMC4xLDAuMi0wLjEsMC4zCgkJCUMxMS41LDE0LjYsMTEuNiwxNC43LDExLjYsMTQuOHogTTExLjcsMTQuMWMwLTAuMSwwLTAuMiwwLjEtMC4yYzAsMCwwLjEtMC4xLDAuMS0wLjFjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMC4xLDAuMSwwLjEKCQkJYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAsMC40YzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuNAoJCQlDMTEuNywxNC4zLDExLjcsMTQuMiwxMS43LDE0LjF6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTEzLjQsMTMuOGwtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMnYwLjUKCQkJYzAuMSwwLDAuMS0wLjEsMC4xLTAuMUwxMy40LDEzLjhMMTMuNCwxMy44eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik03LjgsMTUuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjMKCQkJYzAsMCwwLDAsMC4xLDBjMC0wLjEsMC0wLjEsMC0wLjJjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwQzcuNywxNS40LDcuOCwxNS41LDcuOCwxNS40CgkJCWMwLDAuMiwwLDAuMywwLDAuNGMwLDAsMCwwLDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBDNy45LDE1LjcsNy45LDE1LjUsNy44LDE1LjR6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTkuMywxNS40Yy0wLjEtMC4xLTAuMS0wLjEtMC4yLTAuMWMtMC4xLDAtMC4xLDAtMC4xLDAuMWMtMC4xLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuMwoJCQljMCwwLDAsMCwwLDAuMWMwLDAsMC4xLDAsMC4xLDBsMCwwYzAsMCwwLDAsMC0wLjFjMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwCgkJCUM5LjIsMTUuNCw5LjIsMTUuNSw5LjMsMTUuNGMwLDAuMiwwLDAuMywwLDAuNGMwLDAsMCwwLjEsMCwwLjFjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMC0wLjFDOS40LDE1LjcsOS40LDE1LjUsOS4zLDE1LjR6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTEwLjUsMTUuM2wtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMnYwLjJjMCwwLDAuMSwwLDAuMSwwCgkJCUwxMC41LDE1LjNMMTAuNSwxNS4zTDEwLjUsMTUuM3oiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTIsMTUuMmwtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwQzExLjksMTUuNCwxMS45LDE1LjMsMTIsMTUuMkwxMiwxNS4yTDEyLDE1LjJMMTIsMTUuMnoKCQkJIi8+Cgk8L2c+CjwvZz4KPC9zdmc+" alt="chata.ai" height="22px" width="22px" draggable="false"></div>
            <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input-renderer chat-bar left-padding" placeholder="Ask me anything" value="" id="">
        </div>

        `;
        // onkeyup="ChatBarEvent(event)" onkeypress="ChatBarSendMessage(event)"
        // <div class="chat-bar-loading"><div class="response-loading"><div></div><div></div><div></div><div></div></div></div>
        chataBarContainer.chatbar = chataBarContainer.getElementsByClassName('chata-input-renderer')[0];
        chataBarContainer.bind = function(responseRenderer){
            this.responseRenderer = responseRenderer;
            responseRenderer.chataBarContainer = chataBarContainer;
        }

        chataBarContainer.onkeyup = function(){
            var suggestionList = this.getElementsByClassName('chat-bar-autocomplete')[0];
            suggestionList.style.display = 'none';
            if(event.target.value){
                ChatDrawer.autocomplete(event.target.value, suggestionList, 'suggestion-renderer', {});
            }
        }

        chataBarContainer.onkeypress = function(event){
            var suggestionList = event.target.parentElement.getElementsByClassName('chat-bar-autocomplete')[0];
            suggestionList.style.display = 'none';
            if(event.keyCode == 13 && event.target.value){
                try {
                    ChatDrawer.xhr.onreadystatechange = null;
                    ChatDrawer.xhr.abort();
                } catch (e) {}
                this.sendMessageToResponseRenderer(chataBarContainer.chatbar.value);
            }
        }

        chataBarContainer.sendMessageToResponseRenderer = function(value){
            var responseRenderer = this.responseRenderer;
            var parent = this.getElementsByClassName('chat-bar-text')[0];
            this.chatbar.disabled = true;
            this.chatbar.value = '';

            var responseLoadingContainer = putLoadingContainer(parent);
            const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
              value
            )}&projectId=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;
            const URL = `https://backend-staging.chata.ai/api/v1/query?q=${value}&project=1&unified_query_id=${uuidv4()}`;

            ChatDrawer.ajaxCall(URL_SAFETYNET, function(jsonResponse){
                if(jsonResponse['full_suggestion'].length > 0){
                    responseRenderer.innerHTML = '';
                    this.chatbar.removeAttribute("disabled");
                    parent.removeChild(responseLoadingContainer);
                }else{
                    ChatDrawer.ajaxCall(URL, function(jsonResponse){
                        responseRenderer.innerHTML = '';
                        chataBarContainer.chatbar.removeAttribute("disabled");
                        parent.removeChild(responseLoadingContainer);
                        switch(jsonResponse['display_type']){
                            case 'suggestion':
                                var data = jsonResponse['data'].split('\n');
                                responseRenderer.innerHTML = `<div>I'm not sure what you mean by <strong>"${value}"</strong>. Did you mean:</div>`;
                                ChatDrawer.createSuggestions(responseRenderer, data, 'chata-suggestion-btn-renderer');
                            break;
                            case 'table':
                                var uuid = uuidv4();
                                ChatDrawer.responses[uuid] = jsonResponse;
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                responseRenderer.appendChild(div);
                                if(jsonResponse['columns'].length == 1){
                                    var data = jsonResponse['data'];
                                    responseRenderer.innerHTML = `<div>${data}</div>`;
                                }else{
                                    ChatDrawer.createTable(jsonResponse, div, 'append', uuid, 'table-response-renderer');
                                }
                            break;
                            case 'date_pivot':
                                var uuid = uuidv4();
                                ChatDrawer.responses[uuid] = jsonResponse;
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                responseRenderer.appendChild(div);
                                var pivotArray = ChatDrawer.getDatePivotArray(jsonResponse);
                                ChatDrawer.createPivotTable(pivotArray, div, 'append', uuid, 'table-response-renderer');
                            break;
                            case 'pivot_column':
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                responseRenderer.appendChild(div);
                                var pivotArray = ChatDrawer.getPivotColumnArray(jsonResponse);
                                ChatDrawer.createPivotTable(pivotArray, div, 'append', '', 'table-response-renderer');
                            break;
                            case 'line':
                                var values = ChatDrawer.formatDataToBarChart(jsonResponse);
                                var grouped = values[0];
                                var hasNegativeValues = values[1];
                                var col1 = ChatDrawer.formatColumnName(jsonResponse['columns'][0]['name']);
                                var col2 = ChatDrawer.formatColumnName(jsonResponse['columns'][1]['name']);
                                ChatDrawer.createLineChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false);
                            break;
                            case 'bar':
                                var values = ChatDrawer.formatDataToBarChart(jsonResponse);
                                var grouped = values[0];
                                var hasNegativeValues = values[1];
                                var col1 = ChatDrawer.formatColumnName(jsonResponse['columns'][0]['name']);
                                var col2 = ChatDrawer.formatColumnName(jsonResponse['columns'][1]['name']);
                                ChatDrawer.createBarChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false);
                            break;
                            case 'column':
                                var values = ChatDrawer.formatDataToBarChart(jsonResponse);
                                var grouped = values[0];
                                var col1 = ChatDrawer.formatColumnName(jsonResponse['columns'][0]['name']);
                                var col2 = ChatDrawer.formatColumnName(jsonResponse['columns'][1]['name']);
                                var hasNegativeValues = values[1];
                                ChatDrawer.createColumnChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false);
                            break;
                            case 'heatmap':
                                var values = ChatDrawer.formatDataToHeatmap(jsonResponse);
                                var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                                var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                                var col1 = ChatDrawer.formatColumnName(jsonResponse['columns'][0]['name']);
                                var col2 = ChatDrawer.formatColumnName(jsonResponse['columns'][1]['name']);
                                var col3 = ChatDrawer.formatColumnName(jsonResponse['columns'][2]['name']);
                                ChatDrawer.createHeatmap(responseRenderer, labelsX, labelsY, values, col1, col2, col3, false);
                            break;
                            case 'bubble':
                                var values = ChatDrawer.formatDataToHeatmap(jsonResponse);
                                var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                                var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                                var col1 = ChatDrawer.formatColumnName(jsonResponse['columns'][0]['name']);
                                var col2 = ChatDrawer.formatColumnName(jsonResponse['columns'][1]['name']);
                                var col3 = ChatDrawer.formatColumnName(jsonResponse['columns'][2]['name']);
                                ChatDrawer.createBubbleChart(responseRenderer, labelsX, labelsY, values, col1, col2, col3, false);
                            break;
                            default:

                        }
                    });
                }
            });
        }

        return chataBarContainer;
    }

    ChatDrawer.createResponseRenderer = function(){
        var responseContentContainer = document.createElement('div')
        responseContentContainer.classList.add('chata-response-content-container');
        responseContentContainer.classList.add('renderer-container');

        return responseContentContainer;
    }

    ChatDrawer.createBar = function(){
        var chataBarContainer = document.createElement('div');
        chataBarContainer.classList.add('chata-bar-container');
        chataBarContainer.classList.add('chat-drawer-chat-bar');
        chataBarContainer.classList.add('autosuggest-top');
        var htmlBar = `
        <div class="watermark">
            <svg x="0px" y="0px" width="14px" height="13px" viewBox="0 0 16 14"><path class="chata-icon-svg-0" d="M15.1,13.5c0,0-0.5-0.3-0.5-1.7V9.6c0-1.9-1.1-3.7-2.9-4.4C11.5,5.1,11.3,5,11,5c-0.1-0.3-0.2-0.5-0.3-0.7l0,0
                C9.9,2.5,8.2,1.4,6.3,1.4c0,0,0,0-0.1,0C5,1.4,3.8,1.9,2.8,2.8C1.9,3.6,1.4,4.8,1.4,6.1c0,0.1,0,0.1,0,0.2v2.2
                c0,1.3-0.4,1.7-0.4,1.7h0l-1,0.7l1.2,0.1c0.8,0,1.7-0.2,2.3-0.7c0.2,0.2,0.5,0.3,0.8,0.4c0.2,0.1,0.5,0.2,0.8,0.2
                c0.1,0.2,0.1,0.5,0.2,0.7c0.8,1.7,2.5,2.8,4.4,2.8c0,0,0.1,0,0.1,0c1,0,2-0.3,2.7-0.7c0.7,0.5,1.6,0.8,2.4,0.7l1.1-0.1L15.1,13.5z
                M10.4,6.2c0,0.9-0.3,1.8-0.9,2.5C9.2,9,8.9,9.3,8.6,9.5C8.3,9.6,8.1,9.7,7.9,9.8C7.6,9.9,7.3,10,7.1,10c-0.3,0.1-0.6,0.1-0.8,0.1
                c-0.1,0-0.3,0-0.4,0c0,0-0.1,0-0.1,0c0,0,0-0.1,0-0.1c0-0.1,0-0.2,0-0.4c0-0.8,0.2-1.6,0.7-2.2C6.5,7.2,6.7,7,6.9,6.8
                C7,6.7,7.1,6.6,7.2,6.5c0.2-0.2,0.4-0.3,0.7-0.4C8.1,6,8.3,5.9,8.6,5.8C9,5.7,9.4,5.6,9.8,5.6c0.1,0,0.3,0,0.4,0c0,0,0.1,0,0.1,0
                C10.4,5.8,10.4,6,10.4,6.2z M3.8,9.3L3.5,9.1L3.2,9.3C2.9,9.7,2.4,9.9,2,10c0.1-0.4,0.2-0.8,0.2-1.5l0-2.2c0,0,0-0.1,0-0.1
                c0-1.1,0.5-2,1.2-2.8c0.7-0.7,1.7-1.1,2.7-1.1c0,0,0.1,0,0.1,0c1.6,0,3.1,0.9,3.8,2.3c0,0.1,0.1,0.2,0.1,0.3c-0.1,0-0.2,0-0.3,0
                c-0.5,0-1,0.1-1.5,0.2C8.1,5.1,7.8,5.2,7.5,5.4C7.2,5.5,6.9,5.7,6.7,5.9C6.6,6,6.4,6.1,6.3,6.2C6.1,6.4,5.9,6.7,5.7,6.9
                C5.2,7.7,4.9,8.6,4.9,9.6c0,0.1,0,0.2,0,0.3c-0.1,0-0.2-0.1-0.3-0.1C4.3,9.7,4,9.5,3.8,9.3z M12.8,12.7l-0.3-0.3l-0.3,0.3
                c-0.5,0.5-1.4,0.8-2.4,0.8c-1.6,0.1-3.1-0.9-3.8-2.3c0-0.1-0.1-0.2-0.1-0.3c0.1,0,0.2,0,0.3,0c0.3,0,0.7,0,1-0.1
                c0.3-0.1,0.6-0.1,0.9-0.3c0.3-0.1,0.6-0.3,0.8-0.4C9.4,9.9,9.7,9.6,10,9.2c0.7-0.8,1.1-1.9,1.1-3c0-0.1,0-0.3,0-0.4
                c0.1,0,0.2,0.1,0.3,0.1c1.5,0.6,2.4,2.1,2.4,3.7v2.2c0,0.7,0.1,1.2,0.3,1.6C13.6,13.3,13.2,13.1,12.8,12.7z"></path>
            </svg>
            We run on Chata
        </div>
        <div class="auto-complete-suggestions">
            <ul id="auto-complete-list">
            </ul>
        </div>
        <div class="text-bar">
            <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input" placeholder="Ask me anything" value="" id="chata-input">
            <button id="chata-voice-record-button" class="chat-voice-record-button" data-tip="Hold to Use Voice" data-for="chata-speech-to-text-tooltip" data-tip-disable="false" currentitem="false"><img class="chat-voice-record-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgd2lkdGg9IjU0NC4ycHgiIGhlaWdodD0iNTQ0LjJweCIgdmlld0JveD0iMCAwIDU0NC4yIDU0NC4yIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1NDQuMiA1NDQuMiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGNsYXNzPSJtaWMtaWNvbiIgZmlsbD0iI0ZGRkZGRiIgZD0iTTQzOS41LDIwOS4zYy01LjcsMC0xMC42LDIuMS0xNC43LDYuMmMtNC4xLDQuMS02LjIsOS4xLTYuMiwxNC43djQxLjljMCw0MC4zLTE0LjMsNzQuOC00MywxMDMuNQoJYy0yOC43LDI4LjctNjMuMiw0My0xMDMuNSw0M2MtNDAuMywwLTc0LjgtMTQuMy0xMDMuNS00M2MtMjguNy0yOC43LTQzLTYzLjItNDMtMTAzLjV2LTQxLjljMC01LjctMi4xLTEwLjYtNi4yLTE0LjcKCWMtNC4xLTQuMS05LjEtNi4yLTE0LjctNi4yYy01LjcsMC0xMC42LDIuMS0xNC43LDYuMmMtNC4xLDQuMS02LjIsOS4xLTYuMiwxNC43djQxLjljMCw0OC4yLDE2LjEsOTAuMSw0OC4yLDEyNS43CgljMzIuMiwzNS43LDcxLjksNTYuMSwxMTkuMiw2MS4zdjQzLjJoLTgzLjdjLTUuNywwLTEwLjYsMi4xLTE0LjcsNi4yYy00LjEsNC4xLTYuMiw5LTYuMiwxNC43YzAsNS43LDIuMSwxMC42LDYuMiwxNC43CgljNC4xLDQuMSw5LDYuMiwxNC43LDYuMmgyMDkuM2M1LjcsMCwxMC42LTIuMSwxNC43LTYuMmM0LjEtNC4xLDYuMi05LjEsNi4yLTE0LjdjMC01LjctMi4xLTEwLjYtNi4yLTE0LjcKCWMtNC4xLTQuMS05LjEtNi4yLTE0LjctNi4ySDI5M3YtNDMuMmM0Ny4zLTUuMiw4Ny0yNS43LDExOS4yLTYxLjNjMzIuMi0zNS42LDQ4LjItNzcuNiw0OC4yLTEyNS43di00MS45YzAtNS43LTIuMS0xMC42LTYuMi0xNC43CglDNDUwLjEsMjExLjQsNDQ1LjIsMjA5LjMsNDM5LjUsMjA5LjN6Ii8+CjxwYXRoIGNsYXNzPSJtaWMtaWNvbiIgZmlsbD0iI0ZGRkZGRiIgZD0iTTIyMi44LDIwMy43aC01NS4zdjM4LjRoNTUuM2M4LjUsMCwxNS4zLDYuOCwxNS4zLDE1LjNzLTYuOCwxNS4zLTE1LjMsMTUuM2gtNTUuMwoJYzAuMiwyOC41LDEwLjQsNTIuOSwzMC43LDczLjNjMjAuNSwyMC41LDQ1LjEsMzAuNyw3My45LDMwLjdjMjguOCwwLDUzLjQtMTAuMiw3My45LTMwLjdjMjAuMy0yMC4zLDMwLjYtNDQuOCwzMC43LTczLjNoLTUzLjQKCWMtOC41LDAtMTUuMy02LjgtMTUuMy0xNS4zczYuOC0xNS4zLDE1LjMtMTUuM2g1My40di0zOC40aC01My40Yy04LjUsMC0xNS4zLTYuOC0xNS4zLTE1LjNzNi44LTE1LjMsMTUuMy0xNS4zaDUzLjR2LTQwLjhoLTUzLjQKCWMtOC41LDAtMTUuMy02LjgtMTUuMy0xNS4zczYuOC0xNS4zLDE1LjMtMTUuM2g1My4zYy0wLjctMjcuNS0xMC44LTUxLjItMzAuNi03MUMzMjUuNSwxMC4yLDMwMC45LDAsMjcyLjEsMAoJYy0yOC44LDAtNTMuNCwxMC4yLTczLjksMzAuN2MtMTkuOCwxOS44LTI5LjksNDMuNS0zMC42LDcxaDU1LjJjOC41LDAsMTUuMyw2LjgsMTUuMywxNS4zcy02LjgsMTUuMy0xNS4zLDE1LjNoLTU1LjN2NDAuOGg1NS4zCgljOC41LDAsMTUuMyw2LjgsMTUuMywxNS4zUzIzMS4yLDIwMy43LDIyMi44LDIwMy43eiIvPgo8L3N2Zz4=" alt="speech to text button" height="22px" width="22px" draggable="false">
            </button>
        </div>
        `;
        chataBarContainer.innerHTML = htmlBar;
        ChatDrawer.rootElem.appendChild(chataBarContainer);
    }

    ChatDrawer.createDrawerContent = function(){
        var drawerContent = document.createElement('div');
        var firstMessage = document.createElement('div');
        var chatMessageBubble = document.createElement('div');
        chatMessageBubble.textContent = ChatDrawer.options.introMessage;
        drawerContent.classList.add('drawer-content');
        firstMessage.classList.add('chat-single-message-container');
        firstMessage.classList.add('response');
        chatMessageBubble.classList.add('chat-message-bubble');

        firstMessage.appendChild(chatMessageBubble);
        drawerContent.appendChild(firstMessage);
        ChatDrawer.rootElem.appendChild(drawerContent);
        ChatDrawer.drawerContent = drawerContent;
    }

    ChatDrawer.createHeader = function(){
        var chatHeaderContainer = document.createElement('div');
        var htmlHeader = `
            <div class="chata-header-left">
                <button class="chata-button close close-action" data-tip="Close Drawer" data-for="chata-header-tooltip" currentitem="false"><svg class="close-action" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="close-action" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>
            </div>
            <div class="chata-header-center-container">
                ${ChatDrawer.options.title}
            </div>
            <div class="chata-header-right-container">
                <button class="chata-button clear-all" data-tip="Clear Messages" data-for="chata-header-tooltip" currentitem="false"><svg class="clear-all" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="clear-all" d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path></svg></button>
            </div>`;
        chatHeaderContainer.classList.add('chat-header-container');
        chatHeaderContainer.innerHTML = htmlHeader;

        ChatDrawer.rootElem.appendChild(chatHeaderContainer);
    }

    ChatDrawer.registerEvents = function(){
        var chataInput = document.getElementById('chata-input');
        var suggestionList = document.getElementById('auto-complete-list');
        document.addEventListener('click',function(e){
            if(e.target){
                if(e.target.classList.contains('bar') || e.target.classList.contains('line-dot')
                || e.target.classList.contains('square') || e.target.classList.contains('circle')){
                    var selectedBars = e.target.parentElement.getElementsByClassName('active');
                    for (var i = 0; i < selectedBars.length; i++) {
                        selectedBars[i].classList.remove('active');
                    }
                    e.target.classList.add('active');
                }

                if(e.target.id == 'drawer-wrapper'){
                    if(ChatDrawer.options.showMask && ChatDrawer.options.maskClosable){
                        ChatDrawer.options.onMaskClick();
                    }
                }

                if(e.target.classList.contains('close-action')){
                    ChatDrawer.closeDrawer();
                }
                if(e.target.classList.contains('open-action')){
                    ChatDrawer.openDrawer();
                    ChatDrawer.options.onHandleClick();
                }
                if(e.target.classList.contains('suggestion')){
                    console.log(e.target.textContent);
                    suggestionList.style.display = 'none';
                    ChatDrawer.sendMessage(chataInput, e.target.textContent);
                }
                if(e.target.classList.contains('suggestion-renderer')){
                    var parent = e.target.parentElement.parentElement.parentElement.parentElement;
                    var chatBarSuggestionList = parent.getElementsByClassName('chat-bar-autocomplete')[0];
                    chatBarSuggestionList.style.display = 'none';
                    parent.sendMessageToResponseRenderer(e.target.textContent);
                }
                if(e.target.classList.contains('chata-suggestion-btn')){
                    ChatDrawer.sendMessage(chataInput, e.target.textContent);
                }
                if(e.target.classList.contains('chata-suggestion-btn-renderer')){
                    var parent = e.target.parentElement.parentElement;
                    parent.chataBarContainer.sendMessageToResponseRenderer(e.target.textContent);
                }
                if(e.target.classList.contains('clipboard')){
                    if(e.target.tagName == 'svg'){
                        var json = ChatDrawer.responses[e.target.parentElement.dataset.id];
                    }else if(e.target.tagName == 'path'){
                        var json = ChatDrawer.responses[e.target.parentElement.parentElement.dataset.id];
                    }else{
                        var json = ChatDrawer.responses[e.target.dataset.id];
                    }
                    copyTextToClipboard(ChatDrawer.createCsvData(json, '\t'));
                }
                if(e.target.classList.contains('csv')){
                    if(e.target.tagName == 'svg'){
                        var json = ChatDrawer.responses[e.target.parentElement.dataset.id];
                    }else if(e.target.tagName == 'path'){
                        var json = ChatDrawer.responses[e.target.parentElement.parentElement.dataset.id];
                    }else{
                        var json = ChatDrawer.responses[e.target.dataset.id];
                    }
                    var csvData = ChatDrawer.createCsvData(json);
                    var link = document.createElement("a");
                    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
                    link.setAttribute('download', 'test.csv');
                    link.click();
                }
                if(e.target.classList.contains('column')){
                    var tableElement = e.target.parentElement.parentElement.parentElement;
                    if(e.target.nextSibling.classList.contains('up')){
                        e.target.nextSibling.classList.remove('up');
                        e.target.nextSibling.classList.add('down');
                        var sortData = ChatDrawer.sort(tableElement, 'desc', e.target.dataset.index, e.target.dataset.type);
                        ChatDrawer.refreshTableData(tableElement, sortData);
                    }else{
                        e.target.nextSibling.classList.remove('down');
                        e.target.nextSibling.classList.add('up');
                        var sortData = ChatDrawer.sort(tableElement, 'asc', parseInt(e.target.dataset.index), e.target.dataset.type);
                        ChatDrawer.refreshTableData(tableElement, sortData);
                    }
                }
                if(e.target.classList.contains('column-pivot')){
                    var tableElement = e.target.parentElement.parentElement.parentElement;
                    var pivotArray = [];
                    var json = ChatDrawer.responses[tableElement.dataset.componentid];
                    if(json['display_type'] == 'date_pivot'){
                        pivotArray = ChatDrawer.getDatePivotArray(json);
                    }else{
                        pivotArray = ChatDrawer.getPivotColumnArray(json);
                    }
                    if(e.target.nextSibling.classList.contains('up')){
                        e.target.nextSibling.classList.remove('up');
                        e.target.nextSibling.classList.add('down');
                        var sortData = ChatDrawer.sortPivot(pivotArray, e.target.dataset.index, 'desc');
                        ChatDrawer.refreshPivotTable(tableElement, sortData);
                    }else{
                        e.target.nextSibling.classList.remove('down');
                        e.target.nextSibling.classList.add('up');
                        var sortData = ChatDrawer.sortPivot(pivotArray, e.target.dataset.index, 'asc');
                        ChatDrawer.refreshPivotTable(tableElement, sortData);
                    }
                }
                if(e.target.classList.contains('pivot_table')){
                    if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else if(e.target.tagName == 'path'){
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    ChatDrawer.refreshToolbarButtons(component, 'date_pivot');
                    if(json['display_type'] == 'date_pivot'){
                        var pivotArray = ChatDrawer.getDatePivotArray(json);
                        ChatDrawer.createPivotTable(pivotArray, component);
                    }else{
                        var pivotArray = ChatDrawer.getPivotColumnArray(json);
                        ChatDrawer.createPivotTable(pivotArray, component);
                    }
                }
                if(e.target.classList.contains('column_chart')){
                    if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else if(e.target.tagName == 'path'){
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    ChatDrawer.refreshToolbarButtons(component, 'column');
                    var values = ChatDrawer.formatDataToBarChart(json);
                    var grouped = values[0];
                    var col1 = ChatDrawer.formatColumnName(json['columns'][0]['name']);
                    var col2 = ChatDrawer.formatColumnName(json['columns'][1]['name']);
                    var hasNegativeValues = values[1];
                    ChatDrawer.createColumnChart(component, grouped, col1, col2, hasNegativeValues);
                }
                if(e.target.classList.contains('table')){
                    if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else if(e.target.tagName == 'path'){
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    ChatDrawer.refreshToolbarButtons(component, 'table');
                    ChatDrawer.createTable(json, component);
                }

                if(e.target.classList.contains('bar_chart')){
                    if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else if(e.target.tagName == 'path'){
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    var groupableField = ChatDrawer.getGroupableField(json);
                    var values = ChatDrawer.formatDataToBarChart(json);
                    var grouped = values[0];
                    var hasNegativeValues = values[1];
                    var col1 = ChatDrawer.formatColumnName(json['columns'][0]['name']);
                    var col2 = ChatDrawer.formatColumnName(json['columns'][1]['name']);

                    ChatDrawer.createBarChart(component, grouped, col1, col2, hasNegativeValues);
                    ChatDrawer.refreshToolbarButtons(component, 'bar');

                }

                if(e.target.classList.contains('line_chart')){
                    if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else if(e.target.tagName == 'path'){
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    var values = ChatDrawer.formatDataToBarChart(json);
                    var grouped = values[0];
                    var hasNegativeValues = values[1];
                    var col1 = ChatDrawer.formatColumnName(json['columns'][0]['name']);
                    var col2 = ChatDrawer.formatColumnName(json['columns'][1]['name']);

                    ChatDrawer.createLineChart(component, grouped, col1, col2, hasNegativeValues);
                    ChatDrawer.refreshToolbarButtons(component, 'line');
                }

                if(e.target.classList.contains('heatmap')){
                    console.log(e.target.tagName);
                    if(e.target.tagName == 'BUTTON'){
                        var idRequest = e.target.dataset.id;
                    }
                    else if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    var values = ChatDrawer.formatDataToHeatmap(json);
                    var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                    var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);

                    var col1 = ChatDrawer.formatColumnName(json['columns'][0]['name']);
                    var col2 = ChatDrawer.formatColumnName(json['columns'][1]['name']);
                    var col3 = ChatDrawer.formatColumnName(json['columns'][2]['name']);


                    ChatDrawer.createHeatmap(component, labelsX, labelsY, values, col1, col2, col3);
                    ChatDrawer.refreshToolbarButtons(component, 'heatmap');
                }

                if(e.target.classList.contains('bubble_chart')){
                    if(e.target.tagName == 'BUTTON'){
                        var idRequest = e.target.dataset.id;
                    }
                    else if(e.target.tagName == 'svg'){
                        var idRequest = e.target.parentElement.dataset.id;
                    }else{
                        var idRequest = e.target.parentElement.parentElement.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    var values = ChatDrawer.formatDataToHeatmap(json);
                    var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                    var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);

                    var col1 = ChatDrawer.formatColumnName(json['columns'][0]['name']);
                    var col2 = ChatDrawer.formatColumnName(json['columns'][1]['name']);
                    var col3 = ChatDrawer.formatColumnName(json['columns'][2]['name']);


                    ChatDrawer.createBubbleChart(component, labelsX, labelsY, values, col1, col2, col3);
                    ChatDrawer.refreshToolbarButtons(component, 'bubble');
                }
                if(e.target.classList.contains('export_png')){
                    if(e.target.tagName == 'svg'){
                        idRequest = e.target.parentElement.dataset.id;
                    }else if(e.target.tagName == 'path'){
                        idRequest = e.target.parentElement.parentElement.dataset.id;
                    }else{
                        idRequest = e.target.dataset.id;
                    }
                    var json = ChatDrawer.responses[idRequest];
                    var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                    var svg = component.getElementsByTagName('svg')[0];
                    var svgString = ChatDrawer.getSVGString(svg);
                    ChatDrawer.svgString2Image( svgString, 2*component.clientWidth, 2*component.clientHeight);
                }
                if(e.target.classList.contains('clear-all')){
                    ChatDrawer.clearMessages();
                }
            }
        });

        chataInput.onkeyup = function(){
            if(ChatDrawer.options.enableAutocomplete){
                suggestionList.style.display = 'none';
                if(this.value){
                    ChatDrawer.autocomplete(this.value, suggestionList, 'suggestion', ChatDrawer.options.autocompleteStyles);
                }
            }
        }

        chataInput.onkeypress = function(event){
            if(event.keyCode == 13 && this.value){
                try {
                    ChatDrawer.xhr.onreadystatechange = null;
                    ChatDrawer.xhr.abort();
                } catch (e) {}
                suggestionList.style.display = 'none';
                ChatDrawer.sendMessage(chataInput, this.value);
            }
        }
    }

    ChatDrawer.clearMessages = function(){
        [].forEach.call(ChatDrawer.drawerContent.querySelectorAll('.chat-single-message-container'), function(e, index){
            if(index == 0) return;
            e.parentNode.removeChild(e);
        });
    }

    ChatDrawer.createTable = function(jsonResponse, oldComponent, action='replace', uuid, tableClass='table-response'){
        var data = jsonResponse['data'].split('\n');
        var table = document.createElement('table');
        var header = document.createElement('tr');
        table.classList.add(tableClass);
        if(oldComponent.dataset.componentid){
            table.setAttribute('data-componentid', oldComponent.dataset.componentid);
            if(oldComponent.parentElement.classList.contains('chata-chart-container')){
                oldComponent.parentElement.classList.remove('chata-chart-container');
                oldComponent.parentElement.classList.add('chata-table-container');
            }
        }else{
            table.setAttribute('data-componentid', uuid);
        }
        var dataLines = jsonResponse['data'].split('\n');

        for (var i = 0; i < jsonResponse['columns'].length; i++) {
            var colName = ChatDrawer.formatColumnName(jsonResponse['columns'][i]['name']);
            var th = document.createElement('th');
            var arrow = document.createElement('div');
            var col = document .createElement('div');
            col.textContent = colName;
            arrow.classList.add('tabulator-arrow');
            arrow.classList.add('up');
            col.classList.add('column');
            col.setAttribute('data-type', jsonResponse['columns'][i]['type']);
            col.setAttribute('data-index', i);

            th.appendChild(col);
            th.appendChild(arrow);
            header.appendChild(th);
        }
        table.appendChild(header);
        for (var i = 0; i < dataLines.length; i++) {
            var data = dataLines[i].split(',');
            var tr = document.createElement('tr');
            for (var x = 0; x < data.length; x++) {
                value = ChatDrawer.formatData(data[x], jsonResponse['columns'][x]['type']);
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        if(action == 'replace'){
            oldComponent.parentElement.replaceChild(table, oldComponent);
        }else{
            oldComponent.appendChild(table);
        }
    }

    ChatDrawer.getPivotColumnArray = function(json){
        var lines = json['data'].split('\n');
        var values = [];
        var firstColName = '';
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
            var row = [];
            for (var x = 0; x < data.length; x++) {
                if(firstColName == '' && json['columns'][x]['groupable']){
                    var name = json['columns'][x]['name'];
                    firstColName = name.charAt(0).toUpperCase() + name.slice(1);
                }
                row.push(ChatDrawer.formatData(data[x], json['columns'][x]['type']));
            }
            values.push(row);
        }
        var pivotArray = ChatDrawer.getPivotArray(values, 0, 1, 2, firstColName);
        return pivotArray;
    }

    ChatDrawer.sortPivot = function(pivotArray, colIndex, operator){
        // Remove header
        pivotArray.shift();
        if(operator == 'asc'){
            var comparator = function(a, b) {
                if(a[colIndex].charAt(0) === '$' || a['colIndex'] === '0'){
                    return parseFloat(a[colIndex].slice(1)) > parseFloat(b[colIndex].slice(1)) ? 1 : -1;
                }else{
                    return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
                }
            }
        }else{
            var comparator = function(a, b) {
                if(a[colIndex].charAt(0) === '$' || a['colIndex'] === '0'){
                    return parseFloat(a[colIndex].slice(1)) < parseFloat(b[colIndex].slice(1)) ? 1 : -1;
                }else{
                    return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
                }
            }
        }
        return pivotArray.sort(comparator);
    }

    ChatDrawer.getDatePivotArray = function(json){
        var lines = json['data'].split('\n');
        var values = [];
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
            var row = [];
            for (var x = 0; x < data.length; x++) {

                switch (json['columns'][x]['type']) {
                    case 'DATE':
                        var value = data[x];
                        var date = new Date( parseInt(value) * 1000);
                        row.unshift(MONTH_NAMES[date.getMonth()], date.getFullYear());
                        break;
                    default:
                        row.push(ChatDrawer.formatData(data[x], json['columns'][x]['type']));
                }
            }
            values.push(row);
        }

        var pivotArray = ChatDrawer.getPivotArray(values, 0, 1, 2, 'Month');
        return pivotArray;
    }

    ChatDrawer.getGroupableField = function(json){
        var r = {
            indexCol: -1,
            jsonCol: {},
            name: ''
        }
        for (var i = 0; i < json['columns'].length; i++) {
            if(json['columns'][i]['groupable']){
                r['indexCol'] = i;
                r['jsonCol'] = json['columns'][i];
                r['name'] = json['columns'][i]['name'];
                return r;
            }
        }
        return -1;
    }

    ChatDrawer.makeBarChartDomain = function(data, hasNegativeValues){
        if(hasNegativeValues){
            return d3.extent(data, function(d) { return d.value; });
        }else{
            return [0, d3.max(data, function(d) {
                return d.value;
            })];
        }
    }

    ChatDrawer.getUniqueValues = function(data, getter){
        let unique = {};
        data.forEach(function(i) {
            if(!unique[getter(i)]) {
                unique[getter(i)] = true;
            }
        });
        return Object.keys(unique);
    }

    ChatDrawer.formatDataToHeatmap = function(json){
        var lines = json['data'].split('\n');
        var values = [];
        var groupField = ChatDrawer.getGroupableField(json);
        var colType1 = json['columns'][0]['type'];
        var colType2 = json['columns'][1]['type'];
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
            var row = {};
            row['labelY'] = ChatDrawer.formatData(data[0], colType1);
            row['labelX'] = ChatDrawer.formatData(data[1], colType2);
            var value = parseFloat(data[2]);
            row['value'] = value;
            values.push(row);
        }
        return values;
    }

    ChatDrawer.createBubbleChart = function(component, labelsX, labelsY, data, col1, col2, col3, fromChatDrawer=true){
        var margin = {top: 5, right: 10, bottom: 50, left: 130},
        width = component.parentElement.clientWidth - margin.left;
        var height;
        if(fromChatDrawer){
            if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
                height = 600;
            }else{
                height = 250;
            }
        }else{
            height = component.parentElement.clientHeight;
        }
        component.innerHTML = '';
        component.parentElement.classList.remove('chata-table-container');
        component.parentElement.classList.add('chata-chart-container');

        var svg = d3.select(component)
        .append("svg")
        .attr("width", width + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


        const barWidth = width / labelsX.length;
        const barHeight = height / labelsY.length;

        const intervalWidth = Math.ceil((labelsX.length * 16) / width);
        const intervalHeight = Math.ceil((labelsY.length * 16) / height);

        var xTickValues = [];
        var yTickValues = [];
        if (barWidth < 16) {
            labelsX.forEach((element, index) => {
                if (index % intervalWidth === 0) {
                    if(element.length < 18){
                        xTickValues.push(element);
                    }else{
                        xTickValues.push(element.slice(0, 18));
                    }
                }
            });
        }

        if(barHeight < 16){
            labelsY.forEach((element, index) => {
                if (index % intervalHeight === 0) {
                    if(element.length < 18){
                        yTickValues.push(element);
                    }else{
                        yTickValues.push(element.slice(0, 18));
                    }
                }
            });
        }

        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return `
            <span class='title-tip'>${col2}:</span> <span>${d.labelX}</span> <br/>
            <span class='title-tip'>${col1}:</span> <span>${d.labelY}</span> <br/>
            <span class='title-tip'>${col3}:</span> <span>${d.value}</span>`;
        })

        svg.call(tip);

        svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -margin.left + margin.right)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('class', 'y-axis-label')
        .text(col1);

        svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .attr('class', 'x-axis-label')
        .text(col2);


        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(labelsX.map(function(d) {
            if(d.length < 18){
                return d;
            }else{
                return d.slice(0, 18);
            }
        }))
        .padding(0.01);

        var xAxis = d3.axisBottom(x);

        if(xTickValues.length > 0){
            xAxis.tickValues(xTickValues);
        }

        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


        var y = d3.scaleBand()
        .range([ height - margin.bottom, 0])
        .domain(labelsY.map(function(d) {
            if(d.length < 18){
                return d;
            }else{
                return d.slice(0, 18);
            }
        }))
        .padding(0.01);

        var yAxis = d3.axisLeft(y);

        if(yTickValues.length > 0){
            yAxis.tickValues(yTickValues);
        }

        svg.append("g")
        .call(yAxis);

        var radiusScale = d3.scaleLinear()
        .range([0, 2 * Math.min(x.bandwidth(), y.bandwidth())])
        .domain([0, d3.max(data, function(d) { return d.value; })]);

        svg.selectAll()
        .data(data, function(d) {
            var xLabel = '';
            var yLabel = '';

            if(d.labelX.length < 18){
                xLabel = d.labelX;
            }else{
                xLabel = d.labelX.slice(0, 18);
            }

            if(d.labelY.length < 18){
                yLabel = d.labelY;
            }else{
                yLabel = d.labelY.slice(0, 18);
            }
            return xLabel+':'+yLabel;
        })
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            if(d.labelX.length < 18){
                return x(d.labelX) + x.bandwidth() / 2;
            }else{
                return x(d.labelX.slice(0, 18)) + x.bandwidth() / 2;
            }
        })
        .attr("cy", function (d) {
            if(d.labelY.length < 18){
                return y(d.labelY) + y.bandwidth() / 2;
            }else{
                return y(d.labelY.slice(0, 18)) + y.bandwidth() / 2;
            }
        })
        .attr("r", function (d) { return d.value < 0 ? 0 : radiusScale(d.value); })
        .attr("fill", "#28a8e0")
        .attr("opacity", "0.7")
        .attr('class', 'circle')
        .on('mouseover', function(d) {
            tip.attr('class', 'd3-tip animate').show(d)
        })
        .on('mouseout', function(d) {
            tip.attr('class', 'd3-tip').show(d)
            tip.hide()
        });
    }

    ChatDrawer.createHeatmap = function(component, labelsX, labelsY, data, col1, col2, col3, fromChatDrawer=true){
        var margin = {top: 5, right: 10, bottom: 50, left: 130},
        width = component.parentElement.clientWidth - margin.left;
        var height;
        if(fromChatDrawer){
            if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
                height = 600;
            }else{
                height = 250;
            }
        }else{
            height = component.parentElement.clientHeight;
        }
        component.innerHTML = '';
        component.parentElement.classList.remove('chata-table-container');
        component.parentElement.classList.add('chata-chart-container');

        var svg = d3.select(component)
        .append("svg")
        .attr("width", width + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


        const barWidth = width / labelsX.length;
        const barHeight = height / labelsY.length;

        const intervalWidth = Math.ceil((labelsX.length * 16) / width);
        const intervalHeight = Math.ceil((labelsY.length * 16) / height);

        var xTickValues = [];
        var yTickValues = [];
        if (barWidth < 16) {
            labelsX.forEach((element, index) => {
                if (index % intervalWidth === 0) {
                    if(element.length < 18){
                        xTickValues.push(element);
                    }else{
                        xTickValues.push(element.slice(0, 18));
                    }
                }
            });
        }

        if(barHeight < 16){
            labelsY.forEach((element, index) => {
                if (index % intervalHeight === 0) {
                    if(element.length < 18){
                        yTickValues.push(element);
                    }else{
                        yTickValues.push(element.slice(0, 18));
                    }
                }
            });
        }

        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return `
            <span class='title-tip'>${col2}:</span> <span>${d.labelX}</span> <br/>
            <span class='title-tip'>${col1}:</span> <span>${d.labelY}</span> <br/>
            <span class='title-tip'>${col3}:</span> <span>${d.value}</span>`;
        })

        svg.call(tip);

        svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -margin.left + margin.right)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('class', 'y-axis-label')
        .text(col1);

        svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .attr('class', 'x-axis-label')
        .text(col2);


        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(labelsX.map(function(d) {
            if(d.length < 18){
                return d;
            }else{
                return d.slice(0, 18);
            }
        }))
        .padding(0.01);

        var xAxis = d3.axisBottom(x);

        if(xTickValues.length > 0){
            xAxis.tickValues(xTickValues);
        }

        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


        var y = d3.scaleBand()
        .range([ height - margin.bottom, 0])
        .domain(labelsY.map(function(d) {
            if(d.length < 18){
                return d;
            }else{
                return d.slice(0, 18);
            }
        }))
        .padding(0.01);

        var yAxis = d3.axisLeft(y);

        if(yTickValues.length > 0){
            yAxis.tickValues(yTickValues);
        }

        svg.append("g")
        .call(yAxis);

        var colorScale = d3.scaleLinear()
        .range(['rgba(40,168,224,0)', 'rgba(40,168,224,1)'])
        .domain([0, d3.max(data, function(d) { return d.value; })]);

        svg.selectAll()
        .data(data, function(d) {
            var xLabel = '';
            var yLabel = '';

            if(d.labelX.length < 18){
                xLabel = d.labelX;
            }else{
                xLabel = d.labelX.slice(0, 18);
            }

            if(d.labelY.length < 18){
                yLabel = d.labelY;
            }else{
                yLabel = d.labelY.slice(0, 18);
            }
            return xLabel+':'+yLabel;
        })
        .enter()
        .append("rect")
        .attr("x", function(d) {
            if(d.labelX.length < 18){
                return x(d.labelX);
            }else{
                return x(d.labelX.slice(0, 18));
            }
        })
        .attr("y", function(d) {
            if(d.labelY.length < 18){
                return y(d.labelY);
            }else{
                return y(d.labelY.slice(0, 18));
            }
        })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .attr("fill", function(d) { return colorScale(d.value)} )
        .attr('class', 'square')
        .on('mouseover', function(d) {
            tip.attr('class', 'd3-tip animate').show(d)
        })
        .on('mouseout', function(d) {
            tip.attr('class', 'd3-tip').show(d)
            tip.hide()
        })

    }

    ChatDrawer.createLineChart = function(component, data, col1, col2, hasNegativeValues, fromChatDrawer=true){
        var margin = {top: 5, right: 10, bottom: 50, left: 90},
        width = component.parentElement.clientWidth - margin.left;
        var height;
        if(fromChatDrawer){
            if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
                height = 600;
            }else{
                height = 250;
            }
        }else{
            height = component.parentElement.clientHeight;
        }

        component.innerHTML = '';
        component.parentElement.classList.remove('chata-table-container');
        component.parentElement.classList.add('chata-chart-container');
        const barWidth = width / data.length;
        const interval = Math.ceil((data.length * 16) / width);
        var xTickValues = [];
        if (barWidth < 16) {
            data.forEach((element, index) => {
                if (index % interval === 0) {
                    if(element.label.length < 18){
                        xTickValues.push(element.label);
                    }else{
                        xTickValues.push(element.label.slice(0, 18));
                    }
                }
            });
        }
        var svg = d3.select(component)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return `
            <span class='title-tip'>${col1}:</span> <span>${d.label}</span> <br/>
            <span class='title-tip'>${col2}:</span> <span>${d.value}</span>`;
        })

        svg.call(tip);

        svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -margin.left + margin.right)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('class', 'y-axis-label')
        .text(col2);

        svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .attr('class', 'x-axis-label')
        .text(col1);

        var x = d3.scaleBand()
        .domain(data.map(function(d) {
            if(d.label.length < 18){
                return d.label;
            }else{
                return d.label.slice(0, 18);
            }
        }))
        .range([ 0, width]);

        var xAxis = d3.axisBottom(x);

        if(xTickValues.length > 0){
            xAxis.tickValues(xTickValues);
        }

        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")

        minValue = 0;

        if(hasNegativeValues){
            minValue = d3.min(data, function(d) {return d.value});
        }

        // Add Y axis
        var y = d3.scaleLinear()
        .range([ height - (margin.bottom), 0 ])
        .domain([minValue, d3.max(data, function(d) { return d.value; })]);
        svg.append("g")
        .call(d3.axisLeft(y));
        // Add the line
        svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#28a8e0")
        .attr("stroke-width", 1)
        .attr('opacity', '0.7')
        .attr("d", d3.line()
        .x(function(d) {
            if(d.label.length < 18){
                return x(d.label);
            }else{
                return x(d.label.slice(0, 18));
            }
         })
        .y(function(d) { return y(d.value) })
        )
        svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
        );
        svg.append("g").call(d3.axisLeft(y)).select(".domain").remove();

        svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            if(d.label.length < 18){
                return x(d.label);
            }else{
                return x(d.label.slice(0, 18));
            }
         } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 3)
        .attr("fill", "#28a8e0")
        .attr('class', 'line-dot')
        .on('mouseover', function(d) {
            tip.attr('class', 'd3-tip animate').show(d)
        })
        .on('mouseout', function(d) {
            tip.attr('class', 'd3-tip').show(d)
            tip.hide()
        });
    }

    ChatDrawer.createColumnChart = function(component, data, col1, col2, hasNegativeValues, fromChatDrawer=true){
        var margin = {top: 5, right: 10, bottom: 50, left: 90},
        width = component.parentElement.clientWidth - margin.left;
        var height;
        if(fromChatDrawer){
            if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
                height = 600;
            }else{
                height = 250;
            }
        }else{
            height = component.parentElement.clientHeight;
        }
        component.innerHTML = '';
        component.parentElement.classList.remove('chata-table-container');
        component.parentElement.classList.add('chata-chart-container');
        const barWidth = width / data.length;
        const interval = Math.ceil((data.length * 16) / width);
        var xTickValues = [];
        if (barWidth < 16) {
            data.forEach((element, index) => {
                if (index % interval === 0) {
                    if(element.label.length < 18){
                        xTickValues.push(element.label);
                    }else{
                        xTickValues.push(element.label.slice(0, 18));
                    }
                }
            });
        }
        var svg = d3.select(component)
        .append("svg")
        .attr("width", width + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return `
            <span class='title-tip'>${col1}:</span> <span>${d.label}</span> <br/>
            <span class='title-tip'>${col2}:</span> <span>${d.value}</span>`;
        })

        svg.call(tip);

        svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -margin.left + margin.right)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('class', 'y-axis-label')
        .text(col2);

        svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .attr('class', 'x-axis-label')
        .text(col1);

        minValue = 0;

        if(hasNegativeValues){
            minValue = d3.min(data, function(d) {return d.value});
        }
        // Y axis
        var y = d3.scaleLinear()
        .range([ height - (margin.bottom), 0 ])
        .domain([minValue, d3.max(data, function(d) { return d.value; })]);

        svg.append("g")
        .call(d3.axisLeft(y)).select(".domain").remove();

        svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );


        var x = d3.scaleBand()
        .domain(data.map(function(d) {
            if(d.label.length < 18){
                return d.label;
            }else{
                return d.label.slice(0, 18);
            }
        }))
        .range([ 0, width]).padding(0.1);

        var xAxis = d3.axisBottom(x);

        if(xTickValues.length > 0){
            xAxis.tickValues(xTickValues);
        }

        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")


        //Bars
        svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            if(d.label.length < 18){
                return x(d.label);
            }else{
                return x(d.label.slice(0, 18));
            }
        } )
        .attr("y", function(d) { return y(Math.max(0, d.value)); })
        .attr("width", x.bandwidth() )
        .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })
        .attr("fill", "#28a8e0")
        .attr('fill-opacity', '0.7')
        .attr('class', 'bar')
        .on('mouseover', function(d) {
            tip.attr('class', 'd3-tip animate').show(d)
        })
        .on('mouseout', function(d) {
            tip.attr('class', 'd3-tip').show(d)
            tip.hide()
        });

    }

    ChatDrawer.createBarChart = function(component, data, col1, col2, hasNegativeValues, fromChatDrawer=true){
        var margin = {top: 5, right: 10, bottom: 40, left: 130},
        width = component.parentElement.clientWidth - margin.left;
        var height;
        if(fromChatDrawer){
            if(ChatDrawer.options.placement == 'left' || ChatDrawer.options.placement == 'right'){
                height = 600;
            }else{
                height = 250;
            }
        }else{
            height = component.parentElement.clientHeight;
        }
        component.innerHTML = '';
        component.parentElement.classList.remove('chata-table-container');
        component.parentElement.classList.add('chata-chart-container');
        const barHeight = height / data.length;
        const interval = Math.ceil((data.length * 16) / height);
        var yTickValues = [];
        if (barHeight < 16) {
            data.forEach((element, index) => {
                if (index % interval === 0) {
                    if(element.label.length < 18){
                        yTickValues.push(element.label);
                    }else{
                        yTickValues.push(element.label.slice(0, 18) + '...');
                    }
                }
            });
        }
        // component.parentElement.parentElement.parentElement.classList.add('chart-full-width');

        var svg = d3.select(component)
        .append("svg")
        .attr("width", width + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return `
            <span class='title-tip'>${col1}:</span> <span>${d.label}</span> <br/>
            <span class='title-tip'>${col2}:</span> <span>${d.value}</span>`;
        })

        svg.call(tip);

        svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -margin.left + margin.right)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('class', 'y-axis-label')
        .text(col1);

        svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .attr("class", "x-axis-label")
        .text(col2);

        // Add X axis
        var x = d3.scaleLinear()
        .domain(ChatDrawer.makeBarChartDomain(data, hasNegativeValues))
        .range([ 0, width]);
        var xAxis = d3.axisBottom(x);
        xAxis.tickSize(0);
        svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("color", '#fff')
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

        // Y axis
        var y = d3.scaleBand()
        .range([ 0, height - margin.bottom ])
        .domain(data.map(function(d) {
            if(d.label.length < 18){
                return d.label;
            }else{
                return d.label.slice(0, 18) + '...';
            }
        }))
        .padding(.1);

        var yAxis = d3.axisLeft(y);

        if(yTickValues.length > 0){
            yAxis.tickValues(yTickValues);
        }

        svg.append("g")
        .call(yAxis);

        svg.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(x)
            .tickSize(height - margin.bottom)
            .tickFormat("")
        );

        //Bars
        svg.selectAll("rect_bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(Math.min(0, d.value)); })
        .attr("y", function(d) {
            if(d.label.length < 18){
                return y(d.label);
            }else{
                return y(d.label.slice(0, 18) + '...');
            }
        })
        .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
        .attr("height", y.bandwidth())
        .attr("fill", "#28a8e0")
        .attr('fill-opacity', '0.7')
        .attr('class', 'bar')
        .on('mouseover', function(d) {
            tip.attr('class', 'd3-tip animate').show(d)
        })
        .on('mouseout', function(d) {
            tip.attr('class', 'd3-tip').show(d)
            tip.hide()
        });

    }

    ChatDrawer.formatDataToBarChart = function(json){
        var lines = json['data'].split('\n');
        var values = [];
        var groupField = ChatDrawer.getGroupableField(json);
        var colType1 = json['columns'][0]['type'];
        var hasNegativeValues = false;
        // var colType2 = json['columns'][1]['type'];
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
            var row = {};
            row['label'] = ChatDrawer.formatData(data[0], colType1);
            var value = parseFloat(data[1]);
            if(value < 0 && !hasNegativeValues){
                hasNegativeValues = true;
            }
            row['value'] = value;


            values.push(row);
        }
        // var grouped = ChatDrawer.groupBy(values, row => row[groupField['indexCol']]);
        return [values, hasNegativeValues];
    }


    ChatDrawer.groupBy = function(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, item[1]);
            } else {
                var oldValue = map.get(key);
                map.set(item[1] + oldValue);
            }
        });
        return map;
    }

    ChatDrawer.refreshToolbarButtons = function(oldComponent, activeDisplayType){
        var messageBubble = oldComponent.parentElement.parentElement.parentElement;
        var toolbarLeft = messageBubble.getElementsByClassName('left')[0];
        var toolbarRight = messageBubble.getElementsByClassName('right')[0];
        var actionType = ['table', 'pivot_column', 'date_pivot'].includes(activeDisplayType) ? 'csvCopy' : '';
        toolbarLeft.innerHTML = ChatDrawer.getSupportedDisplayTypes(oldComponent.dataset.componentid, activeDisplayType);
        toolbarRight.innerHTML = ChatDrawer.getActionButtons(oldComponent.dataset.componentid, actionType);
    }

    ChatDrawer.createPivotTable = function(pivotArray, oldComponent, action='replace', uuid='', tableClass='table-response'){
        var header = document.createElement('tr');
        var table = document.createElement('table');
        table.classList.add(tableClass);
        if(oldComponent.dataset.componentid){
            table.setAttribute('data-componentid', oldComponent.dataset.componentid);
            if(oldComponent.parentElement.classList.contains('chata-chart-container')){
                oldComponent.parentElement.classList.remove('chata-chart-container');
                oldComponent.parentElement.classList.add('chata-table-container');
                // oldComponent.parentElement.parentElement.parentElement.classList.remove('chart-full-width');
            }
        }else{
            table.setAttribute('data-componentid', uuid);
        }
        for (var i = 0; i < pivotArray[0].length; i++) {
            var colName = pivotArray[0][i];
            var th = document.createElement('th');
            var arrow = document.createElement('div');
            var col = document.createElement('div');
            col.textContent = colName;
            arrow.classList.add('tabulator-arrow');
            arrow.classList.add('up');
            col.classList.add('column-pivot');
            col.setAttribute('data-type', 'PIVOT');
            col.setAttribute('data-index', i);
            if(i == 0){
                th.classList.add('sticky-col');
            }
            th.appendChild(col);
            th.appendChild(arrow);
            header.appendChild(th);
        }

        table.appendChild(header);

        for (var i = 1; i < pivotArray.length; i++) {
            var tr = document.createElement('tr');
            for (var x = 0; x < pivotArray[i].length; x++) {
                var td = document.createElement('td');
                td.textContent = pivotArray[i][x];
                if(x == 0){
                    td.classList.add('sticky-col');
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        if(action == 'replace'){
            oldComponent.parentElement.replaceChild(table, oldComponent);
        }else{
            oldComponent.appendChild(table);
        }
    }

    ChatDrawer.getPivotArray = function(dataArray, rowIndex, colIndex, dataIndex, firstColName) {
        var result = {}, ret = [];
        var newCols = [];
        for (var i = 0; i < dataArray.length; i++) {

            if (!result[dataArray[i][rowIndex]]) {
                result[dataArray[i][rowIndex]] = {};
            }
            result[dataArray[i][rowIndex]][dataArray[i][colIndex]] = dataArray[i][dataIndex];

            if (newCols.indexOf(dataArray[i][colIndex]) == -1) {
                newCols.push(dataArray[i][colIndex]);
            }
        }

        newCols.sort();
        var item = [];

        item.push(firstColName);
        item.push.apply(item, newCols);
        ret.push(item);

        for (var key in result) {
            item = [];
            item.push(key);
            for (var i = 0; i < newCols.length; i++) {
                item.push(result[key][newCols[i]] || "");
            }
            ret.push(item);
        }
        return ret;
    }

    ChatDrawer.sort = function(component, operator, colIndex, colType){
        var json = ChatDrawer.responses[component.dataset.componentid];
        var lines = json['data'].split('\n');
        var values = []
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
            var row = [];
            for (var x = 0; x < data.length; x++) {
                row.push(data[x]);
            }
            values.push(row);
        }
        if(operator == 'asc'){
            var comparator = function(a, b) {
                if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                    return parseFloat(a[colIndex]) > parseFloat(b[colIndex]) ? 1 : -1;
                }else{
                    return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
                }
            }
        }else{
            var comparator = function(a, b) {
                if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                    return parseFloat(a[colIndex]) < parseFloat(b[colIndex]) ? 1 : -1;
                }else{
                    return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
                }
            }
        }
        var sortedArray = values.sort(comparator);

        return sortedArray;
    }

    ChatDrawer.formatData = function(val, type){
        value = '';
        switch (type) {
            case 'DOLLAR_AMT':
                if(parseFloat(val) != 0){
                    value = '$' + val;
                }else{
                    value = val;
                }
            break;
            case 'DATE':
                value = formatDate(new Date( parseInt(val) * 1000 ) );
            break;
            default:
                value = val;
        }
        return value;
    }

    ChatDrawer.refreshPivotTable = function(table, pivotArray){
        var rows = table.childNodes;
        var cols = ChatDrawer.responses[table.dataset.componentid]['columns'];
        for (var i = 1; i < rows.length; i++) {
            var tdList = rows[i].childNodes;
            for (var x = 0; x < tdList.length; x++) {
                tdList[x].textContent = pivotArray[i-1][x];
            }
        }
    }

    ChatDrawer.refreshTableData = function(table, newData){
        var rows = table.childNodes;
        var cols = ChatDrawer.responses[table.dataset.componentid]['columns'];
        for (var i = 1; i < rows.length; i++) {
            var tdList = rows[i].childNodes;
            for (var x = 0; x < tdList.length; x++) {
                tdList[x].textContent = ChatDrawer.formatData(newData[i-1][x], cols[x]['type']);
            }
        }
    }

    ChatDrawer.createCsvData = function(json, separator=','){
        var output = '';
        var lines = json['data'].split('\n');
        for(var i = 0; i<json['columns'].length; i++){
            var colName = ChatDrawer.formatColumnName(json['columns'][i]['name']);
            output += colName + separator;
        }
        output += '\n';
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
            for (var x = 0; x < data.length; x++) {
                output += data[x] + separator;
            }
            output += '\n';
        }
        return output
    }

    ChatDrawer.closeDrawer = function(){
        ChatDrawer.wrapper.style.opacity = 0;
        ChatDrawer.wrapper.style.height = 0;

        if(ChatDrawer.options.placement == 'right'){
            ChatDrawer.rootElem.style.transform = 'translateX('+ ChatDrawer.options.width +'px)';
            ChatDrawer.rootElem.right = '0';
            ChatDrawer.rootElem.top = 0;
            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }else if(ChatDrawer.options.placement == 'left'){
            ChatDrawer.rootElem.style.transform = 'translateX(-'+ ChatDrawer.options.width +'px)';
            ChatDrawer.rootElem.left = '0';
            ChatDrawer.rootElem.top = 0;
            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }else if(ChatDrawer.options.placement == 'bottom'){
            ChatDrawer.rootElem.style.transform = 'translateY('+ ChatDrawer.options.height +'px)';
            ChatDrawer.rootElem.style.bottom = '0';

            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }else if(ChatDrawer.options.placement == 'top'){
            ChatDrawer.rootElem.style.transform = 'translateY(-'+ ChatDrawer.options.height +'px)';
            ChatDrawer.rootElem.style.top = '0';

            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }
        if(ChatDrawer.options.clearOnClose){
            ChatDrawer.clearMessages();
        }
        ChatDrawer.options.onVisibleChange();
    }

    ChatDrawer.openDrawer = function(){
        if(ChatDrawer.options.showMask){
            ChatDrawer.wrapper.style.opacity = .3;
            ChatDrawer.wrapper.style.height = '100%';
        }
        if(ChatDrawer.options.placement == 'right'){
            ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
            ChatDrawer.rootElem.style.transform = 'translateX(0px)';
            ChatDrawer.drawerButton.style.display = 'none';
            ChatDrawer.rootElem.style.right = '0px';
        }else if(ChatDrawer.options.placement == 'left'){
            ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
            ChatDrawer.rootElem.style.left = '0px';
            ChatDrawer.rootElem.style.transform = 'translateX(0px)';
            ChatDrawer.drawerButton.style.display = 'none';
        }else if(ChatDrawer.options.placement == 'bottom'){
            ChatDrawer.rootElem.style.width = '100%';
            ChatDrawer.rootElem.style.height = ChatDrawer.options.height + 'px';
            ChatDrawer.rootElem.style.bottom = '0';
            ChatDrawer.rootElem.style.transform = 'translateY(0)';
            ChatDrawer.drawerButton.style.display = 'none';
        }else if(ChatDrawer.options.placement == 'top'){
            ChatDrawer.rootElem.style.width = '100%';
            ChatDrawer.rootElem.style.height = ChatDrawer.options.height + 'px';
            ChatDrawer.rootElem.style.top = '0';
            ChatDrawer.rootElem.style.transform = 'translateY(0)';
            ChatDrawer.drawerButton.style.display = 'none';
        }
        ChatDrawer.options.onVisibleChange();
    }

    ChatDrawer.createWrapper = function(rootElem){
        var wrapper = document.createElement('div');
        var body = document.getElementsByTagName('body')[0];
        body.insertBefore(wrapper, rootElem);
        wrapper.setAttribute('id', 'drawer-wrapper');
        ChatDrawer.wrapper = wrapper;
        if(!ChatDrawer.options.showMask){
            ChatDrawer.wrapper.style.opacity = 0;
            ChatDrawer.wrapper.style.height = 0;
        }
    }

    ChatDrawer.createDrawerButton = function(rootElem){
        var drawerButton = document.createElement("div");
        var drawerIcon = document.createElement("img");
        drawerIcon.setAttribute("src", "chata-bubles.svg");
        drawerIcon.setAttribute("alt", "chata.ai");
        drawerIcon.setAttribute("height", "22px");
        drawerIcon.setAttribute("width", "22px");
        drawerIcon.classList.add('chata-bubbles-icon');
        drawerIcon.classList.add('open-action');
        drawerButton.classList.add('drawer-handle');
        drawerButton.classList.add('open-action');
        drawerButton.classList.add(ChatDrawer.options.placement + '-btn');
        drawerButton.appendChild(drawerIcon);
        var body = document.getElementsByTagName('body')[0];
        body.insertBefore(drawerButton, rootElem);
        ChatDrawer.drawerButton = drawerButton;
        if(!ChatDrawer.options.showHandle){
            ChatDrawer.drawerButton.style.display = 'none';
        }
        for (var [key, value] of Object.entries(ChatDrawer.options.handleStyles)){
            ChatDrawer.drawerButton.style.setProperty(key, value, '');
        }
    }

    ChatDrawer.ajaxCall = function(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4){
                var jsonResponse = JSON.parse(xhr.responseText);
                callback(jsonResponse);
            }
        };
        xhr.open('GET', url);
        xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        xhr.setRequestHeader("Authorization", ChatDrawer.options.token ? `Bearer ${ChatDrawer.options.token}` : undefined);
        xhr.send();
    }

    ChatDrawer.ajaxCallAutoComplete = function(url, callback){

        ChatDrawer.xhr.onreadystatechange = function() {
            if (ChatDrawer.xhr.readyState === 4){
                var jsonResponse = JSON.parse(ChatDrawer.xhr.responseText);
                callback(jsonResponse);
            }
        };
        ChatDrawer.xhr.open('GET', url);
        ChatDrawer.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        ChatDrawer.xhr.setRequestHeader("Authorization", ChatDrawer.options.token ? `Bearer ${ChatDrawer.options.token}` : undefined);
        ChatDrawer.xhr.send();
    }

    ChatDrawer.autocomplete = function(suggestion, suggestionList, liClass='suggestion', styles){
        const URL = `https://backend-staging.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(
            suggestion)}&projectid=${ChatDrawer.options.projectId}`;

        ChatDrawer.ajaxCallAutoComplete(URL, function(jsonResponse){
            suggestionList.innerHTML = '';
            if(jsonResponse['matches'].length > 0){
                for(var [key, value] of Object.entries(styles)){
                    suggestionList.style.setProperty(key, value, '');
                }
                for (var i = jsonResponse['matches'].length-1; i >= 0; i--) {
                    var li = document.createElement('li');
                    li.classList.add(liClass);
                    li.textContent = jsonResponse['matches'][i];
                    suggestionList.appendChild(li);
                }
                suggestionList.style.display = 'block';
            }else{
                suggestionList.style.display = 'none';
            }
        });
    }

    ChatDrawer.sendMessage = function(chataInput, textValue){
        chataInput.disabled = true;
        var responseLoadingContainer = ChatDrawer.putMessage(textValue);
        const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
          textValue
        )}&projectId=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;
        const URL = `https://backend-staging.chata.ai/api/v1/query?q=${textValue}&project=1&unified_query_id=${uuidv4()}`;

        ChatDrawer.ajaxCall(URL_SAFETYNET, function(jsonResponse){
            if(jsonResponse['full_suggestion'].length > 0){
                chataInput.removeAttribute("disabled");
                ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
            }else{
                ChatDrawer.ajaxCall(URL, function(jsonResponse){
                    console.log(jsonResponse['display_type']);
                    chataInput.removeAttribute("disabled");
                    ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
                    switch(jsonResponse['display_type']){
                        case 'suggestion':
                            ChatDrawer.putSuggestionResponse(jsonResponse, textValue);
                        break;
                        case 'table':
                            if(jsonResponse['columns'].length == 1){
                                ChatDrawer.putSimpleResponse(jsonResponse);
                            }else{
                                ChatDrawer.putTableResponse(jsonResponse);
                            }
                        break;
                        case 'date_pivot':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'pivot_column':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'line':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'word_cloud':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'stacked_column':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'bubble':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'heatmap':
                        ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        default:
                            // temporary
                            jsonResponse['data'] = 'Error: There was no data supplied for this table';
                            ChatDrawer.putSimpleResponse(jsonResponse);
                    }
                    ChatDrawer.checkMaxMessages();
                });

            }
        });
        chataInput.value = '';
    }

    ChatDrawer.putSimpleResponse = function(jsonResponse){
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        containerMessage.classList.add('chat-single-message-container');
        containerMessage.classList.add('response');
        var idRequest = uuidv4();
        ChatDrawer.responses[idRequest] = jsonResponse;
        containerMessage.setAttribute('data-containerid', idRequest);
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.innerHTML = `
        <div class="chat-message-toolbar right">
            <button class="chata-toolbar-btn clipboard" data-id="${idRequest}">
                <svg stroke="currentColor" class="clipboard" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path class="clipboard" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
                    </path>
                </svg>
            </button>
            <button class="chata-toolbar-btn csv" data-id="${idRequest}">
                <svg stroke="currentColor" class="csv" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="csv"></path>
                </svg>
            </button>
        </div>`;

        messageBubble.appendChild(document.createTextNode(jsonResponse['data']));
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    }

    ChatDrawer.getSVGString = function( svgNode ) {
        svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');

        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');
        svgString = svgString.replace(/NS\d+:href/g, 'xlink:href');

        return svgString;
    }


    ChatDrawer.svgString2Image = function(svgString, width, height) {
        var imgsrc = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(svgString)));

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;


        var image = new Image();
        image.onload = function() {
            context.clearRect ( 0, 0, width, height );
            context.drawImage(image, 0, 0, width, height);
            var imgPixels = context.getImageData(0, 0, canvas.width, canvas.height);
            for(var y = 0; y < imgPixels.height; y++){
                for(var x = 0; x < imgPixels.width; x++){
                    var i = (y * 4) * imgPixels.width + x * 4;
                    imgPixels.data[i] = 0;
                    imgPixels.data[i + 1] = 0;
                    imgPixels.data[i + 2] = 0;
                }
            }
            context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

            var link = document.createElement("a");
            link.setAttribute('href', canvas.toDataURL("image/png;base64"));
            link.setAttribute('download', 'Chart.png');
            link.click();
        };


        image.src = imgsrc;
    }

    ChatDrawer.getActionButtons = function(idRequest, type){
        if (type == 'csvCopy'){
            return `
            <button class="chata-toolbar-btn clipboard" data-id="${idRequest}">
                <svg stroke="currentColor" class="clipboard" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path class="clipboard" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
                    </path>
                </svg>
            </button>
            <button class="chata-toolbar-btn csv" data-id="${idRequest}">
                <svg stroke="currentColor" class="csv" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="csv"></path>
                </svg>
            </button>
            `;
        }else{
            return `
            <button class="chata-toolbar-btn export_png" data-id="${idRequest}">
                <svg stroke="currentColor" class="export_png" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="export_png"></path>
                </svg>
            </button>
            `;
        }
    }

    ChatDrawer.getSupportedDisplayTypes = function(idRequest, ignore){
        var json = ChatDrawer.responses[idRequest];
        var buttons = '';
        for (var i = 0; i < json['supported_display_types'].length; i++) {
            if(json['supported_display_types'][i] == ignore)continue;
            if(json['supported_display_types'][i] == 'table'){
                buttons += ChatDrawer.getTableButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'column'){
                buttons += ChatDrawer.getColumnChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'bar'){
                buttons += ChatDrawer.getBarChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'pie'){

            }
            if(json['supported_display_types'][i] == 'line' && json['display_type'] != 'pivot_column'){
                buttons += ChatDrawer.getLineChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'date_pivot' || json['supported_display_types'][i] == 'pivot_column'){
                buttons += ChatDrawer.getPivotTableButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'heatmap'){
                buttons += ChatDrawer.getHeatmapChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'bubble'){
                buttons += ChatDrawer.getBubbleChartButton(idRequest);
            }
        }
        return buttons;
    }

    ChatDrawer.getTableButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn table" data-tip="Table" data-id="${idRequest}">
            <svg class="table" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 table" d="M8,0.8c2.3,0,4.6,0,6.9,0c0.8,0,1.1,0.3,1.1,1.1c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.8,5.7,0.8,8,0.8L8,0.8z M5,11.1H1v2.7h4V11.1L5,11.1z M10,13.8v-2.7H6v2.7
                    L10,13.8L10,13.8z M11,13.8h4v-2.7h-4V13.8L11,13.8z M1.1,7.5v2.7h4V7.5H1.1L1.1,7.5z M11,10.2c1.3,0,2.5,0,3.8,0
                    c0.1,0,0.2-0.1,0.2-0.2c0-0.8,0-1.7,0-2.5h-4C11,8.4,11,9.3,11,10.2L11,10.2z M6,10.1h4V7.5H6V10.1L6,10.1z M5,6.6V3.9H1
                    c0,0.8,0,1.6,0,2.4c0,0.1,0.2,0.2,0.3,0.2C2.5,6.6,3.7,6.6,5,6.6L5,6.6z M6,6.5h4V3.9H6V6.5L6,6.5z M14.9,6.5V3.9h-4v2.7L14.9,6.5
                    L14.9,6.5z">
                </path>
            </svg>
        </button>`;
    }

    ChatDrawer.getPivotTableButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn pivot_table" data-tip="Pivot Table" data-id="${idRequest}">
            <svg class="pivot_table" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="pivot_table chart-icon-svg-0" d="M8,0.7c2.3,0,4.6,0,6.9,0C15.7,0.7,16,1,16,1.8c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0 c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.7,5.7,0.7,8,0.7L8,0.7z M5.1,6.4h4.4V3.8H5.1V6.4L5.1,6.4z M14.9,6.4V3.8 h-4.4v2.7L14.9,6.4L14.9,6.4z M5.1,10.1h4.4V7.4H5.1V10.1L5.1,10.1z M14.9,10.1V7.4h-4.4v2.7H14.9L14.9,10.1z M5.1,13.7h4.4V11H5.1 V13.7L5.1,13.7z M14.9,13.7V11h-4.4v2.7L14.9,13.7L14.9,13.7z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getColumnChartButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn column_chart" data-tip="Column Chart" data-id="${idRequest}">
            <svg class="column_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 column_chart" d="M12.6,0h-2.4C9.4,0,8.8,0.6,8.8,1.4v2.7c0,0,0,0,0,0H6.3c-0.8,0-1.4,0.6-1.4,1.4v3.2c0,0-0.1,0-0.1,0H2.4 C1.6,8.7,1,9.4,1,10.1v4.5C1,15.4,1.6,16,2.4,16h2.4c0,0,0.1,0,0.1,0h1.3c0,0,0.1,0,0.1,0h2.4c0,0,0.1,0,0.1,0H10c0,0,0.1,0,0.1,0 h2.4c0.8,0,1.4-0.6,1.4-1.4V1.4C14,0.6,13.3,0,12.6,0z M6.3,5.5h2.4v9.1H6.3V5.5z M2.4,10.1h2.4v4.5H2.4V10.1z M12.6,14.6h-2.4V1.4 h2.4V14.6z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getBarChartButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn bar_chart" data-tip="Bar Chart" data-id="${idRequest}">
            <svg class="bar_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 bar_chart" d="M14.6,1.6H1.4C0.6,1.6,0,2.2,0,3v2.4v0.1v1.2v0.1v2.4v0.1v1.3v0.1v2.4c0,0.8,0.6,1.4,1.4,1.4h4.5 c0.7,0,1.4-0.6,1.4-1.4v-2.4v-0.1h3.2c0.8,0,1.4-0.6,1.4-1.4V6.7l0,0h2.7c0.8,0,1.4-0.6,1.4-1.4V2.9C16,2.2,15.4,1.5,14.6,1.6z M1.4,9.2V6.8h9.1v2.4H1.4z M1.4,13.1v-2.4h4.5v2.4H1.4z M14.6,2.9v2.4H1.4V2.9H14.6z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getLineChartButton = function(idRequest) {
        return `
        <button class="chata-toolbar-btn line_chart" data-tip="Line Chart" data-id="${idRequest}">
            <svg class="line_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 line_chart" d="M1,12.2c-0.2,0-0.3-0.1-0.5-0.2c-0.3-0.3-0.3-0.7,0-1l3.8-3.9C4.5,7,4.7,7,4.9,7s0.4,0.1,0.5,0.3l2.3,3l6.8-7.1 c0.3-0.3,0.7-0.3,1,0c0.3,0.3,0.3,0.7,0,1l-7.3,7.7C8,11.9,7.8,12,7.6,12s-0.4-0.1-0.5-0.3l-2.3-3L1.5,12C1.4,12.2,1.2,12.2,1,12.2z ">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getHeatmapChartButton = function(idRequest){
        return `
            <button class="chata-toolbar-btn heatmap" data-tip="Heatmap" data-id="${idRequest}">
                <svg class="heatmap" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                    <path class="hm0 heatmap" d="M12,16h2.5c0.8,0,1.5-0.7,1.5-1.5v-2.4l-4,0V16z">
                    </path>
                    <polygon class="hm1 heatmap" points="8,4.1 8,0 4,0 4,4.1 "></polygon>
                    <path class="hm2 heatmap" d="M4,4.1V0L1.5,0C0.7,0,0,0.7,0,1.5l0,2.6h0l0,0L4,4.1z"></path>
                    <polygon class="hm3 heatmap" points="8,4.1 8,4.1 8,4.1 4,4.1 4,8.1 8,8.2 "></polygon>
                    <polygon class="hm2 heatmap" points="0,4.1 0,8.1 4,8.1 4,4.1 "></polygon>
                    <polygon class="hm1 heatmap" points="4,4.1 8,4.1 8,4.1 "></polygon>
                    <polygon class="hm1 heatmap" points="4,16 8,16 8,12.1 4,12.1 "></polygon>
                    <path class="hm0 heatmap" d="M0,12.1v2.5C0,15.3,0.7,16,1.5,16H4v-3.9L0,12.1z"></path>
                    <polygon class="hm0 heatmap" points="0,12.1 4,12.1 4,8.2 0,8.2 "></polygon>
                    <polygon class="hm4 heatmap" points="8,12.1 8,8.2 4,8.2 4,12.1 "></polygon>
                    <polygon class="hm2 heatmap" points="16,4.1 16,4.1 16,4.1 12,4.1 12,8.2 16,8.2 "></polygon>
                    <path class="hm0 heatmap" d="M16,4.1l0-2.6C16,0.7,15.3,0,14.5,0L12,0v4.1L16,4.1z"></path>
                    <polygon class="hm4 heatmap" points="12,4.1 12,0 8,0 8,4.1 8,4.1 8,4.1 "></polygon>
                    <polygon class="hm5 heatmap" points="12,4.1 8,4.1 8,4.1 "></polygon>
                    <polygon class="hm6 heatmap" points="12,4.1 16,4.1 16,4.1 "></polygon>
                    <polygon class="hm2 heatmap" points="12,12.1 16,12.1 16,8.2 12,8.2 "></polygon>
                    <polygon class="hm1 heatmap" points="12,8.2 8,8.2 8,12.1 12,12.1 "></polygon>
                    <polygon class="hm1 heatmap" points="8,12.1 8,16 12,16 12,12.1 "></polygon>
                </svg>
            </button>
        `;
    }

    ChatDrawer.getBubbleChartButton = function(idRequest){
        return `
            <button class="chata-toolbar-btn bubble_chart" data-tip="Bubble Chart" data-id="${idRequest}">
                <svg class="bubble_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                    <circle class="chart-icon-svg-0 bubble_chart" cx="7.7" cy="11.1" r="1.2"></circle>
                    <circle class="chart-icon-svg-0 bubble_chart" cx="2.6" cy="8.8" r="2.6"></circle>
                    <circle class="chart-icon-svg-0 bubble_chart" cx="11.7" cy="4.3" r="4.3"></circle>
                    <circle class="chart-icon-svg-0 bubble_chart" cx="1.8" cy="14.8" r="1.2"></circle>
                </svg>
            </button>
        `;
    }

    ChatDrawer.formatColumnName = function(col){
        return col.replace(/__/g, ' ').replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); })
    }

    ChatDrawer.putTableResponse = function(jsonResponse){
        var data = jsonResponse['data'].split('\n');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var tableContainer = document.createElement('div');
        var table = document.createElement('table');
        var header = document.createElement('tr');
        containerMessage.classList.add('chat-single-message-container');
        containerMessage.classList.add('response');
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.classList.add('full-width');
        var idRequest = uuidv4();
        ChatDrawer.responses[idRequest] = jsonResponse;
        var supportedDisplayTypes = ChatDrawer.getSupportedDisplayTypes(idRequest, 'table');
        var actions = ChatDrawer.getActionButtons(idRequest, 'csvCopy');
        var toolbar = '';
        if(supportedDisplayTypes != ''){
            toolbar += `
            <div class="chat-message-toolbar left">
                ${supportedDisplayTypes}
            </div>
            `
        }
        toolbar += `
            <div class="chat-message-toolbar right">
                ${actions}
            </div>`;

        messageBubble.innerHTML = toolbar;
        tableContainer.classList.add('chata-table-container');
        responseContentContainer.classList.add('chata-response-content-container');
        table.classList.add('table-response');
        table.setAttribute('data-componentid', idRequest);
        var dataLines = jsonResponse['data'].split('\n');

        for (var i = 0; i < jsonResponse['columns'].length; i++) {
            var colName = ChatDrawer.formatColumnName(jsonResponse['columns'][i]['name']);
            var th = document.createElement('th');
            var arrow = document.createElement('div');
            var col = document .createElement('div');
            col.textContent = colName;
            arrow.classList.add('tabulator-arrow');
            arrow.classList.add('up');
            col.classList.add('column');
            col.setAttribute('data-type', jsonResponse['columns'][i]['type']);
            col.setAttribute('data-index', i);

            th.appendChild(col);
            th.appendChild(arrow);
            header.appendChild(th);
        }
        table.appendChild(header);
        for (var i = 0; i < dataLines.length; i++) {
            var data = dataLines[i].split(',');
            var tr = document.createElement('tr');
            for (var x = 0; x < data.length; x++) {
                value = ChatDrawer.formatData(data[x], jsonResponse['columns'][x]['type']);
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        tableContainer.appendChild(table);
        responseContentContainer.appendChild(tableContainer);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    }

    ChatDrawer.createSuggestions = function(responseContentContainer, data, classButton='chata-suggestion-btn'){
        for (var i = 0; i < data.length; i++) {
            var div = document.createElement('div');
            var button = document.createElement('button');
            button.classList.add(classButton);
            button.textContent = data[i];
            div.appendChild(button);
            responseContentContainer.appendChild(div);
        }
    }

    ChatDrawer.putSuggestionResponse = function(jsonResponse, query){
        var data = jsonResponse['data'].split('\n');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        containerMessage.classList.add('chat-single-message-container');
        containerMessage.classList.add('response');
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.classList.add('full-width');
        responseContentContainer.classList.add('chata-response-content-container');
        responseContentContainer.innerHTML = `<div>I'm not sure what you mean by <strong>"${query}"</strong>. Did you mean:</div>`;
        ChatDrawer.createSuggestions(responseContentContainer, data);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    }

    ChatDrawer.checkMaxMessages = function(){
        if(ChatDrawer.options.maxMessages > 2){
            var messages = ChatDrawer.drawerContent.querySelectorAll('.chat-single-message-container');
            if(messages.length > ChatDrawer.options.maxMessages){
                messages[1].parentNode.removeChild(messages[1]);
            }
        }
    }

    ChatDrawer.putMessage = function(value){
        // <div class="chat-single-message-container request">
        //     <div class="chat-message-bubble">Janitorial expense</div>
        // </div>
        // <div class="chat-single-message-container full-width response">
        //     <div data-test="query-response-wrapper" class="chata-response-content-container chat-message-bubble">books are not closed</div>
        // </div>
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);

        containerMessage.classList.add('chat-single-message-container');
        containerMessage.classList.add('request');
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.textContent = value;
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.appendChild(responseLoadingContainer);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
        ChatDrawer.checkMaxMessages();
        return responseLoadingContainer;
    }

})(document, window, ChatDrawer)

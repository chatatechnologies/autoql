function getChatBar(options){
    var chataBarContainer = document.createElement('div');
    chataBarContainer.classList.add('chata-bar-container');
    chataBarContainer.classList.add('chat-drawer-chat-bar');
    chataBarContainer.classList.add('autosuggest-top');
    chataBarContainer.options = {
        apiKey: '',
        customerId: '',
        userId: '',
        isDisabled: false,
        onSubmit: function(){},
        onResponseCallback: function(){},
        autoCompletePlacement: 'top',
        showLoadingDots: true,
        showChataIcon: true,
        enableVoiceRecord: true,
        enableAutocomplete: true,
        autocompleteStyles: {},
        enableSafetyNet: true,
        enableDrilldowns: true,
        demo: false
    }

    for (var [key, value] of Object.entries(options)) {
        chataBarContainer.options[key] = value;
    }
    const CHATA_ICON = chataBarContainer.options.showChataIcon ? `
    <div class="chat-bar-input-icon"><img class="chata-bubbles-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjQgMjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSIjMjZBN0RGIiBkPSJNMTYsNUMxNC44LDIuMywxMiwwLjQsOC44LDAuNGMtNC40LDAtNy42LDMuNS03LjYsNy45djRjMCwyLjgtMSwzLjYtMSwzLjZjMS4zLDAuMSwyLjktMC40LDQtMS41CgkJCQljMC40LDAuNCwxLDAuOCwxLjYsMWMwLjUsMC4yLDEsMC40LDEuNiwwLjVjMC0wLjItMC4xLTAuNS0wLjEtMC43YzAtMC4yLDAtMC41LDAtMC43YzAtMS42LDAuNS0zLjIsMS4zLTQuNAoJCQkJYzAuMy0wLjQsMC42LTAuOCwxLTEuMmMwLjItMC4yLDAuNC0wLjMsMC42LTAuNWMwLjQtMC4zLDAuOC0wLjYsMS4yLTAuOGMwLjQtMC4yLDAuOS0wLjQsMS40LTAuNmMwLjctMC4yLDEuNS0wLjMsMi4zLTAuM2wwLDAKCQkJCWMwLjMsMCwwLjUsMCwwLjcsMGMwLjIsMCwwLjUsMC4xLDAuNywwLjFDMTYuNCw2LDE2LjIsNS41LDE2LDV6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTIyLjcsMTguM3YtNGMwLTMuMy0xLjgtNi00LjYtNy4yYy0wLjUtMC4yLTEtMC40LTEuNi0wLjVjMC4xLDAuNSwwLjIsMS4xLDAuMiwxLjdjMCwxLjktMC43LDMuNi0xLjgsNC45CgkJCWMtMC41LDAuNi0xLDEtMS43LDEuNWMtMC40LDAuMy0wLjksMC41LTEuMywwLjdjLTAuNSwwLjItMSwwLjMtMS41LDAuNGMtMC41LDAuMS0xLDAuMi0xLjYsMC4yYy0wLjMsMC0wLjUsMC0wLjcsMAoJCQljLTAuMywwLTAuNS0wLjEtMC43LTAuMWMwLjEsMC42LDAuMywxLjEsMC41LDEuNmMxLjIsMi44LDMuOSw0LjYsNy4yLDQuNmMxLjgsMCwzLjUtMC41LDQuNi0xLjZjMSwxLDIuOSwxLjgsNC4xLDEuNQoJCQlDMjMuOCwyMS45LDIyLjcsMjEuMywyMi43LDE4LjN6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNMTUuMSw2LjVjLTQuNCwwLTcuOCwzLjUtNy44LDcuOWMwLDAuNSwwLjEsMSwwLjEsMS41YzAuNSwwLjEsMSwwLjEsMS41LDAuMWM0LjQsMCw3LjgtMy4zLDcuOC03LjYKCQkJYzAtMC42LTAuMS0xLjEtMC4yLTEuN0MxNi4xLDYuNSwxNS42LDYuNSwxNS4xLDYuNXoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xNi4zLDguMkMxNi4zLDguMiwxNi4yLDguMiwxNi4zLDguMmMtMC4xLDAtMC4xLDAtMC4yLDBjMCwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMSwwLDAuMiwwLDAuMwoJCQljMCwwLjEsMCwwLjMsMC4xLDAuM2MwLDAuMSwwLjEsMC4xLDAuMSwwLjFjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEtMC4xLDAuMS0wLjFjMC0wLjEsMC0wLjIsMC0wLjRjMC0wLjEsMC0wLjIsMC0wLjMKCQkJQzE2LjMsOC4zLDE2LjMsOC4yLDE2LjMsOC4yeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMy40LDExQzEzLjQsMTEsMTMuNCwxMSwxMy40LDExYy0wLjEsMC0wLjEsMC0wLjIsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zCgkJCWMwLDAuMiwwLDAuMywwLjEsMC40YzAsMC4xLDAuMSwwLjEsMC4xLDAuMWMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMS0wLjEsMC4xLTAuMWMwLTAuMSwwLTAuMiwwLTAuNGMwLTAuMSwwLTAuMiwwLTAuMwoJCQlDMTMuNSwxMS4xLDEzLjUsMTEuMSwxMy40LDExeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMy4zLDkuMUMxMy40LDkuMSwxMy40LDkuMSwxMy4zLDkuMUMxMy41LDkuMSwxMy41LDksMTMuNSw5YzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDMTMuMiw5LjEsMTMuMyw5LjEsMTMuMyw5LjF6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTExLjksMTAuNkMxMS45LDEwLjYsMTIsMTAuNiwxMS45LDEwLjZjMC4xLTAuMSwwLjEtMC4xLDAuMi0wLjJjMC0wLjEsMC0wLjIsMC0wLjRjMC0wLjEsMC0wLjIsMC0wLjMKCQkJYzAtMC4xLDAtMC4xLTAuMS0wLjFjMCwwLDAsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDBjMCwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUMxMS44LDEwLjYsMTEuOSwxMC42LDExLjksMTAuNnoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNOS4xLDEyLjVDOS4xLDEyLjUsOS4xLDEyLjUsOS4xLDEyLjVjLTAuMSwwLTAuMSwwLTAuMiwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjMKCQkJYzAsMC4xLDAsMC4zLDAuMSwwLjNjMCwwLjEsMC4xLDAuMSwwLjEsMC4xYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLTAuMSwwLjEtMC4xYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCUM5LjIsMTIuNiw5LjIsMTIuNSw5LjEsMTIuNXoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNMTAuNSwxMC42QzEwLjUsMTAuNiwxMC41LDEwLjYsMTAuNSwxMC42YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDMTAuNCwxMC41LDEwLjQsMTAuNiwxMC41LDEwLjZ6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTcuNiwxNC45QzcuNiwxNC45LDcuNywxNC45LDcuNiwxNC45YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDNy41LDE0LjgsNy42LDE0LjksNy42LDE0Ljl6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTcuNiwxMy40QzcuNiwxMy40LDcuNywxMy40LDcuNiwxMy40YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMCwwLDAtMC4xLDBjMCwwLTAuMSwwLTAuMSwwYzAsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQlDNy41LDEzLjQsNy42LDEzLjQsNy42LDEzLjR6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTExLjksOS4xQzExLjksOS4xLDEyLDkuMSwxMS45LDkuMUMxMiw5LjEsMTIuMSw5LDEyLjEsOWMwLTAuMSwwLTAuMiwwLTAuNGMwLTAuMSwwLTAuMiwwLTAuMwoJCQljMC0wLjEsMC0wLjEtMC4xLTAuMWMwLDAsMCwwLTAuMSwwYzAsMC0wLjEsMC0wLjEsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4xLDAsMC4zLDAuMSwwLjMKCQkJQzExLjgsOS4xLDExLjksOS4xLDExLjksOS4xeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS45LDEzLjVDMTEuOSwxMy41LDEyLDEzLjUsMTEuOSwxMy41YzAuMS0wLjEsMC4xLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMC0wLjEsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDAuMWMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJQzExLjgsMTMuNSwxMS44LDEzLjUsMTEuOSwxMy41eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS45LDEyLjFDMTEuOSwxMi4xLDEyLDEyLDExLjksMTIuMWMwLjEtMC4xLDAuMS0wLjEsMC4yLTAuMmMwLTAuMSwwLTAuMiwwLTAuNGMwLTAuMSwwLTAuMiwwLTAuMwoJCQljMC0wLjEsMC0wLjEtMC4xLTAuMWMwLDAsMCwwLTAuMSwwcy0wLjEsMC0wLjEsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJQzExLjgsMTIsMTEuOSwxMi4xLDExLjksMTIuMXoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBkPSJNMTYsNy4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4xLDAuMSwwLjEsMC4xLDAuMWMwLDAsMC4xLDAsMC4xLDBjMCwwLDAtMC4xLDAuMS0wLjFjMC0wLjEsMC0wLjIsMC0wLjMKCQkJYzAtMC4xLDAtMC4yLDAtMC4zYzAtMC4xLDAtMC4xLTAuMS0wLjFjMCwwLDAsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDBjMCwwLTAuMSwwLjEtMC4xLDAuMkMxNi4xLDcuMSwxNiw3LjIsMTYsNy4yeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS45LDE1QzExLjksMTUsMTIsMTQuOSwxMS45LDE1YzAuMS0wLjEsMC4yLTAuMSwwLjItMC4yYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCWMwLTAuMSwwLTAuMS0wLjEtMC4xYzAsMC0wLjEsMC0wLjEsMGMwLDAtMC4xLDAtMC4xLDAuMWMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJQzExLjgsMTQuOSwxMS44LDE1LDExLjksMTV6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgZD0iTTE2LjMsOS42QzE2LjMsOS42LDE2LjIsOS42LDE2LjMsOS42Yy0wLjEsMC0wLjEsMC0wLjIsMGMwLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4yLDAsMC4zCgkJCWMwLDAuMSwwLDAuMywwLjEsMC40YzAsMC4xLDAuMSwwLjEsMC4xLDAuMWMwLDAsMC4xLDAsMC4xLDBzMC4xLTAuMSwwLjEtMC4xYzAtMC4xLDAtMC4yLDAtMC40YzAtMC4xLDAtMC4yLDAtMC4zCgkJCUMxNi4zLDkuNywxNi4zLDkuNiwxNi4zLDkuNnoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTEuNyw3LjZjMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMCwwLDAuMSwwLDAuMS0wLjFjMCwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLTAuMiwwLTAuMwoJCQljMC0wLjEsMC0wLjEsMC0wLjJjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAuMSwwLDAuMWMwLDAuMSwwLDAuMywwLDAuM2MwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMAoJCQlDMTEuOCw3LjcsMTEuOCw3LjYsMTEuNyw3LjZjMC4xLTAuMSwwLjEtMC4yLDAuMS0wLjNjMCwwLDAsMCwwLDBjMCwwLTAuMSwwLTAuMSwwLjFDMTEuNiw3LjQsMTEuNiw3LjUsMTEuNyw3LjZ6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTEzLjQsNi43bC0wLjIsMC4xbDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4xdjAuNWMwLDAuMSwwLDAuMSwwLDAuMQoJCQljMCwwLDAsMCwwLDBjMCwwLDAsMC0wLjEsMHYwaDAuNHYwYzAsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAtMC4xTDEzLjQsNi43TDEzLjQsNi43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNC44LDYuN2wtMC4yLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMXYwLjVjMCwwLjEsMCwwLjEsMCwwLjEKCQkJYzAsMCwwLDAsMCwwYzAsMCwwLDAtMC4xLDB2MEgxNXYwYzAsMC0wLjEsMC0wLjEsMHMwLDAsMCwwYzAsMCwwLDAsMC0wLjFMMTQuOCw2LjdMMTQuOCw2Ljd6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTE2LDdjMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4xLDAsMC4yLDAuMSwwLjNjMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMCwwLDAuMSwwLDAuMS0wLjEKCQkJYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLTAuMiwwLTAuM2MwLTAuMiwwLTAuMy0wLjEtMC40Yy0wLjEtMC4xLTAuMS0wLjEtMC4yLTAuMWMwLDAtMC4xLDAtMC4xLDBDMTYsNi44LDE2LDYuOSwxNiw3egoJCQkgTTE2LjIsNi44QzE2LjIsNi44LDE2LjMsNi44LDE2LjIsNi44YzAuMSwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuM2MwLDAuMSwwLDAuMS0wLjEsMC4xCgkJCWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC0wLjNDMTYuMSw2LjksMTYuMSw2LjksMTYuMiw2LjgKCQkJQzE2LjEsNi44LDE2LjIsNi44LDE2LjIsNi44eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMC40LDkuMUMxMC40LDkuMSwxMC40LDkuMSwxMC40LDkuMWMwLDAtMC4xLDAtMC4xLDB2MGgwLjR2MGMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLTAuMQoJCQlWOC4yaDBsLTAuMiwwLjFsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjFWOS4xQzEwLjQsOSwxMC40LDkuMSwxMC40LDkuMXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTEuOSw5LjJjMCwwLDAuMSwwLDAuMi0wLjFjMC4xLDAsMC4xLTAuMSwwLjEtMC4yYzAtMC4xLDAuMS0wLjIsMC4xLTAuM2MwLTAuMiwwLTAuMy0wLjEtMC40CgkJCWMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC4xLTAuMSwwLjJzLTAuMSwwLjItMC4xLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUMxMS43LDkuMSwxMS44LDkuMiwxMS45LDkuMnogTTExLjgsOC40YzAtMC4xLDAtMC4yLDAuMS0wLjJjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjMKCQkJQzExLjcsOC42LDExLjcsOC41LDExLjgsOC40eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMyw4LjdjMCwwLjEsMCwwLjMsMC4xLDAuM2MwLjEsMC4xLDAuMSwwLjIsMC4yLDAuMmMwLDAsMC4xLDAsMC4yLTAuMVMxMy42LDksMTMuNiw5CgkJCWMwLTAuMSwwLjEtMC4yLDAuMS0wLjNjMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC4xLTAuMSwwLjIKCQkJQzEzLDguNSwxMyw4LjYsMTMsOC43eiBNMTMuMiw4LjRjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMC4xLDAuMSwwLjFjMCwwLjEsMCwwLjIsMCwwLjMKCQkJYzAsMC4yLDAsMC4zLDAsMC40YzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuM0MxMy4yLDguNiwxMy4yLDguNSwxMy4yLDguNHoKCQkJIi8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTE0LjYsOC4zQzE0LjYsOC4zLDE0LjYsOC4zLDE0LjYsOC4zYzAuMSwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMVY5YzAsMC4xLDAsMC4xLDAsMC4xCgkJCWMwLDAsMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBIMTV2MGMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAtMC4xLDAtMC4xVjguMWgwTDE0LjYsOC4zTDE0LjYsOC4zeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNi4yLDguMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMS0wLjEsMC4yLTAuMSwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuMwoJCQljMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMCwwLDAuMSwwLDAuMi0wLjFjMC4xLDAsMC4xLTAuMSwwLjEtMC4yYzAtMC4xLDAuMS0wLjIsMC4xLTAuM2MwLTAuMiwwLTAuMy0wLjEtMC40CgkJCUMxNi40LDguMiwxNi4zLDguMSwxNi4yLDguMXogTTE2LjQsOWMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMUMxNiw4LjksMTYsOC44LDE2LDguNwoJCQljMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBzMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuMwoJCQlDMTYuNCw4LjgsMTYuNCw4LjksMTYuNCw5eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik05LjEsOS42TDguOSw5LjdsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjF2MC41YzAsMC4xLDAsMC4xLDAsMC4xCgkJCWMwLDAsMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwczAsMCwwLDBjMCwwLDAsMCwwLTAuMUw5LjEsOS42TDkuMSw5LjZMOS4xLDkuNnoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTAuNSwxMC42YzAsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjNjMC0wLjIsMC0wLjMtMC4xLTAuNAoJCQljLTAuMS0wLjEtMC4xLTAuMS0wLjItMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUMxMC4zLDEwLjYsMTAuNCwxMC42LDEwLjUsMTAuNnogTTEwLjMsOS45YzAtMC4xLDAtMC4yLDAuMS0wLjJjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjMKCQkJQzEwLjMsMTAsMTAuMywxMCwxMC4zLDkuOXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTEuNywxMC41YzAuMSwwLjEsMC4yLDAuMiwwLjMsMC4yYzAuMSwwLDAuMSwwLDAuMi0wLjFjMC4xLDAsMC4xLTAuMSwwLjEtMC4yczAuMS0wLjIsMC4xLTAuMwoJCQljMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwLjFjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMmMwLDAuMS0wLjEsMC4yLTAuMSwwLjMKCQkJQzExLjYsMTAuMiwxMS42LDEwLjQsMTEuNywxMC41eiBNMTEuNyw5LjljMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBzMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMQoJCQljMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjIsMCwwLjMsMCwwLjRjMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC4zCgkJCUMxMS43LDEwLDExLjcsOS45LDExLjcsOS45eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMy4zLDEwLjZDMTMuMywxMC42LDEzLjMsMTAuNiwxMy4zLDEwLjZjMCwwLTAuMSwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwCgkJCWMwLDAsMC0wLjEsMC0wLjFWOS42aDBsLTAuMywwLjFsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjJ2MC42QzEzLjMsMTAuNSwxMy4zLDEwLjUsMTMuMywxMC42CgkJCXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTQuNiw5LjdDMTQuNiw5LjcsMTQuNyw5LjcsMTQuNiw5LjdjMC4xLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNgoJCQljMCwwLjEsMCwwLjEsMCwwLjFzMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBIMTV2MGMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAtMC4xLDAtMC4xVjkuNmgwTDE0LjYsOS43TDE0LjYsOS43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNi4yLDkuNmMtMC4xLDAtMC4xLDAtMC4xLDAuMWMtMC4xLDAtMC4xLDAuMS0wLjEsMC4ycy0wLjEsMC4yLTAuMSwwLjNjMCwwLjEsMCwwLjMsMC4xLDAuNAoJCQljMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMCwwLDAuMSwwLDAuMS0wLjFjMC4xLTAuMiwwLjEtMC41LDAuMi0wLjdjMC0wLjEsMC0wLjItMC4xLTAuMkMxNi40LDkuNiwxNi4zLDkuNiwxNi4yLDkuNnogTTE2LjQsMTAuNAoJCQljMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC40YzAtMC4xLDAtMC4yLDAtMC4zYzAtMC4xLDAtMC4yLDAuMS0wLjIKCQkJYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuM0MxNi40LDEwLjIsMTYuNCwxMC4zLDE2LjQsMTAuNHoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNNy44LDExLjVjMCwwLjIsMCwwLjMsMCwwLjNjMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDAKCQkJYzAsMCwwLjEsMCwwLjEtMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLTAuMiwwLTAuM2MwLTAuMSwwLTAuMi0wLjEtMC4zQzcuOCwxMS4zLDcuOCwxMS40LDcuOCwxMS41CgkJCUM3LjgsMTEuNSw3LjgsMTEuNSw3LjgsMTEuNXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNOC45LDExLjJDOC45LDExLjEsOC45LDExLjEsOC45LDExLjJjMC4xLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4xdjAuNQoJCQlDOSwxMS45LDksMTIsOSwxMmMwLDAsMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLTAuMSwwLTAuMVYxMWgwTDguOSwxMS4yTDguOSwxMS4yeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMC41LDExbC0wLjMsMC4xbDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNmMwLDAuMSwwLDAuMSwwLDAuMQoJCQlzMCwwLDAsMGMwLDAsMCwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLTAuMSwwLTAuMUwxMC41LDExTDEwLjUsMTF6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTExLjcsMTEuOWMwLjEsMC4xLDAuMiwwLjIsMC4zLDAuMmMwLjEsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjMKCQkJYzAtMC4yLDAtMC4zLTAuMS0wLjRDMTIuMSwxMSwxMiwxMSwxMS45LDExYy0wLjEsMC0wLjEsMC0wLjIsMC4xYy0wLjEsMC0wLjEsMC4xLTAuMiwwLjJjMCwwLjEtMC4xLDAuMi0wLjEsMC4zCgkJCUMxMS42LDExLjcsMTEuNiwxMS44LDExLjcsMTEuOXogTTExLjcsMTEuM2MwLTAuMSwwLTAuMiwwLjEtMC4yYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMQoJCQljMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjIsMCwwLjMsMCwwLjRjMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC40CgkJCUMxMS43LDExLjUsMTEuNywxMS40LDExLjcsMTEuM3oiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTMuNywxMS41YzAtMC4yLDAtMC4zLTAuMS0wLjRDMTMuNSwxMSwxMy40LDExLDEzLjMsMTFjLTAuMSwwLTAuMSwwLTAuMiwwLjFjLTAuMSwwLTAuMSwwLjEtMC4yLDAuMgoJCQljMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjRjMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMC4xLDAsMC4xLDAsMC4yLTAuMWMwLjEsMCwwLjEtMC4xLDAuMS0wLjIKCQkJQzEzLjcsMTEuOCwxMy43LDExLjcsMTMuNywxMS41eiBNMTMuNSwxMS45YzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuNAoJCQljMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLTAuMSwwLjEtMC4xYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xYzAsMC4xLDAsMC4yLDAsMC4zCgkJCUMxMy42LDExLjcsMTMuNSwxMS44LDEzLjUsMTEuOXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTQuNywxMkMxNC43LDEyLDE0LjcsMTIsMTQuNywxMmMwLDAtMC4xLDAtMC4xLDB2MEgxNXYwYy0wLjEsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMGMwLDAsMC0wLjEsMC0wLjEKCQkJVjExaDBsLTAuMywwLjFsMCwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLDAsMGMwLDAsMCwwLjEsMCwwLjJ2MC42QzE0LjcsMTIsMTQuNywxMiwxNC43LDEyeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xNiwxMS4xTDE2LDExLjFDMTYsMTEuMSwxNi4xLDExLjEsMTYsMTEuMWMwLjEsMCwwLjEsMCwwLjEsMGMwLDAsMCwwLDAsMHYwYzAtMC4xLDAtMC4xLDAuMS0wLjJMMTYsMTEuMQoJCQl6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTcuNCwxMy4zYzAuMSwwLjEsMC4xLDAuMiwwLjIsMC4yYzAsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMlM4LDEzLjEsOCwxMwoJCQljMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYy0wLjEsMC4yLTAuMSwwLjQtMC4xLDAuN0M3LjMsMTMuMyw3LjQsMTMuMyw3LjQsMTMuMwoJCQl6IE03LjUsMTIuN2MwLTAuMSwwLTAuMiwwLjEtMC4yYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLjEsMC4xLDAuMWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNAoJCQljMCwwLjEsMCwwLjEtMC4xLDAuMWMwLDAtMC4xLDAtMC4xLDBjLTAuMSwwLTAuMSwwLTAuMS0wLjFjMC0wLjEtMC4xLTAuMi0wLjEtMC4zQzcuNCwxMi45LDcuNCwxMi44LDcuNSwxMi43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik05LjQsMTNjMC0wLjIsMC0wLjMtMC4xLTAuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwLjFjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMgoJCQljMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4xLDAsMC4zLDAuMSwwLjRjMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMC4xLDAsMC4xLDAsMC4yLTAuMXMwLjEtMC4xLDAuMS0wLjIKCQkJQzkuNCwxMy4yLDkuNCwxMy4xLDkuNCwxM3ogTTkuMiwxMy4zYzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuMwoJCQljMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMC4xLDAuMSwwLjFjMCwwLjEsMCwwLjIsMCwwLjMKCQkJQzkuMiwxMy4xLDkuMiwxMy4yLDkuMiwxMy4zeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMC4zLDEyLjZDMTAuMywxMi41LDEwLjQsMTIuNSwxMC4zLDEyLjZjMC4xLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNgoJCQljMCwwLjEsMCwwLjEsMCwwLjFjMCwwLDAsMCwwLDBjMCwwLDAsMC0wLjEsMHYwaDAuNHYwYzAsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMGMwLDAsMC0wLjEsMC0wLjF2LTAuOWgwTDEwLjMsMTIuNkwxMC4zLDEyLjZ6IgoJCQkvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMS43LDEzLjRjMC4xLDAuMSwwLjIsMC4yLDAuMywwLjJjMC4xLDAsMC4xLDAsMC4yLTAuMWMwLjEsMCwwLjEtMC4xLDAuMS0wLjJjMC0wLjEsMC4xLTAuMiwwLjEtMC4zCgkJCWMwLTAuMiwwLTAuMy0wLjEtMC40Yy0wLjEtMC4xLTAuMS0wLjEtMC4yLTAuMWMtMC4xLDAtMC4xLDAtMC4yLDAuMWMtMC4xLDAtMC4xLDAuMS0wLjIsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuMwoJCQlDMTEuNiwxMy4xLDExLjYsMTMuMywxMS43LDEzLjR6IE0xMS43LDEyLjdjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLTAuMSwwLjEtMC4xYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjQKCQkJQzExLjcsMTIuOSwxMS43LDEyLjgsMTEuNywxMi43eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik0xMy4zLDEzLjVDMTMuMywxMy41LDEzLjMsMTMuNSwxMy4zLDEzLjVjMCwwLTAuMSwwLTAuMSwwdjBoMC40djBjLTAuMSwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwCgkJCWMwLDAsMC0wLjEsMC0wLjF2LTFoMGwtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwczAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNkMxMy4zLDEzLjQsMTMuMywxMy41LDEzLjMsMTMuNXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTQuOCwxMi40Yy0wLjEsMC0wLjEsMC0wLjIsMC4xYy0wLjEsMC0wLjEsMC4xLTAuMiwwLjJjMCwwLjEtMC4xLDAuMi0wLjEsMC4zYzAsMC4yLDAsMC4zLDAuMSwwLjQKCQkJYzAsMC4xLDAuMSwwLjEsMC4xLDAuMmMwLDAsMCwwLDAuMS0wLjFjMCwwLDAsMCwwLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjRjMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMgoJCQlDMTQuNywxMi40LDE0LjgsMTIuNCwxNC44LDEyLjRDMTQuOCwxMi40LDE0LjksMTIuNCwxNC44LDEyLjRjMC4xLDAuMSwwLjIsMC4yLDAuMiwwLjJjMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjEsMCwwLjIsMCwwLjIKCQkJYzAuMS0wLjEsMC4xLTAuMiwwLjItMC4yYzAtMC4yLDAtMC4zLTAuMS0wLjRDMTQuOSwxMi40LDE0LjksMTIuNCwxNC44LDEyLjR6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTcuNiwxNC45YzAsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjNjMC0wLjIsMC0wLjMtMC4xLTAuNAoJCQljLTAuMS0wLjEtMC4xLTAuMS0wLjItMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuM2MwLDAuMSwwLDAuMywwLjEsMC4zCgkJCUM3LjQsMTQuOSw3LjUsMTQuOSw3LjYsMTQuOXogTTcuNSwxNC4yYzAtMC4xLDAtMC4yLDAuMS0wLjJjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMCwwLjEsMGMwLDAsMC4xLDAuMSwwLjEsMC4xCgkJCWMwLDAuMSwwLDAuMiwwLDAuM2MwLDAuMiwwLDAuMywwLDAuNGMwLDAuMSwwLDAuMS0wLjEsMC4xYzAsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4xLDAtMC4xLTAuMWMwLTAuMS0wLjEtMC4yLTAuMS0wLjMKCQkJQzcuNCwxNC40LDcuNCwxNC4zLDcuNSwxNC4yeiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik05LDE0LjlDOSwxNC45LDksMTQuOSw5LDE0LjljMCwwLTAuMSwwLTAuMSwwdjBoMC40djBjMCwwLTAuMSwwLTAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLTAuMSwwLTAuMXYtMC45CgkJCWgwTDguOCwxNGwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwczAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNkM5LDE0LjgsOSwxNC45LDksMTQuOXoiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTAuNCwxNC45QzEwLjQsMTQuOSwxMC40LDE0LjksMTAuNCwxNC45YzAsMC0wLjEsMC0wLjEsMHYwaDAuNHYwYy0wLjEsMC0wLjEsMC0wLjEsMGMwLDAsMCwwLDAsMAoJCQljMCwwLDAtMC4xLDAtMC4xdi0wLjloMEwxMC4zLDE0bDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBjMCwwLDAsMCwwLDBjMCwwLDAsMC4xLDAsMC4ydjAuNkMxMC40LDE0LjgsMTAuNCwxNC45LDEwLjQsMTQuOQoJCQl6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTExLjYsMTQuOGMwLjEsMC4xLDAuMiwwLjIsMC4zLDAuMmMwLjEsMCwwLjEsMCwwLjItMC4xYzAuMSwwLDAuMS0wLjEsMC4xLTAuMmMwLTAuMSwwLjEtMC4yLDAuMS0wLjMKCQkJYzAtMC4yLDAtMC4zLTAuMS0wLjRjLTAuMS0wLjEtMC4yLTAuMS0wLjItMC4xYy0wLjEsMC0wLjEsMC0wLjIsMC4xYy0wLjEsMC0wLjEsMC4xLTAuMiwwLjJjMCwwLjEtMC4xLDAuMi0wLjEsMC4zCgkJCUMxMS41LDE0LjYsMTEuNiwxNC43LDExLjYsMTQuOHogTTExLjcsMTQuMWMwLTAuMSwwLTAuMiwwLjEtMC4yYzAsMCwwLjEtMC4xLDAuMS0wLjFjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLjEsMC4xLDAuMSwwLjEKCQkJYzAsMC4xLDAsMC4yLDAsMC4zYzAsMC4yLDAsMC4zLDAsMC40YzAsMC4xLDAsMC4xLTAuMSwwLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC0wLjEtMC4xYzAtMC4xLTAuMS0wLjItMC4xLTAuNAoJCQlDMTEuNywxNC4zLDExLjcsMTQuMiwxMS43LDE0LjF6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTEzLjQsMTMuOGwtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMnYwLjUKCQkJYzAuMSwwLDAuMS0wLjEsMC4xLTAuMUwxMy40LDEzLjhMMTMuNCwxMy44eiIvPgoJCTxwYXRoIGZpbGw9IiNBM0NDMzkiIGQ9Ik03LjgsMTUuNGMtMC4xLTAuMS0wLjEtMC4xLTAuMi0wLjFjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEsMC4xLTAuMSwwLjJjMCwwLjEsMCwwLjIsMCwwLjMKCQkJYzAsMCwwLDAsMC4xLDBjMC0wLjEsMC0wLjEsMC0wLjJjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwQzcuNywxNS40LDcuOCwxNS41LDcuOCwxNS40CgkJCWMwLDAuMiwwLDAuMywwLDAuNGMwLDAsMCwwLDAsMGMwLDAsMC4xLDAsMC4xLDBjMCwwLDAsMCwwLDBDNy45LDE1LjcsNy45LDE1LjUsNy44LDE1LjR6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTkuMywxNS40Yy0wLjEtMC4xLTAuMS0wLjEtMC4yLTAuMWMtMC4xLDAtMC4xLDAtMC4xLDAuMWMtMC4xLDAtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLTAuMSwwLjItMC4xLDAuMwoJCQljMCwwLDAsMCwwLDAuMWMwLDAsMC4xLDAsMC4xLDBsMCwwYzAsMCwwLDAsMC0wLjFjMC0wLjEsMC0wLjIsMC0wLjNjMC0wLjEsMC0wLjIsMC4xLTAuMmMwLDAsMC4xLDAsMC4xLDBjMCwwLDAuMSwwLDAuMSwwCgkJCUM5LjIsMTUuNCw5LjIsMTUuNSw5LjMsMTUuNGMwLDAuMiwwLDAuMywwLDAuNGMwLDAsMCwwLjEsMCwwLjFjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMC0wLjFDOS40LDE1LjcsOS40LDE1LjUsOS4zLDE1LjR6Ii8+CgkJPHBhdGggZmlsbD0iI0EzQ0MzOSIgZD0iTTEwLjUsMTUuM2wtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwYzAsMCwwLDAsMCwwYzAsMCwwLDAuMSwwLDAuMnYwLjJjMCwwLDAuMSwwLDAuMSwwCgkJCUwxMC41LDE1LjNMMTAuNSwxNS4zTDEwLjUsMTUuM3oiLz4KCQk8cGF0aCBmaWxsPSIjQTNDQzM5IiBkPSJNMTIsMTUuMmwtMC4zLDAuMWwwLDBjMCwwLDAuMSwwLDAuMSwwYzAsMCwwLDAsMCwwQzExLjksMTUuNCwxMS45LDE1LjMsMTIsMTUuMkwxMiwxNS4yTDEyLDE1LjJMMTIsMTUuMnoKCQkJIi8+Cgk8L2c+CjwvZz4KPC9zdmc+" alt="chata.ai" height="22px" width="22px" draggable="false"></div>
    ` : '';

    var disabled = chataBarContainer.options.isDisabled ? 'disabled' : '';

    chataBarContainer.innerHTML = `
    <div class="chat-bar-text">
        <div class="chat-bar-auto-complete-suggestions ${chataBarContainer.options.autoCompletePlacement}">
            <ul class="chat-bar-autocomplete">
            </ul>
        </div>
        ${CHATA_ICON}
        <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input-renderer chat-bar left-padding" placeholder="Ask me anything" value="" id="" ${disabled}>
    </div>

    `;

    chataBarContainer.chatbar = chataBarContainer.getElementsByClassName('chata-input-renderer')[0];
    chataBarContainer.bind = function(responseRenderer){
        this.responseRenderer = responseRenderer;
        responseRenderer.chataBarContainer = chataBarContainer;
    }

    chataBarContainer.onkeyup = function(){
        if(chataBarContainer.options.enableAutocomplete){
            var suggestionList = this.getElementsByClassName('chat-bar-autocomplete')[0];
            suggestionList.style.display = 'none';
            if(event.target.value){
                ChatDrawer.autocomplete(event.target.value, suggestionList, 'suggestion-renderer', chataBarContainer.options.autocompleteStyles);
            }
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
        chataBarContainer.options.onSubmit();
        var responseRenderer = this.responseRenderer;
        var parent = this.getElementsByClassName('chat-bar-text')[0];
        this.chatbar.disabled = true;
        this.chatbar.value = '';
        if(this.options.showLoadingDots){
            var responseLoadingContainer = putLoadingContainer(parent);
        }
        const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
          value
        )}&projectId=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;
        const URL = `https://backend-staging.chata.ai/api/v1/query?q=${value}&project=1&unified_query_id=${uuidv4()}`;

        ChatDrawer.ajaxCall(URL_SAFETYNET, function(jsonResponse){
            if(jsonResponse['full_suggestion'].length && chataBarContainer.options.enableSafetyNet){
                responseRenderer.innerHTML = '';
                chataBarContainer.chatbar.removeAttribute("disabled");
                if(chataBarContainer.options.showLoadingDots){
                    parent.removeChild(responseLoadingContainer);
                }
                var suggestionArray = ChatDrawer.createSuggestionArray(jsonResponse);
                var node = ChatDrawer.createSafetynetContent(suggestionArray, 'ChatBar');
                responseRenderer.appendChild(node);
                chataBarContainer.options.onResponseCallback();
                ChatDrawer.responses[responseRenderer.dataset.componentid] = jsonResponse;
            }else{
                ChatDrawer.ajaxCall(URL, function(jsonResponse){
                    ChatDrawer.responses[responseRenderer.dataset.componentid] = jsonResponse;
                    responseRenderer.innerHTML = '';
                    chataBarContainer.chatbar.removeAttribute("disabled");
                    if(chataBarContainer.options.showLoadingDots){
                        parent.removeChild(responseLoadingContainer);
                    }
                    switch(jsonResponse['display_type']){
                        case 'suggestion':
                            var data = csvTo2dArray(jsonResponse['data']);
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
                                createTable(jsonResponse, div, 'append', uuid, 'table-response-renderer');
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
                            createPivotTable(pivotArray, div, 'append', uuid, 'table-response-renderer');
                        break;
                        case 'pivot_column':
                            var uuid = uuidv4();
                            ChatDrawer.responses[uuid] = jsonResponse;
                            var div = document.createElement('div');
                            div.classList.add('chata-table-container');
                            div.classList.add('chata-table-container-renderer');
                            responseRenderer.appendChild(div);
                            var pivotArray = ChatDrawer.getPivotColumnArray(jsonResponse);
                            createPivotTable(pivotArray, div, 'append', '', 'table-response-renderer');
                        break;
                        case 'line':
                            var values = formatDataToBarChart(jsonResponse);
                            var grouped = values[0];
                            var hasNegativeValues = values[1];
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            createLineChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false, 'data-chartrenderer');
                        break;
                        case 'bar':
                            var values = formatDataToBarChart(jsonResponse);
                            var grouped = values[0];
                            var hasNegativeValues = values[1];
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            createBarChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false, 'data-chartrenderer');
                        break;
                        case 'column':
                            var values = formatDataToBarChart(jsonResponse);
                            var grouped = values[0];
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            var hasNegativeValues = values[1];
                            createColumnChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false, 'data-chartrenderer');
                        break;
                        case 'heatmap':
                            var values = formatDataToHeatmap(jsonResponse);
                            var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                            var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            var col3 = formatColumnName(jsonResponse['columns'][2]['name']);
                            createHeatmap(responseRenderer, labelsX, labelsY, values, col1, col2, col3, false, 'data-chartrenderer');
                        break;
                        case 'bubble':
                            var values = formatDataToHeatmap(jsonResponse);
                            var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                            var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            var col3 = formatColumnName(jsonResponse['columns'][2]['name']);
                            createBubbleChart(responseRenderer, labelsX, labelsY, values, col1, col2, col3, false, 'data-chartrenderer');
                        break;
                        case 'help':
                            responseRenderer.innerHTML = ChatDrawer.createHelpContent(jsonResponse['data']);
                        break;
                        default:

                    }
                    chataBarContainer.options.onResponseCallback();
                });
            }
        });
    }

    return chataBarContainer;
}

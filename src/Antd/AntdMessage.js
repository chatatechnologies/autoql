import { htmlToElement } from '../Utils'
import { ANTD_INFO_ICON } from '../Svg'
import './Antd.css'

export function AntdMessage(text, duration, options={}){
    var obj = this;

    const {
        parent,
        icon
    } = options

    const wrapper = document.createElement('div');
    const wrapperNotice = document.createElement('span');
    const antdIcon = icon ? icon : ANTD_INFO_ICON

    const message = htmlToElement(`
        <div class="ant-message">
        </div>
    `)

    obj.show = () => {
        const content = htmlToElement(`
            <div class="ant-message-notice">
                <div class="ant-message-notice-content">
                    <div
                        class="ant-message-custom-content ant-message-success">
                        <span
                            role="img"
                            aria-label="check-circle"
                            class="anticon anticon-check-circle">
                            ${antdIcon}
                        </span>
                        <span>${text}</span>
                    </div>
                </div>
            </div>
        `)
        obj.content = content;
        wrapperNotice.appendChild(content);
        content.classList.add('move-up-enter');
        content.classList.add('move-up-enter-active');
        return this;
    }

    obj.remove = () => {
        obj.content.classList.remove('move-up-enter');
        obj.content.classList.remove('move-up-enter-active');

        obj.content.classList.add('move-up-leave');
        obj.content.classList.add('move-up-leave-active');
        setTimeout(() => {
            wrapperNotice.removeChild(obj.content);
        }, 650)
    }

    message.appendChild(wrapperNotice);
    wrapper.appendChild(message);
    if(!parent){
        document.body.appendChild(wrapper);
    }else{
        parent.appendChild(wrapper)
    }

    setTimeout(() => {
        obj.remove();
    }, duration)

    obj.show();

    return obj;
}

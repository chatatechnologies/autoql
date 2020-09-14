import { htmlToElement } from './Utils'
import { ANTD_INFO_ICON } from './Svg'
import '../css/Antd.css'

export function AntdMessage(text, duration){
    var obj = this;

    const wrapper = document.createElement('div');
    const wrapperNotice = document.createElement('span');

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
                            ${ANTD_INFO_ICON}
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
    document.body.appendChild(wrapper);

    setTimeout(() => {
        obj.remove();
    }, duration)

    obj.show();

    return obj;
}

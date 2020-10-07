import {
    htmlToElement,
    uuidv4
} from '../Utils'
import './ChataRadio.css'

export function ChataRadio(){
    return htmlToElement(`
        <div class="chata-radio-btn-container" data-test="chata-radio">
            <p>
                <input type="radio" id="chata-radio-0cb19e93-74e8-4f17-85a3-5a799a3daae1-0" name="chata-radio-0cb19e93-74e8-4f17-85a3-5a799a3daae1" checked="">
                <label for="chata-radio-0cb19e93-74e8-4f17-85a3-5a799a3daae1-0">Once, when this happens</label>
            </p>
            <p>
                <input type="radio" id="chata-radio-0cb19e93-74e8-4f17-85a3-5a799a3daae1-1" name="chata-radio-0cb19e93-74e8-4f17-85a3-5a799a3daae1">
                <label for="chata-radio-0cb19e93-74e8-4f17-85a3-5a799a3daae1-1">Every time this happens</label>
            </p>
        </div>`
    );
}

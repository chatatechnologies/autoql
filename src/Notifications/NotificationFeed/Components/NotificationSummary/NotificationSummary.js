import { DATA_ALERT_OPERATORS, constructRTArray } from "autoql-fe-utils";
import './NotificationSummary.scss';

export function NotificationSummary({ itemData, queryResponse }) {
  const summaryContainer = document.createElement('div');
  const summaryLabel = document.createElement('span');
  
  summaryLabel.textContent = 'Summary:';
  summaryContainer.appendChild(summaryLabel);
  summaryContainer.classList.add('autoql-vanilla-notification-condition-statement');

  this.getInterpretationChunk = (chunk) => {
    switch (chunk.c_type) {
      case 'VALIDATED_VALUE_LABEL': {
        return ` ${chunk.eng}`
      }
      case 'VALUE_LABEL': {
        return ` ${chunk.eng}`
      }
      case 'DELIM': {
        return `${chunk.eng}`
      }
      default: {
        return ` ${chunk.eng}`
      }
    }
  }

  this.getChunkedInterpretationText = () => {
    const parsedRT = queryResponse?.data?.parsed_interpretation
    const rtArray = constructRTArray(parsedRT)
    let rtString = ''
    rtArray.map((chunk, i) => {
      rtString = `${rtString}${this.getInterpretationChunk(chunk)}`
    })

    return rtString.trim()
  }

  this.hasOperator = () => {
    return itemData?.expression?.length === 2;
  }

  this.getTextOperator = (operator) => {
    if(!operator) return 'New data was detected for the query.';
    const operatorText = DATA_ALERT_OPERATORS[operator].conditionTextPast;

    return operatorText;
  } 

  this.createTextOperator = (text) => {
    const operator = document.createElement('span');
    const textContent = document.createElement('span');

    textContent.textContent = text;
    textContent.classList.add('autoql-vanilla-data-alert-condition-statement-operator');
    operator.appendChild(document.createTextNode(' '));
    operator.appendChild(textContent);
    operator.appendChild(document.createTextNode(' '));

    return operator;
  }

  this.createTerm = (text) => {
    const term = document.createElement('span');
    term.classList.add('autoql-vanilla-data-alert-condition-statement-term');
    term.textContent = `"${text}"`;

    return term;
  }
  
  if(this.hasOperator()) {
    const operator = itemData.expression[0].condition;
    const termValue = itemData.expression[0].term_value;
    const secondTermValue = itemData.expression[1].term_value;
    
    summaryContainer.appendChild(this.createTerm(termValue));
    summaryContainer.appendChild(this.createTextOperator(this.getTextOperator(operator)));
    summaryContainer.appendChild(this.createTerm(secondTermValue));
    
  } else {
    const text = this.getChunkedInterpretationText();
    const operatorText = this.getTextOperator();

    summaryContainer.appendChild(this.createTextOperator(operatorText));
    summaryContainer.appendChild(this.createTerm(text));
  }
    
  return summaryContainer;
}
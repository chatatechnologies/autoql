(function (global, factory) {
	typeof exports === 'object' &&
    typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.RuleParser = global.RuleParser || {})));
}(this, (function (exports) { 'use strict';

function getOperator(condition){
    switch (condition) {
        case 'GREATER_THAN':
            return '>'
            break;
        case 'LESS_THAN':
            return '<'
            break;
        default:
            return ''
    }
}

function convert(rules, addTopOperator=true){
    var parsedRules = [];
    for (var i = 0; i < rules.length; i++) {
        var termValue = rules[i]['term_value'];
        var group = [];
        for (var x = 0; x < termValue.length; x++) {
            var term = termValue[x];
			var topOperator = term.condition;
			var rule = [];
            for (var j = 0; j < term.term_value.length; j++) {
                var cTerm = term.term_value[j];
                var operator = getOperator(cTerm.condition);
                rule.push(cTerm.term_value);
                if(operator)rule.push(operator);
            }
			if(topOperator !== 'TERMINATOR' && addTopOperator){
				rule.push(topOperator);
			}
			group.push(rule);
        }
        parsedRules.push(group)
    }

    return parsedRules;
}

exports.convert = convert;

Object.defineProperty(exports, '__esModule', { value: true });

})));

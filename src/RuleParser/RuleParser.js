export function getOperator(condition){
	switch (condition) {
		case 'GREATER_THAN':
			return '>';
		case 'LESS_THAN':
			return '<';
		case 'EXISTS':
			return 'Exists';
		default:
		return ''
	}
}

export function convert(rules, addTopOperator=true){
	var parsedRules = []
	var group = []
	var rule = []
	for (var i = 0; i < rules.length; i++) {
		var term = rules[i];
		var operator = getOperator(term.condition)
		rule.push(term.value)
		if(operator)rule.push(operator)
		if(term.condition === 'TERMINATOR'){
			parsedRules.push([rule])
			rule = []
		}
	}
	// for (var i = 0; i < rules.length; i++) {
	// 	var termValue = rules[i]['term_value'];
	// 	var group = [];
	// 	for (var x = 0; x < termValue.length; x++) {
	// 		var term = termValue[x];
	// 		var topOperator = term.condition;
	// 		var rule = [];
	// 		for (var j = 0; j < term.term_value.length; j++) {
	// 			var cTerm = term.term_value[j];
	// 			var operator = getOperator(cTerm.condition);
	// 			rule.push(cTerm.term_value);
	// 			if(operator)rule.push(operator);
	// 		}
	// 		if(topOperator !== 'TERMINATOR' && addTopOperator){
	// 			rule.push(topOperator);
	// 		}
	// 		group.push(rule);
	// 	}
	// 	parsedRules.push(group)
	// 	if(rules[i].condition !== 'TERMINATOR' && addTopOperator){
	// 		group.push([rules[i].condition])
	// 	}
	// }

	return parsedRules;
}

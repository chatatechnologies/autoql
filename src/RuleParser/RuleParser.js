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
		rule.push(term.term_value)
		if(operator)rule.push(operator)
		if(term.condition === 'TERMINATOR'){
			parsedRules.push([rule])
			rule = []
		}
	}
	return parsedRules;
}

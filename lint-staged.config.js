module.exports = {
	'*.js': [
		'eslint --fix',
		'prettier --use-tabs --single-quote --trailing-comma all --write',
		'git add',
	],
};

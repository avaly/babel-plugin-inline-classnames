module.exports = {
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module',
	},
	env: {
		node: true,
	},
	extends: ['eslint:recommended', 'prettier'],
	rules: {
		'no-unused-vars': 0,
	},
};

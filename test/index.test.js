/* eslint-env jest */
/* eslint no-console: 0 */

const babel = require('babel-core');
const fs = require('fs');

const babelOptions = {
	plugins: ['syntax-jsx', __dirname + '/../index.js'],
};

[
	'basic',
	'custom-import-name',
	'other-classnames',
	'string-literal',
	'object-expression',
	'falsy-values',
	'classnames-examples',
].forEach(test => {
	it(test, () => {
		const source = fs.readFileSync(__dirname + '/fixtures/' + test + '.js');
		const { code } = babel.transform(source, babelOptions);

		expect(code).toMatchSnapshot();
	});
});

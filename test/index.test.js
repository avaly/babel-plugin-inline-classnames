/* eslint-env jest */
/* eslint no-console: 0 */

const babel = require('babel-core');
const fs = require('fs');

const plugin = __dirname + '/../src/index.js';

[
	'basic',
	'custom-import-name',
	'other-classnames',
	'string-literal',
	'object-expression',
	'falsy-values',
	'classnames-examples',
	'scoped',
	'logical-expressions',
].forEach(test => {
	it(test, () => {
		const source = fs.readFileSync(__dirname + '/fixtures/' + test + '.js');
		const { code } = babel.transform(source, { plugins: [plugin] });

		expect(code).toMatchSnapshot();
	});
});

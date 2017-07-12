/* eslint-env jest */
/* eslint no-console: 0 */

const babel = require('babel-core');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const plugin = __dirname + '/../src/index.js';
const fixturesDir = __dirname + '/fixtures/';

const fixtures = glob.sync(fixturesDir + '*.js');

fixtures.forEach(fixture => {
	const test = path.basename(fixture);

	it(`transforms ${test}`, () => {
		const source = fs.readFileSync(__dirname + '/fixtures/' + test);
		const { code } = babel.transform(source, { plugins: [plugin] });

		expect(code).toMatchSnapshot();
	});

	it(`executes ${test}`, () => {
		const source = fs.readFileSync(__dirname + '/fixtures/' + test);
		const { code } = babel.transform(source, {
			plugins: ['transform-es2015-modules-commonjs', plugin],
		});

		const result = eval(code);
		expect(result).toMatchSnapshot();
	});
});

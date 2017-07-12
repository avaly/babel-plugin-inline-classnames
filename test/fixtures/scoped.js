import classNames from 'classnames';

function scope1() {
	function scope2() {
		return classNames('foo', 'bar');
	}

	return scope2();
}

scope1();

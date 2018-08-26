import classNames from 'classnames/bind';

const inline = {
	foo: 'abc',
	bar: 'def',
	baz: 'xyz',
};

const cx = classNames.bind(inline);

cx('foo', { bar: true, baz: 1 });

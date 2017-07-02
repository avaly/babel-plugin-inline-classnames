import classNames from 'classnames';

classNames('foo', 'bar');
classNames('foo', { bar: true });
classNames({ 'foo-bar': true });
classNames({ 'foo-bar': false });
classNames({ foo: true }, { bar: true });
classNames({ foo: true, bar: true });
classNames('foo', { bar: true, duck: false }, 'baz', { quux: true });
classNames(null, false, 'bar', undefined, 0, 1, { baz: null }, '');

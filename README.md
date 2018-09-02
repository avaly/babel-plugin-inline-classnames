# babel-plugin-inline-classnames

[![Travis branch](https://img.shields.io/travis/avaly/babel-plugin-inline-classnames/master.svg?style=flat-square)](https://travis-ci.org/avaly/babel-plugin-inline-classnames)
[![NPM version](https://img.shields.io/npm/v/babel-plugin-inline-classnames.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-inline-classnames)

Babel plugin which inlines the result of [classnames](https://github.com/JedWatson/classnames)

Useful for production builds.

## Install

npm:

```cli
npm install -S babel-plugin-inline-classnames
```

yarn:

```cli
yarn add babel-plugin-inline-classnames
```

## Usage

Add this plugin to your Babel config. Most commonly used in [`.babelrc`](http://babeljs.io/docs/usage/babelrc/):

For all environments:

```json
{
  "plugins": ["babel-plugin-inline-classnames"]
}
```

For production only (see [env](http://babeljs.io/docs/usage/babelrc/#env-option) option):

```json
{
  "env": {
    "production": {
      "plugins": ["babel-plugin-inline-classnames"]
    }
  }
}
```

## Examples

Input:

```js
import classNames from 'classnames';
import styles from './styles.css';

classNames('foo', 'bar');
classNames('foo', { bar: true });
classNames({ 'foo-bar': true });
classNames({ 'foo-bar': false });
classNames({ foo: true }, { bar: true });
classNames({ foo: true, bar: true });
classNames('foo', { bar: true, duck: false }, 'baz', { quux: true });
classNames(null, false, 'bar', undefined, 0, 1, { baz: null }, '');
classNames(styles.foo, styles.bar);
```

Output:

```js
import styles from './styles.css';

'foo bar';
'foo bar';
'foo-bar';
'';
'foo bar';
'foo bar';
'foo bar baz quux';
'bar ' + 1;
(styles.foo || '') + ' ' + (styles.bar || '');
```

With [`bind`](https://github.com/JedWatson/classnames#alternate-bind-version-for-css-modules):

```js
import classNames from 'classnames/bind';
import styles from './styles.css';

const cx = classNames.bind(styles);

cx('foo', 'bar');
```

Output:

```js
import styles from './styles.css';

(styles.foo || '') + ' ' + (styles.bar || '');
```

## Versions

See full [changelog](CHANGELOG.md) for details.

- `1.*` - requires Babel `6.*`
- `2.*` - requires Babel `7.*`

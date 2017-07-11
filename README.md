# babel-plugin-inline-classnames

[![Travis branch](https://img.shields.io/travis/avaly/babel-plugin-inline-classnames/master.svg?style=flat-square)](https://travis-ci.org/avaly/babel-plugin-inline-classnames)

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
  "plugins": ["inline-classnames"]
}
```

For production only (see [env](http://babeljs.io/docs/usage/babelrc/#env-option) option):

```json
{
  "env": {
    "production": {
      "plugins": ["inline-classnames"]
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

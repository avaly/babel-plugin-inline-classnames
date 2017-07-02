import classnames from 'classnames';
import styles from './styles.css';

classnames('foo', { bar: true });
classnames({ 'foo-bar': true });
classnames({ foo: true }, { bar: true });
classnames({ foo: true, bar: true });
classnames({ foo: true, bar: false });
classnames({ [styles.foo]: true, [styles.bar]: true });

import classnames from 'classnames';
import styles from './styles.css';

const object = {};

for (const key in object) {
	classnames(styles.foo, styles.bar);
}

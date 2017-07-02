import classnames from 'classnames';
import styles from './styles.css';

classnames('global', styles.foo, styles.bar);

<div className={classnames(styles.foo, 'global', styles.bar)} />;

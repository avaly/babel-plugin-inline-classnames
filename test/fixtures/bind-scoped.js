import classNames from 'classnames/bind';
import styles from './styles.css';

const cx = classNames.bind(styles);

function scope1() {
	function scope2() {
		return cx('foo', 'bar');
	}

	return scope2();
}

scope1();

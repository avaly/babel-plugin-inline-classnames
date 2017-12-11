import classnames from 'classnames';

const FALSY = false;
const ANOTHER_FALSY = false;

classnames(FALSY && ANOTHER_FALSY && 'foo');

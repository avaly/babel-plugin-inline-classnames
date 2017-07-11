import classnames from 'classnames';

const TRUTHY = true;
const FALSY = false;
const nullValue = null;

classnames(TRUTHY && nullValue, FALSY && 'foo', TRUTHY ? nullValue : 'ham');

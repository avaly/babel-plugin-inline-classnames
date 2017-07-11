import classnames from 'classnames';

const nullValue = null;

classnames(null, false, undefined, 0, '');
classnames(null, false, undefined, 0, '', 'foo', 1, nullValue);

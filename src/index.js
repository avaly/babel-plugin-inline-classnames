const CLASSNAMES_IMPORT = 'classnames';
const CLASSNAMES_BIND_IMPORT = 'classnames/bind';

const removeClassnamesImport = {
	ImportDeclaration(path) {
		const { source } = path.node;
		const { type, value } = source;

		if (
			type !== 'StringLiteral' ||
			(value !== CLASSNAMES_IMPORT && value !== CLASSNAMES_BIND_IMPORT)
		) {
			return;
		}

		path.remove();
	},
};

const isIdentifierDefinedAs = (name, importName, scope) => {
	const binding = scope.bindings[name];
	if (binding.kind !== 'module') {
		return false;
	}

	const { path } = binding;
	if (
		path.parent.type !== 'ImportDeclaration' ||
		path.parent.source.value !== importName
	) {
		return false;
	}

	return true;
};

const isCalleeClassnames = (name, scope) => {
	if (!scope) {
		return false;
	}
	if (!scope.bindings[name]) {
		return isCalleeClassnames(name, scope.parent);
	}

	return isIdentifierDefinedAs(name, CLASSNAMES_IMPORT, scope);
};

const isCalleeClassnamesBind = (callee, scope) => {
	if (callee.type !== 'MemberExpression' || !scope) {
		return false;
	}

	const { name } = callee.object;

	if (!scope.bindings[name]) {
		return isCalleeClassnamesBind(callee, scope.parent);
	}

	return isIdentifierDefinedAs(name, CLASSNAMES_BIND_IMPORT, scope);
};

const BabelPluginInlineClassnames = ({ types: t }) => {
	let boundName;
	let boundSource;

	function isValidNode(node) {
		if (t.isNullLiteral(node) || t.isIdentifier(node, { name: 'undefined' })) {
			return false;
		}
		if (t.isBooleanLiteral(node, { value: false })) {
			return false;
		}
		if (t.isStringLiteral(node, { value: '' })) {
			return false;
		}
		if (t.isNumericLiteral(node, { value: 0 })) {
			return false;
		}
		return true;
	}

	function isAndLogicalExpression(node) {
		return t.isLogicalExpression(node) && node.operator === '&&';
	}

	function createPlus(left, right) {
		return t.binaryExpression('+', left, right);
	}

	function wrapIdentifier(node) {
		if (
			t.isIdentifier(node) ||
			t.isMemberExpression(node) ||
			t.isLogicalExpression(node) ||
			t.isConditionalExpression(node)
		) {
			return t.logicalExpression('||', node, t.stringLiteral(''));
		}
		return node;
	}

	const wrapBound = (value, bound) =>
		t.memberExpression(t.identifier(bound), t.identifier(value));

	function joinNodes(nodes, index, transformer, joiner, bound = null) {
		if (index >= nodes.length) {
			return null;
		}
		if (index === nodes.length - 1) {
			return transformer(nodes[index], bound, true);
		}

		const left = transformer(nodes[index], bound);
		const right = joiner(nodes.splice(index + 1), bound);

		if (!isValidNode(left)) {
			return right;
		}
		if (!isValidNode(right)) {
			return left;
		}

		if (t.isStringLiteral(left)) {
			if (t.isStringLiteral(right)) {
				const value = left.value + ' ' + right.value;
				return t.stringLiteral(value.trim());
			} else {
				return createPlus(t.stringLiteral(left.value + ' '), right);
			}
		} else if (t.isStringLiteral(right)) {
			return createPlus(left, t.stringLiteral(' ' + right.value));
		}

		return createPlus(
			createPlus(wrapIdentifier(left), t.stringLiteral(' ')),
			wrapIdentifier(right),
		);
	}

	function transformProperty(property, bound = null) {
		let value = property.key;

		if (t.isIdentifier(value)) {
			value = t.stringLiteral(value.name);
		}
		if (bound) {
			value = wrapBound(value.value, bound);
		}

		if (t.isBooleanLiteral(property.value)) {
			if (property.value.value) {
				return value;
			} else {
				return t.stringLiteral('');
			}
		}
		if (
			t.isNullLiteral(property.value) ||
			t.isIdentifier(property.value, { name: 'undefined' })
		) {
			return t.stringLiteral('');
		}

		return t.conditionalExpression(property.value, value, t.stringLiteral(''));
	}

	function joinObjectProperties(properties, bound = null) {
		return joinNodes(
			properties,
			0,
			transformProperty,
			joinObjectProperties,
			bound,
		);
	}

	function transformArgument(node, bound = null, allowWrap = false) {
		if (t.isObjectExpression(node)) {
			return joinObjectProperties(node.properties, bound);
		}
		if (allowWrap && isAndLogicalExpression(node)) {
			return wrapIdentifier(node);
		}
		if (bound && t.isStringLiteral(node)) {
			return wrapBound(node.value, bound);
		}
		return node;
	}

	function joinArguments(args, bound = null) {
		let index = 0;
		const max = args.length - 1;

		while (index < max && !isValidNode(args[index])) {
			index++;
		}

		return joinNodes(args, index, transformArgument, joinArguments, bound);
	}

	const visitor = {
		CallExpression(path) {
			const { node, scope } = path;
			const { callee } = node;

			if (isCalleeClassnames(callee.name, scope)) {
				const replacement = joinArguments(node.arguments);

				path.replaceWith(replacement);
			}

			if (boundName && callee.name === boundName) {
				const replacement = joinArguments(node.arguments, boundSource);

				path.replaceWith(replacement);
			}
		},

		Program: {
			enter() {
				boundName = null;
				boundSource = null;
			},
			exit(path, state) {
				path.traverse(removeClassnamesImport, state);
			},
		},

		VariableDeclaration(path) {
			const { node, scope } = path;

			const found = node.declarations
				.filter(
					declaration =>
						declaration.type === 'VariableDeclarator' &&
						declaration.init &&
						declaration.init.type === 'CallExpression',
				)
				.some(declaration => {
					if (isCalleeClassnamesBind(declaration.init.callee, scope)) {
						boundName = declaration.id.name;
						boundSource = declaration.init.arguments[0].name;
						return true;
					}
					return false;
				});

			if (found) {
				path.remove();
			}
		},
	};

	return {
		name: 'babel-plugin-inline-classnames',
		visitor,
	};
};

module.exports = BabelPluginInlineClassnames;

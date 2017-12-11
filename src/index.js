const BabelPluginInlineClassnames = ({ types: t }) => {
	function isCalleeClassnames(name, scope) {
		if (!scope) {
			return false;
		}
		if (!scope.bindings[name]) {
			return isCalleeClassnames(name, scope.parent);
		}

		const binding = scope.bindings[name];
		if (binding.kind !== 'module') {
			return false;
		}

		const path = binding.path;
		if (
			path.parent.type !== 'ImportDeclaration' ||
			path.parent.source.value !== 'classnames'
		) {
			return false;
		}

		return true;
	}

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

	function joinNodes(nodes, index, transformer, joiner) {
		if (index >= nodes.length) {
			return null;
		}
		if (index === nodes.length - 1) {
			return transformer(nodes[index], true);
		}

		const left = transformer(nodes[index]);
		const right = joiner(nodes.splice(index + 1));

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

	function transformProperty(property) {
		let value = property.key;

		if (t.isIdentifier(value)) {
			value = t.stringLiteral(value.name);
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

	function joinObjectProperties(properties) {
		return joinNodes(properties, 0, transformProperty, joinObjectProperties);
	}

	function transformArgument(node, allowWrap = false) {
		if (t.isObjectExpression(node)) {
			return joinObjectProperties(node.properties);
		}
		if (allowWrap && isAndLogicalExpression(node)) {
			return wrapIdentifier(node);
		}
		return node;
	}

	function joinArguments(args) {
		let index = 0;
		const max = args.length - 1;

		while (index < max && !isValidNode(args[index])) {
			index++;
		}

		return joinNodes(args, index, transformArgument, joinArguments);
	}

	const visitor = {
		CallExpression(path) {
			const { node } = path;

			if (!isCalleeClassnames(node.callee.name, path.scope)) {
				return;
			}

			const replacement = joinArguments(node.arguments);

			path.replaceWith(replacement);
		},

		ImportDeclaration(path) {
			const { source } = path.node;

			if (source.type !== 'StringLiteral' || source.value !== 'classnames') {
				return;
			}

			path.remove();
		},
	};

	return {
		name: 'babel-plugin-inline-classnames',
		visitor,
	};
};

export default BabelPluginInlineClassnames;

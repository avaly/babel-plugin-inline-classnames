const BabelPluginInlineClassnames = ({ types: t }) => {
	function isCalleeClassnames(name, bindings) {
		if (!bindings[name]) {
			return false;
		}

		const binding = bindings[name];
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

	function createPlus(left, right) {
		return t.binaryExpression('+', left, right);
	}

	function joinNodes(nodes, index, transformer, joiner) {
		if (index >= nodes.length) {
			return null;
		}
		if (index === nodes.length - 1) {
			return transformer(nodes[index]);
		}

		const left = transformer(nodes[index]);
		const right = joiner(nodes.splice(index + 1));

		if (left.type === 'StringLiteral') {
			return createPlus(t.stringLiteral(left.value + ' '), right);
		}

		return createPlus(createPlus(left, t.stringLiteral(' ')), right);
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

	function transformArgument(node) {
		if (t.isObjectExpression(node)) {
			return joinObjectProperties(node.properties);
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

			if (!isCalleeClassnames(node.callee.name, path.scope.bindings)) {
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

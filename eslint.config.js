const globals = require('globals');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
	{
		files: ['**/*.js'],

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node, // Node.js global variables
				...globals.es2021, // ES2021 globals
			},
		},

		rules: {
			'no-unused-vars': 'warn',
			eqeqeq: 'error',
			'prefer-const': 'warn',
			'no-var': 'error',
			'no-console': 'off', // Allow console statements for debugging in Node.js
		},

		ignores: ['node_modules/', 'dist/'], // Ignores folders
	},
];

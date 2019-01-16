var assert = require('assert');
var rollup = require('rollup');
var yaml = require('..');
var npm = require('rollup-plugin-node-resolve');
var yamlParser = require('js-yaml');

require('source-map-support').install();

process.chdir(__dirname);

async function executeBundle(bundle) {
	var generated = await bundle.generate({
		format: 'esm'
	});
	var code = generated.code;

	var fn = new Function('assert', code);
	fn(assert);
}

describe('rollup-plugin-yaml', function() {
	// Tests YAML spec conformance from https://github.com/connec/yaml-spec/blob/master/spec.json
	// Just making sure the underlying YAML parser isn't crap
	var fs = require('fs');
	var path = require('path');
	var spec = JSON.parse(
		fs.readFileSync(path.join(__dirname, 'spec.json'), 'utf8')
	);
	for (var s in spec) {
		it('supports spec: ' + s, function() {
			for (var t in spec[s]) {
				var test = spec[s][t];
				var result = yamlParser.load(test.yaml);
				assert.deepStrictEqual(result, test.result);
			}
		});
	}

	it('converts yaml', function() {
		return rollup
			.rollup({
				input: 'samples/basic/main.js',
				plugins: [yaml()]
			})
			.then(executeBundle);
	});

	it('converts yml', function() {
		return rollup
			.rollup({
				input: 'samples/yml/main.js',
				plugins: [yaml()]
			})
			.then(executeBundle);
	});

	it('generates named exports', function() {
		return rollup
			.rollup({
				input: 'samples/named/main.js',
				plugins: [yaml()]
			})
			.then(executeBundle);
	});

	it('resolves extensionless imports in conjunction with npm plugin', function() {
		return rollup
			.rollup({
				input: 'samples/extensionless/main.js',
				plugins: [npm({ extensions: ['.js', '.yaml'] }), yaml()]
			})
			.then(executeBundle);
	});
});

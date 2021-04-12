const Puccini = (function () {
	let _cli = null;

	return {
		init: function (printStdout, printStderr, initCallback, exitCallback) {
			_cli = new GoCLI('puccini-tosca', printStdout, printStderr, exitCallback);
			_cli.load('wasm/puccini-tosca.wasm', initCallback);
		},

		version: function () {
			_cli.run('version');
		},

		compileYaml: function (yaml) {
			const argv = Array.prototype.slice.call(arguments, 1);
			argv.unshift('--problems-format=json');
			argv.unshift('compile');
			_cli.setStdin(yaml);
			_cli.run.apply(_cli, argv);
		},

		compileUrl: function (url) {
			const argv = Array.prototype.slice.call(arguments, 1);
			argv.unshift('--problems-format=json');
			argv.unshift(url);
			argv.unshift('compile');
			_cli.run.apply(_cli, argv);
		}
	};
}());

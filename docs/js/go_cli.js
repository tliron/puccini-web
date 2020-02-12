class GoCLI {
	constructor(name, printStdout, printStderr, exitCallback) {
		this._go = new Go();
		this._name = name;
		this._printStdout = printStdout;
		this._printStderr = printStderr;
		this._stdin = '';
		this._module = null;
		this._textDecoder = new TextDecoder('utf-8');
		this._textEncoder = new TextEncoder('utf-8');

		if (exitCallback)
			this._go.exit = exitCallback;
	}

	load(url, callback) {
		const self = this;
		WebAssembly.compileStreaming(fetch(url, {cache: 'reload'})).then((module) => {
			self._module = module;
			if (callback)
				callback();
		});
	}

	run() {
		const self = this;
		const argv = Array.prototype.slice.call(arguments);
		argv.unshift(self._name);
		WebAssembly.instantiate(self._module, self._go.importObject).then((instance) => {
			self._use();
			self._go.argv = argv;
			self._go.run(instance);
		});
	}

	setStdin(text) {
		this._stdin = this._textEncoder.encode(text);
	}

	_use() {
		// github.com/op/go-logging calls os.Getpid (in format.go)
		// github.com/docker/docker calls os.user (in homedir.go)
		// This makes sure we don't panic
		global.process = {
			pid: 0,
			getuid: function() { return 0; },
			getgid: function() { return 0; }
		};

		global.fs.writeSync = this._writeSync.bind(this);
		global.fs.read = this._read.bind(this);
		global.fs.close = this._close.bind(this);
	}

	_writeSync(fd, buffer) {
		// In wasm_exec.js this writes to console
		var text = this._textDecoder.decode(buffer);
		switch (fd) {
		case 1:
			this._printStdout(text);
			break;
		case 2:
			this._printStderr(text);
			break;
		}
		return buffer.length;
	}

	_read(fd, buffer, offset, length, position, callback) {
		// Not implemented in wasm_exec.js
		// See: https://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback
		var count = 0;
		if (fd === 0) {
			const stdinLength = this._stdin.length;
			for (; count < length; count++) {
				if (count >= stdinLength)
					break;
				buffer[offset + count] = this._stdin[count];
			}
			this._stdin = this._stdin.slice(count);
		}
		if (callback)
			callback(null, count, buffer);
	}

	_close(fd, callback) {
		// Not implemented in wasm_exec.js
		if (fd === 0)
			this._stdin = '';
		if (callback)
			callback(null);
	}
}

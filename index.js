'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

module.exports = function (options) {
	options = options || {};

	var miniJasmineLib = require('minijasminenode');

	if (options.reporter) {
		miniJasmineLib.addReporter(options.reporter);
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-jasmine', 'Streaming not supported'));
			return cb();
		}

		delete require.cache[require.resolve(path.resolve(file.path))];
		miniJasmineLib.addSpecs(file.path);

		this.push(file);
		cb();
	}, function (cb) {
		try {
			miniJasmineLib.executeSpecs({
				isVerbose: options.verbose,
				includeStackTrace: options.includeStackTrace,
				defaultTimeoutInterval: options.timeout,
				onComplete: function () {cb()}
			});
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-jasmine', err));
			cb();
		}
	});
};

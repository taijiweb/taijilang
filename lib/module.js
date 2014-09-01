var TaijiModule, exports, fs, hasOwnProperty, modulePaths, path, tryFile, tryPath, _realpathCache;

fs = require('fs');

path = require('path');

hasOwnProperty = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

modulePaths = [];

module.exports = exports = TaijiModule = function(filePath, parent) {
  this.parent = parent;
  this.exports = {};
  if (!filePath) {
    if (this.parent) {
      this.filePath = this.parent.filePath;
    } else {
      this.filePath = __filename;
    }
  } else if (!this.parent) {
    this.filePath = filePath;
  } else {
    this.filePath = this.parent.findPath(filePath);
  }
  this.basePath = path.dirname(this.filePath);
  if (this.parent) {
    this.modulePaths = this.parent.modulePaths.slice();
    this.modulePaths.unshift(path.resolve(this.basePath, '../taiji-libraries'));
  } else {
    this.modulePaths = modulePaths.slice();
    this.modulePaths.unshift(path.resolve(this.basePath, '../taiji_modules'));
  }
  return this;
};

TaijiModule._initPaths = function() {
  var i, path1, paths, splitter, _i, _len;
  if (process.env['TAIJILANG_PATH']) {
    splitter = process.platform === 'win32' ? ';' : ':';
    paths = process.env['TAIJILANG_PATH'].split(splitter);
    for (i = _i = 0, _len = paths.length; _i < _len; i = ++_i) {
      path1 = paths[i];
      paths[i] = path.resolve(path1, 'taiji-libraries');
    }
  } else {
    paths = [];
  }
  return modulePaths = paths;
};

TaijiModule._initPaths();

_realpathCache = {};

tryFile = function(requestPath) {
  var ex, stats;
  try {
    stats = fs.statSync(requestPath);
    if (stats && !stats.isDirectory()) {
      return fs.realpathSync(requestPath, _realpathCache);
    }
  } catch (_error) {
    ex = _error;
    return false;
  }
};

tryPath = function(filePath, trailingSlash) {
  var filename, mainPath;
  if (!trailingSlash) {
    filename = tryFile(filePath);
    if (!filename && filePath.slice(-3) !== '.tj') {
      filename = tryFile(filePath + '.tj');
    }
  }
  if (!filename) {
    mainPath = path.resolve(filePath, 'main.tj');
    filename = tryFile(mainPath);
  }
  return filename;
};

TaijiModule.matchPaths = function(request, paths) {
  var filename, path1, trailingSlash, _i, _len;
  trailingSlash = request.slice(-1) === '/';
  for (_i = 0, _len = paths.length; _i < _len; _i++) {
    path1 = paths[_i];
    if (filename = tryPath(path.resolve(path1, request), trailingSlash)) {
      return filename;
    }
  }
};

TaijiModule.prototype.findPath = function(filePath) {
  var err, filename, paths, start, trailingSlash;
  if (filePath === '**evaluated taijilang code**') {
    return filePath;
  }
  if (fs.exists(filePath)) {
    return filePath;
  }
  start = filePath.substring(0, 2);
  if (start === './' || start === '.\\' || start === '..') {
    trailingSlash = filePath.slice(-1) === '/';
    filename = tryPath(path.resolve(this.basePath, filePath), trailingSlash);
  } else {
    if (filePath.charAt(0) === '/') {
      paths = [''];
    } else {
      paths = this.modulePaths;
    }
    filename = TaijiModule.matchPaths(filePath, paths);
  }
  if (!filename) {
    err = new Error("Cannot find module '" + filePath + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }
  return filename;
};

"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var path = require('path');

var DynamicFileLoader =
/*#__PURE__*/
function () {
  function DynamicFileLoader(build) {
    (0, _classCallCheck2.default)(this, DynamicFileLoader);

    if (arguments.length === 1 && this.validateBuild(build)) {
      this.basePath = build.basePath;
      this.dirPath = build.dirPath;
      this.filter = build.filter;
      this.fnRequire = build.fnRequire;
    }
  }

  (0, _createClass2.default)(DynamicFileLoader, [{
    key: "validateBuild",
    value: function validateBuild(build) {
      return String(build.constructor) === String(DynamicFileLoader.Builder);
    }
  }, {
    key: "load",

    /**
     * Function for load modules files dynamically
     * @param {Object} options
     *      @param {String} dirPath path directory where be files
     *      @param {Array|RegExp} filter list of files names to exclude or regular expresion
     *      @param {Function} fnRequire callback function to custom require (optional)
     */
    value: function () {
      var _load = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var options,
            _options$basePath,
            basePath,
            _options$dirPath,
            dirPath,
            _options$filter,
            filter,
            _options$fnRequire,
            fnRequire,
            filesNames,
            _args = arguments;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
                _options$basePath = options.basePath, basePath = _options$basePath === void 0 ? this.basePath : _options$basePath, _options$dirPath = options.dirPath, dirPath = _options$dirPath === void 0 ? this.dirPath : _options$dirPath, _options$filter = options.filter, filter = _options$filter === void 0 ? this.filter : _options$filter, _options$fnRequire = options.fnRequire, fnRequire = _options$fnRequire === void 0 ? this.fnRequire : _options$fnRequire;
                _context.next = 4;
                return readDirectory(basePath, dirPath);

              case 4:
                filesNames = _context.sent;
                filesNames = filterFiles(filter, filesNames);
                _context.next = 8;
                return loadFiles(filesNames, basePath, dirPath, fnRequire);

              case 8:
                return _context.abrupt("return", {
                  loadedFiles: filesNames.length
                });

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }], [{
    key: "Builder",
    get: function get() {
      var Builder =
      /*#__PURE__*/
      function () {
        function Builder() {
          (0, _classCallCheck2.default)(this, Builder);
        }

        (0, _createClass2.default)(Builder, [{
          key: "onDirectory",
          value: function onDirectory(basePath, dirPath) {
            this.basePath = basePath;
            this.dirPath = dirPath;
            return this;
          }
        }, {
          key: "withFilter",
          value: function withFilter(filter) {
            this.filter = filter;
            return this;
          }
        }, {
          key: "withRequirer",
          value: function withRequirer(fnRequire) {
            this.fnRequire = fnRequire;
            return this;
          }
        }, {
          key: "build",
          value: function build() {
            return new DynamicFileLoader(this);
          }
        }]);
        return Builder;
      }();

      return Builder;
    }
  }]);
  return DynamicFileLoader;
}();

function readDirectory(basePath, dirPath) {
  return new Promise(function (resolve, reject) {
    var fullPath = path.join(basePath, dirPath);
    fs.readdir(fullPath, function (err, filesNames) {
      if (err) {
        reject(err);
      } else {
        resolve(filesNames);
      }
    });
  });
}

function filterFiles(filter, filesNames) {
  if (Array.isArray(filter)) {
    //Se excluyen los archivos indicados en el array
    filesNames = filesNames.filter(function (fileName) {
      return filter.indexOf(fileName) === -1;
    });
  } else if (typeof filter == 'object' && filter.test) {
    filesNames = filesNames.filter(function (fileName) {
      return filter.test(fileName);
    });
  }

  return filesNames;
}

function loadFiles(filesNames, basePath, dirPath, fnRequire) {
  return Promise.all(filesNames.map(
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee2(fileName) {
      var absolutePath;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              absolutePath = path.join(basePath, dirPath, fileName); //Si es un directorio se omite

              if (!fs.statSync(absolutePath).isDirectory()) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return");

            case 3:
              if (!fnRequire) {
                _context2.next = 8;
                break;
              }

              _context2.next = 6;
              return fnRequire(absolutePath, dirPath, fileName);

            case 6:
              _context2.next = 9;
              break;

            case 8:
              require(absolutePath);

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }()));
}

module.exports = DynamicFileLoader;
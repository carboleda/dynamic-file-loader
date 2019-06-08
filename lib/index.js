const fs = require('fs');
const path = require('path');

class DynamicFileLoader {
    constructor(build) {
        if (arguments.length === 1 && this.validateBuild(build)) {
            this.dirPath = build.dirPath;
            this.filter = build.filter;
            this.fnRequire = build.fnRequire;
        }
    }

    validateBuild(build) {
        return (String(build.constructor) === String(DynamicFileLoader.Builder));
    }

    static get Builder() {
        class Builder {
            onDirectory(path) {
                this.dirPath = path;
                return this;
            }

            withFilter(filter) {
                this.filter = filter;
                return this;
            }

            withRequirer(fnRequire) {
                this.fnRequire = fnRequire;
                return this;
            }

            build() {
                return new DynamicFileLoader(this);
            }
        }

        return Builder;
    }

    /**
     * Function for load modules files dynamically
     * @param {Object} options
     *      @param {String} dirPath path directory where be files
     *      @param {Array|RegExp} filter list of files names to exclude or regular expresion
     *      @param {Function} fnRequire callback function to custom require (optional)
     */
    async load(options = {}) {
        let { dirPath = this.dirPath, filter = this.filter, fnRequire = this.fnRequire } = options;
        let filesNames = await readDirectory(dirPath);
        filesNames = filterFiles(filter, filesNames);
        await loadFiles(filesNames, dirPath, fnRequire);
        return {
            loadedFiles: filesNames.length
        }
    }
}

function readDirectory(dirPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, filesNames) => {
            if(err) {
                reject(err);
            } else {
                resolve(filesNames);
            }
        });
    });
}

function filterFiles(filter, filesNames) {
    if(Array.isArray(filter)) {
        //Se excluyen los archivos indicados en el array
        filesNames = filesNames.filter(fileName => filter.indexOf(fileName) === -1);
    } else if(typeof(filter) == 'object' && filter.test) {
        filesNames = filesNames.filter(fileName => filter.test(fileName));
    }
    return filesNames;
}

function loadFiles(filesNames, dirPath, fnRequire) {
    return Promise.all(filesNames.map(async (fileName) => {
        const filePath = path.join(dirPath, fileName);
        //Si es un directorio se omite
        if (fs.statSync(filePath).isDirectory()) return;

        if(fnRequire) await fnRequire(filePath);
        else require(filePath);
    }));
}

module.exports = DynamicFileLoader;
const fs = require('fs');
const path = require('path');

class DynamicFileLoader {
    constructor(build) {
        this.loadedFiles = 0;
        if (arguments.length === 1 && this.validateBuild(build)) {
            this.basePath = build.basePath;
            this.dirPath = build.dirPath;
            this.filter = build.filter;
            this.isIncludeSubdirs = build.isIncludeSubdirs;
            this.fnRequire = build.fnRequire;
        }
    }

    validateBuild(build) {
        return (String(build.constructor) === String(DynamicFileLoader.Builder));
    }

    static get Builder() {
        class Builder {
            onDirectory(basePath, dirPath) {
                this.basePath = basePath;
                this.dirPath = dirPath;
                return this;
            }

            withFilter(filter) {
                this.filter = filter;
                return this;
            }

            includeSubdirs() {
                this.isIncludeSubdirs = true;
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
        let {
            basePath = this.basePath, dirPath = this.dirPath,
            filter = this.filter, includeSubdirs = this.isIncludeSubdirs,
            fnRequire = this.fnRequire
        } = options;
        let filesNames = await readDirectory(basePath, dirPath);
        filesNames = filterFiles(filter, filesNames);
        const loadedFiles = await loadFiles(filesNames, basePath, dirPath, fnRequire);

        if (includeSubdirs === true) {
            await loadSubdirs(this, basePath, dirPath, filter,
                includeSubdirs, fnRequire, filesNames
            );
        }

        this.loadedFiles += loadedFiles;

        return {
            loadedFiles: this.loadedFiles
        }
    }
}

function loadSubdirs(dfl, basePath, dirPath, filter,
    includeSubdirs, fnRequire, filesNames
) {
    const dirs = filesNames.filter(fileName => {
        const absolutePath = path.join(basePath, dirPath, fileName);
        return fs.statSync(absolutePath).isDirectory();
    });

    if (dirs && dirs.length > 0) {
        return Promise.all(dirs.map(dirName => {
            const relativeDirname = path.join(dirPath, dirName);
            return dfl.load({
                basePath, dirPath: relativeDirname,
                filter, includeSubdirs, fnRequire
            });
        }));
    }
}

function readDirectory(basePath, dirPath) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(basePath, dirPath);
        fs.readdir(fullPath, (err, filesNames) => {
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
        filesNames = filesNames.filter(fileName => filter.indexOf(fileName) === -1);
    } else if (typeof (filter) == 'object' && filter.test) {
        filesNames = filesNames.filter(fileName => filter.test(fileName));
    }
    return filesNames;
}

async function loadFiles(filesNames, basePath, dirPath, fnRequire) {
    let loadedFiles = 0;
    await Promise.all(filesNames.map(async (fileName) => {
        const absolutePath = path.join(basePath, dirPath, fileName);
        //Si es un directorio se omite
        if (fs.statSync(absolutePath).isDirectory()) return;

        if (fnRequire) await fnRequire(absolutePath, dirPath, fileName);
        else require(absolutePath);
        loadedFiles++;
    }));
    return loadedFiles;
}

module.exports = DynamicFileLoader;
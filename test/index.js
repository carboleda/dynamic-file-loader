const chai = require('chai');
const assert = chai.assert;
const DynamicFileLoader = require('../lib');

describe('DynamicFileLoader ', function () {
    it('Check if load all files on directory ommiting subdirs', function (done) {
        new DynamicFileLoader.Builder()
            .onDirectory(__dirname, '/files')
            .build()
            .load()
            .then(result => {
                assert.equal(result.loadedFiles, 6, 'Not all files were loaded');
                done();
            })
            .catch(done);
    });

    it('Check if load files from 1 to 3', function (done) {
        new DynamicFileLoader.Builder()
            .onDirectory(__dirname, '/files')
            .withFilter(/file([1-3]).js/)
            .build()
            .load()
            .then(result => done())
            .catch(done);
    });

    it('Check if load files from 4 to 6 with custom requirer', function (done) {
        let merged = {};
        new DynamicFileLoader.Builder()
            .onDirectory(__dirname, '/files')
            .withFilter(/file([4-6]).js/)
            .withRequirer((absolutePath, dirPath, fileName) => {
                merged = { ...merged, ...require(absolutePath)() }
            })
            .build()
            .load()
            .then(result => {
                assert.equal(Object.keys(merged).length, 3, 'Files loades is not 3');
                done();
            })
            .catch(done);
    });

    it('Check if load files from 4 to 6 using option argument style', function (done) {
        let merged = {};
        new DynamicFileLoader().load({
                basePath: __dirname,
                dirPath: '/files',
                filer: /file([4-6]).js/,
                fnRequire: (absolutePath, dirPath, fileName) => {
                    merged = { ...merged, ...require(absolutePath)() }
                }
            })
            .then(result => {
                assert.equal(Object.keys(merged).length, 3, 'Files loades is not 3');
                done();
            })
            .catch(done);
    });

    it('Check if load files on subdirs using builder style', function (done) {
        new DynamicFileLoader.Builder()
            .onDirectory(__dirname, '/files')
            .includeSubdirs()
            .build()
            .load()
            .then(result => {
                assert.equal(result.loadedFiles, 9, 'Files loades is not 8');
                done();
            })
            .catch(done);
    });

    it('Check if load files on subdirs using option argument style', function (done) {
        new DynamicFileLoader().load({
                basePath: __dirname,
                dirPath: '/files',
                includeSubdirs: true
            })
            .then(result => {
                assert.equal(result.loadedFiles, 9, 'Files loades is not 8');
                done();
            })
            .catch(done);
    });
});
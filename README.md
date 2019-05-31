# **Features**
---
- Load all files in a directory dynamically
- Filter files to load using exclusion array or regular expression
- Use builder or option argument style
- Support promise or async/await

# **Examples**
---

#### Using promise to load all files on directory
```js
new DynamicFileLoader.Builder()
    .onDirectory(`${__dirname}/files`)
    .build()
    .load()
    .then(result => console.log(result.loadedFiles))
    .catch(error => console.error(error));
```

#### Using promise to load files with RegExp
```js
new DynamicFileLoader.Builder()
    .onDirectory(`${__dirname}/files`)
    .withFilter(/file([1-3]).js/)
    .build()
    .load()
    .then(result => console.log(result.loadedFiles))
    .catch(error => console.error(error));
```

#### Using async/await to load files with array exclusion and custom requirer function
```js
async function test() {
    try {
        let merged = {};
        async new DynamicFileLoader.Builder()
            .onDirectory(`${__dirname}/files`)
            .withFilter(['file1.js', 'file3.js'])
            .withRequirer(filePath => merged = { ...merged, ...require(filePath) })
            .build()
            .load();
            console.log(result.loadedFiles);
    } catch(error) {
        console.error(error);
    }
}
```

#### Using async/await and options argument
```js
async function test() {
    try {
        let merged = {};
        const options = {
            //absolute path directory where be files
            dirPath: `${__dirname}/files`,
            //list of files names to exclude or regular expression
            ommit: /file([4-6]).js/,
            //callback function to custom require (optional)
            fnRequire: filePath => merged = { ...merged, ...require(filePath) }
        };
        await new DynamicFileLoader.Builder().build().load(options);
        console.log(result.loadedFiles);
    } catch(error) {
        console.error(error);
    }
}
```
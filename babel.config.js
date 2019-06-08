const presets = [
    [
        "@babel/preset-env",
        {
            targets: {
                "node": "4"
            },
            useBuiltIns: false,
        },
        //"@babel/preset-react",
    ],
];

const plugins = [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-default-from",
    ["@babel/plugin-transform-runtime",
        {
            "regenerator": true
        }
    ],
];

module.exports = { presets, plugins };
const {override, fixBabelImports, addLessLoader, addBabelPlugin} = require('customize-cra');

module.exports = override(
    process.env.NODE_ENV === 'production' ? addBabelPlugin('transform-remove-console') : null,
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {'@primary-color': '#1DA57A'},
    }),
);

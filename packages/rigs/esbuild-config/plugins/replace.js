var fs = require('fs');
var p = require('path');

const createReplacePlugin = ({ filter, filePath }) => ({
  name: 'replace-plugin',
  setup(build) {
    build.onLoad({ filter, namespace: 'file' }, async ({ path }) => {
      const contents = fs.readFileSync(
        p.join(__dirname, '..', filePath),
        'utf8',
      );
      return { contents };
    });
  },
});

module.exports = createReplacePlugin;

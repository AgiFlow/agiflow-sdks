function readPackage(pkg, context) {
  if (pkg.dependencies && pkg.dependencies['postcss']) {
    pkg.dependencies['postcss'] = '8.4.35';
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};

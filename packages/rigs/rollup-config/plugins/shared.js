const path = require('path');

const resolveLocalModule = (name) => {
  return path.join(process.cwd(), name);
};

module.exports = {
  resolveLocalModule,
};

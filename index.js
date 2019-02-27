const applyTransform = require('./util/testUtils').applyTransform;

const transforms = [
  require(`./src/comments-to-regions`),
  require(`./src/proto-to-es5-class`),
  require(`./src/registerElement-to-define`),
  require('./src/lebab')
];

module.exports = function transformer(file, api, opts) {
  return transforms.reduce((src, t) => {
    return applyTransform(t, opts, { source: src })
  }, file.source)
};
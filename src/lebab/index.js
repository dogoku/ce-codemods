const { transform } = require('lebab');

const transforms = [
  "arrow",
  "arg-spread",
  "obj-method",
  "obj-shorthand",
  "no-strict",
  "exponent",
  "multi-var",
  "class",
  "commonjs",
  "template",
  "default-param"
];

module.exports = function({ source }) {
  const { code, warnings } = transform(source, transforms);

  if (warnings.length) {
    //eslint-disable-next-line
    console.error('LEBAB ERRORS: ' + JSON.stringify(warnings, null, 2));
  }

  return code;
};

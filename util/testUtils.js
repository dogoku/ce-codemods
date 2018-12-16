/**
 * copy of jscodeshift/testUtils with snapshots added
 * remove once https://github.com/facebook/jscodeshift/pull/297 is merged
 */

const j = require('jscodeshift');

function applyTransform(module, options, input) {
  // Handle ES6 modules using default export for the transform
  const transform = module.default ? module.default : module;

  // Jest resets the module registry after each test, so we need to always get
  // a fresh copy of jscodeshift on every test run.
  let jscodeshift = j;
  if (module.parser) {
    jscodeshift = jscodeshift.withParser(module.parser);
  }

  let output = transform(
    input,
    {
      jscodeshift,
      stats: () => {},
    },
    options || {}
  );

  // trim whitespace and normalize line endings
  output = (output || '').trim().replace(/\r\n/gmi, '\n');

  return output;
}
exports.applyTransform = applyTransform;

function runSnapshotTest(module, options, input) {
  const output = applyTransform(module, options, input);
  expect(output).toMatchSnapshot();
  return output;
}
exports.runSnapshotTest = runSnapshotTest;

function runInlineTest(module, options, input, expectedOutput) {
  const output = applyTransform(module, options, input);
  expect(output).toEqual(expectedOutput.trim());
  return output;
}
exports.runInlineTest = runInlineTest;

function defineInlineTest(module, options, input, expectedOutput, testName) {
  it(testName || 'transforms correctly', () => {
    runInlineTest(module, options, {
      source: input
    }, expectedOutput);
  });
}
exports.defineInlineTest = defineInlineTest;

function defineSnapshotTest(module, options, input, testName) {
  it(testName || 'transforms correctly', () => {
    runSnapshotTest(module, options, {
      source: input
    });
  });
}
exports.defineSnapshotTest = defineSnapshotTest;

/* global expect, describe, it */

'use strict';

const fs = require('fs');
const path = require('path');
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

  const output = transform(
    input,
    {
      jscodeshift,
      stats: () => {},
    },
    options || {}
  );

  return (output || '').trim();
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

function defineSnapshotTestsForDir(dir) {
  const mod = require(`${dir}/../`);
  const fixtureFolder = `${dir}/__fixtures__`;

  describe('snapshot tests', function() {
    fs.readdirSync(fixtureFolder)
      .filter(filename => /\.fixture\.js$/.test(filename))
      .forEach(filename => {
        const testName = filename.replace('.fixture.js', '');
        const inputPath = path.join(fixtureFolder, `${testName}.fixture.js`);
        const input = { source: fs.readFileSync(inputPath, 'utf8')};

        it(testName, () => {
          const output = runSnapshotTest(mod, {}, input);
          runInlineTest(mod, {}, { source: output }, output);
        })
      });
  });
}
exports.defineSnapshotTestsForDir = defineSnapshotTestsForDir;

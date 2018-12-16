
const fs = require('fs');
const path = require('path');
const { runSnapshotTest, runInlineTest } = require('./testUtils');

module.exports = function defineSnapshotTests(dir) {
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
          // run transform, compare to snapshot and save output
          const output = runSnapshotTest(mod, {}, input);
          // run again on output to make sure it is idempotent
          runInlineTest(mod, {}, { source: output }, output);
        });
      });
  });
}

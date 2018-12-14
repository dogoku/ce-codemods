
// const fs = require('fs');
// const path = require('path');
// const { applyTransform, defineSnapshotTest, defineInlineTest } = require('jscodeshift/dist/testUtils');

// function defineSnapshotTests(modName) {
//   const mod = require('../src/' + modName);
//   const fixtureFolder = `${__dirname}/../__testfixtures__/${modName}`;

//   describe('snapshot tests', function() {
//     fs.readdirSync(fixtureFolder)
//       .filter(filename => /\.input\.js$/.test(filename))
//       .forEach(filename => {
//         const testName = filename.replace('.input.js', '');
//         const inputPath = path.join(fixtureFolder, `${testName}.input.js`);
//         const input = fs.readFileSync(inputPath, 'utf8');
//         const output = applyTransform(mod, {}, { source: input });

//         describe(testName, () => {
//           defineSnapshotTest(mod, {}, input);
//           defineInlineTest(mod, {}, output, output,`transform is idempotent`);
//         })
//       });
//   });
// }

module.exports = require('./testUtils').defineSnapshotTestsForDir;
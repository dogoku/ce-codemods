
ce-codemods
==============================================================================

Codemods to convert from custom-elements v0 to v1

Installation
------------------------------------------------------------------------------

```bash
npm install
```

Prerequisites
------------------------------------------------------------------------------

Install [`jscodeshift`](https://github.com/facebook/jscodeshift) to run the
codemod scripts:

```bash
npm install -g jscodeshift
```

Usage
------------------------------------------------------------------------------

To run a single transform

```bash
jscodeshift -t ./src/[transform-name]/index.js path/to/files
```

To run all the transforms

```bash
jscodeshift -t ./src/index.js path/to/files
```

Writing your own codemod
------------------------------------------------------------------------------

When working a new transform, it's suggested to use [ASTExplorer](https://astexplorer.net/)
which offers the best development experience. Configure to use `jscodeshift` as the transform.

Once you are happy with the result, you can transfer it over to this repo
and follow the folder structure described below.

Using the test framework
------------------------------------------------------------------------------

This repo comes with a testing setup to help with testing multiple scenarios
using fixtures and Jest's snapshot testing.

Each transform should be placed in its own folder under `./src` and needs
to have the following folder structure:

```bash
 #transform directory
./src/transform-name
| #the jscodeshift transform
| index.js
| #Jest's default test directory
| __tests__
  | #the test entry
  | transform-name-test.js
  | #directory to place fixtures
  | __fixtures__
    | # fixture files are passed to your transform during testing
    | # each one should cover one scenario
    | scenario-one.fixture.js
    | other-scenario.fixture.js
```

In the test entry, use `./util/defineSnapshotTests` to run the fixture tests

```js
const defineSnapshotTests = require('../../../util/defineSnapshotTests');

describe('transform-name', function() {
  //run fixture tests
  defineSnapshotTests(__dirname);
  //other tests
  describe('other tests', function () {})
});
```

Each fixture file will be run against your transform twice in 

To run the tests, simply run `npm run test` or `jest`

Read Jest's documentation on [snapshots](https://jestjs.io/docs/en/snapshot-testing)

const v0Methods = {
  'attachedCallback': 'connectedCallback',
  'detachedCallback': 'disconnectedCallback'
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const src = j(file.source);

  // find all identifiers matching methods in v0Methods
  // and rename them to their v1 counterpart
  src.find(j.Identifier).filter(p => {
    return !!v0Methods[p.value.name]
  }).forEach(p => {
    p.value.name = v0Methods[p.value.name];
  }).toSource();

  // Find all `document.registerElement('...', { prototype: ... })`
  src.find(j.CallExpression, {
    callee: {
      object: { name: 'document' },
      property: { name: 'registerElement' }
    },
    arguments: [
      { type: 'Literal' },
      { properties: [{ key: { name: 'prototype' }}] }
    ]
  }).forEach(p => {
    //extract element and class name
    const elementName = p.value.arguments[0].value;
    const proto = p.value.arguments[1].properties[0].value;
    const className = proto.name ? proto.name.replace(/Proto$/,'') : proto.object.name;

    // => customElements.define(elementName, className)
    const ceDefExpr = j.callExpression(
      j.memberExpression(
        j.identifier('customElements'),
        j.identifier('define')
      ), [
        j.identifier(`'${elementName}'`),
        j.identifier(className)
      ]
    );

    // => module.exports = className
    const modExpClassExpr = j.assignmentExpression(
      '=', j.memberExpression(
        j.identifier('module'),
        j.identifier('exports')
      ), j.identifier(className)
    );

    // if parent is `module.exports = document.registerElement`
    // replace with customElement.define and module.exports = className
    if (
      j(p.parentPath).isOfType(j.AssignmentExpression) &&
      j(p.parentPath.parentPath).isOfType(j.ExpressionStatement) &&
      p.parentPath.value.left.object.name == 'module'
    ) {
      j(p.parentPath.parentPath).replaceWith([
        j.expressionStatement(ceDefExpr),
        j.expressionStatement(modExpClassExpr)
      ]);

    // if lone `document.registerElement`, just replace with `customElement.define`
    } else {
      j(p).replaceWith(ceDefExpr);
    }

    //find module.exports = protoName, replace with className
    src.find(j.AssignmentExpression, {
      left: {
        object: { name: 'module' },
        property: { name: 'exports' }
      }, right: {
        type: 'Identifier'
      }
    }).forEach(path => {
      if (proto.name && path.value.right.name === proto.name && proto.name !== className) {
         path.value.right.name = className;
      }
    });

  });

  return src.toSource();
}
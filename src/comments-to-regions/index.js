module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const src = j(file.source);
  
  //find declarations matching `var XXXX = Object.create(HTMLElement.prototype)`
  src.find(j.VariableDeclaration, {
    declarations: [{init: {
      callee: {
        object: { name: "Object" },
        property: {name: "create" }
      },
      arguments: [{
        object: { name: "HTMLElement" },
        property: { name: "prototype" }
      }]
    }}]
  }).forEach(path => {
    //extract useful parts
    const comments = path.value.comments;
    const protoName = path.value.declarations[0].id.name;
    const className = protoName.replace(/Proto$/, '');

    //create `ClassName.prototype` expression
    const protoExpr = j.memberExpression(
      j.identifier(className),
      j.identifier('prototype')
    );

    //create constructor function + copy comments
    const es5Constr = j.functionDeclaration(j.identifier(className), [], j.blockStatement([]));
    es5Constr.comments = comments;
    
    //create prototype extend `ClassName.prototype = Object.create(HTMLElement.prototype)` 
    const es5extend = j.expressionStatement(
      j.assignmentExpression('=', protoExpr, path.value.declarations[0].init)
    );

    //replace proto var declaration with constructor+extend
    j(path).replaceWith([es5Constr, es5extend])

    // replace all `ClassNameProto` identifiers with `className.prototype`
    src.find(j.Identifier, { name: protoName }).forEach(
      p => j(p).replaceWith(protoExpr)
    )
    
  })

  return src.toSource();
}
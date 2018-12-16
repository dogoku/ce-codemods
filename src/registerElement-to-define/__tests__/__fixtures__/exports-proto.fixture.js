document.registerElement('my-element', { prototype: MyElementProto });
module.exports = MyElementProto;

document.registerElement('my-element2', { prototype: MyElement2.prototype });
module.exports = MyElement2.prototype;

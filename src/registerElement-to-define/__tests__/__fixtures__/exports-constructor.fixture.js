module.exports = document.registerElement('my-element', { prototype: MyElementProto });
module.exports.STA_TIC = MyElementProto.STA_TIC;

module.exports = document.registerElement('my-element2', { prototype: MyElement2.prototype });
module.exports.STA_TIC = MyElement2.prototype.STA_TIC;
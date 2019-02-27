function helper() {
  return 'help';
}

//*************************** Custom Element API *****************************/

MyElementProto.createdCallback = function() {
  this._data = null; // ignore me
  this._onClick = this._onClick.bind(this);
  this.innerHTML = '<span>OH HAI</span>';
};

// ################ Private Methods ############

MyElementProto._onClick = function(event) {
  console.log('ORLY?')
};

// ================== Registeration of the Custom Element =================

module.exports = document.registerElement('my-element', { prototype: MyElementProto });
module.exports.STA_TIC = MyElementProto.STA_TIC;

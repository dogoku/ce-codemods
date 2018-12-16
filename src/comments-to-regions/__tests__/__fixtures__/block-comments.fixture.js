'use strict';

/**
 * A custom element
 *
 * @module my-element
 * @type {HTMLElement}
 */

function helper() {
  return 'help';
}

var dependency = require('a-dependency');

var MyElementProto = Object.create(HTMLElement.prototype);
MyElementProto.STA_TIC = 'static property';

var _inTheScope = 42;

/* **************************** Custom Element API *****************************/

MyElementProto.createdCallback = function() {
  this._data = null; /* Ignore me */
  this._onClick = this._onClick.bind(this);
  this.innerHTML = '<span>OH HAI</span>';
};

MyElementProto.attachedCallback = function() {
  this.addEventListener('click', this._onClick);
};

MyElementProto.detachedCallback = function() {
  this.removeEventListener('click', this._onClick);
  this._destroy();
};

/* =============== Public Methods =============== */

MyElementProto.getData = function() {
  return this._data;
};

MyElementProto.setData = function(data) {
  this._data = data;
};

/* ################# Private Methods #################*/

MyElementProto._onClick = function(event) {
  console.log('ORLY?')
};

/********************* Registeration of the Custom Element *********************/

module.exports = document.registerElement('my-element', { prototype: MyElementProto });
module.exports.STA_TIC = MyElementProto.STA_TIC;

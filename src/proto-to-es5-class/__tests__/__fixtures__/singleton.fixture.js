'use strict';

/**
 * @module my-analytics-service
 * @extends {HTMLElement}
 */
var myAnalyticsServiceProto = Object.create(HTMLElement.prototype);

myAnalyticsServiceProto.createdCallback = function() {
  this._init = this._init.bind(this);
  this._onAnalyticsEvent = this._onAnalyticsEvent.bind(this);
  this._ga = null;
  this._tracker = null;

  if (!window.ga) {
    console.warn('window.ga not detected. analytics service is not running');
    return;
  }

  this._ga = window.ga;
  this._ga(this._init);
};
/** ***************************** Singleton instance and fallback ******************************/

var AnalyticsService = document.registerElement('my-analytics-service', { prototype: myAnalyticsServiceProto });
var instance = document.querySelector('my-analytics-service');

if (!instance) {
  instance = new AnalyticsService();
  document.body.appendChild(instance);
}

module.exports = instance;

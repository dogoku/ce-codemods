'use strict';

var DateService = require('sgx-date-time-service');
var DeviceService = require('sgx-device-service');
var UrlUtils = require('sgx-base-code').URLUtils;
var dateFormatDefault = require('sgx-localisation-service').getTranslation('sgx-content-table.date-format');

var SgxContentTableProto = Object.create(HTMLElement.prototype);

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function processMultiline(htmlString = '') {
  return String(htmlString)
    .replace(/[&<>"'`=\/]/g, string => entityMap[string])
    .replace(/\n+/gmi, '<br>');
}

/**
 * A table component
 * @module sgx-content-table
 * @type {HTMLElement}
 */

/* #region Custom Element API */

SgxContentTableProto.createdCallback = function createdCallback() {
  this._table = document.createElement('table');
  this._table.classList.add('sgx-content-table');
  this.appendChild(this._table);

  this._removeEmptyRows = this._removeEmptyRows.bind(this);
  this._onWrapperScroll = this._onWrapperScroll.bind(this);
  this._isIe = DeviceService.isIe();
};

SgxContentTableProto.attachedCallback = function attachedCallback() {
  if (this._isIe && (this._config.stickyFirstColumn || this._config.stickyHeader)) {
    this._setupJsScrolling();
  }
};

/* #endregion */

/* #region Public Methods */

SgxContentTableProto.setData = function setData(data) {
  var thead = this._table.querySelector('thead');
  this._tbody.innerHTML = '';

  if (typeof data === 'undefined' || !data || data.length === 0) {
    if (thead) {
      thead.style.display = 'none';
    }
  } else {
    if (thead) {
      thead.style.display = '';
    }
    var rowData = (this._config.removeEmptyRows) ? data.reduce(this._removeEmptyRows, []) : data;
    rowData.forEach(row => this._tbody.appendChild(this._getRow(row)));
  }
};


SgxContentTableProto.setConfig = function setConfig(config) {
  if (typeof config === 'undefined') {
    return;
  }
  this._config = config;

  if (this._config.allowScrolling || this._config.stickyFirstColumn || this._config.stickyHeader) {
    this._wrapper = document.createElement('div');
    this._wrapper.classList.add('sgx-content-table-scroll-container');
    this.insertBefore(this._wrapper, this._table);
    this._wrapper.appendChild(this._table);
  }

  if (this._config.stickyFirstColumn && !this._isIe) {
    this._table.classList.add('sgx-content-table--sticky-first-column');
  } else {
    this._table.classList.remove('sgx-content-table--sticky-first-column');
  }

  if (this._config.stickyHeader) {
    if (!this._isIe) {
      this._table.classList.add('sgx-content-table--sticky-header');
    }

    if (this._wrapper) {
      this._wrapper.classList.add('sgx-content-table-scroll-container--fixed-height');
    }
  } else {
    this._table.classList.remove('sgx-content-table--sticky-header');

    if (this._wrapper) {
      this._wrapper.classList.remove('sgx-content-table-scroll-container--fixed-height');
    }
  }

  if (this._config.equalColumnWidth) {
    this._table.classList.add('sgx-content-table--equal-column-width');
  } else {
    this._table.classList.remove('sgx-content-table--equal-column-width');
  }

  if (!this._config.hideHeader) {
    var thead = document.createElement('thead');
    thead.appendChild(this._getHeaderRow());
    this._table.appendChild(thead);
    this._table.classList.remove('sgx-content-table--no-header');
  } else {
    this._table.classList.add('sgx-content-table--no-header');
  }

  this._tbody = document.createElement('tbody');
  this._table.appendChild(this._tbody);
};

/* #endregion */

/* #region Private Methods */

SgxContentTableProto._getRow = function _getRow(data) {
  var tr = document.createElement('tr');
  var allColumnConf = this._config.columns;
  data.forEach((cell, i) => {
    var columnConf = allColumnConf[i];
    var cellData = this._getCellData(cell);
    var cellType = (columnConf && columnConf.type) || (cell && cell.type ? cell.type : null) || 'text';
    var cellTag = columnConf && columnConf.isColumnHeader ? 'th' : 'td';
    var opts = {
      format: columnConf && columnConf.format,
      cssClass: columnConf && columnConf.cssClass
    };
    tr.appendChild(this._getCell(cellData, cellType, cellTag, opts));
  });
  return tr;
};

SgxContentTableProto._getHeaderRow = function _getHeaderRow() {
  var tr = document.createElement('tr');
  this._config.columns.forEach(({cssClass, width, label} = {}) =>
    tr.appendChild(this._getCell(label, 'text', 'th', { cssClass, width })));
  return tr;
};

SgxContentTableProto._getCell = function _getCell(data, type, tag, { cssClass, width, format } = {}) {
  var cell = document.createElement(tag);
  if (cssClass) {
    cell.classList.add(cssClass);
  }
  if (width && tag === 'th') {
    cell.style.cssText = 'width: ' + width + ';';
  }
  switch (type) {
    case 'date':
      var dateFormat = format ? format : dateFormatDefault;
      cell.textContent = data ? DateService.utc(data).tz('Asia/Singapore').format(dateFormat) : '-';
      break;
    case 'link':
      var url = data && data.href && data.href.url;
      if (url) {
        var target = UrlUtils.isExternalUrl(url) ? ' target="_blank"' : '';
        cell.innerHTML = `<a href="${ url }" class="website-link website-link--alt"${ target }>${ (data.title || url) }</a>`;
      }
      break;
    case 'html':
      cell.innerHTML = data || '';
      break;
    case 'text-multiline':
      cell.innerHTML = processMultiline(data);
      break;
    case 'text':
    default:
      cell.textContent = data || '';
  }
  return cell;
};

SgxContentTableProto._removeEmptyRows = function _removeEmptyRows(arr, row) {
  var rowLength = row.length;
  for (var k = this._config.emptyRowOffset || 0; k < rowLength; k++) {
    var cell = row[k];
    var cellData = this._getCellData(cell);
    // If some data has been found in the row, add it to the final table data and break the loop
    if (cellData) {
      arr.push(row);
      break;
    }
  }
  return arr;
};

SgxContentTableProto._getCellData = function _getCellData(cell) {
  return cell && cell.type && cell.type !== 'link' ? cell.value : cell;
};

SgxContentTableProto._setupJsScrolling = function _setupJsScrolling() {
  this._rows = this._table.querySelectorAll('tr');
  this._wrapper.addEventListener('scroll', this._onWrapperScroll);
  this.appendChild(this._wrapper);

  this._setCellDimensions();

  if (this._config.stickyFirstColumn) {
    this._initJsStickyColumn();
  }

  if (this._config.stickyHeader) {
    this._initJsStickyHeader();
  }
};

SgxContentTableProto._onWrapperScroll = function _onWrapperScroll(ev) {
  if (this._fixedColumnBody) {
    this._fixedColumnBody.style.transform = 'translateY(' + (-(this._wrapper.scrollTop)) + 'px)';
  }

  if (this._fixedColumnHeaderTable) {
    this._fixedColumnHeaderTable.style.transform = 'translateX(' + (-(this._wrapper.scrollLeft)) + 'px)';
  }
};

SgxContentTableProto._setCellDimensions = function _setCellDimensions() {
  var rowLength = this._rows.length;

  for (var i = 0; i < rowLength; i++) {
    var cells = this._rows[i].childNodes;
    var cellLength = cells.length;
    if (cellLength > 0) {
      var cellHeight = cells[0].offsetHeight + 1;
      for (var j = 0; j < cellLength; j++) {
        var cell = cells[j];
        cell.style.height = cellHeight + 'px';
        cell.style.width = cell.offsetWidth + 'px';
      }
    }
  }
};

SgxContentTableProto._initJsStickyColumn = function _initJsStickyColumn() {
  var clonedTable = this._table.cloneNode(true);
  var fixedColumnRows = clonedTable.querySelectorAll('tr');
  var fixedColumnRowLen = fixedColumnRows.length;

  // Loops through all the rows and remove all but the first cell
  for (var i = 0; i < fixedColumnRowLen; i++) {
    var row = fixedColumnRows[i];
    var cells = row.childNodes;

    if (cells.length > 0) {
      var firstCell = cells[0];
      var nextCell = firstCell.nextSibling;
      while (nextCell) {
        row.removeChild(nextCell);
        nextCell = firstCell.nextSibling;
      }
    }
  }

  this._fixedColumnContainer = document.createElement('div');
  this._fixedColumnContainer.classList.add('sgx-content-table-fixed-column');
  this._fixedColumnContainer.style.height =
    (this._wrapper.offsetHeight - (this._wrapper.offsetHeight - this._wrapper.clientHeight)) + 'px';

  // Header needs to be separated if it also needs to be sticky
  if (this._config.stickyHeader) {
    var thead = clonedTable.querySelector('thead');
    if (thead) {
      var fixedColumnHeader = document.createElement('div');
      fixedColumnHeader.classList.add('sgx-content-table-fixed-column-header');
      var fixedColumnHeaderTable = document.createElement('table');
      fixedColumnHeaderTable.classList.add('sgx-content-table');
      fixedColumnHeaderTable.classList.add('sgx-content-table-fixed-column-header');
      fixedColumnHeaderTable.appendChild(thead);
      fixedColumnHeader.appendChild(fixedColumnHeaderTable);
      this._fixedColumnContainer.appendChild(fixedColumnHeader);
    }
  }

  this._fixedColumnBody = document.createElement('div');
  this._fixedColumnBody.classList.add('sgx-content-table-fixed-column-body');
  this._fixedColumnBody.appendChild(clonedTable);
  this._fixedColumnContainer.appendChild(this._fixedColumnBody);

  this.insertBefore(this._fixedColumnContainer, this.firstChild);
};

SgxContentTableProto._initJsStickyHeader = function _initJsStickyHeader() {
  var thead = this._table.querySelector('thead');

  if (thead) {
    this.style.height = this.offsetHeight + 'px';
    this._wrapper.style.height = (this.offsetHeight - thead.offsetHeight) + 'px';

    this._fixedColumnHeaderTable = document.createElement('table');
    this._fixedColumnHeaderTable.classList.add('sgx-content-table');
    this._fixedColumnHeaderTable.classList.add('sgx-content-table--equal-column-width');
    this._fixedColumnHeaderTable.appendChild(thead);

    this._fixedColumnHeader = document.createElement('div');
    this._fixedColumnHeader.classList.add('sgx-content-table-fixed-column-header');
    this._fixedColumnHeader.appendChild(this._fixedColumnHeaderTable);
    this.insertBefore(this._fixedColumnHeader, this.firstChild);
  }
};

/* #endregion */

/* #region Registration of the Element */

module.exports = document.registerElement('sgx-content-table', { prototype: SgxContentTableProto });

/* #endregion */
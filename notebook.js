function Notebook(tag) {
  this.tag = tag;
  this.notes = [];
}
Notebook.prototype = {
  getNote: function(i) {
    return this.notes[i];
  }
  save: function() {
    localStorage[this.tag] = JSON.stringify(this.notes);
  }
  load: function() {
    var data = localStorage[this.tag];
    if (data) {
      macros = JSON.parse(data);
    } else {
      macros = default_macrodb;
    }
  }
  importData: function() {
    var data = prompt('Paste Library Here', '');
    try {
      var list = JSON.parse(data);
      if (this.validateData(list)) {
        this.notes = list;
        $('#notebook-search').trigger('keyup');
      } else {
        alert('Imported library was invalid.');
      }
    } catch(e) {
      alert('Failed to parse JSON.');
    }
  }
  exportData: function() {
    prompt('Copy Library', JSON.stringify(macros));
  }
  validateData: function(list) {
    if (!(list instanceof Array)) {
      return false;
    }
    for (var i = 0; i < list.length; i++) {
      if (!list[i].hasOwnProperty('title') || !list[i].hasOwnProperty('body')) {
        return false;
      }
    }
    return true;
  }
}
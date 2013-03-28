var mouse = {
  target: null,
  position: {
    x: 0,
    y: 0
  }
}

function mouseMove(event) {
  if (mouse.target) {
    var dialog = mouse.target.parent();
    var xchange = event.pageX - mouse.position.x;
    var ychange = event.pageY - mouse.position.y;
    if (mouse.target.is('h3.unselectable')) {
      var xoffset = parseInt(dialog.css('left'));
      var yoffset = parseInt(dialog.css('top'));
      dialog.css('left', (xoffset + xchange) + "px");
      dialog.css('top', (yoffset + ychange) + "px");
    } else if (mouse.target.is('div.resizer')) {
      var body = dialog.children('.dialog-body');
      var xsize = parseInt(body.css('width'));
      var ysize = parseInt(body.css('height'));
      if (xchange < 0 || event.pageX >= mouse.target.offset().left) {
        body.css('width', Math.max(xsize + xchange, 500) + "px");
        dialog.find('#notebook-editor').css('width', (Math.max(xsize + xchange, 500) - 220) + "px");
      }
      if (ychange < 0 || event.pageY >= mouse.target.offset().top) {
        body.css('height', Math.max(ysize + ychange, 280) + "px");
      }
    }
    mouse.position.x = event.pageX;
    mouse.position.y = event.pageY;
  }
}

function mouseUp(event) {
  mouse.target = null;
}

function mouseDown(event) {
  mouse.target = $(this);
  mouse.position.x = event.x;
  mouse.position.y = event.y;
}

function createNotebookButton() {
  var notebook_button = $(document.createElement('button'))
    .attr('id', 'notebook-button')
    .attr('tabindex', '8')
    .attr('type', 'button')
    .html('Notebook')
    .click(openNoteSelector);
  return notebook_button;
}

function openLibraryDialog() {
  $('body').append(createLibraryDialog());
}

function closeLibraryDialog() {
  $('#library-dialog').remove();
}

function saveLibrary() {
  importNotebook($('#library-data').val());
  closeLibraryDialog();
}

function createLibraryDialog() {
  var header = $(document.createElement('h3'))
    .css('cursor', 'move')
    .addClass('unselectable')
    .append('Note Library')
    .append($(document.createElement('button'))
      .addClass('close')
      .html('Close')
      .click(closeLibraryDialog))
    .mousedown(mouseDown)
  var body = $(document.createElement('div'))
    .addClass('dialog-body')
    .append($(document.createElement('textarea'))
      .attr('id', 'library-data')
      .val(JSON.stringify(notes)))
    .append($(document.createElement('button'))
      .addClass('notebook-button library-save')
      .html('Save Library')
      .click(saveLibrary))
  var notebook_dialog = $(document.createElement('div'))
    .attr('id', 'library-dialog')
    .addClass('dialog with-header')
    .append(header)
    .append(body)
    .append($(document.createElement('div'))
      .addClass('resizer bottom-right')
      .mousedown(mouseDown));
  return notebook_dialog;
}

function openNoteSelector() {
  loadNotebook();
  var dialog = createNotebookDialog();
  $('body').append(dialog);
  $('#notebook-search').trigger('keyup');
}

function closeNoteSelector() {
  $('#notebook-dialog').remove();
  saveNotebook();
}

function createNotebookDialog() {
  var header = $(document.createElement('h3'))
    .css('cursor', 'move')
    .addClass('unselectable')
    .append('Insert a Note')
    .append($(document.createElement('button'))
      .addClass('close')
      .html('Close')
      .click(closeNoteSelector))
    .mousedown(mouseDown)
  var chooser = $(document.createElement('div'))
    .attr('id', 'notebook-chooser')
    .append($(document.createElement('input'))
      .attr('id', 'notebook-search')
      .attr('type', 'text')
      .attr('placeholder', 'Search')
      .keyup(updateNotebook))
    .append($(document.createElement('ul'))
      .attr('id', 'notebook-list'))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-library')
      .html('Note Library')
      .click(openLibraryDialog))
  var editor = $(document.createElement('div'))
    .attr('id', 'notebook-editor')
    .append($(document.createElement('input'))
      .attr('id', 'notebook-title')
      .attr('type', 'text')
      .attr('placeholder', 'Title')
      .keyup(saveNote))
    .append($(document.createElement('br')))
    .append($(document.createElement('textarea'))
      .attr('id', 'notebook-body')
      .keyup(saveNote))
    .append($(document.createElement('br')))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-new')
      .html('New')
      .click(newNote))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-delete')
      .html('Delete')
      .click(deleteNote))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-insert')
      .html('Insert')
      .click(insertNote))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-insert')
      .html('Q. Insert')
      .click(qinsertNote))
  var body = $(document.createElement('div'))
    .addClass('dialog-body')
    .append(chooser)
    .append(editor);
  var notebook_dialog = $(document.createElement('div'))
    .attr('id', 'notebook-dialog')
    .addClass('dialog with-header')
    .append(header)
    .append(body)
    .append($(document.createElement('div'))
      .addClass('resizer bottom-right')
      .mousedown(mouseDown));
  return notebook_dialog;
}

$.fn.extend({
  insertAtCaret: function(myValue){
    return this.each(function(i) {
      if (document.selection) {
        //For browsers like Internet Explorer
        this.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        this.focus();
      } else if (this.selectionStart || this.selectionStart == '0') {
        //For browsers like Firefox and Webkit based
        var startPos = this.selectionStart;
        var endPos = this.selectionEnd;
        var scrollTop = this.scrollTop;
        this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
        this.focus();
        this.selectionStart = startPos + myValue.length;
        this.selectionEnd = startPos + myValue.length;
        this.scrollTop = scrollTop;
      } else {
        this.value += myValue;
        this.focus();
      }
    });
  },
  
  fireEvent: function (event) {
    return this.each(function(i) {
      if (document.createEventObject) {
        var evt = document.createEventObject();
        return this.fireEvent("on" + event, evt);
      } else {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true);
        return !this.dispatchEvent(evt);
      }
    });
  }
});

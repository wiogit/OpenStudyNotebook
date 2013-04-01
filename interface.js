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
    .click(openNotebookDialog);
  return notebook_button;
}

function createListItem(id, title) {
  return $(document.createElement('li'))
    .attr('data-note-id', id)
    .html(title)
    .click(selectNote);
}

function createCustomButton(html, onclick, right) {
  var button = $(document.createElement('button'))
    .addClass('custom-button')
    .html(html)
    .click(onclick);
  if (right) {
    button.addClass('rbutton');
  }
  return button;
}

function createCustomInput(id, placeholder, onkeyup) {
  var input = $(document.createElement('input'))
    .attr('id', id)
    .attr('type', 'text')
    .attr('placeholder', placeholder)
    .keyup(onkeyup)
  return input;
}

function createCustomHeader(title, onclose) {
  var header = $(document.createElement('h3'))
    .css('cursor', 'move')
    .addClass('unselectable')
    .append(title)
    .append($(document.createElement('button'))
      .addClass('close')
      .html('Close')
      .click(onclose))
    .mousedown(mouseDown)
  return header;
}

function openLibraryDialog() {
  $('body').append(createLibraryDialog());
}

function closeLibraryDialog() {
  $('#library-dialog').remove();
}

function saveLibrary() {
  importNotebook($('#library-data').val());
  notebook_changed = true;
  closeLibraryDialog();
}

function createLibraryDialog() {
  var title = 'Note Library (' + notes.length + ' Notes)';
  var header = createCustomHeader(title, closeLibraryDialog);
  var body = $(document.createElement('div'))
    .addClass('dialog-body')
    .append($(document.createElement('textarea'))
      .attr('id', 'library-data')
      .val(JSON.stringify(notes)))
    .append(createCustomButton('Save Library', saveLibrary, false))
  var library_dialog = $(document.createElement('div'))
    .attr('id', 'library-dialog')
    .addClass('custom-dialog dialog with-header')
    .append(header)
    .append(body)
    .append($(document.createElement('div'))
      .addClass('resizer bottom-right')
      .mousedown(mouseDown));
  return library_dialog;
}

function openNotebookDialog() {
  loadNotebook();
  var dialog = createNotebookDialog();
  $('body').append(dialog);
  $('#notebook-search').trigger('keyup');
}

function closeNotebookDialog() {
  $('#notebook-dialog').remove();
  if (notebook_changed) {
    saveNotebook();
    notebook_changed = false;
  }
}

function updateNotebook() {
  var filter = $(this).val().toLowerCase();
  if (!notebook_sorted) {
    notes.sort(compareNote);
    notebook_sorted = true;
  }
  $('ul#notebook-list').children().remove();
  for (var i = 0; i < notes.length; i++) {
    if (matchingNote(notes[i], filter)) {
      $('ul#notebook-list').append(createListItem(i, notes[i].title));
    }
  }
  $('ul#notebook-list :first-child').trigger('click');
}

function selectNote() {
  $('ul#notebook-list li').removeClass('note-selected');
  $(this).addClass('note-selected');
  var id = parseInt($(this).attr('data-note-id'), 10);
  $('#notebook-title').val(notes[id].title);
  $('#notebook-body').val(notes[id].body).scrollTop(0);
}

function newNote() {
  var id = createNote('Unnamed Note', '');
  notebook_sorted = false;
  notebook_changed = true;
  var listitem = createListItem(id, notes[id].title);
  $('ul#notebook-list').append(listitem);
  listitem.trigger('click');
}

function deleteNote() {
  var item = $('ul#notebook-list .note-selected');
  if (item.length > 0) {
    var id = item.attr('data-note-id');
    notes.splice(id, 1);
    saveNotebook();
    $('#notebook-search').trigger('keyup');
  }
}

function saveNoteTitle() {
  var item = $('ul#notebook-list .note-selected');
  if (item.length > 0) {
    var id = item.attr('data-note-id');
    notes[id].title = $('#notebook-title').val().trim();
    notebook_sorted = false;
    notebook_changed = true;
    $('ul#notebook-list .note-selected').html($('#notebook-title').val());
  }
}

function saveNoteBody() {
  var item = $('ul#notebook-list .note-selected');
  if (item.length > 0) {
    var id = item.attr('data-note-id');
    notes[id].body = $('#notebook-body').val();
    notebook_changed = true;
  }
}

function insertNote() {
  var body = variableReplace($('#notebook-body').val(), false);
  closeNotebookDialog();
  $('textarea#reply-body').insertAtCaret(body).fireEvent('keyup');
}

function qInsertNote() {
  var body = variableReplace($('#notebook-body').val(), true);
  closeNotebookDialog();
  $('textarea#reply-body').insertAtCaret(body).fireEvent('keyup');
}

function createNotebookDialog() {
  var header = createCustomHeader('Insert a Note', closeNotebookDialog);
  var chooser = $(document.createElement('div'))
    .attr('id', 'notebook-chooser')
    .append(createCustomInput('notebook-search', 'Search', updateNotebook))
    .append($(document.createElement('ul'))
      .attr('id', 'notebook-list'))
    .append(createCustomButton('Note Library', openLibraryDialog, false))
  var editor = $(document.createElement('div'))
    .attr('id', 'notebook-editor')
    .append(createCustomInput('notebook-title', 'Title', saveNoteTitle))
    .append($(document.createElement('br')))
    .append($(document.createElement('textarea'))
      .attr('id', 'notebook-body')
      .keyup(saveNoteBody))
    .append($(document.createElement('br')))
    .append(createCustomButton('New', newNote, false))
    .append(createCustomButton('Delete', deleteNote, false))
    .append(createCustomButton('Insert', insertNote, true))
    .append(createCustomButton('Q. Insert', qInsertNote, true))
  var body = $(document.createElement('div'))
    .addClass('dialog-body')
    .append(chooser)
    .append(editor);
  var notebook_dialog = $(document.createElement('div'))
    .attr('id', 'notebook-dialog')
    .addClass('custom-dialog dialog with-header')
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

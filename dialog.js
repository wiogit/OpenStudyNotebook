function createNotbookButton() {
  var notebook_button = $(document.createElement('button'))
    .attr('id', 'notebook-button')
    .attr('tabindex', '8')
    .attr('type', 'button')
    .html('Notebook')
    .click(openNoteSelector);
  return notebook_button;
}

var mouse = {
  pressed: false,
  position: {
    x: 0,
    y: 0
  }
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
    .mousedown(event, function() {
      mouse.pressed = true;
      mouse.position.x = event.x;
      mouse.position.y = event.y;
    })
    .mouseup(function() {
      mouse.pressed = false;
    })
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
      .addClass('notebook-button notebook-import')
      .html('Import Notebook')
      .click(importNotebook))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-export')
      .html('Export Notebook')
      .click(exportNotebook))
  var editor = $(document.createElement('div'))
    .attr('id', 'notebook-editor')
    .append($(document.createElement('input'))
      .attr('id', 'notebook-title')
      .attr('type', 'text')
      .attr('placeholder', 'Title'))
    .append($(document.createElement('br')))
    .append($(document.createElement('textarea'))
      .attr('id', 'notebook-body'))
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
      .addClass('notebook-button notebook-save')
      .html('Save')
      .click(saveNote))
    .append($(document.createElement('button'))
      .addClass('notebook-button notebook-insert')
      .html('Insert')
      .click(insertNote))
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
      .addClass('resizer bottom-right'));
  return notebook_dialog;
}
var notes;
var dbtag = 'notebookdb';
var defaultdb = [
  {
    title: 'Welcome', 
    body: 'Thank you for using the OpenStudy Notebook extension.'
  }
];
var var_regex = /\(\?(.+?)\)/m;
var esc_regex = /\(\\(\\*)\?/;

$(document).ready(function() {
  setInterval(checkForButton, 500);
  $('body').mouseup(mouseUp);
  $('body').mousemove(mouseMove);
});

function checkForButton() {
  var element = $('.toolbar .draw');
  if (element.length > 0) {
    if ($('#notebook-button').length == 0) {
      element.after(createNotebookButton());
    }
  } else if ($('#notebook-dialog').length > 0) {
    closeNoteSelector();
  }
}

function updateNotebook() {
  var filter = $(this).val().toLowerCase();
  $('ul#notebook-list').children().remove();
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].title.toLowerCase().search(filter) != -1 
        || notes[i].body.toLowerCase().search(filter) != -1) {
      var listitem = $(document.createElement('li'))
        .attr('data-note-id', i)
        .html(notes[i].title);
      $('ul#notebook-list').append(listitem);
    }
  }
  $('ul#notebook-list li').click(selectNote);
  $('ul#notebook-list :first-child').trigger('click');
}

function selectNote() {
  $('ul#notebook-list li').removeClass('note-selected');
  $(this).addClass('note-selected');
  var id = parseInt($(this).attr('data-note-id'), 10);
  $('#notebook-title').val(notes[id].title);
  $('#notebook-body').val(notes[id].body);
}

function newNote() {
  var id = notes.length;
  notes.push({
    title: 'Unnamed Note',
    body: ''
  });
  var listitem = $(document.createElement('li'))
    .attr('data-note-id', id)
    .html(notes[id].title)
    .click(selectNote);
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

function saveNote() {
  var item = $('ul#notebook-list .note-selected');
  if (item.length > 0) {
    var id = item.attr('data-note-id');
    notes[id] = {
      title: $('#notebook-title').val(),
      body: $('#notebook-body').val()
    }
    notes.sort(compareNote);
    $('ul#notebook-list .note-selected').html($('#notebook-title').val());
  }
}

function insertNote() {
  var body = variableReplace($('#notebook-body').val(), false);
  closeNoteSelector();
  $('textarea#reply-body').insertAtCaret(body).fireEvent('keyup');
}

function qinsertNote() {
  var body = variableReplace($('#notebook-body').val(), true);
  closeNoteSelector();
  $('textarea#reply-body').insertAtCaret(body).fireEvent('keyup');
}

function variableReplace(text, noprompt) {
    console.log('text: ' + text);
    var variables = {};
    var value = '';
    var match = var_regex.exec(text);
    while (match) {
      if (!variables[match[1]]) {
        variables[match[1]] = (noprompt) ? match[1] : prompt(match[1]);
      }
      text = text.replace(var_regex, variables[match[1]]);
      match = var_regex.exec(text);
    }
    text = text.replace(esc_regex, '($1?');
    return text;
}


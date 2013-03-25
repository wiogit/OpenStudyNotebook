var macros;

$(document).ready(function() {
  setInterval(checkForButton, 500);
});

function checkForButton() {
  var element = $('.toolbar .draw');
  if (element.length > 0) {
    if ($('#notebook-button').length == 0) {
      element.after(createNotbookButton());
    }
  }
}

function closeNoteSelector() {
  console.log('note selector closed');
  $('#notebook-dialog').remove();
  saveNotebook();
}

function openNoteSelector() {
  console.log('note selector opened');
  loadNotebook();
  var dialog = createNotebookDialog();
  $('body').append(dialog);
  console.log(dialog);
  $('#notebook-search').trigger('keyup');
}

function updateNotebook() {
  console.log('Updating notebook');
  console.log(macros);
  var filter = $(this).val().toLowerCase();
  $('ul#notebook-list').children().remove();
  for (var i = 0; i < macros.length; i++) {
    if (macros[i].title.toLowerCase().search(filter) != -1 
        || macros[i].body.toLowerCase().search(filter) != -1) {
      var listitem = $(document.createElement('li'))
        .attr('data-note-id', i)
        .html(macros[i].title);
      console.log(listitem);
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
  $('#notebook-title').val(macros[id].title);
  $('#notebook-body').val(macros[id].body);
}

function newNote() {
  var id = macros.length;
  macros.push({
    title: 'Unnamed Note',
    body: ''
  });
  var listitem = $(document.createElement('li'))
    .attr('data-note-id', id)
    .html(macros[id].title)
    .click(selectNote);
  console.log(listitem);
  $('ul#notebook-list').append(listitem);
  listitem.trigger('click');
}

function deleteNote() {
  var item = $('ul#notebook-list .note-selected');
  if (item.length > 0) {
    var id = item.attr('data-note-id');
    macros.splice(id, 1);
    saveNotebook();
    $('#notebook-search').trigger('keyup');
  }
}

function saveNote() {
  var item = $('ul#notebook-list .note-selected');
  if (item.length > 0) {
    var id = item.attr('data-note-id');
    macros[id] = {
      title: $('#notebook-title').val(),
      body: $('#notebook-body').val()
    }
    saveNotebook();
    $('ul#notebook-list .note-selected').html($('#notebook-title').val());
  }
}

function insertNote() {
  var body = $('#notebook-body').val();
  closeNoteSelector();
  $('textarea#reply-body').focus().trigger('keydown');
  $('textarea#reply-body').insertAtCaret(body);
  $('textarea#reply-body').trigger('keyup').blur(); // hack to get rid of placeholder
}

function saveNotebook() {
  localStorage['macrodb'] = JSON.stringify(macros);
}

function loadNotebook() {
  var data = localStorage['macrodb'];
  if (data) {
    macros = JSON.parse(data);
  } else {
    macros = default_macrodb;
  }
}

function importNotebook() {
  var data = prompt('Paste Library Here', '');
  try {
    var list = JSON.parse(data);
    if (validNotebook(list)) {
      macros = list;
      $('#notebook-search').trigger('keyup');
    } else {
      alert('Imported library was invalid.');
    }
  } catch(e) {
    alert('Failed to parse JSON.');
  }
}

function validNotebook(list) {
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

function exportNotebook() {
  prompt('Copy Library', JSON.stringify(macros));
}

jQuery.fn.extend({
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
    })
  }
});

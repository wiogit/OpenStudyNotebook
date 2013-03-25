var notes;
var dbtag = 'notebookdb';
var defaultdb = [
  {
    title: 'Welcome', 
    body: 'Thank you for using the openstudy notebook extension.'
  }
];

$(document).ready(function() {
  setInterval(checkForButton, 500);
  $('body').mouseup(event, function() {
    mouse.move = false;
    mouse.resize = false;
  });
  $('body').mousemove(event, function() {
    if (mouse.move) {
      var xchange = event.x - mouse.position.x;
      var ychange = event.y - mouse.position.y;
      var xoffset = parseInt($('#notebook-dialog').css('left'));
      var yoffset = parseInt($('#notebook-dialog').css('top'));
      $('#notebook-dialog').css('left', (xoffset + xchange) + "px");
      $('#notebook-dialog').css('top', (yoffset + ychange) + "px");
      mouse.position.x = event.x;
      mouse.position.y = event.y;
    } else if (mouse.resize) {
      var xchange = event.x - mouse.position.x;
      var ychange = event.y - mouse.position.y;
      var xsize = parseInt($('#notebook-dialog.dialog .dialog-body').css('width'));
      var ysize = parseInt($('#notebook-dialog.dialog .dialog-body').css('height'));
      if (xchange < 0 || event.pageX >= $('#notebook-dialog.dialog .resizer').offset().left) {
        $('#notebook-dialog.dialog .dialog-body').css('width', Math.max(xsize + xchange, 500) + "px");
      }
      if (ychange < 0 || event.pageY >= $('#notebook-dialog.dialog .resizer').offset().top) {
        $('#notebook-dialog.dialog .dialog-body').css('height', Math.max(ysize + ychange, 280) + "px");
      }
      mouse.position.x = event.x;
      mouse.position.y = event.y;
    }
  });
});

function checkForButton() {
  var element = $('.toolbar .draw');
  if (element.length > 0) {
    if ($('#notebook-button').length == 0) {
      element.after(createNotbookButton());
    }
  } else if ($('#notebook-dialog').length > 0) {
    closeNoteSelector();
  }
}

function closeNoteSelector() {
  $('#notebook-dialog').remove();
  saveNotebook();
}

function openNoteSelector() {
  loadNotebook();
  var dialog = createNotebookDialog();
  $('body').append(dialog);
  $('#notebook-search').trigger('keyup');
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
    saveNotebook();
    $('ul#notebook-list .note-selected').html($('#notebook-title').val());
  }
}

function insertNote() {
  var body = $('#notebook-body').val();
  closeNoteSelector();
  $('textarea#reply-body').insertAtCaret(body).fireEvent('keyup');
}

function saveNotebook() {
  localStorage[dbtag] = JSON.stringify(notes);
}

function loadNotebook() {
  var data = localStorage[dbtag];
  if (data) {
    notes = JSON.parse(data);
  } else {
    notes = defaultdb;
  }
}

function importNotebook() {
  var data = prompt('Paste Library Here', '');
  try {
    var list = JSON.parse(data);
    if (validNotebook(list)) {
      notes = list;
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
  prompt('Copy Library', JSON.stringify(notes));
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

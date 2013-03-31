var notes;
var notebook_sorted = false;
var notebook_changed = false;
var dbtag = 'notebookdb';
var defaultdb = [
  {
    title: 'Welcome', 
    body: 'Thank you for using the OpenStudy Notebook extension.'
  }
];

function createNote(title, body) {
  notes.push({
    title: title,
    body: body
  });
  return notes.length - 1;
}

function saveNotebook() {
  localStorage[dbtag] = JSON.stringify(notes);
}

function loadNotebook() {
  var data = localStorage[dbtag];
  if (data) {
    notes = JSON.parse(data).sort(compareNote);
  } else {
    notes = defaultdb;
  }
}

function importNotebook(data) {
  try {
    var list = JSON.parse(data);
    if (validNotebook(list)) {
      notes = list;
      notebook_sorted = false;
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

function compareNote(note1, note2) {
  return note1.title.localeCompare(note2.title);
}

function matchingNote(note, data) {
  if (note.title.toLowerCase().search(data) != -1) {
    return true;
  }
  if (note.body.toLowerCase().search(data) != -1) {
    return true;
  }
  return false;
}

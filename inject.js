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


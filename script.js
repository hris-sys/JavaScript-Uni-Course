let notes = [];
let ids = 0;
let hasImported = false;
function updateNotes() {
  while (true) {
    let child = document.getElementById("container-notes").children[0];
    if (!child) {
      break;
    }
    child.remove();
  }

  for (let index = 0; index < notes.length; index++) {
    const element = notes[index];
    if (index === 0 || index % 3 === 0) {
      document.getElementById("container-notes").appendChild(newRow());
    }
    displayNewNote(
      createNote(element.noteTitle, element.noteContent, element.id)
    );
  }
}
function newRow() {
  let newRow = document.createElement("div");
  newRow.className = "row mx-auto";
  return newRow;
}

function validateInputs(event, command) {
  let noteTitle = event.path[1].children[1].children[0].value;
  let noteContent = event.path[1].children[1].children[1].value;
  let fieldFail = event.path[1].children[3];
  let fieldSuccess = event.path[1].children[4];

  let validNote = false;

  if (!noteTitle || !noteContent) {
    fieldFail.style.display = "block";
    fieldSuccess.style.display = "none";
  } else {
    fieldFail.style.display = "none";
    fieldSuccess.style.display = "block";
    validNote = true;
  }

  if (validNote) {
    switch (command) {
      case "create":
        if (validNote) {
          event.path[1].children[1].children[0].value = "";
          event.path[1].children[1].children[1].value = "";
          pushNewNote({
            noteTitle: noteTitle,
            noteContent: noteContent,
            id: ids,
          });
          updateNotes();
          ids++;
        }
        break;
      case "edit":
        editNote(event);
      default:
        break;
    }
  }
}

function editNote(event) {
  //get needed div and note ID
  let editDiv = document.getElementById("editDiv");
  let noteId = parseInt(document.getElementById("note-id-edit").textContent);

  //get new titles which are validated
  let newEditTitleNote = editDiv.children[1].children[0].value;
  let newEditContentNote = editDiv.children[1].children[1].value;

  //change the note in the array
  for (let index = 0; index < notes.length; index++) {
    const note = notes[index];
    if (note.id === noteId) {
      note.noteTitle = newEditTitleNote;
      note.noteContent = newEditContentNote;
      break;
    }
  }
  editDiv.children[1].children[0].value = "";
  editDiv.children[1].children[1].value = "";

  //set the fields to disabled once a valid note is given
  editDiv.children[2].setAttribute("disabled", "");
  editDiv.children[1].children[0].setAttribute("disabled", "");
  editDiv.children[1].children[1].setAttribute("disabled", "");

  updateNotes();
}

function moveToEdit(event) {
  //get stuff
  let noteId = parseInt(event.path[2].id);
  let noteTitle = event.path[1].children[0].innerText;
  let noteContent = event.path[1].children[1].innerText;

  //fix disables
  let editDiv = document.getElementById("editDiv");
  editDiv.children[2].removeAttribute("disabled");
  editDiv.children[1].children[0].removeAttribute("disabled");
  editDiv.children[1].children[1].removeAttribute("disabled");

  //set the title and content from event
  let editTitleField = document.getElementById("note-title-edit");
  let editContentField = document.getElementById("note-content-edit");
  let editNoteId = document.getElementById("note-id-edit");

  editTitleField.setAttribute("placeholder", noteTitle);
  editContentField.setAttribute("placeholder", noteContent);
  editNoteId.innerHTML = noteId;
}

function createNote(inputNoteTitle, inputNoteContent, id) {
  let cardContainer = document.createElement("div");
  cardContainer.className = "card col-sm-3 mx-auto";
  cardContainer.id = id;

  let card = document.createElement("div");
  card.className = "card-body";

  let noteTitle = document.createElement("h5");
  noteTitle.className = "card-title";
  noteTitle.textContent = inputNoteTitle;

  card.appendChild(noteTitle);

  let noteContent = document.createElement("p");
  noteContent.className = "card-text";
  noteContent.textContent = inputNoteContent;

  card.appendChild(noteContent);

  let buttonDelete = document.createElement("div");
  buttonDelete.className = "btn btn-danger mr-5";
  buttonDelete.textContent = "Delete note";
  buttonDelete.setAttribute("onclick", "deleteNote(event)");

  let buttonEdit = document.createElement("div");
  buttonEdit.className = "btn btn-warning ml-5";
  buttonEdit.textContent = "Edit note";
  buttonEdit.setAttribute("onclick", "moveToEdit(event)");

  card.appendChild(buttonDelete);
  card.appendChild(buttonEdit);

  cardContainer.appendChild(card);

  return cardContainer;
}

function deleteNote(event) {
  let noteToDelete = event.path[2];
  let idOfNoteToDelete = parseInt(noteToDelete.id);

  let found = false;
  for (let index = 0; index < notes.length; index++) {
    const element = notes[index];

    if (found) {
      break;
    } else if (element.id === idOfNoteToDelete) {
      notes.splice(index, 1);
      found = true;
    }
  }
  document
    .getElementById(idOfNoteToDelete)
    .parentElement.removeChild(noteToDelete);
  updateNotes();
}

function pushNewNote(note) {
  notes.push(note);
}

function displayNewNote(note) {
  let lastRow = document.getElementById("container-notes").children.length;
  document
    .getElementById("container-notes")
    .children[lastRow - 1].appendChild(note);
}

function exportIntoFile() {
  if(!notes.length){
    alert(`Can't export with no notes!`);
    return;
  }
  let jsonString = JSON.stringify(notes);
  let blob = new Blob([jsonString], { type: "text/plain" });
  let a = document.createElement("a");
  a.download = "notes.json";
  a.href = window.URL.createObjectURL(blob);
  a.click();
}


function importFromFile() {
  if(hasImported){
    alert(`Can't import more than once!`);
    return;
  }
  hasImported = true;
  fetch('./notes.json')
    .then(response => response.json())
    .catch(() => alert('Something went wront, check your file import!'))
    .then(fileData => {
      fileData.forEach(element => {
        pushNewNote(element);
      });
    })
    .then(() => {
      updateNotes();
    });
}

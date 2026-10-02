/* ============================================================
   INTEGRAME CREATOR
   app.js

   UPDATED ARCHITECTURE

   Definition
      ├── text OR image
      ├── Answer 1 + direction + special
      ├── Answer 2 + direction + special
      └── Answer 3 + direction + special

   A definition and all of its answers remain connected.
============================================================ */

"use strict";


/* ============================================================
   APPLICATION STATE
============================================================ */

const state = {

  rows: 15,
  cols: 15,

  selectedRow: null,
  selectedCol: null,

  mode: "creator",

  grid: [],

  words: [],

  nextDefinitionId: 1,
  nextAnswerId: 1,
  nextWordId: 1
};


/* ============================================================
   DOM ELEMENTS
============================================================ */

const crosswordGrid =
  document.getElementById("crosswordGrid");

const previewGrid =
  document.getElementById("previewGrid");

const creatorView =
  document.getElementById("creatorView");

const previewView =
  document.getElementById("previewView");

const creatorToolbar =
  document.getElementById("creatorToolbar");

const creatorModeBtn =
  document.getElementById("creatorModeBtn");

const previewModeBtn =
  document.getElementById("previewModeBtn");

const printBtn =
  document.getElementById("printBtn");

const puzzleTitle =
  document.getElementById("puzzleTitle");

const previewTitle =
  document.getElementById("previewTitle");

const gridRowsInput =
  document.getElementById("gridRows");

const gridColsInput =
  document.getElementById("gridCols");

const resizeGridBtn =
  document.getElementById("resizeGridBtn");

const checkGridBtn =
  document.getElementById("checkGridBtn");

const selectedCellCoordinates =
  document.getElementById("selectedCellCoordinates");

const noCellSelected =
  document.getElementById("noCellSelected");

const editorControls =
  document.getElementById("editorControls");

const letterCellSettings =
  document.getElementById("letterCellSettings");

const clueCellSettings =
  document.getElementById("clueCellSettings");

const manualLetter =
  document.getElementById("manualLetter");

const addDefinitionBtn =
  document.getElementById("addDefinitionBtn");

const definitionsContainer =
  document.getElementById("definitionsContainer");

const applyDefinitionsBtn =
  document.getElementById("applyDefinitionsBtn");

const clearCellBtn =
  document.getElementById("clearCellBtn");

const wordCount =
  document.getElementById("wordCount");

const intersectionCount =
  document.getElementById("intersectionCount");

const specialWordCount =
  document.getElementById("specialWordCount");

const conflictCount =
  document.getElementById("conflictCount");

const statusIndicator =
  document.getElementById("statusIndicator");

const statusText =
  document.getElementById("statusText");

const validationPanel =
  document.getElementById("validationPanel");

const validationSummary =
  document.getElementById("validationSummary");

const validationIssues =
  document.getElementById("validationIssues");

const closeValidationBtn =
  document.getElementById("closeValidationBtn");

const definitionTemplate =
  document.getElementById("definitionTemplate");

const answerTemplate =
  document.getElementById("answerTemplate");

const toast =
  document.getElementById("toast");


/* ============================================================
   DIRECTIONS
============================================================ */

const DIRECTIONS = {

  right: {
    row: 0,
    col: 1,
    arrow: "→",
    label: "dreapta"
  },

  left: {
    row: 0,
    col: -1,
    arrow: "←",
    label: "stânga"
  },

  down: {
    row: 1,
    col: 0,
    arrow: "↓",
    label: "jos"
  },

  up: {
    row: -1,
    col: 0,
    arrow: "↑",
    label: "sus"
  }

};


/* ============================================================
   BASIC OBJECT FACTORIES
============================================================ */

function createEmptyCell() {

  return {
    type: "letter",

    manualLetter: "",

    definitions: [],

    letters: []
  };

}


function createAnswer(
  direction = "right"
) {

  return {
    id: state.nextAnswerId++,

    word: "",

    direction,

    special: false,

    wordId: null
  };

}


function createDefinition() {

  return {
    id: state.nextDefinitionId++,

    type: "text",

    text: "",

    imageData: "",

    answers: [
      createAnswer("right")
    ]
  };

}


/* ============================================================
   INITIALIZE GRID
============================================================ */

function initializeGrid(rows, cols) {

  state.rows = rows;
  state.cols = cols;

  state.grid = [];

  for (
    let row = 0;
    row < rows;
    row++
  ) {

    const rowArray = [];

    for (
      let col = 0;
      col < cols;
      col++
    ) {

      rowArray.push(
        createEmptyCell()
      );

    }

    state.grid.push(
      rowArray
    );

  }

  state.words = [];

  state.selectedRow = null;
  state.selectedCol = null;

  closeEditor();

  renderGrid();
  updateStatistics();

}


/* ============================================================
   GET CELL
============================================================ */

function getCell(row, col) {

  if (
    row < 0 ||
    row >= state.rows ||
    col < 0 ||
    col >= state.cols
  ) {
    return null;
  }

  return state.grid[row][col];

}


/* ============================================================
   NORMALIZE ANSWER
============================================================ */

function normalizeAnswer(value) {

  return String(value || "")
    .trim()
    .toLocaleUpperCase("ro-RO")
    .replace(/\s+/g, "")
    .replace(/-/g, "");

}


/* ============================================================
   DISPLAY LETTER
============================================================ */

function getDisplayLetter(cell) {

  if (!cell) {
    return "";
  }

  if (
    Array.isArray(cell.letters) &&
    cell.letters.length > 0
  ) {

    return (
      cell.letters[0].letter || ""
    );

  }

  return (
    cell.manualLetter || ""
  );

}


/* ============================================================
   RENDER MAIN GRID
============================================================ */

function renderGrid() {

  crosswordGrid.innerHTML = "";

  crosswordGrid.style.gridTemplateColumns =
    `repeat(${state.cols}, var(--cell-size))`;


  for (
    let row = 0;
    row < state.rows;
    row++
  ) {

    for (
      let col = 0;
      col < state.cols;
      col++
    ) {

      const cell =
        state.grid[row][col];

      const element =
        document.createElement("button");

      element.type = "button";

      element.className =
        "grid-cell";

      element.dataset.row = row;
      element.dataset.col = col;


      if (
        row === state.selectedRow &&
        col === state.selectedCol
      ) {

        element.classList.add(
          "selected"
        );

      }


      renderCellContent(
        element,
        cell,
        false
      );


      element.addEventListener(
        "click",
        () => selectCell(row, col)
      );


      crosswordGrid.appendChild(
        element
      );

    }

  }

}


/* ============================================================
   RENDER CELL
============================================================ */

function renderCellContent(
  element,
  cell,
  previewMode
) {

  element.innerHTML = "";

  element.classList.remove(
    "letter-cell",
    "clue-cell",
    "blocked-cell",
    "special-cell",
    "conflict"
  );


  /* ==========================================================
     LETTER
  ========================================================== */

  if (cell.type === "letter") {

    element.classList.add(
      "letter-cell"
    );


    if (isSpecialCell(cell)) {

      element.classList.add(
        "special-cell"
      );

    }


    if (
      hasLetterConflict(cell) &&
      !previewMode
    ) {

      element.classList.add(
        "conflict"
      );

    }


    const letter =
      document.createElement("span");

    letter.className =
      "cell-letter";


    if (previewMode) {

      letter.textContent = "";

    }

    else {

      letter.textContent =
        getDisplayLetter(cell);

    }


    element.appendChild(
      letter
    );

    return;

  }


  /* ==========================================================
     BLOCKED
  ========================================================== */

  if (cell.type === "blocked") {

    element.classList.add(
      "blocked-cell"
    );

    return;

  }


  /* ==========================================================
     CLUE / DEFINITION CELL
  ========================================================== */

  if (cell.type === "clue") {

    element.classList.add(
      "clue-cell"
    );


    const wrapper =
      document.createElement("div");

    wrapper.className =
      "clue-cell-content";


    const definitions =
      cell.definitions || [];


    definitions.forEach(
      (definition, index) => {

        const part =
          document.createElement("div");

        part.className =
          "clue-part";

        part.dataset.definitionIndex =
          index;


        /* --------------------------------------------
           DEFINITION IMAGE
        --------------------------------------------- */

        if (
          definition.type === "image" &&
          definition.imageData
        ) {

          part.classList.add(
            "image-clue-part"
          );


          const image =
            document.createElement("img");

          image.className =
            "clue-image";

          image.src =
            definition.imageData;

          image.alt =
            "Definiție imagine";


          part.appendChild(
            image
          );

        }


        /* --------------------------------------------
           DEFINITION TEXT
        --------------------------------------------- */

        else {

          const text =
            document.createElement("span");

          text.className =
            "clue-part-text";

          text.textContent =
            definition.text || "";


          part.appendChild(
            text
          );

        }


        /* --------------------------------------------
           MULTIPLE ARROWS FOR ONE DEFINITION
        --------------------------------------------- */

        const arrows =
          document.createElement("div");

        arrows.className =
          "clue-arrows";


        const usedDirections =
          new Set();


        (definition.answers || [])
          .forEach((answer) => {

            if (
              !answer.word ||
              !answer.direction
            ) {
              return;
            }


            if (
              usedDirections.has(
                answer.direction
              )
            ) {
              return;
            }


            usedDirections.add(
              answer.direction
            );


            const arrow =
              document.createElement("span");

            arrow.className =
              `clue-arrow clue-arrow-${answer.direction}`;

            arrow.textContent =
              DIRECTIONS[
                answer.direction
              ]?.arrow || "→";


            arrows.appendChild(
              arrow
            );

          });


        part.appendChild(
          arrows
        );


        wrapper.appendChild(
          part
        );

      }
    );


    element.appendChild(
      wrapper
    );

  }

}


/* ============================================================
   SPECIAL CELL
============================================================ */

function isSpecialCell(cell) {

  if (
    !cell ||
    cell.type !== "letter"
  ) {
    return false;
  }


  return (
    cell.letters || []
  ).some(
    (item) =>
      item.special === true
  );

}


/* ============================================================
   SELECT CELL
============================================================ */

function selectCell(row, col) {

  state.selectedRow = row;
  state.selectedCol = col;

  renderGrid();

  openEditor(row, col);

}


/* ============================================================
   OPEN EDITOR
============================================================ */

function openEditor(row, col) {

  const cell =
    getCell(row, col);

  if (!cell) {
    return;
  }


  noCellSelected.classList.add(
    "hidden"
  );

  editorControls.classList.remove(
    "hidden"
  );


  selectedCellCoordinates.textContent =
    `R${row + 1} · C${col + 1}`;


  setActiveCellType(
    cell.type
  );


  if (cell.type === "letter") {

    showLetterSettings();

    manualLetter.value =
      getDisplayLetter(cell);

  }


  else if (
    cell.type === "clue"
  ) {

    showClueSettings();

    renderDefinitionEditor(
      cell
    );

  }


  else {

    hideSpecificSettings();

  }

}


/* ============================================================
   CLOSE EDITOR
============================================================ */

function closeEditor() {

  noCellSelected.classList.remove(
    "hidden"
  );

  editorControls.classList.add(
    "hidden"
  );

  selectedCellCoordinates.textContent =
    "—";

}


/* ============================================================
   SETTINGS VISIBILITY
============================================================ */

function showLetterSettings() {

  letterCellSettings.classList.remove(
    "hidden"
  );

  clueCellSettings.classList.add(
    "hidden"
  );

}


function showClueSettings() {

  letterCellSettings.classList.add(
    "hidden"
  );

  clueCellSettings.classList.remove(
    "hidden"
  );

}


function hideSpecificSettings() {

  letterCellSettings.classList.add(
    "hidden"
  );

  clueCellSettings.classList.add(
    "hidden"
  );

}


/* ============================================================
   CELL TYPE BUTTONS
============================================================ */

const cellTypeButtons =
  document.querySelectorAll(
    ".cell-type-button"
  );


cellTypeButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        if (
          state.selectedRow === null ||
          state.selectedCol === null
        ) {
          return;
        }


        changeSelectedCellType(
          button.dataset.cellType
        );

      }
    );

  }
);


/* ============================================================
   ACTIVE CELL TYPE
============================================================ */

function setActiveCellType(type) {

  cellTypeButtons.forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.cellType === type
      );

    }
  );

}


/* ============================================================
   CHANGE CELL TYPE
============================================================ */

function changeSelectedCellType(type) {

  const row =
    state.selectedRow;

  const col =
    state.selectedCol;

  const cell =
    getCell(row, col);


  if (!cell) {
    return;
  }


  removeWordsTouchingCell(
    row,
    col
  );


  if (type === "letter") {

    cell.type = "letter";

    cell.definitions = [];
    cell.letters = [];

    showLetterSettings();

    manualLetter.value =
      cell.manualLetter || "";

  }


  else if (type === "clue") {

    cell.type = "clue";

    cell.manualLetter = "";
    cell.letters = [];


    if (
      !Array.isArray(
        cell.definitions
      ) ||
      cell.definitions.length === 0
    ) {

      cell.definitions = [
        createDefinition()
      ];

    }


    showClueSettings();

    renderDefinitionEditor(
      cell
    );

  }


  else if (
    type === "blocked"
  ) {

    cell.type = "blocked";

    cell.manualLetter = "";
    cell.definitions = [];
    cell.letters = [];

    hideSpecificSettings();

  }


  setActiveCellType(type);

  renderGrid();
  updateStatistics();

}


/* ============================================================
   MANUAL LETTER
============================================================ */

manualLetter.addEventListener(
  "input",
  () => {

    const cell =
      getCell(
        state.selectedRow,
        state.selectedCol
      );


    if (
      !cell ||
      cell.type !== "letter"
    ) {
      return;
    }


    let value =
      manualLetter.value
        .toLocaleUpperCase("ro-RO")
        .slice(0, 1);


    manualLetter.value =
      value;

    cell.manualLetter =
      value;


    renderGrid();
    updateStatistics();

  }
);


/* ============================================================
   RENDER DEFINITION EDITOR
============================================================ */

function renderDefinitionEditor(cell) {

  definitionsContainer.innerHTML = "";


  if (
    !cell.definitions ||
    cell.definitions.length === 0
  ) {

    cell.definitions = [
      createDefinition()
    ];

  }


  cell.definitions.forEach(
    (definition, index) => {

      const fragment =
        definitionTemplate
          .content
          .cloneNode(true);


      const card =
        fragment.querySelector(
          ".definition-card"
        );


      card.dataset.definitionId =
        definition.id;


      const number =
        card.querySelector(
          ".definition-position-number"
        );

      number.textContent =
        index + 1;


      setupDefinitionType(
        card,
        definition
      );


      setupDefinitionText(
        card,
        definition
      );


      setupDefinitionImage(
        card,
        definition
      );


      setupDefinitionAnswers(
        card,
        definition
      );


      setupDefinitionReordering(
        card,
        definition.id
      );


      setupDefinitionRemoval(
        card,
        definition.id
      );


      definitionsContainer.appendChild(
        fragment
      );

    }
  );


  updateDefinitionButtons();

}


/* ============================================================
   DEFINITION TYPE
============================================================ */

function setupDefinitionType(
  card,
  definition
) {

  const buttons =
    card.querySelectorAll(
      ".definition-type-button"
    );

  const textPanel =
    card.querySelector(
      ".definition-text-panel"
    );

  const imagePanel =
    card.querySelector(
      ".definition-image-panel"
    );


  function updatePanels() {

    buttons.forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.definitionType ===
            definition.type
        );

      }
    );


    textPanel.classList.toggle(
      "hidden",
      definition.type !== "text"
    );


    imagePanel.classList.toggle(
      "hidden",
      definition.type !== "image"
    );

  }


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          definition.type =
            button.dataset.definitionType;


          updatePanels();

          renderGrid();

        }
      );

    }
  );


  updatePanels();

}


/* ============================================================
   DEFINITION TEXT
============================================================ */

function setupDefinitionText(
  card,
  definition
) {

  const input =
    card.querySelector(
      ".definition-text-input"
    );


  input.value =
    definition.text || "";


  input.addEventListener(
    "input",
    () => {

      definition.text =
        input.value;

      renderGrid();

    }
  );

}


/* ============================================================
   DEFINITION IMAGE
============================================================ */

function setupDefinitionImage(
  card,
  definition
) {

  const input =
    card.querySelector(
      ".definition-image-input"
    );

  const previewArea =
    card.querySelector(
      ".image-preview-area"
    );

  const previewImage =
    card.querySelector(
      ".definition-image-preview"
    );

  const removeButton =
    card.querySelector(
      ".remove-image-button"
    );


  function updatePreview() {

    if (
      definition.imageData
    ) {

      previewImage.src =
        definition.imageData;

      previewArea.classList.remove(
        "hidden"
      );

    }

    else {

      previewImage.removeAttribute(
        "src"
      );

      previewArea.classList.add(
        "hidden"
      );

    }

  }


  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showToast(
          "Fișierul selectat trebuie să fie o imagine."
        );

        input.value = "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          definition.imageData =
            String(
              reader.result || ""
            );


          updatePreview();

          renderGrid();

        };


      reader.onerror =
        () => {

          showToast(
            "Imaginea nu a putut fi citită."
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );


  removeButton.addEventListener(
    "click",
    () => {

      definition.imageData = "";

      input.value = "";

      updatePreview();

      renderGrid();

    }
  );


  updatePreview();

}


/* ============================================================
   DEFINITION ANSWERS
============================================================ */

function setupDefinitionAnswers(
  card,
  definition
) {

  const container =
    card.querySelector(
      ".answers-container"
    );

  const addButton =
    card.querySelector(
      ".add-answer-button"
    );


  renderAnswersIntoCard(
    container,
    definition
  );


  addButton.addEventListener(
    "click",
    () => {

      if (
        definition.answers.length >= 3
      ) {

        showToast(
          "O definiție poate avea maximum 3 răspunsuri."
        );

        return;
      }


      const preferredDirections = [
        "right",
        "down",
        "left",
        "up"
      ];


      const used =
        new Set(
          definition.answers.map(
            (answer) =>
              answer.direction
          )
        );


      const nextDirection =
        preferredDirections.find(
          (direction) =>
            !used.has(direction)
        ) || "right";


      definition.answers.push(
        createAnswer(
          nextDirection
        )
      );


      renderDefinitionEditor(
        getSelectedCell()
      );

    }
  );

}


/* ============================================================
   RENDER ANSWERS INTO DEFINITION CARD
============================================================ */

function renderAnswersIntoCard(
  container,
  definition
) {

  container.innerHTML = "";


  definition.answers.forEach(
    (answer, index) => {

      const fragment =
        answerTemplate
          .content
          .cloneNode(true);


      const card =
        fragment.querySelector(
          ".answer-card"
        );


      card.dataset.answerId =
        answer.id;


      const number =
        card.querySelector(
          ".answer-number"
        );

      number.textContent =
        `Răspuns ${index + 1}`;


      const wordInput =
        card.querySelector(
          ".answer-word-input"
        );


      wordInput.value =
        answer.word || "";


      wordInput.addEventListener(
        "input",
        () => {

          answer.word =
            normalizeAnswer(
              wordInput.value
            );

          wordInput.value =
            answer.word;

        }
      );


      /* --------------------------------------------
         DIRECTION
      --------------------------------------------- */

      const directionButtons =
        card.querySelectorAll(
          ".direction-button"
        );


      directionButtons.forEach(
        (button) => {

          button.classList.toggle(
            "active",
            button.dataset.direction ===
              answer.direction
          );


          button.addEventListener(
            "click",
            () => {

              directionButtons.forEach(
                (item) =>
                  item.classList.remove(
                    "active"
                  )
              );


              button.classList.add(
                "active"
              );


              answer.direction =
                button.dataset.direction;

            }
          );

        }
      );


      /* --------------------------------------------
         SPECIAL WORD
      --------------------------------------------- */

      const specialCheckbox =
        card.querySelector(
          ".special-word-checkbox"
        );


      specialCheckbox.checked =
        answer.special === true;


      specialCheckbox.addEventListener(
        "change",
        () => {

          answer.special =
            specialCheckbox.checked;

        }
      );


      /* --------------------------------------------
         REMOVE ANSWER
      --------------------------------------------- */

      const removeButton =
        card.querySelector(
          ".remove-answer-button"
        );


      removeButton.addEventListener(
        "click",
        () => {

          if (
            definition.answers.length <= 1
          ) {

            showToast(
              "O definiție trebuie să aibă cel puțin un răspuns."
            );

            return;
          }


          definition.answers =
            definition.answers.filter(
              (item) =>
                item.id !== answer.id
            );


          renderDefinitionEditor(
            getSelectedCell()
          );

        }
      );


      container.appendChild(
        fragment
      );

    }
  );

}


/* ============================================================
   ADD DEFINITION
============================================================ */

addDefinitionBtn.addEventListener(
  "click",
  () => {

    const cell =
      getSelectedCell();


    if (
      !cell ||
      cell.type !== "clue"
    ) {
      return;
    }


    if (
      cell.definitions.length >= 3
    ) {

      showToast(
        "O căsuță poate conține maximum 3 definiții."
      );

      return;
    }


    cell.definitions.push(
      createDefinition()
    );


    renderDefinitionEditor(
      cell
    );


    renderGrid();

  }
);


/* ============================================================
   REORDER DEFINITIONS
============================================================ */

function setupDefinitionReordering(
  card,
  definitionId
) {

  const upButton =
    card.querySelector(
      ".move-definition-up"
    );

  const downButton =
    card.querySelector(
      ".move-definition-down"
    );


  upButton.addEventListener(
    "click",
    () => {

      moveDefinition(
        definitionId,
        -1
      );

    }
  );


  downButton.addEventListener(
    "click",
    () => {

      moveDefinition(
        definitionId,
        1
      );

    }
  );

}


/* ============================================================
   MOVE DEFINITION

   The COMPLETE definition object is moved.

   This means:
   - text moves
   - image moves
   - every answer moves
   - every direction moves
   - special word flags move
============================================================ */

function moveDefinition(
  definitionId,
  offset
) {

  const cell =
    getSelectedCell();


  if (
    !cell ||
    cell.type !== "clue"
  ) {
    return;
  }


  const index =
    cell.definitions.findIndex(
      (definition) =>
        definition.id ===
          definitionId
    );


  if (index === -1) {
    return;
  }


  const newIndex =
    index + offset;


  if (
    newIndex < 0 ||
    newIndex >=
      cell.definitions.length
  ) {
    return;
  }


  const [
    definition
  ] =
    cell.definitions.splice(
      index,
      1
    );


  cell.definitions.splice(
    newIndex,
    0,
    definition
  );


  renderDefinitionEditor(
    cell
  );


  renderGrid();

}


/* ============================================================
   REMOVE DEFINITION
============================================================ */

function setupDefinitionRemoval(
  card,
  definitionId
) {

  const removeButton =
    card.querySelector(
      ".remove-definition"
    );


  removeButton.addEventListener(
    "click",
    () => {

      const cell =
        getSelectedCell();


      if (
        !cell ||
        cell.type !== "clue"
      ) {
        return;
      }


      if (
        cell.definitions.length <= 1
      ) {

        showToast(
          "O căsuță de definiție trebuie să conțină cel puțin o definiție."
        );

        return;
      }


      cell.definitions =
        cell.definitions.filter(
          (definition) =>
            definition.id !==
              definitionId
        );


      renderDefinitionEditor(
        cell
      );


      renderGrid();

    }
  );

}


/* ============================================================
   UPDATE DEFINITION BUTTON STATES
============================================================ */

function updateDefinitionButtons() {

  const cards =
    [
      ...definitionsContainer
        .querySelectorAll(
          ".definition-card"
        )
    ];


  cards.forEach(
    (card, index) => {

      const up =
        card.querySelector(
          ".move-definition-up"
        );

      const down =
        card.querySelector(
          ".move-definition-down"
        );


      up.disabled =
        index === 0;

      down.disabled =
        index ===
          cards.length - 1;

    }
  );


  addDefinitionBtn.disabled =
    cards.length >= 3;

}


/* ============================================================
   GET SELECTED CELL
============================================================ */

function getSelectedCell() {

  if (
    state.selectedRow === null ||
    state.selectedCol === null
  ) {
    return null;
  }


  return getCell(
    state.selectedRow,
    state.selectedCol
  );

}


/* ============================================================
   APPLY DEFINITIONS
============================================================ */

applyDefinitionsBtn.addEventListener(
  "click",
  applySelectedDefinitions
);


/* ============================================================
   APPLY DEFINITIONS AND ANSWERS
============================================================ */

function applySelectedDefinitions() {

  const row =
    state.selectedRow;

  const col =
    state.selectedCol;

  const cell =
    getCell(row, col);


  if (
    !cell ||
    cell.type !== "clue"
  ) {
    return;
  }


  if (
    !cell.definitions ||
    cell.definitions.length === 0
  ) {

    showToast(
      "Adaugă cel puțin o definiție."
    );

    return;

  }


  /* ==========================================================
     VALIDATE DEFINITIONS
  ========================================================== */

  for (
    let definitionIndex = 0;
    definitionIndex <
      cell.definitions.length;
    definitionIndex++
  ) {

    const definition =
      cell.definitions[
        definitionIndex
      ];


    if (
      definition.type === "text" &&
      !definition.text.trim()
    ) {

      showToast(
        `Scrie textul pentru definiția ${definitionIndex + 1}.`
      );

      return;

    }


    if (
      definition.type === "image" &&
      !definition.imageData
    ) {

      showToast(
        `Alege imaginea pentru definiția ${definitionIndex + 1}.`
      );

      return;

    }


    if (
      !definition.answers ||
      definition.answers.length === 0
    ) {

      showToast(
        `Definiția ${definitionIndex + 1} trebuie să aibă cel puțin un răspuns.`
      );

      return;

    }


    const directionSet =
      new Set();


    for (
      let answerIndex = 0;
      answerIndex <
        definition.answers.length;
      answerIndex++
    ) {

      const answer =
        definition.answers[
          answerIndex
        ];


      answer.word =
        normalizeAnswer(
          answer.word
        );


      if (!answer.word) {

        showToast(
          `Scrie răspunsul ${answerIndex + 1} pentru definiția ${definitionIndex + 1}.`
        );

        return;

      }


      if (
        directionSet.has(
          answer.direction
        )
      ) {

        showToast(
          `Definiția ${definitionIndex + 1} are două răspunsuri în aceeași direcție. Alege direcții diferite.`
        );

        return;

      }


      directionSet.add(
        answer.direction
      );

    }

  }


  /*
     Save the existing placed words in case
     the new configuration cannot be placed.
  */

  const backup =
    createGridBackup();


  /*
     Remove the OLD placements belonging to
     this clue cell, but keep the definitions
     currently being edited.
  */

  removeWordsOwnedByClueCell(
    row,
    col
  );


  const placements = [];


  /* ==========================================================
     TEST EVERY ANSWER
  ========================================================== */

  for (
    let definitionIndex = 0;
    definitionIndex <
      cell.definitions.length;
    definitionIndex++
  ) {

    const definition =
      cell.definitions[
        definitionIndex
      ];


    for (
      let answerIndex = 0;
      answerIndex <
        definition.answers.length;
      answerIndex++
    ) {

      const answer =
        definition.answers[
          answerIndex
        ];


      const placement =
        calculatePlacement(
          row,
          col,
          answer.word,
          answer.direction
        );


      if (!placement.valid) {

        restoreGridBackup(
          backup
        );


        showToast(
          placement.message
        );

        return;

      }


      /*
         Compare this new path against every
         other new path being added from this
         clue box.

         Crossing is allowed ONLY when the
         required letters are the same.
      */

      for (
        const previous
        of placements
      ) {

        const conflict =
          compareNewPlacements(
            previous,
            {
              ...placement,
              word: answer.word
            }
          );


        if (conflict) {

          restoreGridBackup(
            backup
          );


          showToast(
            `Conflict între răspunsurile noi la rândul ${conflict.row + 1}, coloana ${conflict.col + 1}.`
          );

          return;

        }

      }


      placements.push({
        ...placement,

        word:
          answer.word,

        answer,

        definition,

        definitionIndex,

        answerIndex
      });

    }

  }


  /* ==========================================================
     COMMIT PLACEMENTS
  ========================================================== */

  placements.forEach(
    (placement) => {

      const wordId =
        state.nextWordId++;


      placement.answer.wordId =
        wordId;


      const word = {

        id: wordId,

        clueRow: row,
        clueCol: col,

        definitionId:
          placement.definition.id,

        answerId:
          placement.answer.id,

        definitionIndex:
          placement.definitionIndex,

        answerIndex:
          placement.answerIndex,

        clueType:
          placement.definition.type,

        clueText:
          placement.definition.text,

        answer:
          placement.answer.word,

        direction:
          placement.answer.direction,

        special:
          placement.answer.special,

        cells:
          placement.cells
      };


      state.words.push(
        word
      );


      placement.cells.forEach(
        (position, letterIndex) => {

          const targetCell =
            getCell(
              position.row,
              position.col
            );


          targetCell.type =
            "letter";


          targetCell.letters.push({

            wordId,

            letter:
              placement.answer.word[
                letterIndex
              ],

            special:
              placement.answer.special
          });

        }
      );

    }
  );


  renderGrid();

  renderDefinitionEditor(
    cell
  );

  updateStatistics();


  showToast(
    "Definițiile și răspunsurile au fost aplicate."
  );

}


/* ============================================================
   CALCULATE PLACEMENT
============================================================ */

function calculatePlacement(
  clueRow,
  clueCol,
  answer,
  directionName
) {

  const direction =
    DIRECTIONS[
      directionName
    ];


  if (!direction) {

    return {
      valid: false,
      message:
        "Direcția răspunsului nu este validă."
    };

  }


  const cells = [];


  let row =
    clueRow +
    direction.row;

  let col =
    clueCol +
    direction.col;


  for (
    let index = 0;
    index < answer.length;
    index++
  ) {

    if (
      row < 0 ||
      row >= state.rows ||
      col < 0 ||
      col >= state.cols
    ) {

      return {

        valid: false,

        message:
          `Răspunsul „${answer}” nu încape în grilă în direcția ${direction.label}.`
      };

    }


    const target =
      getCell(row, col);


    if (
      target.type === "clue"
    ) {

      return {

        valid: false,

        message:
          `Răspunsul „${answer}” ar trece printr-o căsuță cu definiție.`
      };

    }


    if (
      target.type === "blocked"
    ) {

      return {

        valid: false,

        message:
          `Răspunsul „${answer}” ar trece printr-o căsuță blocată.`
      };

    }


    const requiredLetter =
      answer[index];


    /*
       Existing placed words.
    */

    if (
      target.letters &&
      target.letters.length
    ) {

      const existingLetters =
        new Set(
          target.letters.map(
            (item) =>
              item.letter
          )
        );


      if (
        existingLetters.size > 0 &&
        !existingLetters.has(
          requiredLetter
        )
      ) {

        return {

          valid: false,

          message:
            `Conflict la rândul ${row + 1}, coloana ${col + 1}: răspunsul „${answer}” necesită litera „${requiredLetter}”.`
        };

      }

    }


    /*
       Manually entered letter.
    */

    if (
      target.manualLetter &&
      target.manualLetter !==
        requiredLetter
    ) {

      return {

        valid: false,

        message:
          `Conflict la rândul ${row + 1}, coloana ${col + 1}: există litera „${target.manualLetter}”, dar răspunsul „${answer}” necesită „${requiredLetter}”.`
      };

    }


    cells.push({
      row,
      col
    });


    row +=
      direction.row;

    col +=
      direction.col;

  }


  return {
    valid: true,
    cells
  };

}


/* ============================================================
   COMPARE TWO NEW PLACEMENTS

   New answers are allowed to intersect if the
   letter at the intersection is identical.
============================================================ */

function compareNewPlacements(
  placementA,
  placementB
) {

  for (
    let indexA = 0;
    indexA <
      placementA.cells.length;
    indexA++
  ) {

    const cellA =
      placementA.cells[
        indexA
      ];


    for (
      let indexB = 0;
      indexB <
        placementB.cells.length;
      indexB++
    ) {

      const cellB =
        placementB.cells[
          indexB
        ];


      if (
        cellA.row === cellB.row &&
        cellA.col === cellB.col
      ) {

        const letterA =
          placementA.word[
            indexA
          ];


        const letterB =
          placementB.word[
            indexB
          ];


        if (
          letterA !== letterB
        ) {

          return {
            row: cellA.row,
            col: cellA.col
          };

        }

      }

    }

  }


  return null;

}


/* ============================================================
   REMOVE WORD BY ID
============================================================ */

function removeWordById(wordId) {

  const word =
    state.words.find(
      (item) =>
        item.id === wordId
    );


  if (!word) {
    return;
  }


  word.cells.forEach(
    (position) => {

      const cell =
        getCell(
          position.row,
          position.col
        );


      if (!cell) {
        return;
      }


      cell.letters =
        cell.letters.filter(
          (item) =>
            item.wordId !==
              wordId
        );

    }
  );


  state.words =
    state.words.filter(
      (item) =>
        item.id !== wordId
    );

}


/* ============================================================
   REMOVE WORDS OWNED BY A CLUE CELL
============================================================ */

function removeWordsOwnedByClueCell(
  row,
  col
) {

  const ids =
    state.words
      .filter(
        (word) =>
          word.clueRow === row &&
          word.clueCol === col
      )
      .map(
        (word) =>
          word.id
      );


  ids.forEach(
    (id) =>
      removeWordById(id)
  );


  const cell =
    getCell(row, col);


  if (
    cell &&
    cell.definitions
  ) {

    cell.definitions.forEach(
      (definition) => {

        definition.answers.forEach(
          (answer) => {

            answer.wordId = null;

          }
        );

      }
    );

  }

}


/* ============================================================
   REMOVE WORDS TOUCHING A CELL
============================================================ */

function removeWordsTouchingCell(
  row,
  col
) {

  const cell =
    getCell(row, col);


  if (!cell) {
    return;
  }


  const ids =
    new Set();


  if (
    cell.letters &&
    cell.letters.length
  ) {

    cell.letters.forEach(
      (item) =>
        ids.add(
          item.wordId
        )
    );

  }


  state.words
    .filter(
      (word) =>
        word.clueRow === row &&
        word.clueCol === col
    )
    .forEach(
      (word) =>
        ids.add(
          word.id
        )
    );


  ids.forEach(
    (id) =>
      removeWordById(id)
  );

}


/* ============================================================
   GRID BACKUP

   Used when editing existing clues. If the new
   placement fails, the previous valid grid is restored.
============================================================ */

function createGridBackup() {

  return {
    grid:
      JSON.parse(
        JSON.stringify(
          state.grid
        )
      ),

    words:
      JSON.parse(
        JSON.stringify(
          state.words
        )
      ),

    nextWordId:
      state.nextWordId
  };

}


/* ============================================================
   RESTORE GRID BACKUP
============================================================ */

function restoreGridBackup(
  backup
) {

  state.grid =
    backup.grid;

  state.words =
    backup.words;

  state.nextWordId =
    backup.nextWordId;


  renderGrid();

  openEditor(
    state.selectedRow,
    state.selectedCol
  );

  updateStatistics();

}


/* ============================================================
   CLEAR SELECTED CELL
============================================================ */

clearCellBtn.addEventListener(
  "click",
  () => {

    if (
      state.selectedRow === null ||
      state.selectedCol === null
    ) {
      return;
    }


    removeWordsTouchingCell(
      state.selectedRow,
      state.selectedCol
    );


    state.grid[
      state.selectedRow
    ][
      state.selectedCol
    ] =
      createEmptyCell();


    renderGrid();


    openEditor(
      state.selectedRow,
      state.selectedCol
    );


    updateStatistics();


    showToast(
      "Căsuța a fost golită."
    );

  }
);


/* ============================================================
   LETTER CONFLICT
============================================================ */

function hasLetterConflict(cell) {

  if (
    !cell ||
    cell.type !== "letter"
  ) {
    return false;
  }


  const letters =
    (cell.letters || [])
      .map(
        (item) =>
          item.letter
      );


  if (
    cell.manualLetter
  ) {

    letters.push(
      cell.manualLetter
    );

  }


  return (
    new Set(
      letters.filter(Boolean)
    ).size > 1
  );

}


/* ============================================================
   COUNT INTERSECTIONS
============================================================ */

function countIntersections() {

  let count = 0;


  for (
    let row = 0;
    row < state.rows;
    row++
  ) {

    for (
      let col = 0;
      col < state.cols;
      col++
    ) {

      const cell =
        state.grid[row][col];


      if (
        cell.type === "letter" &&
        cell.letters.length > 1 &&
        !hasLetterConflict(cell)
      ) {

        count++;

      }

    }

  }


  return count;

}


/* ============================================================
   COUNT CONFLICTS
============================================================ */

function countConflicts() {

  let count = 0;


  for (
    let row = 0;
    row < state.rows;
    row++
  ) {

    for (
      let col = 0;
      col < state.cols;
      col++
    ) {

      if (
        hasLetterConflict(
          state.grid[row][col]
        )
      ) {

        count++;

      }

    }

  }


  return count;

}


/* ============================================================
   COUNT SPECIAL WORDS
============================================================ */

function countSpecialWords() {

  return state.words.filter(
    (word) =>
      word.special === true
  ).length;

}


/* ============================================================
   UPDATE STATISTICS
============================================================ */

function updateStatistics() {

  const words =
    state.words.length;

  const intersections =
    countIntersections();

  const conflicts =
    countConflicts();

  const special =
    countSpecialWords();


  wordCount.textContent =
    words;

  intersectionCount.textContent =
    intersections;

  conflictCount.textContent =
    conflicts;

  specialWordCount.textContent =
    special;


  statusIndicator.classList.remove(
    "valid",
    "invalid",
    "warning",
    "neutral"
  );


  if (
    conflicts > 0
  ) {

    statusIndicator.classList.add(
      "invalid"
    );

    statusText.textContent =
      conflicts === 1
        ? "Există un conflict în grilă."
        : `Există ${conflicts} conflicte în grilă.`;

  }


  else if (
    words === 0
  ) {

    statusIndicator.classList.add(
      "neutral"
    );

    statusText.textContent =
      "Grila este pregătită.";

  }


  else {

    statusIndicator.classList.add(
      "valid"
    );

    statusText.textContent =
      "Nu există conflicte de litere.";

  }

}


/* ============================================================
   RESIZE GRID
============================================================ */

resizeGridBtn.addEventListener(
  "click",
  () => {

    const rows =
      Number(
        gridRowsInput.value
      );

    const cols =
      Number(
        gridColsInput.value
      );


    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(cols) ||
      rows < 5 ||
      rows > 30 ||
      cols < 5 ||
      cols > 30
    ) {

      showToast(
        "Dimensiunea grilei trebuie să fie între 5 și 30."
      );

      return;

    }


    const hasContent =
      state.words.length > 0 ||
      state.grid.some(
        (row) =>
          row.some(
            (cell) =>
              cell.type !== "letter" ||
              cell.manualLetter
          )
      );


    if (hasContent) {

      const confirmed =
        window.confirm(
          "Redimensionarea va șterge grila actuală. Continui?"
        );


      if (!confirmed) {
        return;
      }

    }


    initializeGrid(
      rows,
      cols
    );


    showToast(
      `Grila a fost redimensionată la ${rows} × ${cols}.`
    );

  }
);


/* ============================================================
   VALIDATE GRID
============================================================ */

checkGridBtn.addEventListener(
  "click",
  validateGrid
);


function validateGrid() {

  const issues = [];

  let orphanLetters = 0;
  let conflicts = 0;
  let incompleteDefinitions = 0;
  let incompleteAnswers = 0;


  for (
    let row = 0;
    row < state.rows;
    row++
  ) {

    for (
      let col = 0;
      col < state.cols;
      col++
    ) {

      const cell =
        state.grid[row][col];


      /* --------------------------------------------
         LETTER CONFLICT
      --------------------------------------------- */

      if (
        cell.type === "letter" &&
        hasLetterConflict(cell)
      ) {

        conflicts++;


        issues.push({

          type: "error",

          message:
            `Conflict de litere la rândul ${row + 1}, coloana ${col + 1}.`
        });

      }


      /* --------------------------------------------
         ORPHAN MANUAL LETTER
      --------------------------------------------- */

      if (
        cell.type === "letter" &&
        cell.manualLetter &&
        cell.letters.length === 0
      ) {

        orphanLetters++;


        issues.push({

          type: "warning",

          message:
            `Litera „${cell.manualLetter}” de la rândul ${row + 1}, coloana ${col + 1} nu aparține unui răspuns.`
        });

      }


      /* --------------------------------------------
         CLUE CELL
      --------------------------------------------- */

      if (
        cell.type === "clue"
      ) {

        if (
          !cell.definitions ||
          cell.definitions.length === 0
        ) {

          incompleteDefinitions++;


          issues.push({

            type: "warning",

            message:
              `Căsuța de la rândul ${row + 1}, coloana ${col + 1} nu conține nicio definiție.`
          });

        }


        else {

          cell.definitions.forEach(
            (
              definition,
              definitionIndex
            ) => {

              const definitionValid =
                definition.type === "image"
                  ? Boolean(
                      definition.imageData
                    )
                  : Boolean(
                      definition.text?.trim()
                    );


              if (
                !definitionValid
              ) {

                incompleteDefinitions++;


                issues.push({

                  type: "warning",

                  message:
                    `Definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} este incompletă.`
                });

              }


              if (
                !definition.answers ||
                definition.answers.length === 0
              ) {

                incompleteAnswers++;


                issues.push({

                  type: "warning",

                  message:
                    `Definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} nu are răspuns.`
                });

              }


              else {

                definition.answers.forEach(
                  (
                    answer,
                    answerIndex
                  ) => {

                    if (
                      !answer.word ||
                      !answer.wordId
                    ) {

                      incompleteAnswers++;


                      issues.push({

                        type: "warning",

                        message:
                          `Răspunsul ${answerIndex + 1} al definiției ${definitionIndex + 1}, rând ${row + 1}, coloana ${col + 1}, nu este plasat complet.`
                      });

                    }

                  }
                );

              }

            }
          );

        }

      }

    }

  }


  if (
    issues.length === 0
  ) {

    issues.push({

      type: "success",

      message:
        "Nu au fost găsite probleme în grilă."
    });

  }


  renderValidationResults(
    issues,
    {

      words:
        state.words.length,

      intersections:
        countIntersections(),

      conflicts,

      special:
        countSpecialWords(),

      orphanLetters,

      incompleteDefinitions,

      incompleteAnswers
    }
  );

}


/* ============================================================
   RENDER VALIDATION RESULTS
============================================================ */

function renderValidationResults(
  issues,
  stats
) {

  validationPanel.classList.remove(
    "hidden"
  );


  validationSummary.innerHTML = `

    <div class="validation-summary-item">
      <strong>${stats.words}</strong>
      <span>CUVINTE</span>
    </div>

    <div class="validation-summary-item">
      <strong>${stats.intersections}</strong>
      <span>INTERSECȚII</span>
    </div>

    <div class="validation-summary-item">
      <strong>${stats.special}</strong>
      <span>SPECIALE</span>
    </div>

    <div class="validation-summary-item">
      <strong>${stats.conflicts}</strong>
      <span>CONFLICTE</span>
    </div>

  `;


  validationIssues.innerHTML =
    "";


  issues.forEach(
    (issue) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        `validation-issue ${issue.type}`;


      let icon = "✓";


      if (
        issue.type === "error"
      ) {
        icon = "×";
      }


      if (
        issue.type === "warning"
      ) {
        icon = "!";
      }


      const iconElement =
        document.createElement(
          "strong"
        );


      iconElement.textContent =
        icon;


      const textElement =
        document.createElement(
          "span"
        );


      textElement.textContent =
        issue.message;


      item.appendChild(
        iconElement
      );


      item.appendChild(
        textElement
      );


      validationIssues.appendChild(
        item
      );

    }
  );


  validationPanel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

}


/* ============================================================
   CLOSE VALIDATION
============================================================ */

closeValidationBtn.addEventListener(
  "click",
  () => {

    validationPanel.classList.add(
      "hidden"
    );

  }
);


/* ============================================================
   CREATOR MODE
============================================================ */

creatorModeBtn.addEventListener(
  "click",
  showCreatorMode
);


function showCreatorMode() {

  state.mode =
    "creator";


  creatorModeBtn.classList.add(
    "active"
  );


  previewModeBtn.classList.remove(
    "active"
  );


  creatorView.classList.remove(
    "hidden"
  );


  creatorToolbar.classList.remove(
    "hidden"
  );


  previewView.classList.add(
    "hidden"
  );

}


/* ============================================================
   PREVIEW MODE
============================================================ */

previewModeBtn.addEventListener(
  "click",
  showPreviewMode
);


function showPreviewMode() {

  state.mode =
    "preview";


  previewTitle.textContent =
    puzzleTitle.value.trim() ||
    "Integrame";


  creatorModeBtn.classList.remove(
    "active"
  );


  previewModeBtn.classList.add(
    "active"
  );


  creatorView.classList.add(
    "hidden"
  );


  creatorToolbar.classList.add(
    "hidden"
  );


  previewView.classList.remove(
    "hidden"
  );


  renderPreviewGrid();

}


/* ============================================================
   RENDER PREVIEW GRID
============================================================ */

function renderPreviewGrid() {

  previewGrid.innerHTML = "";


  previewGrid.style.gridTemplateColumns =
    `repeat(${state.cols}, var(--cell-size))`;


  for (
    let row = 0;
    row < state.rows;
    row++
  ) {

    for (
      let col = 0;
      col < state.cols;
      col++
    ) {

      const cell =
        state.grid[row][col];


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "grid-cell";


      renderCellContent(
        element,
        cell,
        true
      );


      element.classList.remove(
        "selected",
        "conflict",
        "warning"
      );


      previewGrid.appendChild(
        element
      );

    }

  }


  /*
     Wait until the browser has rendered the grid,
     then fit definition text.
  */

  requestAnimationFrame(
    () => {

      fitAllClueText(
        previewGrid
      );

    }
  );

}


/* ============================================================
   AUTO-FIT DEFINITION TEXT

   Font size is reduced until the complete definition
   fits inside its available clue area.

   CSS will prevent words from being split.
============================================================ */

function fitAllClueText(
  root = document
) {

  const textElements =
    root.querySelectorAll(
      ".clue-part-text"
    );


  textElements.forEach(
    (element) => {

      fitClueText(
        element
      );

    }
  );

}


/* ============================================================
   FIT ONE DEFINITION
============================================================ */

function fitClueText(element) {

  if (!element) {
    return;
  }


  const parent =
    element.closest(
      ".clue-part"
    );


  if (!parent) {
    return;
  }


  /*
     Start larger, then reduce gradually.
  */

  let size = 10;


  element.style.fontSize =
    `${size}px`;


  while (
    size > 5 &&
    (
      element.scrollHeight >
        element.clientHeight ||
      element.scrollWidth >
        element.clientWidth
    )
  ) {

    size -= 0.5;


    element.style.fontSize =
      `${size}px`;

  }

}


/* ============================================================
   TITLE UPDATE
============================================================ */

puzzleTitle.addEventListener(
  "input",
  () => {

    previewTitle.textContent =
      puzzleTitle.value.trim() ||
      "Integrame";

  }
);


/* ============================================================
   PRINT / PDF

   IMPORTANT:
   We do NOT change individual cell dimensions.

   Instead, the complete preview grid is scaled as
   one object if it is larger than the printable area.
============================================================ */

printBtn.addEventListener(
  "click",
  () => {

    previewTitle.textContent =
      puzzleTitle.value.trim() ||
      "Integrame";


    renderPreviewGrid();


    requestAnimationFrame(
      () => {

        preparePrintScale();


        requestAnimationFrame(
          () => {

            window.print();

          }
        );

      }
    );

  }
);


/* ============================================================
   PREPARE PRINT SCALE
============================================================ */

function preparePrintScale() {

  const scaleWrapper =
    document.getElementById(
      "previewGridScale"
    );


  const printArea =
    document.getElementById(
      "printGridArea"
    );


  if (
    !scaleWrapper ||
    !printArea
  ) {
    return;
  }


  /*
     Reset first so measurements reflect the
     original editor proportions.
  */

  scaleWrapper.style.transform =
    "none";

  scaleWrapper.style.transformOrigin =
    "top center";


  const gridWidth =
    previewGrid.scrollWidth;

  const gridHeight =
    previewGrid.scrollHeight;


  /*
     Approximate printable A4 content area.
     CSS print rules will provide the final page margins.
  */

  const maxWidth = 740;
  const maxHeight = 980;


  const widthScale =
    maxWidth / gridWidth;

  const heightScale =
    maxHeight / gridHeight;


  const scale =
    Math.min(
      1,
      widthScale,
      heightScale
    );


  scaleWrapper.style.setProperty(
    "--print-scale",
    String(scale)
  );


  scaleWrapper.style.transform =
    `scale(${scale})`;


  /*
     Compensate for transform layout space.
  */

  printArea.style.height =
    `${gridHeight * scale}px`;

}


/* ============================================================
   RESET PRINT SCALE AFTER PRINT
============================================================ */

window.addEventListener(
  "afterprint",
  () => {

    const scaleWrapper =
      document.getElementById(
        "previewGridScale"
      );


    const printArea =
      document.getElementById(
        "printGridArea"
      );


    if (scaleWrapper) {

      scaleWrapper.style.transform =
        "none";

    }


    if (printArea) {

      printArea.style.height =
        "";

    }

  }
);


/* ============================================================
   TOAST
============================================================ */

let toastTimer = null;


function showToast(message) {

  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  if (toastTimer) {

    clearTimeout(
      toastTimer
    );

  }


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* ============================================================
   KEYBOARD GRID NAVIGATION
============================================================ */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      state.mode !== "creator"
    ) {
      return;
    }


    if (
      state.selectedRow === null ||
      state.selectedCol === null
    ) {
      return;
    }


    const activeTag =
      document.activeElement
        ?.tagName
        ?.toLowerCase();


    if (
      activeTag === "input" ||
      activeTag === "textarea" ||
      activeTag === "button"
    ) {
      return;
    }


    let row =
      state.selectedRow;

    let col =
      state.selectedCol;


    if (
      event.key === "ArrowUp"
    ) {

      row--;

    }


    else if (
      event.key === "ArrowDown"
    ) {

      row++;

    }


    else if (
      event.key === "ArrowLeft"
    ) {

      col--;

    }


    else if (
      event.key === "ArrowRight"
    ) {

      col++;

    }


    else {

      return;

    }


    if (
      row >= 0 &&
      row < state.rows &&
      col >= 0 &&
      col < state.cols
    ) {

      event.preventDefault();


      selectCell(
        row,
        col
      );

    }

  }
);


/* ============================================================
   AUTO-FIT CREATOR DEFINITIONS AFTER GRID RENDER

   MutationObserver watches the grid because definitions
   can change while typing.
============================================================ */

const gridObserver =
  new MutationObserver(
    () => {

      requestAnimationFrame(
        () => {

          fitAllClueText(
            crosswordGrid
          );

        }
      );

    }
  );


gridObserver.observe(
  crosswordGrid,
  {
    childList: true,
    subtree: true,
    characterData: true
  }
);


/* ============================================================
   INITIAL STARTUP
============================================================ */

initializeGrid(
  state.rows,
  state.cols
);

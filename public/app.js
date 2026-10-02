"use strict";

/* ============================================================
   CREATOR INTEGRAME
   APP.JS
============================================================ */


/* ============================================================
   STATE
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
   ROUTES

   "entry" = side of clue cell used by arrow / first answer cell

   "travel" = direction in which the answer continues.

   Straight:
   right
   left
   up
   down

   Bent:
   right-up
   right-down
   left-up
   left-down
   up-right
   up-left
   down-right
   down-left

   For bent routes:
   the first answer letter sits immediately outside the clue
   on the selected entry side.

   Remaining letters continue from that first cell in the
   travel direction.
============================================================ */

const ROUTES = {

  right: {
    entry: "right",
    travel: "right",
    bent: false,
    label: "dreapta"
  },

  left: {
    entry: "left",
    travel: "left",
    bent: false,
    label: "stânga"
  },

  up: {
    entry: "up",
    travel: "up",
    bent: false,
    label: "sus"
  },

  down: {
    entry: "down",
    travel: "down",
    bent: false,
    label: "jos"
  },


  "right-up": {
    entry: "right",
    travel: "up",
    bent: true,
    label: "dreapta apoi sus"
  },

  "right-down": {
    entry: "right",
    travel: "down",
    bent: true,
    label: "dreapta apoi jos"
  },


  "left-up": {
    entry: "left",
    travel: "up",
    bent: true,
    label: "stânga apoi sus"
  },

  "left-down": {
    entry: "left",
    travel: "down",
    bent: true,
    label: "stânga apoi jos"
  },


  "up-right": {
    entry: "up",
    travel: "right",
    bent: true,
    label: "sus apoi dreapta"
  },

  "up-left": {
    entry: "up",
    travel: "left",
    bent: true,
    label: "sus apoi stânga"
  },


  "down-right": {
    entry: "down",
    travel: "right",
    bent: true,
    label: "jos apoi dreapta"
  },

  "down-left": {
    entry: "down",
    travel: "left",
    bent: true,
    label: "jos apoi stânga"
  }

};


/* ============================================================
   BASIC VECTORS
============================================================ */

const VECTORS = {

  right: {
    row: 0,
    col: 1
  },

  left: {
    row: 0,
    col: -1
  },

  up: {
    row: -1,
    col: 0
  },

  down: {
    row: 1,
    col: 0
  }

};


/* ============================================================
   DOM
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
  document.getElementById(
    "selectedCellCoordinates"
  );

const noCellSelected =
  document.getElementById(
    "noCellSelected"
  );

const editorControls =
  document.getElementById(
    "editorControls"
  );

const letterCellSettings =
  document.getElementById(
    "letterCellSettings"
  );

const clueCellSettings =
  document.getElementById(
    "clueCellSettings"
  );

const manualLetter =
  document.getElementById(
    "manualLetter"
  );

const addDefinitionBtn =
  document.getElementById(
    "addDefinitionBtn"
  );

const definitionsContainer =
  document.getElementById(
    "definitionsContainer"
  );

const applyDefinitionsBtn =
  document.getElementById(
    "applyDefinitionsBtn"
  );

const clearCellBtn =
  document.getElementById(
    "clearCellBtn"
  );

const wordCount =
  document.getElementById(
    "wordCount"
  );

const intersectionCount =
  document.getElementById(
    "intersectionCount"
  );

const specialWordCount =
  document.getElementById(
    "specialWordCount"
  );

const conflictCount =
  document.getElementById(
    "conflictCount"
  );

const statusIndicator =
  document.getElementById(
    "statusIndicator"
  );

const statusText =
  document.getElementById(
    "statusText"
  );

const validationPanel =
  document.getElementById(
    "validationPanel"
  );

const validationSummary =
  document.getElementById(
    "validationSummary"
  );

const validationIssues =
  document.getElementById(
    "validationIssues"
  );

const closeValidationBtn =
  document.getElementById(
    "closeValidationBtn"
  );

const definitionTemplate =
  document.getElementById(
    "definitionTemplate"
  );

const answerTemplate =
  document.getElementById(
    "answerTemplate"
  );

const toast =
  document.getElementById(
    "toast"
  );


/* ============================================================
   CREATE EMPTY CELL
============================================================ */

function createEmptyCell() {

  return {
    type: "letter",

    manualLetter: "",

    definitions: [],

    letters: []
  };

}


/* ============================================================
   CREATE ANSWER
============================================================ */

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


/* ============================================================
   CREATE DEFINITION
============================================================ */

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

function initializeGrid(
  rows,
  cols
) {

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

function getCell(
  row,
  col
) {

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
   NORMALIZE ANSWER
============================================================ */

function normalizeAnswer(value) {

  return String(
    value || ""
  )
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
    Array.isArray(
      cell.letters
    ) &&
    cell.letters.length > 0
  ) {

    return (
      cell.letters[0].letter ||
      ""
    );

  }

  return (
    cell.manualLetter ||
    ""
  );

}


/* ============================================================
   RENDER CREATOR GRID
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
        document.createElement(
          "button"
        );

      element.type = "button";

      element.className =
        "grid-cell";

      element.dataset.row =
        row;

      element.dataset.col =
        col;

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
        false,
        row,
        col
      );

      element.addEventListener(
        "click",
        () => {

          selectCell(
            row,
            col
          );

        }
      );

      crosswordGrid.appendChild(
        element
      );

    }

  }

  requestAnimationFrame(
    () => {

      fitAllClueText(
        crosswordGrid
      );

    }
  );

}


/* ============================================================
   RENDER CELL CONTENT
============================================================ */

function renderCellContent(
  element,
  cell,
  previewMode,
  row,
  col
) {

  element.innerHTML = "";

  element.classList.remove(
    "letter-cell",
    "clue-cell",
    "blocked-cell",
    "special-cell",
    "conflict"
  );


  /* ----------------------------------------------------------
     LETTER CELL
  ---------------------------------------------------------- */

  if (
    cell.type === "letter"
  ) {

    element.classList.add(
      "letter-cell"
    );

    if (
      isSpecialCell(cell)
    ) {

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
      document.createElement(
        "span"
      );

    letter.className =
      "cell-letter";

    letter.textContent =
      previewMode
        ? ""
        : getDisplayLetter(
            cell
          );

    element.appendChild(
      letter
    );

    return;

  }


  /* ----------------------------------------------------------
     BLOCKED CELL
  ---------------------------------------------------------- */

  if (
    cell.type === "blocked"
  ) {

    element.classList.add(
      "blocked-cell"
    );

    return;

  }


  /* ----------------------------------------------------------
     CLUE CELL
  ---------------------------------------------------------- */

  if (
    cell.type === "clue"
  ) {

    element.classList.add(
      "clue-cell"
    );

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "clue-cell-content";

    const definitions =
      cell.definitions || [];


    definitions.forEach(
      (
        definition,
        definitionIndex
      ) => {

        const part =
          document.createElement(
            "div"
          );

        part.className =
          "clue-part";

        part.dataset.definitionIndex =
          definitionIndex;


        /* -----------------------------------------------
           IMAGE DEFINITION
        ------------------------------------------------ */

        if (
          definition.type ===
            "image" &&
          definition.imageData
        ) {

          part.classList.add(
            "image-clue-part"
          );

          const image =
            document.createElement(
              "img"
            );

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


        /* -----------------------------------------------
           TEXT DEFINITION
        ------------------------------------------------ */

        else {

          const text =
            document.createElement(
              "span"
            );

          text.className =
            "clue-part-text";

          text.textContent =
            definition.text || "";

          /*
             We keep the definition index on the text element.

             This is useful when synchronising the fitted
             Creator font size with Preview / PDF.
          */

          text.dataset.definitionIndex =
            definitionIndex;

          part.appendChild(
            text
          );

        }


        /*
           IMPORTANT:

           Arrows are not part of clue text layout.

           They are rendered in their own absolute overlay,
           so they cannot reduce the available space for
           definition text.
        */

        wrapper.appendChild(
          part
        );

      }
    );

    element.appendChild(
      wrapper
    );


    /* -----------------------------------------------
       INDEPENDENT ARROW OVERLAY
    ------------------------------------------------ */

    const arrowLayer =
      document.createElement(
        "div"
      );

    arrowLayer.className =
      "clue-arrow-layer";


    definitions.forEach(
      (
        definition,
        definitionIndex
      ) => {

        const usedDirections =
          new Set();

        (
          definition.answers ||
          []
        ).forEach(
          (answer) => {

            if (
              !answer.word ||
              !answer.direction ||
              !ROUTES[
                answer.direction
              ]
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
              createClueArrow(
                answer.direction,
                definitionIndex,
                definitions.length
              );

            arrowLayer.appendChild(
              arrow
            );

          }
        );

      }
    );


    element.appendChild(
      arrowLayer
    );

  }

}


/* ============================================================
   CREATE CLUE ARROW
============================================================ */

function createClueArrow(
  direction,
  definitionIndex,
  definitionCount
) {

  const route =
    ROUTES[direction];

  const arrow =
    document.createElement(
      "span"
    );

  arrow.className =
    [
      "clue-route-arrow",
      `route-${direction}`,
      `route-entry-${route.entry}`,
      route.bent
        ? "route-bent"
        : "route-straight"
    ].join(" ");

  arrow.dataset.direction =
    direction;

  arrow.dataset.definitionIndex =
    definitionIndex;

  arrow.dataset.definitionCount =
    definitionCount;


  /*
     Store both the original values and a ready-to-use
     percentage.

     Example:
     1 definition  -> 50%
     2 definitions -> 25%, 75%
     3 definitions -> 16.666%, 50%, 83.333%

     This avoids relying entirely on complicated CSS
     multiplication when positioning arrows.
  */

  const definitionPosition =
    (
      (
        definitionIndex +
        0.5
      ) /
      Math.max(
        definitionCount,
        1
      )
    ) *
    100;


  arrow.style.setProperty(
    "--definition-index",
    definitionIndex
  );

  arrow.style.setProperty(
    "--definition-count",
    definitionCount
  );

  arrow.style.setProperty(
    "--definition-position",
    `${definitionPosition}%`
  );


  const lineA =
    document.createElement(
      "span"
    );

  lineA.className =
    "route-line route-line-a";

  arrow.appendChild(
    lineA
  );


  /*
     Bent arrows use two line segments.
  */

  if (route.bent) {

    const lineB =
      document.createElement(
        "span"
      );

    lineB.className =
      "route-line route-line-b";

    arrow.appendChild(
      lineB
    );

  }


  const head =
    document.createElement(
      "span"
    );

  head.className =
    "route-arrow-head";

  arrow.appendChild(
    head
  );


  return arrow;

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

function selectCell(
  row,
  col
) {

  state.selectedRow =
    row;

  state.selectedCol =
    col;

  renderGrid();

  openEditor(
    row,
    col
  );

}


/* ============================================================
   OPEN EDITOR
============================================================ */

function openEditor(
  row,
  col
) {

  const cell =
    getCell(
      row,
      col
    );

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


  if (
    cell.type === "letter"
  ) {

    showLetterSettings();

    manualLetter.value =
      getDisplayLetter(
        cell
      );

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
        button.dataset.cellType ===
          type
      );

    }
  );

}


/* ============================================================
   CHANGE CELL TYPE
============================================================ */

function changeSelectedCellType(
  type
) {

  const row =
    state.selectedRow;

  const col =
    state.selectedCol;

  const cell =
    getCell(
      row,
      col
    );

  if (!cell) {
    return;
  }


  removeWordsTouchingCell(
    row,
    col
  );


  if (
    type === "letter"
  ) {

    cell.type =
      "letter";

    cell.definitions = [];
    cell.letters = [];

    showLetterSettings();

    manualLetter.value =
      cell.manualLetter || "";

  }


  else if (
    type === "clue"
  ) {

    cell.type =
      "clue";

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

    cell.type =
      "blocked";

    cell.manualLetter = "";
    cell.definitions = [];
    cell.letters = [];

    hideSpecificSettings();

  }


  setActiveCellType(
    type
  );

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
      getSelectedCell();

    if (
      !cell ||
      cell.type !== "letter"
    ) {

      return;

    }


    const value =
      manualLetter.value
        .toLocaleUpperCase(
          "ro-RO"
        )
        .slice(
          0,
          1
        );


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

function renderDefinitionEditor(
  cell
) {

  definitionsContainer.innerHTML =
    "";

  if (
    !cell.definitions ||
    cell.definitions.length === 0
  ) {

    cell.definitions = [
      createDefinition()
    ];

  }


  cell.definitions.forEach(
    (
      definition,
      index
    ) => {

      const fragment =
        definitionTemplate
          .content
          .cloneNode(
            true
          );


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
      definition.type !==
        "text"
    );

    imagePanel.classList.toggle(
      "hidden",
      definition.type !==
        "image"
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
              reader.result ||
              ""
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

      definition.imageData =
        "";

      input.value =
        "";

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
        definition.answers.length >=
        3
      ) {

        showToast(
          "O definiție poate avea maximum 3 răspunsuri."
        );

        return;

      }


      /*
         ALL 12 ROUTES

         Straight directions are deliberately first so
         new answers receive a simple route before one
         of the bent routes is selected.
      */

      const availableRoutes =
        [
          "right",
          "left",
          "up",
          "down",

          "right-up",
          "right-down",

          "left-up",
          "left-down",

          "up-right",
          "up-left",

          "down-right",
          "down-left"
        ];


      const used =
        new Set(
          definition.answers.map(
            (answer) =>
              answer.direction
          )
        );


      const nextRoute =
        availableRoutes.find(
          (route) =>
            !used.has(route)
        ) ||
        "right";


      definition.answers.push(
        createAnswer(
          nextRoute
        )
      );


      renderDefinitionEditor(
        getSelectedCell()
      );

    }
  );

}


/* ============================================================
   RENDER ANSWERS
============================================================ */

function renderAnswersIntoCard(
  container,
  definition
) {

  container.innerHTML =
    "";


  definition.answers.forEach(
    (
      answer,
      index
    ) => {

      /*
         Compatibility protection.

         Because ROUTES now contains all four straight
         directions, existing LEFT and UP answers are
         valid and will no longer be converted to RIGHT.
      */

      if (
        !ROUTES[
          answer.direction
        ]
      ) {

        answer.direction =
          "right";

      }


      const fragment =
        answerTemplate
          .content
          .cloneNode(
            true
          );


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


      /* -----------------------------------------------
         WORD
      ------------------------------------------------ */

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


      /* -----------------------------------------------
         ROUTE
      ------------------------------------------------ */

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
                (item) => {

                  item.classList.remove(
                    "active"
                  );

                }
              );


              button.classList.add(
                "active"
              );


              answer.direction =
                button.dataset.direction;


              renderGrid();

            }
          );

        }
      );


      /* -----------------------------------------------
         SPECIAL WORD
      ------------------------------------------------ */

      const specialCheckbox =
        card.querySelector(
          ".special-word-checkbox"
        );


      specialCheckbox.checked =
        answer.special ===
        true;


      specialCheckbox.addEventListener(
        "change",
        () => {

          answer.special =
            specialCheckbox.checked;

        }
      );


      /* -----------------------------------------------
         REMOVE ANSWER
      ------------------------------------------------ */

      const removeButton =
        card.querySelector(
          ".remove-answer-button"
        );


      removeButton.addEventListener(
        "click",
        () => {

          if (
            definition.answers.length <=
            1
          ) {

            showToast(
              "O definiție trebuie să aibă cel puțin un răspuns."
            );

            return;

          }


          definition.answers =
            definition.answers.filter(
              (item) =>
                item.id !==
                answer.id
            );


          renderDefinitionEditor(
            getSelectedCell()
          );

          renderGrid();

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
      cell.type !==
        "clue"
    ) {

      return;

    }


    if (
      cell.definitions.length >=
      3
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


function moveDefinition(
  definitionId,
  offset
) {

  const cell =
    getSelectedCell();


  if (
    !cell ||
    cell.type !==
      "clue"
  ) {

    return;

  }


  const index =
    cell.definitions.findIndex(
      (definition) =>
        definition.id ===
        definitionId
    );


  if (
    index === -1
  ) {

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


  const [definition] =
    cell.definitions.splice(
      index,
      1
    );


  cell.definitions.splice(
    newIndex,
    0,
    definition
  );


  /*
     The complete definition object moves,
     including all answers, directions,
     special-word settings and image data.
  */

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
        cell.type !==
          "clue"
      ) {

        return;

      }


      if (
        cell.definitions.length <=
        1
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
   DEFINITION BUTTON STATES
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
    (
      card,
      index
    ) => {

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
   END OF PART 1
   PART 2 CONTINUES WITH APPLY DEFINITIONS + WORD PLACEMENT
============================================================ *//* ============================================================
   APPLY DEFINITIONS
============================================================ */

applyDefinitionsBtn.addEventListener(
  "click",
  applySelectedDefinitions
);


function applySelectedDefinitions() {

  const row =
    state.selectedRow;

  const col =
    state.selectedCol;

  const cell =
    getCell(
      row,
      col
    );


  if (
    !cell ||
    cell.type !==
      "clue"
  ) {

    return;

  }


  if (
    !cell.definitions ||
    cell.definitions.length ===
      0
  ) {

    showToast(
      "Adaugă cel puțin o definiție."
    );

    return;

  }


  /* ----------------------------------------------------------
     VALIDATE DEFINITIONS
  ---------------------------------------------------------- */

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
      definition.type ===
        "text" &&
      !definition.text.trim()
    ) {

      showToast(
        `Scrie textul pentru definiția ${definitionIndex + 1}.`
      );

      return;

    }


    if (
      definition.type ===
        "image" &&
      !definition.imageData
    ) {

      showToast(
        `Alege imaginea pentru definiția ${definitionIndex + 1}.`
      );

      return;

    }


    if (
      !definition.answers ||
      definition.answers.length ===
        0
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


      if (
        !answer.word
      ) {

        showToast(
          `Scrie răspunsul ${answerIndex + 1} pentru definiția ${definitionIndex + 1}.`
        );

        return;

      }


      /*
         All 12 directions are valid now:

         right
         left
         up
         down

         right-up
         right-down
         left-up
         left-down
         up-right
         up-left
         down-right
         down-left
      */

      if (
        !ROUTES[
          answer.direction
        ]
      ) {

        showToast(
          `Direcția răspunsului ${answerIndex + 1} nu este validă.`
        );

        return;

      }


      /*
         Prevent two answers belonging to the SAME
         definition from using the exact same route.

         This still allows, for example:

         right
         right-up
         right-down

         because these are three different routes.
      */

      if (
        directionSet.has(
          answer.direction
        )
      ) {

        showToast(
          `Definiția ${definitionIndex + 1} are două răspunsuri cu aceeași direcție.`
        );

        return;

      }


      directionSet.add(
        answer.direction
      );

    }

  }


  /*
     Create a complete backup before changing existing
     word placements.

     If any new answer cannot be placed, the old grid
     is restored.
  */

  const backup =
    createGridBackup();


  /*
     Remove only words belonging to this clue cell.

     Other clue cells and their words remain untouched.
  */

  removeWordsOwnedByClueCell(
    row,
    col
  );


  const placements =
    [];


  /* ----------------------------------------------------------
     CALCULATE ALL NEW PLACEMENTS
  ---------------------------------------------------------- */

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


      if (
        !placement.valid
      ) {

        restoreGridBackup(
          backup
        );

        showToast(
          placement.message
        );

        return;

      }


      const newPlacement = {

        ...placement,

        word:
          answer.word,

        answer,

        definition,

        definitionIndex,

        answerIndex

      };


      /*
         Compare the new answer with the other new
         answers being placed from this clue cell.

         Matching letters may intersect.

         Different letters in the same cell are rejected.
      */

      for (
        const previous
        of placements
      ) {

        const conflict =
          compareNewPlacements(
            previous,
            newPlacement
          );


        if (
          conflict
        ) {

          restoreGridBackup(
            backup
          );

          showToast(
            `Conflict între răspunsurile noi la rândul ${conflict.row + 1}, coloana ${conflict.col + 1}.`
          );

          return;

        }

      }


      placements.push(
        newPlacement
      );

    }

  }


  /* ----------------------------------------------------------
     COMMIT ALL PLACEMENTS
  ---------------------------------------------------------- */

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

        entry:
          placement.entry,

        travel:
          placement.travel,

        special:
          placement.answer.special,

        cells:
          placement.cells

      };


      state.words.push(
        word
      );


      placement.cells.forEach(
        (
          position,
          letterIndex
        ) => {

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

   ALL STRAIGHT DIRECTIONS

   RIGHT:

   [CLUE][1][2][3][4]


   LEFT:

   [4][3][2][1][CLUE]


   DOWN:

   [CLUE]
     [1]
     [2]
     [3]


   UP:

     [3]
     [2]
     [1]
   [CLUE]


   BENT EXAMPLE: RIGHT → DOWN

   [CLUE][1]
          [2]
          [3]
          [4]


   BENT EXAMPLE: DOWN → RIGHT

   [CLUE]
     [1][2][3][4]


   Therefore:

   - first letter is adjacent to clue on ENTRY side
   - remaining letters move in TRAVEL direction

   The same engine works for all 12 routes.
============================================================ */

function calculatePlacement(
  clueRow,
  clueCol,
  answer,
  routeName
) {

  const route =
    ROUTES[
      routeName
    ];


  if (
    !route
  ) {

    return {
      valid: false,

      message:
        "Direcția răspunsului nu este validă."
    };

  }


  const entryVector =
    VECTORS[
      route.entry
    ];

  const travelVector =
    VECTORS[
      route.travel
    ];


  let row =
    clueRow +
    entryVector.row;

  let col =
    clueCol +
    entryVector.col;


  const cells =
    [];


  for (
    let index = 0;
    index <
      answer.length;
    index++
  ) {

    /*
       First character:
       immediately outside clue.

       Every later character:
       move using travel vector first.
    */

    if (
      index > 0
    ) {

      row +=
        travelVector.row;

      col +=
        travelVector.col;

    }


    /* --------------------------------------------------------
       OUTSIDE GRID
    -------------------------------------------------------- */

    if (
      row < 0 ||
      row >= state.rows ||
      col < 0 ||
      col >= state.cols
    ) {

      return {

        valid: false,

        message:
          `Răspunsul „${answer}” nu încape în grilă pe traseul ${route.label}.`

      };

    }


    const target =
      getCell(
        row,
        col
      );


    /* --------------------------------------------------------
       CLUE CELL COLLISION
    -------------------------------------------------------- */

    if (
      target.type ===
        "clue"
    ) {

      return {

        valid: false,

        message:
          `Răspunsul „${answer}” ar trece printr-o căsuță cu definiție.`

      };

    }


    /* --------------------------------------------------------
       BLOCKED CELL COLLISION
    -------------------------------------------------------- */

    if (
      target.type ===
        "blocked"
    ) {

      return {

        valid: false,

        message:
          `Răspunsul „${answer}” ar trece printr-o căsuță blocată.`

      };

    }


    const requiredLetter =
      answer[index];


    /* --------------------------------------------------------
       EXISTING LINKED LETTER
    -------------------------------------------------------- */

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
        existingLetters.size >
          0 &&
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


    /* --------------------------------------------------------
       MANUAL LETTER
    -------------------------------------------------------- */

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

  }


  return {

    valid: true,

    cells,

    entry:
      route.entry,

    travel:
      route.travel,

    route:
      routeName

  };

}


/* ============================================================
   COMPARE NEW PLACEMENTS
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
        cellA.row ===
          cellB.row &&
        cellA.col ===
          cellB.col
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
          letterA !==
            letterB
        ) {

          return {
            row:
              cellA.row,

            col:
              cellA.col
          };

        }

      }

    }

  }


  return null;

}


/* ============================================================
   REMOVE WORD
============================================================ */

function removeWordById(
  wordId
) {

  const word =
    state.words.find(
      (item) =>
        item.id ===
        wordId
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
        item.id !==
        wordId
    );

}


/* ============================================================
   REMOVE WORDS OWNED BY CLUE
============================================================ */

function removeWordsOwnedByClueCell(
  row,
  col
) {

  const ids =
    state.words
      .filter(
        (word) =>
          word.clueRow ===
            row &&
          word.clueCol ===
            col
      )
      .map(
        (word) =>
          word.id
      );


  ids.forEach(
    (id) =>
      removeWordById(
        id
      )
  );


  const cell =
    getCell(
      row,
      col
    );


  if (
    cell &&
    cell.definitions
  ) {

    cell.definitions.forEach(
      (definition) => {

        definition.answers.forEach(
          (answer) => {

            answer.wordId =
              null;

          }
        );

      }
    );

  }

}


/* ============================================================
   REMOVE WORDS TOUCHING CELL
============================================================ */

function removeWordsTouchingCell(
  row,
  col
) {

  const cell =
    getCell(
      row,
      col
    );


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
      (item) => {

        ids.add(
          item.wordId
        );

      }
    );

  }


  state.words
    .filter(
      (word) =>
        word.clueRow ===
          row &&
        word.clueCol ===
          col
    )
    .forEach(
      (word) => {

        ids.add(
          word.id
        );

      }
    );


  ids.forEach(
    (id) =>
      removeWordById(
        id
      )
  );

}


/* ============================================================
   BACKUP
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
   RESTORE BACKUP
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
   CLEAR CELL
============================================================ */

clearCellBtn.addEventListener(
  "click",
  () => {

    if (
      state.selectedRow ===
        null ||
      state.selectedCol ===
        null
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

function hasLetterConflict(
  cell
) {

  if (
    !cell ||
    cell.type !==
      "letter"
  ) {

    return false;

  }


  const letters =
    (
      cell.letters ||
      []
    ).map(
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
      letters.filter(
        Boolean
      )
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
        cell.type ===
          "letter" &&
        Array.isArray(
          cell.letters
        ) &&
        cell.letters.length > 1
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
      word.special ===
      true
  ).length;

}


/* ============================================================
   COUNT CURRENT CONFLICTS
============================================================ */

function countCurrentConflicts() {

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
   UPDATE STATISTICS
============================================================ */

function updateStatistics() {

  const words =
    state.words.length;

  const intersections =
    countIntersections();

  const special =
    countSpecialWords();

  const conflicts =
    countCurrentConflicts();


  wordCount.textContent =
    words;

  intersectionCount.textContent =
    intersections;

  specialWordCount.textContent =
    special;

  conflictCount.textContent =
    conflicts;


  if (
    conflicts > 0
  ) {

    statusIndicator.className =
      "status-indicator error";

    statusText.textContent =
      "Grila conține conflicte.";

  }

  else if (
    words > 0
  ) {

    statusIndicator.className =
      "status-indicator success";

    statusText.textContent =
      "Grila nu are conflicte de litere.";

  }

  else {

    statusIndicator.className =
      "status-indicator neutral";

    statusText.textContent =
      "Grila este pregătită.";

  }

}


/* ============================================================
   NON-DESTRUCTIVE GRID RESIZE
============================================================ */

resizeGridBtn.addEventListener(
  "click",
  resizeGridNonDestructive
);


function resizeGridNonDestructive() {

  const newRows =
    Number(
      gridRowsInput.value
    );

  const newCols =
    Number(
      gridColsInput.value
    );


  if (
    !Number.isInteger(
      newRows
    ) ||
    !Number.isInteger(
      newCols
    ) ||
    newRows < 5 ||
    newRows > 30 ||
    newCols < 5 ||
    newCols > 30
  ) {

    showToast(
      "Dimensiunile grilei trebuie să fie între 5 și 30."
    );

    gridRowsInput.value =
      state.rows;

    gridColsInput.value =
      state.cols;

    return;

  }


  if (
    newRows ===
      state.rows &&
    newCols ===
      state.cols
  ) {

    showToast(
      "Grila are deja aceste dimensiuni."
    );

    return;

  }


  const issues =
    findResizeConflicts(
      newRows,
      newCols
    );


  /*
     IMPORTANT:
     shrinking is cancelled completely if any content
     would disappear.
  */

  if (
    issues.length > 0
  ) {

    gridRowsInput.value =
      state.rows;

    gridColsInput.value =
      state.cols;


    showValidationIssues(
      issues,
      "Redimensionarea a fost anulată pentru a proteja conținutul existent."
    );


    showToast(
      "Grila nu a fost redimensionată deoarece unele editări ar fi șterse."
    );

    return;

  }


  const oldRows =
    state.rows;

  const oldCols =
    state.cols;


  /* ----------------------------------------------------------
     ADD NEW COLUMNS TO EXISTING ROWS
  ---------------------------------------------------------- */

  if (
    newCols >
      oldCols
  ) {

    state.grid.forEach(
      (rowArray) => {

        for (
          let col = oldCols;
          col < newCols;
          col++
        ) {

          rowArray.push(
            createEmptyCell()
          );

        }

      }
    );

  }


  /* ----------------------------------------------------------
     ADD NEW ROWS
  ---------------------------------------------------------- */

  if (
    newRows >
      oldRows
  ) {

    for (
      let row = oldRows;
      row < newRows;
      row++
    ) {

      const rowArray =
        [];


      for (
        let col = 0;
        col < newCols;
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

  }


  /* ----------------------------------------------------------
     SAFE COLUMN SHRINK
  ---------------------------------------------------------- */

  if (
    newCols <
      oldCols
  ) {

    state.grid.forEach(
      (rowArray) => {

        rowArray.length =
          newCols;

      }
    );

  }


  /* ----------------------------------------------------------
     SAFE ROW SHRINK
  ---------------------------------------------------------- */

  if (
    newRows <
      oldRows
  ) {

    state.grid.length =
      newRows;

  }


  state.rows =
    newRows;

  state.cols =
    newCols;


  /*
     If selected cell was in an empty region that was
     safely removed, clear selection.
  */

  if (
    state.selectedRow !==
      null &&
    (
      state.selectedRow >=
        newRows ||
      state.selectedCol >=
        newCols
    )
  ) {

    state.selectedRow =
      null;

    state.selectedCol =
      null;

    closeEditor();

  }


  renderGrid();

  updateStatistics();

  hideValidationPanel();


  showToast(
    `Grila a fost redimensionată la ${newRows} × ${newCols} fără a șterge editările existente.`
  );

}


/* ============================================================
   FIND RESIZE CONFLICTS
============================================================ */

function findResizeConflicts(
  newRows,
  newCols
) {

  const issues =
    [];


  /*
     Check every cell that would disappear.
  */

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
        row < newRows &&
        col < newCols
      ) {

        continue;

      }


      const cell =
        state.grid[row][col];


      if (
        !cell
      ) {

        continue;

      }


      if (
        cell.type ===
          "clue"
      ) {

        issues.push(
          `Rândul ${row + 1}, coloana ${col + 1} conține o definiție și nu poate fi eliminat.`
        );

        continue;

      }


      if (
        cell.type ===
          "blocked"
      ) {

        issues.push(
          `Rândul ${row + 1}, coloana ${col + 1} este o căsuță blocată și nu poate fi eliminată.`
        );

        continue;

      }


      if (
        cell.manualLetter
      ) {

        issues.push(
          `Rândul ${row + 1}, coloana ${col + 1} conține litera manuală „${cell.manualLetter}”.`
        );

        continue;

      }


      if (
        cell.letters &&
        cell.letters.length >
          0
      ) {

        issues.push(
          `Rândul ${row + 1}, coloana ${col + 1} face parte dintr-un răspuns existent.`
        );

      }

    }

  }


  /*
     Extra word-level protection.

     This makes sure no placed word would become partly
     outside the resized grid.
  */

  state.words.forEach(
    (word) => {

      const outside =
        word.cells.some(
          (position) =>
            position.row >=
              newRows ||
            position.col >=
              newCols
        );


      if (
        outside
      ) {

        const alreadyReported =
          issues.some(
            (issue) =>
              issue.includes(
                `„${word.answer}”`
              )
          );


        if (
          !alreadyReported
        ) {

          issues.push(
            `Răspunsul „${word.answer}” ar fi tăiat de noile dimensiuni ale grilei.`
          );

        }

      }

    }
  );


  return [
    ...new Set(
      issues
    )
  ];

}


/* ============================================================
   VALIDATION PANEL HELPERS
============================================================ */

function showValidationIssues(
  issues,
  summaryText =
    ""
) {

  validationPanel.classList.remove(
    "hidden"
  );


  validationSummary.textContent =
    summaryText ||
    (
      issues.length === 0
        ? "Nu au fost găsite probleme."
        : `Au fost găsite ${issues.length} probleme.`
    );


  validationIssues.innerHTML =
    "";


  if (
    issues.length === 0
  ) {

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "validation-item success";

    item.textContent =
      "Grila nu conține probleme structurale detectabile.";

    validationIssues.appendChild(
      item
    );

    return;

  }


  issues.forEach(
    (issue) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "validation-item";

      item.textContent =
        issue;

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


function hideValidationPanel() {

  validationPanel.classList.add(
    "hidden"
  );

}


closeValidationBtn.addEventListener(
  "click",
  hideValidationPanel
);


/* ============================================================
   END OF PART 2

   PART 3 CONTINUES WITH:
   - CHECK GRID
   - VALIDATION
   - PREVIEW
   - DEFINITION TEXT FITTING
   - THE PDF FITTING FIX
============================================================ *//* ============================================================
   CHECK GRID
============================================================ */

checkGridBtn.addEventListener(
  "click",
  checkGrid
);


function checkGrid() {

  const issues =
    collectValidationIssues();


  if (
    issues.length === 0
  ) {

    showValidationIssues(
      [],
      "Grila a fost verificată. Nu au fost găsite probleme."
    );

    showToast(
      "Grila nu conține probleme detectabile."
    );

  }

  else {

    showValidationIssues(
      issues,
      `Au fost găsite ${issues.length} probleme care necesită atenție.`
    );

    showToast(
      `Au fost găsite ${issues.length} probleme.`
    );

  }


  renderGrid();

  updateStatistics();

}


/* ============================================================
   COLLECT VALIDATION ISSUES
============================================================ */

function collectValidationIssues() {

  const issues =
    [];


  /* ----------------------------------------------------------
     CELL-LEVEL CHECKS
  ---------------------------------------------------------- */

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
        !cell
      ) {

        continue;

      }


      /* ------------------------------------------------------
         LETTER CONFLICT
      ------------------------------------------------------ */

      if (
        cell.type ===
          "letter" &&
        hasLetterConflict(
          cell
        )
      ) {

        issues.push(
          `Conflict de litere la rândul ${row + 1}, coloana ${col + 1}.`
        );

      }


      /* ------------------------------------------------------
         ORPHAN MANUAL LETTER
      ------------------------------------------------------ */

      if (
        cell.type ===
          "letter" &&
        cell.manualLetter &&
        (
          !cell.letters ||
          cell.letters.length ===
            0
        )
      ) {

        issues.push(
          `Litera manuală „${cell.manualLetter}” de la rândul ${row + 1}, coloana ${col + 1} nu aparține unui răspuns plasat.`
        );

      }


      /* ------------------------------------------------------
         CLUE VALIDATION
      ------------------------------------------------------ */

      if (
        cell.type ===
          "clue"
      ) {

        const definitions =
          cell.definitions ||
          [];


        if (
          definitions.length ===
            0
        ) {

          issues.push(
            `Căsuța cu definiție de la rândul ${row + 1}, coloana ${col + 1} nu conține nicio definiție.`
          );

          continue;

        }


        definitions.forEach(
          (
            definition,
            definitionIndex
          ) => {

            /* ----------------------------------------------
               DEFINITION CONTENT
            ---------------------------------------------- */

            if (
              definition.type ===
                "text" &&
              !String(
                definition.text ||
                ""
              ).trim()
            ) {

              issues.push(
                `Definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} nu are text.`
              );

            }


            if (
              definition.type ===
                "image" &&
              !definition.imageData
            ) {

              issues.push(
                `Definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} nu are imagine.`
              );

            }


            const answers =
              definition.answers ||
              [];


            if (
              answers.length ===
                0
            ) {

              issues.push(
                `Definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} nu are niciun răspuns.`
              );

              return;

            }


            const directions =
              new Set();


            answers.forEach(
              (
                answer,
                answerIndex
              ) => {

                const normalized =
                  normalizeAnswer(
                    answer.word
                  );


                if (
                  !normalized
                ) {

                  issues.push(
                    `Răspunsul ${answerIndex + 1} pentru definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} este gol.`
                  );

                }


                if (
                  !ROUTES[
                    answer.direction
                  ]
                ) {

                  issues.push(
                    `Răspunsul ${answerIndex + 1} pentru definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} are o direcție invalidă.`
                  );

                }


                if (
                  directions.has(
                    answer.direction
                  )
                ) {

                  issues.push(
                    `Definiția ${definitionIndex + 1} de la rândul ${row + 1}, coloana ${col + 1} folosește aceeași direcție pentru mai multe răspunsuri.`
                  );

                }


                directions.add(
                  answer.direction
                );


                /*
                   An answer may have text entered in the
                   editor but not yet have been applied.

                   In that case wordId is still null.
                */

                if (
                  normalized &&
                  !answer.wordId
                ) {

                  issues.push(
                    `Răspunsul „${normalized}” de la rândul ${row + 1}, coloana ${col + 1} nu a fost încă aplicat în grilă.`
                  );

                }

              }
            );

          }
        );

      }

    }

  }


  /* ----------------------------------------------------------
     WORD-LEVEL CHECKS
  ---------------------------------------------------------- */

  state.words.forEach(
    (word) => {

      if (
        !ROUTES[
          word.direction
        ]
      ) {

        issues.push(
          `Răspunsul „${word.answer}” are o direcție care nu mai este validă.`
        );

        return;

      }


      if (
        !Array.isArray(
          word.cells
        ) ||
        word.cells.length !==
          word.answer.length
      ) {

        issues.push(
          `Răspunsul „${word.answer}” are o structură incompletă în grilă.`
        );

        return;

      }


      word.cells.forEach(
        (
          position,
          index
        ) => {

          const cell =
            getCell(
              position.row,
              position.col
            );


          if (
            !cell
          ) {

            issues.push(
              `Răspunsul „${word.answer}” depășește limitele grilei.`
            );

            return;

          }


          if (
            cell.type !==
              "letter"
          ) {

            issues.push(
              `Răspunsul „${word.answer}” trece printr-o celulă care nu mai este de tip literă.`
            );

            return;

          }


          const expectedLetter =
            word.answer[index];


          const matchingMembership =
            (
              cell.letters ||
              []
            ).some(
              (item) =>
                item.wordId ===
                  word.id &&
                item.letter ===
                  expectedLetter
            );


          if (
            !matchingMembership
          ) {

            issues.push(
              `Răspunsul „${word.answer}” nu mai este conectat corect la toate celulele sale.`
            );

          }

        }
      );

    }
  );


  return [
    ...new Set(
      issues
    )
  ];

}


/* ============================================================
   CREATOR / PREVIEW MODE
============================================================ */

creatorModeBtn.addEventListener(
  "click",
  () => {

    setViewMode(
      "creator"
    );

  }
);


previewModeBtn.addEventListener(
  "click",
  () => {

    setViewMode(
      "preview"
    );

  }
);


function setViewMode(mode) {

  state.mode =
    mode;


  const creatorActive =
    mode ===
    "creator";


  creatorView.classList.toggle(
    "hidden",
    !creatorActive
  );

  creatorToolbar.classList.toggle(
    "hidden",
    !creatorActive
  );


  previewView.classList.toggle(
    "hidden",
    creatorActive
  );


  creatorModeBtn.classList.toggle(
    "active",
    creatorActive
  );

  previewModeBtn.classList.toggle(
    "active",
    !creatorActive
  );


  if (
    !creatorActive
  ) {

    renderPreviewGrid();

  }

  else {

    /*
       Refit Creator after returning from Preview.

       This is useful if the browser viewport changed while
       Preview was open.
    */

    requestAnimationFrame(
      () => {

        fitAllClueText(
          crosswordGrid
        );

      }
    );

  }

}


/* ============================================================
   RENDER PREVIEW GRID

   IMPORTANT PDF FIX:

   The old approach could try to fit text while the Preview
   section was display:none.

   An element with display:none has no measurable width or
   height, so scrollWidth/clientWidth and similar values are
   not reliable.

   This function renders the Preview normally. If Preview is
   already visible, its text is fitted immediately.

   Printing uses preparePreviewForPrint(), further below,
   which temporarily makes Preview measurable even when the
   user is currently in Creator mode.
============================================================ */

function renderPreviewGrid(
  options = {}
) {

  const {
    fitText = true
  } = options;


  previewGrid.innerHTML =
    "";


  previewGrid.style.gridTemplateColumns =
    `repeat(${state.cols}, var(--cell-size))`;


  previewTitle.textContent =
    puzzleTitle.value.trim() ||
    "Integramă";


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


      element.dataset.row =
        row;

      element.dataset.col =
        col;


      renderCellContent(
        element,
        cell,
        true,
        row,
        col
      );


      previewGrid.appendChild(
        element
      );

    }

  }


  if (
    fitText &&
    isElementMeasurable(
      previewGrid
    )
  ) {

    fitAllClueText(
      previewGrid
    );

  }

}


/* ============================================================
   IS ELEMENT MEASURABLE
============================================================ */

function isElementMeasurable(
  element
) {

  if (
    !element
  ) {

    return false;

  }


  const rect =
    element.getBoundingClientRect();


  return (
    rect.width > 0 &&
    rect.height > 0
  );

}


/* ============================================================
   CLUE TEXT FITTING

   RULES:

   - text must remain completely inside its clue subsection
   - words must not be split in the middle
   - no automatic hyphenation
   - short definitions remain larger
   - long definitions shrink
   - arrows do NOT participate in fitting
   - images are ignored by this function

   IMPORTANT:

   The function now waits for a measurable grid.

   It also stores the fitted font size directly on each
   .clue-part-text element. That inline size remains intact
   when the whole Preview grid is scaled for PDF.
============================================================ */

function fitAllClueText(
  root
) {

  if (
    !root ||
    !isElementMeasurable(
      root
    )
  ) {

    return;

  }


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
   FIT ONE CLUE TEXT ELEMENT
============================================================ */

function fitClueText(
  element
) {

  if (
    !element
  ) {

    return null;

  }


  const container =
    element.closest(
      ".clue-part"
    );


  if (
    !container ||
    !isElementMeasurable(
      container
    )
  ) {

    return null;

  }


  /*
     Remove any previous fitted value first.

     This ensures editing a definition causes the browser to
     calculate the new size from the maximum again instead of
     being trapped at an older smaller size.
  */

  element.style.removeProperty(
    "font-size"
  );

  element.style.removeProperty(
    "line-height"
  );


  /*
     These values intentionally match the original fitting
     behaviour closely.

     10px = maximum definition font size.
     5px  = minimum definition font size.
  */

  const maximumFontSize =
    10;

  const minimumFontSize =
    5;

  const step =
    0.25;


  let fontSize =
    maximumFontSize;


  /*
     Explicitly reinforce the clue rules at runtime.

     CSS will also contain these rules, but setting them here
     protects the Preview/PDF against print-style overrides.
  */

  element.style.wordBreak =
    "normal";

  element.style.overflowWrap =
    "normal";

  element.style.hyphens =
    "none";

  element.style.whiteSpace =
    "normal";


  element.style.fontSize =
    `${fontSize}px`;

  element.style.lineHeight =
    "1.05";


  /*
     A tiny tolerance avoids unnecessary shrinking caused by
     sub-pixel rounding in Chromium.
  */

  const tolerance =
    0.5;


  while (
    fontSize >
      minimumFontSize &&
    (
      element.scrollWidth >
        element.clientWidth +
          tolerance ||
      element.scrollHeight >
        element.clientHeight +
          tolerance
    )
  ) {

    fontSize -=
      step;


    element.style.fontSize =
      `${fontSize}px`;

  }


  /*
     Lock the final calculated values inline.

     transform: scale() used later for A4 does not cause the
     browser to recalculate this font size.
  */

  const finalSize =
    Math.max(
      fontSize,
      minimumFontSize
    );


  element.style.fontSize =
    `${finalSize}px`;

  element.style.lineHeight =
    "1.05";


  element.dataset.fittedFontSize =
    String(
      finalSize
    );


  return finalSize;

}


/* ============================================================
   FIT CREATOR + PREVIEW CONSISTENTLY

   Creator and Preview use identical cell dimensions, so the
   same fitting algorithm should produce the same result.

   This helper is primarily used before printing.
============================================================ */

function fitVisibleGridText() {

  if (
    isElementMeasurable(
      crosswordGrid
    )
  ) {

    fitAllClueText(
      crosswordGrid
    );

  }


  if (
    isElementMeasurable(
      previewGrid
    )
  ) {

    fitAllClueText(
      previewGrid
    );

  }

}


/* ============================================================
   WAIT FOR IMAGES

   Image definitions may still be decoding when Preview is
   created.

   Waiting for them before final print preparation prevents
   the browser from changing layout immediately after the
   print scale has been calculated.
============================================================ */

async function waitForPreviewImages() {

  const images =
    [
      ...previewGrid.querySelectorAll(
        "img"
      )
    ];


  if (
    images.length === 0
  ) {

    return;

  }


  await Promise.all(
    images.map(
      (image) => {

        if (
          image.complete
        ) {

          if (
            typeof image.decode ===
              "function"
          ) {

            return image
              .decode()
              .catch(
                () => {}
              );

          }


          return Promise.resolve();

        }


        return new Promise(
          (resolve) => {

            const finish =
              () => {

                resolve();

              };


            image.addEventListener(
              "load",
              finish,
              {
                once: true
              }
            );


            image.addEventListener(
              "error",
              finish,
              {
                once: true
              }
            );

          }
        );

      }
    )
  );

}


/* ============================================================
   NEXT FRAME
============================================================ */

function nextFrame() {

  return new Promise(
    (resolve) => {

      requestAnimationFrame(
        () => {

          requestAnimationFrame(
            resolve
          );

        }
      );

    }
  );

}


/* ============================================================
   PREPARE PREVIEW FOR PRINT

   THIS IS THE MAIN PDF FIX.

   Problem:
   --------
   Preview may be hidden while the user presses Print.

   Hidden elements cannot be accurately measured, therefore
   clue text could be fitted incorrectly before the PDF was
   generated.

   Fix:
   ----
   1. Render Preview.
   2. Temporarily make the Preview measurable off-screen.
   3. Wait for browser layout.
   4. Wait for image clues.
   5. Fit definition text at REAL cell dimensions.
   6. Lock those font sizes inline.
   7. Calculate one uniform A4 scale for the WHOLE grid.
   8. Restore the temporary screen visibility settings.
   9. Print.

   The clue text therefore scales WITH its box rather than
   being independently recalculated by the print layout.
============================================================ */

async function preparePreviewForPrint() {

  /*
     First render without fitting.

     We intentionally postpone fitting until we know the
     Preview has measurable dimensions.
  */

  renderPreviewGrid({
    fitText: false
  });


  const previewWasHidden =
    previewView.classList.contains(
      "hidden"
    );


  const originalStyle = {
    position:
      previewView.style.position,

    left:
      previewView.style.left,

    top:
      previewView.style.top,

    width:
      previewView.style.width,

    visibility:
      previewView.style.visibility,

    pointerEvents:
      previewView.style.pointerEvents,

    display:
      previewView.style.display
  };


  /*
     If the user is in Creator mode, Preview is hidden.

     Temporarily remove the hidden class and place Preview
     far outside the visible viewport.

     visibility:hidden still allows layout measurement.
  */

  if (
    previewWasHidden
  ) {

    previewView.classList.remove(
      "hidden"
    );


    previewView.style.position =
      "absolute";

    previewView.style.left =
      "-100000px";

    previewView.style.top =
      "0";

    previewView.style.width =
      "max-content";

    previewView.style.visibility =
      "hidden";

    previewView.style.pointerEvents =
      "none";

    previewView.style.display =
      "block";

  }


  /*
     Allow the browser to calculate the actual 48px grid
     cells and clue subsection sizes.
  */

  await nextFrame();


  /*
     Make sure image definitions have completed their layout.
  */

  await waitForPreviewImages();


  await nextFrame();


  /*
     Fit text BEFORE applying the print transform.
  */

  fitAllClueText(
    previewGrid
  );


  /*
     One more layout pass after font sizes have been locked.
  */

  await nextFrame();


  /*
     Calculate uniform scale for A4.

     This must happen AFTER definition text has been fitted.
  */

  preparePrintScale();


  await nextFrame();


  /*
     Restore the Preview's screen state.

     IMPORTANT:
     We do NOT rebuild the Preview here.

     Rebuilding it would throw away the fitted inline font
     sizes we just calculated.
  */

  if (
    previewWasHidden
  ) {

    previewView.classList.add(
      "hidden"
    );

  }


  previewView.style.position =
    originalStyle.position;

  previewView.style.left =
    originalStyle.left;

  previewView.style.top =
    originalStyle.top;

  previewView.style.width =
    originalStyle.width;

  previewView.style.visibility =
    originalStyle.visibility;

  previewView.style.pointerEvents =
    originalStyle.pointerEvents;

  previewView.style.display =
    originalStyle.display;

}


/* ============================================================
   PREPARE PRINT SCALE

   IMPORTANT:

   We scale the complete grid as one object.

   We do NOT:
   - resize individual cells
   - recalculate clue font size
   - alter image proportions
   - alter arrow proportions

   Therefore what the user sees in Preview is preserved
   proportionally in the PDF.
============================================================ */

function preparePrintScale() {

  const scaleContainer =
    document.getElementById(
      "previewGridScale"
    );


  const printArea =
    document.getElementById(
      "printGridArea"
    );


  if (
    !scaleContainer ||
    !printArea ||
    !previewGrid
  ) {

    return;

  }


  /*
     Remove previous scale first so measurements always use
     the original grid dimensions.
  */

  scaleContainer.style.transform =
    "none";

  scaleContainer.style.transformOrigin =
    "top left";


  /*
     Width and height of the complete unscaled grid.

     scrollWidth/scrollHeight are useful here because arrows
     can extend visually beyond their clue boxes.
  */

  const gridWidth =
    Math.max(
      previewGrid.scrollWidth,
      previewGrid.offsetWidth
    );

  const gridHeight =
    Math.max(
      previewGrid.scrollHeight,
      previewGrid.offsetHeight
    );


  if (
    !gridWidth ||
    !gridHeight
  ) {

    return;

  }


  /*
     A4-friendly printable target.

     These values preserve the previous general behaviour:
     approximately 740px × 980px of usable grid space.

     The scale is always uniform.
  */

  const maxWidth =
    740;

  const maxHeight =
    980;


  const widthScale =
    maxWidth /
    gridWidth;

  const heightScale =
    maxHeight /
    gridHeight;


  /*
     Never enlarge a smaller grid.

     Only shrink when necessary.
  */

  const scale =
    Math.min(
      1,
      widthScale,
      heightScale
    );


  scaleContainer.style.transform =
    `scale(${scale})`;

  scaleContainer.style.transformOrigin =
    "top left";


  /*
     Because CSS transforms do not alter document flow,
     give the print area the scaled dimensions explicitly.

     This prevents excessive blank space after the grid.
  */

  printArea.style.width =
    `${gridWidth * scale}px`;

  printArea.style.height =
    `${gridHeight * scale}px`;


  scaleContainer.dataset.printScale =
    String(
      scale
    );

}


/* ============================================================
   CLEAR PRINT SCALE
============================================================ */

function clearPrintScale() {

  const scaleContainer =
    document.getElementById(
      "previewGridScale"
    );

  const printArea =
    document.getElementById(
      "printGridArea"
    );


  if (
    scaleContainer
  ) {

    scaleContainer.style.transform =
      "";

    scaleContainer.style.transformOrigin =
      "";

    delete scaleContainer.dataset.printScale;

  }


  if (
    printArea
  ) {

    printArea.style.width =
      "";

    printArea.style.height =
      "";

  }

}


/* ============================================================
   PRINT / SAVE AS PDF

   The print dialog is opened only after Preview has been
   measured, clue text fitted, and the whole grid scaled.
============================================================ */

printBtn.addEventListener(
  "click",
  async () => {

    /*
       Disable the button while preparing print layout so a
       double-click cannot launch overlapping print jobs.
    */

    printBtn.disabled =
      true;


    try {

      await preparePreviewForPrint();


      /*
         Give Chromium one final frame with the locked
         definition font sizes and grid transform.
      */

      await nextFrame();


      window.print();

    }

    catch (
      error
    ) {

      console.error(
        "Print preparation failed:",
        error
      );


      showToast(
        "Previzualizarea pentru PDF nu a putut fi pregătită."
      );

    }

    finally {

      printBtn.disabled =
        false;

    }

  }
);


/* ============================================================
   AFTER PRINT

   Keep the normal Preview clean after the print dialog
   closes.

   If Preview mode is currently active we render it again
   normally and refit it at its normal dimensions.
============================================================ */

window.addEventListener(
  "afterprint",
  () => {

    clearPrintScale();


    if (
      state.mode ===
        "preview"
    ) {

      renderPreviewGrid();

    }

  }
);


/* ============================================================
   PUZZLE TITLE
============================================================ */

puzzleTitle.addEventListener(
  "input",
  () => {

    previewTitle.textContent =
      puzzleTitle.value.trim() ||
      "Integramă";

  }
);


/* ============================================================
   BEFORE PRINT FALLBACK

   Some browsers may trigger print through the keyboard
   shortcut rather than our button.

   We cannot perform an awaited preparation inside the native
   beforeprint event, but we can at least ensure an already
   visible Preview has fitted clue text.

   The application's own "Tipărește / PDF" button remains the
   preferred print route because it runs the complete async
   preparation sequence above.
============================================================ */

window.addEventListener(
  "beforeprint",
  () => {

    if (
      isElementMeasurable(
        previewGrid
      )
    ) {

      fitAllClueText(
        previewGrid
      );

      preparePrintScale();

    }

  }
);


/* ============================================================
   REFIT ON WINDOW RESIZE

   Creator normally keeps fixed-size cells, but this protects
   text fitting if surrounding layout or browser zoom changes.
============================================================ */

let resizeFitTimer =
  null;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeFitTimer
    );


    resizeFitTimer =
      setTimeout(
        () => {

          if (
            state.mode ===
              "creator"
          ) {

            fitAllClueText(
              crosswordGrid
            );

          }

          else {

            renderPreviewGrid();

          }

        },
        100
      );

  }
);


/* ============================================================
   END OF PART 3

   PART 4 CONTINUES WITH:
   - remaining utility functions
   - keyboard navigation
   - toast
   - startup / initialization
============================================================ *//* ============================================================
   TOAST
============================================================ */

let toastTimer =
  null;


function showToast(
  message
) {

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  if (
    toastTimer
  ) {

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
   KEYBOARD NAVIGATION

   Arrow keys move between grid cells while the Creator
   is active.

   Navigation is ignored while the user is typing in an
   input, textarea or interacting with a button.
============================================================ */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      state.mode !==
        "creator"
    ) {

      return;

    }


    if (
      state.selectedRow ===
        null ||
      state.selectedCol ===
        null
    ) {

      return;

    }


    const activeTag =
      document.activeElement
        ?.tagName
        ?.toLowerCase();


    if (
      activeTag ===
        "input" ||
      activeTag ===
        "textarea" ||
      activeTag ===
        "button"
    ) {

      return;

    }


    let row =
      state.selectedRow;

    let col =
      state.selectedCol;


    if (
      event.key ===
        "ArrowUp"
    ) {

      row--;

    }


    else if (
      event.key ===
        "ArrowDown"
    ) {

      row++;

    }


    else if (
      event.key ===
        "ArrowLeft"
    ) {

      col--;

    }


    else if (
      event.key ===
        "ArrowRight"
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
   INITIAL GRID INPUT VALUES

   Keep the toolbar inputs synchronised with the actual
   starting grid dimensions.
============================================================ */

gridRowsInput.value =
  state.rows;

gridColsInput.value =
  state.cols;


/* ============================================================
   INITIAL PREVIEW TITLE
============================================================ */

previewTitle.textContent =
  puzzleTitle.value.trim() ||
  "Integramă";


/* ============================================================
   INITIALIZE

   This creates the first empty grid.

   IMPORTANT:
   initializeGrid() is used only for initial creation.

   Later resizing uses resizeGridNonDestructive(), so existing
   work is never silently erased by changing grid dimensions.
============================================================ */

initializeGrid(
  state.rows,
  state.cols
);


/* ============================================================
   INITIAL STATISTICS
============================================================ */

updateStatistics();


/* ============================================================
   INITIAL VIEW
============================================================ */

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


/* ============================================================
   INITIAL CLUE FIT

   Wait for the first browser layout before checking clue
   dimensions.
============================================================ */

requestAnimationFrame(
  () => {

    fitAllClueText(
      crosswordGrid
    );

  }
);


/* ============================================================
   APP READY
============================================================ */

/* ============================================================
   INTEGRAME CREATOR
   app.js
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

  nextWordId: 1
};


/* ============================================================
   DOM ELEMENTS
============================================================ */

const crosswordGrid = document.getElementById("crosswordGrid");
const previewGrid = document.getElementById("previewGrid");

const creatorView = document.getElementById("creatorView");
const previewView = document.getElementById("previewView");

const creatorToolbar = document.getElementById("creatorToolbar");

const creatorModeBtn = document.getElementById("creatorModeBtn");
const previewModeBtn = document.getElementById("previewModeBtn");
const printBtn = document.getElementById("printBtn");

const puzzleTitle = document.getElementById("puzzleTitle");
const previewTitle = document.getElementById("previewTitle");

const gridRowsInput = document.getElementById("gridRows");
const gridColsInput = document.getElementById("gridCols");

const resizeGridBtn = document.getElementById("resizeGridBtn");
const checkGridBtn = document.getElementById("checkGridBtn");

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

const placeCluesBtn =
  document.getElementById("placeCluesBtn");

const clearCellBtn =
  document.getElementById("clearCellBtn");

const wordCount =
  document.getElementById("wordCount");

const intersectionCount =
  document.getElementById("intersectionCount");

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
   CREATE EMPTY CELL
============================================================ */

function createEmptyCell() {

  return {
    type: "letter",

    manualLetter: "",

    clues: [],

    letters: []
  };

}


/* ============================================================
   INITIALIZE GRID
============================================================ */

function initializeGrid(rows, cols) {

  state.rows = rows;
  state.cols = cols;

  state.grid = [];

  for (let row = 0; row < rows; row++) {

    const rowArray = [];

    for (let col = 0; col < cols; col++) {

      rowArray.push(createEmptyCell());

    }

    state.grid.push(rowArray);
  }

  state.words = [];
  state.nextWordId = 1;

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
   GET DISPLAY LETTER
============================================================ */

function getDisplayLetter(cell) {

  if (!cell) {
    return "";
  }

  if (
    cell.letters &&
    cell.letters.length > 0
  ) {

    return cell.letters[0].letter || "";

  }

  return cell.manualLetter || "";

}


/* ============================================================
   RENDER MAIN GRID
============================================================ */

function renderGrid() {

  crosswordGrid.innerHTML = "";

  crosswordGrid.style.gridTemplateColumns =
    `repeat(${state.cols}, var(--cell-size))`;

  for (let row = 0; row < state.rows; row++) {

    for (let col = 0; col < state.cols; col++) {

      const cell = state.grid[row][col];

      const element =
        document.createElement("button");

      element.type = "button";

      element.className = "grid-cell";

      element.dataset.row = row;
      element.dataset.col = col;

      if (
        row === state.selectedRow &&
        col === state.selectedCol
      ) {
        element.classList.add("selected");
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

      crosswordGrid.appendChild(element);
    }
  }

}


/* ============================================================
   RENDER CELL CONTENT
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
    "conflict"
  );


  /* ---------------- LETTER ---------------- */

  if (cell.type === "letter") {

    element.classList.add("letter-cell");

    const letter =
      document.createElement("span");

    letter.className = "cell-letter";

    if (!previewMode) {

      letter.textContent =
        getDisplayLetter(cell);

    } else {

      letter.textContent = "";

    }

    element.appendChild(letter);


    if (hasLetterConflict(cell)) {

      element.classList.add("conflict");

    }

    return;
  }


  /* ---------------- BLOCKED ---------------- */

  if (cell.type === "blocked") {

    element.classList.add("blocked-cell");

    return;
  }


  /* ---------------- CLUE ---------------- */

  if (cell.type === "clue") {

    element.classList.add("clue-cell");

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "clue-cell-content";

    const clues =
      cell.clues || [];

    clues.forEach((clue) => {

      const part =
        document.createElement("div");

      part.className = "clue-part";

      part.dataset.direction =
        clue.direction || "right";


      const text =
        document.createElement("span");

      text.className =
        "clue-part-text";

      text.textContent =
        clue.text || "";


      const arrow =
        document.createElement("span");

      arrow.className =
        "clue-arrow";

      arrow.textContent =
        DIRECTIONS[clue.direction]?.arrow || "→";


      part.appendChild(text);
      part.appendChild(arrow);

      wrapper.appendChild(part);

    });


    element.appendChild(wrapper);

  }

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

  noCellSelected.classList.add("hidden");
  editorControls.classList.remove("hidden");

  selectedCellCoordinates.textContent =
    `R${row + 1} · C${col + 1}`;

  setActiveCellType(cell.type);

  if (cell.type === "letter") {

    showLetterSettings();

    manualLetter.value =
      getDisplayLetter(cell);

  }

  else if (cell.type === "clue") {

    showClueSettings();

    populateClueEditor(cell);

  }

  else {

    hideSpecificSettings();

  }

}


/* ============================================================
   CLOSE EDITOR
============================================================ */

function closeEditor() {

  noCellSelected.classList.remove("hidden");
  editorControls.classList.add("hidden");

  selectedCellCoordinates.textContent = "—";

}


/* ============================================================
   CELL TYPE BUTTONS
============================================================ */

const cellTypeButtons =
  document.querySelectorAll(
    ".cell-type-button"
  );


cellTypeButtons.forEach((button) => {

  button.addEventListener("click", () => {

    if (
      state.selectedRow === null ||
      state.selectedCol === null
    ) {
      return;
    }

    const type =
      button.dataset.cellType;

    changeSelectedCellType(type);

  });

});


/* ============================================================
   SET ACTIVE CELL TYPE
============================================================ */

function setActiveCellType(type) {

  cellTypeButtons.forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.cellType === type
    );

  });

}


/* ============================================================
   CHANGE CELL TYPE
============================================================ */

function changeSelectedCellType(type) {

  const cell =
    getCell(
      state.selectedRow,
      state.selectedCol
    );

  if (!cell) {
    return;
  }


  /*
     If this cell currently belongs to words,
     changing its type would invalidate them.

     Remove those words first.
  */

  removeWordsTouchingCell(
    state.selectedRow,
    state.selectedCol
  );


  if (type === "letter") {

    cell.type = "letter";

    cell.clues = [];

    cell.manualLetter =
      cell.manualLetter || "";

    cell.letters = [];

    showLetterSettings();

    manualLetter.value =
      cell.manualLetter;

  }


  else if (type === "clue") {

    cell.type = "clue";

    cell.manualLetter = "";
    cell.letters = [];

    if (!cell.clues.length) {

      cell.clues = [
        {
          text: "",
          answer: "",
          direction: "right",
          wordId: null
        }
      ];

    }

    showClueSettings();

    populateClueEditor(cell);

  }


  else if (type === "blocked") {

    cell.type = "blocked";

    cell.manualLetter = "";
    cell.clues = [];
    cell.letters = [];

    hideSpecificSettings();

  }


  setActiveCellType(type);

  renderGrid();
  updateStatistics();

}


/* ============================================================
   SETTINGS VISIBILITY
============================================================ */

function showLetterSettings() {

  letterCellSettings.classList.remove("hidden");
  clueCellSettings.classList.add("hidden");

}


function showClueSettings() {

  letterCellSettings.classList.add("hidden");
  clueCellSettings.classList.remove("hidden");

}


function hideSpecificSettings() {

  letterCellSettings.classList.add("hidden");
  clueCellSettings.classList.add("hidden");

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

    manualLetter.value = value;

    cell.manualLetter = value;

    renderGrid();
    updateStatistics();

  }
);


/* ============================================================
   CLUE COUNT SELECTOR
============================================================ */

const clueCountButtons =
  document.querySelectorAll(
    ".clue-count-button"
  );


clueCountButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const count =
      Number(button.dataset.count);

    setClueCount(count);

  });

});


function setClueCount(count) {

  clueCountButtons.forEach((button) => {

    button.classList.toggle(
      "active",
      Number(button.dataset.count) === count
    );

  });


  const editors =
    document.querySelectorAll(
      ".clue-editor"
    );

  editors.forEach((editor, index) => {

    editor.classList.toggle(
      "hidden",
      index >= count
    );

  });

}


/* ============================================================
   DIRECTION BUTTONS
============================================================ */

document
  .querySelectorAll(".direction-selector")
  .forEach((selector) => {

    const buttons =
      selector.querySelectorAll(
        ".direction-button"
      );

    buttons.forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach((item) =>
            item.classList.remove("active")
          );

          button.classList.add("active");

        }
      );

    });

  });


/* ============================================================
   POPULATE CLUE EDITOR
============================================================ */

function populateClueEditor(cell) {

  const clues =
    cell.clues || [];

  const count =
    Math.max(
      1,
      Math.min(3, clues.length || 1)
    );

  setClueCount(count);


  for (let i = 0; i < 3; i++) {

    const editor =
      document.querySelector(
        `.clue-editor[data-clue-index="${i}"]`
      );

    if (!editor) {
      continue;
    }

    const clue =
      clues[i] || {
        text: "",
        answer: "",
        direction:
          i === 0
            ? "right"
            : i === 1
              ? "down"
              : "left"
      };


    const textInput =
      editor.querySelector(
        ".clue-text"
      );

    const answerInput =
      editor.querySelector(
        ".answer-input"
      );

    textInput.value =
      clue.text || "";

    answerInput.value =
      clue.answer || "";


    const directionButtons =
      editor.querySelectorAll(
        ".direction-button"
      );

    directionButtons.forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.direction ===
            clue.direction
        );

      }
    );

  }

}


/* ============================================================
   READ CLUES FROM EDITOR
============================================================ */

function readCluesFromEditor() {

  const activeCountButton =
    document.querySelector(
      ".clue-count-button.active"
    );

  const count =
    Number(
      activeCountButton?.dataset.count || 1
    );

  const clues = [];


  for (let i = 0; i < count; i++) {

    const editor =
      document.querySelector(
        `.clue-editor[data-clue-index="${i}"]`
      );

    const text =
      editor
        .querySelector(".clue-text")
        .value
        .trim();

    const answer =
      normalizeAnswer(
        editor
          .querySelector(".answer-input")
          .value
      );

    const directionButton =
      editor.querySelector(
        ".direction-button.active"
      );

    const direction =
      directionButton?.dataset.direction ||
      "right";


    clues.push({
      text,
      answer,
      direction
    });

  }

  return clues;

}


/* ============================================================
   NORMALIZE ANSWER
============================================================ */

function normalizeAnswer(value) {

  return value
    .trim()
    .toLocaleUpperCase("ro-RO")
    .replace(/\s+/g, "")
    .replace(/-/g, "");

}


/* ============================================================
   PLACE CLUES
============================================================ */

placeCluesBtn.addEventListener(
  "click",
  placeSelectedClues
);


function placeSelectedClues() {

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


  const clues =
    readCluesFromEditor();


  /* ---------------- BASIC VALIDATION ---------------- */

  for (
    let index = 0;
    index < clues.length;
    index++
  ) {

    const clue =
      clues[index];

    if (!clue.text) {

      showToast(
        `Scrie definiția ${index + 1}.`
      );

      return;
    }

    if (!clue.answer) {

      showToast(
        `Scrie răspunsul pentru definiția ${index + 1}.`
      );

      return;
    }

  }


  /*
     Temporarily remove words belonging to
     this clue cell before testing replacements.
  */

  const oldClues =
    JSON.parse(
      JSON.stringify(cell.clues || [])
    );

  const oldWordIds =
    oldClues
      .map((clue) => clue.wordId)
      .filter(Boolean);


  oldWordIds.forEach(
    (wordId) =>
      removeWordById(wordId)
  );


  const placements = [];


  /* ---------------- TEST ALL WORDS ---------------- */

  for (
    let index = 0;
    index < clues.length;
    index++
  ) {

    const clue =
      clues[index];

    const result =
      calculatePlacement(
        row,
        col,
        clue.answer,
        clue.direction
      );


    if (!result.valid) {

      /*
         Restore previous words if the new
         placement cannot be completed.
      */

      restoreOldClues(
        row,
        col,
        oldClues
      );

      showToast(result.message);

      renderGrid();
      updateStatistics();

      return;
    }


    /*
       Also check new words against each other
       before committing.
    */

    for (const previous of placements) {

      const internalConflict =
        findPlacementConflict(
          previous,
          result
        );

      if (internalConflict) {

        restoreOldClues(
          row,
          col,
          oldClues
        );

        showToast(
          "Două dintre răspunsurile acestei căsuțe intră în conflict."
        );

        renderGrid();
        updateStatistics();

        return;
      }

    }


    placements.push(result);

  }


  /* ---------------- COMMIT ---------------- */

  cell.clues = [];


  clues.forEach(
    (clue, index) => {

      const wordId =
        state.nextWordId++;

      const placement =
        placements[index];


      const word = {
        id: wordId,

        clueRow: row,
        clueCol: col,

        clueIndex: index,

        clue: clue.text,

        answer: clue.answer,

        direction: clue.direction,

        cells: placement.cells
      };


      state.words.push(word);


      placement.cells.forEach(
        (position, letterIndex) => {

          const targetCell =
            getCell(
              position.row,
              position.col
            );

          targetCell.type = "letter";

          targetCell.letters.push({
            wordId,
            letter:
              clue.answer[letterIndex]
          });

        }
      );


      cell.clues.push({
        text: clue.text,
        answer: clue.answer,
        direction: clue.direction,
        wordId
      });

    }
  );


  renderGrid();
  updateStatistics();

  showToast(
    clues.length === 1
      ? "Răspunsul a fost plasat."
      : "Răspunsurile au fost plasate."
  );

}


/* ============================================================
   CALCULATE WORD PLACEMENT
============================================================ */

function calculatePlacement(
  clueRow,
  clueCol,
  answer,
  directionName
) {

  const direction =
    DIRECTIONS[directionName];

  if (!direction) {

    return {
      valid: false,
      message: "Direcție invalidă."
    };

  }


  const cells = [];


  /*
     Word starts in the square immediately
     next to the clue box.
  */

  let row =
    clueRow + direction.row;

  let col =
    clueCol + direction.col;


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
       Check letters already placed by
       other words.
    */

    if (
      target.letters &&
      target.letters.length
    ) {

      const existingLetters =
        new Set(
          target.letters.map(
            (item) => item.letter
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
            `Conflict la rândul ${row + 1}, coloana ${col + 1}: răspunsul necesită „${requiredLetter}”.`
        };

      }

    }


    /*
       Check manually entered letter.
    */

    if (
      target.manualLetter &&
      target.manualLetter !==
        requiredLetter
    ) {

      return {
        valid: false,

        message:
          `Conflict la rândul ${row + 1}, coloana ${col + 1}: există deja litera „${target.manualLetter}”, dar răspunsul necesită „${requiredLetter}”.`
      };

    }


    cells.push({
      row,
      col
    });


    row += direction.row;
    col += direction.col;

  }


  return {
    valid: true,
    cells
  };

}


/* ============================================================
   CHECK CONFLICT BETWEEN NEW PLACEMENTS
============================================================ */

function findPlacementConflict(
  placementA,
  placementB
) {

  for (
    let a = 0;
    a < placementA.cells.length;
    a++
  ) {

    const cellA =
      placementA.cells[a];

    for (
      let b = 0;
      b < placementB.cells.length;
      b++
    ) {

      const cellB =
        placementB.cells[b];

      if (
        cellA.row === cellB.row &&
        cellA.col === cellB.col
      ) {

        /*
           The actual letters will be checked
           against the answers separately when
           committed. This function mainly stops
           accidental overlapping paths from the
           same clue box.
        */

        return true;

      }

    }

  }

  return false;

}


/* ============================================================
   REMOVE WORD
============================================================ */

function removeWordById(wordId) {

  const word =
    state.words.find(
      (item) => item.id === wordId
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
            item.wordId !== wordId
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
   REMOVE WORDS TOUCHING CELL
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
        ids.add(item.wordId)
    );

  }


  if (
    cell.clues &&
    cell.clues.length
  ) {

    cell.clues.forEach(
      (clue) => {

        if (clue.wordId) {
          ids.add(clue.wordId);
        }

      }
    );

  }


  ids.forEach(
    (id) =>
      removeWordById(id)
  );

}


/* ============================================================
   RESTORE OLD CLUES
============================================================ */

function restoreOldClues(
  row,
  col,
  oldClues
) {

  const cell =
    getCell(row, col);

  if (!cell) {
    return;
  }

  cell.clues = [];


  oldClues.forEach(
    (clue, index) => {

      if (
        !clue.answer ||
        !clue.direction
      ) {

        cell.clues.push(clue);
        return;
      }


      const placement =
        calculatePlacement(
          row,
          col,
          clue.answer,
          clue.direction
        );


      if (!placement.valid) {

        cell.clues.push({
          ...clue,
          wordId: null
        });

        return;
      }


      const wordId =
        state.nextWordId++;


      const word = {
        id: wordId,

        clueRow: row,
        clueCol: col,

        clueIndex: index,

        clue: clue.text,

        answer: clue.answer,

        direction: clue.direction,

        cells: placement.cells
      };


      state.words.push(word);


      placement.cells.forEach(
        (position, letterIndex) => {

          const target =
            getCell(
              position.row,
              position.col
            );

          target.letters.push({
            wordId,
            letter:
              clue.answer[letterIndex]
          });

        }
      );


      cell.clues.push({
        ...clue,
        wordId
      });

    }
  );

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


    state.grid
      [state.selectedRow]
      [state.selectedCol] =
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
   CHECK CELL LETTER CONFLICT
============================================================ */

function hasLetterConflict(cell) {

  if (
    !cell ||
    cell.type !== "letter"
  ) {
    return false;
  }


  const letters =
    cell.letters.map(
      (item) => item.letter
    );


  if (cell.manualLetter) {

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
   UPDATE STATISTICS
============================================================ */

function updateStatistics() {

  const words =
    state.words.length;

  const intersections =
    countIntersections();

  const conflicts =
    countConflicts();


  wordCount.textContent =
    words;

  intersectionCount.textContent =
    intersections;

  conflictCount.textContent =
    conflicts;


  statusIndicator.classList.remove(
    "valid",
    "invalid",
    "warning",
    "neutral"
  );


  if (conflicts > 0) {

    statusIndicator.classList.add(
      "invalid"
    );

    statusText.textContent =
      `${conflicts} conflict${conflicts === 1 ? "" : "e"} în grilă.`;

  }

  else if (words === 0) {

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
      Number(gridRowsInput.value);

    const cols =
      Number(gridColsInput.value);


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
  let incompleteClues = 0;


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


      /* LETTER CONFLICT */

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


      /* ORPHAN MANUAL LETTER */

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


      /* INCOMPLETE CLUE */

      if (
        cell.type === "clue"
      ) {

        if (
          !cell.clues ||
          cell.clues.length === 0
        ) {

          incompleteClues++;

          issues.push({
            type: "warning",

            message:
              `Căsuța cu definiție de la rândul ${row + 1}, coloana ${col + 1} nu conține nicio definiție.`
          });

        }

        else {

          cell.clues.forEach(
            (clue, index) => {

              if (
                !clue.text ||
                !clue.answer ||
                !clue.wordId
              ) {

                incompleteClues++;

                issues.push({
                  type: "warning",

                  message:
                    `Definiția ${index + 1} de la rândul ${row + 1}, coloana ${col + 1} este incompletă.`
                });

              }

            }
          );

        }

      }

    }

  }


  if (issues.length === 0) {

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

      orphanLetters,

      incompleteClues
    }
  );

}


/* ============================================================
   RENDER VALIDATION
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
      <strong>${stats.conflicts}</strong>
      <span>CONFLICTE</span>
    </div>
  `;


  validationIssues.innerHTML = "";


  issues.forEach(
    (issue) => {

      const item =
        document.createElement("div");

      item.className =
        `validation-issue ${issue.type}`;

      let icon = "✓";

      if (issue.type === "error") {
        icon = "×";
      }

      if (issue.type === "warning") {
        icon = "!";
      }


      const iconElement =
        document.createElement("strong");

      iconElement.textContent = icon;


      const textElement =
        document.createElement("span");

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

  state.mode = "creator";

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

  state.mode = "preview";

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
        document.createElement("div");

      element.className =
        "grid-cell";


      renderCellContent(
        element,
        cell,
        true
      );


      /*
         Reader version should not display
         creator validation states.
      */

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
   PRINT / SAVE AS PDF
============================================================ */

printBtn.addEventListener(
  "click",
  () => {

    /*
       Generate the Reader view immediately
       before printing.
    */

    previewTitle.textContent =
      puzzleTitle.value.trim() ||
      "Integrame";

    renderPreviewGrid();

    window.print();

  }
);


/* ============================================================
   TOAST MESSAGE
============================================================ */

let toastTimer = null;


function showToast(message) {

  toast.textContent = message;

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
   KEYBOARD SUPPORT
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


    /*
       Don't move grid selection while the
       user is typing in a form field.
    */

    if (
      activeTag === "input" ||
      activeTag === "textarea"
    ) {
      return;
    }


    let row =
      state.selectedRow;

    let col =
      state.selectedCol;


    if (event.key === "ArrowUp") {
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
   INITIAL STARTUP
============================================================ */

initializeGrid(
  state.rows,
  state.cols
);

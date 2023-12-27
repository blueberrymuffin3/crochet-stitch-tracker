"use strict";

const statuses = [
  {
    id: "status-stitches",
    inputId: "count-stitches",
    total: 3,
  },
  {
    id: "status-steps",
    inputId: "count-steps",
    total: 6,
  },
  {
    id: "status-rows",
    inputId: "count-rows",
    total: 2,
  }
].map(({ id, inputId, total: initialTotal }) => {
  // Setup

  const line = document.getElementById(id);
  const spanDone = document.createElement("span");
  const spanTotal = document.createElement("span");

  line.append(
    document.createTextNode(" "),
    spanDone,
    document.createTextNode("/"),
    spanTotal,
  );

  const inputTotal = document.getElementById(inputId);
  inputTotal.value = initialTotal;

  const object = { spanDone, spanTotal, inputTotal, progress: 0, total: 0 };

  inputTotal.addEventListener("change", () => {
    updateAllStatus();
    save();
  });

  return object;
});
let done = false;


const buttonStitchDone = document.getElementById("stitch-done");
const buttonStitchUndo = document.getElementById("stitch-undo");
const buttonReset = document.getElementById("reset");
const doneModal = document.getElementById("done-modal");

function updateAllStatus() {
  for (let i = 0; i < statuses.length; i++) {
    const object = statuses[i];
    const next = statuses[i + 1];

    object.total = Math.floor(Number(object.inputTotal.value));

    if (object.total < 1) {
      object.total = 1;
      object.inputTotal.value = "1";
    }

    if (object.progress < 0) {
      object.progress = 0;

      if (next) {
        next.progress--;
      }
    }

    if (object.progress >= object.total) {
      object.progress = 0;

      if (next) {
        next.progress++;
      } else {
        done = true;
      }
    }

    object.spanDone.textContent = object.progress;
    object.spanTotal.textContent = object.total;
  }

  buttonStitchDone.disabled = done;
  if (done) {
    doneModal.classList.remove("hide")
  } else {
    doneModal.classList.add("hide")
  }
}

const LS_STATE_KEY = "state";

function save() {
  const statusesState = statuses.map(({ progress, total }) => ({ progress, total }))
  const state = {
    statuses: statusesState,
    done,
  };

  localStorage.setItem(LS_STATE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const state = JSON.parse(localStorage.getItem(LS_STATE_KEY));

    for (let i = 0; i < statuses.length; i++) {
      statuses[i].progress = Number(state.statuses[i].progress);
      statuses[i].inputTotal.value = String(state.statuses[i].total);
    }

    done = Boolean(state.done);
  } catch (error) {
    console.error("Error loading state:", error);
  }
}

function reset() {
  done = false;

  for (const status of statuses) {
    status.progress = 0;
  }

  updateAllStatus();
  save();
}

buttonStitchDone.addEventListener("click", () => {
  statuses[0].progress++;
  updateAllStatus();
  save();
});
buttonStitchUndo.addEventListener("click", () => {
  statuses[0].progress--;
  updateAllStatus();
  save();
});
buttonReset.addEventListener("click", reset);
doneModal.addEventListener("click", reset);

load();
updateAllStatus();

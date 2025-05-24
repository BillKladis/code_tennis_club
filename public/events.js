const dummyData = {
  1: Array.from({ length: 20 }, (_, i) => `Γήπεδο ${i + 1}`),
  2: Array.from({ length: 13 }, (_, i) => `Τμήμα ${i + 1}`),
  3: Array.from({ length: 8 }, (_, i) => `Τουρνουά ${i + 1}`),
  4: Array.from({ length: 18 }, (_, i) => `Ανακοίνωση ${i + 1}`)
};

const state = {
  1: 0,
  2: 0,
  3: 0,
  4: 0
};

const itemsPerPage = 5;

function renderBox(boxId) {
  const container = document.getElementById(`data-rows-${boxId}`);
  container.innerHTML = '';

  const start = state[boxId] * itemsPerPage;
  const end = start + itemsPerPage;
  const dataSlice = dummyData[boxId].slice(start, end);

  dataSlice.forEach(item => {
    const div = document.createElement('div');
    div.className = 'data-row';
    div.textContent = item;
    container.appendChild(div);
  });
}

document.querySelectorAll('.prev-btn').forEach(button => {
  button.addEventListener('click', () => {
    const boxId = button.dataset.box;
    if (state[boxId] > 0) {
      state[boxId]--;
      renderBox(boxId);
    }
  });
});

document.querySelectorAll('.next-btn').forEach(button => {
  button.addEventListener('click', () => {
    const boxId = button.dataset.box;
    const maxPage = Math.floor(dummyData[boxId].length / itemsPerPage);
    if (state[boxId] < maxPage) {
      state[boxId]++;
      renderBox(boxId);
    }
  });
});

// αρχική φόρτωση όλων των box
[1, 2, 3, 4].forEach(renderBox)
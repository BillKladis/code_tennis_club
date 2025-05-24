import { updateNavbarForAuth } from './Actions.mjs';
document.addEventListener('DOMContentLoaded', () => {
fetch('/me', { credentials: 'include' })
    .then(res => res.ok ? res.json() : { id: null })
    .then(data => updateNavbarForAuth(data.id))

document.getElementById("load-courts").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/courts";
  });
document.getElementById("index").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/";
  });
  document.getElementById("tour").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/tour";
  });
  document.querySelectorAll('.dropdown-content a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const modalId = this.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) {
      // Προσάρμοσε ανάλογα με το πώς εμφανίζεις τα modals σου
      modal.style.display = 'block';
    }
  });
});})

function participate(season) {
  if (season === 'winter') {
    window.location.href = "form_winter.html";
  } else if (season === 'summer') {
    window.location.href = "form_summer.html";
  }
}

// Simple pagination logic for future implementation
let currentPage = 0;
const rowsPerPage = 5;

function prevResults() {
  // Εδώ θα μπει η λογική για προηγούμενη σελίδα
  alert("Προηγούμενη σελίδα (δεν υλοποιήθηκε ακόμα)");
}

function nextResults() {
  // Εδώ θα μπει η λογική για επόμενη σελίδα
  alert("Επόμενη σελίδα (δεν υλοποιήθηκε ακόμα)");
}

function openModal(id) {
  alert("Άνοιγμα modal: " + id + "\n(Θα υλοποιηθεί αργότερα)");
}
window.openModal = openModal;



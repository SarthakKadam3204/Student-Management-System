const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "campus_students_v1";
let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  render();
}
function grade(marks) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 40) return "D";
  return "F";
}
function render() {
  $("total").textContent = students.length;
  const avg = students.length ? students.reduce((sum, s) => sum + Number(s.marks), 0) / students.length : 0;
  $("average").textContent = avg.toFixed(1) + "%";
  $("passed").textContent = students.filter(s => Number(s.marks) >= 40).length;

  const query = $("search").value.trim().toLowerCase();
  const filtered = students.filter(s =>
    `${s.id} ${s.name} ${s.course}`.toLowerCase().includes(query)
  );
  $("recordCount").textContent = `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;
  $("studentRows").innerHTML = filtered.map(s => `
    <tr>
      <td><span class="student-avatar">${escapeHTML(s.name.charAt(0).toUpperCase())}</span><span class="student-name">${escapeHTML(s.name)}</span></td>
      <td>${escapeHTML(s.id)}</td>
      <td>${escapeHTML(s.course)}</td>
      <td>${Number(s.marks)}%</td>
      <td><span class="grade">${grade(Number(s.marks))}</span></td>
      <td class="actions"><button data-edit="${escapeHTML(s.id)}" aria-label="Edit ${escapeHTML(s.name)}">✎</button><button class="delete" data-delete="${escapeHTML(s.id)}" aria-label="Delete ${escapeHTML(s.name)}">✕</button></td>
    </tr>`).join("");
  $("empty").style.display = filtered.length ? "none" : "block";
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}
function openForm(student = null) {
  $("studentForm").reset();
  $("formError").textContent = "";
  $("editId").value = student ? student.id : "";
  $("dialogTitle").textContent = student ? "Edit Student" : "Add Student";
  $("studentId").value = student ? student.id : "";
  $("studentId").disabled = !!student;
  $("name").value = student ? student.name : "";
  $("course").value = student ? student.course : "";
  $("marks").value = student ? student.marks : "";
  $("studentDialog").showModal();
}
function closeForm() { $("studentDialog").close(); }

["topAdd", "addBtn", "emptyAdd"].forEach(id => $(id).addEventListener("click", () => openForm()));
$("closeDialog").addEventListener("click", closeForm);
$("cancel").addEventListener("click", closeForm);
$("search").addEventListener("input", render);

$("studentForm").addEventListener("submit", event => {
  event.preventDefault();
  const oldId = $("editId").value;
  const id = $("studentId").value.trim();
  const name = $("name").value.trim();
  const course = $("course").value.trim();
  const marks = Number($("marks").value);
  if (!id || !name || !course || !Number.isFinite(marks) || marks < 0 || marks > 100) {
    $("formError").textContent = "Please enter valid details and marks from 0 to 100.";
    return;
  }
  if (!oldId && students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
    $("formError").textContent = "This student ID already exists.";
    return;
  }
  if (oldId) {
    const index = students.findIndex(s => s.id === oldId);
    students[index] = { id: oldId, name, course, marks };
  } else {
    students.unshift({ id, name, course, marks });
  }
  save();
  closeForm();
});

$("studentRows").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    const student = students.find(s => s.id === editButton.dataset.edit);
    if (student) openForm(student);
  }
  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    const student = students.find(s => s.id === id);
    if (student && confirm(`Delete ${student.name} (${student.id})?`)) {
      students = students.filter(s => s.id !== id);
      save();
    }
  }
});
render();

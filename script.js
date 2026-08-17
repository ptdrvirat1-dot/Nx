const STORAGE_KEY = "mandwa_bhaira_bhai_people_v1";
let people = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const $ = id => document.getElementById(id);
const form = $("personForm");

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  render();
}

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function calculateAge(dob){
  if(!dob) return "";
  const birth = new Date(dob);
  if(Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : "";
}

$("dob").addEventListener("change", () => {
  const age = calculateAge($("dob").value);
  if(age !== "") $("age").value = age;
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const editId = $("editId").value;
  const person = {
    id: editId || crypto.randomUUID(),
    serial: Number($("serial").value),
    name: $("name").value.trim(),
    father: $("father").value.trim(),
    dob: $("dob").value,
    age: $("age").value,
    meetingHouse: $("meetingHouse").value.trim(),
    attendance: $("attendance").value
  };

  if(!person.name) return alert("नाम भरना जरूरी है।");

  const duplicate = people.find(p => p.serial === person.serial && p.id !== person.id);
  if(duplicate && !confirm("यह क्रमांक पहले से मौजूद है। फिर भी सेव करें?")) return;

  if(editId){
    people = people.map(p => p.id === editId ? person : p);
  } else {
    people.push(person);
  }
  people.sort((a,b) => a.serial - b.serial);
  saveData();
  resetForm();
});

$("resetBtn").addEventListener("click", resetForm);
function resetForm(){
  form.reset();
  $("editId").value = "";
  $("saveBtn").textContent = "➕ व्यक्ति जोड़ें";
  $("attendance").value = "present";
}

function render(){
  const query = $("search").value.trim().toLowerCase();
  const filtered = people.filter(p =>
    String(p.serial).includes(query) ||
    p.name.toLowerCase().includes(query) ||
    p.father.toLowerCase().includes(query) ||
    p.meetingHouse.toLowerCase().includes(query)
  );

  $("peopleTable").innerHTML = filtered.map(p => `
    <tr>
      <td>${escapeHTML(p.serial)}</td>
      <td><strong>${escapeHTML(p.name)}</strong></td>
      <td>${escapeHTML(p.father)}</td>
      <td>${escapeHTML(p.dob)}</td>
      <td>${escapeHTML(p.age)}</td>
      <td>${escapeHTML(p.meetingHouse)}</td>
      <td><span class="badge ${p.attendance === "present" ? "present" : "absent"}">
        ${p.attendance === "present" ? "उपस्थित" : "अनुपस्थित"}
      </span></td>
      <td>
        <button class="small-btn edit" onclick="editPerson('${p.id}')">✏️ Edit</button>
        <button class="small-btn delete" onclick="deletePerson('${p.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join("");

  $("emptyState").style.display = filtered.length ? "none" : "block";
  $("totalCount").textContent = people.length;
  $("presentCount").textContent = people.filter(p => p.attendance === "present").length;
  $("absentCount").textContent = people.filter(p => p.attendance === "absent").length;
}

window.editPerson = id => {
  const p = people.find(x => x.id === id);
  if(!p) return;
  $("editId").value = p.id;
  $("serial").value = p.serial;
  $("name").value = p.name;
  $("father").value = p.father;
  $("dob").value = p.dob;
  $("age").value = p.age;
  $("meetingHouse").value = p.meetingHouse;
  $("attendance").value = p.attendance;
  $("saveBtn").textContent = "💾 जानकारी अपडेट करें";
  window.scrollTo({top:0, behavior:"smooth"});
};

window.deletePerson = id => {
  const p = people.find(x => x.id === id);
  if(!p) return;
  if(confirm(`क्या "${p.name}" को हटाना है?`)){
    people = people.filter(x => x.id !== id);
    saveData();
  }
};

$("search").addEventListener("input", render);

$("clearAllBtn").addEventListener("click", () => {
  if(!people.length) return alert("हटाने के लिए कोई डेटा नहीं है।");
  if(confirm("सारा डेटा हमेशा के लिए हट जाएगा। क्या आप जारी रखना चाहते हैं?")){
    people = [];
    saveData();
    resetForm();
  }
});

$("exportBtn").addEventListener("click", () => {
  if(!people.length) return alert("डाउनलोड करने के लिए डेटा नहीं है।");
  const headers = ["क्रमांक","नाम","पिता का नाम","जन्मतिथि","उम्र","बैठक किसके घर","हाजिरी"];
  const rows = people.map(p => [
    p.serial,p.name,p.father,p.dob,p.age,p.meetingHouse,
    p.attendance === "present" ? "उपस्थित" : "अनुपस्थित"
  ]);
  const csv = "\uFEFF" + [headers,...rows]
    .map(row => row.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mandwa-bhaira-bhai-hajiri.csv";
  a.click();
  URL.revokeObjectURL(url);
});

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  $("themeBtn").textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

if(localStorage.getItem("theme") === "dark"){
  document.body.classList.add("dark");
  $("themeBtn").textContent = "☀️";
}

render();

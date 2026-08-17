(function(){
"use strict";
var FINE=30, STORAGE="mandwa_bhaira_bhai_data_v4";
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var people=[];
try{people=JSON.parse(localStorage.getItem(STORAGE)||"[]");if(!Array.isArray(people))people=[]}catch(e){people=[]}
if(!people.length){try{var old=JSON.parse(localStorage.getItem("mandwa_bhaira_bhai_people_v3")||localStorage.getItem("mandwa_bhaira_bhai_people_v2")||"[]");if(Array.isArray(old))people=old}catch(e){}}
function monthValue(){return $("month").value||new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")}
function rec(p,k){return p.records&&p.records[k]?p.records[k]:null}
function currentKey(){return monthValue()+"-"+$("meeting").value}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(people))}catch(e){};render()}
function ageFromDate(s){if(!s)return"";var b=new Date(s),t=new Date(),a=t.getFullYear()-b.getFullYear(),m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))a--;return a>=0?a:""}
function render(){
 var q=($("search").value||"").toLowerCase(),k=currentKey(),arr=people.filter(function(p){return String(p.serial).indexOf(q)>-1||String(p.name||"").toLowerCase().indexOf(q)>-1||String(p.father||"").toLowerCase().indexOf(q)>-1});
 $("peopleTable").innerHTML=arr.map(function(p){var r=rec(p,k),a=r?r.attendance:"",fine=a==="absent"?FINE:0;return "<tr><td>"+esc(p.serial)+"</td><td><b>"+esc(p.name)+"</b></td><td>"+esc(p.father)+"</td><td>"+esc(p.dob)+"</td><td>"+esc(p.age)+"</td><td>"+esc(p.house)+"</td><td><span class='badge "+(a==="present"?"ok":a==="absent"?"bad":"none")+"'>"+(a==="present"?"उपस्थित":a==="absent"?"अनुपस्थित":"हाजिरी नहीं")+"</span></td><td class='fine-cell'>₹"+fine+"</td><td><button class='small edit' data-edit='"+esc(p.id)+"'>✏️</button> <button class='small del' data-del='"+esc(p.id)+"'>🗑️</button></td></tr>"}).join("");
 $("emptyState").style.display=arr.length?"none":"block";
 var prs=0,abs=0;people.forEach(function(p){var r=rec(p,k);if(r&&r.attendance==="present")prs++;if(r&&r.attendance==="absent")abs++});
 $("total").textContent=people.length;$("present").textContent=prs;$("absent").textContent=abs;$("meetingFine").textContent="₹"+abs*FINE;$("monthFine").textContent="₹"+monthFine(monthValue());$("allFine").textContent="₹"+allFine();$("meetingText").textContent=monthValue()+" • बैठक "+$("meeting").value+" • अनुपस्थिति ₹30";renderMonthly()
}
function monthFine(m){var total=0;people.forEach(function(p){[1,2].forEach(function(n){var r=rec(p,m+"-"+n);if(r&&r.attendance==="absent")total+=FINE})});return total}
function allFine(){var total=0;people.forEach(function(p){if(p.records)Object.keys(p.records).forEach(function(k){if(p.records[k]&&p.records[k].attendance==="absent")total+=FINE})});return total}
function renderMonthly(){var m=monthValue(),total=0;$("monthlyTable").innerHTML=people.map(function(p){var a=rec(p,m+"-1"),b=rec(p,m+"-2"),x=a&&a.attendance==="absent"?FINE:0,y=b&&b.attendance==="absent"?FINE:0;total+=x+y;return "<tr><td>"+esc(p.serial)+"</td><td>"+esc(p.name)+"</td><td>"+(a?(a.attendance==="absent"?"अनुपस्थित ₹30":"उपस्थित ₹0"):"—")+"</td><td>"+(b?(b.attendance==="absent"?"अनुपस्थित ₹30":"उपस्थित ₹0"):"—")+"</td><td class='fine-cell'>₹"+(x+y)+"</td></tr>"}).join("");$("monthlyTotal").textContent="कुल: ₹"+total}
function formFine(){$("formFine").textContent=$("attendance").value==="absent"?"₹30":"₹0"}
function resetForm(){$("personForm").reset();$("editId").value="";$("attendance").value="present";$("saveBtn").textContent="＋ व्यक्ति जोड़ें";formFine()}
function edit(id){var p=people.find(function(x){return x.id===id});if(!p)return;var r=rec(p,currentKey());$("editId").value=p.id;$("serial").value=p.serial;$("name").value=p.name||"";$("father").value=p.father||"";$("dob").value=p.dob||"";$("age").value=p.age||"";$("house").value=p.house||"";$("attendance").value=r?r.attendance:"present";$("saveBtn").textContent="💾 अपडेट करें";formFine();window.scrollTo(0,0)}
function uid(){return "p_"+Date.now()+"_"+Math.floor(Math.random()*100000)}
document.addEventListener("DOMContentLoaded",function(){
 var d=new Date();$("month").value=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
 $("attendance").addEventListener("change",formFine);
 $("dob").addEventListener("change",function(){var a=ageFromDate(this.value);if(a!=="")$("age").value=a});
 $("month").addEventListener("change",render);$("meeting").addEventListener("change",function(){resetForm();render()});$("search").addEventListener("input",render);
 $("resetBtn").addEventListener("click",resetForm);
 $("personForm").addEventListener("submit",function(e){e.preventDefault();var serial=Number($("serial").value),name=$("name").value.trim();if(!serial||!name){alert("क्रमांक और नाम भरना जरूरी है");return}var id=$("editId").value,p=id?people.find(function(x){return x.id===id}):people.find(function(x){return Number(x.serial)===serial});if(!p){p={id:uid(),serial:serial,name:name,father:$("father").value.trim(),dob:$("dob").value,age:$("age").value,house:$("house").value,records:{}};people.push(p)}else{p.serial=serial;p.name=name;p.father=$("father").value.trim();p.dob=$("dob").value;p.age=$("age").value;p.house=$("house").value;p.records=p.records||{}}p.records[currentKey()]={attendance:$("attendance").value,fine:$("attendance").value==="absent"?FINE:0};people.sort(function(a,b){return Number(a.serial)-Number(b.serial)});persist();resetForm()});
 $("peopleTable").addEventListener("click",function(e){var el=e.target.closest("button");if(!el)return;if(el.dataset.edit)edit(el.dataset.edit);if(el.dataset.del){var p=people.find(function(x){return x.id===el.dataset.del});if(p&&confirm("क्या "+p.name+" का पूरा रिकॉर्ड हटाना है?")){people=people.filter(function(x){return x.id!==p.id});persist()}}});
 $("clearMeetingBtn").addEventListener("click",function(){if(confirm("चुनी हुई बैठक की हाजिरी और जुर्माना हटाएँ?")){var k=currentKey();people.forEach(function(p){if(p.records)delete p.records[k]});persist()}});
 $("themeBtn").addEventListener("click",function(){document.body.classList.toggle("dark");this.textContent=document.body.classList.contains("dark")?"☀":"☾";try{localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light")}catch(e){}});
 try{if(localStorage.getItem("theme")==="dark"){$("themeBtn").click()}}catch(e){}
 $("exportBtn").addEventListener("click",function(){var m=monthValue(),n=$("meeting").value,k=m+"-"+n,rows=[["क्रमांक","नाम","पिता का नाम","जन्मतिथि","उम्र","बैठक का घर","महीना","बैठक","हाजिरी","जुर्माना"]];people.forEach(function(p){var r=rec(p,k);rows.push([p.serial,p.name,p.father,p.dob,p.age,p.house,m,"बैठक "+n,r?(r.attendance==="absent"?"अनुपस्थित":"उपस्थित"):"हाजिरी नहीं",r&&r.attendance==="absent"?FINE:0])});var csv="\ufeff"+rows.map(function(row){return row.map(function(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'}).join(",")}).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="mandwa-"+m+"-meeting-"+n+".csv";a.click()});
 formFine();render();
});
})();
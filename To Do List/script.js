function safeGetItem(k){try{const r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(e){return null}}
function safeSetItem(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

let tasks=safeGetItem("tasks")||[];
let currentFilter="all";
let editingId=null;

const inputEl=document.getElementById("task-input");
const addBtn=document.getElementById("add-task");
const taskListEl=document.getElementById("task-list");
const totalEl=document.getElementById("total-tasks");
const activeEl=document.getElementById("active-tasks");
const completedEl=document.getElementById("completed-tasks");
const filterBtns=document.querySelectorAll(".filter-btn");
const clearCompletedBtn=document.getElementById("clear-completed");
const clearAllBtn=document.getElementById("clear-all");

const modal=document.getElementById("confirm-modal");
const modalMessage=document.getElementById("confirm-message");
const modalYes=document.getElementById("confirm-yes");
const modalNo=document.getElementById("confirm-no");
let lastFocusedBeforeModal=null;

function showModal(msg,cb){
  modalMessage.textContent=msg;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  lastFocusedBeforeModal=document.activeElement;
  modalYes.focus();
  function cleanup(){
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
    modalYes.removeEventListener("click",yesH);
    modalNo.removeEventListener("click",noH);
    document.removeEventListener("keydown",escH);
    if(lastFocusedBeforeModal&&lastFocusedBeforeModal.focus)lastFocusedBeforeModal.focus();
  }
  function yesH(){cleanup();cb(true)}
  function noH(){cleanup();cb(false)}
  function escH(e){if(e.key==="Escape"){cleanup();cb(false)}}
  modalYes.addEventListener("click",yesH);
  modalNo.addEventListener("click",noH);
  document.addEventListener("keydown",escH);
}

function saveTasks(){safeSetItem("tasks",tasks)}

function addTask(t){
  tasks.push({id:Date.now(),text:t,completed:false,timestamp:new Date().toLocaleString()});
  saveTasks();
  renderTasks();
}

function deleteTask(id){
  showModal("Delete this task?",c=>{
    if(!c)return;
    tasks=tasks.filter(t=>t.id!==id);
    saveTasks();
    renderTasks();
  })
}

function toggleTask(id){
  const t=tasks.find(a=>a.id===id);
  if(t){t.completed=!t.completed;saveTasks();renderTasks()}
}

function editTask(id){
  const t=tasks.find(a=>a.id===id);
  if(t){
    inputEl.value=t.text;
    inputEl.focus();
    editingId=id;
    addBtn.textContent="Update";
    addBtn.setAttribute("aria-label","Update task");
  }
}

function updateTask(id,txt){
  const t=tasks.find(a=>a.id===id);
  if(t){t.text=txt;saveTasks();renderTasks()}
}

function renderTasks(){
  taskListEl.innerHTML="";
  const filtered=tasks.filter(t=>{
    if(currentFilter==="active")return!t.completed;
    if(currentFilter==="completed")return t.completed;
    return true;
  });

  if(filtered.length===0){
    const li=document.createElement("li");
    li.className="task-item";
    li.innerHTML='<span class="task-text" aria-live="polite">No tasks</span>';
    taskListEl.appendChild(li);
  }

  filtered.forEach(t=>{
    const li=document.createElement("li");
    li.className=`task-item ${t.completed?"completed":""}`;
    li.setAttribute("role","listitem");

    li.innerHTML=`
      <input type="checkbox" class="task-checkbox" ${t.completed?"checked":""} aria-label="Mark task completed">
      <span class="task-text"></span>
      <span class="task-time">${t.timestamp}</span>
      <button class="edit-btn" aria-label="Edit task">Edit</button>
      <button class="delete-btn" aria-label="Delete task">Delete</button>
    `;

    li.querySelector(".task-text").textContent=t.text;
    li.querySelector(".task-checkbox").addEventListener("click",()=>toggleTask(t.id));
    li.querySelector(".edit-btn").addEventListener("click",()=>editTask(t.id));
    li.querySelector(".delete-btn").addEventListener("click",()=>deleteTask(t.id));

    taskListEl.appendChild(li);
  });

  updateStats();
}

function updateStats(){
  totalEl.textContent=tasks.length;
  activeEl.textContent=tasks.filter(t=>!t.completed).length;
  completedEl.textContent=tasks.filter(t=>t.completed).length;
}

addBtn.addEventListener("click",()=>{
  const text=inputEl.value.trim();
  if(!text)return;
  if(editingId){
    updateTask(editingId,text);
    editingId=null;
    addBtn.textContent="Add Task";
    addBtn.setAttribute("aria-label","Add task");
  }else addTask(text);
  inputEl.value="";
  inputEl.focus();
});

inputEl.addEventListener("keypress",e=>{if(e.key==="Enter")addBtn.click()});

filterBtns.forEach(btn=>{
  btn.addEventListener("click",()=>{
    filterBtns.forEach(b=>{
      b.classList.remove("active");
      b.setAttribute("aria-pressed","false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed","true");
    currentFilter=btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click",()=>{
  showModal("Clear all completed tasks?",c=>{
    if(!c)return;
    tasks=tasks.filter(t=>!t.completed);
    saveTasks();
    renderTasks();
  })
});

clearAllBtn.addEventListener("click",()=>{
  showModal("Clear all tasks?",c=>{
    if(!c)return;
    tasks=[];
    saveTasks();
    renderTasks();
  })
});

renderTasks();

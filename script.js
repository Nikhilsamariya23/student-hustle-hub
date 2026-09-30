// --- Tab Switching ---
function switchTab(tabId){
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

// --- NEET 2026 Countdown: 3rd May 2026 14:00 IST (08:30 UTC) ---
const examDate = new Date('2026-05-03T08:30:00Z').getTime();
function updateCountdown(){
  const now = Date.now();
  const diff = examDate - now;
  if(diff <= 0){
    document.getElementById('countdown-message').textContent = "All the best! Exam day is here 🔥";
    return;
  }
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  const m = Math.floor((diff % (1000*60*60)) / (1000*60));
  const s = Math.floor((diff % (1000*60)) / 1000);
  document.getElementById('days').textContent = String(d).padStart(2,'0');
  document.getElementById('hours').textContent = String(h).padStart(2,'0');
  document.getElementById('minutes').textContent = String(m).padStart(2,'0');
  document.getElementById('seconds').textContent = String(s).padStart(2,'0');
}
setInterval(updateCountdown,1000); updateCountdown();

// --- Study Tracker Logic ---
let mode = 'stopwatch'; // 'stopwatch' | 'pomodoro'
let timerInterval = null;
let secondsElapsed = 0;
let isRunning = false;
let pomodoroSeconds = 25*60;

const display = document.getElementById('timer-display');
const statusText = document.getElementById('timer-status');
const startPauseBtn = document.getElementById('startPauseBtn');

function setMode(newMode){
  mode = newMode;
  resetTimer();
  document.getElementById('mode-stopwatch').classList.toggle('active', mode==='stopwatch');
  document.getElementById('mode-pomodoro').classList.toggle('active', mode==='pomodoro');
}
function formatTime(sec){
  const h = Math.floor(sec/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function renderTimer(){
  if(mode==='pomodoro'){
    display.textContent = formatTime(pomodoroSeconds);
  } else {
    display.textContent = formatTime(secondsElapsed);
  }
}
function toggleTimer(){
  if(isRunning){
    clearInterval(timerInterval); isRunning=false;
    startPauseBtn.innerHTML='<i class="fa-solid fa-play"></i>';
    statusText.textContent='Paused';
  } else {
    isRunning=true;
    startPauseBtn.innerHTML='<i class="fa-solid fa-pause"></i>';
    statusText.textContent= mode==='pomodoro' ? 'Focusing... 25 min session' : 'Studying... Stay focused!';
    timerInterval = setInterval(()=>{
      if(mode==='pomodoro'){
        pomodoroSeconds--;
        if(pomodoroSeconds<=0){
          clearInterval(timerInterval); isRunning=false;
          alert('Pomodoro complete! Take a 5 min break 🧠');
          saveSession(25*60);
          pomodoroSeconds=25*60;
          startPauseBtn.innerHTML='<i class="fa-solid fa-play"></i>';
          statusText.textContent='Session saved! Great work';
        }
      } else {
        secondsElapsed++;
      }
      renderTimer();
    },1000);
  }
}
function resetTimer(){
  clearInterval(timerInterval); isRunning=false;
  secondsElapsed=0; pomodoroSeconds=25*60;
  startPauseBtn.innerHTML='<i class="fa-solid fa-play"></i>';
  statusText.textContent='Ready to hustle?';
  renderTimer();
}
function stopAndSave(){
  if(mode==='stopwatch' && secondsElapsed>0){
    saveSession(secondsElapsed);
    alert(`Saved ${(secondsElapsed/60).toFixed(1)} mins to today's total!`);
  } else if(mode==='pomodoro' && (25*60 - pomodoroSeconds)>30){
    const studied = 25*60 - pomodoroSeconds;
    saveSession(studied);
    alert(`Saved ${(studied/60).toFixed(1)} mins!`);
  }
  resetTimer(); updateStats();
}
function todayKey(){
  const d=new Date(); return `shh_hours_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function sessionsKey(){ const d=new Date(); return `shh_sessions_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
function saveSession(sec){
  const hrs = sec/3600;
  const prev = parseFloat(localStorage.getItem(todayKey())||'0');
  const sess = parseInt(localStorage.getItem(sessionsKey())||'0');
  localStorage.setItem(todayKey(), (prev+hrs).toFixed(3));
  localStorage.setItem(sessionsKey(), sess+1);
  updateStats();
}
function updateStats(){
  const hrs = parseFloat(localStorage.getItem(todayKey())||'0');
  const sess = parseInt(localStorage.getItem(sessionsKey())||'0');
  document.getElementById('today-hours').textContent = hrs.toFixed(2);
  document.getElementById('today-sessions').textContent = sess;
  document.getElementById('progress-fill').style.width = Math.min(100, (hrs/6)*100)+'%';
}
function resetTodayStats(){
  if(confirm("Reset today's study hours?")){
    localStorage.removeItem(todayKey());
    localStorage.removeItem(sessionsKey());
    updateStats();
  }
}
renderTimer(); updateStats();

// --- Water Tracker ---
const WATER_TOTAL=8;
function getWaterKey(){ const d=new Date(); return `shh_water_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
function renderWater(){
  const grid=document.getElementById('water-grid');
  const count=parseInt(localStorage.getItem(getWaterKey())||'0');
  grid.innerHTML='';
  for(let i=1;i<=WATER_TOTAL;i++){
    const div=document.createElement('div');
    div.className='water-glass'+(i<=count?' filled':'');
    div.innerHTML='<i class="fa-solid fa-glass-water"></i>';
    div.onclick=()=>toggleWater(i);
    grid.appendChild(div);
  }
  document.getElementById('water-count').textContent=`${count} / ${WATER_TOTAL} Glasses`;
  document.getElementById('water-litres').textContent=(count*0.375).toFixed(2)+' L';
  document.getElementById('water-fill').style.width=(count/WATER_TOTAL*100)+'%';
}
function toggleWater(index){
  let count=parseInt(localStorage.getItem(getWaterKey())||'0');
  count = (count >= index) ? index-1 : index;
  localStorage.setItem(getWaterKey(), count);
  renderWater();
}
function resetWater(){ localStorage.removeItem(getWaterKey()); renderWater(); }
renderWater();

// --- PWA Service Worker ---
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').then(()=>console.log('SW registered')).catch(()=>{});
  });
}

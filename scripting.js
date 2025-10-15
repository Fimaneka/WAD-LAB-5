document.addEventListener('DOMContentLoaded', () => {
  // Initialize interactive elements
  updateClock();
  setInterval(updateClock, 1000);
  generateCalendar(new Date().getMonth(), new Date().getFullYear());
  loadInitialStyles();
});

// --- Theme & Customization Functions ---

function loadInitialStyles() {
  const root = document.documentElement;
  // Load settings from local storage if available
  root.style.setProperty('--primary', localStorage.getItem('primaryColor') || '#4361ee');
  root.style.setProperty('--font-size', (localStorage.getItem('fontSize') || '16') + 'px');
  root.style.setProperty('--border-radius', (localStorage.getItem('borderRadius') || '5') + 'px');

  // Apply theme class
  const theme = localStorage.getItem('theme') || 'light';
  document.body.className = theme;
  document.getElementById('themeSelect').value = theme;

  // Sync slider values to loaded styles
  document.getElementById('fontSize').value = localStorage.getItem('fontSize') || '16';
  document.getElementById('borderRadius').value = localStorage.getItem('borderRadius') || '5';
  document.getElementById('fontSizeValue').textContent = (localStorage.getItem('fontSize') || '16') + 'px';
  document.getElementById('borderRadiusValue').textContent = (localStorage.getItem('borderRadius') || '5') + 'px';
}

function togglePanel() {
  const panel = document.getElementById('customPanel');
  panel.classList.toggle('open');
}

function changeColor(variable, color) {
  const root = document.documentElement;
  root.style.setProperty(`--${variable}`, color);
  localStorage.setItem(`${variable}Color`, color);
  showToast(`Primary color changed to ${color}`, 'info');
}

function changeTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
  showToast(`Theme changed to ${theme}`, 'info');
}

function changeFontSize(size) {
  const root = document.documentElement;
  root.style.setProperty('--font-size', `${size}px`);
  document.getElementById('fontSizeValue').textContent = `${size}px`;
  localStorage.setItem('fontSize', size);
}

function changeBorderRadius(radius) {
  const root = document.documentElement;
  root.style.setProperty('--border-radius', `${radius}px`);
  document.getElementById('borderRadiusValue').textContent = `${radius}px`;
  localStorage.setItem('borderRadius', radius);
}

function resetStyles() {
  localStorage.clear();
  // Reset DOM elements directly to default values
  document.body.className = 'light';
  document.getElementById('themeSelect').value = 'light';
  document.getElementById('fontSize').value = 16;
  document.getElementById('borderRadius').value = 5;
  
  // Re-run loadInitialStyles to apply defaults and clean up
  loadInitialStyles(); 
  showToast('Styles reset to default!', 'success');
}

// --- Toast Notification ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Force reflow to enable transition
  void toast.offsetWidth;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3000);
}

// --- Interactive Components Logic ---

function setActiveNav(element) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
}

function toggleDropdown(button) {
  const menu = button.nextElementSibling;
  document.querySelectorAll('.dropdown-menu').forEach(m => {
    if (m !== menu) {
      m.classList.remove('show');
    }
  });
  menu.classList.toggle('show');
}

function toggleChip(chip) {
  chip.classList.toggle('active');
  const action = chip.classList.contains('active') ? 'activated' : 'deactivated';
  showToast(`${chip.textContent.trim().split('\n')[0]} filter ${action}`, 'info');
}

function removeChip(event, chip) {
  // Stop the click from propagating to the parent chip's toggle function
  event.stopPropagation();
  chip.remove();
  showToast('Chip removed', 'warning');
}

function updateSliderValue(slider, outputId, suffix = '') {
  document.getElementById(outputId).textContent = slider.value + suffix;
}

function toggleSwitch(name, isChecked) {
  const state = isChecked ? 'Enabled' : 'Disabled';
  showToast(`${name} ${state}`, isChecked ? 'success' : 'warning');
}

function selectListItem(item) {
  document.querySelectorAll('.list-item').forEach(i => {
    i.style.backgroundColor = '';
    i.style.color = '';
  });
  // Apply primary color from CSS variable
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const whiteColor = getComputedStyle(document.documentElement).getPropertyValue('--white').trim();
  
  item.style.backgroundColor = primaryColor;
  item.style.color = whiteColor;
  
  showToast(`${item.querySelector('span').textContent.trim()} selected`, 'info');
}

function handleFormSubmit(event) {
  event.preventDefault();
  showToast('Form submitted successfully!', 'success');
  event.target.reset();
}

function openTab(evt, tabId) {
  // Declare all variables
  let i, tabcontent, tablinks;

  // Get all elements with class="tab-pane" and hide them
  tabcontent = document.getElementsByClassName('tab-pane');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove('active');
  }

  // Get all elements with class="tab-link" and remove the class "active"
  tablinks = document.getElementsByClassName('tab-link');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove('active');
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

// --- Widget Specific Logic ---

// Clock Widget
let clockType = 'digital';
let analogInterval;

function updateClock() {
  const now = new Date();
  const clockElement = document.getElementById('clock');
  const dateElement = document.getElementById('date');

  dateElement.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (clockType === 'digital') {
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    clockElement.textContent = timeString;
    document.getElementById('analog-clock-container').style.display = 'none';
    clockElement.style.display = 'block';
  } else if (clockType === 'analog') {
    drawAnalogClock(now);
    clockElement.style.display = 'none';
    document.getElementById('analog-clock-container').style.display = 'block';
    clockElement.textContent = ''; // Hide digital time
  }
}

function setClockType(type) {
  clockType = type;
  document.getElementById('digitalToggle').classList.remove('active');
  document.getElementById('analogToggle').classList.remove('active');
  document.getElementById(`${type}Toggle`).classList.add('active');

  if (type === 'analog') {
      // Clear digital display logic and ensure analog canvas is updated frequently
      clearInterval(analogInterval);
      analogInterval = setInterval(updateClock, 1000);
  } else {
      // Stop analog-specific interval, rely on the main clock interval if needed
      clearInterval(analogInterval);
  }
  updateClock();
}

function drawAnalogClock(date) {
  const canvas = document.getElementById('analog-clock');
  const ctx = canvas.getContext('2d');
  const radius = canvas.height / 2;
  
  // Save context and translate to center only once
  ctx.save();
  ctx.translate(radius, radius); 

  // Clear previous frame
  ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
  
  // Get CSS variables for styling
  const cardBg = getComputedStyle(document.body).getPropertyValue('--card-bg');
  const borderColor = getComputedStyle(document.body).getPropertyValue('--border-color');
  const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary');
  const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
  const warningColor = getComputedStyle(document.body).getPropertyValue('--warning');


  // Draw Clock Face
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = radius * 0.05;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
  ctx.fillStyle = primaryColor;
  ctx.fill();

  // Draw Time
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  // Hour hand
  hour = hour % 12;
  hour = (hour * Math.PI) / 6 + (minute * Math.PI) / (6 * 60) + (second * Math.PI) / (360 * 60);
  drawHand(ctx, hour, radius * 0.5, radius * 0.07, primaryColor);

  // Minute hand
  minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
  drawHand(ctx, minute, radius * 0.8, radius * 0.05, textColor);

  // Second hand
  second = (second * Math.PI) / 30;
  drawHand(ctx, second, radius * 0.9, radius * 0.02, warningColor);

  // Restore context
  ctx.restore();
}

function drawHand(ctx, pos, length, width, color) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

// Calendar Widget
function generateCalendar(month, year) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const container = document.getElementById('mini-calendar');
  const currentMonthDisplay = document.getElementById('current-month');
  container.innerHTML = '';
  currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sunday, 1=Monday...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayDate = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Add day labels
  dayNames.forEach(day => {
    const dayLabel = document.createElement('div');
    dayLabel.className = 'day-label';
    dayLabel.textContent = day;
    container.appendChild(dayLabel);
  });

  // Add blank days for padding
  for (let i = 0; i < firstDay; i++) {
    container.appendChild(document.createElement('div'));
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    if (day === todayDate && month === currentMonth && year === currentYear) {
      dayElement.classList.add('today');
    }
    container.appendChild(dayElement);
  }
}

// Mood Tracker Widget
function trackMood(mood) {
  const responseElement = document.getElementById('mood-response');
  let message;
  let type;

  switch (mood) {
    case '😄':
      message = 'Great! Keep that energy up.';
      type = 'success';
      break;
    case '🙂':
      message = 'A nice, pleasant mood.';
      type = 'info';
      break;
    case '😐':
      message = 'Feeling neutral today.';
      type = 'info';
      break;
    case '😢':
      message = 'Sending positive vibes your way.';
      type = 'warning';
      break;
    case '😤':
      message = 'Take a deep breath and relax.';
      type = 'warning';
      break;
    default:
      message = 'Mood selected.';
      type = 'info';
  }
  responseElement.textContent = `${mood} ${message}`;
  showToast(`Mood logged: ${mood}`, type);
}

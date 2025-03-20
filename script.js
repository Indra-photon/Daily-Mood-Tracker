const moodEmojis = document.querySelectorAll('.mood-emoji');
const saveBtn = document.getElementById('save-mood');
const currentDateElement = document.getElementById('current-date');
const clearHistoryBtn = document.getElementById('clear-history');
const dayViewContainer = document.getElementById('day-view-container');
const weekViewContainer = document.getElementById('week-view-container');
const calendarViewContainer = document.getElementById('calendar-view-container');
const viewButtons = document.querySelectorAll('.view-btn');
const dayViewDate = document.getElementById('day-view-date');
const moodEntries = document.getElementById('mood-entries');
const entryIndicators = document.getElementById('entry-indicators');
const prevEntryBtn = document.getElementById('prev-entry');
const nextEntryBtn = document.getElementById('next-entry');

const now = new Date();
currentDateElement.textContent = now.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

let selectedMood = null;
let currentEntryIndex = 0;

moodEmojis.forEach((element) => {
    element.addEventListener("click", () => {
        moodEmojis.forEach(emoji => emoji.classList.remove('selected'));
        
        element.classList.add('selected');
        
        selectedMood = {
            mood: element.getAttribute('data-mood'),
            emoji: element.querySelector('.emoji').textContent,
            label: element.querySelector('.mood-label').textContent
        };
    });
});

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

saveBtn.addEventListener('click', () => {
    if (!selectedMood) {
        alert('Please select a mood first');
        return;
    }
    
    const today = new Date();
    const dateKey = getLocalDateString(today);
    const timeStamp = today.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const moodEntry = {
        date: dateKey,
        time: timeStamp,
        mood: selectedMood.mood,
        emoji: selectedMood.emoji,
        label: selectedMood.label,
        timestamp: today.getTime()
    };
    
    let moodData = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    moodData.push(moodEntry);
    
    moodData.sort((a, b) => b.timestamp - a.timestamp);
    
    localStorage.setItem('moodHistory', JSON.stringify(moodData));
    
    moodEmojis.forEach(emoji => emoji.classList.remove('selected'));
    selectedMood = null;
    
    displayWeekView();
    updateCalendarView();
    
    displayDayView(dateKey);
    
    alert('Mood saved successfully!');
});

function displayDayView(dateStr) {
    const moodData = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    const dayEntries = moodData.filter(entry => entry.date === dateStr);
    
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    const displayDate = new Date(year, month - 1, day).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    dayViewDate.textContent = displayDate;
    
    currentEntryIndex = 0;
    
    const entriesContainer = document.createElement('div');
    entriesContainer.className = 'mood-entries';
    moodEntries.innerHTML = '';
    entryIndicators.innerHTML = '';
    
    if (dayEntries.length > 0) {
        dayEntries.forEach((entry, index) => {
            const entrySlide = document.createElement('div');
            entrySlide.className = 'mood-entry';
            entrySlide.setAttribute('data-mood', entry.mood);
            
            entrySlide.innerHTML = `
                <span class="mood-emoji-big">${entry.emoji}</span>
                <div class="mood-time">${entry.time}</div>
                <div class="mood-label">${entry.label}</div>
            `;
            
            entriesContainer.appendChild(entrySlide);
            
            const indicator = document.createElement('div');
            indicator.className = 'entry-indicator';
            if (index === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                navigateToEntry(index);
            });
            
            entryIndicators.appendChild(indicator);
        });
        
        moodEntries.appendChild(entriesContainer);
        
        updateSliderControls();
        
        prevEntryBtn.replaceWith(prevEntryBtn.cloneNode(true));
        nextEntryBtn.replaceWith(nextEntryBtn.cloneNode(true));
        
        const newPrevBtn = document.getElementById('prev-entry');
        const newNextBtn = document.getElementById('next-entry');
        
        newPrevBtn.addEventListener('click', () => {
            navigateToEntry(currentEntryIndex - 1);
        });
        
        newNextBtn.addEventListener('click', () => {
            navigateToEntry(currentEntryIndex + 1);
        });
    } else {
        moodEntries.innerHTML = `
            <div class="no-entries">
                <p>No moods logged for this day yet.</p>
            </div>
        `;
        
        prevEntryBtn.disabled = true;
        nextEntryBtn.disabled = true;
    }
    
    switchToView('day-view');
}

function navigateToEntry(index) {
    const entries = document.querySelectorAll('.mood-entry');
    const indicators = document.querySelectorAll('.entry-indicator');
    
    if (index < 0 || index >= entries.length) return;
    
    currentEntryIndex = index;
    
    const entriesContainer = document.querySelector('.mood-entries');
    entriesContainer.style.transform = `translateX(-${index * 100}%)`;
    
    indicators.forEach((indicator, i) => {
        if (i === index) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    updateSliderControls();
}

function updateSliderControls() {
    const entries = document.querySelectorAll('.mood-entry');
    const prevBtn = document.getElementById('prev-entry');
    const nextBtn = document.getElementById('next-entry');
    
    if (entries.length <= 1) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }
    
    prevBtn.disabled = currentEntryIndex === 0;
    nextBtn.disabled = currentEntryIndex === entries.length - 1;
}

function displayWeekView() {
    const moodData = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const weekTimeline = document.getElementById('week-timeline');
    
    weekTimeline.innerHTML = '';
    
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentDate);
        day.setDate(currentDate.getDate() - currentDay + i);
        weekDays.push(day);
    }
    
    weekDays.forEach(day => {
        const dayKey = getLocalDateString(day);
        const dayName = day.toLocaleDateString(undefined, { weekday: 'short' });
        const dayNum = day.getDate();
        
        const dayEntries = moodData.filter(entry => entry.date === dayKey);
        
        const dayItem = document.createElement('div');
        dayItem.className = 'day-item';
        
        if (dayEntries.length > 0) {
            const firstEntry = dayEntries[0];
            
            dayItem.setAttribute('data-mood', firstEntry.mood);
            dayItem.innerHTML = `
                <div class="day-name">${dayName} ${dayNum}</div>
                <span class="emoji">${firstEntry.emoji}</span>
                ${dayEntries.length > 1 ? `<div class="day-count">+${dayEntries.length}</div>` : ''}
            `;
            
            dayItem.addEventListener('click', () => {
                displayDayView(dayKey);
            });
        } else {
            dayItem.innerHTML = `
                <div class="day-name">${dayName} ${dayNum}</div>
                <span class="emoji">❓</span>
            `;
        }
        
        weekTimeline.appendChild(dayItem);
    });
}

let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function updateCalendarView() {
    const calendarMonth = document.getElementById('calendar-month');
    const calendarDays = document.getElementById('calendar-days');
    const moodData = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    calendarMonth.textContent = new Date(currentCalendarYear, currentCalendarMonth).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
    });
    
    calendarDays.innerHTML = '';
    
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const startingDay = firstDay.getDay();
    
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    const prevMonthLastDay = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();
    
    for (let i = startingDay - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day inactive';
        dayDiv.innerHTML = `<div class="day-number">${prevMonthLastDay - i}</div>`;
        calendarDays.appendChild(dayDiv);
    }
    
    for (let i = 1; i <= totalDays; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const dayDate = new Date(currentCalendarYear, currentCalendarMonth, i);
        const dayKey = getLocalDateString(dayDate);
        
        const dayEntries = moodData.filter(entry => entry.date === dayKey);
        const entryCount = dayEntries.length;
        
        if (entryCount > 0) {
            const lastEntry = dayEntries[0];
            
            dayDiv.setAttribute('data-mood', lastEntry.mood);
            dayDiv.innerHTML = `
                <div class="day-number">${i}</div>
                <span class="emoji">${lastEntry.emoji}</span>
                ${entryCount > 1 ? `<span class="entry-count">+${entryCount}</span>` : ''}
            `;
            
            dayDiv.addEventListener('click', () => {
                displayDayView(dayKey);
            });
        } else {
            dayDiv.innerHTML = `<div class="day-number">${i}</div>`;
        }
        
        const today = new Date();
        if (i === today.getDate() && 
            currentCalendarMonth === today.getMonth() && 
            currentCalendarYear === today.getFullYear()) {
            dayDiv.classList.add('today');
        }
        
        calendarDays.appendChild(dayDiv);
    }
    
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + totalDays);
    
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day inactive';
        dayDiv.innerHTML = `<div class="day-number">${i}</div>`;
        calendarDays.appendChild(dayDiv);
    }
}

function switchToView(viewId) {
   
    viewButtons.forEach(btn => btn.classList.remove('active'));
    
    
    document.getElementById(viewId).classList.add('active');
    

    document.querySelectorAll('.view-container').forEach(container => {
        container.classList.add('hidden');
    });
    

    const viewContainer = document.getElementById(viewId + '-container');
    viewContainer.classList.remove('hidden');
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentCalendarMonth--;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    updateCalendarView();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentCalendarMonth++;
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    updateCalendarView();
});


viewButtons.forEach(button => {
    button.addEventListener('click', function() {
        const viewId = this.id;
        console.log("View button clicked:", viewId);
        switchToView(viewId);
    });
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all mood history? This cannot be undone.')) {
        localStorage.removeItem('moodHistory');
        displayWeekView();
        updateCalendarView();
        
        // if (!document.getElementById('day-view-container').classList.contains('hidden')) {
        //     const todayKey = getLocalDateString(new Date());
        //     displayDayView(todayKey);
        // }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.view-container').forEach(container => {
        container.style.display = "block";
        container.classList.add('hidden');
    });
    
    document.getElementById('calendar-view-container').classList.remove('hidden');
    
    viewButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById('calendar-view').classList.add('active');
    
    displayWeekView();
    updateCalendarView();
});
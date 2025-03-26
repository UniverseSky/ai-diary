document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('weekDays')) return;
    
    // 初始化当前周
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // 渲染周视图
    renderWeekView(currentDate);
    
    // 设置周导航
    setupWeekNavigation();
    
    // 默认选中今天
    setTimeout(() => {
        selectDay(currentDate);
    }, 100);
});

function renderWeekView(date) {
    const weekDaysContainer = document.getElementById('weekDays');
    const weekRangeDisplay = document.getElementById('currentWeekRange');
    
    // 计算周的起始日(周日)和结束日(周六)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // 更新周范围显示
    weekRangeDisplay.textContent = `${formatDate(startOfWeek)}-${formatDate(endOfWeek)}`;
    
    // 清空周视图
    weekDaysContainer.innerHTML = '';
    
    // 生成一周的日期
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('day-cell');
        
        // 标记今天
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // 日期数字
        const dateNumber = document.createElement('div');
        dateNumber.classList.add('day-number');
        dateNumber.textContent = day.getDate();
        dayElement.appendChild(dateNumber);
        
        // 心情指示器
        const diaries = getDiariesForDay(day);
        if (diaries.length > 0) {
            const primaryMood = getPrimaryMoodForDay(diaries);
            if (primaryMood) {
                const moodIndicator = document.createElement('div');
                moodIndicator.classList.add('mood-dot', primaryMood);
                dayElement.appendChild(moodIndicator);
            }
        }
        
        // 添加点击事件
        dayElement.addEventListener('click', function() {
            selectDay(day);
        });
        
        weekDaysContainer.appendChild(dayElement);
    }
}

function selectDay(day) {
    // 移除之前选中的样式
    document.querySelectorAll('.day-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // 添加选中样式
    const dayCells = document.querySelectorAll('.day-cell');
    const dayIndex = (day.getDay() + 6) % 7; // 调整周日索引
    if (dayCells[dayIndex]) {
        dayCells[dayIndex].classList.add('selected');
    }
    
    // 更新选中日期内容
    updateSelectedDayContent(day);
}

function updateSelectedDayContent(day) {
    const selectedDayTitle = document.getElementById('selectedDayTitle');
    const dayMoodContainer = document.getElementById('dayMood');
    const dayDiariesList = document.getElementById('dayDiariesList');
    const dayActionsList = document.getElementById('dayActionsList');
    
    // 设置日期标题
    selectedDayTitle.textContent = formatDateWithWeekday(day);
    
    // 获取当天的日记
    const diaries = getDiariesForDay(day);
    
    // 更新心情显示
    updateMoodIndicator(dayMoodContainer, diaries);
    
    // 更新日记列表
    if (diaries.length > 0) {
        dayDiariesList.innerHTML = diaries.map(diary => createDiaryCard(diary)).join('');
        
        // 添加日记点击事件
        document.querySelectorAll('#dayDiariesList .diary-card').forEach(card => {
            card.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                window.location.href = `diary-detail.html?id=${id}`;
            });
        });
    } else {
        dayDiariesList.innerHTML = '<p class="no-entries">这一天没有日记记录</p>';
    }
    
    // 更新行动建议列表
    const actions = getActionsForDay(day);
    if (actions.length > 0) {
        dayActionsList.innerHTML = actions.map(action => createActionCard(action)).join('');
    } else {
        dayActionsList.innerHTML = '<p class="no-entries">这一天没有行动建议</p>';
    }
}

function updateMoodIndicator(container, diaries) {
    container.innerHTML = '';
    
    if (diaries.length === 0) {
        container.innerHTML = '<p>没有心情数据</p>';
        return;
    }
    
    const moodCounts = {
        happy: 0,
        sad: 0,
        angry: 0,
        calm: 0,
        neutral: 0
    };
    
    diaries.forEach(diary => {
        moodCounts[diary.mood]++;
    });
    
    const total = diaries.length;
    const moodLabels = {
        happy: '开心',
        sad: '难过',
        angry: '生气',
        calm: '平静',
        neutral: '一般'
    };
    
    // 创建心情总结
    const summary = document.createElement('div');
    summary.classList.add('mood-summary');
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > 0) {
            const percentage = Math.round((moodCounts[mood] / total) * 100);
            
            const moodItem = document.createElement('div');
            moodItem.classList.add('mood-item', mood);
            
            const moodLabel = document.createElement('span');
            moodLabel.classList.add('mood-label');
            moodLabel.textContent = `${moodLabels[mood]} ${percentage}%`;
            
            const moodBar = document.createElement('div');
            moodBar.classList.add('mood-bar');
            moodBar.style.width = `${percentage}%`;
            
            moodItem.appendChild(moodLabel);
            moodItem.appendChild(moodBar);
            summary.appendChild(moodItem);
        }
    }
    
    container.appendChild(summary);
}

function setupWeekNavigation() {
    document.getElementById('prevWeek').addEventListener('click', function() {
        const currentDisplayedDate = getCurrentDisplayedDate();
        currentDisplayedDate.setDate(currentDisplayedDate.getDate() - 7);
        renderWeekView(currentDisplayedDate);
        
        // 保持选中同一天
        const selectedDay = new Date(currentDisplayedDate);
        const previouslySelected = document.querySelector('.day-cell.selected');
        if (previouslySelected) {
            const dayOffset = Array.from(document.querySelectorAll('.day-cell')).indexOf(previouslySelected);
            selectedDay.setDate(currentDisplayedDate.getDate() + dayOffset);
        }
        selectDay(selectedDay);
    });
    
    document.getElementById('nextWeek').addEventListener('click', function() {
        const currentDisplayedDate = getCurrentDisplayedDate();
        currentDisplayedDate.setDate(currentDisplayedDate.getDate() + 7);
        renderWeekView(currentDisplayedDate);
        
        // 保持选中同一天
        const selectedDay = new Date(currentDisplayedDate);
        const previouslySelected = document.querySelector('.day-cell.selected');
        if (previouslySelected) {
            const dayOffset = Array.from(document.querySelectorAll('.day-cell')).indexOf(previouslySelected);
            selectedDay.setDate(currentDisplayedDate.getDate() + dayOffset);
        }
        selectDay(selectedDay);
    });
}

function getCurrentDisplayedDate() {
    const weekRangeText = document.getElementById('currentWeekRange').textContent;
    const startDateStr = weekRangeText.split('-')[0].trim();
    const [year, month, day] = startDateStr.match(/\d+/g);
    return new Date(year, month - 1, day);
}

function formatDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateWithWeekday(date) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${formatDate(date)} 星期${weekdays[date.getDay()]}`;
}

function createDiaryCard(diary) {
    const date = new Date(diary.date);
    const timeString = date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'});
    
    return `
        <div class="diary-card" data-id="${diary.id}">
            <div class="mood ${diary.mood}">${getMoodIcon(diary.mood)}</div>
            <h3>${diary.weather}</h3>
            <p>${diary.content.length > 50 ? diary.content.substring(0, 50) + '...' : diary.content}</p>
            <div class="time">${timeString}</div>
        </div>
    `;
}

function createActionCard(action) {
    const completedSteps = action.steps.filter(step => step.completed).length;
    const totalSteps = action.steps.length;
    
    return `
        <div class="action-card">
            <h5>${action.title}</h5>
            <div class="progress">${completedSteps}/${totalSteps} 完成</div>
            <ul>
                ${action.steps.map(step => `
                    <li class="${step.completed ? 'completed' : ''}">${step.text}</li>
                `).join('')}
            </ul>
        </div>
    `;
}

// 其他辅助函数保持不变(getDiariesForDay, getPrimaryMoodForDay, getActionsForDay等)
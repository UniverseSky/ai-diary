document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.diary-detail-container')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const diaryId = urlParams.get('id');
    
    if (!diaryId) {
        window.location.href = 'index.html';
        return;
    }
    
    const diary = appData.diaries.find(d => d.id === diaryId);
    
    if (!diary) {
        window.location.href = 'index.html';
        return;
    }
    
    displayDiaryDetail(diary);
    setupActionButtons(diary);
});

function displayDiaryDetail(diary) {
    const detailContainer = document.querySelector('.diary-detail-container');
    const date = new Date(diary.date);
    
    const moodClasses = {
        happy: 'happy',
        sad: 'sad',
        angry: 'angry',
        calm: 'calm',
        neutral: 'neutral'
    };
    
    const moodLabels = {
        happy: '开心',
        sad: '难过',
        angry: '生气',
        calm: '平静',
        neutral: '一般'
    };
    
    detailContainer.innerHTML = `
        <div class="diary-header">
            <h2>${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}</h2>
            <div class="diary-meta">
                <span class="weather">${diary.weather}</span>
                <span class="mood ${moodClasses[diary.mood]}">${moodLabels[diary.mood]}</span>
            </div>
        </div>
        
        <div class="diary-content">
            <p>${diary.content.replace(/\n/g, '<br>')}</p>
        </div>
        
        ${diary.image ? `<div class="diary-image"><img src="${diary.image}" alt="日记图片"></div>` : ''}
        
        <div class="ai-analysis">
            <div class="analysis-section empathy">
                <h3>贴心共情</h3>
                <p>${diary.aiAnalysis.empathy}</p>
            </div>
            
            <div class="analysis-section zodiac">
                <h3>星座运势分析</h3>
                <p>${diary.aiAnalysis.zodiacFeedback}</p>
            </div>
            
            <div class="analysis-section bazi">
                <h3>八字运势分析</h3>
                <p>${diary.aiAnalysis.baziAnalysis}</p>
            </div>
            
            <div class="analysis-section actions">
                <h3>行动建议</h3>
                <div class="action-suggestions">
                    ${diary.aiAnalysis.actionSuggestions.map((action, index) => `
                        <div class="action-item">
                            <input type="checkbox" id="action-${index}" ${diary.actionTaken.includes(index) ? 'checked' : ''}>
                            <label for="action-${index}">${action}</label>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary save-actions">保存选择</button>
            </div>
        </div>
    `;
}

function setupActionButtons(diary) {
    document.querySelector('.save-actions')?.addEventListener('click', function() {
        const checkedActions = [];
        document.querySelectorAll('.action-item input[type="checkbox"]').forEach((checkbox, index) => {
            if (checkbox.checked) {
                checkedActions.push(index);
            }
        });
        
        diary.actionTaken = checkedActions;
        saveData();
        
        // 检查是否需要创建新的行动项
        createActionItemsFromDiary(diary);
        
        alert('行动建议已保存');
    });
}

function createActionItemsFromDiary(diary) {
    // 检查是否已经为这篇日记创建过行动项
    const existingAction = appData.actions.find(action => action.sourceDiaryId === diary.id);
    
    if (existingAction) {
        // 更新现有行动项
        existingAction.steps = diary.aiAnalysis.actionSuggestions
            .filter((_, index) => diary.actionTaken.includes(index))
            .map((action, index) => ({
                id: index,
                text: action,
                completed: false
            }));
    } else if (diary.actionTaken.length > 0) {
        // 创建新的行动项
        const newAction = {
            id: Date.now().toString(),
            sourceDiaryId: diary.id,
            title: `来自${new Date(diary.date).toLocaleDateString()}日记的行动建议`,
            date: diary.date,
            steps: diary.aiAnalysis.actionSuggestions
                .filter((_, index) => diary.actionTaken.includes(index))
                .map((action, index) => ({
                    id: index,
                    text: action,
                    completed: false
                })),
            completed: false
        };
        
        appData.actions.push(newAction);
    }
    
    saveData();
}
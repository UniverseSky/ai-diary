document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('actionItems')) return;
    
    loadActionList();
    setupFilterButtons();
});

function loadActionList(filter = 'all') {
    const actionItemsContainer = document.getElementById('actionItems');
    
    let actionsToShow = appData.actions;
    
    if (filter === 'active') {
        actionsToShow = appData.actions.filter(action => !action.completed);
    } else if (filter === 'completed') {
        actionsToShow = appData.actions.filter(action => action.completed);
    }
    
    if (actionsToShow.length === 0) {
        actionItemsContainer.innerHTML = `
            <div class="empty-state">
                <p>没有${filter === 'all' ? '' : filter === 'active' ? '进行中' : '已完成'}的行动建议</p>
            </div>
        `;
        return;
    }
    
    actionItemsContainer.innerHTML = actionsToShow.map(action => createActionItem(action)).join('');
    
    // 添加点击事件
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // 如果点击的是复选框，不跳转
            if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                return;
            }
            
            const id = this.getAttribute('data-id');
            // 这里可以添加跳转到行动详情的逻辑
            console.log('查看行动详情:', id);
        });
    });
    
    // 添加复选框事件
    document.querySelectorAll('.action-step input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const actionId = this.closest('.action-item').getAttribute('data-id');
            const stepId = parseInt(this.getAttribute('data-step-id'));
            
            const action = appData.actions.find(a => a.id === actionId);
            if (action) {
                const step = action.steps.find(s => s.id === stepId);
                if (step) {
                    step.completed = this.checked;
                    
                    // 检查是否所有步骤都完成了
                    action.completed = action.steps.every(step => step.completed);
                    
                    saveData();
                    
                    // 如果是过滤视图，可能需要重新加载
                    const activeFilter = document.querySelector('.filter-btn.active').id.replace('filter', '').toLowerCase();
                    if (activeFilter !== 'all') {
                        loadActionList(activeFilter);
                    }
                }
            }
        });
    });
}

function createActionItem(action) {
    const date = new Date(action.date);
    const completedSteps = action.steps.filter(step => step.completed).length;
    const totalSteps = action.steps.length;
    
    return `
        <div class="action-item" data-id="${action.id}">
            <h3>${action.title}</h3>
            <p>${date.toLocaleDateString('zh-CN')}</p>
            
            <div class="action-steps">
                ${action.steps.map(step => `
                    <div class="action-step">
                        <input type="checkbox" id="step-${action.id}-${step.id}" 
                               data-step-id="${step.id}" ${step.completed ? 'checked' : ''}>
                        <label for="step-${action.id}-${step.id}">${step.text}</label>
                    </div>
                `).join('')}
            </div>
            
            <div class="action-meta">
                <span>${completedSteps}/${totalSteps} 完成</span>
                <span>${action.completed ? '已完成' : '进行中'}</span>
            </div>
        </div>
    `;
}

function setupFilterButtons() {
    document.getElementById('filterAll').addEventListener('click', function() {
        setActiveFilter('all');
        loadActionList('all');
    });
    
    document.getElementById('filterActive').addEventListener('click', function() {
        setActiveFilter('active');
        loadActionList('active');
    });
    
    document.getElementById('filterCompleted').addEventListener('click', function() {
        setActiveFilter('completed');
        loadActionList('completed');
    });
}

function setActiveFilter(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
}
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('saveSettings')) return;
    
    loadSettings();
    setupSaveButton();
});

function loadSettings() {
    const userName = document.getElementById('userName');
    const birthDate = document.getElementById('birthDate');
    const birthTime = document.getElementById('birthTime');
    const aiModel = document.getElementById('aiModel');
    const diaryReminder = document.getElementById('diaryReminder');
    const actionReminder = document.getElementById('actionReminder');
    
    if (appData.user.name) userName.value = appData.user.name;
    if (appData.user.birthDate) birthDate.value = appData.user.birthDate;
    if (appData.user.birthTime) birthTime.value = appData.user.birthTime;
    
    aiModel.value = appData.settings.aiModel;
    diaryReminder.checked = appData.settings.diaryReminder;
    actionReminder.checked = appData.settings.actionReminder;
}

function setupSaveButton() {
    document.getElementById('saveSettings').addEventListener('click', function() {
        const userName = document.getElementById('userName').value.trim();
        const birthDate = document.getElementById('birthDate').value;
        const birthTime = document.getElementById('birthTime').value;
        const aiModel = document.getElementById('aiModel').value;
        const diaryReminder = document.getElementById('diaryReminder').checked;
        const actionReminder = document.getElementById('actionReminder').checked;
        
        // 更新用户数据
        appData.user.name = userName;
        appData.user.birthDate = birthDate;
        appData.user.birthTime = birthTime;
        
        // 计算星座
        if (birthDate) {
            appData.user.zodiac = calculateZodiac(birthDate);
        }
        
        // 更新设置
        appData.settings.aiModel = aiModel;
        appData.settings.diaryReminder = diaryReminder;
        appData.settings.actionReminder = actionReminder;
        
        saveData();
        
        alert('设置已保存');
    });
}
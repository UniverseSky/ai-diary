// 共用工具函数和数据
const appData = {
    user: {
        name: '',
        birthDate: '',
        birthTime: '',
        zodiac: '',
        bazi: ''
    },
    settings: {
        aiModel: 'deepseek',
        diaryReminder: true,
        actionReminder: true
    },
    diaries: [],
    actions: []
};

// 初始化应用
function initApp() {
    loadData();
    updateCurrentDate();
    
    // 设置页面导航活动状态
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (currentPage !== 'index') {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('href').includes(currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// 加载本地存储的数据
function loadData() {
    const savedData = localStorage.getItem('aiDiaryData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.assign(appData, parsedData);
    }
}

// 保存数据到本地存储
function saveData() {
    localStorage.setItem('aiDiaryData', JSON.stringify(appData));
}

// 更新当前日期显示
function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateString = now.toLocaleDateString('zh-CN', options);
    
    const dateElements = document.querySelectorAll('.current-date');
    dateElements.forEach(el => {
        el.textContent = dateString;
    });
    
    return now;
}

// 获取模拟天气数据
function getWeather() {
    const weatherTypes = ['☀️ 晴朗', '⛅ 多云', '🌧️ 小雨', '🌦️ 阵雨', '🌤️ 晴转多云', '🌫️ 雾'];
    return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}

// 获取AI提示
function getAIPrompt() {
    const prompts = [
        "今天最让你感激的一件事是什么？",
        "描述一下你今天遇到的一个有趣的人或事。",
        "你今天学到了什么新东西？",
        "今天有什么让你感到平静或快乐的时刻？",
        "如果你能给今天的自己一个建议，会是什么？",
        "今天你对自己有什么新的认识？"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
}

// 分析情绪
function analyzeMood(text) {
    const happyWords = ['开心', '高兴', '快乐', '幸福', '兴奋', '满意'];
    const sadWords = ['难过', '伤心', '悲伤', '失望', '沮丧', '孤独'];
    const angryWords = ['生气', '愤怒', '恼火', '烦躁', '不满', '讨厌'];
    const calmWords = ['平静', '安宁', '放松', '满足', '平和', '舒适'];
    
    let happyCount = 0;
    let sadCount = 0;
    let angryCount = 0;
    let calmCount = 0;
    
    happyWords.forEach(word => {
        if (text.includes(word)) happyCount++;
    });
    
    sadWords.forEach(word => {
        if (text.includes(word)) sadCount++;
    });
    
    angryWords.forEach(word => {
        if (text.includes(word)) angryCount++;
    });
    
    calmWords.forEach(word => {
        if (text.includes(word)) calmCount++;
    });
    
    const counts = {
        happy: happyCount,
        sad: sadCount,
        angry: angryCount,
        calm: calmCount
    };
    
    const max = Math.max(happyCount, sadCount, angryCount, calmCount);
    
    if (max === 0) return 'neutral';
    
    if (happyCount === max) return 'happy';
    if (sadCount === max) return 'sad';
    if (angryCount === max) return 'angry';
    if (calmCount === max) return 'calm';
    
    return 'neutral';
}

// 初始化语音识别
function initVoiceRecognition(textArea) {
    if (!('webkitSpeechRecognition' in window)) {
        alert('您的浏览器不支持语音识别功能');
        return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';
    
    recognition.onstart = function() {
        textArea.placeholder = '正在聆听...';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        textArea.value = transcript;
        textArea.placeholder = '写下你的想法、感受或经历...';
    };
    
    recognition.onerror = function(event) {
        textArea.placeholder = '写下你的想法、感受或经历...';
        console.error('语音识别错误:', event.error);
    };
    
    recognition.onend = function() {
        textArea.placeholder = '写下你的想法、感受或经历...';
    };
    
    return recognition;
}

// 计算星座
function calculateZodiac(birthDate) {
    if (!birthDate) return '';
    
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return '双鱼座';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '白羊座';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '金牛座';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '双子座';
    if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '巨蟹座';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '狮子座';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '处女座';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座';
    if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '天蝎座';
    if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '摩羯座';
    
    return '';
}

// 模拟AI分析日记
async function analyzeDiaryWithAI(diaryContent, mood) {
    // 这里应该是调用DeepSeek API的实际代码
    // 以下是模拟实现
    
    const zodiac = appData.user.zodiac || '水瓶座'; // 默认值
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 共情回应
    const empathyResponses = {
        happy: `听起来你今天过得很愉快！保持这种积极的心态对${zodiac}的你特别有益。`,
        sad: `我能感受到你今天有些难过。${zodiac}的人往往比较敏感，给自己一些时间和空间来处理这些情绪很重要。`,
        angry: `你今天似乎遇到了一些令人气愤的事情。${zodiac}的你有着强烈的正义感，但也要记得照顾好自己的情绪。`,
        calm: `你今天的平静心态令人羡慕。${zodiac}的人通常很欣赏这种平和的状态。`,
        neutral: `感谢你分享今天的经历。${zodiac}的你总是能从日常生活中发现值得思考的点。`
    };
    
    const empathy = empathyResponses[mood] || empathyResponses.neutral;
    
    // 星座分析
    const zodiacAnalysis = {
        '水瓶座': '水瓶座今天的能量鼓励创新和社交。你可能会感到比平时更有创意，适合尝试新事物或与朋友联系。',
        '双鱼座': '双鱼座今天的能量偏向内省。这是一个好时机来反思你的感受和直觉，信任你的内在智慧。',
        '白羊座': '白羊座今天的能量充满活力。你可能会感到特别有动力去追求目标，但要记得保持耐心。',
        '金牛座': '金牛座今天的能量强调稳定和享受。考虑花时间在大自然中或享受一些感官上的愉悦。',
        '双子座': '双子座今天的能量促进沟通和学习。这是一个与人交流或学习新技能的好日子。',
        '巨蟹座': '巨蟹座今天的能量关注家庭和情感。你可能想要花时间与亲人在一起或照顾自己的情感需求。',
        '狮子座': '狮子座今天的能量充满创造力和自信。展示你的才华或尝试一些创造性的表达会很适合。',
        '处女座': '处女座今天的能量注重细节和组织。这是一个整理空间或处理待办事项的好时机。',
        '天秤座': '天秤座今天的能量强调平衡和关系。关注你的人际关系并寻求和谐。',
        '天蝎座': '天蝎座今天的能量深沉而强烈。你可能会有深刻的洞察力，适合进行一些自我反思。',
        '射手座': '射手座今天的能量充满冒险精神。考虑尝试一些新事物或计划未来的冒险。',
        '摩羯座': '摩羯座今天的能量注重实际和目标。这是一个设定目标或推进项目的好日子。'
    };
    
    const zodiacFeedback = zodiacAnalysis[zodiac] || '今天的星象显示是一个平稳的日子，适合反思和计划。';
    
    // 八字运势分析 (简化版)
    const baziAnalysis = `根据您的生辰八字，今天的能量与您的命理相合。适合进行社交活动和创意工作。注意保持情绪平衡，今天水星位置可能会影响您的沟通方式。`;
    
    // 行动建议
    const actionSuggestions = [
        '花15分钟进行冥想或深呼吸练习，帮助平衡情绪。',
        '给一个你关心的人发条消息或打个电话。',
        '写下三个你今天感激的事情。',
        '到户外散步，感受大自然的美好。',
        '尝试一项你一直想做但还没尝试的小活动。',
        '整理你的工作或生活空间，创造一个更舒适的环境。'
    ];
    
    const randomActions = [];
    while (randomActions.length < 3) {
        const randomIndex = Math.floor(Math.random() * actionSuggestions.length);
        if (!randomActions.includes(actionSuggestions[randomIndex])) {
            randomActions.push(actionSuggestions[randomIndex]);
        }
    }
    
    return {
        empathy,
        zodiacFeedback,
        baziAnalysis,
        actionSuggestions: randomActions
    };
}

// 获取某一天的日记
function getDiariesForDay(day) {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    
    return appData.diaries.filter(diary => {
        const diaryDate = new Date(diary.date);
        return diaryDate >= startOfDay && diaryDate <= endOfDay;
    });
}

// 获取某一天的行动建议
function getActionsForDay(day) {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    
    return appData.actions.filter(action => {
        const actionDate = new Date(action.date);
        return actionDate >= startOfDay && actionDate <= endOfDay;
    });
}

// 获取一天的主要心情
function getPrimaryMoodForDay(diaries) {
    if (diaries.length === 0) return null;
    
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
    
    let maxCount = 0;
    let primaryMood = null;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            primaryMood = mood;
        }
    }
    
    return primaryMood;
}

// 获取心情图标
function getMoodIcon(mood) {
    const moodIcons = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        calm: '😌',
        neutral: '😐'
    };
    
    return moodIcons[mood] || '📝';
}

// 初始化页面
document.addEventListener('DOMContentLoaded', initApp);
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // 确保只初始化一次
    setTimeout(function() {
        console.log('Calling initDiaryEntry');
        initDiaryEntry_1();
        initDiaryEntry();
    }, 100); // 延迟100ms确保DOM完全加载
    
    // 如果是主页面，加载日记列表
    if (document.getElementById('todayDiaries')) {
        loadDiaryList();
    }
    
    // 新日记按钮
    const newDiaryBtn = document.getElementById('newDiaryBtn');
    const startFirstDiary = document.getElementById('startFirstDiary');
    
    if (newDiaryBtn) {
        newDiaryBtn.addEventListener('click', function() {
            window.location.href = 'diary-entry.html';
        });
    }
    
    if (startFirstDiary) {
        startFirstDiary.addEventListener('click', function() {
            window.location.href = 'diary-entry.html';
        });
    }
});

function initDiaryEntry_1() {
    console.log('initDiaryEntry started');
    const now = updateCurrentDate();
    const currentTime = document.getElementById('currentTime');
    const weather = document.getElementById('currentWeather');
    const aiPrompt = document.getElementById('aiPromptText');
    const textInputBtn = document.getElementById('textInputBtn');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const diaryContent = document.getElementById('diaryContent');
    const imageUpload = document.getElementById('diaryImage');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = document.getElementById('submitDiary');
    
    // 设置当前时间
    if (currentTime){

    currentTime.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
} 
    // 设置天气
    if (weather){

    weather.textContent = getWeather();
}   
    // 设置AI提示
    if (aiPrompt){
    aiPrompt.textContent = getAIPrompt();
}    
    // 输入方式切换
    if (textInputBtn){
        textInputBtn.addEventListener('click', function() {
            textInputBtn.classList.add('active');
            voiceInputBtn.classList.remove('active');
        });
    }
 
    if (voiceInputBtn){
        voiceInputBtn.addEventListener('click', function() {
            voiceInputBtn.classList.add('active');
            textInputBtn.classList.remove('active');
            
            const recognition = initVoiceRecognition(diaryContent);
            recognition.start();
        });

    }

    if(imageUpload) {
         // 图片上传预览
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                imagePreview.innerHTML = '';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
    
    }
    if(submitBtn) {
         // 提交日记 - 先移除旧监听器再添加新监听器
    submitBtn.removeEventListener('click', handleSubmit);
    submitBtn.addEventListener('click', handleSubmit);
    }
   
    
    async function handleSubmit() {
        const content = diaryContent.value.trim();
        if (!content) {
            alert('请先写下一些内容');
            return;
        }
        
        // 分析情绪
        const mood = analyzeMood(content);
        
        // 显示加载状态
        submitBtn.disabled = true;
        submitBtn.textContent = '分析中...';
        
        // 获取AI分析
        const aiAnalysis = await analyzeDiaryWithAI(content, mood);
        
        // 创建日记对象
        const newDiary = {
            id: Date.now().toString(),
            date: now.toISOString(),
            content: content,
            mood: mood,
            weather: weather.textContent,
            image: imagePreview.querySelector('img')?.src || '',
            aiAnalysis: aiAnalysis,
            actionTaken: []
        };
        
        // 添加到日记列表
        appData.diaries.push(newDiary);
        saveData();
        
        // 重置表单
        diaryContent.value = '';
        imagePreview.innerHTML = '';
        imageUpload.value = '';
        
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.textContent = '完成日记';
        
        // 跳转到日记详情
        window.location.href = `diary-detail.html?id=${newDiary.id}`;
    }
}

function loadDiaryList() {
    const todayDiaries = document.getElementById('todayDiaries');
    const recentDiaries = document.getElementById('recentDiaries');
    
    if (appData.diaries.length === 0) {
        todayDiaries.innerHTML = `
            <div class="empty-state">
                <p>今天还没有写日记呢</p>
                <button id="startFirstDiary" class="btn-primary">开始第一篇日记</button>
            </div>
        `;
        
        document.getElementById('startFirstDiary').addEventListener('click', function() {
            window.location.href = 'diary-entry.html';
        });
        
        recentDiaries.innerHTML = `
            <div class="empty-state">
                <p>还没有日记记录</p>
            </div>
        `;
        return;
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todayEntries = appData.diaries.filter(diary => {
        const diaryDate = new Date(diary.date);
        return diaryDate >= todayStart && diaryDate < todayEnd;
    });
    
    const recentEntries = appData.diaries.filter(diary => {
        const diaryDate = new Date(diary.date);
        return diaryDate < todayStart;
    }).slice(0, 5); // 只显示最近的5篇
    
    // 渲染今天的日记
    if (todayEntries.length > 0) {
        todayDiaries.innerHTML = todayEntries.map(diary => createDiaryCard(diary)).join('');
    } else {
        todayDiaries.innerHTML = `
            <div class="empty-state">
                <p>今天还没有写日记呢</p>
                <button id="startTodayDiary" class="btn-primary">开始今天的日记</button>
            </div>
        `;
        
        document.getElementById('startTodayDiary').addEventListener('click', function() {
            window.location.href = 'diary-entry.html';
        });
    }
    
    // 渲染近期日记
    if (recentEntries.length > 0) {
        recentDiaries.innerHTML = recentEntries.map(diary => createDiaryCard(diary)).join('');
    } else {
        recentDiaries.innerHTML = `
            <div class="empty-state">
                <p>还没有近期日记</p>
            </div>
        `;
    }
    
    // 添加点击事件
    document.querySelectorAll('.diary-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.location.href = `diary-detail.html?id=${id}`;
        });
    });
}

// 在原有代码基础上新增以下功能

// 引导问题库
const GUIDES = {
    step1: [
        "今天最值得记录的3件事是什么？",
        "今天和谁有过重要交流？",
        "今天完成了什么任务？",
        "今天有什么意外发生？"
    ],
    step2: [
        "此刻最强烈的情绪是什么？为什么？",
        "今天什么时候感到最开心/沮丧？",
        "身体有什么感觉？（累/充满能量/紧张等）",
        "如果用天气比喻今天的心情会是？"
    ],
    step3: [
        "今天的事情反映了你的什么模式？",
        "从今天经历中学到了什么？",
        "如果重来会有什么不同做法？",
        "这件事对你未来的影响可能是？"
    ],
    step4: [
        "明天最重要的1件事是什么？",
        "希望明天有什么不同？",
        "可以为明天提前准备什么？",
        "想对明天的自己说什么？"
    ]
};

// 关键词触发的问题库
const FOLLOWUP_QUESTIONS = {
    "工作": ["具体做了什么工作？", "工作中遇到什么挑战？", "从工作中学到了什么？"],
    "朋友": ["和朋友做了什么？", "这个朋友对你意味着什么？", "从交流中获得什么启发？"],
    "家庭": ["家庭互动中感受如何？", "有什么想对家人说的？", "家庭给你什么支持？"],
    // 可以继续添加更多关键词...
};

function initDiaryEntry() {
    // ...原有初始化代码...

    // 初始化引导系统
    initWritingGuide();
    
    // 设置输入内容监听
    diaryContent.addEventListener('input', function() {
        analyzeContentForGuidence(this.value);
    });
}

function initWritingGuide() {
    // 初始化步骤导航点击事件
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = this.dataset.step;
            switchGuideStep(stepNum);
        });
    });

    // 加载第一步引导内容
    loadGuideTips(1);
}

function switchGuideStep(stepNum) {
    // 更新步骤导航状态
    document.querySelectorAll('.step').forEach(step => {
        step.classList.toggle('active', step.dataset.step === stepNum);
    });

    // 加载对应步骤的引导内容
    loadGuideTips(stepNum);
}

function loadGuideTips(stepNum) {
    const guideContainer = document.querySelector('.ai-guide-container');
    const stepKey = 'step' + stepNum;
    
    // 创建或更新引导内容
    let guideElement = document.querySelector(`.ai-guide[data-for-step="${stepNum}"]`);
    if (!guideElement) {
        guideElement = document.createElement('div');
        guideElement.className = 'ai-guide';
        guideElement.dataset.forStep = stepNum;
        guideElement.innerHTML = `
            <h3>${getStepTitle(stepNum)}</h3>
            <p>${GUIDES[stepKey][0]}</p>
            <ul id="step${stepNum}Tips"></ul>
        `;
        guideContainer.appendChild(guideElement);
    }

    // 显示当前步骤，隐藏其他
    document.querySelectorAll('.ai-guide').forEach(guide => {
        guide.classList.toggle('active', guide.dataset.forStep == stepNum);
    });

    // 填充提示列表
    const tipsList = document.getElementById(`step${stepNum}Tips`);
    tipsList.innerHTML = GUIDES[stepKey].map((tip, index) => 
        `<li>${index === 0 ? '💡' : '○'} ${tip}</li>`
    ).join('');
}

function getStepTitle(stepNum) {
    const titles = {
        1: "📅 回顾今日",
        2: "💖 情绪觉察", 
        3: "🧠 深度思考",
        4: "🔮 明日展望"
    };
    return titles[stepNum] || "写作引导";
}

function analyzeContentForGuidence(text) {
    if (!text.trim()) {
        document.getElementById('detectedTopics').textContent = "暂无";
        document.getElementById('followupQuestions').innerHTML = "";
        return;
    }

    // 简单关键词检测（实际应用中可以用更复杂的NLP）
    const detectedTopics = [];
    for (const keyword in FOLLOWUP_QUESTIONS) {
        if (text.includes(keyword)) {
            detectedTopics.push(keyword);
        }
    }

    // 更新检测到的主题
    const topicsDisplay = detectedTopics.length > 0 
        ? detectedTopics.join("、")
        : "暂无";
    document.getElementById('detectedTopics').textContent = topicsDisplay;

    // 生成跟进问题
    const followupContainer = document.getElementById('followupQuestions');
    followupContainer.innerHTML = "";
    
    detectedTopics.forEach(topic => {
        FOLLOWUP_QUESTIONS[topic].forEach(question => {
            const questionElement = document.createElement('span');
            questionElement.className = 'followup-question';
            questionElement.textContent = question;
            questionElement.addEventListener('click', function() {
                insertQuestionToTextarea(question);
            });
            followupContainer.appendChild(questionElement);
        });
    });
}

function insertQuestionToTextarea(question) {
    const textarea = document.getElementById('diaryContent');
    const currentText = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // 在当前位置插入问题，并添加换行和缩进
    const newText = currentText.substring(0, cursorPos) + 
                   `\n\n> ${question}\n` + 
                   currentText.substring(cursorPos);
    
    textarea.value = newText;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = cursorPos + question.length + 5;
}

// ...保留原有其他函数...

function createDiaryCard(diary) {
    const moodClasses = {
        happy: 'happy',
        sad: 'sad',
        angry: 'angry',
        calm: 'calm',
        neutral: 'neutral'
    };
    
    const moodIcons = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        calm: '😌',
        neutral: '😐'
    };
    
    const date = new Date(diary.date);
    const timeString = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    // 截取内容预览
    const contentPreview = diary.content.length > 50 
        ? diary.content.substring(0, 50) + '...' 
        : diary.content;
    
    return `
        <div class="diary-card" data-id="${diary.id}">
            <div class="mood ${moodClasses[diary.mood]}">${moodIcons[diary.mood]}</div>
            <h3>${diary.weather}</h3>
            <p>${contentPreview}</p>
            <div class="time">${timeString}</div>
        </div>
    `;
}

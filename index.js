// All your JavaScript code from the HTML <script> block goes here

var score = 0;
var clickValue = 1;
var autoClickerEnabled = false;
var autoClickerInterval;
var upgradeCount = 0;
var cookiesAchievementThreshold = 100;
var upgradesAchievementThreshold = 5;
var autoClickerAchievementThreshold = 0.5;

function clickCookie() {
    score += clickValue;
    updateScore();
    animateClickFeedback();
    checkAchievements();
}

function updateScore() {
    document.getElementById("scoreValue").innerText = score;
    updateUpgradeButtons();
}

function updateClickValue() {
    document.getElementById("clickValue").innerText = "Click Value: " + clickValue;
}

function updateAchievement(achievementId, message) {
    document.getElementById(achievementId).innerText = message;
}

function buyUpgrade(cost, increase) {
    if (score >= cost) {
        score -= cost;
        clickValue += increase;
        upgradeCount++;
        updateScore();
        updateClickValue();
        checkAchievements();
    } else {
        alert("Not enough uranium to buy this upgrade!");
    }
}

function buyAutoClicker(cost, initialSpeed) {
    if (score >= cost && !autoClickerEnabled) {
        score -= cost;
        autoClickerEnabled = true;
        document.getElementById("autoClickerStatus").innerText = "Auto-uranium: On";
        autoClickerInterval = setInterval(autoClick, 1000 / initialSpeed);
        checkAchievements();
    } else if (autoClickerEnabled) {
        alert("Auto-uranium is already enabled!");
    } else {
        alert("Not enough uranium to buy the Auto-uranium!");
    }
}

function buyUpgradeAutoClicker(cost, speedIncrease) {
    if (score >= cost && autoClickerEnabled) {
        score -= cost;
        clearInterval(autoClickerInterval);
        autoClickerInterval = setInterval(autoClick, 100 / (1 + speedIncrease));
        checkAchievements();
    } else {
        alert("Either Auto-uranium is not enabled, or not enough uranium to buy this upgrade!");
    }
}

function autoClick() {
    score += clickValue;
    updateScore();
}

function checkAchievements() {
    if (score >= cookiesAchievementThreshold) {
        updateAchievement("achievement1", "Achievement 1: Unlocked!");
    }
    if (upgradeCount >= upgradesAchievementThreshold) {
        updateAchievement("achievement2", "Achievement 2: Unlocked!");
    }
    if (autoClickerEnabled && score >= autoClickerAchievementThreshold) {
        // Add more achievements as needed
    }
    if (upgradeCount >= upgradesAchievementThreshold) {
        updateAchievement("achievement3", "Achievement 2: Unlocked!");
    }
}

function saveGame() {
    localStorage.setItem("score", score);
    localStorage.setItem("clickValue", clickValue);
    localStorage.setItem("upgradeCount", upgradeCount);
    localStorage.setItem("autoClickerEnabled", autoClickerEnabled);
}

function loadGame() {
    score = parseInt(localStorage.getItem("score")) || 0;
    clickValue = parseInt(localStorage.getItem("clickValue")) || 1;
    upgradeCount = parseInt(localStorage.getItem("upgradeCount")) || 0;
    autoClickerEnabled = (localStorage.getItem("autoClickerEnabled") === "true");
    updateScore();
    updateClickValue();
    clearInterval(autoClickerInterval);
    if (autoClickerEnabled) {
        document.getElementById("autoClickerStatus").innerText = "Auto-uranium: On";
        autoClickerInterval = setInterval(autoClick, 1000);
    } else {
        document.getElementById("autoClickerStatus").innerText = "Auto-uranium: Off";
    }
}

function updateUpgradeButtons() {
    document.getElementById("upgrade1").disabled = score < 10;
    document.getElementById("upgrade2").disabled = score < 100;
    document.getElementById("upgrade3").disabled = score < 1000;
    document.getElementById("upgrade4").disabled = score < 5000;
    document.getElementById("upgrade5").disabled = score < 10000;
}

function turnOffAutoClicker() {
    if (autoClickerEnabled) {
        clearInterval(autoClickerInterval);
        autoClickerEnabled = false;
        document.getElementById("autoClickerStatus").innerText = "Auto-uranium: Off";
    } else {
        alert("Auto-uranium is already off!");
    }
}

// small visual feedback: floating +value near the cookie
function animateClickFeedback() {
    try{
        var cookie = document.getElementById('cookie');
        if(!cookie) return;
        var rect = cookie.getBoundingClientRect();
        var span = document.createElement('span');
        span.className = 'float-label';
        span.innerText = '+' + clickValue;
        // position centered above cookie
        span.style.left = (rect.left + rect.width / 2) + 'px';
        span.style.top = (rect.top + rect.height * 0.25) + 'px';
        document.body.appendChild(span);
        // trigger animation
        requestAnimationFrame(function(){ span.classList.add('animate'); });
        setTimeout(function(){ if(span && span.parentNode) span.parentNode.removeChild(span); }, 800);
    }catch(e){console.error(e)}
}

// Admin utilities
var adminLocked = true;
var adminLockTimeout;
var ADMIN_LOCK_TIME = 5 * 60 * 1000; // 5 minutes
var FAILED_PASSWORD_ATTEMPTS = 0;
var MAX_PASSWORD_ATTEMPTS = 3;

function toggleAdminPanel(){
    var panel = document.getElementById('adminPanel');
    if(!panel) return;
    
    if(panel.style.display === 'none'){
        panel.style.display = 'block';
        // Reset password field when opening
        document.getElementById('adminPass').value = '';
        document.getElementById('adminPass').focus();
    } else {
        panel.style.display = 'none';
        lockAdminPanel();
    }
}

function unlockAdmin(){
    var pass = document.getElementById('adminPass');
    var controls = document.getElementById('adminControls');
    var lockStatus = document.getElementById('lockStatus');
    if(!pass || !controls) return;
    
    // Check if too many failed attempts
    if(FAILED_PASSWORD_ATTEMPTS >= MAX_PASSWORD_ATTEMPTS){
        alert('Too many failed attempts. Admin panel locked for security.');
        return;
    }

    // simple password check (default: balls1234)
    if(pass.value === 'balls1234'){
        controls.style.display = 'flex';
        adminLocked = false;
        pass.value = '';
        FAILED_PASSWORD_ATTEMPTS = 0;
        
        // Update lock status
        if(lockStatus) lockStatus.innerText = '(Unlocked)';
        if(lockStatus) lockStatus.style.color = '#44aa44';
        
        // Set auto-lock timer
        clearTimeout(adminLockTimeout);
        adminLockTimeout = setTimeout(function(){
            lockAdminPanel();
            alert('Admin panel locked due to inactivity.');
        }, ADMIN_LOCK_TIME);
    } else {
        FAILED_PASSWORD_ATTEMPTS++;
        var remaining = MAX_PASSWORD_ATTEMPTS - FAILED_PASSWORD_ATTEMPTS;
        if(remaining > 0){
            alert('Wrong password. ' + remaining + ' attempt(s) remaining.');
        } else {
            alert('Too many failed attempts. Admin panel is now locked.');
        }
        pass.value = '';
    }
}

function lockAdminPanel(){
    var controls = document.getElementById('adminControls');
    var pass = document.getElementById('adminPass');
    var lockStatus = document.getElementById('lockStatus');
    if(!controls) return;
    
    controls.style.display = 'none';
    adminLocked = true;
    if(pass) pass.value = '';
    if(lockStatus) {
        lockStatus.innerText = '(Locked)';
        lockStatus.style.color = '#ff4444';
    }
    clearTimeout(adminLockTimeout);
    FAILED_PASSWORD_ATTEMPTS = 0;
}

function adminSetScore(val){
    var n = parseInt(val,10);
    if(isNaN(n)) return alert('Enter a number');
    score = n;
    updateScore();
}

function adminAddScore(amount){
    score += amount;
    updateScore();
}

function adminSetClickValue(val){
    var n = parseInt(val,10);
    if(isNaN(n)) return alert('Enter a number');
    clickValue = n;
    updateClickValue();
}

function adminGrantUpgrades(){
    // grant some upgrades by increasing clickValue and upgradeCount
    clickValue += 50;
    upgradeCount += 5;
    updateClickValue();
    updateScore();
    checkAchievements();
}

function adminToggleAuto(on){
    if(on){
        if(!autoClickerEnabled){
            buyAutoClicker(0,1);
        }
    } else {
        if(autoClickerEnabled){
            turnOffAutoClicker();
        }
    }
}

function adminResetGame(){
    if(!confirm('Reset game to defaults? This will clear saved data.')) return;
    score = 0; clickValue = 1; upgradeCount = 0; autoClickerEnabled = false;
    clearInterval(autoClickerInterval);
    localStorage.clear();
    updateScore(); updateClickValue();
    document.getElementById('autoClickerStatus').innerText = 'Auto-uranium: Off';
}
// ===== MAIN APP =====
const app = {
  init() {
    const savedUser = localStorage.getItem('loom_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const actualUser = storage.users.find(u => u.id === user.id);
        if (actualUser) {
          storage.currentUser = actualUser;
          ui.updateUserProfile();
          chatManager.init();
          ui.init();
          return;
        }
      } catch (e) {
        console.error('Ошибка загрузки сессии:', e);
        localStorage.removeItem('loom_current_user');
      }
    }
    
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const appScreen = document.getElementById('app-screen');

    if (loginScreen) loginScreen.style.display = 'none';
    if (registerScreen) registerScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'flex';

    ui.updateUserProfile();
    chatManager.init();
    ui.init();
  }
};

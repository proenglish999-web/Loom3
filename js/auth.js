// ===== AUTH MODULE =====
const auth = {
  init() {
    this.checkSession();
    this.bindEvents();
  },

  checkSession() {
    try {
      const savedUser = localStorage.getItem('loom_current_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Проверяем что пользователь существует
        const actualUser = storage.users.find(u => u.id === user.id);
        if (actualUser) {
          storage.currentUser = actualUser;
          auth.showApp();
          return;
        }
      }
    } catch (e) {
      console.error('Ошибка проверки сессии:', e);
      localStorage.removeItem('loom_current_user');
    }
    this.showScreen('login-screen');
  },

  saveSession(user) {
    try {
      localStorage.setItem('loom_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Ошибка сохранения сессии:', e);
    }
  },

  clearSession() {
    try {
      localStorage.removeItem('loom_current_user');
    } catch (e) {
      console.error('Ошибка удаления сессии:', e);
    }
  },

  bindEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    const showRegisterBtn = document.getElementById('show-register');
    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', () => {
        this.showScreen('register-screen');
      });
    }

    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        this.showScreen('login-screen');
      });
    }
  },

  handleLogin() {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      ui.showNotification('Заполните все поля', 'error');
      return;
    }

    const result = storage.login(username, password);
    if (result.success) {
      ui.showNotification('Добро пожаловать!', 'success');
      this.saveSession(result.user);
      auth.showApp();
    } else {
      ui.showNotification(result.error, 'error');
    }
  },

  handleRegister() {
    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');

    if (!usernameInput || !emailInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!username || !email || !password) {
      ui.showNotification('Заполните все поля', 'error');
      return;
    }

    const result = storage.register(username, email, password);
    if (result.success) {
      ui.showNotification('Аккаунт создан! Войдите в систему', 'success');
      setTimeout(() => {
        this.showScreen('login-screen');
        const loginUsername = document.getElementById('login-username');
        if (loginUsername) loginUsername.value = username;
      }, 1500);
    } else {
      ui.showNotification(result.error, 'error');
    }
  },

  logout() {
    storage.logout();
    this.clearSession();
    this.showScreen('login-screen');
    ui.showNotification('Вы вышли из аккаунта', 'info');
  },

  showScreen(screenId) {
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const appScreen = document.getElementById('app-screen');

    if (loginScreen) loginScreen.style.display = 'none';
    if (registerScreen) registerScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'none';

    const screen = document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'flex';
    }
  },

  showApp() {
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const appScreen = document.getElementById('app-screen');

    if (loginScreen) loginScreen.style.display = 'none';
    if (registerScreen) registerScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'flex';

    ui.updateUserProfile();
    chatManager.init();
    ui.init();
    
    // Восстанавливаем состояние
    setTimeout(() => {
      this.restoreState();
    }, 200);
  },

  restoreState() {
    const state = ui.loadState();
    if (!state) return;

    // Восстанавливаем активную вкладку
    if (state.activeTab) {
      const tab = document.querySelector(`.chat-tab[data-tab="${state.activeTab}"]`);
      if (tab) {
        tab.click();
      }
    }

    // Восстанавливаем открытый чат
    if (state.lastChatId) {
      const chat = storage.getChat(state.lastChatId);
      if (chat && chat.members && chat.members.includes(storage.currentUser.id)) {
        chatManager.openChat(state.lastChatId);
      }
    }
  }
};

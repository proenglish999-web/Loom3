// ===== UI MODULE =====
const ui = {
  emojis: ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😢', '😡', '👏', '🙏', '💯', '✨', '🚀', '💪', '🎈', '🌟', '💕', '😎', '🤗', '😅', '👌', '🙌', '💖', '🎊', '🌈', '⭐', '💫', '🎁'],
  settingsDirty: false,
  pendingSettings: { name: '', color: '' },

  themes: {
    discord: {
      primary: '#5865F2',
      bgServerList: '#1e1f22',
      bgChannelList: '#2b2d31',
      bgChat: '#313338',
      bgInput: '#383a40',
      bgHover: '#3f4147',
      bgActive: '#36373f'
    },
    midnight: {
      primary: '#3498DB',
      bgServerList: '#0f0f23',
      bgChannelList: '#1a1a2e',
      bgChat: '#16213e',
      bgInput: '#1a1a3e',
      bgHover: '#252a4a',
      bgActive: '#2d3360'
    },
    forest: {
      primary: '#23a559',
      bgServerList: '#1a2e1a',
      bgChannelList: '#234a23',
      bgChat: '#2d5a2d',
      bgInput: '#356435',
      bgHover: '#407040',
      bgActive: '#4a804a'
    },
    sunset: {
      primary: '#f0932b',
      bgServerList: '#2e1a1a',
      bgChannelList: '#3d2525',
      bgChat: '#4a3030',
      bgInput: '#553a3a',
      bgHover: '#654545',
      bgActive: '#755050'
    },
    rose: {
      primary: '#e91e63',
      bgServerList: '#2e1a24',
      bgChannelList: '#3d2535',
      bgChat: '#4a3045',
      bgInput: '#553a55',
      bgHover: '#654565',
      bgActive: '#755075'
    },
    cyber: {
      primary: '#9b59b6',
      bgServerList: '#1a1a2e',
      bgChannelList: '#222244',
      bgChat: '#2a2a55',
      bgInput: '#333366',
      bgHover: '#444477',
      bgActive: '#555588'
    },
    ocean: {
      primary: '#00bcd4',
      bgServerList: '#0a1929',
      bgChannelList: '#0d2138',
      bgChat: '#112b47',
      bgInput: '#163554',
      bgHover: '#1b4063',
      bgActive: '#204a72'
    },
    neon: {
      primary: '#39ff14',
      bgServerList: '#0a0a0a',
      bgChannelList: '#111111',
      bgChat: '#1a1a1a',
      bgInput: '#222222',
      bgHover: '#2a2a2a',
      bgActive: '#333333'
    },
    lava: {
      primary: '#ff4500',
      bgServerList: '#1a0a0a',
      bgChannelList: '#2d1515',
      bgChat: '#3d1f1f',
      bgInput: '#4d2929',
      bgHover: '#5d3333',
      bgActive: '#6d3d3d'
    },
    aurora: {
      primary: '#00ff87',
      bgServerList: '#0a1a1a',
      bgChannelList: '#0f2525',
      bgChat: '#143030',
      bgInput: '#193b3b',
      bgHover: '#1e4646',
      bgActive: '#235151'
    },
    violet: {
      primary: '#9c27b0',
      bgServerList: '#1a0a1e',
      bgChannelList: '#251030',
      bgChat: '#301540',
      bgInput: '#3b1a50',
      bgHover: '#461f60',
      bgActive: '#512470'
    },
    storm: {
      primary: '#607d8b',
      bgServerList: '#1a1a1e',
      bgChannelList: '#252528',
      bgChat: '#303034',
      bgInput: '#38383c',
      bgHover: '#404044',
      bgActive: '#48484c'
    },
    gold: {
      primary: '#ffd700',
      bgServerList: '#1a150a',
      bgChannelList: '#252010',
      bgChat: '#302a15',
      bgInput: '#3b341a',
      bgHover: '#463e1f',
      bgActive: '#514824'
    },
    emerald: {
      primary: '#10b981',
      bgServerList: '#0a1a14',
      bgChannelList: '#0f2520',
      bgChat: '#14302a',
      bgInput: '#193b35',
      bgHover: '#1e4640',
      bgActive: '#23514b'
    },
    coral: {
      primary: '#ff6b6b',
      bgServerList: '#1a0f0f',
      bgChannelList: '#251515',
      bgChat: '#301a1a',
      bgInput: '#3b1f1f',
      bgHover: '#462424',
      bgActive: '#512929'
    },
    midnightBlue: {
      primary: '#4a90d9',
      bgServerList: '#0a0f1a',
      bgChannelList: '#0f1525',
      bgChat: '#141a30',
      bgInput: '#191f3b',
      bgHover: '#1e2446',
      bgActive: '#232951'
    },
    sakura: {
      primary: '#ffb7c5',
      bgServerList: '#1a0f14',
      bgChannelList: '#251520',
      bgChat: '#301a2a',
      bgInput: '#3b1f35',
      bgHover: '#462440',
      bgActive: '#51294b'
    },
    twilight: {
      primary: '#a855f7',
      bgServerList: '#120a1a',
      bgChannelList: '#1a0f25',
      bgChat: '#221430',
      bgInput: '#2a193b',
      bgHover: '#321e46',
      bgActive: '#3a2351'
    }
  },

  currentTheme: 'discord',

  init() {
    this.bindEvents();
    this.createEmojiPicker();
    this.loadTheme();
  },

  bindEvents() {
    const sendBtn = document.getElementById('send-message');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        messages.send();
      });
    }

    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') messages.send();
      });
    }

    const emojiBtn = document.getElementById('emoji-button');
    if (emojiBtn) {
      emojiBtn.addEventListener('click', () => {
        const picker = document.getElementById('emoji-picker');
        if (picker) {
          picker.classList.toggle('show');
        }
      });
    }

    const settingsBtn = document.getElementById('open-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showModal('settings-modal');
        this.loadSettings();
      });
    }

    const settingsClose = document.querySelector('#settings-modal .modal-close');
    if (settingsClose) {
      settingsClose.addEventListener('click', () => {
        this.hideModal('settings-modal');
      });
    }

    const settingsOverlay = document.querySelector('#settings-modal .modal-overlay');
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', () => {
        this.hideModal('settings-modal');
      });
    }

    const saveBtn = document.querySelector('#settings-modal .modal-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveSettings();
      });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
      });
    }

    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Применяем цвет сразу
        const color = btn.dataset.color;
        this.pendingSettings.color = color;
        this.settingsDirty = true;
        
        const user = storage.getCurrentUser();
        if (user) {
          user.avatarColor = color;
          storage.currentUser = user;
          
          // Обновляем превью
          const preview = document.getElementById('settings-avatar-preview');
          if (preview) {
            preview.style.background = color;
          }
          
          // Обновляем аватарку в панели
          this.updateUserProfile();
        }
      });
    });

    const uploadBtn = document.getElementById('upload-avatar-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('avatar-file-input');
        if (fileInput) fileInput.click();
      });
    }

    const fileInput = document.getElementById('avatar-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleAvatarUpload(e);
      });
    }

    const avatarPreview = document.getElementById('settings-avatar-preview');
    if (avatarPreview) {
      avatarPreview.addEventListener('click', () => {
        const fileInput = document.getElementById('avatar-file-input');
        if (fileInput) fileInput.click();
      });
    }

    // Friend add button
    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', () => {
        this.handleAddFriend();
      });
    }

    // Friend username input (Enter key)
    const friendUsernameInput = document.getElementById('friend-username');
    if (friendUsernameInput) {
      friendUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleAddFriend();
        }
      });
    }

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyTheme(btn.dataset.theme);
      });
    });
  },

  handleAddFriend() {
    const user = storage.getCurrentUser();
    if (!user) {
      ui.showNotification('Вы не авторизованы', 'error');
      return;
    }

    const input = document.getElementById('friend-username');
    if (!input) return;

    const username = input.value.trim();
    if (!username) {
      ui.showNotification('Введите имя пользователя', 'error');
      return;
    }

    const result = storage.addFriend(user.id, username);
    if (result.success) {
      ui.showNotification(`${result.friend.displayName} добавлен в друзья!`, 'success');
      input.value = '';
      this.renderFriendsList();
    } else {
      ui.showNotification(result.error, 'error');
    }
  },

  renderFriendsList() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const container = document.getElementById('friends-list');
    if (!container) return;

    const friends = storage.getFriends(user.id);
    container.innerHTML = '';

    if (friends.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">У вас пока нет друзей. Добавьте первого друга!</p>';
      return;
    }

    friends.forEach(friend => {
      const item = document.createElement('div');
      item.className = 'friend-item';
      
      let avatarContent;
      if (friend.avatarImage) {
        avatarContent = `<img src="${friend.avatarImage}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarContent = friend.displayName.charAt(0).toUpperCase();
      }

      item.innerHTML = `
        <div class="friend-avatar" style="background: ${friend.avatarColor || '#5865F2'}">
          ${avatarContent}
        </div>
        <div class="friend-info">
          <div class="friend-name">${this.escapeHtml(friend.displayName)}</div>
          <div class="friend-status">${friend.status === 'online' ? '🟢 В сети' : '⚫ Не в сети'}</div>
        </div>
        <button class="btn btn-primary btn-add-friend chat-with-friend-btn" data-friend-id="${friend.id}" data-friend-name="${this.escapeHtml(friend.displayName)}">Написать</button>
        <button class="btn btn-text btn-remove-friend" data-friend-id="${friend.id}" title="Удалить из друзей">✕</button>
      `;

      container.appendChild(item);
    });

    // Bind events for chat buttons
    document.querySelectorAll('.chat-with-friend-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const friendId = btn.dataset.friendId;
        const friendName = btn.dataset.friendName;
        this.createChatWithFriend(friendId, friendName);
      });
    });

    // Bind events for remove friend buttons
    document.querySelectorAll('.btn-remove-friend').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const friendId = btn.dataset.friendId;
        this.removeFriend(friendId);
      });
    });
  },

  createChatWithFriend(friendId, friendName) {
    const user = storage.getCurrentUser();
    if (!user) return;

    // Check if chat already exists
    const existingChats = storage.getUserChats(user.id);
    const existingChat = existingChats.find(c => 
      c.type === 'direct' && c.members && c.members.length === 2 && 
      c.members.includes(friendId)
    );

    if (existingChat) {
      chatManager.openChat(existingChat.id);
      ui.hideModal('settings-modal');
      return;
    }

    // Create new chat
    const chatName = friendName;
    const chat = storage.createChat(chatName, 'direct', [user.id, friendId], user.id);
    
    if (chat) {
      ui.showNotification(`Чат с ${friendName} создан!`, 'success');
      chatManager.renderChatList();
      chatManager.openChat(chat.id);
      ui.hideModal('settings-modal');
    } else {
      ui.showNotification('Ошибка создания чата', 'error');
    }
  },

  removeFriend(friendId) {
    const user = storage.getCurrentUser();
    if (!user) return;

    const result = storage.removeFriend(user.id, friendId);
    if (result) {
      ui.showNotification('Друг удалён', 'info');
      this.renderFriendsList();
    }
  },

  createEmojiPicker() {
    const grid = document.getElementById('emoji-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    this.emojis.forEach(emoji => {
      const span = document.createElement('span');
      span.className = 'emoji-item';
      span.textContent = emoji;
      span.addEventListener('click', () => {
        const input = document.getElementById('message-input');
        if (input) {
          input.value += emoji;
          input.focus();
          const picker = document.getElementById('emoji-picker');
          if (picker) picker.classList.remove('show');
        }
      });
      grid.appendChild(span);
    });
  },

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  },

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Проверяем настройки - если есть несохраненные изменения
    if (modalId === 'settings-modal' && this.settingsDirty) {
      this.showSavePrompt();
      return;
    }
    
    modal.classList.remove('show');
  },
  
  showSavePrompt() {
    // Создаем оверлей если нет
    let overlay = document.getElementById('save-prompt-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'save-prompt-overlay';
      overlay.className = 'modal-overlay';
      overlay.style.zIndex = '2500';
      document.body.appendChild(overlay);
      
      // Создаем окно
      const box = document.createElement('div');
      box.id = 'save-prompt-box';
      box.className = 'save-prompt-box';
      box.innerHTML = `
        <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">💾 Сохранить изменения?</h3>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Вы изменили настройки. Сохранить?</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn btn-primary" id="save-prompt-save">Сохранить</button>
          <button class="btn btn-danger" id="save-prompt-discard">Не сохранять</button>
          <button class="btn btn-text" id="save-prompt-cancel">Отмена</button>
        </div>
      `;
      
      overlay.appendChild(box);
      
      // Обработчики
      document.getElementById('save-prompt-save').onclick = () => {
        this.saveSettings();
        this.settingsDirty = false;
        overlay.remove();
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) settingsModal.classList.remove('show');
      };
      
      document.getElementById('save-prompt-discard').onclick = () => {
        this.settingsDirty = false;
        overlay.remove();
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) settingsModal.classList.remove('show');
      };
      
      document.getElementById('save-prompt-cancel').onclick = () => {
        overlay.remove();
      };
      
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      };
    }
  },

  loadSettings() {
    const user = storage.getCurrentUser();
    if (!user) return;

    // Сбрасываем флаг изменений
    this.settingsDirty = false;
    this.pendingSettings = { name: user.displayName, color: user.avatarColor, username: user.username };

    // Обновляем секцию профиля
    const profileAvatar = document.getElementById('profile-avatar-large');
    const profileUsername = document.getElementById('profile-username');
    
    if (profileAvatar) {
      if (user.avatarImage) {
        profileAvatar.innerHTML = `<img src="${user.avatarImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        profileAvatar.textContent = user.displayName.charAt(0).toUpperCase();
      }
      profileAvatar.style.background = user.avatarColor;
    }
    
    if (profileUsername) {
      profileUsername.textContent = '@' + user.username;
    }

    const nameInput = document.getElementById('settings-name');
    if (nameInput) {
      nameInput.value = user.displayName;
      
      // Отслеживаем изменения имени
      nameInput.addEventListener('input', (e) => {
        this.settingsDirty = true;
        this.pendingSettings.name = e.target.value.trim();
      }, { once: true });
    }

    // Показываем и отслеживаем изменения username
    const usernameInput = document.getElementById('settings-username');
    if (usernameInput) {
      usernameInput.value = user.username;
      
      // Отслеживаем изменения username
      usernameInput.addEventListener('input', (e) => {
        this.settingsDirty = true;
        this.pendingSettings.username = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_]/i, '');
      }, { once: true });
    }
    
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    const colorBtn = document.querySelector(`.color-btn[data-color="${user.avatarColor}"]`);
    if (colorBtn) colorBtn.classList.add('active');

    const preview = document.getElementById('settings-avatar-preview');
    if (preview) {
      if (user.avatarImage) {
        preview.innerHTML = `<img src="${user.avatarImage}" alt="Avatar">`;
      } else {
        preview.innerHTML = user.displayName.charAt(0).toUpperCase();
      }
      preview.style.background = user.avatarColor;
    }

    // Load active theme
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    const themeBtn = document.querySelector(`.theme-btn[data-theme="${this.currentTheme}"]`);
    if (themeBtn) themeBtn.classList.add('active');

    // Render friends list
    this.renderFriendsList();
  },

  handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      ui.showNotification('Выберите файл изображения', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      ui.showNotification('Файл слишком большой (макс 5МБ)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const avatarPreview = document.getElementById('settings-avatar-preview');
      if (avatarPreview) {
        avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar">`;
      }
      if (storage.currentUser) {
        storage.currentUser.avatarImage = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  },

  saveSettings() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const nameInput = document.getElementById('settings-name');
    const usernameInput = document.getElementById('settings-username');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const username = usernameInput ? usernameInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/i, '') : '';
    const colorBtn = document.querySelector('.color-btn.active');
    const color = colorBtn ? colorBtn.dataset.color : user.avatarColor;

    const updateData = { avatarColor: color };
    
    // Обновляем displayName если изменился
    if (name && name !== user.displayName && name.length > 0) {
      updateData.displayName = name;
    }
    
    // Обновляем username если изменился
    if (username && username !== user.username && username.length >= 3) {
      updateData.username = username;
    } else if (username && username.length > 0 && username.length < 3) {
      ui.showNotification('Username должен содержать минимум 3 символа', 'error');
      return;
    }

    const result = storage.updateUser(user.id, updateData);
    if (result === true) {
      this.updateUserProfile();
      this.showNotification('Настройки сохранены!', 'success');
      // Сбрасываем флаг изменений
      this.settingsDirty = false;
      
      // Сбрасываем флаги обработчиков сообщений
      if (messages.reactionEventsBound) {
        messages.reactionEventsBound = false;
        messages.contextMenuEventsBound = false;
      }
      
      // Обновляем секцию профиля
      this.loadSettings();
    } else if (typeof result === 'object' && result.error) {
      this.showNotification(result.error, 'error');
    } else {
      this.showNotification('Ошибка сохранения', 'error');
    }
  },

  updateUserProfile() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    
    if (nameEl) nameEl.textContent = user.displayName;
    if (avatarEl) {
      if (user.avatarImage) {
        avatarEl.innerHTML = `<img src="${user.avatarImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarEl.textContent = user.displayName.charAt(0).toUpperCase();
      }
      avatarEl.style.background = user.avatarColor;
    }

    // Сохраняем сессию при обновлении профиля
    auth.saveSession(user);
  },

  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<span>${message}</span>`;
    container.appendChild(notif);

    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(100px)';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  },

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    this.currentTheme = themeName;
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--bg-serverlist', theme.bgServerList);
    root.style.setProperty('--bg-channellist', theme.bgChannelList);
    root.style.setProperty('--bg-chat', theme.bgChat);
    root.style.setProperty('--bg-input', theme.bgInput);
    root.style.setProperty('--bg-hover', theme.bgHover);
    root.style.setProperty('--bg-active', theme.bgActive);

    // Save theme preference
    try {
      localStorage.setItem('loom_theme', themeName);
    } catch (e) {
      console.error('Ошибка сохранения темы:', e);
    }

    ui.showNotification(`Тема "${themeName}" применена!`, 'success');
  },

  loadTheme() {
    try {
      const savedTheme = localStorage.getItem('loom_theme');
      if (savedTheme && this.themes[savedTheme]) {
        this.applyTheme(savedTheme);
      }
    } catch (e) {
      console.error('Ошибка загрузки темы:', e);
    }
  },

  saveState() {
    try {
      const user = storage.getCurrentUser();
      if (!user) return;

      const state = {
        activeTab: document.querySelector('.chat-tab.active')?.dataset.tab || 'chats',
        lastChatId: chatManager.currentChatId || null
      };

      localStorage.setItem('loom_state_' + user.id, JSON.stringify(state));
    } catch (e) {
      console.error('Ошибка сохранения состояния:', e);
    }
  },

  loadState() {
    try {
      const user = storage.getCurrentUser();
      if (!user) return null;

      const savedState = localStorage.getItem('loom_state_' + user.id);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      console.error('Ошибка загрузки состояния:', e);
    }
    return null;
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

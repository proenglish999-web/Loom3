// ===== REAL-TIME SYNC BETWEEN TABS =====
const realTimeSync = {
  isReloading: false,
  lastReloadTime: 0,
  reloadThrottle: 1000, // Минимальный интервал между перезагрузками (1 секунда)

  init() {
    // Слушаем изменения localStorage в других вкладках
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('loom_')) {
        console.log('Data changed in another tab:', e.key);
        this.handleStorageChange(e.key, e.newValue);
      }
    });

    // При загрузке страницы тоже обновляем данные
    this.reloadAllData();
  },

  handleStorageChange(key, newValue) {
    console.log('Storage change detected:', key);
    
    // Проверяем throttle чтобы избежать частых перезагрузок
    const now = Date.now();
    if (now - this.lastReloadTime < this.reloadThrottle) {
      console.log('Throttling reload...');
      return;
    }
    
    this.lastReloadTime = now;
    
    this.reloadAllData();
  },

  reloadAllData() {
    // Предотвращаем рекурсивные вызовы
    if (this.isReloading) {
      console.log('Already reloading, skipping...');
      return;
    }
    
    this.isReloading = true;
    
    try {
      // Перезагружаем все данные из localStorage
      const usersData = localStorage.getItem('loom_users');
      if (usersData) {
        storage.users = JSON.parse(usersData);
      }

      const chatsData = localStorage.getItem('loom_chats');
      if (chatsData) {
        storage.chats = JSON.parse(chatsData);
      }

      const messagesData = localStorage.getItem('loom_messages');
      if (messagesData) {
        storage.messages = JSON.parse(messagesData);
      }

      // Обновляем текущего пользователя
      const currentUserData = localStorage.getItem('loom_current_user');
      if (currentUserData) {
        const savedUser = JSON.parse(currentUserData);
        const actualUser = storage.users.find(u => u.id === savedUser.id);
        if (actualUser) {
          storage.currentUser = actualUser;
        }
      }

      // Обновляем UI если нужно
      if (storage.currentUser) {
        ui.updateUserProfile();
        
        // Сбрасываем флаги обработчиков сообщений
        messages.reactionEventsBound = false;
        messages.contextMenuEventsBound = false;
        
        // Если открыт чат - обновляем сообщения
        if (messages.currentChatId) {
          console.log('Reloading messages for chat:', messages.currentChatId);
          messages.loadMessages(messages.currentChatId);
        }

        // Если открыта вкладка друзей - обновляем список
        const friendsTab = document.querySelector('.chat-tab[data-tab="friends"]');
        if (friendsTab && friendsTab.classList.contains('active')) {
          chatManager.renderFriendsList();
        }

        // Если открыт список чатов - обновляем его
        const chatsTab = document.querySelector('.chat-tab[data-tab="chats"]');
        if (chatsTab && chatsTab.classList.contains('active')) {
          chatManager.renderChatList();
        }
      }
    } catch (e) {
      console.error('Error reloading data:', e);
    } finally {
      // Сбрасываем флаг после завершения
      setTimeout(() => {
        this.isReloading = false;
      }, 500);
    }
  },

  // Отправляем событие изменения в другие вкладки
  notifyChange() {
    // Это событие сработает только в текущей вкладке
    // Для других вкладок используется storage event
    document.dispatchEvent(new CustomEvent('data-changed', {
      detail: { timestamp: Date.now() }
    }));
  }
};

// Инициализируем синхронизацию при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    realTimeSync.init();
  });
} else {
  realTimeSync.init();
}

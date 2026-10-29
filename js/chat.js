// ===== CHAT MODULE =====
const chatManager = {
  currentChatId: null,
  searchTimeout: null,

  init() {
    this.renderChatList();
    this.renderFriendsList();
    this.bindEvents();
    this.bindTabEvents();
    this.bindChatTypeEvents();
  },

  bindChatTypeEvents() {
    const typeBtns = document.querySelectorAll('.chat-type-btn');
    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const type = btn.dataset.type;
        const friendSelectGroup = document.getElementById('friend-select-group');
        const groupSelectGroup = document.getElementById('group-select-group');
        const chatNameGroup = document.getElementById('chat-name-group');
        
        if (type === 'direct') {
          if (friendSelectGroup) friendSelectGroup.style.display = 'block';
          if (groupSelectGroup) groupSelectGroup.style.display = 'none';
          if (chatNameGroup) chatNameGroup.style.display = 'none';
        } else {
          if (friendSelectGroup) friendSelectGroup.style.display = 'none';
          if (groupSelectGroup) groupSelectGroup.style.display = 'block';
          if (chatNameGroup) chatNameGroup.style.display = 'block';
        }
      });
    });
  },

  bindTabEvents() {
    console.log('Binding tab events...');
    
    const tabs = document.querySelectorAll('.chat-tab');
    console.log('Found tabs:', tabs.length);
    
    // Показываем чаты по умолчанию
    const chatsList = document.getElementById('chats-list');
    const friendsList = document.getElementById('friends-list-main');
    if (chatsList) chatsList.style.display = 'block';
    if (friendsList) friendsList.style.display = 'none';
    
    tabs.forEach((tab, index) => {
      console.log('Binding tab', index, tab.dataset.tab);
      
      tab.addEventListener('click', () => {
        console.log('Tab clicked:', tab.dataset.tab);
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        const chatsList = document.getElementById('chats-list');
        const friendsList = document.getElementById('friends-list-main');
        
        console.log('Chats list element:', chatsList);
        console.log('Friends list element:', friendsList);
        
        if (tabName === 'chats') {
          if (chatsList) chatsList.style.display = 'block';
          if (friendsList) friendsList.style.display = 'none';
          console.log('Showing chats');
        } else {
          if (chatsList) chatsList.style.display = 'none';
          if (friendsList) friendsList.style.display = 'block';
          console.log('Showing friends');
          this.renderFriendsList();
        }
        
        // Сохраняем состояние
        ui.saveState();
      });
    });
    
    console.log('Tab events bound');
  },

  bindEvents() {
    const addBtn = document.getElementById('add-server-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.renderFriendsSelectList();
        this.renderGroupMembersList();
        ui.showModal('create-chat-modal');
      });
    }

    const cancelBtn = document.querySelector('.modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        ui.hideModal('create-chat-modal');
      });
    }

    const createBtn = document.querySelector('.modal-create');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.createChat();
      });
    }

    const modalClose = document.querySelector('#create-chat-modal .modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        ui.hideModal('create-chat-modal');
      });
    }

    const modalOverlay = document.querySelector('#create-chat-modal .modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        ui.hideModal('create-chat-modal');
      });
    }

    const chatClose = document.getElementById('chat-close');
    if (chatClose) {
      chatClose.addEventListener('click', () => {
        this.closeChat();
      });
    }
  },

  renderChatList() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const container = document.getElementById('chats-list');
    if (!container) return;

    container.innerHTML = '';

    const fav = storage.getOrCreateFavorites(user.id);
    if (fav) {
      this.addChatToList(container, fav, true);
    }

    const userChats = storage.getUserChats(user.id).filter(c => c.id !== fav.id);
    userChats.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      }
      return 0;
    });

    userChats.forEach((c) => {
      this.addChatToList(container, c, false);
    });
  },

  addChatToList(container, chat, isFav) {
    const item = document.createElement('div');
    item.className = 'chat-list-item';
    item.dataset.chatId = chat.id;

    const preview = chat.lastMessage ? chat.lastMessage.text.substring(0, 30) : 'Нет сообщений';
    const time = chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : '';

    item.innerHTML = `
      <div class="chat-list-avatar" style="background: ${isFav ? '#FEE75C' : chat.members && chat.members.length > 1 ? '#5865F2' : '#57F287'}">
        ${isFav ? '⭐' : (chat.name || '?').charAt(0).toUpperCase()}
      </div>
      <div class="chat-list-info">
        <div class="chat-list-name">${chat.name || 'Без названия'}</div>
        <div class="chat-list-preview">${preview}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      this.openChat(chat.id);
    });

    container.appendChild(item);
  },

  openChat(chatId) {
    this.currentChatId = chatId;
    const chat = storage.getChat(chatId);
    if (!chat) return;

    document.querySelectorAll('.chat-list-item').forEach(i => i.classList.remove('active'));
    const item = document.querySelector(`.chat-list-item[data-chat-id="${chatId}"]`);
    if (item) item.classList.add('active');

    const noChat = document.getElementById('no-chat-selected');
    const chatView = document.getElementById('chat-view');
    
    if (noChat) noChat.classList.add('hidden');
    if (chatView) chatView.classList.remove('hidden');

    const chatName = document.getElementById('chat-name');
    const chatMembers = document.getElementById('chat-members');
    
    if (chatName) chatName.textContent = chat.name || 'Без названия';
    if (chatMembers) {
      chatMembers.textContent = chat.type === 'group' && chat.members ? `${chat.members.length} участников` : '1 участник';
    }

    messages.loadMessages(chatId);

    // Показываем кнопку поиска
    const searchBtn = document.getElementById('search-messages-btn');
    if (searchBtn) searchBtn.style.display = 'flex';

    // Сохраняем состояние
    ui.saveState();
  },

  closeChat() {
    this.currentChatId = null;
    const noChat = document.getElementById('no-chat-selected');
    const chatView = document.getElementById('chat-view');
    const searchBtn = document.getElementById('search-messages-btn');

    if (noChat) noChat.classList.remove('hidden');
    if (chatView) chatView.classList.add('hidden');
    if (searchBtn) searchBtn.style.display = 'none';

    document.querySelectorAll('.chat-list-item').forEach(i => i.classList.remove('active'));

    // Сбрасываем флаги обработчиков
    if (messages.reactionEventsBound) {
      messages.reactionEventsBound = false;
      messages.contextMenuEventsBound = false;
    }
  },

  createChat() {
    const user = storage.getCurrentUser();
    if (!user) {
      ui.showNotification('Вы не авторизованы', 'error');
      return;
    }

    const activeTypeBtn = document.querySelector('.chat-type-btn.active');
    const chatType = activeTypeBtn ? activeTypeBtn.dataset.type : 'direct';
    
    if (chatType === 'direct') {
      this.createDirectChat();
    } else {
      this.createGroupChat();
    }
  },

  createDirectChat() {
    const user = storage.getCurrentUser();
    if (!user) return;

    // Find selected friend
    const selectedFriend = document.querySelector('.friend-select-item.selected');
    if (!selectedFriend) {
      ui.showNotification('Выберите друга для чата', 'error');
      return;
    }

    const friendId = selectedFriend.dataset.friendId;
    const friendName = selectedFriend.querySelector('.friend-select-name')?.textContent || 'Друг';
    
    this.createDirectChatWithFriend(friendId, friendName);
  },

  createGroupChat() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const nameInput = document.getElementById('new-chat-name');
    const name = nameInput ? nameInput.value.trim() : '';
    
    if (!name) {
      ui.showNotification('Введите название группового чата', 'error');
      return;
    }

    // Find selected members
    const selectedMembers = document.querySelectorAll('.friend-select-item.selected');
    if (selectedMembers.length < 2) {
      ui.showNotification('Выберите минимум 2 участника', 'error');
      return;
    }

    const memberIds = [user.id];
    selectedMembers.forEach(item => {
      memberIds.push(item.dataset.friendId);
    });

    const chat = storage.createChat(name, 'group', memberIds, user.id);
    if (chat) {
      ui.hideModal('create-chat-modal');
      this.renderChatList();
      ui.showNotification(`Групповой чат "${name}" создан!`, 'success');
      if (nameInput) nameInput.value = '';
      
      // Reset selections
      document.querySelectorAll('.friend-select-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    } else {
      ui.showNotification('Ошибка создания чата', 'error');
    }
  },

  renderFriendsSelectList() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const container = document.getElementById('friends-select-list');
    if (!container) return;

    const friends = storage.getFriends(user.id);
    container.innerHTML = '';

    if (friends.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 12px;">У вас пока нет друзей. Добавьте друга в настройках!</p>';
      return;
    }

    friends.forEach(friend => {
      const item = document.createElement('div');
      item.className = 'friend-select-item';
      item.dataset.friendId = friend.id;
      
      let avatarContent;
      if (friend.avatarImage) {
        avatarContent = `<img src="${friend.avatarImage}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarContent = friend.displayName.charAt(0).toUpperCase();
      }

      item.innerHTML = `
        <div class="chat-list-avatar" style="background: ${friend.avatarColor || '#5865F2'}">
          ${avatarContent}
        </div>
        <div class="friend-select-info">
          <div class="friend-select-name">${ui.escapeHtml(friend.displayName)}</div>
          <div class="friend-select-status">${friend.status === 'online' ? '🟢 В сети' : '⚫ Не в сети'}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        // Выделяем друга
        document.querySelectorAll('#friends-select-list .friend-select-item').forEach(i => {
          i.classList.remove('selected');
        });
        item.classList.add('selected');
      });

      container.appendChild(item);
    });
  },

  renderGroupMembersList() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const container = document.getElementById('group-members-list');
    if (!container) return;

    const friends = storage.getFriends(user.id);
    container.innerHTML = '';

    if (friends.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 12px;">У вас пока нет друзей. Добавьте друга для создания группового чата!</p>';
      return;
    }

    friends.forEach(friend => {
      const item = document.createElement('div');
      item.className = 'friend-select-item';
      item.dataset.friendId = friend.id;
      
      let avatarContent;
      if (friend.avatarImage) {
        avatarContent = `<img src="${friend.avatarImage}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarContent = friend.displayName.charAt(0).toUpperCase();
      }

      item.innerHTML = `
        <div class="chat-list-avatar" style="background: ${friend.avatarColor || '#5865F2'}">
          ${avatarContent}
        </div>
        <div class="friend-select-info">
          <div class="friend-select-name">${ui.escapeHtml(friend.displayName)}</div>
          <div class="friend-select-status">${friend.status === 'online' ? '🟢 В сети' : '⚫ Не в сети'}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        item.classList.toggle('selected');
      });

      container.appendChild(item);
    });
  },

  createDirectChatWithFriend(friendId, friendName) {
    const user = storage.getCurrentUser();
    if (!user) return;

    // Check if chat already exists
    const existingChats = storage.getUserChats(user.id);
    const existingChat = existingChats.find(c => 
      c.type === 'direct' && c.members && c.members.length === 2 && 
      c.members.includes(friendId)
    );

    if (existingChat) {
      ui.hideModal('create-chat-modal');
      this.openChat(existingChat.id);
      ui.showNotification('Чат уже существует', 'info');
      return;
    }

    // Create new chat
    const chat = storage.createChat(friendName, 'direct', [user.id, friendId], user.id);
    
    if (chat) {
      ui.hideModal('create-chat-modal');
      this.renderChatList();
      this.openChat(chat.id);
      ui.showNotification(`Чат с ${friendName} создан!`, 'success');
    } else {
      ui.showNotification('Ошибка создания чата', 'error');
    }
  },

  renderFriendsList() {
    const user = storage.getCurrentUser();
    if (!user) {
      console.log('No user logged in');
      return;
    }

    const container = document.getElementById('friends-list-main');
    if (!container) {
      console.log('Friends list container not found');
      return;
    }

    const friends = storage.getFriends(user.id);
    console.log('Friends count:', friends.length);
    
    container.innerHTML = '';

    // === Add Friend Section ===
    const addFriendSection = document.createElement('div');
    addFriendSection.className = 'add-friend-section';
    addFriendSection.innerHTML = `
      <div class="add-friend-header">
        <h3>Добавить друга</h3>
      </div>
      <div class="add-friend-form">
        <input type="text" id="friend-search-input" placeholder="Введите username (например: admin)" />
        <button id="add-friend-btn">Добавить</button>
      </div>
      <div id="friend-search-status"></div>
      <div id="friend-search-results"></div>
    `;
    container.appendChild(addFriendSection);

    // === My Friends Section ===
    const myFriendsHeader = document.createElement('div');
    myFriendsHeader.className = 'friends-section-header';
    myFriendsHeader.innerHTML = `<h3>Мои друзья (${friends.length})</h3>`;
    container.appendChild(myFriendsHeader);

    if (friends.length === 0) {
      container.innerHTML += '<p style="color: var(--text-secondary); text-align: center; padding: 20px; font-size: 14px;">У вас пока нет друзей.<br>Добавьте друга, используя поле поиска выше!</p>';
    } else {
      const friendsListContainer = document.createElement('div');
      friendsListContainer.id = 'friends-list-items';
      
      friends.forEach(friend => {
        const item = document.createElement('div');
        item.className = 'friend-item-main';
        item.dataset.friendId = friend.id;

        let avatarContent;
        if (friend.avatarImage) {
          avatarContent = `<img src="${friend.avatarImage}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
          avatarContent = friend.displayName.charAt(0).toUpperCase();
        }

        item.innerHTML = `
          <div class="chat-list-avatar" style="background: ${friend.avatarColor || '#5865F2'}; position: relative;">
            ${avatarContent}
            <div class="friend-status-dot ${friend.status === 'online' ? 'online' : 'offline'}"></div>
          </div>
          <div class="chat-list-info">
            <div class="chat-list-name">${ui.escapeHtml(friend.displayName)}</div>
            <div class="chat-list-preview">${friend.status === 'online' ? '🟢 В сети' : '⚫ Не в сети'}</div>
          </div>
        `;

        item.addEventListener('click', () => {
          console.log('Friend clicked:', friend.displayName);
          this.createDirectChatWithFriendFromList(friend.id, friend.displayName);
        });

        friendsListContainer.appendChild(item);
      });
      
      container.appendChild(friendsListContainer);
    }
    
    // === Bind Search Event Listeners ===
    this.bindSearchListeners();
    
    console.log('Friends list rendered');
  },

  bindSearchListeners() {
    const searchInput = document.getElementById('friend-search-input');
    const addBtn = document.getElementById('add-friend-btn');
    const statusEl = document.getElementById('friend-search-status');
    const resultsEl = document.getElementById('friend-search-results');

    if (!searchInput || !addBtn || !statusEl || !resultsEl) return;

    // Clear previous listeners by cloning
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    // Real-time search on input event with 300ms debounce
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(this.searchTimeout);
      
      if (query.length < 2) {
        resultsEl.innerHTML = '';
        statusEl.textContent = 'Введите username пользователя для поиска';
        statusEl.style.color = 'var(--text-secondary)';
        return;
      }

      statusEl.textContent = 'Поиск...';
      resultsEl.innerHTML = '<div class="search-loading">Загрузка...</div>';

      this.searchTimeout = setTimeout(() => {
        this.searchUserForFriend(query, statusEl, resultsEl);
      }, 300);
    });

    // Add button click
    addBtn.addEventListener('click', () => {
      const query = newSearchInput.value.trim();
      if (query.length === 0) {
        statusEl.textContent = 'Введите username или ID';
        statusEl.style.color = 'var(--red)';
        return;
      }
      this.searchUserForFriend(query, statusEl, resultsEl);
    });
  },

  searchUserForFriend(query, statusEl, resultsEl) {
    if (!query || query.length < 1) {
      statusEl.textContent = 'Введите username для поиска';
      statusEl.style.color = 'var(--text-secondary)';
      resultsEl.innerHTML = '';
      return;
    }

    statusEl.textContent = '🔍 Поиск...';
    statusEl.style.color = 'var(--primary)';

    // Get all users from storage
    const allUsers = storage.getAllUsers ? storage.getAllUsers() : [];
    const currentUser = storage.getCurrentUser();
    const currentFriends = storage.getFriends(currentUser.id);
    const currentFriendIds = currentFriends.map(f => f.id);

    // Filter users matching the query by username
    const queryLower = query.toLowerCase();
    const matches = allUsers.filter(user => {
      // Skip current user
      if (user.id === currentUser.id) return false;
      // Skip already friends
      if (currentFriendIds.includes(user.id)) return false;
      
      // Check username
      const username = (user.username || '').toLowerCase();
      
      return username.includes(queryLower);
    });

    if (matches.length === 0) {
      statusEl.textContent = '❌ Пользователь не найден';
      statusEl.style.color = 'var(--red)';
      resultsEl.innerHTML = '';
      return;
    }

    statusEl.textContent = `✅ Найдено: ${matches.length}`;
    statusEl.style.color = 'var(--green)';

    // Render results
    resultsEl.innerHTML = '';
    matches.forEach(user => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      
      let avatarContent;
      if (user.avatarImage) {
        avatarContent = `<img src="${user.avatarImage}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarContent = (user.displayName || user.username || '?').charAt(0).toUpperCase();
      }

      resultItem.innerHTML = `
        <div class="search-result-avatar" style="background: ${user.avatarColor || '#5865F2'}; position: relative;">
          ${avatarContent}
          <div class="friend-status-dot ${user.status === 'online' ? 'online' : 'offline'}"></div>
        </div>
        <div class="search-result-info">
          <div class="search-result-name">${ui.escapeHtml(user.displayName)}</div>
          <div class="search-result-id">@${ui.escapeHtml(user.username)}</div>
        </div>
        <button class="search-add-btn" data-user-id="${user.id}">Добавить</button>
      `;

      // Bind add button click
      const addBtn = resultItem.querySelector('.search-add-btn');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addFriendFromSearch(user.id, statusEl, resultsEl);
      });

      resultsEl.appendChild(resultItem);
    });
  },

  addFriendFromSearch(friendId, statusEl, resultsEl) {
    if (!friendId) {
      statusEl.textContent = '❌ Ошибка: ID пользователя не указан';
      statusEl.style.color = 'var(--red)';
      return;
    }

    statusEl.textContent = 'Добавление...';
    statusEl.style.color = 'var(--text-secondary)';

    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      statusEl.textContent = '❌ Вы не авторизованы';
      statusEl.style.color = 'var(--red)';
      return;
    }

    // Check if already friends
    const currentFriends = storage.getFriends(currentUser.id);
    const alreadyFriend = currentFriends.find(f => f.id === friendId);
    if (alreadyFriend) {
      statusEl.textContent = 'ℹ️ Уже в друзьях';
      statusEl.style.color = 'var(--yellow)';
      return;
    }

    // Add friend using ID
    const result = storage.addFriendById(currentUser.id, friendId);
    
    if (result.success) {
      statusEl.textContent = '✅ Добавлено!';
      statusEl.style.color = 'var(--green)';
      
      // Clear search
      const searchInput = document.getElementById('friend-search-input');
      if (searchInput) searchInput.value = '';
      if (resultsEl) resultsEl.innerHTML = '';
      
      // Refresh friends list
      setTimeout(() => {
        this.renderFriendsList();
      }, 500);
      
      ui.showNotification(`${result.friend.displayName} добавлен в друзья!`, 'success');
    } else {
      statusEl.textContent = '❌ ' + result.error;
      statusEl.style.color = 'var(--red)';
    }
  },

  createDirectChatWithFriendFromList(friendId, friendName) {
    const user = storage.getCurrentUser();
    if (!user) {
      ui.showNotification('Вы не авторизованы', 'error');
      return;
    }

    // Check if chat already exists
    const existingChats = storage.getUserChats(user.id);
    const existingChat = existingChats.find(c => 
      c.type === 'direct' && c.members && c.members.length === 2 && 
      c.members.includes(friendId)
    );

    if (existingChat) {
      this.openChat(existingChat.id);
      
      // Switch to chats tab
      const chatsTab = document.querySelector('.chat-tab[data-tab="chats"]');
      if (chatsTab) {
        chatsTab.click();
      }
      return;
    }

    // Create new chat
    const chat = storage.createChat(friendName, 'direct', [user.id, friendId], user.id);
    
    if (chat) {
      this.renderChatList();
      this.openChat(chat.id);
      
      // Switch to chats tab
      const chatsTab = document.querySelector('.chat-tab[data-tab="chats"]');
      if (chatsTab) {
        chatsTab.click();
      }
      
      ui.showNotification(`Чат с ${friendName} создан!`, 'success');
    } else {
      ui.showNotification('Ошибка создания чата', 'error');
    }
  }
};

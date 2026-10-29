// ===== STORAGE MANAGER =====
class StorageManager {
  constructor() {
    this.users = [];
    this.chats = [];
    this.messages = [];
    this.currentUser = null;
    this.loadAll();
  }

  loadAll() {
    try {
      const usersData = localStorage.getItem('loom_users');
      if (usersData) this.users = JSON.parse(usersData);

      const chatsData = localStorage.getItem('loom_chats');
      if (chatsData) this.chats = JSON.parse(chatsData);

      const messagesData = localStorage.getItem('loom_messages');
      if (messagesData) this.messages = JSON.parse(messagesData);
    } catch (e) {
      console.error('Ошибка загрузки:', e);
      this.users = [];
      this.chats = [];
      this.messages = [];
    }
  }

  saveAll() {
    try {
      localStorage.setItem('loom_users', JSON.stringify(this.users));
      localStorage.setItem('loom_chats', JSON.stringify(this.chats));
      localStorage.setItem('loom_messages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Ошибка сохранения:', e);
    }
  }

  // ===== AUTH =====
  register(username, email, password) {
    if (!username || !email || !password) {
      return { success: false, error: 'Заполните все поля' };
    }

    if (password.length < 4) {
      return { success: false, error: 'Пароль минимум 4 символа' };
    }

    if (this.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Имя уже занято' };
    }

    if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email уже используется' };
    }

    const user = {
      id: 'user_' + Date.now(),
      username: username.trim(),
      email: email.trim(),
      password: password,
      displayName: username.trim(),
      avatarColor: '#5865F2',
      avatarImage: null,
      status: 'online',
      createdAt: new Date().toISOString()
    };

    this.users.push(user);
    this.saveAll();
    return { success: true, user };
  }

  login(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Заполните все поля' };
    }

    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) {
      return { success: false, error: 'Неверное имя или пароль' };
    }

    user.status = 'online';
    this.saveAll();
    this.currentUser = user;
    return { success: true, user };
  }

  logout() {
    if (this.currentUser) {
      this.currentUser.status = 'offline';
      this.saveAll();
    }
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateUser(id, data) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      // Если меняется username, проверяем уникальность
      if (data.username) {
        const existingUser = this.users.find(u => 
          u.username.toLowerCase() === data.username.toLowerCase() && u.id !== id
        );
        if (existingUser) {
          return { success: false, error: 'Этот username уже занят' };
        }
      }
      
      this.users[idx] = { ...this.users[idx], ...data };
      this.saveAll();
      if (this.currentUser && this.currentUser.id === id) {
        this.currentUser = this.users[idx];
      }
      return true;
    }
    return false;
  }

  // ===== FRIENDS =====
  addFriend(currentUserId, friendUsername) {
    if (!currentUserId || !friendUsername) {
      return { success: false, error: 'Заполните все поля' };
    }

    // Ищем по username (уникальному)
    const friend = this.users.find(u => u.username.toLowerCase() === friendUsername.toLowerCase());
    if (!friend) {
      return { success: false, error: 'Пользователь не найден' };
    }

    if (friend.id === currentUserId) {
      return { success: false, error: 'Нельзя добавить себя' };
    }

    const currentUser = this.users.find(u => u.id === currentUserId);
    if (!currentUser) {
      return { success: false, error: 'Пользователь не найден' };
    }

    if (!currentUser.friends) {
      currentUser.friends = [];
    }

    if (currentUser.friends.find(f => f.id === friend.id)) {
      return { success: false, error: 'Уже в друзьях' };
    }

    currentUser.friends.push({
      id: friend.id,
      username: friend.username,
      displayName: friend.displayName,
      avatarColor: friend.avatarColor,
      avatarImage: friend.avatarImage,
      status: friend.status || 'offline'
    });

    this.saveAll();
    return { success: true, friend };
  }

  addFriendById(currentUserId, friendId) {
    const friend = this.users.find(u => u.id === friendId);
    if (!friend) {
      return { success: false, error: 'Пользователь не найден' };
    }

    if (friend.id === currentUserId) {
      return { success: false, error: 'Нельзя добавить себя' };
    }

    const currentUser = this.users.find(u => u.id === currentUserId);
    if (!currentUser) {
      return { success: false, error: 'Пользователь не найден' };
    }

    if (!currentUser.friends) {
      currentUser.friends = [];
    }

    if (currentUser.friends.find(f => f.id === friend.id)) {
      return { success: false, error: 'Уже в друзьях' };
    }

    currentUser.friends.push({
      id: friend.id,
      username: friend.username,
      displayName: friend.displayName,
      avatarColor: friend.avatarColor,
      avatarImage: friend.avatarImage,
      status: friend.status || 'offline'
    });

    this.saveAll();
    return { success: true, friend };
  }

  removeFriend(currentUserId, friendId) {
    if (!currentUserId || !friendId) {
      return false;
    }

    const currentUser = this.users.find(u => u.id === currentUserId);
    if (!currentUser || !currentUser.friends) {
      return false;
    }

    currentUser.friends = currentUser.friends.filter(f => f.id !== friendId);
    this.saveAll();
    return true;
  }

  getFriends(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user || !user.friends) {
      return [];
    }
    return user.friends;
  }

  getAllUsers() {
    return this.users || [];
  }

  searchUsers(query) {
    const q = query.toLowerCase();
    return this.users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    );
  }

  searchUsersExcludeCurrent(query, excludeId) {
    const q = query.toLowerCase();
    return this.users.filter(u =>
      (u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)) &&
      u.id !== excludeId
    );
  }

  // ===== CHATS =====
  getUserChats(userId) {
    return this.chats.filter(c => c.members && c.members.includes(userId));
  }

  getChat(chatId) {
    return this.chats.find(c => c.id === chatId);
  }

  createChat(name, type, members, createdBy) {
    if (!name || !members || members.length === 0) {
      return null;
    }

    const chat = {
      id: 'chat_' + Date.now(),
      name: name.trim(),
      type: type || 'direct',
      members: [...members],
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
      lastMessage: null
    };

    this.chats.push(chat);
    this.saveAll();
    return chat;
  }

  getOrCreateFavorites(userId) {
    let fav = this.chats.find(c => c.name === '⭐ Мои заметки' && c.members && c.members.length === 1 && c.members[0] === userId);
    if (!fav) {
      fav = this.createChat('⭐ Мои заметки', 'direct', [userId], userId);
    }
    return fav;
  }

  // ===== MESSAGES =====
  sendMessage(chatId, senderId, text, imageData = null) {
    if (!chatId || !senderId) {
      return null;
    }

    const message = {
      id: 'msg_' + Date.now(),
      chatId: chatId,
      senderId: senderId,
      text: text ? text.trim() : '',
      timestamp: new Date().toISOString(),
      imageData: imageData,
      reactions: {},
      isEdited: false,
      isDeleted: false
    };

    this.messages.push(message);
    this.saveAll();

    const chat = this.getChat(chatId);
    if (chat) {
      chat.lastMessage = {
        text: text.trim(),
        senderId: senderId,
        timestamp: message.timestamp
      };
      this.saveAll();
    }

    return message;
  }

  getChatMessages(chatId, limit = 50) {
    if (!chatId) return [];
    
    return this.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  searchMessages(chatId, query) {
    if (!chatId || !query) return [];
    
    const q = query.toLowerCase();
    return this.messages.filter(m =>
      m.chatId === chatId && m.text.toLowerCase().includes(q)
    );
  }

  // ===== REACTIONS =====
  toggleReaction(chatId, messageId, userId, emoji) {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) return false;
    if (!message.reactions) {
      message.reactions = {};
    }
    if (message.reactions[userId] === emoji) {
      delete message.reactions[userId];
    } else {
      message.reactions[userId] = emoji;
    }
    this.saveAll();
    return true;
  }

  // ===== EDIT/DELETE =====
  editMessage(messageId, newText) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.text = newText.trim();
      message.isEdited = true;
      this.saveAll();
      return true;
    }
    return false;
  }

  deleteMessage(messageId) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.isDeleted = true;
      message.text = '';
      this.saveAll();
      return true;
    }
    return false;
  }
}

const storage = new StorageManager();

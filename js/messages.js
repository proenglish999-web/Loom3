// ===== MESSAGES MODULE =====
const messages = {
  currentChatId: null,
  searchResults: [],
  searchCurrentIndex: -1,
  isContextMenuOpen: false,

  loadMessages(chatId) {
    if (!chatId) return;
    
    this.currentChatId = chatId;
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = '';

    const chatMessages = storage.getChatMessages(chatId);
    const user = storage.getCurrentUser();
    if (!user) return;

    chatMessages.reverse().forEach((msg) => {
      this.addMessageToUI(msg, user);
    });

    this.scrollToBottom();
    
    // Привязываем события скролла только один раз
    if (!this.scrollEventsBound) {
      setTimeout(() => {
        this.bindScrollEvents();
        this.scrollEventsBound = true;
      }, 100);
    }

    // Сбрасываем флаги для повторной привязки
    this.reactionEventsBound = false;
    this.contextMenuEventsBound = false;

    // Инициализация новых функций
    this.bindReactionEvents();
    this.bindContextMenuEvents();
    this.bindSearchEvents();
    this.bindImageEvents();
    this.bindImageViewerEvents();
    
    // Сохраняем состояние
    ui.saveState();
  },

  addMessageToUI(msg, currentUser) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const isOwn = msg.senderId === currentUser.id;
    const sender = storage.users.find(u => u.id === msg.senderId);

    if (!sender) return;

    const div = document.createElement('div');
    div.className = `message ${isOwn ? 'own' : ''}`;
    div.dataset.messageId = msg.id;

    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : '';

    let avatarContent;
    if (sender.avatarImage) {
      avatarContent = `<img src="${sender.avatarImage}" alt="Avatar">`;
    } else {
      avatarContent = sender.displayName.charAt(0).toUpperCase();
    }

    // Обработка текста с учётом редактирования/удаления
    let textContent = '';
    if (msg.isDeleted) {
      textContent = '<em style="color: var(--text-muted);">[удалено]</em>';
    } else if (msg.imageData) {
      // Сообщение с изображением
      const caption = msg.text ? ui.escapeHtml(msg.text) : '';
      textContent = `
        <div class="message-image-container" data-image="${msg.imageData}">
          <img class="message-image-thumbnail" src="${msg.imageData}" alt="Image">
        </div>
        ${caption ? `<div class="message-image-caption">${caption}</div>` : ''}
      `;
    } else {
      textContent = ui.escapeHtml(msg.text);
    }

    let editedLabel = '';
    if (msg.isEdited && !msg.isDeleted) {
      editedLabel = '<span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">[изменено]</span>';
    }

    // Сохраняем оригинальный текст для поиска
    div.dataset.originalText = textContent;

    div.innerHTML = `
      <div class="message-avatar" style="background: ${sender.avatarColor || '#5865F2'}">
        ${avatarContent}
      </div>
      <div class="message-content">
        ${!isOwn ? `<div class="message-header"><span class="message-author" style="color: ${sender.avatarColor || '#5865F2'}">${ui.escapeHtml(sender.displayName)}</span><span class="message-time">${time}</span></div>` : ''}
        <div class="message-text">${textContent}${editedLabel}</div>
        ${isOwn ? `<div class="message-header" style="justify-content: flex-end;"><span class="message-time">${time}</span></div>` : ''}
      </div>
    `;

    // Рендеринг реакций
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      const reactionsDiv = document.createElement('div');
      reactionsDiv.className = 'message-reactions';

      const reactionGroups = {};
      for (const [userId, emoji] of Object.entries(msg.reactions)) {
        if (!reactionGroups[emoji]) {
          reactionGroups[emoji] = [];
        }
        reactionGroups[emoji].push(userId);
      }

      for (const [emoji, userIds] of Object.entries(reactionGroups)) {
        const badge = document.createElement('span');
        badge.className = 'reaction-badge';
        if (userIds.includes(currentUser.id)) {
          badge.classList.add('active');
        }
        badge.dataset.emoji = emoji;
        badge.dataset.messageId = msg.id;
        badge.innerHTML = `${emoji} <span class="reaction-count">${userIds.length}</span>`;
        reactionsDiv.appendChild(badge);
      }

      const messageText = div.querySelector('.message-text');
      if (messageText) {
        div.insertBefore(reactionsDiv, messageText.nextSibling);
      }
    }

    container.appendChild(div);
  },

  send() {
    if (!this.currentChatId) return;

    const input = document.getElementById('message-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const user = storage.getCurrentUser();
    if (!user) return;

    // Сохраняем текущую позицию скролла
    const container = document.getElementById('messages-container');
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const previousScrollTop = container ? container.scrollTop : 0;

    const message = storage.sendMessage(this.currentChatId, user.id, text, null);
    if (message) {
      input.value = '';
      
      // Добавляем сообщение с правильными данными
      this.addMessageToUI(message, user);

      // Восстанавливаем позицию скролла
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 50);
      }

      chatManager.renderChatList();
      ui.saveState();
    }
  },

  scrollToBottom() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  },

  bindScrollEvents() {
    const container = document.getElementById('messages-container');
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    if (!container) return;

    let isNearBottom = true;
    let scrollTimeout;

    const onScroll = function() {
      clearTimeout(scrollTimeout);
      
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      console.log('Scroll:', { scrollTop, scrollHeight, clientHeight });
      
      // Проверяем близость к низу (порог 100px)
      isNearBottom = (scrollHeight - scrollTop - clientHeight) < 100;
      
      // Показываем/скрываем кнопку "Вниз"
      if (scrollToBottomBtn) {
        if (!isNearBottom) {
          scrollToBottomBtn.classList.add('show');
          console.log('Show scroll button');
        } else {
          scrollToBottomBtn.classList.remove('show');
        }
      }
      
      // Загружаем старые сообщения при прокрутке вверх
      scrollTimeout = setTimeout(() => {
        if (scrollTop < 50 && !container.dataset.loading) {
          container.dataset.loading = 'true';
          this.loadOlderMessages(container);
        }
      }, 200);
    };

    // Используем setTimeout для гарантии что контейнер виден
    setTimeout(() => {
      container.addEventListener('scroll', onScroll);
      console.log('Scroll event listener added');
    }, 200);

    // Обработчик кнопки "Вниз"
    if (scrollToBottomBtn) {
      scrollToBottomBtn.addEventListener('click', () => {
        this.scrollToBottom();
        scrollToBottomBtn.classList.remove('show');
      });
    }
  },

  loadOlderMessages(container) {
    if (!this.currentChatId) return;
    
    const currentMessages = storage.getChatMessages(this.currentChatId, 50);
    if (currentMessages.length === 0) return;
    
    const oldestMessage = currentMessages[currentMessages.length - 1];
    const beforeId = oldestMessage.id;
    
    // Загружаем больше сообщений
    const moreMessages = storage.getChatMessages(this.currentChatId, 100);
    const olderMessages = moreMessages.filter(m => m.id !== beforeId && !currentMessages.find(cm => cm.id === m.id));
    
    if (olderMessages.length === 0) {
      container.dataset.loading = 'false';
      return;
    }
    
    // Сохраняем текущую высоту
    const previousHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;
    
    // Добавляем старые сообщения в начало
    olderMessages.reverse().forEach((msg) => {
      const user = storage.getCurrentUser();
      if (user) {
        this.addMessageToUI(msg, user);
      }
    });
    
    // Восстанавливаем позицию скролла
    const newHeight = container.scrollHeight;
    container.scrollTop = previousScrollTop + (newHeight - previousHeight);
    
    container.dataset.loading = 'false';
  },

  // ===== REACTIONS =====
  showReactionPicker(x, y, messageId) {
    const picker = document.getElementById('reaction-picker');
    if (!picker) return;

    picker.classList.remove('hidden');

    // Позиционируем с учётом границ экрана
    const pickerWidth = 200;
    const pickerHeight = 50;
    const maxX = window.innerWidth - pickerWidth - 10;
    const maxY = window.innerHeight - pickerHeight - 10;
    picker.style.left = Math.min(x, maxX) + 'px';
    picker.style.top = Math.min(y, maxY) + 'px';

    // Привязываем клик по опциям реакшн
    picker.querySelectorAll('.reaction-option').forEach(option => {
      option.onmousedown = (e) => {
        e.stopPropagation();
        const user = storage.getCurrentUser();
        if (!user) return;
        storage.toggleReaction(this.currentChatId, messageId, user.id, option.dataset.emoji);
        this.loadMessages(this.currentChatId);
        picker.classList.add('hidden');
      };
    });

    // Закрытие при клике вне
    const closePicker = (e) => {
      if (!picker.contains(e.target)) {
        picker.classList.add('hidden');
        this.isContextMenuOpen = false;
        document.removeEventListener('mousedown', closePicker);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closePicker), 10);
  },

  bindReactionEvents() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    // Удаляем старые обработчики если есть
    if (this.reactionEventsBound) return;
    this.reactionEventsBound = true;

    // Right-click для реакций (только ПКМ)
    const handleContextMenu = (e) => {
      const messageEl = e.target.closest('.message');
      if (messageEl) {
        e.preventDefault();
        this.showReactionPicker(e.clientX, e.clientY, messageEl.dataset.messageId);
      }
    };
    container.addEventListener('contextmenu', handleContextMenu);
    this._handleContextMenu = handleContextMenu;

    // Long press для мобильных
    let pressTimer = null;
    const handleTouchStart = (e) => {
      const messageEl = e.target.closest('.message');
      if (!messageEl) return;
      pressTimer = setTimeout(() => {
        const touch = e.touches[0];
        this.showReactionPicker(touch.clientX, touch.clientY, messageEl.dataset.messageId);
      }, 500);
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    this._handleTouchStart = handleTouchStart;

    container.addEventListener('touchend', () => clearTimeout(pressTimer));
    container.addEventListener('touchmove', () => clearTimeout(pressTimer));

    // Клик по реакшн-бейджам
    const handleClick = (e) => {
      const badge = e.target.closest('.reaction-badge');
      if (badge) {
        e.stopPropagation();
        const user = storage.getCurrentUser();
        if (!user) return;
        storage.toggleReaction(this.currentChatId, badge.dataset.messageId, user.id, badge.dataset.emoji);
        this.loadMessages(this.currentChatId);
      }
    };
    container.addEventListener('click', handleClick, true);
    this._handleClick = handleClick;
  },

  // ===== CONTEXT MENU =====
  bindContextMenuEvents() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    // Удаляем старые обработчики если есть
    if (this.contextMenuEventsBound) return;
    this.contextMenuEventsBound = true;

    // Long press для мобильных
    let pressTimer = null;
    const handleTouchStart = (e) => {
      const messageEl = e.target.closest('.message');
      if (!messageEl) return;
      pressTimer = setTimeout(() => {
        const touch = e.touches[0];
        this.showContextMenu(touch.clientX, touch.clientY, messageEl.dataset.messageId);
      }, 500);
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    this._handleTouchStartCM = handleTouchStart;

    container.addEventListener('touchend', () => clearTimeout(pressTimer));
    container.addEventListener('touchmove', () => clearTimeout(pressTimer));

    // Close on mousedown outside
    const handleMousedown = (e) => {
      const menu = document.getElementById('message-context-menu');
      if (menu && !menu.contains(e.target)) {
        menu.classList.add('hidden');
        this.isContextMenuOpen = false;
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    this._handleMousedownCM = handleMousedown;
  },

  showContextMenu(x, y, messageId) {
    const menu = document.getElementById('message-context-menu');
    if (!menu) return;

    this.isContextMenuOpen = true;

    const user = storage.getCurrentUser();
    const message = storage.messages.find(m => m.id === messageId);
    if (!message || !user) return;

    // Показываем только если это своё сообщение
    if (message.senderId !== user.id) {
      menu.querySelectorAll('.context-menu-item[data-action="edit"], .context-menu-item[data-action="delete"]').forEach(el => el.style.display = 'none');
    } else {
      menu.querySelectorAll('.context-menu-item').forEach(el => el.style.display = 'flex');
    }

    menu.classList.remove('hidden');
    menu.dataset.messageId = messageId;

    // Позиционируем
    const menuWidth = menu.offsetWidth || 180;
    const menuHeight = menu.offsetHeight || 120;
    const maxX = window.innerWidth - menuWidth - 10;
    const maxY = window.innerHeight - menuHeight - 10;
    menu.style.left = Math.min(x, maxX) + 'px';
    menu.style.top = Math.min(y, maxY) + 'px';

    // Привязываем действия
    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.onmousedown = (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        this.handleContextAction(action, messageId);
        this.isContextMenuOpen = false;
        menu.classList.add('hidden');
      };
    });
  },

  handleContextAction(action, messageId) {
    const user = storage.getCurrentUser();
    if (!user) return;

    switch (action) {
      case 'copy': {
        const message = storage.messages.find(m => m.id === messageId);
        if (message && message.text) {
          navigator.clipboard.writeText(message.text).then(() => {
            ui.showNotification('Скопировано!', 'success');
          }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = message.text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            ui.showNotification('Скопировано!', 'success');
          });
        }
        break;
      }
      case 'edit': {
        this.startEditMessage(messageId);
        break;
      }
      case 'delete': {
        if (confirm('Удалить это сообщение?')) {
          storage.deleteMessage(messageId);
          this.loadMessages(this.currentChatId);
          ui.showNotification('Сообщение удалено', 'info');
        }
        break;
      }
    }
  },

  startEditMessage(messageId) {
    const message = storage.messages.find(m => m.id === messageId);
    if (!message) return;

    const container = document.getElementById('messages-container');
    if (!container) return;

    const messageEl = container.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!messageEl) return;

    const textDiv = messageEl.querySelector('.message-text');
    if (!textDiv) return;

    const originalText = message.text;
    textDiv.innerHTML = `
      <textarea class="edit-message-input" style="width: 100%; min-height: 40px; background: var(--bg-input); color: var(--text-primary); border: 2px solid var(--primary); border-radius: 8px; padding: 8px; font-size: 15px; font-family: inherit; resize: vertical;">${ui.escapeHtml(originalText)}</textarea>
      <div class="edit-message-actions">
        <button class="edit-save-btn btn btn-primary" style="padding: 4px 16px; height: 32px; font-size: 13px;">Сохранить</button>
        <button class="edit-cancel-btn btn btn-text" style="padding: 4px 16px; height: 32px; font-size: 13px;">Отмена</button>
      </div>
    `;

    const textarea = textDiv.querySelector('.edit-message-input');
    textarea.focus();
    textarea.select();

    textDiv.querySelector('.edit-save-btn').onclick = () => {
      const newText = textarea.value.trim();
      if (newText && newText !== originalText) {
        storage.editMessage(messageId, newText);
        this.loadMessages(this.currentChatId);
        ui.showNotification('Сообщение изменено', 'success');
      } else {
        this.loadMessages(this.currentChatId);
      }
    };

    textDiv.querySelector('.edit-cancel-btn').onclick = () => {
      this.loadMessages(this.currentChatId);
    };
  },

  // ===== SEARCH =====
  bindSearchEvents() {
    const searchBtn = document.getElementById('search-messages-btn');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        searchBtn.style.display = 'none';
        const container = document.getElementById('search-input-container');
        if (container) container.classList.remove('hidden');
        if (searchInput) searchInput.focus();
      });
    }

    if (searchClose) {
      searchClose.addEventListener('click', () => this.closeSearch());
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeSearch();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateSearchResult(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateSearchResult(-1);
        }
      });
    }
  },

  performSearch(query) {
    if (!this.currentChatId) return;

    const container = document.getElementById('messages-container');
    if (!container) return;

    this.removeSearchHighlights();

    if (!query || query.length < 1) {
      const counter = document.getElementById('search-counter');
      if (counter) counter.textContent = '0 результатов';
      return;
    }

    const q = query.toLowerCase();
    const messageEls = container.querySelectorAll('.message');
    let matchCount = 0;
    let firstMatch = null;

    messageEls.forEach(msgEl => {
      const textEl = msgEl.querySelector('.message-text');
      if (!textEl) return;

      const originalText = msgEl.dataset.originalText;
      if (originalText && originalText.toLowerCase().includes(q)) {
        matchCount++;
        this.highlightInElement(textEl, q, originalText);
        if (!firstMatch) firstMatch = msgEl;
      }
    });

    const counter = document.getElementById('search-counter');
    if (counter) {
      counter.textContent = `${matchCount} результат${this.getPlural(matchCount)}`;
    }

    this.searchResults = [];
    container.querySelectorAll('.message-text .search-highlight').forEach(el => {
      this.searchResults.push(el);
    });
    this.searchCurrentIndex = -1;

    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  highlightInElement(element, query, originalText) {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    const highlighted = originalText.replace(regex, '<span class="search-highlight">$1</span>');
    element.innerHTML = highlighted;
  },

  removeSearchHighlights() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.querySelectorAll('.message').forEach(msgEl => {
      if (msgEl.dataset.originalText) {
        const textEl = msgEl.querySelector('.message-text');
        if (textEl) {
          textEl.innerHTML = msgEl.dataset.originalText;
        }
      }
    });
  },

  navigateSearchResult(direction) {
    if (this.searchResults.length === 0) return;

    const currentActive = document.querySelector('.search-highlight.active');
    if (currentActive) currentActive.classList.remove('active');

    this.searchCurrentIndex += direction;
    if (this.searchCurrentIndex < 0) this.searchCurrentIndex = this.searchResults.length - 1;
    if (this.searchCurrentIndex >= this.searchResults.length) this.searchCurrentIndex = 0;

    const target = this.searchResults[this.searchCurrentIndex];
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  closeSearch() {
    const searchBtn = document.getElementById('search-messages-btn');
    const container = document.getElementById('search-input-container');
    const searchInput = document.getElementById('search-input');

    this.removeSearchHighlights();
    this.searchResults = [];
    this.searchCurrentIndex = -1;

    if (container) container.classList.add('hidden');
    if (searchBtn) searchBtn.style.display = 'flex';
    if (searchInput) searchInput.value = '';
    const counter = document.getElementById('search-counter');
    if (counter) counter.textContent = '0 результатов';
  },

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  getPlural(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return '';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'а';
    return 'ов';
  },

  // ===== IMAGE HANDLING =====
  compressImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  bindImageEvents() {
    const attachBtn = document.getElementById('image-attach-btn');
    const fileInput = document.getElementById('image-file-input');

    if (attachBtn) {
      attachBtn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          ui.showNotification('Выберите файл изображения', 'error');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          ui.showNotification('Файл слишком большой (макс 10МБ)', 'error');
          return;
        }

        try {
          const compressed = await this.compressImage(file);
          const caption = document.getElementById('message-input').value.trim();
          const user = storage.getCurrentUser();
          if (!user) return;

          const message = storage.sendMessage(this.currentChatId, user.id, caption, compressed);
          if (message) {
            document.getElementById('message-input').value = '';
            this.addMessageToUI({
              id: message.id,
              senderId: user.id,
              text: caption,
              imageData: compressed,
              timestamp: new Date().toISOString(),
              reactions: {}
            }, user);

            this.scrollToBottom();
            chatManager.renderChatList();
            ui.saveState();
          }
        } catch (err) {
          ui.showNotification('Ошибка обработки изображения', 'error');
        }

        fileInput.value = '';
      });
    }
  },

  bindImageViewerEvents() {
    const container = document.getElementById('messages-container');
    const viewer = document.getElementById('image-viewer-modal');
    const viewerImg = document.getElementById('image-viewer-img');
    const closeBtn = document.getElementById('image-viewer-close');
    const overlay = document.getElementById('image-viewer-overlay');

    if (container) {
      container.addEventListener('click', (e) => {
        const imageContainer = e.target.closest('.message-image-container');
        if (imageContainer) {
          const imageData = imageContainer.dataset.image;
          if (viewerImg && viewer) {
            viewerImg.src = imageData;
            viewer.classList.add('show');
          }
        }
      });
    }

    const closeViewer = () => {
      if (viewer) viewer.classList.remove('show');
      if (viewerImg) viewerImg.src = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeViewer);
    if (overlay) overlay.addEventListener('click', closeViewer);
  }
};

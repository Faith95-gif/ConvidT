// Host Permissions Control Handler
class HostPermissionsManager {
  constructor(socket) {
    this.socket = socket;
    this.init();
  }

  init() {
    this.setupToggleHandlers();
    this.setupSocketListeners();
  }

  setupToggleHandlers() {
    // Find all permission toggle inputs
    const toggleInputs = document.querySelectorAll('.setting-item input[type="checkbox"]');
    
    toggleInputs.forEach(input => {
      const settingItem = input.closest('.setting-item');
      if (!settingItem) return;
      
      const settingText = settingItem.querySelector('span')?.textContent?.trim();
      
      // Handle hand raising permission toggle
      if (settingText === 'Allow hand raising') {
        input.addEventListener('change', (e) => {
          this.updateHandRaisingPermission(e.target.checked);
        });
      }
      
      // Handle other permissions as needed
      if (settingText === 'Allow chat') {
        input.addEventListener('change', (e) => {
          this.updateChatPermission(e.target.checked);
        });
      }
      
      if (settingText === 'Allow file sharing') {
        input.addEventListener('change', (e) => {
          this.updateFileSharingPermission(e.target.checked);
        });
      }
      
      if (settingText === 'Allow emoji reactions') {
        input.addEventListener('change', (e) => {
          this.updateEmojiReactionsPermission(e.target.checked);
        });
      }
      
      if (settingText === 'Allow rename') {
        input.addEventListener('change', (e) => {
          this.updateRenamePermission(e.target.checked);
        });
      }
      
      if (settingText === 'Allow unmute') {
        input.addEventListener('change', (e) => {
          this.updateUnmutePermission(e.target.checked);
        });
      }
    });
  }

  updateHandRaisingPermission(allowed) {
    if (this.socket) {
      this.socket.emit('update-meeting-permissions', {
        permissions: {
          allowHandRaising: allowed
        }
      });
      
      console.log(`Hand raising permission updated: ${allowed}`);
    }
  }

  updateChatPermission(allowed) {
    if (this.socket) {
      this.socket.emit('update-meeting-permissions', {
        permissions: {
          chatEnabled: allowed
        }
      });
    }
  }

  updateFileSharingPermission(allowed) {
    if (this.socket) {
      this.socket.emit('update-meeting-permissions', {
        permissions: {
          fileSharing: allowed
        }
      });
    }
  }

  updateEmojiReactionsPermission(allowed) {
    if (this.socket) {
      this.socket.emit('update-meeting-permissions', {
        permissions: {
          emojiReactions: allowed
        }
      });
    }
  }

  updateRenamePermission(allowed) {
    if (this.socket) {
      this.socket.emit('update-meeting-permissions', {
        permissions: {
          allowRename: allowed
        }
      });
    }
  }

  updateUnmutePermission(allowed) {
    if (this.socket) {
      this.socket.emit('update-meeting-permissions', {
        permissions: {
          allowUnmute: allowed
        }
      });
    }
  }

  setupSocketListeners() {
    this.socket.on('meeting-permissions-updated', (data) => {
      console.log('Meeting permissions updated:', data.permissions);
      
      // Update toggle states to reflect current permissions
      this.updateToggleStates(data.permissions);
      
      // Show notification
      if (data.changedBy) {
        this.showToast(`Meeting permissions updated by ${data.changedBy}`, 'info');
      }
    });

    this.socket.on('action-error', (data) => {
      this.showToast(data.message, 'error');
    });
  }

  updateToggleStates(permissions) {
    const toggleInputs = document.querySelectorAll('.setting-item input[type="checkbox"]');
    
    toggleInputs.forEach(input => {
      const settingItem = input.closest('.setting-item');
      if (!settingItem) return;
      
      const settingText = settingItem.querySelector('span')?.textContent?.trim();
      
      switch (settingText) {
        case 'Allow hand raising':
          input.checked = permissions.allowHandRaising;
          break;
        case 'Allow chat':
          input.checked = permissions.chatEnabled;
          break;
        case 'Allow file sharing':
          input.checked = permissions.fileSharing;
          break;
        case 'Allow emoji reactions':
          input.checked = permissions.emojiReactions;
          break;
        case 'Allow rename':
          input.checked = permissions.allowRename;
          break;
        case 'Allow unmute':
          input.checked = permissions.allowUnmute;
          break;
      }
    });
  }

  showToast(message, type = 'info') {
    // Check if a toast function exists in the global scope
    if (window.showToast && typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }
    
    const toast = document.createElement('div');
    toast.className = `host-toast host-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#10b981'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  }

  destroy() {
    // Remove event listeners if needed
    const toggleInputs = document.querySelectorAll('.setting-item input[type="checkbox"]');
    toggleInputs.forEach(input => {
      input.removeEventListener('change', this.updateHandRaisingPermission);
      input.removeEventListener('change', this.updateChatPermission);
      input.removeEventListener('change', this.updateFileSharingPermission);
      input.removeEventListener('change', this.updateEmojiReactionsPermission);
      input.removeEventListener('change', this.updateRenamePermission);
      input.removeEventListener('change', this.updateUnmutePermission);
    });

    // Remove socket listeners
    if (this.socket) {
      this.socket.off('meeting-permissions-updated');
      this.socket.off('action-error');
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HostPermissionsManager;
} else {
  window.HostPermissionsManager = HostPermissionsManager;
}
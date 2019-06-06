const SAVE_TIMEOUT = 1000;

export class UserStorage {
  constructor() {
    this.defaultSettings = {
      siteList: {
        "www.youtube.com": {
          url: "www.youtube.com",
          totalTime: 120 * 60 * 100,
          accumulatedTime: 0,
          sessionTotalTime: null,
          sessionStartTime: null,
          date: new Date().getDate()
        }
      }
    };
    this.settings = null;
    this.saveTimout = null;
  }

  async loadSettings() {
    this.settings = await this.loadSettingsFromStorage();
  }

  loadSettingsFromStorage() {
    return new Promise((resolve, reject) => {
      // If you send an object as a get query, when one of the keys wasn't found on storage.
      // Query's values are given as defaults
      chrome.storage.local.get(this.defaultSettings, localSettings => {
        resolve(localSettings);
      });
    });
  }
  async saveSettings() {
    const saved = await this.saveSettingsToStorage(this.settings);
    this.settings = saved;
  }
  saveSettingsToStorage(settings) {
    // Debounce saving for 1 second
    if (this.saveTimeout) {
      clearInterval(this.saveTimeout);
    }
    return new Promise(res => {
      this.saveTimeout = setTimeout(() => {
        this.saveTimeout = null;
        chrome.storage.local.set(settings, () => resolve(settings));
      }, SAVE_TIMEOUT);
    });
  }
  set(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

export default UserStorage;

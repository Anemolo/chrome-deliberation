export class ActiveTabsManager {
  constructor() {
    this.active = [];

    chrome.tabs.onActivated.addListener(this.onTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));
    chrome.windows.onRemoved.addListener(this.onWindowRemoved.bind(this));
  }
  onTabUpdated(id, updates, tab) {
    if (updates.url) {
      this.active = this.active
        .filter(curTab => curTab.id !== tab.id)
        .concat(tab);
    }
  }
  // onActivated only gives windowID and tabID. Not a tab
  onTabActivated(info) {
    chrome.tabs.get(info.tabId, tab => {
      this.active = this.active
        .filter(cur => cur.windowId !== tab.windowId)
        .concat(tab);
    });
  }
  onWindowRemoved({ windowId }) {
    this.active = this.active.filter(tab => tab.windowId !== windowId);
  }
  loadActiveTabs() {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true }, tabs => {
        this.active = tabs;
        resolve();
      });
    });
  }
}

export default ActiveTabsManager;

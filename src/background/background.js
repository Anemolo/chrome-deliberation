import { extractHostname } from "../utils/extractHostname";

import { UserStorage } from "./userStorage";
import { ActiveTabsManager } from "./activeTabsManager";
import { Messenger } from "./messenger";

const createGateInfo = url => {
  return {
    [url]: {
      url,
      totalTime: 120 * 60 * 100,
      accumulatedTime: 0,
      sessionTotalTime: null,
      sessionStartTime: null,
      date: new Date().getDate()
    }
  };
};
// const Storage = new UserStorage();
// Storage.loadSettings().then(() => console.log(Storage.settings));

const TICK_INTERVAL = 1000;

class Extension {
  constructor() {
    this.user = new UserStorage();
    this.tabs = new ActiveTabsManager();
    this.messenger = new Messenger(this.getMessengerAdapter());

    this.tick = this.tick = this.tick.bind(this);
    this.tickID = null;
  }
  async start() {
    await this.user.loadSettings();
    await this.tabs.loadActiveTabs();

    this.tickID = setInterval(this.tick, TICK_INTERVAL);
  }
  changeSettings(newSettings) {
    this.user.set(newSettings);
    this.onSettingsChanged(newSettings);
  }
  onSettingsChanged(changes) {
    this.messenger.publishChanges(changes);
  }
  getMessengerAdapter() {
    return {
      getData: async () => {
        return this.user.settings;
      },
      getSiteData: async ({ url }) => {
        return this.user.settings.siteList[url];
      },
      setGate: url => {
        const siteList = this.user.settings.siteList;
        let siteInfo = siteList[url];
        if (!siteInfo) {
          siteInfo = createGateInfo(url);
          this.changeSettings({ siteList: { ...siteList, ...siteInfo } });
          return { siteInfo };
        }

        return { info: "Already exists", siteInfo };
      },
      removeGate: url => {
        const siteList = { ...this.user.settings.siteList };
        let siteInfo = siteList[url];
        if (siteInfo) {
          delete siteList[url];
          this.changeSettings({ siteList });
          return {};
        }
        return { info: "Site doesn't exist" };
      }
    };
  }
  blockTab(tab) {
    const host = extractHostname(tab.url);

    // const data = this.gatedSitesData[host];
    // //Return if the site is not meant to be blocked or we are in a session
    // if (!data || data.sessionTotalTime) {
    //   return;
    // }

    // We only need to update the storage when the page needs to check it.
    //   updateSiteStorage(sites);
    chrome.tabs.update(
      tab.id,
      { url: "blocked.html?url=" + encodeURIComponent(tab.url) },
      tab => {
        console.log("blocked", tab);
      }
    );
  }
  tick() {
    const urls = Object.keys(this.user.settings.siteList);
    const tabs = this.tabs.active;
    const siteList = this.user.settings.siteList;
    for (let i = tabs.length - 1; i > -1; i--) {
      const tab = tabs[i];
      const host = extractHostname(tab.url);

      const data = siteList[host];

      if (!data) continue;
      if (data.date !== new Date().getDate()) {
        this.changeSettings({
          siteList: {
            ...siteList,
            [host]: { ...data, date: new Date().getDate(), accumulatedTime: 0 }
          }
        });
      }

      if (
        data.accumulatedTime > data.totalTime ||
        data.sessionTotalTime == null
      ) {
        this.blockTab(tab);
        console.log(host, "session");
        continue;
      }

      const nextSite = { ...siteList };

      if (!data.sessionStartTime) {
        // data = updateGatedData(data, cur => {
        //   cur.sessionStartTime = Date.now();
        //   return cur;
        // });
        // batchedChanges[host] = data;
        // didSomethingChange = true;
        this.user.set({
          siteList: {
            ...siteList,
            [host]: { ...data, sessionStartTime: Date.now() }
          }
        });
        continue;
      }

      const elapsed = Date.now() - data.sessionStartTime;
      if (data.sessionTotalTime <= elapsed) {
        console.log("SESSION ENDED");
        this.user.set({
          siteList: {
            ...siteList,
            [host]: {
              ...data,
              sessionStartTime: null,
              sessionTotalTime: null,
              accumulatedTime: data.accumulatedTime + data.sessionTotalTime
            }
          }
        });
        // data = updateGatedData(data, cur => {
        //   cur.accumulatedTime += cur.sessionTotalTime;
        //   cur.sessionTotalTime = null;
        //   cur.sessionStartTime = null;
        //   return cur;
        // });
        // batchedChanges[host] = data;
        // didSomethingChange = true;

        // this.blockTab(tab);
      }
    }
  }
}

const Deliberation = new Extension();
Deliberation.start();
// // Instead of checking the current date and resetting every gated site's accumulated time
// // All gated sites mantain their own date. Which we are going to check every time the site is accessed.
// // If the date is old, reset the accumulatedTime and set date to today

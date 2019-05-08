import { minutesToMiliseconds } from "./utils/timeOperations";
import { extractHostname } from "./utils/extractHostname";
import { orDefault } from "./utils/orDefault";
import {
  mapNullValuesWithGatedData,
  updateGatedData,
  createGatedData
} from "./utils/createGatedData";

let day = orDefault(localStorage.getItem("date"), new Date().getDate());

console.log("Background Here");

function updateSiteStorage(sites) {
  localStorage.setItem("sites", JSON.stringify(sites));
}
// Instead of checking the current date and resetting every gated site's accumulated time
// All gated sites mantain their own date. Which we are going to check every time the site is accessed.
// If the date is old, reset the accumulatedTime and set date to today

// This is more efficient because we avoid the loop, and we only update relevant items taking advantage of active tab check we already do.

let sites = JSON.parse(localStorage.getItem("sites"));

if (!sites) {
  sites = {
    "www.youtube.com": {
      totalTime: minutesToMiliseconds(120),
      accumulatedTime: 0,
      sessionTotalTime: null,
      sessionStartTime: null
    }
  };
  updateSiteStorage(sites);
}

let currentDate = 8;
if (day !== currentDate) {
  for (let key in sites) {
    let site = sites[key];
    site.accumulatedTime = 0;
  }
  updateSiteStorage(sites);
  localStorage.setItem("date", currentDate);
}

const state = {
  installed: null
};

function refreshSites() {
  sites = JSON.parse(localStorage.getItem("sites"));
}

function blockTab(tab) {
  const host = extractHostname(tab.url);

  const data = sites[host];
  //Return if the site is not meant to be blocked or we are in a session
  if (!data || data.sessionTotalTime) {
    return;
  }

  // We only need to update the storage when the page needs to check it.
  updateSiteStorage(sites);

  chrome.tabs.update(
    tab.id,
    { url: "blocked.html?url=" + encodeURIComponent(tab.url) },
    tab => {
      console.log("blocked", tab);
    }
  );
}

// chrome.storage.local.set({ number: 0 }, () => {
//   console.log("installed with data 1");
// });

// fetch sites and then fetch sites data.
// const siteList = [];
// const sitesData = {};
// const storageData = {
//   sites: [],
//   "youtube.com": {}
// };

// function addSite(name, data) {
//   data = {
//     totalTime: orDefault(data.totalTime, minutesToMiliseconds(120)),
//     accumulatedTime: 0,
//     sessionTotalTime: null,
//     sessionStartTime: null
//   };

//   chrome.storage.local.get("sites", result => {
//     const newSites = result.sites.concat(name);
//     crhome.storage.local.set({ sites: newSites, [name]: data });
//   });
// }

// function filterItemsWithNoData(arr, data) {
//   let res = [];
//   for (var i = 0; i < arr.length; i++) {
//     const key = arr[i];

//     if (data[key]) continue;
//     res.push(key);
//   }
//   return res;
// }

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//   let sitesWithNoData = [];
//   if (changes.sites) {
//     const changedSites = changes.sites.newValue;

//     let tempSites = changedSites;
//     sitesWithNoData = sitesWithNoData.contar(
//       filterItemsWithNoData(changedSites, sitesData)
//     );
//   }
//   // for (var key in changes) {
//   //   var storageChange = changes[key];
//   //   console.log(
//   //     'Storage key "%s" in namespace "%s" changed. ' +
//   //       'Old value was "%s", new value is "%s".',
//   //     key,
//   //     namespace,
//   //     storageChange.oldValue,
//   //     storageChange.newValue
//   //   );
//   // }
// });

// function timer() {
//   // chrome.storage.local.get("number", function(result) {
//   //   chrome.storage.local.set({ number: result.number + 1 });
//   //   chrome.storage.local.set({ test: { a: result.number + 1 } });
//   // });
//   chrome.tabs.query({ active: true }, tabs => {
//     refreshSites();

//     for (var i = tabs.length - 1; i > -1; i--) {
//       const tab = tabs[i];
//       const host = extractHostname(tab.url);

//       const data = sites[host];

//       if (!data) continue;

//       // We retroactivelly block tabs because after one tab has finished the session.
//       // the other ones dont get blocked
//       if (
//         data.accumulatedTime > data.totalTime ||
//         data.sessionTotalTime == null
//       ) {
//         blockTab(tab);
//         continue;
//       }

//       if (data.sessionTotalTime) {
//         if (!data.sessionStartTime) {
//           // In case the html doesnt start the session
//           data.sessionStartTime = Date.now();
//           updateSiteStorage(sites);
//         }
//         const elapsed = Date.now() - data.sessionStartTime;
//         console.log("Elapsed minutes", elapsed / 100 / 60);
//         if (data.sessionTotalTime <= elapsed) {
//           data.accumulatedTime += data.sessionTotalTime;
//           data.sessionTotalTime = null;
//           data.sessionStartTime = null;
//           updateSiteStorage(sites);
//           blockTab(tab);
//         }
//       }
//     }
//   });
// }
// setInterval(timer, 1000);

// Instead of getting all the tabs every tick

// Capture all active tabs initially
// Refresh by
// Using onActivated to replace active tabs in the same windowID
// Using onWindowClose or something like that de determine if the window of that tab was closed.
class Deliberate {
  constructor() {
    this.installed = false;
    this.activeTabs = [];
    this.intervalId = null;

    this.gatedSites = [];
    this.gatedSitesData = {};

    this.onTabCreated = tab => this.blockTab(tab);
    // Sometimes a replacement won't have the url set when this event is fired.
    this.onTabReplaced = tab => tab.url && this.blockTab(tab);
    // onActivated only gives windowID and tabID. Not a tab
    this.onTabActivatedInfo = info => {
      console.log("activated", info);
      chrome.tabs.get(info.tabId, this.onTabActivated.bind(this));
    };

    this.onTabUpdated = this.onTabUpdated.bind(this);
    this.onInstalled = this.onInstalled.bind(this);
    this.onWindowRemoved = this.onWindowRemoved.bind(this);
    this.onGetGatedSites = this.onGetGatedSites.bind(this);
    this.onGetGatedSitesData = this.onGetGatedSitesData.bind(this);
    this.blockTab = this.blockTab.bind(this);

    this.tick = this.tick.bind(this);
  }
  blockTab(tab) {
    const host = extractHostname(tab.url);

    const data = this.gatedSitesData[host];
    //Return if the site is not meant to be blocked or we are in a session
    if (!data || data.sessionTotalTime) {
      return;
    }

    // We only need to update the storage when the page needs to check it.
    //   updateSiteStorage(sites);

    console.log("tryingss", tab);
    // return;
    chrome.tabs.update(
      tab.id,
      { url: "blocked.html?url=" + encodeURIComponent(tab.url) },
      tab => {
        console.log("blocked", tab);
      }
    );
  }
  onInstalled() {
    this.installed = new Date();

    chrome.storage.local.set({ gatedSites: ["www.youtube.com"] });

    // Not sure if this is the way to do it. But the idea is to block all gated pages right after installation
    // chrome.tabs.query({ active: true }, tabs => {
    //   // Filter all useless tabs
    //   this.activeTabs = tabs;
    //   for (var i = tabs.length - 1; i > -1; i--) {
    //     blockTab(tabs[i]);
    //   }
    // });
  }
  onTabUpdated(id, updates, tab) {
    console.log("update", updates, tab);
    if (updates.url) {
      this.activeTabs = this.activeTabs
        .filter(curTab => curTab.id !== tab.id)
        .concat(tab);
      this.blockTab(tab);
    }
  }
  onTabActivated(tab) {
    // Check if tab url is relevant
    this.activeTabs = this.activeTabs
      .filter(curTab => curTab.windowId !== tab.windowId)
      .concat(tab);
    this.activeTabs.forEach(t => console.log(t.url));
    // console.log(this.activeTabs);
    this.blockTab(tab);
  }
  onWindowRemoved(windowId) {
    this.activeTabs = this.activeTabs.filter(tab => tab.windowId !== windowId);
  }
  onGetGatedSites({ gatedSites }) {
    gatedSites = ["www.youtube.com"];
    if (!gatedSites) {
      // If it doesnt exist, default it in the local storage.
      chrome.storage.local.set({ gatedSites: [] });
      return;
    }
    this.gatedSites = gatedSites;
    console.log(gatedSites);
    // TODO: only Fetch current tabs.
    chrome.storage.local.get(gatedSites, this.onGetGatedSitesData);
  }
  onGetGatedSitesData(data) {
    function getKeysWithNullData(keys, obj) {
      const nullKeys = [];
      for (var i = keys.length - 1; i > -1; i--) {
        const key = keys[i];
        if (!obj[key]) nullKeys.push(key);
      }
      return nullKeys;
    }

    const sitesWithNullData = getKeysWithNullData(this.gatedSites, data);

    const defaultedData = sitesWithNullData.reduce((res, site) => {
      res[site] = createGatedData(site);
      return res;
    }, {});

    // Add that data to the local storage.

    const result = Object.assign({}, data, defaultedData);
    this.gatedSitesData = result;

    chrome.storage.local.set(defaultedData);
  }
  init() {
    chrome.runtime.onInstalled.addListener(this.onInstalled);
    // Listeners

    chrome.tabs.onCreated.addListener(this.onTabCreated);
    chrome.tabs.onUpdated.addListener(this.onTabUpdated);
    chrome.tabs.onReplaced.addListener(this.onTabReplaced);
    chrome.tabs.onActivated.addListener(this.onTabActivatedInfo);

    chrome.windows.onRemoved.addListener(windowId => {
      this.activeTabs = this.activeTabs.filter(
        tab => tab.windowId !== windowId
      );
    });

    // Storage Stuff
    chrome.storage.local.get("gatedSites", this.onGetGatedSites);

    // Get Current active tabs
    chrome.tabs.query({ active: true }, tabs => {
      this.activeTabs = tabs;
      for (var i = tabs.length - 1; i > -1; i--) {
        this.blockTab(tabs[i]);
      }
    });

    this.intervalId = setInterval(this.tick, 1000);
  }
  tick() {
    const tabs = this.activeTabs;

    let didSomethingChange = false;
    const batchedChanges = {};
    for (var i = tabs.length - 1; i > -1; i--) {
      const tab = tabs[i];
      // TODO: Use hosts or domains.
      const host = extractHostname(tab.url);

      const data = this.gatedSitesData[host];

      if (!data) continue;

      // We retroactivelly block tabs because after one tab has finished the session.
      // the other ones dont get blocked
      if (
        data.accumulatedTime > data.totalTime ||
        data.sessionTotalTime == null
      ) {
        this.blockTab(tab);
        continue;
      }

      if (!data.sessionTotalTime) continue;

      if (!data.sessionStartTime) {
        data = updateGatedData(data, cur => {
          cur.sessionStartTime = Date.now();
          return cur;
        });
        batchedChanges[host] = data;
        didSomethingChange = true;
        continue;
        //   updateSiteStorage(sites);
      }

      const elapsed = Date.now() - data.sessionStartTime;
      if (data.sessionTotalTime <= elapsed) {
        data = updateGatedData(data, cur => {
          cur.accumulatedTime += cur.sessionTotalTime;
          cur.sessionTotalTime = null;
          cur.sessionStartTime = null;
          return cur;
        });
        batchedChanges[host] = data;
        didSomethingChange = true;
        this.blockTab(tab);
      }
    }
    if (didSomethingChange) {
      chrome.storage.local.set(batchedChanges);
    }
  }
}

const DeliberateExtension = new Deliberate();
DeliberateExtension.init();

// chrome.runtime.onInstalled.addListener(function() {
//   state.installed = new Date();

//   chrome.tabs.query({ active: true }, tabs => {
//     for (var i = tabs.length - 1; i > -1; i--) {
//       blockTab(tabs[i]);
//     }
//   });
// });
// chrome.windows.onRemoved.addListener(windowId => {
//   console.log("removed", windowId);
// });
// chrome.tabs.onCreated.addListener(tab => {
//   blockTab(tab);
// });

// chrome.tabs.onUpdated.addListener((id, info, tab) => {
//   if (info.url) {
//     blockTab(tab);
//   }
// });
// chrome.tabs.onReplaced.addListener(tab => {
//   if (info.url) {
//     console.log("replaced");
//     blockTab(tab);
//   }
// });

// chrome.tabs.onActivated.addListener(info => {
//   console.log("tab activated", Date.now(), info);
//   chrome.tabs.get(info.tabId, blockTab);
// });

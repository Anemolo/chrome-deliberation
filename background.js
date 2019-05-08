// function extractHostname(url) {
//   var siteHostname;
//   //find & remove protocol (http, ftp, etc.) and get siteHostname

//   if (url.indexOf("//") > -1) {
//     siteHostname = url.split("/")[2];
//   } else {
//     siteHostname = url.split("/")[0];
//   }

//   //find & remove port number
//   siteHostname = siteHostname.split(":")[0];
//   //find & remove "?"
//   siteHostname = siteHostname.split("?")[0];

//   return siteHostname;
// }
// const log = (...args) => console.log("DELIBERATE: ", ...args);
// const milisecondsInASecond = 1000;
// const secondsInAMinute = 60;
// const minutesInAnHour = 60;

// const secondsToMiliseconds = seconds => seconds * milisecondsInASecond;
// const minutesToSeconds = minutes => minutes * secondsInAMinute;

// const minutesToMiliseconds = minutes =>
//   secondsToMiliseconds(minutesToSeconds(minutes));

// chrome.storage.local.onChanged.addListener(function(changes, namespace) {
//   for (var key in changes) {
//     var storageChange = changes[key];
//     console.log(
//       'Storage key "%s" in namespace "%s" changed. ' +
//         'Old value was "%s", new value is "%s".',
//       key,
//       namespace,
//       storageChange.oldValue,
//       storageChange.newValue
//     );
//   }
// });

let day = localStorage.getItem("date") || new Date().getDate();

let sites = JSON.parse(localStorage.getItem("sites"));
console.log("reload");

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
  console.log(sites);
  for (let key in sites) {
    let site = sites[key];
    site.accumulatedTime = 0;
  }
  console.log(sites);
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
  log("should I block ->", host, "with data->", data);
  //Return if the site is not meant to be blocked or we are in a session
  if (!data || data.sessionTotalTime) {
    log("NO");
    return;
  }

  log("YES");
  // We only need to update the storage when the page needs to check it.
  updateSiteStorage(sites);

  chrome.tabs.update(
    tab.id,
    { url: "blocked.html?url=" + encodeURIComponent(tab.url) },
    tab => {
      log("blocked", tab);
    }
  );
}

// chrome.storage.local.set({ number: 0 }, () => {
//   log("installed with data 1");
// });

// fetch sites and then fetch sites data.
const siteList = [];
const sitesData = {};
const storageData = {
  sites: [],
  "youtube.com": {}
};

console.log("new2");

function orDefault(value, defaultValue) {
  return value == null ? defaultValue : value;
}
function addSite(name, data) {
  data = {
    totalTime: orDefault(data.totalTime, minutesToMiliseconds(120)),
    accumulatedTime: 0,
    sessionTotalTime: null,
    sessionStartTime: null
  };

  chrome.storage.local.get("sites", result => {
    const newSites = result.sites.concat(name);
    crhome.storage.local.set({ sites: newSites, [name]: data });
  });
}
function filterItemsWithNoData(arr, data) {
  let res = [];
  for (var i = 0; i < arr.length; i++) {
    const key = arr[i];

    if (data[key]) continue;
    res.push(key);
  }
  return res;
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  let sitesWithNoData = [];
  if (changes.sites) {
    const changedSites = changes.sites.newValue;

    let tempSites = changedSites;
    sitesWithNoData = sitesWithNoData.contar(
      filterItemsWithNoData(changedSites, sitesData)
    );
  }
  log(changes);
  // for (var key in changes) {
  //   var storageChange = changes[key];
  //   console.log(
  //     'Storage key "%s" in namespace "%s" changed. ' +
  //       'Old value was "%s", new value is "%s".',
  //     key,
  //     namespace,
  //     storageChange.oldValue,
  //     storageChange.newValue
  //   );
  // }
});

function timer() {
  // chrome.storage.local.get("number", function(result) {
  //   console.log("get value currently is " + result.number);
  //   chrome.storage.local.set({ number: result.number + 1 });
  //   chrome.storage.local.set({ test: { a: result.number + 1 } });
  // });
  chrome.tabs.query({ active: true }, tabs => {
    // log("timer");
    refreshSites();

    for (var i = tabs.length - 1; i > -1; i--) {
      const tab = tabs[i];
      const host = extractHostname(tab.url);

      const data = sites[host];

      if (!data) continue;

      // We retroactivelly block tabs because after one tab has finished the session.
      // the other ones dont get blocked
      if (
        data.accumulatedTime > data.totalTime ||
        data.sessionTotalTime == null
      ) {
        blockTab(tab);
        continue;
      }

      if (data.sessionTotalTime) {
        if (!data.sessionStartTime) {
          // In case the html doesnt start the session
          data.sessionStartTime = Date.now();
          updateSiteStorage(sites);
        }
        const elapsed = Date.now() - data.sessionStartTime;
        log("elapsed minutes", elapsed / 100 / 60);
        if (data.sessionTotalTime <= elapsed) {
          data.accumulatedTime += data.sessionTotalTime;
          data.sessionTotalTime = null;
          data.sessionStartTime = null;
          updateSiteStorage(sites);
          blockTab(tab);
        }
      }
    }
  });
}
setInterval(timer, 1000);

chrome.runtime.onInstalled.addListener(function() {
  state.installed = new Date();

  chrome.tabs.query({ active: true }, tabs => {
    for (var i = tabs.length - 1; i > -1; i--) {
      blockTab(tabs[i]);
    }
  });
});

chrome.tabs.onCreated.addListener(tab => {
  blockTab(tab);
});

chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (info.url) {
    blockTab(tab);
  }
});
chrome.tabs.onReplaced.addListener(tab => {
  if (info.url) {
    blockTab(tab);
  }
});

chrome.tabs.onActivated.addListener(info => {
  chrome.tabs.get(info.tabId, blockTab);
});

import { minutesToMiliseconds } from "./utils/timeOperations";

// All my data should have an _updatedId

function generateUpdateId() {
  return Math.floor(new Date() * Math.random());
}

export function createDefaultGatedSites(arr = []) {
  return {
    _updateId: generateUpdateId(),
    arr
  };
}

function createGatedData({ url, totalMinutes }) {
  totalMinutes = !isNaN(totalMinutes) && totalMinutes > 0 ? totalMinutes : 120;
  return {
    url,
    totalTime: minutesToMiliseconds(totalMinutes),
    accumulatedTime: 0,
    sessionTotalTime: null,
    sessionStartTime: null,
    _updateId: generateUpdateId(),
    date: new Date().getDate()
  };
}

export function getSitesData(urls) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(urls, result => {
      if (Array.isArray(urls)) {
        const data = {};
        // If the item is not found, the result wont even show it
        for (var i = urls.length - 1; i > -1; i--) {
          const url = urls[i];
          data[url] = result[url];
        }
        resolve(data);
        return;
      }
      // It is an string
      resolve({ [urls]: result[urls] });
    });
  });
}

export function setSitesData(object) {
  console.log("set");
  return new Promise((resolve, reject) => {
    // Check that the object has the right shape.
    chrome.storage.local.set(object, () => {
      if (chrome.runtime.lastError)
        reject({ error: chrome.runtime.lastError.message });
      resolve(object);
    });
  });
}

// Should ensure that *important* properties follow the schema
function setToLocalStorage(data) {
  return new Promise((resolve, reject) => {
    for (var key in data) {
      data[key]._updateId = generateUpdateId();
    }
    console.log("XXXXX setting", data);
    chrome.storage.local.set(data, function() {
      console.log("XXXXXXXX done");
      //   if (chrome.runtime.lastError)
      //     reject({ error: chrome.runtime.lastError.message });
      resolve(data);
    });
  });
}
// chrome.storage.local.set({ test: "" }, function() {
//   console.log("done");
// });
export function addSiteGate(site, options = {}) {
  console.log("adding site", site);
  // Make sure site is a valid url or host.
  // check for site existance
  return getGatedSitesList().then(function(gatedSites) {
    console.log("list", gatedSites);
    if (gatedSites.arr.indexOf(site) > -1) {
      // Allready Exist
      return Promise.reject({
        message: "Site " + site + " is already beign gated"
      });
    }

    const storageData = {
      gatedSites: gatedSites.arr.concat(site),
      [site]: createGatedData({
        url: site,
        totalMinutes: options.totalMinutes
      })
    };

    return setToLocalStorage(storageData);

    // If it deos not exist,
  });
}
// addSiteGate("www.twitter.com")
//   .then(c => console.log("ended with", c))
//   .catch(err => console.warn(err.message));
// Ensures that gatedSites exists in storage
export function getGatedSitesList() {
  const val = ~~(Math.random() * 100);
  console.log(val, "needList");
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("gatedSites", ({ gatedSites }) => {
      console.log(val, "list is", gatedSites);
      if (!gatedSites) {
        gatedSites = createDefaultGatedSites(["www.youtube.com", "test.com"]);
        console.log(val, "Creating new List", gatedSites);
        // chrome.storage.local.set({ gatedSites });

        return resolve(
          setToLocalStorage({ gatedSites }).then(storageData => {
            console.log(val, "Returning", storageData.gatedSites);
            return storageData.gatedSites;
          })
        );
      }
      resolve(gatedSites);
    });
  });
}

// class gatedStorageListener {
//   constructor({}) {}
// }

export class storageItemListener {
  constructor({ items, onItemChange }) {
    // Items can be array or string
    this.items = items;
    this.onItemChange = onItemChange;
    this.onChange = this.onChange.bind(this);
  }
  setItems(newItems) {
    this.items = items;
  }
  isAnItem(itemToCheck) {
    if (Array.isArray(this.items)) {
      return this.items.indexOf(itemToCheck) > -1;
    }
    return itemToCheck === this.items;
  }
  onChange(changes, namespace) {
    console.log("change", changes, namespace);
    for (var key in changes) {
      if (this.isAnItem(key)) {
        this.onItemChange(changes[key], key);
      }
    }
  }
  init() {
    chrome.storage.onChanged.addListener(this.onChange);
    // chrome.storage.onChanged.addListener(function(changes, namespace) {
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
  }
}

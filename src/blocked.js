import { getSitesData, setSitesData, storageItemListener } from "./storage";
import {
  minutesToMiliseconds,
  milisecondsToHourFormat,
  milisecondsToMinutes
} from "./utils/timeOperations";
import { updateGatedData } from "./utils/createGatedData";
import { extractHostname } from "./utils/extractHostname";

function getBlockedUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("url");
}

function redirect(url) {
  // Removes current extension url from history
  window.location.replace(url);
}
class Blocked {
  constructor() {
    this.url = null;
    this.host = null;
    this.data = null;
    this.storageListener = null;
    this.viewId = null;
    this.cleaners = [];

    this.onSiteData = this.onSiteData.bind(this);
    this.onDataChange = this.onDataChange.bind(this);
  }
  onDataChange(data) {
    // Check if the update happend somewhere else.
    if (data.newValue._updateId !== this.data._updateId) {
      this.onSiteData({ [this.host]: data.newValue }, true);
    } else {
      console.log("Update from blocked.js");
    }
  }
  onSiteData(res, refresh = false) {
    const data = res[this.host];

    this.data = data;

    console.log("onSiteData", this.host, this.data);
    if (!data) {
      // This page was removed of block
      // Or this page was wrongly blocked.
      console.log("no Data");
      return;
    }
    const timeRemaining = data.totalTime - data.accumulatedTime;
    if (timeRemaining > 0) {
      this.setView("gated");
      this.onGated(timeRemaining);
    } else {
      this.setView("blocked");
      this.onBlocked();
    }
  }
  clean() {
    for (var i = 0; i < this.cleaners.length; i++) {
      this.cleaners[i]();
    }
    this.cleaners = [];
  }
  setView(newViewId, refresh = false) {
    if (this.viewId !== newViewId && !refresh) {
      this.clean();
      const views = Array.from(document.getElementsByClassName("view"));
      for (var i = 0; i < views.length; i++) {
        const view = views[i];
        if (view.id === newViewId) {
          view.classList.remove("hidden");
        } else {
          view.classList.add("hidden");
        }
      }
    }
  }
  onGated(timeRemaining) {
    const timeElapsed = document.getElementById("time-elapsed");
    const timeTotal = document.getElementById("time-total");
    const timeRemainingEle = document.getElementById("time-remaining");
    const gatedWrapper = document.getElementById("gated");

    timeElapsed.innerHTML = milisecondsToHourFormat(this.data.accumulatedTime);
    timeTotal.innerHTML = milisecondsToHourFormat(this.data.totalTime);
    timeRemainingEle.innerHTML = milisecondsToMinutes(timeRemaining);

    // Calculate session times
    const sessionTimes = [1, 40];
    const buttons = Array.from(
      gatedWrapper.getElementsByClassName("btn-session")
    );
    buttons.forEach((btn, i) => {
      const minutesEle = btn.children["btn-session-minutes"];
      minutesEle.innerHTML = sessionTimes[i];
      const listener = () => {
        updateGatedData(this.data, data => {
          data.sessionTotalTime = minutesToMiliseconds(sessionTimes[i]);
          return data;
        });

        const data = { [this.host]: this.data };
        console.log("setting", data);
        setSitesData(data);
        // redirect(this.url);
      };
      btn.addEventListener("click", listener);
      this.cleaners.push(function() {
        btn.removeEventListener("click", listener);
      });
    });
  }
  onBlocked() {
    //  blocked
  }
  init() {
    const url = getBlockedUrl();
    this.url = url;
    this.host = extractHostname(url);

    this.storageListener = new storageItemListener({
      items: this.host,
      onItemChange: this.onDataChange
    });
    this.storageListener.init();

    this.setView("loading");
    getSitesData(this.host).then(this.onSiteData);
  }
}

const app = new Blocked();
app.init();
// function init() {
//   const url = getBlockedUrl();
//   this.url = getBlockedUrl();

//   const host = extractHostname(url);
//   const data = sites[host];
//   if (!data) {
//     redirect(url);
//     console.error(
//       "This website has not data in localStorage. Maybe it got wrongly blocked or the date is not getting saved correctly "
//     );
//   }

//   if (data.sessionTotalTime != null) {
//     redirect(url);
//   }
//   const timeRemaining = data.totalTime - data.accumulatedTime;
//   if (timeRemaining > 0) {
//     // Gate the user
//     const timeElapsed = document.getElementById("time-elapsed");
//     timeElapsed.innerHTML = milisecondsToHourFormat(data.accumulatedTime);
//     const timeTotal = document.getElementById("time-total");
//     timeTotal.innerHTML = milisecondsToHourFormat(data.totalTime);
//     const timeRemainingEle = document.getElementById("time-remaining");
//     timeRemainingEle.innerHTML = milisecondsToMinutes(timeRemaining);
//     blockedEle.classList.add("hidden");
//     gatedEle.classList.remove("hidden");

//     const sessionTimes = [25, 40];

//     const buttons = Array.from(gatedEle.getElementsByClassName("btn-session"));
//     buttons.forEach((btn, i) => {
//       const minutesEle = btn.children["btn-session-minutes"];
//       minutesEle.innerHTML = sessionTimes[i];

//       btn.addEventListener("click", function() {
//         sites[host].sessionTotalTime = minutesToMiliseconds(sessionTimes[i]);
//         updateSiteStorage(sites);
//         redirect(url);
//       });
//     });
//   } else {
//     // block the user
//     blockedEle.classList.remove("hidden");
//     gatedEle.classList.add("hidden");
//   }
// }

// const mountGate = () => {};

// const mountBlocked = () => {};

// init();

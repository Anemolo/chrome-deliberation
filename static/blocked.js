var sites = JSON.parse(localStorage.getItem("sites"));
let app = document.getElementById("app");
let blockedEle = document.getElementById("blocked");
let gatedEle = document.getElementById("gated");

function redirect(url) {
  // Removes current extension url from history
  window.location.replace(url);
}
function init() {
  const urlParams = new URLSearchParams(window.location.search);

  const url = urlParams.get("url");

  const host = extractHostname(url);
  const data = sites[host];
  if (!data) {
    redirect(url);
    console.error(
      "This website has not data in localStorage. Maybe it got wrongly blocked or the date is not getting saved correctly "
    );
  }

  if (data.sessionTotalTime != null) {
    redirect(url);
  }
  const timeRemaining = data.totalTime - data.accumulatedTime;
  if (timeRemaining > 0) {
    // Gate the user
    const timeElapsed = document.getElementById("time-elapsed");
    timeElapsed.innerHTML = milisecondsToHourFormat(data.accumulatedTime);
    const timeTotal = document.getElementById("time-total");
    timeTotal.innerHTML = milisecondsToHourFormat(data.totalTime);
    const timeRemainingEle = document.getElementById("time-remaining");
    timeRemainingEle.innerHTML = milisecondsToMinutes(timeRemaining);
    blockedEle.classList.add("hidden");
    gatedEle.classList.remove("hidden");

    const sessionTimes = [25, 40];

    const buttons = Array.from(gatedEle.getElementsByClassName("btn-session"));
    buttons.forEach((btn, i) => {
      const minutesEle = btn.children["btn-session-minutes"];
      minutesEle.innerHTML = sessionTimes[i];

      btn.addEventListener("click", function() {
        sites[host].sessionTotalTime = minutesToMiliseconds(sessionTimes[i]);
        updateSiteStorage(sites);
        redirect(url);
      });
    });
  } else {
    // block the user
    blockedEle.classList.remove("hidden");
    gatedEle.classList.add("hidden");
  }
}

const mountGate = () => {};

const mountBlocked = () => {};

init();

"use strict";

function extractHostname(url) {
  var siteHostname;
  //find & remove protocol (http, ftp, etc.) and get siteHostname

  if (url.indexOf("//") > -1) {
    siteHostname = url.split("/")[2];
  } else {
    siteHostname = url.split("/")[0];
  }

  //find & remove port number
  siteHostname = siteHostname.split(":")[0];
  //find & remove "?"
  siteHostname = siteHostname.split("?")[0];

  return siteHostname;
}

function updateSiteStorage(sites) {
  localStorage.setItem("sites", JSON.stringify(sites));
}

const log = (...args) => console.log("DELIBERATE: ", ...args);
const milisecondsInASecond = 1000;
const secondsInAMinute = 60;
const minutesInAnHour = 60;

const secondsToMiliseconds = seconds => seconds * milisecondsInASecond;
const minutesToSeconds = minutes => minutes * secondsInAMinute;

const milisecondsToSeconds = miliseconds => miliseconds / milisecondsInASecond;
const secondsToMinutes = seconds => seconds / secondsInAMinute;
const minutesToHours = minutes => minutes / minutesInAnHour;
const milisecondsToMinutes = miliseconds =>
  secondsToMinutes(milisecondsToSeconds(miliseconds));

const milisecondsToHourFormat = miliseconds => {
  const totalMinutes = Math.floor(milisecondsToMinutes(miliseconds));
  let hours = Math.floor(minutesToHours(totalMinutes)).toString();
  let minutes = (totalMinutes % minutesInAnHour).toString();
  if (hours.length === 1) {
    hours = "0" + hours;
  }
  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }
  return `${hours}:${minutes}`;
};

const minutesToMiliseconds = minutes =>
  secondsToMiliseconds(minutesToSeconds(minutes));

// exports.utils = {
//   extractHostname,
//   minutesToMiliseconds,
//   minutesToSeconds,
//   secondsToMiliseconds
// };

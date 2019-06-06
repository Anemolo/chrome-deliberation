import { minutesToMiliseconds } from "./timeOperations";

function generateUpdateId() {
  return Math.floor(new Date() * Math.random());
}

export function updateGatedData(obj, cb) {
  obj._updateId = Date.now() * Math.random();
  return cb(obj);
}

export function createDefaultGatedSites(arr = []) {
  return {
    _updateId: generateUpdateId(),
    arr
  };
}

export function createGatedData({ url, totalMinutes }) {
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

export function mapNullValues(obj, cb) {
  const result = {};
  // If any of the items don't have data. Make a default
  for (var key in obj) {
    const data = obj[key];
    if (!data) {
      result[key] = cb(key);
    }
  }
  return result;
}

export function mapNullValuesWithGatedData(data) {
  return mapNullValues(data, createGatedData);
}

// const dataSchema = {
//   "www.youtube.com": {
//     totalTime: minutesToMiliseconds(120),
//     accumulatedTime: 0,
//     sessionTotalTime: null,
//     sessionStartTime: null,
//     date: new Date().getDate()
//   }
// };

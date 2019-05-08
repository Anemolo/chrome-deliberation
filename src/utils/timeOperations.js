const milisecondsInASecond = 1000;
const secondsInAMinute = 60;
const minutesInAnHour = 60;

export var secondsToMiliseconds = seconds => seconds * milisecondsInASecond;
export var minutesToSeconds = minutes => minutes * secondsInAMinute;

export var milisecondsToSeconds = miliseconds =>
  miliseconds / milisecondsInASecond;
export var secondsToMinutes = seconds => seconds / secondsInAMinute;
export var minutesToHours = minutes => minutes / minutesInAnHour;
export var milisecondsToMinutes = miliseconds =>
  secondsToMinutes(milisecondsToSeconds(miliseconds));

export var milisecondsToHourFormat = miliseconds => {
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

export var minutesToMiliseconds = minutes =>
  secondsToMiliseconds(minutesToSeconds(minutes));

export var test = () => {
  console.log("test");
};

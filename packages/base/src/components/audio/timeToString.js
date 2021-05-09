export default function timeToString(timeinterval) {
  let timeString = '';
  const seconds = Math.round(timeinterval) % 60;
  timeString = twoDigitString(seconds);
  timeinterval = Math.floor(timeinterval / 60);
  if (timeinterval <= 0) {
    return `00:${timeString}`;
  }
  const mins = timeinterval % 60;
  timeString = `${twoDigitString(mins)}:${timeString}`;
  timeinterval = Math.floor(timeinterval / 60);
  if (timeinterval <= 0) {
    return timeString;
  }
  const hours = timeinterval % 24;
  return `${twoDigitString(hours)}:${timeString}`;
}

function twoDigitString(digital) {
  if (digital < 10) {
    return `0${digital}`;
  } else {
    return digital.toString();
  }
}

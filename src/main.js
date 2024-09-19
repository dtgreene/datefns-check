import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';

import './styles.css';

const DEFAULT_TZ = 'America/Chicago';

const timestampInput = document.getElementById('timestamp-input');
const timezoneInput = document.getElementById('timezone-input');
const convertButton = document.getElementById('convert-button');
convertButton.addEventListener('click', handleConvertClick);
const result = document.getElementById('result');

const params = new URLSearchParams(location.search);
if (params.get('timestamp')) {
  timestampInput.value = params.get('timestamp');
}

if (params.get('timezone')) {
  timezoneInput.value = params.get('timezone');
}

if (timestampInput.value && timezoneInput.value) {
  handleConvertClick();
}

function formatGeoTimestamp(
  timestamp,
  zone = DEFAULT_TZ,
  outputFormat = 'MM/dd/yy h:mm a z'
) {
  if (!timestamp) {
    return '-';
  }

  return formatInTimeZone(parseISO(timestamp), zone, outputFormat);
}

function handleConvertClick() {
  try {
    result.className = '';
    result.innerHTML = `Result: ${formatGeoTimestamp(
      timestampInput.value,
      timezoneInput.value
    )}`;
  } catch (error) {
    result.className = 'text-red-400 max-w-[450px]';
    result.innerHTML = `Conversion error: ${error.message}`;
  }
}

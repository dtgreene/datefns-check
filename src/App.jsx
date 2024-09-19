import { useEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { javascript } from '@codemirror/lang-javascript';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import ReactCodeMirror from '@uiw/react-codemirror';
import * as DateFnsTz from 'date-fns-tz';
import * as DateFns from 'date-fns';

window.DateFnsTz = DateFnsTz;
window.DateFns = DateFns;

const defaultCode = `// window.DateFns
// window.DateFnsTZ

window.convertTimestamp = (timestamp, timeZone) => {
  const { formatInTimeZone } = window.DateFnsTz;
  const { parseISO } = window.DateFns;
  
  const parsedTimestamp = parseISO(timestamp);
  const outputFormat = 'MM/dd/yy h:mm a z';
  
  return formatInTimeZone(
    parsedTimestamp, 
    timeZone, 
    outputFormat
  );
}
`;

const params = new URLSearchParams(location.search);
const state = proxy({
  timestamp: params.get('timestamp') ?? new Date().toISOString(),
  timeZone: params.get('timeZone') ?? 'America/Chicago',
  code: params.get('code') ?? defaultCode,
  codeError: null,
  result: null,
});

function handleTimestampChange(event) {
  state.timestamp = event.target.value;
}

function handleTimeZoneChange(event) {
  state.timeZone = event.target.value;
}

function handleConvertClick() {
  if (state.timestamp && state.timeZone) {
    // Update query params
    const newParams = new URLSearchParams({
      timestamp: state.timestamp,
      timeZone: state.timeZone,
      code: state.code,
    });
    const { protocol, host, pathname } = window.location;
    const path = `${protocol}//${host}${pathname}?${newParams}`;

    window.history.pushState({ path }, '', path);

    try {
      window.eval(state.code);
      state.result = window.convertTimestamp(state.timestamp, state.timeZone);
      state.codeError = null;
    } catch (error) {
      state.result = null;
      state.codeError = `Eval failed: ${error.message}`;
    }
  }
}

function handleCodeChange(value) {
  state.code = value;
}

export const App = () => {
  const snap = useSnapshot(state, { sync: true });

  useEffect(() => {
    if (state.timestamp && state.timeZone && state.code) {
      handleConvertClick();
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl mb-8 text-center">date-fns-tz converter</div>
      <div className="flex justify-center gap-8 flex-wrap max-w-[1200px]">
        <div className="flex-1">
          <ReactCodeMirror
            extensions={[javascript()]}
            theme={tokyoNight}
            minHeight="200px"
            className="mb-8 md:min-w-[700px]"
            value={snap.code}
            onChange={handleCodeChange}
          />
          {snap.codeError && (
            <div className="text-red-300 p-4 border border-red-300">
              {snap.codeError}
            </div>
          )}
          {snap.result && (
            <div className="p-4 border">Result: {snap.result}</div>
          )}
        </div>
        <div className="flex gap-4 flex-col w-[350px]">
          <div className="flex gap-4 items-center">
            <div className="w-[100px]">Timestamp:</div>
            <input
              type="text"
              className="text-inherit bg-transparent border border-zinc-600 px-2 py-1 rounded text-sm flex-1"
              value={snap.timestamp}
              onChange={handleTimestampChange}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-[100px]">Time Zone:</div>
            <input
              type="text"
              className="text-inherit bg-transparent border border-zinc-600 px-2 py-1 rounded text-sm flex-1"
              value={snap.timeZone}
              onChange={handleTimeZoneChange}
            />
          </div>
          <button
            className="bg-sky-600 rounded px-2 py-1 hover:bg-sky-800 transition-colors"
            onClick={handleConvertClick}
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );
};

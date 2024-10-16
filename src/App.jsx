import { useEffect, Fragment } from 'react';
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

window.dateExec = () => {
  const { formatInTimeZone } = window.DateFnsTz;
  const { parseISO } = window.DateFns;

  const timestamp = parseISO('2024-09-19T18:47:55.842Z');
  const timeZone = 'America/Phoenix';
  const outputFormat = 'MM/dd/yy h:mm a z';
  
  return formatInTimeZone(
    timestamp, 
    timeZone, 
    outputFormat
  );
}
`;

const params = new URLSearchParams(location.search);
const state = proxy({
  code: params.get('code') ?? defaultCode,
  codeError: null,
  result: null,
});

function handleExecuteClick() {
  // Update query params
  const newParams = new URLSearchParams({
    code: state.code,
  });
  const { protocol, host, pathname } = window.location;
  const path = `${protocol}//${host}${pathname}?${newParams}`;

  window.history.pushState({ path }, '', path);

  try {
    window.eval(state.code);
    state.result = window.dateExec(state.timestamp, state.timeZone);
    state.codeError = null;
  } catch (error) {
    state.result = null;
    state.codeError = `Eval failed: ${error.message}`;
  }
}

function handleCodeChange(value) {
  state.code = value;
}

export const App = () => {
  const snap = useSnapshot(state, { sync: true });

  useEffect(() => {
    if (state.code) {
      handleExecuteClick();
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl mb-8 text-center">date-fns-tz converter</div>
      <div className="flex-1 md:w-[600px]">
        <ReactCodeMirror
          extensions={[javascript()]}
          theme={tokyoNight}
          minHeight="200px"
          className="mb-4 w-full"
          value={snap.code}
          onChange={handleCodeChange}
        />
        <div className="mb-8">
          <button
            className="bg-sky-600 rounded px-2 py-1 hover:bg-sky-800 transition-colors w-full"
            onClick={handleExecuteClick}
          >
            Execute
          </button>
        </div>
        {snap.codeError ? (
          <div className="text-red-300 p-4 border border-red-300">
            {snap.codeError}
          </div>
        ) : (
          <Fragment>
            {typeof snap.result === 'string' ? (
              <div className="p-4 border">Result: {snap.result}</div>
            ) : (
              <div className="p-4 border">
                Result: Invalid return type; must be a string
              </div>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

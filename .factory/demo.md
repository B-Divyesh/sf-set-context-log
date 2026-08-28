# Demo sandbox

- Entry points: `https://set-context-log.sociobot.in/?demo=1` and
  `https://set-context-log.sociobot.in/demo`.
- Sample: six sets across four sessions for Back squat, Bench press, and
  Deadlift. The selected Back squat shows previous-session context on entry.
- Storage: demo records use IndexedDB `demo:set-context-log`. If IndexedDB is
  unavailable, they use localStorage keys prefixed with `demo:`.
- Reset: **Reset demo** clears only the demo namespace and restores the six
  sample sets.
- Exit: **Start for real** clears the demo namespace before opening `/`. The
  real `set-context-log` database is never opened while demo mode is active.

ts-node ./src/index.ts &
PID_OBSERVER=$!
sleep 5
kill -15 $PID_OBSERVER;
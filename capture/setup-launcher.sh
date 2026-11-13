#!/bin/zsh
# Gets an emulator's launcher ready for `npm run capture`: the three app widgets, each on a page of its own and
# grown to fill it, and no suggested apps in the bottom row. Emulator only; run it after every cold boot of an
# emulator started without saving its snapshot (-no-snapshot-save).
#   capture/setup-launcher.sh phone|tablet
# Needs the app and its test APK from the same build (README 「다시 찍는 방법」).
set -e
DEVICE=$1
[[ "$DEVICE" == phone || "$DEVICE" == tablet ]] || { echo "usage: capture/setup-launcher.sh phone|tablet"; exit 2; }
ADB=${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb
SERIAL=$($ADB devices | awk '$1 ~ /^emulator-[0-9]+$/ && $2 == "device" {print $1}')
[[ $(echo "$SERIAL" | grep -c .) == 1 ]] || { echo "켜져 있는 에뮬레이터가 정확히 하나여야 한다: $SERIAL"; exit 1; }
export ANDROID_SERIAL=$SERIAL
A=$ADB
[[ "$($A shell getprop ro.hardware | tr -d '\r')" =~ ranchu\|goldfish ]] || { echo "에뮬레이터가 아니다"; exit 1; }
# Where a grown widget's right and bottom edges go (phone 4 x 5, tablet 6 x 5 cells).
if [[ $DEVICE == phone ]]; then RIGHT=1066; BOTTOM=1768; SWIPE="900 1200 150 1200"; else RIGHT=2330; BOTTOM=1315; SWIPE="2200 900 300 900"; fi
X=$(mktemp)
dump() { $A shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; $A exec-out cat /sdcard/ui.xml > "$X"; }
bounds() { python3 -I -c "
import re, sys
x = open(sys.argv[1], encoding='utf-8').read()
for m in re.finditer(r'<node[^>]*?text=\"([^\"]*)\"[^>]*?resource-id=\"([^\"]*)\"[^>]*?bounds=\"([^\"]*)\"', x):
    t, rid, b = m.groups()
    # Only this app's widgets: the launcher's own (clock, calendar) are left alone.
    ours = rid.endswith(('/weekly_grid_root', '/todo_widget_root'))
    if (sys.argv[2] == 'widget' and ours) or (sys.argv[2] != 'widget' and t == sys.argv[2]):
        print(*re.findall(r'\d+', b)); break
" "$X" "$1"; }
tap_text() { dump; read L T R B <<< "$(bounds "$1")"; [[ -n "$L" ]] || { echo "화면에 「$1」이 없다"; exit 1; }; $A shell input tap $(( (L + R) / 2 )) $(( (T + B) / 2 )); sleep 2; }

# A snapshot can already hold this app's widgets: adding them again leaves a second, smaller set behind.
placed=$($A shell dumpsys appwidget | grep -E '^\s+provider=ProviderId' | grep -oE 'widget\.(ClickableWeeklyWidget|TodayCombinedWidget|TodoListWidget)' | sort -u | wc -l | tr -d ' ')
WIDGETS=(weekly today todo); [[ $placed == 3 ]] && { echo "위젯 세 개가 이미 런처에 있다: 붙이기를 건너뛴다"; WIDGETS=(); }
for w in $WIDGETS; do
  $A shell am instrument -w -e siteCapture true -e siteWidget $w -e class com.jjsoft.android.simplescheduler.ui.SiteCaptureInstrumentedTest#requestWidget com.jjsoft.android.simplescheduler.test/androidx.test.runner.AndroidJUnitRunner | grep -q 'OK (1 test)' || { echo "위젯 요청 실패: 앱과 검사 APK가 같은 빌드인지 확인"; exit 1; }
  sleep 2; tap_text "Add to home screen"; sleep 1
  # The new widget lands on the first page with room: grow it so the next one needs a page of its own.
  $A shell input keyevent KEYCODE_HOME; sleep 2; $A shell input keyevent KEYCODE_HOME; sleep 2
  for page in 1 2 3 4 5 6 7 8; do
    dump; read L T R B <<< "$(bounds widget)"
    if [[ -n "$L" ]] && (( R < RIGHT - 60 || B < BOTTOM - 60 )); then
      CY=$(( (T + B) / 2 ))
      $A shell input swipe $(( (L + R) / 2 )) $CY $(( (L + R) / 2 )) $CY 1000; sleep 1
      # Resize handles only follow a slow drag.
      $A shell "input motionevent DOWN $((R + 2)) $CY; sleep 0.3; input motionevent MOVE $(( (R + RIGHT) / 2 )) $CY; sleep 0.2; input motionevent MOVE $RIGHT $CY; sleep 0.5; input motionevent UP $RIGHT $CY"; sleep 1
      dump; read L T R B <<< "$(bounds widget)"; CX=$(( (L + R) / 2 ))
      $A shell "input motionevent DOWN $CX $((B + 2)); sleep 0.3; input motionevent MOVE $CX $(( (B + BOTTOM) / 2 )); sleep 0.2; input motionevent MOVE $CX $BOTTOM; sleep 0.5; input motionevent UP $CX $BOTTOM"; sleep 1
      $A shell input keyevent KEYCODE_BACK; sleep 1
      break
    fi
    $A shell input swipe ${=SWIPE} 250; sleep 2
  done
done
# No suggested apps in the bottom row (they change from screen to screen).
$A shell input keyevent KEYCODE_HOME; sleep 2; $A shell input keyevent KEYCODE_HOME; sleep 2
if [[ $DEVICE == phone ]]; then $A shell input swipe 540 1300 540 1300 1000; else $A shell input swipe 1280 500 1280 500 1000; fi; sleep 1
tap_text "Home settings"; tap_text "Suggestions"
dump
python3 -I - "$X" <<'PY' | read SX SY STATE
import re, sys
x = open(sys.argv[1], encoding='utf-8').read()
i = x.find('Suggestions on Home screen')
m = re.search(r'class="android.widget.Switch"[^>]*?checked="(true|false)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', x[i:]) if i >= 0 else None
print((int(m[2]) + int(m[4])) // 2, (int(m[3]) + int(m[5])) // 2, m[1]) if m else print(0, 0, 'missing')
PY
[[ "$STATE" == true ]] && $A shell input tap $SX $SY && sleep 1
$A shell input keyevent KEYCODE_HOME
rm -f "$X"
echo "widgets on the launcher:"; $A shell dumpsys appwidget | grep -E '^\s+provider=ProviderId' | grep -oE 'widget\.[A-Za-z]+' | sort | uniq -c

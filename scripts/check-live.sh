#!/usr/bin/env bash
# Checks the live site from outside: status codes, redirects, robots meta, canonical links, DNS.
# Usage: scripts/check-live.sh test|connected|https|public|redirect
# Every check prints one PASS or FAIL line. The exit code is the number of failures (0 = all passed).
# The stages follow the publishing plan (claude-docs/website/plan-publish-2026-11-13.md in the app repository):
#   test       before the domain: the test address works and stays out of search, the policy pages open
#   connected  right after the domain is set: the old policy addresses move to the domain and still open
#   https      after the certificate: every redirect lands on https, www goes to the bare domain
#   public     after the public build: pages can be indexed and the root files answer
#   redirect   after the Cloudflare rule: simplebase.co.kr lands on simganpyo.com and its mail records stay
set -uo pipefail

OLD='https://jerryjungwh.github.io'
NEW='https://simganpyo.com'
POLICY='SimpleScheduler-Android'
GITHUB_A='185.199.108.153;185.199.109.153;185.199.110.153;185.199.111.153'
# simplebase.co.kr mail records before the redirect (2026-11-13). The redirect must leave them as they are.
SIMPLEBASE_MX='1 aspmx.l.google.com.;5 alt1.aspmx.l.google.com.;5 alt2.aspmx.l.google.com.;10 alt3.aspmx.l.google.com.;10 alt4.aspmx.l.google.com.'

fails=0
pass() { printf 'PASS %s\n' "$1"; }
fail() { printf 'FAIL %s (기대 %s / 실제 %s)\n' "$1" "$2" "$3"; fails=$((fails + 1)); }

# "<status> <location>" of one request, redirects not followed. "000 " when the request fails.
first_hop() {
  local out
  out=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code} %{redirect_url}' "$1" 2>/dev/null)
  printf '%s' "${out:-000 }"
}
# "<status> <final address>" after following redirects.
last_hop() {
  local out
  out=$(curl -sSL --max-time 30 -o /dev/null -w '%{http_code} %{url_effective}' "$1" 2>/dev/null)
  printf '%s' "${out:-000 $1}"
}
# Page text after redirects. Kept in a variable by the callers: piping into grep -q breaks under pipefail.
body() { curl -sSL --max-time 30 "$1" 2>/dev/null; }

expect_status() { # address, status
  local got
  got=$(first_hop "$1")
  got=${got%% *}
  if [[ $got == "$2" ]]; then pass "$1 → $2"; else fail "$1" "$2" "$got"; fi
}

expect_redirect() { # address, status, pattern for the location
  local got code loc
  got=$(first_hop "$1")
  code=${got%% *}
  loc=${got#* }
  if [[ $code == "$2" && $loc =~ $3 ]]; then pass "$1 → $code $loc"; else fail "$1" "$2 $3" "$code $loc"; fi
}

expect_lands() { # address, final status, pattern for the final address
  local got code url
  got=$(last_hop "$1")
  code=${got%% *}
  url=${got#* }
  if [[ $code == "$2" && $url =~ $3 ]]; then pass "$1 ⇒ $code $url"; else fail "$1 (넘김을 따라감)" "$2 $3" "$code $url"; fi
}

expect_text() { # address, text the page must contain
  local page
  page=$(body "$1")
  if [[ $page == *"$2"* ]]; then pass "$1 에 「$2」"; else fail "$1" "「$2」 있음" "없음"; fi
}

expect_no_text() { # address, text the page must not contain
  local page
  page=$(body "$1")
  if [[ -z $page ]]; then fail "$1" "「$2」 없는 페이지" "응답 없음"
  elif [[ $page == *"$2"* ]]; then fail "$1" "「$2」 없음" "있음"
  else pass "$1 에 「$2」 없음"; fi
}

expect_dns() { # name, record type, expected records separated by ";" (order does not matter)
  local got want
  got=$(dig +short "$1" "$2" | sort | paste -sd';' -)
  want=$(tr ';' '\n' <<<"$3" | sort | paste -sd';' -)
  if [[ $got == "$want" ]]; then pass "$1 $2 = $want"; else fail "$1 $2" "$want" "${got:-없음}"; fi
}

stage_test() {
  for p in / /en/; do
    expect_status "$OLD$p" 200
    expect_text "$OLD$p" 'name="robots" content="noindex"'
  done
  for f in robots.txt sitemap-index.xml llms.txt; do expect_status "$OLD/$f" 200; done
  expect_status "$OLD/$POLICY/" 200
  expect_text "$OLD/$POLICY/" '개인정보처리방침'
  expect_status "$OLD/$POLICY/terms" 200
  expect_text "$OLD/$POLICY/terms" '이용약관'
}

stage_connected() {
  expect_dns simganpyo.com A "$GITHUB_A"
  expect_dns www.simganpyo.com CNAME 'jerryjungwh.github.io.'
  expect_redirect "$OLD/$POLICY/" 301 '^https?://simganpyo\.com/SimpleScheduler-Android/$'
  expect_redirect "$OLD/$POLICY/terms" 301 '^https?://simganpyo\.com/SimpleScheduler-Android/terms$'
  expect_redirect "$OLD/$POLICY/terms.html" 301 '^https?://simganpyo\.com/SimpleScheduler-Android/terms\.html$'
  expect_lands "$OLD/$POLICY/" 200 '^https?://simganpyo\.com/SimpleScheduler-Android/$'
  expect_text "$OLD/$POLICY/" '개인정보처리방침'
  expect_lands "$OLD/$POLICY/terms" 200 '^https?://simganpyo\.com/SimpleScheduler-Android/terms$'
  expect_text "$OLD/$POLICY/terms" '이용약관'
  expect_redirect "$OLD/" 301 '^https?://simganpyo\.com/$'
}

stage_https() {
  expect_redirect "$OLD/$POLICY/" 301 '^https://simganpyo\.com/SimpleScheduler-Android/$'
  expect_redirect "$OLD/$POLICY/terms" 301 '^https://simganpyo\.com/SimpleScheduler-Android/terms$'
  expect_redirect "$OLD/$POLICY/terms.html" 301 '^https://simganpyo\.com/SimpleScheduler-Android/terms\.html$'
  expect_redirect "$OLD/" 301 '^https://simganpyo\.com/$'
  expect_redirect 'http://simganpyo.com/' 301 '^https://simganpyo\.com/$'
  expect_redirect 'https://www.simganpyo.com/' 301 '^https://simganpyo\.com/$'
}

stage_public() {
  for p in / /en/; do
    expect_status "$NEW$p" 200
    expect_no_text "$NEW$p" 'name="robots"'
    expect_text "$NEW$p" "rel=\"canonical\" href=\"$NEW$p\""
  done
  expect_text "$NEW/robots.txt" "Sitemap: $NEW/sitemap-index.xml"
  for f in sitemap-index.xml llms.txt; do expect_status "$NEW/$f" 200; done
  expect_status "$NEW/check-live-no-such-page/" 404
  expect_text "$NEW/$POLICY/" "rel=\"canonical\" href=\"$NEW/$POLICY/\""
}

stage_redirect() {
  for u in https://simplebase.co.kr/ http://simplebase.co.kr/ https://www.simplebase.co.kr/; do
    expect_redirect "$u" 301 '.'
    expect_lands "$u" 200 '^https://simganpyo\.com/$'
  done
  expect_dns simplebase.co.kr MX "$SIMPLEBASE_MX"
}

case "${1:-}" in
  test) stage_test ;;
  connected) stage_connected ;;
  https) stage_https ;;
  public) stage_public ;;
  redirect) stage_redirect ;;
  *)
    echo "사용법: $0 test|connected|https|public|redirect" >&2
    exit 64
    ;;
esac
printf '%s 단계: 실패 %d\n' "$1" "$fails"
exit $((fails > 255 ? 255 : fails))

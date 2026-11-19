# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ardimakefun/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ardimakefun/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Vice City Trophy Atlas: an offline web app that is the best guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI — every trophy with its official name, description and grade, a checklist saved in the browser with export and import, filters by grade and kind, search and sort, a spoiler setting that hides story trophies until earned, a four-phase roadmap to the platinum, the missable trophies flagged, and a guide to each trophy in this guide's own words that cites its sources. Everything runs in a desktop browser from static files; the guide never fetches anything over the network. All art, lettering and layout are original.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Tick trophies off as you earn them; your progress is saved in the browser. Export it to a file to back it up or move it to another machine, and import it back any time.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: per-trophy methods, roadmap times, the missable flag, and the 100% checklist details.
- Exophase — GTA 6 trophy list: the official list mirror; the 55 names, descriptions and grades here match the list Exophase published on 18 November 2026.
- Radio Times and EGamers.io — independent cross-checks of the list and the missable flag.

Five trophies have no confirmed unlock method in any published guide yet (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin). Their entries say so plainly rather than inventing a method.

---

<sub>Entered on [make.fun](https://make.fun/?ref=0vh6bwht&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

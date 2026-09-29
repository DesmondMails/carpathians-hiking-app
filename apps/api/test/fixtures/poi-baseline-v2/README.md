# Featured POI V2 baseline

Frozen snapshots of four real READY routes captured before replacing the selector.
These results describe existing behavior, including its weaknesses; they are not
gold-standard selections that a new algorithm must reproduce.

| Case | Distance | Persisted candidates | Featured |
| --- | ---: | ---: | ---: |
| short | 4.5669 km | 6 | 3 |
| medium (Rotylo-Khorde) | 23.955 km | 47 | 12 |
| long (MEDIUM_56km) | 54.3952 km | 187 | 16 |
| sparse (labyeska) | 0.3491 km | 3 | 1 |

The sparse case is a very short real track, not a long route with scarce data.
Long sparse routes, loops, empty input and formula boundaries remain future test
cases. Candidate counts include types excluded from preview.

Each directory contains fixture.json, result.json and a standalone map.html.
The manifest records capture time, ordered selected IDs and SHA-256 hashes.
The .ts.txt files preserve selector, constants and types as captured from the
working tree (which may differ from the Git commit). They are archival copies,
not a second runtime implementation.

All four fixtures were replayed offline and result.json matched byte for byte.
Capture used read-only database transactions and did not call Overpass.

## Compare after a change

From apps/api:

```sh
npm run debug:pois -- --fixture test/fixtures/poi-baseline-v2/long/fixture.json --out .poi-debug/long-experiment
```

Open the baseline long/map.html and .poi-debug/long-experiment/map.html side by
side. Repeat for short, medium and sparse. Do not output experiments into this
baseline directory. Keep original fixtures unchanged so only the algorithm varies.

The one-off scripts/capture-poi-baseline.ts records the capture procedure and
refuses to overwrite this directory. Fixtures contain route coordinates and OSM
metadata; no database credentials or user account records are included.

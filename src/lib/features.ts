/**
 * Switches for sections that wait for an app release. Off means the section is not in the built HTML at all.
 * characterDeco: the "make Simgani yours" section (redesign 11-20, spec §7). Turn on on 8.0.0 release day,
 * after real captures of the app's decorate screen are added (design 11-12: real app screens only).
 * Turning it on also means adding #character to the section order in tests/build/home.test.ts and flipping
 * tests/unit/features.test.ts, both of which fail on purpose while it is on.
 */
export const FEATURES = { characterDeco: false } as const;

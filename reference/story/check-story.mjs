// S0 validator: story data layer integrity checks.
// Run: node reference/story/check-story.mjs  -> prints OK or lists failures.
import fs from 'fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const fails = [];
const warns = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

const chars = read('story/characters.json');
const chapters = read('story/chapters.json');
const missions = read('story/missions.json');
const endings = read('story/endings.json');
const radio = read('story/radio.json');
const schema = read('story/dialogue/schema.json');
const sceneFiles = fs.readdirSync('story/dialogue').filter((f) => /^ch\d/.test(f));
const scenes = sceneFiles.map((f) => read('story/dialogue/' + f));

// structure counts
check(chars.protagonists.length === 4, `expected 4 protagonists, got ${chars.protagonists.length}`);
check(new Set(chars.protagonists.map((p) => p.id)).size === 4, 'protagonist ids not unique');
for (const p of chars.protagonists) {
  check(p.prologue?.id && p.prologue.openingVO?.hi && p.endingSting, `protagonist ${p.id} missing prologue/sting`);
  check(p.gameplay?.length >= 4, `protagonist ${p.id} gameplay list thin`);
  check(p.signatureDialogue?.length >= 2, `protagonist ${p.id} signature dialogue thin`);
  check(p.model && p.spawnPlace, `protagonist ${p.id} missing model/spawnPlace (S2)`);
  check(['arjun', 'nikhil', 'kavya', 'saree', 'mani', 'leela', 'shobha'].includes(p.model), `protagonist ${p.id} model ${p.model} not in cast.js`);
}
// spawnPlace must exist in the map dump
const dump = JSON.parse(fs.readFileSync('reference/osm/mumbai/dump-mumbai.json', 'utf8'));
for (const p of chars.protagonists) {
  check(dump.places[p.spawnPlace], `protagonist ${p.id} spawnPlace ${p.spawnPlace} not in map dump`);
}
check(chapters.chapters.length === 20, `expected 20 chapters, got ${chapters.chapters.length}`);
check(chapters.acts.length === 4 && chapters.acts.every((a) => a.chapters.length === 5), 'acts must each cover 5 chapters');
const chapterNs = new Set(chapters.chapters.map((c) => c.n));
check(chapterNs.size === 20, 'chapter numbers not unique');

// missions
const core = missions.missions.filter((m) => m.core != null);
check(core.length === 48, `expected 48 numbered core missions, got ${core.length}`);
check(new Set(core.map((m) => m.core)).size === 48, 'core numbers not unique');
check(missions.missions.length === 57, `expected 57 total mission ids, got ${missions.missions.length}`);
const mIds = new Set(missions.missions.map((m) => m.id));
check(mIds.size === missions.missions.length, 'mission ids not unique');
for (const m of missions.missions) {
  check(chapterNs.has(m.chapter), `mission ${m.id} references missing chapter ${m.chapter}`);
  check(m.paths?.length >= 1, `mission ${m.id} has no paths`);
  for (const p of m.paths) check(chars.protagonists.some((x) => x.id === p), `mission ${m.id} references unknown protagonist ${p}`);
  check(m.act && ['act1', 'act2', 'act3', 'act4'].includes(m.act), `mission ${m.id} bad act`);
}
// every protagonist ≥3 exclusive missions per act (bible §3 rule)
for (const pr of chars.protagonists) for (const act of ['act1', 'act2', 'act3', 'act4']) {
  const exclusive = missions.missions.filter((m) => m.act === act && m.paths.length === 1 && m.paths[0] === pr.id).length;
  const inAct = missions.missions.filter((m) => m.act === act && m.paths.includes(pr.id)).length;
  console.log(`  ${pr.id} ${act}: ${inAct} missions (${exclusive} exclusive)`);
  if (exclusive < 3) warns.push(`bible §3: ${pr.id} has ${exclusive}/3 exclusive missions in ${act} — differentiate shared missions in the act phase`);
}

// endings
check(endings.endings.length === 4, `expected 4 endings, got ${endings.endings.length}`);
for (const e of endings.endings) check(Object.keys(e.versions).length === 4, `ending ${e.id} missing protagonist versions`);

// radio
check(radio.stations.length === 8, `expected 8 stations, got ${radio.stations.length}`);
check(radio.towers.length === 5, `expected 5 towers, got ${radio.towers.length}`);
for (const t of radio.towers) for (const s of t.carries) {
  if (radio.stations.some((x) => x.id === s) || ['koliwada-community-station', 'indie-boutique-station', 'campus-station', 'mw-service'].includes(s)) continue;
  fails.push(`tower ${t.id} carries unknown station ${s}`);
}

// scenes
const speakerIds = new Set([...chars.protagonists.map((p) => p.id), ...chars.npcs.map((n) => n.id)]);
for (const sc of scenes) {
  check(chapterNs.has(sc.chapter), `scene ${sc.sceneId} bad chapter`);
  check(sc.lines?.length > 0, `scene ${sc.sceneId} has no lines`);
  for (const l of sc.lines || []) {
    for (const f of Object.keys(schema.lineFields)) check(f in l, `scene ${sc.sceneId} line ${l.lineId || '?'} missing field ${f}`);
    check(speakerIds.has(l.speakerId), `scene ${sc.sceneId} line ${l.lineId} unknown speaker ${l.speakerId}`);
    if (sc.handoff?.missionId) check(mIds.has(sc.handoff.missionId), `scene ${sc.sceneId} handoff references unknown mission ${sc.handoff.missionId}`);
  }
}

// bulletins (act data files)
const bulletinFiles = fs.readdirSync('story/radio').filter((f) => /^bulletins-/.test(f));
const stationIds = new Set(radio.stations.map((s) => s.id));
for (const f of bulletinFiles) {
  const bl = read('story/radio/' + f);
  check(bl.bulletins?.length > 0, `bulletin file ${f} empty`);
  for (const b of bl.bulletins) {
    check(stationIds.has(b.station), `bulletin ${b.id} unknown station ${b.station}`);
    check(chapterNs.has(b.chapter), `bulletin ${b.id} bad chapter`);
    check(b.lines?.length >= 1, `bulletin ${b.id} has no lines`);
  }
}

if (fails.length) { console.log('FAIL:'); fails.forEach((f) => console.log(' -', f)); process.exit(1); }
if (warns.length) { console.log('WARNINGS:'); warns.forEach((w) => console.log(' -', w)); }
console.log(`OK: 4 protagonists, 20 chapters, ${missions.missions.length} mission ids (48 core), 4 endings, ${radio.stations.length} stations, 5 towers, ${scenes.length} scene(s), ${bulletinFiles.length} bulletin act file(s) validated${warns.length ? ` (${warns.length} warnings)` : ''}`);

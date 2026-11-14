// S3 unit test: story-state machine in Node (no browser)
import storyState from '../../vendor/story-state.js';

const fail = (m) => { console.error('FAIL:', m); process.exit(1); };

// fake game handle with a save + persist
const saved = {};
const game = {
  story: {
    save: {},
    persist() { saved.snap = JSON.parse(JSON.stringify(game.story.save.storyExt)); },
  },
  hud: { toast: (t) => saved.toast = t },
};

storyState.attach(game, 'meera');
const st = storyState.state;
if (st.who !== 'meera' || st.chapter !== 1) fail('fresh state wrong');
if (st.vars.evidence !== 0) fail('vars not zeroed');

// next() = first meera mission
const nx = storyState.next();
if (!nx || !nx.paths.includes('meera')) fail('next() not a meera mission');
console.log('next for meera:', nx.id, `(ch${nx.chapter})`);

// complete an unmapped engine mission
let r = storyState.onEngineMission('arrival');
if (r.mapped) fail('arrival should be unmapped');
if (!st.engineDone.includes('arrival')) fail('engineDone missing arrival');

// complete a mapped engine mission
r = storyState.onEngineMission('press-matter');
if (!r.mapped) fail('press-matter should map');
if (!st.done.includes('press-matter')) fail('press-matter not done');

// evidence + vars + caps
storyState.addEvidence('cctv-clip', 'Overwritten CCTV clip', 'body-at-backbay');
if (st.vars.evidence !== 5) fail('evidence var should be 5 after addEvidence');
storyState.bump('trust', 30);
storyState.bump('trust', 200); // cap at 100
if (st.vars.trust !== 100) fail('trust cap broken');
if (storyState.addEvidence('cctv-clip', 'dup', null) !== false) fail('duplicate evidence accepted');

// ending calc
const e = storyState.ending();
if (e.id !== 'the-badge') fail(`ending should be the-badge (loyalty 0 vs trust 100? trust=the-paper!) wait trust=100`);
console.log('ending calc:', JSON.stringify(e));
if (e.vars.trust !== 100) fail('ending vars wrong');

// persistence round-trip through save.storyExt
storyState.bump('compromise', 12);
if (game.story.save.storyExt?.vars?.compromise !== 12) fail('save.storyExt not updated');
if (!saved.snap) fail('persist not called');

// chapter advance: complete ALL meera ch1 missions -> chapter 2 + bulletin
const ch1 = storyState.chapterMissions(1);
console.log('meera ch1 missions:', ch1.map((m) => m.id).join(' | '));
for (const m of ch1) if (!st.done.includes(m.id)) storyState.completeMission(m.id);
if (st.chapter !== 2) fail(`chapter should advance to 2, got ${st.chapter}`);
if (!saved.toast) fail('bulletin toast not fired on chapter advance');
console.log('bulletin toast:', saved.toast);

// fresh attach restores from save
const game2 = { story: { save: { storyExt: JSON.parse(JSON.stringify(game.story.save.storyExt)) }, persist() {} } };
storyState.attach(game2, undefined);
if (storyState.state.chapter !== 2) fail('restore lost chapter');
if (storyState.state.who !== 'meera') fail('restore lost who');

console.log('OK: story-state unit tests pass');

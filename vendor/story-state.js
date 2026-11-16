// S3 story-state layer: mission graph progress, hidden variables, evidence,
// chapter->bulletin hook. Persists inside the game's own save (save.storyExt)
// — menus.js Mt() spreads the whole save object, so extra fields round-trip.
// Engine-facing: window.__storyState (the engine's own manager stays __story).
import story from './story.js';
import act1Bulletins from '../story/radio/bulletins-act1.json';
import act2Bulletins from '../story/radio/bulletins-act2.json';

const VARS = ['evidence', 'trust', 'loyalty', 'compromise'];
const VAR_LIMIT = 100;

// engine vg mission id -> story mission id (only exact, verified matches;
// unmapped engine missions are recorded as generic progress in engineDone)
const ENGINE_MAP = {
  'eleven-tonight': 'eleven-tonight',
  'press-matter': 'press-matter',
  'peg-man': 'peg-man',
  'peg-truck': 'peg-truck',
  'night-net': 'night-net',
};

class StoryState {
  constructor() {
    this.state = null;
    this.game = null;
  }

  fresh(who) {
    return {
      v: 1,
      who: who || 'arjun',
      chapter: 1,
      done: [], // story mission ids
      engineDone: [], // engine vg ids completed but not yet mapped
      active: null,
      vars: { evidence: 0, trust: 0, loyalty: 0, compromise: 0 },
      evidence: [], // {id, missionId, label}
      bulletins: [], // bulletin ids already played
      world: { pressBurnt: false, accountFrozen: false, caseReassigned: false, cricketSeason2: false },
      world: { pressBurnt: false, accountFrozen: false, caseReassigned: false },
    };
  }

  // attach to the game: load from save.storyExt, or start fresh for ?who
  attach(game, who) {
    this.game = game;
    const save = game?.story?.save;
    if (save?.storyExt?.v === 1) {
      this.state = save.storyExt;
      // keep who in sync with ?who (dev switching)
      if (who && who !== this.state.who) this.state.who = who;
    } else {
      this.state = this.fresh(who);
      this.persist();
    }
    console.log(`[storyState] who=${this.state.who} chapter=${this.state.chapter} done=${this.state.done.length} vars=${JSON.stringify(this.state.vars)}`);
    return this;
  }

  persist() {
    if (!this.game?.story?.save) return;
    this.game.story.save.storyExt = this.state;
    try { this.game.story.persist(); } catch { /* save may be mid-write */ }
  }

  prot() {
    return story.protagonistById[this.state.who];
  }

  missionsFor(who = this.state.who) {
    return story.missions.filter((m) => m.paths.includes(who));
  }

  // first not-done story mission for this protagonist, in chapter order
  next() {
    const done = new Set(this.state.done);
    return this.missionsFor().find((m) => !done.has(m.id)) || null;
  }

  chapterMissions(n = this.state.chapter) {
    const done = new Set(this.state.done);
    return this.missionsFor().filter((m) => m.chapter === n);
  }

  chapterComplete(n = this.state.chapter) {
    const ms = this.chapterMissions(n);
    return ms.length > 0 && ms.every((m) => this.state.done.includes(m.id));
  }

  startMission(id) {
    this.state.active = id;
    this.persist();
  }

  completeMission(id) {
    if (!this.state.done.includes(id)) this.state.done.push(id);
    if (this.state.active === id) this.state.active = null;
    let advanced = null;
    if (this.chapterComplete()) {
      this.state.chapter += 1;
      advanced = this.state.chapter;
      this.onChapterAdvance(advanced);
    }
    this.persist();
    return { advanced };
  }

  // engine hook: called by game.js when a vg/jg mission completes
  onEngineMission(engineId) {
    if (!this.state) return;
    if (!this.state.engineDone.includes(engineId)) this.state.engineDone.push(engineId);
    // explicit map first, then auto-map: engine id === story id available to this protagonist
    const storyId = ENGINE_MAP[engineId] ?? (story.missionById[engineId]?.paths.includes(this.state.who) ? engineId : null);
    let res = { mapped: !!storyId, advanced: null };
    if (storyId) res = { ...res, ...this.completeMission(storyId) };
    else this.persist();
    return res;
  }

  // chapter advanced -> radio bulletin toast (S1 data, S3 wiring)
  onChapterAdvance(n) {
    try {
      const file = n <= 5 ? act1Bulletins : n <= 10 ? act2Bulletins : null;
      // chapter reveal card (game's own HUD component)
      const ch = (story.chapters?.chapters ?? story.chapters ?? []).find?.((x) => (x.n ?? x.chapter) === n) ?? (Array.isArray(story.chapters) ? story.chapters[n - 1] : null);
      if (ch && this.game?.hud?.chapterCard) {
        const a = (story.acts ?? []).find((x) => x.chapters?.includes(n));
        const actLabel = a ? a.id.replace('act', 'ACT ').toUpperCase() : 'ACT 1';
        // Act I cliffhanger: play the act-end card before the next act's Chapter 6 card
        const closingAct = n === 6 ? ((story.acts ?? []).find((x) => x.chapters?.includes(n - 1)) ?? (story.acts ?? [])[0]) : null;
        if (closingAct) {
          try { this.game.hud.chapterCard('End of Act I', closingAct.title ?? 'The First Body', closingAct.cliffhanger ?? 'four files, one creek'); } catch { }
          setTimeout(() => { try { this.game.hud.chapterCard(`Chapter ${n}`, ch.title, actLabel); } catch { } }, 4700);
        } else {
          try { this.game.hud.chapterCard(`Chapter ${n}`, ch.title, actLabel); } catch { }
        }
      }
      if (n === 6) try { this.game?.hud?.toast?.('Act I complete — the creek was only the beginning.', 6000); } catch { }
      if (!file) return;
      const b = file.bulletins.find((x) => x.chapter === n);
      if (!b || this.state.bulletins.includes(b.id)) return;
      this.state.bulletins.push(b.id);
      this.persist();
      const text = `${b.headline} — ${b.lines[0]?.textOriginal ?? ''}`;
      this.game?.hud?.toast?.(`📻 ${b.headline}`, 6000);
      console.log(`[storyState] bulletin: ${text}`);
      // broadcast the bulletin as real VO through the ./vo/ system (missing files skip silently)
      this.playBulletin(b);
    } catch (e) {
      console.log('[storyState] bulletin error', e?.message);
    }
  }

  // queue the bulletin's VO lines sequentially through the engine's audio.say
  playBulletin(b) {
    (async () => {
      let A = null;
      try { A = (await import('./audio.js')).t; } catch { return; }
      for (const line of b.lines) {
        try {
          const dur = await A.say(line.lineId, line.textOriginal);
          await new Promise((r) => setTimeout(r, ((dur || 3) + 0.5) * 1000));
        } catch { }
      }
    })();
  }

  bump(varName, delta) {
    if (!VARS.includes(varName)) return;
    const v = this.state.vars;
    v[varName] = Math.max(0, Math.min(VAR_LIMIT, (v[varName] ?? 0) + delta));
    this.persist();
  }

  addEvidence(id, label, missionId) {
    if (this.state.evidence.some((e) => e.id === id)) return false;
    this.state.evidence.push({ id, label, missionId: missionId ?? null });
    this.bump('evidence', 5);
    this.persist();
    return true;
  }

  // ending calculator (bible §14): highest-priority variable decides
  // world-state world flags (press burnt, account frozen, case reassigned)
  addWorldFlag(key, value) {
    if (!this.state.world) this.state.world = { pressBurnt: false, accountFrozen: false, caseReassigned: false, cricketSeason2: false };
    this.state.world[key] = value !== false;
    this.persist();
  }

  ending() {
    const v = this.state.vars;
    const entries = [
      ['the-paper', v.trust],
      ['the-badge', v.loyalty],
      ['the-empire', v.compromise],
      ['the-rakshasa', v.evidence],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    return { id: entries[0][0], vars: { ...v } };
  }
}

const storyState = new StoryState();
export default storyState;
export const loadStoryState = () => storyState;

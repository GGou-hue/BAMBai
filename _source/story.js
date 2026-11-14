// S0 story-data layer: loads the four-protagonist campaign data (BAMBai-STORY-PHASES.md S0).
// Data-only: no gameplay behaviour. Consumed via ?story=1 debug hook until S2 wires it in.
import chars from '../story/characters.json';
import chapters from '../story/chapters.json';
import missions from '../story/missions.json';
import endings from '../story/endings.json';
import radio from '../story/radio.json';
// scenes are listed explicitly (vendor/ is served raw — no Vite glob transforms)
import sceneCh1File from '../story/dialogue/ch1-the-file.json';

const scenes = [sceneCh1File];

const story = {
  version: 1,
  protagonists: chars.protagonists,
  npcs: chars.npcs,
  chapters: chapters.chapters,
  acts: chapters.acts,
  missions: missions.missions,
  endings: endings.endings,
  hiddenVariables: endings.hiddenVariables,
  radio: radio,
  scenes,
};

const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
story.protagonistById = byId(story.protagonists);
story.npcById = byId(story.npcs);
story.missionById = byId(story.missions);
story.chapterByN = Object.fromEntries(story.chapters.map((c) => [c.n, c]));
story.missionsByChapter = (n) => story.missions.filter((m) => m.chapter === n);
story.missionsByProtagonist = (p) => story.missions.filter((m) => m.paths.includes(p));
story.sceneById = byId(scenes);

export default story;
export const loadStory = () => story;

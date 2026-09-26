import { writeFileSync } from 'node:fs';
import { lightningChapters, lightningNotes, demoCode } from '../src/lightning';

let guide = '# Lightning talk — presenter script\n\nOpen http://localhost:3100/lightning.html#welcome. The full deck remains at http://localhost:3100/#welcome. Press N for the same script on each slide; Escape closes it. Timings are presenter-only.\n\nThe plan allocates 9:45 to content and 1:15 to buffer. This is a rehearsal budget, not a guarantee of live provider latency. Run each demo once. If a request takes more than ten seconds, explain its contract while waiting. At the segment deadline, stop and advance; never claim an unfinished action succeeded. Keep the deeper code walkthroughs and extra demos for questions.\n\n';
guide += '| Window | Slide |\n| --- | --- |\n';
for (const chapter of lightningChapters) {
  guide += `| ${lightningNotes[chapter.id].window} | ${chapter.name} |\n`;
}
for (const [i, chapter] of lightningChapters.entries()) {
  const note = lightningNotes[chapter.id];
  guide += `\n## ${i + 1}. ${chapter.name}\n\n${note.window} · ${note.seconds} seconds\n\nhttp://localhost:3100/lightning.html#${chapter.id}\n\n${note.script.split('\n\n').map(p => '> ' + p).join('\n\n')}\n\n**Stage action:** ${note.action}\n`;
  if (note.jokeExplanation) guide += `\n**Why this is funny (preparation only, do not read aloud):** ${note.jokeExplanation}\n\n**Joke delivery:** ${note.jokeDelivery}\n`;
  if (chapter.kind === 'demo-code') {
    for (const block of demoCode[chapter.lesson!].blocks) {
      guide += `\n### ${block.title}\n\nSource: ${block.file}\n\n\`\`\`tsx\n${block.code}\n\`\`\`\n\n${block.explanation}\n`;
    }
  }
}
guide += `
## Comedy delivery cues

Keep the feature explanation straight. Let the absurd business idea carry the joke. Do not promise the audience that the next line will be funny, and do not explain a punchline after delivering it.

- **Structured output:** show comparison cards. “No imaginary discount. Those prices came from the catalog.”
- **Agent:** show the €18 quote. “Seven euros left. The model is better at sticking to my budget than I am.”
- **Approval:** pause on the unchanged bag. “It can recommend the towel. It cannot spend my beach budget.” Approve, then show the actual cart.
- **Jev:** let the before/after transformation land. “We found the product.” Gesture at Restore: “This button is sponsored by the growth team.” Keep the Kitze credit.
- **WebMCP:** only after the tools change the grid and theme: “The budget is strict. The brand guidelines are lavender.” Then explain the registered capabilities.

The three original meme slides are quick optional beats. If the room laughs, give it space and use the buffer. If a live request overruns, skip a meme and shorten the closing capability list. These cues are included within demo time; they are not six additional segments. Model output is variable, so the visible interface supplies the dependable setup and punchline. Fixture results must remain labelled as rehearsal.

`;
guide += '\n## Before the talk\n\nKeep one server running and confirm the live provider configuration. Rehearse with the exact presentation browser, especially native WebMCP support. Fixture mode tests protocol plumbing but is not live model reasoning. Keep the full deck available for questions; do not navigate its longer code walkthroughs during this route. The closing QR links to the four-hour attendee workshop.\n';
writeFileSync('LIGHTNING-RUN-OF-SHOW.md', guide);

writeFileSync('public/speaker-notes/speaker-notes.md', guide.replaceAll('http://localhost:3100/', '/'));
writeFileSync('public/speaker-notes/slides.json', JSON.stringify(lightningChapters.map((chapter, i) => {
  const note = lightningNotes[chapter.id];
  return {number:i+1, title:chapter.name, time:note.window, seconds:note.seconds, script:note.script.split('\n\n'), action:note.action, anchor:chapter.id, jokeExplanation:note.jokeExplanation ?? null, jokeDelivery:note.jokeDelivery ?? null};
})));

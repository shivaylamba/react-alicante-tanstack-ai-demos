import React from 'react';
// Minimal, escaped text formatting for short generated replies. No HTML execution.
export function Prose({text}:{text:string}) {
 return <div className="generated-prose">{text.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph.split(/(\*\*[^*]+\*\*)/g).map((part,j)=>part.startsWith('**')&&part.endsWith('**')?<strong key={j}>{part.slice(2,-2)}</strong>:<React.Fragment key={j}>{part}</React.Fragment>)}</p>)}</div>;
}

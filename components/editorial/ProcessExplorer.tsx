"use client";
import { useState } from "react";
import { Search, Code2, CheckCheck, GitPullRequestArrow } from "lucide-react";
import styles from "@/app/blog/editorial.module.css";
const steps = [
  { title:"Investigate", icon:Search, question:"Is this useful work to take on?", text:"Check the issue, competing fixes and the project’s contribution and AI rules. I choose the problem and agree the scope.", example:"A locally prepared httptap fix was superseded before publication. It stays out of the submitted totals." },
  { title:"Implement", icon:Code2, question:"What is the smallest change that solves it?", text:"Trace the existing behaviour, reproduce the problem and make a focused change. Codex assists with investigation and implementation; I direct the work and review the results.", example:"EvalRepro: test that custom snapshot options reach the manifest, without changing production behaviour." },
  { title:"Verify", icon:CheckCheck, question:"Would the checks catch a wrong result?", text:"Use tests and real application paths that can expose the defect. Record what passed, what failed and what remains untested.", example:"MiniSearch: removing the unsubscribe call caused two of the three regression tests to fail." },
  { title:"Follow through", icon:GitPullRequestArrow, question:"What changed after the review?", text:"Follow hosted checks and maintainer feedback. Credit corrections and inspect what actually merged. Maintainers decide what belongs in their projects.", example:"django-ox: the maintainer strengthened tests that could pass with the wrong backend selected." },
];
export function ProcessExplorer() {
  const [active,setActive]=useState(0);
  const step=steps[active];
  return <div className={styles.process}>
    <div className={styles.steps} role="group" aria-label="Explore the contribution process">
      {steps.map((item,index)=><button key={item.title} type="button" aria-pressed={active===index} aria-controls="process-example" onClick={()=>setActive(index)}><item.icon aria-hidden="true" size={23}/><span><small>0{index+1}</small>{item.title}</span></button>)}
    </div>
    <div key={active} id="process-example" className={styles.processPanel} aria-live="polite" aria-atomic="true"><div><p className={styles.eyebrow}>The question</p><h3>{step.question}</h3><p>{step.text}</p></div><details className={styles.example}><summary>See a real example <span aria-hidden="true">+</span></summary><p>{step.example}</p></details></div>
  </div>;
}

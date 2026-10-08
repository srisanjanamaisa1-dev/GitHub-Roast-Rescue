import React, { useMemo, useState } from "react";
import {
  Flame, Github, Search, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2,
  Ambulance, Copy, ExternalLink, RefreshCw, Code2, Activity, BookOpen,
  Star, GitFork, ChevronDown, Sparkles, Trophy, Clock3
} from "lucide-react";
import { fetchGitHubProfile } from "./services/github";
import { demoData } from "./services/demo";
import { analyzeData, scoreLabel } from "./utils/analyze";
import { ago } from "./utils/format";

const cls = (...x) => x.filter(Boolean).join(" ");

function Button({children, primary=false, ...props}) {
  return <button className={cls("btn", primary && "btn-primary")} {...props}>{children}</button>;
}
function Card({children, className=""}) { return <section className={cls("card",className)}>{children}</section>; }
function Pill({children, tone=""}) { return <span className={cls("pill",tone)}>{children}</span>; }

function App() {
  const [username,setUsername] = useState("");
  const [data,setData] = useState(null);
  const [analysis,setAnalysis] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [demo,setDemo] = useState(false);
  const [showAll,setShowAll] = useState(false);

  const run = async (value=username, demoMode=false) => {
    const u = value.trim();
    if (!demoMode && !u) { setError("Enter a GitHub username first."); return; }
    setLoading(true); setError(""); setDemo(demoMode);
    try {
      const result = demoMode ? demoData : await fetchGitHubProfile(u);
      setData(result);
      setAnalysis(analyzeData(result.profile,result.repos));
      setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),100);
    } catch(e) {
      const messages = {
        NOT_FOUND:"We couldn't find that GitHub user. Check the username.",
        RATE_LIMIT:"GitHub is temporarily limiting requests. Try Demo Mode.",
        NETWORK:"GitHub couldn't be reached right now. Try again or use Demo Mode."
      };
      setError(messages[e.message] || "Something went wrong. Try again or use Demo Mode.");
    } finally { setLoading(false); }
  };

  const reset = () => { setData(null); setAnalysis(null); setError(""); setDemo(false); setShowAll(false); window.scrollTo({top:0,behavior:"smooth"}); };

  const summary = useMemo(() => {
    if (!data || !analysis) return "";
    const a=analysis, p=data.profile;
    return `GitHub Roast & Rescue Report
Recruiter Score: ${a.total}/100
Biggest strength: ${a.strengths[0]}
Biggest weakness: ${a.weaknesses[0]?.title}
Top rescue action: ${a.weaknesses[0]?.fix}
Profile: github.com/${p.login}`;
  },[data,analysis]);

  const copy = async () => { try { await navigator.clipboard.writeText(summary); alert("Summary copied!"); } catch { alert(summary); } };

  if (data && analysis) return <Results {...{data,analysis,demo,showAll,setShowAll,reset,copy,summary}} />;

  return (
    <div>
      <header className="nav">
        <div className="brand"><span className="brand-icon"><Flame size={19}/></span> GitHub Roast <span className="amp">&</span> Rescue</div>
        <span className="nav-tag">AI BUILD • 8 HOURS</span>
      </header>
      <main className="hero-wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <Pill><Sparkles size={14}/> Recruiter-readiness audit</Pill>
            <h1>Everyone tells you to build a GitHub.<br/><span>Nobody tells you if it’s actually good.</span></h1>
            <p className="hero-sub">Enter your GitHub username and discover what a recruiter might notice in the first 30 seconds.</p>
            <form className="search-box" onSubmit={e=>{e.preventDefault();run()}}>
              <Github size={22}/>
              <span className="prefix">github.com/</span>
              <input value={username} onChange={e=>setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g,""))} placeholder="your-username" aria-label="GitHub username"/>
              <button disabled={loading}>{loading ? <RefreshCw className="spin" size={19}/> : <><Flame size={18}/> Roast My GitHub</>}</button>
            </form>
            {error && <div className="error"><AlertTriangle size={17}/>{error}</div>}
            <div className="trust"><ShieldCheck size={16}/> No login required <span>•</span> Public GitHub profiles only</div>
            <div className="demo-link"><button onClick={()=>run("",true)}>Try Demo</button> <span>— see the full product with clearly labeled sample data</span></div>
          </div>
          <div className="flow">
            <Flow n="01" icon={<Github/>} title="GitHub Profile" text="Public profile + repos"/>
            <div className="connector"/>
            <Flow n="02" icon={<Search/>} title="Recruiter Analysis" text="Score what matters"/>
            <div className="connector"/>
            <Flow n="03" icon={<Flame/>} title="🔥 Roast" text="Honest, fact-based feedback"/>
            <div className="connector"/>
            <Flow n="04" icon={<Ambulance/>} title="🚑 Rescue Plan" text="Prioritized actions"/>
          </div>
        </div>
      </main>
      <footer className="footer">Built for the 8-Hour Build With AI Hackathon • GitHub public data only</footer>
    </div>
  );
}

function Flow({n,icon,title,text}) {
  return <div className="flow-card"><div className="flow-num">{n}</div><div className="flow-icon">{icon}</div><div><b>{title}</b><small>{text}</small></div></div>;
}

function Results({data,analysis,demo,showAll,setShowAll,reset,copy}) {
  const p=data.profile, a=analysis;
  const repos=showAll ? a.sorted : a.sorted.slice(0,8);
  const languages=Object.entries(a.languageCounts).sort((x,y)=>y[1]-x[1]);
  return <div>
    <header className="nav sticky"><div className="brand"><span className="brand-icon"><Flame size={19}/></span> GitHub Roast <span className="amp">&</span> Rescue</div><Button onClick={reset}><RefreshCw size={16}/> Analyze Another GitHub</Button></header>
    <main id="results" className="results">
      {demo && <div className="demo-banner">🎭 Demo Mode — Using sample GitHub profile. This is not live GitHub data.</div>}
      <div className="profile-head">
        <img className="avatar" src={p.avatar_url} alt="" />
        <div className="profile-info">
          <div className="eyebrow">PROFILE AUDIT</div>
          <h1>{p.name || p.login}</h1>
          <div className="handle">@{p.login}</div>
          {p.bio && <p>{p.bio}</p>}
          <div className="stats">
            <span><b>{p.followers ?? 0}</b> followers</span><span><b>{p.following ?? 0}</b> following</span><span><b>{p.public_repos ?? data.repos.length}</b> public repos</span>
          </div>
        </div>
        <a className="outline-link" href={p.html_url} target="_blank" rel="noreferrer"><Github size={16}/> View GitHub <ExternalLink size={14}/></a>
      </div>

      <div className="score-layout">
        <Card className="score-card">
          <div className="eyebrow">RECRUITER SCORE</div>
          <div className="score">{a.total}<small>/100</small></div>
          <h2>{scoreLabel(a.total)}</h2>
          <div className="score-bars">
            <ScoreRow label="Profile Presentation" val={a.scores.profilePresentation} max={15}/>
            <ScoreRow label="Project Quality" val={a.scores.projectQuality} max={25}/>
            <ScoreRow label="Repository Hygiene" val={a.scores.hygiene} max={15}/>
            <ScoreRow label="Documentation" val={a.scores.documentation} max={15}/>
            <ScoreRow label="Activity & Consistency" val={a.scores.activity} max={15}/>
            <ScoreRow label="Tech Stack Visibility" val={a.scores.techVisibility} max={15}/>
          </div>
        </Card>
        <Card className="recruiter">
          <div className="section-title"><div><span>👀</span><h2>Recruiter 30-Second View</h2></div><Pill>First impression: <b>{a.total>=75?"Strong":a.total>=50?"Average":"Needs Work"}</b></Pill></div>
          <p className="muted">If a recruiter opened this profile for 30 seconds, here’s what they’d probably notice.</p>
          <div className="notice-grid">
            <Notice icon={<CheckCircle2/>} title="Recruiter notices this" text={a.strengths[0]}/>
            <Notice icon={<AlertTriangle/>} title="Recruiter may question this" text={a.weaknesses[0]?.title}/>
            <Notice icon={<AlertTriangle/>} title="Recruiter is likely to miss this" text={a.described < data.repos.length ? "Some projects have no description." : "Your project descriptions are visible."}/>
          </div>
        </Card>
      </div>

      <div className="two-col">
        <Card className="roast-card"><SectionHead icon="🔥" title="THE ROAST" sub="Funny, honest and based on actual findings."/>
          <div className="roasts">{a.roast.map((x,i)=><div className="roast-item" key={i}><span>{String(i+1).padStart(2,"0")}</span><p>{x}</p></div>)}</div>
        </Card>
        <Card><SectionHead icon="💪" title="What You’re Doing Right" sub="No fake praise. These are data-backed positives."/>
          <div className="positive-list">{a.strengths.map((x,i)=><div key={i}><CheckCircle2 size={18}/><span>{x}</span></div>)}</div>
        </Card>
      </div>

      <Card>
        <SectionHead icon="📦" title="Repository Check" sub={`Showing the ${Math.min(repos.length,8)} most relevant repositories.`}/>
        <div className="repo-list">{repos.map(r=><Repo key={r.name} r={r}/>)}</div>
        {a.sorted.length>8 && <Button onClick={()=>setShowAll(!showAll)} className="center-btn">{showAll?"Show less":`View all ${a.sorted.length} repositories`} <ChevronDown size={16}/></Button>}
      </Card>

      <div className="two-col">
        <Card><SectionHead icon="🧰" title="Your Tech Stack" sub="Based only on repository language data."/>
          <div className="languages">{languages.map(([name,count])=><div className="lang" key={name}><div><b>{name}</b><span>{count} repo{count!==1?"s":""}</span></div><div className="bar"><i style={{width:`${Math.round(count/Math.max(languages[0]?.[1]||1,1)*100)}%`}}/></div></div>)}</div>
          {!languages.length && <p className="muted">No language data was available.</p>}
        </Card>
        <Card><SectionHead icon="⚡" title="Activity" sub="Transparent about what the public repo data can tell us."/>
          <div className="activity-grid"><Metric icon={<Clock3/>} label="Last active" value={ago(a.lastActive)}/><Metric icon={<Activity/>} label="Updated ≤90 days" value={String(a.active)}/><Metric icon={<BookOpen/>} label="Described repos" value={`${a.described}/${data.repos.length}`}/></div>
          <p className="tiny">This audit does not claim exact commit frequency because the repository list endpoint alone does not provide it.</p>
        </Card>
      </div>

      <Card><SectionHead icon="🎯" title="Fix This First" sub="Prioritized from the actual weaknesses found."/>
        <div className="fix-grid">{a.weaknesses.map((w,i)=><div className={cls("fix",w.priority.toLowerCase())} key={i}><Pill>{w.priority==="HIGH"?"🔴":w.priority==="MEDIUM"?"🟡":"🟢"} {w.priority} IMPACT</Pill><h3>{w.title}</h3><p>{w.why}</p><b>→ {w.fix}</b></div>)}</div>
      </Card>

      <Card><SectionHead icon="🚑" title="RESCUE PLAN" sub="Turn the audit into an actual improvement sprint."/>
        <div className="problems">{a.weaknesses.slice(0,3).map((w,i)=><div key={i}><b>Problem:</b> {w.title}<br/><b>Why it matters:</b> {w.why}<br/><b>How to fix it:</b> {w.fix}</div>)}</div>
        <h3 className="day-title">Your 7-Day GitHub Rescue</h3>
        <div className="days">{["Fix profile bio","Improve best repository README","Improve repository names/descriptions","Pin strongest projects","Add screenshots/demo links","Clean abandoned repositories","Final recruiter check"].map((x,i)=><div className="day" key={i}><span>DAY {i+1}</span><b>{x}</b></div>)}</div>
      </Card>

      <Card className="share-card"><div><SectionHead icon="📋" title="Shareable Summary" sub="Copy the compact result for your README, notes or team chat."/></div><Button primary onClick={copy}><Copy size={17}/> Copy Summary</Button></Card>
      <footer className="footer">GitHub Roast & Rescue • Roast the profile, not the person.</footer>
    </main>
  </div>
}

function ScoreRow({label,val,max}) { return <div className="score-row"><div><span>{label}</span><b>{val}/{max}</b></div><div className="track"><i style={{width:`${Math.round(val/max*100)}%`}}/></div></div>; }
function Notice({icon,title,text}) { return <div className="notice"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div>; }
function SectionHead({icon,title,sub}) { return <div className="section-title"><div><span>{icon}</span><h2>{title}</h2></div>{sub && <p className="muted">{sub}</p>}</div>; }
function Metric({icon,label,value}) { return <div className="metric"><span>{icon}</span><small>{label}</small><b>{value}</b></div>; }
function Repo({r}) {
  const desc=!!(r.description||"").trim(), age=Math.floor((Date.now()-new Date(r.updated_at).getTime())/86400000);
  const active=age<=90;
  const doc=Math.round((desc?50:0)+(r.homepage?25:0)+(r.license?.spdx_id?25:0));
  const score=Math.min(100, Math.round((desc?35:10)+(r.language?20:0)+Math.min(20,(r.stargazers_count||0)*5)+Math.min(15,(r.forks_count||0)*5)+(active?10:0)));
  return <div className="repo">
    <div className="repo-main"><Code2 size={19}/><div><a href={r.html_url || `https://github.com/${r.full_name||""}`} target="_blank" rel="noreferrer">{r.name} <ExternalLink size={13}/></a><p>{r.description || "No description provided."}</p></div></div>
    <div className="repo-meta"><Pill>{r.language||"Unknown"}</Pill><span><Star size={14}/>{r.stargazers_count||0}</span><span><GitFork size={14}/>{r.forks_count||0}</span><span>Updated {ago(r.updated_at)}</span></div>
    <div className="repo-checks"><span>{desc?"✓":"×"} Description</span><span>{r.homepage?"✓":"×"} Demo</span><span>{r.license?.spdx_id?"✓":"×"} License</span><b>{score}/100</b></div>
  </div>
}
export default App;

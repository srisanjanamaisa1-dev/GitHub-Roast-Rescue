const daysAgo = (date) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));

export function analyzeData(profile, repos) {
  const sorted = [...repos].sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
  const active = sorted.filter(r => daysAgo(r.updated_at) <= 90).length;
  const described = repos.filter(r => (r.description || "").trim()).length;
  const readmeUnknown = repos; // GitHub repo list does not reliably expose README presence.
  const namedWell = repos.filter(r => /^[a-z0-9][a-z0-9._-]{1,49}$/.test(r.name) && !/(final|copy|test123|temp)/i.test(r.name)).length;
  const licensed = repos.filter(r => r.license?.spdx_id).length;
  const stars = repos.reduce((n,r)=>n+(r.stargazers_count||0),0);
  const forks = repos.reduce((n,r)=>n+(r.forks_count||0),0);

  const languageCounts = {};
  repos.forEach(r => { if (r.language) languageCounts[r.language] = (languageCounts[r.language] || 0) + 1; });

  const profilePresentation =
    (profile.name ? 5 : 0) + (profile.bio ? 5 : 0) + (profile.avatar_url ? 3 : 0) +
    (profile.html_url ? 2 : 0);

  const projectQuality = Math.min(25,
    Math.min(8, Math.round((Math.max(stars, 0) / Math.max(repos.length,1)) * 2)) +
    Math.min(7, Math.round((repos.filter(r => (r.description||"").length > 30).length / Math.max(repos.length,1)) * 7)) +
    Math.min(5, Math.round((new Set(repos.map(r=>r.language).filter(Boolean)).size / 4) * 5)) +
    Math.min(5, active > 0 ? 5 : repos.length ? 2 : 0)
  );

  const hygiene = Math.min(15,
    Math.round((namedWell / Math.max(repos.length,1)) * 7) +
    Math.round((licensed / Math.max(repos.length,1)) * 3) +
    Math.min(5, repos.length <= 25 ? 5 : 2)
  );

  // README presence cannot be inferred from the list endpoint; we intentionally do not fabricate it.
  const documentation = Math.min(15,
    Math.round((described / Math.max(repos.length,1)) * 10) +
    Math.min(5, repos.filter(r => (r.homepage||"").trim()).length)
  );

  const activity = Math.min(15,
    active >= 5 ? 15 : active >= 3 ? 12 : active >= 1 ? 8 : 3
  );

  const techVisibility = Math.min(15,
    Math.min(10, Object.keys(languageCounts).length * 3) +
    Math.min(5, repos.filter(r => (r.topics||[]).length > 0).length)
  );

  const scores = {
    profilePresentation, projectQuality, hygiene, documentation, activity, techVisibility
  };
  const total = Object.values(scores).reduce((a,b)=>a+b,0);

  const strengths = [];
  if (profile.bio) strengths.push("Your profile bio gives recruiters immediate context.");
  if (active) strengths.push(`${active} repositories were updated within the last 90 days.`);
  if (Object.keys(languageCounts).length >= 2) strengths.push(`Your repositories show a visible mix of ${Object.keys(languageCounts).slice(0,4).join(", ")}.`);
  if (stars + forks > 0) strengths.push(`Your public work has visible engagement: ${stars} stars and ${forks} forks.`);
  if (described) strengths.push(`${described} of ${repos.length} repositories have descriptions.`);
  if (!strengths.length) strengths.push("You have a public GitHub footprint to improve from.");

  const weaknesses = [];
  if (!profile.bio) weaknesses.push({priority:"HIGH", title:"Add a useful profile bio", why:"A recruiter should understand your direction immediately.", fix:"State your degree/role, strongest technologies and what you are building."});
  if (described < repos.length) weaknesses.push({priority:"HIGH", title:"Describe your repositories", why:"Undescribed projects are harder to evaluate quickly.", fix:"Give each important repository a one-line purpose and outcome."});
  if (active < 2) weaknesses.push({priority:"MEDIUM", title:"Make recent work visible", why:"Stale profiles can look abandoned.", fix:"Keep 1–2 meaningful projects actively maintained and document the progress."});
  if (licensed < Math.min(3,repos.length)) weaknesses.push({priority:"MEDIUM", title:"Add licenses where appropriate", why:"A license clarifies how others may use your code.", fix:"Add a suitable license to public projects where it makes sense."});
  if (Object.keys(languageCounts).length < 2 && repos.length > 1) weaknesses.push({priority:"NICE", title:"Make your technical range clearer", why:"Language visibility helps recruiters understand your stack.", fix:"Tag projects with topics and make the language used by each project intentional."});
  if (!weaknesses.length) weaknesses.push({priority:"NICE", title:"Polish your strongest project", why:"Small improvements can make a strong profile more recruiter-friendly.", fix:"Add screenshots, a concise README and a live/demo link."});

  const roast = [];
  if (!profile.bio) roast.push("Your bio is so mysterious that the recruiter has to do archaeology before deciding what you build.");
  if (described < repos.length) roast.push(`${repos.length - described} repositories skipped the description box. They chose silent mode.`);
  if (active === 0) roast.push("Your recent GitHub activity looks like it went on a very long vacation.");
  if (namedWell < repos.length) roast.push("A few repository names are doing their best to sound like temporary files.");
  if (stars + forks === 0 && repos.length) roast.push("The code has entered the chat, but the outside world has not pressed the star button yet.");
  if (!roast.length) roast.push("Okay, this GitHub actually has receipts. Someone has been cooking.");
  return { sorted, scores, total, strengths: strengths.slice(0,5), weaknesses: weaknesses.slice(0,5), roast: roast.slice(0,5), languageCounts, active, described, stars, forks, lastActive: sorted[0]?.updated_at || profile.updated_at };
}

export function scoreLabel(total) {
  if (total >= 90) return "Recruiter magnet 🚀";
  if (total >= 75) return "Strong profile — polish a few things.";
  if (total >= 60) return "Good potential — needs cleanup.";
  if (total >= 40) return "Your GitHub needs CPR.";
  return "We found the crime scene. Let's fix it.";
}

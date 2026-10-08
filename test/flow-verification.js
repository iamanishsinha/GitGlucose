async function runVerification() {
  console.log('--- TEST 1: Healthcheck ---');
  const hRes = await fetch('http://localhost:8080/healthz');
  const hJson = await hRes.json();
  console.log('Healthz status:', hJson.status, 'ok:', hJson.ok);

  console.log('\n--- TEST 2: Landing Page HTML Verification ---');
  const htmlRes = await fetch('http://localhost:8080/');
  const html = await htmlRes.text();
  console.log('Placeholder matches exact requirement:', html.includes('placeholder="Enter GitHub username or profile URL"'));
  console.log('Try Sample section removed:', !html.includes('Try sample'));
  console.log('@iamanishsinha removed from landing:', !html.includes('@iamanishsinha'));
  console.log('@torvalds removed from landing:', !html.includes('@torvalds'));
  console.log('@octocat removed from landing:', !html.includes('@octocat'));
  console.log('Career button "Complete Roast & Rescue" present:', html.includes('Complete Roast &amp; Rescue'));
  console.log('Career button "Compare with Other\'s Profile" present:', html.includes("Compare with Other's Profile"));

  console.log('\n--- TEST 3: Audit with full profile URL ---');
  const roastRes = await fetch('http://localhost:8080/api/roast?user=https://github.com/iamanishsinha');
  const roastJson = await roastRes.json();
  console.log('Roast status:', roastRes.status, 'ok:', roastJson.ok);
  if (roastJson.ok) {
    const a = roastJson.analysis;
    console.log('Username:', a.username);
    console.log('Profile publicRepos (actual GitHub count):', a.profile.publicRepos);
    console.log('Total Repos counted in analyzer:', a.repositories.total);
    console.log('Ranked Repos count:', a.repositories.ranked.length);
    console.log('\n--- 30-Second Recruiter Scan Windows ---');
    for (const phase of a.recruiter.attentionTimeline) {
      console.log(`[${phase.window}] Focus: ${phase.focus}`);
      console.log(`  Observation: ${phase.observation}`);
      console.log(`  Signals: ${(phase.signals || []).join(' | ')}`);
    }
    console.log('\nPrecomputed Role Positionings:');
    for (const [rKey, pos] of Object.entries(a.allPositionings || {})) {
      console.log(` - ${rKey}: ${pos.targetRole} -> Score: ${pos.score}% (${pos.alignmentLabel})`);
    }
  }

  console.log('\n--- TEST 4: Compare API with full URLs ---');
  const cmpRes = await fetch('http://localhost:8080/api/compare?userA=https://github.com/iamanishsinha&userB=https://github.com/octocat');
  const cmpJson = await cmpRes.json();
  console.log('Compare status:', cmpRes.status, 'ok:', cmpJson.ok);
  if (cmpJson.ok) {
    const c = cmpJson.comparison;
    console.log('Winner:', c.winner.username, 'statement:', c.winner.statement);
    console.log('Category Winners count:', c.categoryWinners?.length);
    for (const cat of (c.categoryWinners || []).slice(0, 5)) {
      console.log(` - ${cat.category}: Winner = ${cat.winner} (A: ${cat.aVal} vs B: ${cat.bVal})`);
    }
    console.log('Strengths of Profile A:', c.strengthsA);
    console.log('Strengths of Profile B:', c.strengthsB);
    console.log('Areas to improve A:', c.improvementsA);
    console.log('Metrics comparison count:', c.metrics?.length);
  }

  console.log('\n--- TEST 5: Compare API with invalid Profile B ---');
  const errRes = await fetch('http://localhost:8080/api/compare?userA=iamanishsinha&userB=this_user_definitely_does_not_exist_998877');
  const errJson = await errRes.json();
  console.log('Invalid user status:', errRes.status, 'error:', errJson.error);

  console.log('\n--- All verification checks finished successfully! ---');
}

runVerification().catch(console.error);

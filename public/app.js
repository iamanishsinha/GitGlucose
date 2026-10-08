/**
 * GitGlucose — Clean SaaS Dashboard Application
 * Tab-based 5-step navigation. Dynamic data, persistent state, zero hardcoding.
 */

// ── Application State ──────────────────────────────────────────────────────
const state = {
  auditInput: '',
  currentUsername: '',
  currentAnalysis: null,
  currentStep: 1,
  selectedRole: 'full-stack',
  completedTasks: new Set(),
  activeRescueTab: '30m',
};

// ── DOM Cache ──────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  // Layout
  landingView:        $('landing-view'),
  loadingState:       $('loading-state'),
  resultsContainer:   $('audit-results-container'),
  errorBanner:        $('error-banner'),
  errorMessage:       $('error-message'),
  btnCloseError:      $('btn-close-error'),
  liveRegion:         $('status-live-region'),
  toastContainer:     $('toast-container'),
  stepTabsNav:        $('step-tabs-nav'),
  btnExportMd:        $('btn-export-markdown'),
  btnNewAudit:        $('btn-new-audit'),
  btnNewAuditInline:  $('btn-new-audit-inline'),

  // Search form
  auditForm:          $('audit-form'),
  usernameInput:      $('username-input'),
  submitBtn:          $('submit-audit-btn'),
  loadingStepText:    $('loading-step-text'),

  // Panels
  panelStep1:         $('panel-step-1'),
  panelStep2:         $('panel-step-2'),
  panelStep3:         $('panel-step-3'),
  panelStep4:         $('panel-step-4'),
  panelStep5:         $('panel-step-5'),

  // Step 1 — Quick Roast
  displayUserAvatar:  $('display-user-avatar'),
  profileHandleTarget:$('profile-handle-target'),
  displayUserBio:     $('display-user-bio'),
  displayOverallScore:$('display-overall-score'),
  scoreRingFill:      $('score-ring-fill'),
  displayVerdictLabel:$('display-verdict-label'),
  displayVerdictDesc: $('display-verdict-desc'),
  displaySnapshotTime:$('display-snapshot-time'),
  quickStatLang:      $('quick-stat-lang'),
  quickStatRepos:     $('quick-stat-repos'),
  quickStatStars:     $('quick-stat-stars'),
  quickStatActivity:  $('quick-stat-activity'),
  roastLinesContainer:$('roast-lines-container'),
  suggestedBioText:   $('suggested-bio-text'),
  btnCopyBio:         $('btn-copy-bio'),
  btnGoDeepRoast:     $('btn-go-deep-roast'),
  btnGoRescueDirect:  $('btn-go-rescue-direct'),

  // Step 2 — Deep Dive
  radarPolygon:       $('radar-polygon'),
  radarPt1:           $('radar-pt-1'),
  radarPt2:           $('radar-pt-2'),
  radarPt3:           $('radar-pt-3'),
  radarPt4:           $('radar-pt-4'),
  radarPt5:           $('radar-pt-5'),
  scoreValFirstImpression: $('score-val-first-impression'),
  scoreValHygiene:    $('score-val-hygiene'),
  scoreValSubstance:  $('score-val-substance'),
  scoreValActivity:   $('score-val-activity'),
  scoreValRange:      $('score-val-range'),
  barFirstImpression: $('bar-first-impression'),
  barHygiene:         $('bar-hygiene'),
  barSubstance:       $('bar-substance'),
  barActivity:        $('bar-activity'),
  barRange:           $('bar-range'),
  shortlistStatusBadge: $('shortlist-status-badge'),
  recruiterTimelineContainer: $('recruiter-timeline-container'),
  repositoriesTableBody: $('repositories-table-body'),
  btnDeepToRescue:    $('btn-deep-to-rescue'),

  // Step 3 — Rescue
  rescuePersonalizedTitle: $('rescue-personalized-title'),
  projCurrentScore:   $('proj-current-score'),
  projPotentialScore: $('proj-potential-score'),
  projDeltaBadge:     $('proj-delta-badge'),
  barRescueProjection:$('bar-rescue-projection'),
  btnToggle30m:       $('btn-toggle-30m'),
  btnToggle7d:        $('btn-toggle-7d'),
  rescue30Ledger:     $('rescue-30-ledger'),
  rescue7dLedger:     $('rescue-7d-ledger'),
  rescue30TasksContainer: $('rescue-30-tasks-container'),
  rescue7dDaysContainer:  $('rescue-7d-days-container'),
  btnRescueToCareer:  $('btn-rescue-to-career'),

  // Step 4 — Career Fit
  targetRoleSelect:   $('target-role-select'),
  roleScoreCircle:    $('role-score-circle'),
  roleScoreStatement: $('role-score-statement'),
  roleMatchedList:    $('role-matched-list'),
  roleRecommendedBuild: $('role-recommended-build'),
  btnCareerToRescue:  $('btn-career-to-rescue'),
  btnCareerToCompare: $('btn-career-to-compare'),

  // Step 5 — Compare
  compareForm:        $('compare-form'),
  compareUserA:       $('compare-user-a'),
  compareUserB:       $('compare-user-b'),
  compareErrorBanner: $('compare-error-banner'),
  compareErrorMessage:$('compare-error-message'),
  compareLoadingState:$('compare-loading-state'),
  compareResultsWrapper: $('compare-results-wrapper'),
  cmpWinnerCard:      $('cmp-winner-card'),
  cmpWinnerTitle:     $('cmp-winner-title'),
  cmpWinnerDesc:      $('cmp-winner-desc'),
  cmpCategoriesContainer: $('cmp-categories-container'),
  cmpCardA:           $('cmp-card-a'),
  cmpCardB:           $('cmp-card-b'),
  compareBarsContainer: $('compare-bars-container'),
  cmpStrengthsATitle: $('cmp-strengths-a-title'),
  cmpStrengthsBTitle: $('cmp-strengths-b-title'),
  cmpImprovATitle:    $('cmp-improv-a-title'),
  cmpImprovBTitle:    $('cmp-improv-b-title'),
  cmpStrengthsAList:  $('cmp-strengths-a-list'),
  cmpStrengthsBList:  $('cmp-strengths-b-list'),
  cmpImprovAList:     $('cmp-improv-a-list'),
  cmpImprovBList:     $('cmp-improv-b-list'),
  cmpReposA:          $('cmp-repos-a'),
  cmpReposB:          $('cmp-repos-b'),
  compareObservationsList: $('compare-observations-list'),
};

// ── Utilities ──────────────────────────────────────────────────────────────
function announce(msg) {
  if (els.liveRegion) els.liveRegion.textContent = msg;
}

function showToast(message) {
  if (!els.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'studio-toast';
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 250ms ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 260);
  }, 2800);
}

function showError(msg) {
  if (els.errorMessage) els.errorMessage.textContent = msg;
  if (els.errorBanner) els.errorBanner.classList.remove('hidden');
  announce(`Error: ${msg}`);
}

function hideError() {
  if (els.errorBanner) els.errorBanner.classList.add('hidden');
}

function showCompareError(msg) {
  if (els.compareErrorMessage) els.compareErrorMessage.textContent = msg;
  if (els.compareErrorBanner) els.compareErrorBanner.classList.remove('hidden');
}

function hideCompareError() {
  if (els.compareErrorBanner) els.compareErrorBanner.classList.add('hidden');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Extract clean username from handle or full URL
function extractUsername(input) {
  if (!input || typeof input !== 'string') return '';
  let cleaned = input.trim();
  if (cleaned.startsWith('@')) cleaned = cleaned.slice(1).trim();
  if (cleaned.toLowerCase().includes('github.com')) {
    try {
      const urlStr = cleaned.startsWith('http://') || cleaned.startsWith('https://') ? cleaned : `https://${cleaned}`;
      const url = new URL(urlStr);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) cleaned = parts[0];
    } catch {
      const match = cleaned.match(/github\.com\/([^/?#\s]+)/i);
      if (match) cleaned = match[1];
    }
  }
  return cleaned.replace(/^[/#]+|[/?#].*$/g, '').trim();
}

// ── View Management ─────────────────────────────────────────────────────────
function showView(view) {
  // 'landing' | 'loading' | 'results'
  const landing  = els.landingView;
  const loading  = els.loadingState;
  const results  = els.resultsContainer;

  landing?.classList.toggle('hidden', view !== 'landing');
  loading?.classList.toggle('hidden', view !== 'loading');
  results?.classList.toggle('hidden', view !== 'results');

  if (view === 'results') {
    els.stepTabsNav?.classList.remove('hidden');
    els.btnNewAudit?.classList.remove('hidden');
    if (els.btnExportMd) els.btnExportMd.disabled = false;
  } else {
    els.stepTabsNav?.classList.add('hidden');
    els.btnNewAudit?.classList.add('hidden');
    if (els.btnExportMd) els.btnExportMd.disabled = true;
  }
}

// ── Step Navigation ─────────────────────────────────────────────────────────
function switchStep(stepNum) {
  state.currentStep = stepNum;

  // Update tab active state
  $$('.step-tab').forEach(btn => {
    const s = parseInt(btn.dataset.step, 10);
    btn.classList.toggle('active', s === stepNum);
  });

  // Show/hide panels
  [1, 2, 3, 4, 5].forEach(n => {
    const panel = $(`panel-step-${n}`);
    if (!panel) return;
    if (n === stepNum) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    }
  });

  // Maintain state selections when switching
  if (stepNum === 4 && els.targetRoleSelect) {
    els.targetRoleSelect.value = state.selectedRole;
  }
  if (stepNum === 5 && els.compareUserA) {
    els.compareUserA.value = state.auditInput || (state.currentUsername ? `https://github.com/${state.currentUsername}` : '');
  }

  // Scroll to top of results
  els.resultsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Radar Chart ─────────────────────────────────────────────────────────────
function updateRadar(scores) {
  if (!els.radarPolygon) return;
  const cx = 150, cy = 140, maxR = 110;
  const angles = [-90, -18, 54, 126, 198].map(d => (d * Math.PI) / 180);
  const vals = [
    Math.max(10, scores.firstImpression   || 20) / 100,
    Math.max(10, scores.repositoryHygiene || 20) / 100,
    Math.max(10, scores.substance         || 20) / 100,
    Math.max(10, scores.activity          || 20) / 100,
    Math.max(10, scores.range             || 20) / 100,
  ];
  const pts = vals.map((v, i) => ({
    x: Math.round(cx + v * maxR * Math.cos(angles[i])),
    y: Math.round(cy + v * maxR * Math.sin(angles[i])),
  }));
  els.radarPolygon.setAttribute('points', pts.map(p => `${p.x},${p.y}`).join(' '));
  const nodes = [els.radarPt1, els.radarPt2, els.radarPt3, els.radarPt4, els.radarPt5];
  nodes.forEach((node, i) => {
    if (node) { node.setAttribute('cx', pts[i].x); node.setAttribute('cy', pts[i].y); }
  });
}

// ── Score Ring ───────────────────────────────────────────────────────────────
function updateScoreRing(score) {
  if (!els.scoreRingFill) return;
  const circumference = 2 * Math.PI * 50; // r=50 → ~314
  const offset = circumference - (score / 100) * circumference;
  els.scoreRingFill.style.strokeDashoffset = offset;
}

// ── Rescue Score Display ─────────────────────────────────────────────────────
function updateRescueScoreDisplay() {
  if (!state.currentAnalysis) return;
  const baseScore     = state.currentAnalysis.scores.overall;
  const potentialScore = state.currentAnalysis.beforeAfter?.potentialScore || baseScore + 20;
  const bonus         = state.completedTasks.size * 4;
  const updatedScore  = Math.min(potentialScore, baseScore + bonus);

  if (els.projCurrentScore)   els.projCurrentScore.textContent = updatedScore;
  if (els.projPotentialScore) els.projPotentialScore.textContent = potentialScore;
  const diff = potentialScore - updatedScore;
  if (els.projDeltaBadge) {
    els.projDeltaBadge.textContent = diff > 0
      ? `+${diff} pts still available — keep going!`
      : '🎉 Max potential reached!';
  }
  if (els.barRescueProjection) {
    const pct = Math.min(100, Math.round((updatedScore / Math.max(1, potentialScore)) * 100));
    els.barRescueProjection.style.width = `${pct}%`;
  }
}

// ── Main Audit Runner ─────────────────────────────────────────────────────────
async function runAudit(rawInput, tone = 'medium', role = 'full-stack') {
  hideError();
  const username = extractUsername(rawInput);
  if (!username) {
    showError('Enter a valid GitHub username or URL like https://github.com/yourname');
    return;
  }

  // Preserve the exact original audit input
  state.auditInput = rawInput.trim();
  state.currentUsername = username;
  state.selectedRole = role;

  if (els.usernameInput) els.usernameInput.value = rawInput.trim();

  showView('loading');
  if (els.submitBtn) els.submitBtn.disabled = true;
  announce(`Auditing @${username}…`);

  const steps = [
    'Connecting to GitHub API…',
    'Scanning repositories and docs…',
    'Computing 5-axis score model…',
    'Running 30-second recruiter simulation…',
    'Building your personalized rescue plan…',
  ];
  let idx = 0;
  if (els.loadingStepText) els.loadingStepText.textContent = steps[0];
  const timer = setInterval(() => {
    idx = (idx + 1) % steps.length;
    if (els.loadingStepText) els.loadingStepText.textContent = steps[idx];
  }, 800);

  try {
    const url = `/api/roast?user=${encodeURIComponent(username)}&tone=${encodeURIComponent(tone)}&role=${encodeURIComponent(role)}`;
    const res = await fetch(url);
    const data = await res.json();
    clearInterval(timer);

    if (!res.ok || !data.ok) {
      throw new Error(data.message || data.error || 'Audit failed — please try again.');
    }

    state.currentAnalysis = data.analysis;
    state.completedTasks.clear();

    renderFullAnalysis(data.analysis);
    showView('results');
    switchStep(1);

    showToast(`✓ @${username} audited — ${data.analysis.scores.overall}/100`);
    announce(`Audit complete for @${username}. Score: ${data.analysis.scores.overall} out of 100.`);

  } catch (err) {
    clearInterval(timer);
    showView('landing');
    showError(err.message);
  } finally {
    if (els.submitBtn) els.submitBtn.disabled = false;
  }
}

// ── Master Render ─────────────────────────────────────────────────────────────
function renderFullAnalysis(analysis) {
  const profile = analysis.profile       || {};
  const scores  = analysis.scores        || {};
  const tech    = analysis.technologies  || {};
  const repos   = analysis.repositories  || { ranked: [] };
  const roast   = analysis.roast         || {};
  const recruiter = analysis.recruiter   || {};
  const rescue  = analysis.rescue        || {};

  // ── Step 1: Quick Roast ──────────────────────────────────────────────────
  if (els.displayUserAvatar) {
    els.displayUserAvatar.src = profile.avatarUrl || 'https://avatars.githubusercontent.com/u/583231?v=4';
    els.displayUserAvatar.alt = `@${analysis.username}`;
  }
  if (els.profileHandleTarget) els.profileHandleTarget.textContent = `@${analysis.username}`;
  if (els.displayUserBio)      els.displayUserBio.textContent = profile.bio || 'No bio set — adding one is a quick +6 point win.';
  if (els.displaySnapshotTime) els.displaySnapshotTime.textContent = `Snapshot: ${analysis.snapshot?.formattedDate || 'Recent'}`;

  // Score
  const overallScore = scores.overall ?? 0;
  if (els.displayOverallScore) els.displayOverallScore.textContent = overallScore;
  updateScoreRing(overallScore);

  // Verdict
  const verdict = analysis.verdict || {};
  if (els.displayVerdictLabel) {
    els.displayVerdictLabel.textContent = verdict.label || 'DEVELOPING';
    const vl = (verdict.label || '').toLowerCase();
    els.displayVerdictLabel.className = `verdict-pill ${vl}`;
  }
  if (els.displayVerdictDesc) els.displayVerdictDesc.textContent = verdict.description || '';

  // Quick Stats
  const repoCount = profile.publicRepos !== undefined ? profile.publicRepos : (repos.ranked?.length || 0);
  if (els.quickStatLang)     els.quickStatLang.textContent     = tech.primaryLanguage || '—';
  if (els.quickStatRepos)    els.quickStatRepos.textContent    = repoCount;
  if (els.quickStatStars)    els.quickStatStars.textContent    = (repos.ranked || []).reduce((a, r) => a + (r.stars || 0), 0);
  if (els.quickStatActivity) els.quickStatActivity.textContent = analysis.activity
    ? `${analysis.activity.level?.toUpperCase() || '—'} · ${analysis.activity.daysSinceLastPush ?? '?'}d ago`
    : '—';

  // Roast lines
  if (els.roastLinesContainer) {
    const lines = roast.lines || [];
    els.roastLinesContainer.innerHTML = lines.length
      ? lines.map(line => `
          <div class="roast-line-item">
            <span class="roast-bullet">•</span>
            <span>${escapeHtml(line)}</span>
          </div>`).join('')
      : '<p style="color:var(--ink-3);font-size:13px;">No roast lines generated.</p>';
  }

  // Bio suggestion
  if (els.suggestedBioText) els.suggestedBioText.textContent = roast.bioSuggestion || 'Software Developer passionate about building impactful products.';

  // Update "Rescue @user" names in nav buttons
  $$('.nav-target-name').forEach(el => { el.textContent = `@${analysis.username}`; });
  if (els.btnDeepToRescue) els.btnDeepToRescue.innerHTML = `🍬 Rescue <span class="nav-target-name">@${escapeHtml(analysis.username)}</span> →`;

  // ── Step 2: Deep Dive ────────────────────────────────────────────────────
  setTimeout(() => {
    updateRadar(scores);

    const bars = [
      [els.scoreValFirstImpression, els.barFirstImpression, scores.firstImpression,   'First Impression'],
      [els.scoreValHygiene,         els.barHygiene,         scores.repositoryHygiene, 'Code Hygiene'],
      [els.scoreValSubstance,       els.barSubstance,       scores.substance,         'Substance'],
      [els.scoreValActivity,        els.barActivity,        scores.activity,          'Momentum'],
      [els.scoreValRange,           els.barRange,           scores.range,             'Range'],
    ];
    bars.forEach(([valEl, barEl, val]) => {
      if (valEl) valEl.textContent = `${val ?? '--'} / 100`;
      if (barEl)  barEl.style.width = `${val ?? 0}%`;
    });
  }, 50);

  // Shortlist badge
  const sim = recruiter.shortlistSimulation || {};
  if (els.shortlistStatusBadge) {
    els.shortlistStatusBadge.textContent = sim.status || 'MAYBE';
    els.shortlistStatusBadge.className = 'shortlist-badge';
    if (sim.status === 'SHORTLIST') els.shortlistStatusBadge.classList.add('green');
    else if (sim.status === 'PASS') els.shortlistStatusBadge.classList.add('red');
  }

  // Recruiter timeline (populated dynamically with real analysis)
  if (els.recruiterTimelineContainer) {
    const timeline = recruiter.attentionTimeline || [];
    els.recruiterTimelineContainer.innerHTML = timeline.map(phase => {
      const focusText = phase.focus || phase.label || 'Recruiter Scan';
      const obsText = phase.observation || phase.signal || phase.evidence || 'No observation recorded.';
      const signalsList = (phase.signals && Array.isArray(phase.signals)) ? phase.signals : [];
      return `
        <div class="timeline-phase-card">
          <span class="timeline-phase-time">${escapeHtml(phase.window)}</span>
          <div>
            <p class="timeline-phase-focus">${escapeHtml(focusText)}</p>
            <p class="timeline-phase-observation">${escapeHtml(obsText)}</p>
            ${signalsList.length ? `
              <div class="timeline-signals" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
                ${signalsList.map(sig => `<span class="stat-pill" style="font-size:11px;padding:2px 8px;">${escapeHtml(sig)}</span>`).join('')}
              </div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  // Repositories table
  if (els.repositoriesTableBody) {
    const ranked = repos.ranked || [];
    if (ranked.length === 0) {
      els.repositoriesTableBody.innerHTML = `
        <tr><td colspan="6" style="text-align:center;padding:24px;color:var(--ink-3)">No public repositories found.</td></tr>`;
    } else {
      els.repositoriesTableBody.innerHTML = ranked.map((r, i) => {
        const signalClass = r.signalTag === 'HIGH SIGNAL' ? 'signal-high'
                          : r.signalTag?.includes('NOISE') ? 'signal-low'
                          : 'signal-med';
        return `<tr>
          <td style="color:var(--ink-4);font-size:12px;font-family:var(--mono)">${i + 1}</td>
          <td>
            <a href="${escapeHtml(r.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="repo-link">${escapeHtml(r.name)}</a>
            <div class="repo-desc">${escapeHtml(r.description || 'No description')}</div>
          </td>
          <td><span class="lang-tag">${escapeHtml(r.language || 'Plain')}</span></td>
          <td style="font-family:var(--mono);font-size:13px;">${r.stars} ★</td>
          <td><span class="signal-badge ${signalClass}">${escapeHtml(r.signalTag || '—')}</span></td>
          <td class="repo-score">${r.score}/100</td>
        </tr>`;
      }).join('');
    }
  }

  // ── Step 3: Rescue ───────────────────────────────────────────────────────
  if (els.rescuePersonalizedTitle) els.rescuePersonalizedTitle.textContent = `Rescue @${analysis.username}`;
  updateRescueScoreDisplay();
  renderRescue30Tasks(rescue.quick30 || []);
  renderRescue7dDays(rescue.full7Day || []);

  // ── Step 4: Career Fit ───────────────────────────────────────────────────
  if (els.targetRoleSelect) els.targetRoleSelect.value = state.selectedRole;
  const initialPos = analysis.allPositionings?.[state.selectedRole] || analysis.positioning;
  renderCareerFit(initialPos);

  // ── Step 5: Pre-fill compare form ────────────────────────────────────────
  if (els.compareUserA) {
    els.compareUserA.value = state.auditInput || (state.currentUsername ? `https://github.com/${state.currentUsername}` : '');
  }
  if (els.compareUserB) {
    els.compareUserB.value = '';
  }
}

// ── Rescue Plan Renderers ─────────────────────────────────────────────────────
function renderRescue30Tasks(tasks) {
  if (!els.rescue30TasksContainer) return;
  if (!tasks.length) {
    els.rescue30TasksContainer.innerHTML = '<p style="color:var(--ink-3);font-size:13px;">No quick tasks available.</p>';
    return;
  }
  els.rescue30TasksContainer.innerHTML = tasks.map((task, idx) => {
    const id = `task-30-${idx}`;
    const done = state.completedTasks.has(id);
    const impactClass = task.impact === 'high' ? 'impact-high' : task.impact === 'medium' ? 'impact-med' : 'impact-low';
    return `
      <div class="task-row ${done ? 'task-done' : ''}" data-task-id="${id}">
        <div class="task-checkbox"></div>
        <div class="task-body">
          <div class="task-meta">
            <span class="task-time">${escapeHtml(task.window || '5–10 min')}</span>
            <span class="task-impact ${impactClass}">${escapeHtml((task.impact || 'medium').toUpperCase())} IMPACT</span>
          </div>
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-action">${escapeHtml(task.action)}</div>
        </div>
      </div>`;
  }).join('');

  // Click handler
  els.rescue30TasksContainer.querySelectorAll('.task-row').forEach(row => {
    row.addEventListener('click', () => {
      const taskId = row.dataset.taskId;
      const done = state.completedTasks.has(taskId);
      if (done) {
        state.completedTasks.delete(taskId);
        row.classList.remove('task-done');
        showToast('Task unchecked');
      } else {
        state.completedTasks.add(taskId);
        row.classList.add('task-done');
        showToast('Task done! Score +4 🍬');
      }
      updateRescueScoreDisplay();
    });
  });
}

function renderRescue7dDays(days) {
  if (!els.rescue7dDaysContainer) return;
  if (!days.length) {
    els.rescue7dDaysContainer.innerHTML = '<p style="color:var(--ink-3);font-size:13px;">No 7-day plan available.</p>';
    return;
  }
  els.rescue7dDaysContainer.innerHTML = days.map(d => `
    <div class="day-row">
      <span class="day-badge">${d.day}</span>
      <div class="day-focus">${escapeHtml((d.focus || '').toUpperCase())}</div>
      <div class="day-task">${escapeHtml(d.task)}</div>
    </div>`).join('');
}

// ── Career Fit Renderer ──────────────────────────────────────────────────────
function renderCareerFit(positioning) {
  if (!positioning) return;
  if (els.roleScoreCircle)    els.roleScoreCircle.textContent  = `${positioning.score}%`;
  if (els.roleScoreStatement) els.roleScoreStatement.textContent = positioning.statement || positioning.summary || '';

  const matched = positioning.matchedEvidence || positioning.evidenceMatched || [];
  if (els.roleMatchedList) {
    els.roleMatchedList.innerHTML = matched.length
      ? matched.map(m => `<li><strong>${escapeHtml((m.category || m.keyword || '').toUpperCase())}</strong> — ${escapeHtml(m.evidence || `found in ${m.count} repo(s)`)}</li>`).join('')
      : '<li>No strong matches for this role yet — build one project to unlock your fit score.</li>';
  }

  if (els.roleRecommendedBuild && positioning.recommendations && positioning.recommendations.length > 0) {
    els.roleRecommendedBuild.textContent = positioning.recommendations[0];
  }
}

// ── Comparison Engine ─────────────────────────────────────────────────────────
async function runComparison(uA, uB) {
  hideCompareError();
  els.compareResultsWrapper?.classList.add('hidden');
  els.compareLoadingState?.classList.remove('hidden');

  const btn = $('btn-run-compare');
  if (btn) { btn.disabled = true; btn.textContent = 'Comparing…'; }

  try {
    const res  = await fetch(`/api/compare?userA=${encodeURIComponent(uA)}&userB=${encodeURIComponent(uB)}`);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || data.message || `Failed to compare profiles (${res.status}).`);
    }

    const cmp = data.comparison;
    renderFullComparison(cmp);
    els.compareResultsWrapper?.classList.remove('hidden');
    showToast(`✓ Comparison complete — @${uA} vs @${uB}`);
    announce(`Comparison complete for @${uA} vs @${uB}`);

  } catch (err) {
    const friendlyMsg = err.message.includes('Failed to fetch')
      ? 'Could not connect to comparison service. Please check your network connection and verify both GitHub profile URLs.'
      : err.message;
    showCompareError(friendlyMsg);
  } finally {
    els.compareLoadingState?.classList.add('hidden');
    if (btn) { btn.disabled = false; btn.textContent = 'Compare Now →'; }
  }
}

function renderFullComparison(cmp) {
  const pA  = cmp.profileA;
  const pB  = cmp.profileB;

  // 1. Winner Announcement
  if (els.cmpWinnerTitle) {
    if (cmp.winner.username === 'TIE') {
      els.cmpWinnerTitle.textContent = 'Dead Heat — Both Profiles Tied!';
      els.cmpWinnerDesc.textContent = cmp.winner.statement;
    } else {
      els.cmpWinnerTitle.textContent = `@${cmp.winner.username} Takes the Lead (+${cmp.winner.leadPoints} pts)`;
      els.cmpWinnerDesc.textContent = cmp.winner.statement;
    }
  }

  // 2. Category Winners Grid
  if (els.cmpCategoriesContainer) {
    const cats = cmp.categoryWinners || [];
    els.cmpCategoriesContainer.innerHTML = cats.map(c => {
      const isLeadA = c.winner === pA.username;
      const isLeadB = c.winner === pB.username;
      const leadClass = isLeadA ? 'lead-a' : isLeadB ? 'lead-b' : '';
      const winnerTag = c.winner === 'TIE' ? '🤝 Tied' : `🏆 @${escapeHtml(c.winner)}`;
      return `
        <div class="cmp-cat-card">
          <span class="cmp-cat-name">${escapeHtml(c.category)}</span>
          <span class="cmp-cat-winner ${leadClass}">${winnerTag}</span>
          <span class="cmp-cat-vals">@${escapeHtml(pA.username)}: ${c.aVal} vs @${escapeHtml(pB.username)}: ${c.bVal}</span>
        </div>`;
    }).join('');
  }

  // 3. Profile overview cards
  function renderCmpCard(p, isA) {
    return `
      <div class="cmp-user-header">
        <img class="cmp-avatar" src="${escapeHtml(p.avatarUrl || 'https://avatars.githubusercontent.com/u/583231?v=4')}" alt="@${escapeHtml(p.username)}">
        <div>
          <div class="cmp-name">${escapeHtml(p.name || p.username)}</div>
          <div class="cmp-handle">@${escapeHtml(p.username)}</div>
        </div>
      </div>
      <div class="cmp-score" style="color: ${isA ? 'var(--accent)' : 'var(--blue)'};">${p.scores.overall}<span>/100</span></div>
      <div class="cmp-stats">
        <div class="cmp-stat"><span class="cmp-stat-num">${p.totalStars ?? 0}</span><span class="cmp-stat-lbl">Stars</span></div>
        <div class="cmp-stat"><span class="cmp-stat-num">${p.publicRepos ?? 0}</span><span class="cmp-stat-lbl">Repos</span></div>
        <div class="cmp-stat"><span class="cmp-stat-num">${escapeHtml(p.topLanguage || '—')}</span><span class="cmp-stat-lbl">Stack</span></div>
        <div class="cmp-stat"><span class="cmp-stat-num">${p.followers ?? 0}</span><span class="cmp-stat-lbl">Followers</span></div>
      </div>`;
  }
  if (els.cmpCardA) els.cmpCardA.innerHTML = renderCmpCard(pA, true);
  if (els.cmpCardB) els.cmpCardB.innerHTML = renderCmpCard(pB, false);

  // 4. Metric Bars
  if (els.compareBarsContainer) {
    const metrics = cmp.metrics || [];
    els.compareBarsContainer.innerHTML = metrics.map(m => {
      const pctA = Math.min(100, Math.round((m.a / Math.max(1, m.max)) * 100));
      const pctB = Math.min(100, Math.round((m.b / Math.max(1, m.max)) * 100));
      return `
        <div class="cmp-metric-row">
          <div class="cmp-metric-label">${escapeHtml(m.label)}</div>
          <div class="cmp-bar-pair">
            <div class="cmp-bar-line">
              <span class="cmp-bar-name">@${escapeHtml(pA.username)}</span>
              <div class="cmp-bar-track"><div class="cmp-bar-fill-a" style="width:${pctA}%"></div></div>
              <span class="cmp-bar-val" style="color:var(--accent)">${m.a} ${escapeHtml(m.unit || '')}</span>
            </div>
            <div class="cmp-bar-line">
              <span class="cmp-bar-name">@${escapeHtml(pB.username)}</span>
              <div class="cmp-bar-track"><div class="cmp-bar-fill-b" style="width:${pctB}%"></div></div>
              <span class="cmp-bar-val" style="color:var(--blue)">${m.b} ${escapeHtml(m.unit || '')}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // 5. Strengths & Improvements
  if (els.cmpStrengthsATitle) els.cmpStrengthsATitle.textContent = `Strengths of @${pA.username}`;
  if (els.cmpStrengthsBTitle) els.cmpStrengthsBTitle.textContent = `Strengths of @${pB.username}`;
  if (els.cmpImprovATitle)    els.cmpImprovATitle.textContent    = `Areas where @${pA.username} can improve:`;
  if (els.cmpImprovBTitle)    els.cmpImprovBTitle.textContent    = `Areas where @${pB.username} can improve:`;

  if (els.cmpStrengthsAList) {
    els.cmpStrengthsAList.innerHTML = (cmp.strengthsA || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }
  if (els.cmpStrengthsBList) {
    els.cmpStrengthsBList.innerHTML = (cmp.strengthsB || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }
  if (els.cmpImprovAList) {
    els.cmpImprovAList.innerHTML = (cmp.improvementsA || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }
  if (els.cmpImprovBList) {
    els.cmpImprovBList.innerHTML = (cmp.improvementsB || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }

  // 6. Top repos
  function renderRepoCol(p) {
    return `
      <h3 class="card-title" style="margin-bottom:12px">Top Repos: @${escapeHtml(p.username)}</h3>
      ${(p.topRepos || []).map(r => `
        <div class="cmp-repo-item">
          <a href="${escapeHtml(r.htmlUrl || '#')}" target="_blank" rel="noopener noreferrer" class="cmp-repo-name">${escapeHtml(r.name)}</a>
          <div class="cmp-repo-meta">${escapeHtml(r.language || 'Plain')} · ${r.stars ?? 0} ★ · Health: ${r.score}/100</div>
          ${r.description ? `<div style="font-size:11px;color:var(--ink-3);margin-top:2px;">${escapeHtml(r.description)}</div>` : ''}
        </div>`).join('') || '<p style="color:var(--ink-3);font-size:13px;">No standout repos.</p>'}`;
  }
  if (els.cmpReposA) els.cmpReposA.innerHTML = renderRepoCol(pA);
  if (els.cmpReposB) els.cmpReposB.innerHTML = renderRepoCol(pB);

  // 7. Observations
  if (els.compareObservationsList) {
    els.compareObservationsList.innerHTML = (cmp.observations || []).map(obs =>
      `<li>${escapeHtml(obs)}</li>`).join('');
  }
}

// ── Markdown Export ───────────────────────────────────────────────────────────
function exportMarkdownReport(analysis) {
  const filename = `gitglucose-report-${analysis.username}-${new Date().toISOString().slice(0, 10)}.md`;
  const md = `# GitGlucose Report — @${analysis.username}

**Score:** ${analysis.scores.overall} / 100 (${analysis.verdict.label})
**Date:** ${analysis.snapshot?.formattedDate || new Date().toUTCString()}

---

## 5-Axis Score
- First Impression: ${analysis.scores.firstImpression}/100
- Code Hygiene: ${analysis.scores.repositoryHygiene}/100
- Substance: ${analysis.scores.substance}/100
- Push Momentum: ${analysis.scores.activity}/100
- Language Range: ${analysis.scores.range}/100

## The Roast
${(analysis.roast?.lines || []).map(l => `- ${l}`).join('\n')}

**Suggested Bio:** ${analysis.roast?.bioSuggestion || ''}

## Recruiter Verdict
**Status:** ${analysis.recruiter?.shortlistSimulation?.status || '—'}
**Summary:** ${analysis.recruiter?.shortlistSimulation?.reasoning || 'Evaluated against market benchmarks.'}

## 30-Second Recruiter Attention Scan
${(analysis.recruiter?.attentionTimeline || []).map(p => `### [${p.window}] ${p.focus || p.label}
- **Observation:** ${p.observation || p.signal || ''}
${p.signals && p.signals.length ? `- **Signals:** ${p.signals.join(' | ')}` : ''}`).join('\n\n')}

## Career Fit (${analysis.positioning?.targetRole || 'Full Stack Developer'})
- **Fit Score:** ${analysis.positioning?.score || 0}% (${analysis.positioning?.alignmentLabel || 'EVALUATED'})
- **Assessment:** ${analysis.positioning?.statement || analysis.positioning?.summary || 'Role fit calculated from repository signal.'}

## Standout Repositories
${(analysis.repositories?.ranked || []).slice(0, 5).map((r, i) => `${i + 1}. **[${r.name}](${r.htmlUrl})** — ${r.language || 'Code'} · ${r.stars || 0}★ · Health: ${r.score}/100\n   ${r.description || 'No description provided.'}`).join('\n')}

## 30-Minute Quick Wins
${(analysis.rescue?.quick30 || []).map(t => `- [ ] **${t.window}** — ${t.title}: ${t.action}`).join('\n')}

## 7-Day Sprint
${(analysis.rescue?.full7Day || []).map(d => `- **Day ${d.day}** (${d.focus}): ${d.task}`).join('\n')}

*Generated by GitGlucose — Portfolio Intelligence*
`.trim();

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Markdown report exported ✓');
}

// ── Initialization ─────────────────────────────────────────────────────────────
function init() {

  // Landing form submit
  els.auditForm?.addEventListener('submit', e => {
    e.preventDefault();
    const raw  = els.usernameInput?.value.trim() || '';
    if (!raw) return;
    const tone = document.querySelector('input[name="tone"]:checked')?.value || 'medium';
    runAudit(raw, tone);
  });

  // Close error
  els.btnCloseError?.addEventListener('click', hideError);

  // New Audit
  function resetToLanding() {
    state.auditInput = '';
    state.currentUsername = '';
    state.currentAnalysis = null;
    state.completedTasks.clear();
    if (els.usernameInput) els.usernameInput.value = '';
    showView('landing');
  }
  els.btnNewAudit?.addEventListener('click', resetToLanding);
  els.btnNewAuditInline?.addEventListener('click', resetToLanding);
  $('brand-home-link')?.addEventListener('click', e => {
    if (state.currentAnalysis) { e.preventDefault(); resetToLanding(); }
  });

  // Tab navigation
  $$('.step-tab').forEach(btn => {
    btn.addEventListener('click', () => switchStep(parseInt(btn.dataset.step, 10)));
  });

  // Fork buttons in Step 1
  els.btnGoDeepRoast?.addEventListener('click', () => switchStep(2));
  els.btnGoDeepRoast?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') switchStep(2); });
  els.btnGoRescueDirect?.addEventListener('click', () => switchStep(3));
  els.btnGoRescueDirect?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') switchStep(3); });

  // Back/Next navigation
  $$('.btn-back-to-roast').forEach(b => b.addEventListener('click', () => switchStep(1)));
  $$('.btn-back-to-deep').forEach(b  => b.addEventListener('click', () => switchStep(2)));
  $$('.btn-back-to-rescue').forEach(b => b.addEventListener('click', () => switchStep(3)));
  $$('.btn-back-to-career').forEach(b => b.addEventListener('click', () => switchStep(4)));
  els.btnDeepToRescue?.addEventListener('click',   () => switchStep(3));
  els.btnRescueToCareer?.addEventListener('click', () => switchStep(4));

  // Career Fit Actions (Requirement 6)
  els.btnCareerToRescue?.addEventListener('click', () => switchStep(3));
  els.btnCareerToCompare?.addEventListener('click', () => switchStep(5));

  // Rescue plan tabs
  els.btnToggle30m?.addEventListener('click', () => {
    els.btnToggle30m.classList.add('active');
    els.btnToggle7d.classList.remove('active');
    els.rescue30Ledger.classList.remove('hidden');
    els.rescue7dLedger.classList.add('hidden');
  });
  els.btnToggle7d?.addEventListener('click', () => {
    els.btnToggle7d.classList.add('active');
    els.btnToggle30m.classList.remove('active');
    els.rescue7dLedger.classList.remove('hidden');
    els.rescue30Ledger.classList.add('hidden');
  });

  // Copy bio
  els.btnCopyBio?.addEventListener('click', async () => {
    const text = els.suggestedBioText?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      els.btnCopyBio.textContent = 'Copied!';
      showToast('Bio copied to clipboard');
      setTimeout(() => { if (els.btnCopyBio) els.btnCopyBio.textContent = 'Copy Bio'; }, 2000);
    } catch { showToast('Copy failed — please copy manually'); }
  });

  // Role selector: UPDATE IN PLACE WITHOUT REDIRECT (Requirement 5)
  els.targetRoleSelect?.addEventListener('change', () => {
    if (!state.currentAnalysis) return;
    const role = els.targetRoleSelect.value;
    state.selectedRole = role;
    const pos = state.currentAnalysis.allPositionings?.[role] || state.currentAnalysis.positioning;
    renderCareerFit(pos);
    showToast(`Career fit updated for ${pos?.targetRole || role}`);
  });

  // Compare form submit (Requirements 7, 8, 9, 10, 11)
  els.compareForm?.addEventListener('submit', e => {
    e.preventDefault();
    const rawA = els.compareUserA?.value.trim() || state.auditInput || state.currentUsername || '';
    const rawB = els.compareUserB?.value.trim() || '';

    const uA = extractUsername(rawA);
    const uB = extractUsername(rawB);

    if (!uA) {
      showCompareError('Profile A is required.');
      return;
    }
    if (!uB) {
      showCompareError('Please enter a valid GitHub profile URL or username for Profile B.');
      return;
    }
    runComparison(uA, uB);
  });

  // Export Markdown
  els.btnExportMd?.addEventListener('click', () => {
    if (state.currentAnalysis) exportMarkdownReport(state.currentAnalysis);
  });

  // Auto-run from URL query param
  try {
    const p = new URLSearchParams(window.location.search);
    const u = p.get('user');
    if (u) {
      if (els.usernameInput) els.usernameInput.value = u;
      runAudit(u, p.get('tone') || 'medium');
    }
  } catch { /* non-fatal */ }

  // Start with landing visible and empty input
  showView('landing');
}

document.addEventListener('DOMContentLoaded', init);

/**
 * Deterministic Roast Fallback Engine
 * Generates witty, evidence-backed roast lines and bio suggestions
 * directly from deterministic findings when Gemini is disabled, times out, or fails.
 */

/**
 * Generates deterministic roast lines based on detected findings and selected tone
 * @param {object} context Analysis summary context (findings, scores, profile, stats)
 * @param {'gentle' | 'medium' | 'spicy'} tone
 * @returns {{ roast: string[], bio: string, source: 'fallback' }}
 */
export function generateFallbackRoast(context, tone = 'medium') {
  const { findings, scores, profile, stats } = context;
  const username = profile.login || 'developer';
  const totalRepos = stats.totalRepos || 0;
  const noDescCount = stats.reposWithoutDescription || 0;
  const noReadmeCount = stats.reposWithoutReadme || 0;
  const hasProfileReadme = stats.hasProfileReadme;
  const activeCount = stats.activeRepos || 0;

  const candidateLines = [];

  // 1. Profile / Bio / Identity roast
  if (!profile.bio || profile.bio.trim().length === 0) {
    if (tone === 'spicy') {
      candidateLines.push(`Your bio is completely blank. In the recruiter world, that's the digital equivalent of submitting a blank resume with just a name on top.`);
    } else if (tone === 'gentle') {
      candidateLines.push(`Your profile doesn't have a bio yet, leaving visitors to guess what kind of engineer you aspire to be.`);
    } else {
      candidateLines.push(`Your GitHub bio is a ghost town. Recruiters currently have to hire a private investigator just to figure out what you build.`);
    }
  } else if (!hasProfileReadme) {
    if (tone === 'spicy') {
      candidateLines.push(`You have ${totalRepos} repositories but no profile README. It's like inviting guests to an open house without a front door.`);
    } else {
      candidateLines.push(`Your profile has projects, but no front door. A profile README would give reviewers an instant reason to stay.`);
    }
  }

  // 2. Repository Hygiene / Descriptions roast
  if (noDescCount > 0) {
    const ratio = totalRepos > 0 ? Math.round((noDescCount / totalRepos) * 100) : 0;
    if (tone === 'spicy') {
      candidateLines.push(`${noDescCount} of your repositories have no description. You're playing hide-and-seek with your own code, and recruiters are refusing to seek.`);
    } else if (tone === 'gentle') {
      candidateLines.push(`${noDescCount} repositories are missing descriptions, making it hard to appreciate what each project achieved.`);
    } else {
      candidateLines.push(`${noDescCount} of your repositories (${ratio}%) have zero description. The commit history is doing all the heavy lifting while the metadata sleeps.`);
    }
  }

  // 3. Documentation / README roast
  if (noReadmeCount > 0) {
    if (tone === 'spicy') {
      candidateLines.push(`${noReadmeCount} repositories have no README. The code might be doing the work, but your documentation is doing absolutely nothing to help.`);
    } else if (tone === 'gentle') {
      candidateLines.push(`Adding introductory READMEs to your top projects would turn raw code into compelling portfolio pieces.`);
    } else {
      candidateLines.push(`No README in ${noReadmeCount} projects means whoever lands on your GitHub has to read the raw source code just to find out how to run it.`);
    }
  }

  // 4. Activity / Stale repos roast
  if (activeCount === 0 && totalRepos > 0) {
    if (tone === 'spicy') {
      candidateLines.push(`Not a single repository has seen activity in the last 90 days. Your GitHub looks like a preserved museum exhibit from a previous tech era.`);
    } else {
      candidateLines.push(`Your recent push activity has cooled down. A quick commit or documentation refresh will signal an actively learning developer.`);
    }
  } else if (stats.noiseCount > 2) {
    if (tone === 'spicy') {
      candidateLines.push(`You've built enough throwaway test repositories to prove you're busy. Now let's prune the noise so they prove you're good.`);
    } else {
      candidateLines.push(`A few test and playground repositories are crowding out your strongest work. Archiving them will immediately sharpen your signal.`);
    }
  }

  // 5. Positive, perfectionist, or substance observations
  if (scores.overall >= 75) {
    if (tone === 'spicy') {
      candidateLines.push(`Under the hood you have genuine technical substance—you're just hiding it behind developer humility instead of flaunting live demos.`);
      candidateLines.push(`Your repos are actually organized. A recruiter might faint from shock before they even reach the hire button.`);
    } else if (tone === 'gentle') {
      candidateLines.push(`Under the hood, you have genuine technical substance—a bit of visual polish will make it shine.`);
      candidateLines.push(`Your repository foundation is strong; pinning your top two builds will immediately hook prospective employers.`);
    } else {
      candidateLines.push(`Under the hood, you have genuine technical substance—now it just needs live deployment links to seal the deal.`);
      candidateLines.push(`Your profile is cleaner than 85% of GitHub, but remember: recruiters want to click live URLs, not compile source code.`);
    }
  }

  // 6. Fill up to at least 3 lines if sparse
  const topLang = context.technologies?.primaryLanguage || 'Software';
  if (candidateLines.length < 3) {
    candidateLines.push(`Heavy focus on ${topLang} detected. Make sure your flagship README explains your architecture choices, not just setup commands.`);
  }
  if (candidateLines.length < 3) {
    candidateLines.push(`You have the ingredients of a solid portfolio, but right now it looks more like a work-in-progress workshop than an intentional showcase.`);
  }
  if (candidateLines.length < 3) {
    candidateLines.push(`Remember: recruiters spend under 30 seconds scanning. Guide their eyes directly to what you're proudest of.`);
  }

  // Cap at 4 distinct lines
  const finalLines = candidateLines.slice(0, 4);

  // Generate suggested bio based on top detected languages
  const suggestedBio = `${topLang} Developer | Building resilient systems & open-source tools | Focused on clean architecture and practical solutions.`;

  return {
    roast: finalLines,
    bio: suggestedBio.slice(0, 200),
    source: 'fallback',
  };
}

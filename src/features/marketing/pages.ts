/**
 * SEO marketing pages (use-cases + guides) for ScoutCopilot.
 * Data-driven; the shared MarketingPage template renders them.
 *   use-case → /:lang/for/:slug     guide → /:lang/guides/:slug
 *
 * RULES (Roger, 2026-07-02):
 *  - Do NOT name the data source or claim "open data" — describe capabilities/value only.
 *  - Do NOT compare against Wyscout/Hudl (they are our data providers, not competitors).
 */

export interface MarketingSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface MarketingPageData {
  slug: string
  section: 'for' | 'guides'
  eyebrow: string
  /** short label used in the footer column */
  navLabel: string
  title: string
  metaDescription: string
  h1: string
  intro: string
  sections: MarketingSection[]
}

const PAGES: MarketingPageData[] = [
  // ── For [audience] ──
  {
    slug: 'academies',
    section: 'for',
    eyebrow: 'For academies',
    navLabel: 'Academies',
    title: 'ScoutCopilot for Academies — Identify & Track Young Talent',
    metaDescription:
      'How football academies use ScoutCopilot to identify young talent early, benchmark players against their peers, and keep development on track — with AI-assisted scouting.',
    h1: 'ScoutCopilot for academies',
    intro:
      'Academies live or die by their recruitment and development pipeline. ScoutCopilot helps academy staff spot promising players earlier, compare them fairly against their age group, and keep a living record of who to watch — so decisions are based on evidence, not just the last game you happened to see.',
    sections: [
      {
        heading: 'Find talent earlier',
        paragraphs: [
          'Search and filter players by position, age band, minutes and output, then let ScoutCopilot surface profiles that fit what your academy is looking for. You spend less time trawling and more time evaluating the players who actually matter.',
        ],
      },
      {
        heading: 'Compare fairly within an age group',
        paragraphs: [
          'A 16-year-old’s numbers only mean something next to their peers. ScoutCopilot’s comparison view puts prospects side by side so you can see who genuinely stands out, not just who plays for a bigger club.',
        ],
      },
      {
        heading: 'Keep development on track',
        bullets: [
          'Build watchlists per age group and revisit them each window',
          'Track how a prospect’s output moves over a season',
          'Share a clear, structured report with coaches and the technical director',
        ],
      },
    ],
  },
  {
    slug: 'agents',
    section: 'for',
    eyebrow: 'For agents',
    navLabel: 'Agents',
    title: 'ScoutCopilot for Agents — Build the Case for Your Players',
    metaDescription:
      'How football agents use ScoutCopilot to benchmark their players, find the right clubs, and build a data-backed case in negotiations — fast.',
    h1: 'ScoutCopilot for agents',
    intro:
      'An agent’s job is to make the case for their player and put them in front of the right clubs. ScoutCopilot gives you the evidence to do both: benchmark your player against comparable profiles, and turn that into a clean, shareable report you can put in front of a sporting director.',
    sections: [
      {
        heading: 'Benchmark your player',
        paragraphs: [
          'Show exactly where your player ranks among comparable profiles for their position and role. A data-backed comparison is far more persuasive than a highlight reel alone.',
        ],
      },
      {
        heading: 'Target the right clubs',
        paragraphs: [
          'Understand which squads have a gap your player fills. Matching a player to a genuine need is what turns interest into a transfer.',
        ],
      },
      {
        heading: 'Move quickly in a window',
        bullets: [
          'Generate a structured player report in minutes',
          'Compare your player to a club’s current options',
          'Keep a shortlist of clubs and revisit it as the window develops',
        ],
      },
    ],
  },
  {
    slug: 'clubs',
    section: 'for',
    eyebrow: 'For clubs',
    navLabel: 'Clubs',
    title: 'ScoutCopilot for Clubs — Recruit With Evidence',
    metaDescription:
      'How clubs use ScoutCopilot to recruit with evidence: find players who fit the squad’s needs, compare targets, and align recruitment with the technical staff.',
    h1: 'ScoutCopilot for clubs',
    intro:
      'Recruitment mistakes are expensive. ScoutCopilot helps clubs build a repeatable, evidence-led process: identify targets that fit the squad’s actual needs, compare them objectively, and get everyone from analysts to the sporting director looking at the same picture.',
    sections: [
      {
        heading: 'Recruit to the squad’s needs',
        paragraphs: [
          'Start from the gap you need to fill and work outward. ScoutCopilot helps you find players whose profile matches the role, not just the name that’s trending.',
        ],
      },
      {
        heading: 'Compare targets objectively',
        paragraphs: [
          'Put your shortlist side by side and let the evidence narrow it down. Fewer gut calls, fewer regrets.',
        ],
      },
      {
        heading: 'Align the whole recruitment team',
        bullets: [
          'One shared shortlist everyone can see',
          'Structured reports that travel well between staff',
          'A record of why each decision was made',
        ],
      },
    ],
  },
  {
    slug: 'analysts',
    section: 'for',
    eyebrow: 'For analysts',
    navLabel: 'Analysts',
    title: 'ScoutCopilot for Analysts — Faster From Data to Insight',
    metaDescription:
      'How performance analysts use ScoutCopilot to go from data to insight faster: shortlist, compare and report on players without the manual spreadsheet grind.',
    h1: 'ScoutCopilot for analysts',
    intro:
      'Analysts spend too much time assembling data and too little interpreting it. ScoutCopilot takes the grind out of shortlisting, comparison and reporting so you can focus on the judgement calls only a human can make.',
    sections: [
      {
        heading: 'Skip the spreadsheet grind',
        paragraphs: [
          'Search, filter and compare in one place instead of stitching together exports. The time you save goes straight back into analysis.',
        ],
      },
      {
        heading: 'Report in a format staff will read',
        paragraphs: [
          'Turn a comparison into a clean, structured report the technical staff can actually act on — no more dense tables nobody opens.',
        ],
      },
    ],
  },
  {
    slug: 'recruiters',
    section: 'for',
    eyebrow: 'For recruiters',
    navLabel: 'Recruiters',
    title: 'ScoutCopilot for Recruiters — A Repeatable Shortlisting Process',
    metaDescription:
      'How recruitment teams use ScoutCopilot to run a repeatable shortlisting process, keep watchlists current, and hand decision-makers a clear case.',
    h1: 'ScoutCopilot for recruiters',
    intro:
      'Good recruitment is a process, not a hunch. ScoutCopilot gives recruiters the tools to run that process consistently: build shortlists, keep them current, and hand decision-makers a clear, comparable case for each name.',
    sections: [
      {
        heading: 'Build shortlists that stay current',
        paragraphs: [
          'Keep a living watchlist per position and revisit it each window, so you’re never starting from scratch when a need appears.',
        ],
      },
      {
        heading: 'Hand over a clear case',
        paragraphs: [
          'Give decision-makers a like-for-like comparison and a structured report, so the final call is informed and defensible.',
        ],
      },
    ],
  },

  // ── Guides ──
  {
    slug: 'how-to-scout-with-data',
    section: 'guides',
    eyebrow: 'Guide',
    navLabel: 'How to scout with data',
    title: 'How to Scout Players With Data — A Practical Guide',
    metaDescription:
      'A practical guide to scouting players with data: define the role, use the right metrics for the position, compare within peers, and combine numbers with the eye test.',
    h1: 'How to scout players with data',
    intro:
      'Data won’t replace watching football, but it will make you far more efficient and far less biased. This guide walks through a simple, repeatable way to scout with data — and where the human eye still matters most.',
    sections: [
      {
        heading: '1. Define the role before the player',
        paragraphs: [
          'Start with the job you need done — the position, the system, the responsibilities. Scouting without a role definition is how you end up impressed by numbers that don’t fit your team.',
        ],
      },
      {
        heading: '2. Use metrics that fit the position',
        paragraphs: [
          'A pressing forward and a target man are not judged on the same numbers. Pick the outputs that actually describe success in the role you defined.',
        ],
      },
      {
        heading: '3. Always compare within peers',
        paragraphs: [
          'A number in isolation is meaningless. Compare a player against others of the same position, age band and level to see who truly stands out.',
        ],
      },
      {
        heading: '4. Let data shortlist, let the eye decide',
        paragraphs: [
          'Use data to get from thousands of players to a credible shortlist quickly — then watch them. The best decisions combine both.',
        ],
      },
    ],
  },
  {
    slug: 'building-a-shortlist',
    section: 'guides',
    eyebrow: 'Guide',
    navLabel: 'Building a shortlist',
    title: 'Building a Player Shortlist — A Step-by-Step Approach',
    metaDescription:
      'A step-by-step approach to building a football shortlist: set clear criteria, filter to a manageable set, compare like-for-like, and keep it living across windows.',
    h1: 'Building a player shortlist',
    intro:
      'A shortlist is only useful if it’s built on clear criteria and kept alive. Here’s a simple approach that keeps your shortlist focused, comparable and ready when a need appears.',
    sections: [
      {
        heading: 'Set the criteria first',
        paragraphs: [
          'Position, age band, level and the two or three outputs that matter most for the role. Write them down — a shortlist without criteria is just a list.',
        ],
      },
      {
        heading: 'Filter to a manageable set',
        paragraphs: [
          'Narrow from the full pool to a dozen or so credible names. You want a set small enough to actually evaluate properly.',
        ],
      },
      {
        heading: 'Compare like-for-like, then keep it living',
        bullets: [
          'Put the shortlist side by side and rank objectively',
          'Watch the top names before committing',
          'Revisit and update the list every window',
        ],
      },
    ],
  },
  {
    slug: 'player-comparison',
    section: 'guides',
    eyebrow: 'Guide',
    navLabel: 'Player comparison guide',
    title: 'How to Compare Football Players Fairly',
    metaDescription:
      'How to compare football players fairly: match position and role, normalise for minutes and level, and read the numbers alongside context.',
    h1: 'How to compare players fairly',
    intro:
      'Most player comparisons are unfair — different positions, different levels, different minutes. Here’s how to make a comparison that actually means something.',
    sections: [
      {
        heading: 'Match the position and role',
        paragraphs: [
          'Only compare players who do a similar job. A comparison across roles tells you almost nothing useful.',
        ],
      },
      {
        heading: 'Normalise for minutes and level',
        paragraphs: [
          'Per-90 output and the level a player competes at matter enormously. A big number in a weaker league is not the same as a smaller one against elite opposition.',
        ],
      },
      {
        heading: 'Read numbers with context',
        paragraphs: [
          'Style, team system and role all shape a player’s output. Use the numbers to ask better questions, not to end the conversation.',
        ],
      },
    ],
  },
  {
    slug: 'data-driven-scouting',
    section: 'guides',
    eyebrow: 'Guide',
    navLabel: 'Data-driven scouting',
    title: 'Data-Driven Scouting — Getting Started',
    metaDescription:
      'Getting started with data-driven scouting: what it is, what it’s good for, its limits, and how to combine it with traditional scouting.',
    h1: 'Getting started with data-driven scouting',
    intro:
      'Data-driven scouting isn’t about replacing scouts — it’s about pointing them at the right players faster and checking bias. Here’s what it’s good at, where it falls short, and how to blend it with the traditional approach.',
    sections: [
      {
        heading: 'What it’s good for',
        paragraphs: [
          'Covering far more players than any human network could watch, surfacing under-the-radar names, and providing an objective second opinion that counters bias.',
        ],
      },
      {
        heading: 'Where it falls short',
        paragraphs: [
          'Data struggles with things it can’t measure — temperament, decision-making under pressure, fit with a dressing room. That’s where scouts remain irreplaceable.',
        ],
      },
      {
        heading: 'Blend the two',
        paragraphs: [
          'The strongest setups use data to shortlist and prioritise, then send scouts to watch the names that matter. Neither on its own is as good as both together.',
        ],
      },
    ],
  },
]

export const MARKETING_PAGES: Record<string, MarketingPageData> = Object.fromEntries(
  PAGES.map((p) => [`${p.section}/${p.slug}`, p]),
)

export const FOR_PAGES = PAGES.filter((p) => p.section === 'for')
export const GUIDE_PAGES = PAGES.filter((p) => p.section === 'guides')

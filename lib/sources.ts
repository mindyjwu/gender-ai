// Source catalog for GenAI.
// Single source of truth for (a) the About page and (b) the RAG seed.
// Scope: the VERBAL layer of gendered communication — word choice, hedging,
// turn-taking, floor time, disclosure. Nonverbal and neuroscience work is out of scope.

export type Tier = 1 | 2 | 3

export type SourceType =
  | 'meta-analysis'
  | 'study'
  | 'book'
  | 'textbook'
  | 'critique'
  | 'popular'
  | 'documentary'
  | 'fiction'

export interface SourceScores {
  /** Who published it and where: peer-reviewed flagship journal / university press = 5, self-published or trade = 1. */
  authority: number
  /** Quality of the evidence: sample size, method, replication. Fiction is 1 by definition. */
  factualness: number
  /** How widely the finding is accepted (or the work is used) by scholars in language-and-gender research. */
  consensus: number
}

export interface Source {
  id: string
  tier: Tier
  type: SourceType
  author: string
  work: string
  year: number
  venue?: string
  finding: string
  scores: SourceScores
  /** Set when the source is catalogued for transparency but deliberately NOT fed to the model. */
  excluded?: string
}

/** Weights sum to 1. Factualness is weighted highest because the app makes empirical claims. */
export const WEIGHTS = { authority: 0.3, factualness: 0.4, consensus: 0.3 } as const

export function weightedScore(s: SourceScores): number {
  const raw = s.authority * WEIGHTS.authority + s.factualness * WEIGHTS.factualness + s.consensus * WEIGHTS.consensus
  return Math.round(raw * 10) / 10
}

export const TIERS: Record<Tier, { name: string; label: string; why: string }> = {
  1: {
    name: 'Primary evidence',
    label: 'Tier 1',
    why:
      'Meta-analyses and large-sample quantitative studies published in peer-reviewed journals. A meta-analysis pools dozens to hundreds of independent studies, so its effect sizes are the most reliable numbers available. These sources set the factual claims the model is allowed to make.',
  },
  2: {
    name: 'Secondary scholarship',
    label: 'Tier 2',
    why:
      'Rigorous single studies, scholarly frameworks, standard textbooks, and academic critiques. Still peer-reviewed or university-press, but either based on one sample, one setting, or on interpretive rather than statistical methods. These sources supply the vocabulary and mechanisms; their numbers are checked against Tier 1 before use.',
  },
  3: {
    name: 'Tertiary & cultural',
    label: 'Tier 3',
    why:
      'Popular science, documentaries, and fiction. These carry no evidentiary weight — they are catalogued to set tone, to show how the topic lives in culture, and to be explicit about which well-known works the model does not treat as fact.',
  },
}

export const SOURCES: Source[] = [
  // ───────────────────────── Tier 1 — Primary evidence ─────────────────────────
  {
    id: 'hyde-2005',
    tier: 1,
    type: 'meta-analysis',
    author: 'Janet Shibley Hyde',
    work: 'The Gender Similarities Hypothesis',
    year: 2005,
    venue: 'American Psychologist, 60(6), 581–592',
    finding:
      'Reviews 46 meta-analyses. About 78% of measured gender differences are small or near zero (d ≤ 0.35), including nearly all verbal and communication variables. The framing source for this project.',
    scores: { authority: 5, factualness: 5, consensus: 5 },
  },
  {
    id: 'leaper-ayres-2007',
    tier: 1,
    type: 'meta-analysis',
    author: 'Campbell Leaper & Melanie Ayres',
    work: 'A Meta-Analytic Review of Gender Variations in Adults’ Language Use',
    year: 2007,
    venue: 'Personality and Social Psychology Review, 11(4), 328–363',
    finding:
      'Men are slightly more talkative (d = −0.14); women use slightly more affiliative speech (d = 0.12); men slightly more assertive speech (d = 0.09). Setting, partner and task moderate the effects more than gender does.',
    scores: { authority: 5, factualness: 5, consensus: 5 },
  },
  {
    id: 'leaper-robnett-2011',
    tier: 1,
    type: 'meta-analysis',
    author: 'Campbell Leaper & Rachael Robnett',
    work: 'Women Are More Likely Than Men to Use Tentative Language, Aren’t They?',
    year: 2011,
    venue: 'Psychology of Women Quarterly, 35(1), 129–142',
    finding:
      'Women use more hedges, tag questions and disclaimers (d = 0.23). The gap is larger in groups, with strangers and in lab tasks, and near zero in familiar settings — tentative language works as a politeness strategy, not a sign of uncertainty.',
    scores: { authority: 4, factualness: 5, consensus: 4 },
  },
  {
    id: 'anderson-leaper-1998',
    tier: 1,
    type: 'meta-analysis',
    author: 'Kristin Anderson & Campbell Leaper',
    work: 'Meta-Analyses of Gender Effects on Conversational Interruption',
    year: 1998,
    venue: 'Sex Roles, 39, 225–252',
    finding:
      'Men make more intrusive (floor-taking) interruptions (d = 0.33), but the overall interruption difference is small (d = 0.15) and depends on group size and setting. Replaces the widely repeated "men make 96% of interruptions" claim, which came from 31 conversations.',
    scores: { authority: 4, factualness: 4, consensus: 4 },
  },
  {
    id: 'mehl-2007',
    tier: 1,
    type: 'study',
    author: 'Matthias Mehl, Simine Vazire, Nairán Ramírez-Esparza, Richard Slatcher & James Pennebaker',
    work: 'Are Women Really More Talkative Than Men?',
    year: 2007,
    venue: 'Science, 317(5834), 82',
    finding:
      'Recorded 396 people’s daily speech with wearable microphones. Both women and men spoke about 16,000 words per day; the difference was not significant. Disproves the "women speak 20,000 words, men 7,000" myth.',
    scores: { authority: 5, factualness: 4, consensus: 5 },
  },
  {
    id: 'hyde-linn-1988',
    tier: 1,
    type: 'meta-analysis',
    author: 'Janet Shibley Hyde & Marcia Linn',
    work: 'Gender Differences in Verbal Ability: A Meta-Analysis',
    year: 1988,
    venue: 'Psychological Bulletin, 104(1), 53–69',
    finding:
      '165 studies, 1.4 million participants. Overall verbal-ability difference favoring women is d = 0.11 — negligible. Whatever style differences exist, they are not differences in verbal skill.',
    scores: { authority: 5, factualness: 5, consensus: 5 },
  },
  {
    id: 'newman-2008',
    tier: 1,
    type: 'study',
    author: 'Matthew Newman, Carla Groom, Lori Handelman & James Pennebaker',
    work: 'Gender Differences in Language Use: An Analysis of 14,000 Text Samples',
    year: 2008,
    venue: 'Discourse Processes, 45(3), 211–236',
    finding:
      'Women used more pronouns, emotion words and references to social and psychological processes; men used more numbers, articles, long words, object references and swear words. Effects are consistent but small (most d < 0.3).',
    scores: { authority: 4, factualness: 4, consensus: 4 },
  },
  {
    id: 'park-2016',
    tier: 1,
    type: 'study',
    author: 'Gregory Park, David Yaden, H. Andrew Schwartz et al.',
    work: 'Women Are Warmer but No Less Assertive than Men: Gender and Language on Facebook',
    year: 2016,
    venue: 'PLoS ONE, 11(5), e0155885',
    finding:
      'About 66,000 users. Women’s language rated warmer, more compassionate and more polite; men’s colder, more impersonal and more hostile. Assertiveness was equal. The "assertive man / tentative woman" split does not survive at scale.',
    scores: { authority: 4, factualness: 4, consensus: 4 },
  },
  {
    id: 'schwartz-2013',
    tier: 1,
    type: 'study',
    author: 'H. Andrew Schwartz, Johannes Eichstaedt, Margaret Kern et al.',
    work: 'Personality, Gender, and Age in the Language of Social Media: The Open-Vocabulary Approach',
    year: 2013,
    venue: 'PLoS ONE, 8(9), e73791',
    finding:
      '75,000 volunteers, 700 million words. Gender predictable from word choice at ~92% accuracy — proof that aggregate vocabulary differences are real — while individual overlap remains large.',
    scores: { authority: 4, factualness: 4, consensus: 4 },
  },
  {
    id: 'dindia-allen-1992',
    tier: 1,
    type: 'meta-analysis',
    author: 'Kathryn Dindia & Mike Allen',
    work: 'Sex Differences in Self-Disclosure: A Meta-Analysis',
    year: 1992,
    venue: 'Psychological Bulletin, 112(1), 106–124',
    finding:
      '205 studies. Women self-disclose slightly more (d = 0.18), mostly to other women and to close partners; the difference nearly vanishes with strangers.',
    scores: { authority: 5, factualness: 4, consensus: 4 },
  },
  {
    id: 'eagly-johnson-1990',
    tier: 1,
    type: 'meta-analysis',
    author: 'Alice Eagly & Blair Johnson',
    work: 'Gender and Leadership Style: A Meta-Analysis',
    year: 1990,
    venue: 'Psychological Bulletin, 108(2), 233–256',
    finding:
      'Women lead somewhat more democratically and participatively; men more autocratically. The gap is clearest in lab studies and shrinks in real organizations, where role expectations override gender.',
    scores: { authority: 5, factualness: 5, consensus: 4 },
  },
  {
    id: 'jaffee-hyde-2000',
    tier: 1,
    type: 'meta-analysis',
    author: 'Sara Jaffee & Janet Shibley Hyde',
    work: 'Gender Differences in Moral Orientation: A Meta-Analysis',
    year: 2000,
    venue: 'Psychological Bulletin, 126(5), 703–726',
    finding:
      '113 studies testing Gilligan’s care-vs-justice claim. Care orientation d = 0.28 favoring women, justice d = 0.19 favoring men — small and inconsistent. Gilligan’s framework is kept as vocabulary, not as a measured difference.',
    scores: { authority: 5, factualness: 5, consensus: 5 },
  },

  // ─────────────────────── Tier 2 — Secondary scholarship ───────────────────────
  {
    id: 'carli-1990',
    tier: 2,
    type: 'study',
    author: 'Linda Carli',
    work: 'Gender, Language, and Influence',
    year: 1990,
    venue: 'Journal of Personality and Social Psychology, 59(5), 941–951',
    finding:
      'Women used more tentative language when talking with men than with women. Tentative women were more persuasive to male listeners and less persuasive to female listeners — hedging is audience-adaptive.',
    scores: { authority: 5, factualness: 4, consensus: 4 },
  },
  {
    id: 'brescoll-2011',
    tier: 2,
    type: 'study',
    author: 'Victoria Brescoll',
    work: 'Who Takes the Floor and Why: Gender, Power, and Volubility in Organizations',
    year: 2011,
    venue: 'Administrative Science Quarterly, 56(4), 622–641',
    finding:
      'Senate floor records plus experiments: gaining power increases how much men talk but not women, because powerful women who talk more are rated less competent. Floor time tracks power and backlash risk, not a female preference for brevity.',
    scores: { authority: 4, factualness: 4, consensus: 4 },
  },
  {
    id: 'karpowitz-mendelberg-2014',
    tier: 2,
    type: 'book',
    author: 'Christopher Karpowitz & Tali Mendelberg',
    work: 'The Silent Sex: Gender, Deliberation, and Institutions',
    year: 2014,
    venue: 'Princeton University Press',
    finding:
      'Controlled deliberation experiments: women speak less than men in mixed groups under majority rule, and reach parity only when they are the majority or the group must decide unanimously. Institutions, not dispositions, set who talks.',
    scores: { authority: 4, factualness: 4, consensus: 4 },
  },
  {
    id: 'jacobi-schweers-2017',
    tier: 2,
    type: 'study',
    author: 'Tonja Jacobi & Dylan Schweers',
    work: 'Justice, Interrupted: The Effect of Gender, Ideology, and Seniority at Supreme Court Oral Arguments',
    year: 2017,
    venue: 'Virginia Law Review, 103, 1379–1496',
    finding:
      'Decades of oral-argument transcripts: female justices are interrupted roughly three times as often as male justices, by advocates and by colleagues, even after controlling for seniority.',
    scores: { authority: 3, factualness: 4, consensus: 3 },
  },
  {
    id: 'mulac-2001',
    tier: 2,
    type: 'study',
    author: 'Anthony Mulac, James Bradac & Pamela Gibbons',
    work: 'Empirical Support for the Gender-as-Culture Hypothesis',
    year: 2001,
    venue: 'Human Communication Research, 27(1), 121–152',
    finding:
      'Catalogs the "gender-linked language effect": women — intensifiers, hedges, questions, emotion references, longer sentences; men — quantity references, directives, judgmental adjectives, elliptical sentences, "I" references. The most concrete feature list available.',
    scores: { authority: 4, factualness: 4, consensus: 3 },
  },
  {
    id: 'eckert-mcconnell-ginet-2003',
    tier: 2,
    type: 'textbook',
    author: 'Penelope Eckert & Sally McConnell-Ginet',
    work: 'Language and Gender',
    year: 2003,
    venue: 'Cambridge University Press (2nd ed. 2013)',
    finding:
      'The standard graduate textbook. Frames gendered speech as practice within communities rather than fixed traits; synthesizes the hedging, inclusive-language and collaborative-style literature.',
    scores: { authority: 5, factualness: 4, consensus: 5 },
  },
  {
    id: 'cameron-2007',
    tier: 2,
    type: 'critique',
    author: 'Deborah Cameron',
    work: 'The Myth of Mars and Venus: Do Men and Women Really Speak Different Languages?',
    year: 2007,
    venue: 'Oxford University Press',
    finding:
      'A linguist’s review of the evidence: popular "different languages" claims are overstated; most measured differences are small, situational and heavily overlapping. The main counterweight in this catalog.',
    scores: { authority: 5, factualness: 4, consensus: 4 },
  },
  {
    id: 'holmes-1995',
    tier: 2,
    type: 'book',
    author: 'Janet Holmes',
    work: 'Women, Men and Politeness',
    year: 1995,
    venue: 'Longman',
    finding:
      'New Zealand corpus data on compliments and apologies: women give and receive more compliments and use apologies as social lubricant rather than admissions of fault. Real data, one national corpus.',
    scores: { authority: 4, factualness: 3, consensus: 4 },
  },
  {
    id: 'coates-2004',
    tier: 2,
    type: 'textbook',
    author: 'Jennifer Coates',
    work: 'Women, Men and Language',
    year: 2004,
    venue: 'Routledge (3rd ed.)',
    finding:
      'Standard sociolinguistics textbook; strongest on turn-taking, same-gender talk and the difference between overlapping (supportive) and interrupting (competitive) speech.',
    scores: { authority: 4, factualness: 3, consensus: 4 },
  },
  {
    id: 'way-2011',
    tier: 2,
    type: 'book',
    author: 'Niobe Way',
    work: 'Deep Secrets: Boys’ Friendships and the Crisis of Connection',
    year: 2011,
    venue: 'Harvard University Press',
    finding:
      'Longitudinal interviews with about 135 boys: in early adolescence they talk openly about emotional intimacy, then learn to suppress that talk by late adolescence. Lower male emotional disclosure looks learned, not innate.',
    scores: { authority: 4, factualness: 3, consensus: 3 },
  },
  {
    id: 'tannen-1990',
    tier: 2,
    type: 'book',
    author: 'Deborah Tannen',
    work: 'You Just Don’t Understand: Women and Men in Conversation',
    year: 1990,
    venue: 'William Morrow',
    finding:
      'Introduced "rapport talk" (connection-oriented) vs "report talk" (status/information-oriented). Influential and widely taught, but interpretive: built on transcribed examples rather than measured samples, and criticized for treating tendencies as categories.',
    scores: { authority: 4, factualness: 2, consensus: 3 },
  },
  {
    id: 'lakoff-1975',
    tier: 2,
    type: 'book',
    author: 'Robin Lakoff',
    work: 'Language and Woman’s Place',
    year: 1975,
    venue: 'Harper & Row',
    finding:
      'The founding text of the field. Proposed "women’s language": hedges, tag questions, intensifiers, super-polite forms. Based on introspection, not data; several claims were later partly confirmed (Leaper & Robnett 2011; Mulac et al. 2001) and others not.',
    scores: { authority: 4, factualness: 2, consensus: 3 },
  },
  {
    id: 'gilligan-1982',
    tier: 2,
    type: 'book',
    author: 'Carol Gilligan',
    work: 'In a Different Voice',
    year: 1982,
    venue: 'Harvard University Press',
    finding:
      'Argued women reason about moral problems through an "ethic of care" and men through an "ethic of justice." Culturally important; empirically weak — the meta-analysis (Jaffee & Hyde 2000) finds only small, inconsistent differences.',
    scores: { authority: 4, factualness: 2, consensus: 2 },
  },

  // ──────────────────────── Tier 3 — Tertiary & cultural ────────────────────────
  {
    id: 'pennebaker-2011',
    tier: 3,
    type: 'popular',
    author: 'James Pennebaker',
    work: 'The Secret Life of Pronouns',
    year: 2011,
    venue: 'Bloomsbury',
    finding:
      'Accessible account of the word-count research behind Newman et al. (2008) and Mehl et al. (2007). Reliable, but a popularization — the underlying papers are what the model cites.',
    scores: { authority: 4, factualness: 3, consensus: 3 },
  },
  {
    id: 'gray-1992',
    tier: 3,
    type: 'popular',
    author: 'John Gray',
    work: 'Men Are from Mars, Women Are from Venus',
    year: 1992,
    venue: 'HarperCollins',
    finding:
      'The best-selling account of the "different planets" idea (men retreat to a "cave," women talk problems through). No empirical basis; the talkativeness and assertiveness claims are contradicted by Mehl et al. (2007) and Park et al. (2016).',
    scores: { authority: 1, factualness: 1, consensus: 1 },
    excluded: 'Catalogued for transparency. Not used by the model.',
  },
  {
    id: 'mask-you-live-in-2015',
    tier: 3,
    type: 'documentary',
    author: 'Jennifer Siebel Newsom (dir.)',
    work: 'The Mask You Live In',
    year: 2015,
    venue: 'The Representation Project',
    finding:
      'Documentary on how boys learn to suppress emotional talk. Advocacy in form, but it interviews the researchers behind Tier 2 work (Niobe Way, Michael Kimmel). Useful for tone, not for numbers.',
    scores: { authority: 2, factualness: 2, consensus: 2 },
  },
  {
    id: 'hjernevask-2010',
    tier: 3,
    type: 'documentary',
    author: 'Harald Eia (NRK)',
    work: 'Hjernevask (“Brainwash”): The Gender Equality Paradox',
    year: 2010,
    venue: 'NRK, Norway',
    finding:
      'Provocative TV series pitting gender-studies scholars against biology-leaning psychologists. Illustrates the nature–nurture argument; one-sided in editing and contested by both sides.',
    scores: { authority: 2, factualness: 2, consensus: 1 },
  },
  {
    id: 'no-more-boys-and-girls-2017',
    tier: 3,
    type: 'documentary',
    author: 'BBC Two',
    work: 'No More Boys and Girls: Can Our Kids Go Gender Free?',
    year: 2017,
    venue: 'BBC',
    finding:
      'A single classroom of about 23 seven-year-olds tries a gender-neutral term. Engaging and illustrative; the sample is far too small to support any claim.',
    scores: { authority: 2, factualness: 1, consensus: 2 },
  },
  {
    id: 'austen-1813',
    tier: 3,
    type: 'fiction',
    author: 'Jane Austen',
    work: 'Pride and Prejudice',
    year: 1813,
    finding:
      'The archetype of talk as negotiation of status and relationship. Elizabeth’s indirection and irony against Darcy’s blunt declaratives are the "rapport vs report" contrast two centuries before Tannen named it.',
    scores: { authority: 3, factualness: 1, consensus: 3 },
  },
  {
    id: 'hemingway-1927',
    tier: 3,
    type: 'fiction',
    author: 'Ernest Hemingway',
    work: 'Hills Like White Elephants',
    year: 1927,
    finding:
      'A short story told almost entirely in dialogue, in which a couple avoids naming the decision between them. A staple of discourse-analysis teaching for indirectness, hedging and who controls the topic.',
    scores: { authority: 3, factualness: 1, consensus: 4 },
  },
  {
    id: 'carver-1981',
    tier: 3,
    type: 'fiction',
    author: 'Raymond Carver',
    work: 'What We Talk About When We Talk About Love',
    year: 1981,
    finding:
      'Two couples try, and fail, to define love across an evening of drinks. Shows men holding the floor with anecdote and abstraction while the women anchor the talk in specific people.',
    scores: { authority: 3, factualness: 1, consensus: 2 },
  },
  {
    id: 'rooney-2018',
    tier: 3,
    type: 'fiction',
    author: 'Sally Rooney',
    work: 'Normal People',
    year: 2018,
    finding:
      'A contemporary study of two people who repeatedly mis-read each other’s under-stated messages. Sets the tone for how small differences in directness compound into misunderstanding.',
    scores: { authority: 2, factualness: 1, consensus: 2 },
  },
  {
    id: 'brodesser-akner-2019',
    tier: 3,
    type: 'fiction',
    author: 'Taffy Brodesser-Akner',
    work: 'Fleishman Is in Trouble',
    year: 2019,
    finding:
      'The same marriage narrated first from the husband’s side, then the wife’s. Dramatizes how the "same" conversation is reported differently depending on who is speaking — the app’s central premise.',
    scores: { authority: 2, factualness: 1, consensus: 2 },
  },
]

export function sourcesByTier(tier: Tier): Source[] {
  return SOURCES.filter(s => s.tier === tier).sort((a, b) => weightedScore(b.scores) - weightedScore(a.scores))
}

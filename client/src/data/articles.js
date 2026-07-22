// Dummy articles — replaced by real scraped + AI-analyzed data in later phases.
// bias: -1 (far left) … 0 (center) … +1 (far right)
// sentiment: -1 (negative) … +1 (positive)

export const articles = [
  {
    id: 'a1',
    slug: 'senate-passes-clean-energy-package',
    category: 'Politics',
    source: 'The Meridian Post',
    author: 'Dana Whitfield',
    publishedAt: '2026-07-17T08:40:00Z',
    readMins: 6,
    title: 'Senate Passes Sweeping Clean Energy Package After Marathon Session',
    dek: 'The 51–49 vote caps months of negotiation and hands the administration its biggest legislative win of the year — but the fine print reveals deep compromises.',
    bias: -0.62,
    sentiment: 0.35,
    summary:
      'After a 21-hour session, the Senate approved a $410B clean energy package. The bill expands solar and wind tax credits through 2035 but drops the proposed carbon fee entirely — a concession to moderate holdouts.',
    body: [
      'The Senate chamber erupted just after 4 a.m. as the final tally settled at 51 votes to 49, ending a marathon session that had stretched through the night and testing the patience of even the chamber’s most seasoned members.',
      'The package — formally the American Energy Resilience Act — commits $410 billion over nine years to grid modernization, domestic solar manufacturing, and an aggressive expansion of wind-lease auctions along both coasts.',
      'But the bill that passed is leaner than the one introduced in March. Gone is the economy-wide carbon fee. Gone, too, is the mandate that utilities reach 80 percent clean generation by 2032, replaced by a voluntary target and a grant program critics call toothless.',
      'Supporters framed the compromises as the price of progress. "We didn’t get everything," said one senior senator leaving the chamber, "but the direction is now set in law, and directions are hard to reverse."',
      'Industry reaction split along familiar lines. Renewable trade groups called it a generational investment; fossil-fuel producers warned of grid instability and promised court challenges to the leasing provisions within weeks.',
      'The House takes up the measure Tuesday, where leadership says the votes are already secured.',
    ],
    tags: ['Energy', 'Senate', 'Climate'],
  },
  {
    id: 'a2',
    slug: 'fed-holds-rates-steady',
    category: 'Economy',
    source: 'Ledger & Line',
    author: 'Marcus Oyelaran',
    publishedAt: '2026-07-16T21:15:00Z',
    readMins: 4,
    title: 'Fed Holds Rates Steady, Signals Patience as Inflation Cools to 2.4%',
    dek: 'Markets rallied on the decision, though the chair warned that "the last half-mile is the steepest" in the fight to reach target.',
    bias: 0.04,
    sentiment: 0.18,
    summary:
      'The Federal Reserve left its benchmark rate unchanged for a fourth consecutive meeting. Officials pointed to cooling inflation but pushed back on expectations of a September cut, citing resilient consumer spending.',
    body: [
      'The Federal Reserve held its benchmark interest rate steady on Wednesday for the fourth consecutive meeting, keeping the target range at levels unchanged since last autumn.',
      'Inflation data released earlier in the week showed prices rising 2.4 percent year-over-year — the softest reading in more than two years and within sight of the Fed’s 2 percent target.',
      'Equity markets, which had priced in the pause, climbed modestly on the news, with rate-sensitive sectors leading the advance through the afternoon session.',
      'Still, the chair’s press conference struck a deliberately cautious tone. "The last half-mile is the steepest," he told reporters, declining three separate invitations to commit to a timetable for cuts.',
      'Economists remain split on September. Futures markets now imply roughly even odds of a quarter-point reduction, down from 70 percent before the press conference.',
    ],
    tags: ['Federal Reserve', 'Inflation', 'Markets'],
  },
  {
    id: 'a3',
    slug: 'border-security-bill-stalls',
    category: 'Politics',
    source: 'The Capitol Ledger',
    author: 'Reese Callahan',
    publishedAt: '2026-07-16T14:05:00Z',
    readMins: 5,
    title: 'Border Security Bill Stalls as Leadership Rejects "Watered-Down" Compromise',
    dek: 'Hardliners say the bipartisan framework abandons enforcement; negotiators accuse them of preferring the issue to the solution.',
    bias: 0.58,
    sentiment: -0.42,
    summary:
      'A bipartisan border framework collapsed after leadership declared it dead on arrival, arguing the enforcement provisions were inadequate. Negotiators from both parties expressed frustration, and the path forward is unclear.',
    body: [
      'A months-in-the-making bipartisan border framework collapsed Thursday before it ever reached the floor, after leadership pronounced the deal "watered-down beyond recognition" and whipped members against it.',
      'The framework would have funded 1,800 new border agents, expanded detention capacity by a third, and tightened the asylum screening standard — while pairing those measures with expanded legal pathways that hardliners refused to accept.',
      'Its authors were blunt about the outcome. "Some people would rather run on the problem than fix it," one negotiator said, in remarks that drew immediate rebukes.',
      'Supporters of killing the bill counter that the enforcement provisions lacked teeth, pointing to discretionary parole authority that they say would have neutralized the new screening standard in practice.',
      'With floor time evaporating before the August recess, aides in both parties privately concede no border legislation is likely to move this year.',
    ],
    tags: ['Immigration', 'Congress', 'Border'],
  },
  {
    id: 'a4',
    slug: 'quantum-computing-error-correction',
    category: 'Technology',
    source: 'Signal Path',
    author: 'Ivy Chen',
    publishedAt: '2026-07-15T11:30:00Z',
    readMins: 7,
    title: 'Quantum Leap: Lab Demonstrates Error Correction Below the Fault-Tolerance Threshold',
    dek: 'The result, replicated across two independent systems, suggests useful quantum machines may arrive years earlier than projected.',
    bias: -0.08,
    sentiment: 0.71,
    summary:
      'Researchers demonstrated logical qubits with error rates below the fault-tolerance threshold, sustained over 10,000 operations. Independent replication makes this the strongest evidence yet that scalable quantum computing is achievable.',
    body: [
      'For decades the promise of quantum computing has come with an asterisk: qubits are noisy, and the noise compounds faster than computations complete. This week, that asterisk got measurably smaller.',
      'A university-industry team reported logical qubit error rates below the fault-tolerance threshold — the regime where adding more qubits makes computations more reliable rather than less — sustained across more than 10,000 sequential operations.',
      'Crucially, the result held on two architecturally distinct systems, a superconducting platform and a trapped-ion machine, replicated by an independent group before publication.',
      'Outside researchers were unusually effusive. "This is the result the field has been waiting for since the nineties," said one physicist not involved in the work.',
      'Commercial timelines remain uncertain, and the demonstrated machines are far too small for the codebreaking scenarios that dominate headlines. But the engineering roadmap, experts say, no longer contains a question mark at its center.',
    ],
    tags: ['Quantum', 'Research', 'Computing'],
  },
  {
    id: 'a5',
    slug: 'teachers-strike-third-week',
    category: 'Society',
    source: 'The Meridian Post',
    author: 'Sofia Reyes',
    publishedAt: '2026-07-15T09:00:00Z',
    readMins: 5,
    title: 'Teachers’ Strike Enters Third Week as District Talks Break Down Again',
    dek: 'Educators demand smaller classes and a 12% raise; the district says the math "simply does not exist." 240,000 students remain home.',
    bias: -0.45,
    sentiment: -0.55,
    summary:
      'Contract talks collapsed for the third time as the teachers’ union rejected an 8% offer, holding out for 12% and enforceable class-size caps. The district claims budget constraints; the union points to administrative growth.',
    body: [
      'Picket lines formed again at sunrise Monday outside more than 400 schools, as the city’s teachers’ strike entered its third week with no resolution in sight and 240,000 students still out of classrooms.',
      'Weekend talks collapsed after the district’s revised offer — an 8 percent raise over two years, up from an initial 6 — was rejected by the union’s bargaining committee in under an hour.',
      'The union’s position has not moved: a 12 percent raise and, more centrally, enforceable caps on class sizes, which in some high schools have crept past forty students.',
      '"You cannot teach forty kids algebra. You can only supervise them," said a fifteen-year veteran math teacher on the picket line, echoing the union’s central argument that working conditions are learning conditions.',
      'The district insists the money "simply does not exist," though union analysts note central-office administrative staffing has grown 30 percent in five years while enrollment declined.',
      'Parents, meanwhile, are exhausted. Community centers report waitlists for emergency childcare, and a coalition of parent groups has petitioned both sides to accept binding arbitration.',
    ],
    tags: ['Education', 'Labor', 'Strike'],
  },
  {
    id: 'a6',
    slug: 'defense-spending-record-high',
    category: 'World',
    source: 'The Capitol Ledger',
    author: 'James Herrick',
    publishedAt: '2026-07-14T16:45:00Z',
    readMins: 6,
    title: 'Defense Bill Sails Through Committee With Record $920B Top Line',
    dek: 'The 4% increase drew rare bipartisan applause — and pointed questions about audit failures that have never once been passed.',
    bias: 0.41,
    sentiment: 0.12,
    summary:
      'The annual defense authorization cleared committee 24–3 with a record $920B top line, prioritizing shipbuilding, munitions stockpiles, and pay raises. Critics note the Pentagon has failed six consecutive audits.',
    body: [
      'The annual defense authorization bill cleared committee on a lopsided 24–3 vote Thursday, carrying a record $920 billion top line — a 4 percent increase that both parties’ defense hawks celebrated as overdue.',
      'The bill prioritizes shipbuilding, with funding for three additional destroyers beyond the Pentagon’s request, alongside a major replenishment of munitions stockpiles drawn down by allied transfers.',
      'Service members would see a 4.5 percent pay raise, the largest in a decade, with targeted increases for junior enlisted ranks where recruitment shortfalls remain acute.',
      'The near-unanimous vote masked pointed exchanges over accountability. The Pentagon has failed six consecutive full financial audits, and an amendment tying 2 percent of the top line to audit progress was defeated quietly in markup.',
      '"We find money for everything except finding out where the money goes," said one of the three dissenting members, whose amendment drew only nine votes.',
      'Floor consideration is expected after the August recess, where leadership anticipates minimal resistance.',
    ],
    tags: ['Defense', 'Budget', 'Pentagon'],
  },
  {
    id: 'a7',
    slug: 'ai-hiring-regulation-vote',
    category: 'Technology',
    source: 'Signal Path',
    author: 'Priya Natarajan',
    publishedAt: '2026-07-14T07:20:00Z',
    readMins: 5,
    title: 'City Council Votes to Require Audits of AI Hiring Tools',
    dek: 'The first-in-the-nation ordinance mandates annual bias audits for any algorithm that screens job applicants. Industry calls it unworkable.',
    bias: -0.3,
    sentiment: 0.05,
    summary:
      'The ordinance requires companies using AI screening tools to conduct annual independent bias audits and disclose automated decisions to applicants. Enforcement begins next year; tech groups plan a legal challenge.',
    body: [
      'The city council voted 38–9 Wednesday to require independent bias audits for artificial-intelligence tools used in hiring — the first ordinance of its kind to carry civil penalties for non-compliance.',
      'Under the measure, any employer using algorithmic screening must commission an annual third-party audit measuring disparate impact across race, gender, and age, and must notify applicants when an automated system played a role in a rejection.',
      'Sponsors cited studies showing resume-screening models penalizing employment gaps and downgrading graduates of women’s colleges — patterns invisible to candidates and, often, to the employers themselves.',
      'Industry groups argued the audit methodology is unsettled science and warned the ordinance will push employers back toward slower, equally biased human screening. A trade association announced litigation plans within hours of the vote.',
      'Enforcement begins in eighteen months, giving the compliance industry — and the courts — time to define what a passing grade looks like.',
    ],
    tags: ['AI', 'Regulation', 'Employment'],
  },
  {
    id: 'a8',
    slug: 'grid-strain-heat-dome',
    category: 'Climate',
    source: 'Ledger & Line',
    author: 'Tom Askew',
    publishedAt: '2026-07-13T19:10:00Z',
    readMins: 4,
    title: 'Power Grid Strains Under Third Heat Dome of the Summer',
    dek: 'Rolling conservation alerts covered six states as demand hit an all-time record. Batteries — for the first time — carried the evening peak.',
    bias: 0.02,
    sentiment: -0.28,
    summary:
      'A prolonged heat dome pushed grid demand to record highs across six states. Grid-scale batteries supplied a record 12% of evening peak load, averting blackouts, though officials warn margins remain razor-thin.',
    body: [
      'Grid operators across six states issued conservation alerts for a fourth consecutive day Sunday, as a stagnant heat dome pushed electricity demand to an all-time system record.',
      'Temperatures held above 105°F across much of the region, driving air-conditioning load that peaked just before 7 p.m. — historically the most dangerous hour, as solar generation fades while demand lingers.',
      'This year, something new happened at that hour: grid-scale batteries, charged on midday solar surplus, discharged a record 12 percent of evening peak load, and the lights stayed on.',
      '"Storage just passed its first real stress test," one grid official said, while cautioning that reserve margins remained under 3 percent for stretches of the evening.',
      'Forecasters expect the dome to break by Thursday. The next one, climatologists note, is a matter of when.',
    ],
    tags: ['Grid', 'Heat', 'Storage'],
  },
];

export const categories = [
  { name: 'All Stories', count: articles.length },
  { name: 'Politics', count: 2 },
  { name: 'Economy', count: 2 },
  { name: 'Technology', count: 2 },
  { name: 'World', count: 1 },
  { name: 'Society', count: 1 },
  { name: 'Climate', count: 1 },
];

export const sources = [
  { name: 'The Meridian Post', lean: 'Leans Left' },
  { name: 'Ledger & Line', lean: 'Center' },
  { name: 'The Capitol Ledger', lean: 'Leans Right' },
  { name: 'Signal Path', lean: 'Center' },
];

export function biasLabel(bias) {
  if (bias <= -0.6) return 'Left';
  if (bias <= -0.2) return 'Leans Left';
  if (bias < 0.2) return 'Center';
  if (bias < 0.6) return 'Leans Right';
  return 'Right';
}

export function biasTone(bias) {
  if (bias <= -0.2) return 'left';
  if (bias < 0.2) return 'center';
  return 'right';
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

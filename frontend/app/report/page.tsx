export const metadata = {
  title: "CampusCapital Report — Higher Education Market Intelligence",
};

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm text-center">
      <p className="text-3xl font-mono font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div className="border-l-4 border-indigo-500 pl-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">{number}</p>
      <h2 className="mt-0.5 text-xl font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
      {children}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({ children, right, mono, dim }: { children: React.ReactNode; right?: boolean; mono?: boolean; dim?: boolean }) {
  return (
    <td className={`px-4 py-3 text-sm ${right ? "text-right" : ""} ${mono ? "font-mono" : ""} ${dim ? "text-gray-500" : "text-gray-800"}`}>
      {children}
    </td>
  );
}

export default function ReportPage() {
  return (
    <div className="space-y-12 pb-16">

      {/* Header */}
      <div className="rounded-xl bg-gray-900 px-8 py-10 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">CampusCapital</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          What America's Universities Look Like as Businesses
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-400">
          An analysis of 49 universities — their enrollment trends, tuition pricing, and financial health —
          as if they were companies on a balance sheet.
        </p>
        <p className="mt-4 text-xs text-gray-600">Data Sources: IPEDS · College Scorecard · U.S. Bureau of Labor Statistics</p>
      </div>

      {/* Introduction */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Introduction</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Most people think of universities as public institutions focused on education. But behind the ivy and the idealism,
          every college operates like a business — competing for students, setting prices, managing revenue streams, and living
          or dying by its balance sheet.
        </p>
        <p className="text-sm leading-relaxed text-gray-700">
          CampusCapital analyzed 49 universities across the United States using federal education data (IPEDS and the College
          Scorecard) alongside labor market data from the Bureau of Labor Statistics. The goal: treat these institutions the way
          a financial analyst would — looking past the prestige rankings to understand which schools are financially resilient,
          which are taking big risks, and which are quietly struggling.
        </p>
        <p className="text-sm leading-relaxed text-gray-700">
          What emerges is a clear picture of a higher education sector in the middle of a major transition. The computer science
          boom is cooling. Artificial intelligence programs have become a new revenue play. And tuition has outpaced inflation at
          nearly every institution in the study.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatPill value="49" label="Universities Analyzed — targeting 50-school set" />
        <StatPill value="1M+" label="Students Tracked across all 49 schools" />
        <StatPill value="79 / 100" label="Average Health Score — composite financial score" />
        <StatPill value="0" label="High-Risk Schools — 3+ risk flags triggered" />
      </div>

      {/* Archetype Table */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">The Four Types of University</h2>
        <p className="text-sm text-gray-600">
          Rather than ranking schools by prestige or test scores, CampusCapital groups them into four archetypes based on how
          they actually function financially. Think of these as business models.
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <Th>Archetype</Th>
                <Th right># Schools</Th>
                <Th right>Avg Score</Th>
                <Th>What it means</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { archetype: "Prestige Fortress", count: 17, score: "96.6", desc: "Massive endowments, low tuition dependence. Financially insulated from most shocks.", color: "bg-violet-100 text-violet-800" },
                { archetype: "Expansion Player", count: 19, score: "76.7", desc: "Large public universities that grew aggressively. Healthy but exposed to demand swings.", color: "bg-blue-100 text-blue-800" },
                { archetype: "Regional Value", count: 8, score: "63.6", desc: "Mid-tier public schools. More tuition-dependent and with thinner financial buffers.", color: "bg-emerald-100 text-emerald-800" },
                { archetype: "Tuition Dependent", count: 5, score: "52.8", desc: "Smaller private schools relying almost entirely on tuition. The most financially fragile.", color: "bg-red-100 text-red-800" },
              ].map((row) => (
                <tr key={row.archetype} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.color}`}>{row.archetype}</span>
                  </td>
                  <Td right mono>{row.count}</Td>
                  <Td right mono>{row.score}</Td>
                  <Td dim>{row.desc}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400">Health scores run from 0–100 and are derived from tuition dependence, endowment per student, enrollment trend, and revenue concentration.</p>
      </div>

      {/* Section 1: CS */}
      <div className="space-y-6">
        <SectionHeader
          number="Section 1"
          title="The Computer Science Boom Is Over"
          subtitle="For a decade, CS was the hottest degree in America. Then the tech layoffs hit — and the demand signal reversed."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatPill value="85,735" label="2012 Completions — starting point across 49 schools" />
          <StatPill value="2020" label="Peak Year — 174,977 completions at peak" />
          <StatPill value="164,247" label="2023 Completions — most recent year" />
          <StatPill value="−6.1%" label="Decline from Peak — 2023 vs. 2020 peak" />
        </div>

        <p className="text-sm leading-relaxed text-gray-700">
          CS enrollment tracked the tech hiring wave almost perfectly through 2019 — rising wage data from the Bureau of Labor
          Statistics correlated tightly with surging enrollment. Then two things happened simultaneously: the post-pandemic tech
          correction brought mass layoffs in 2022 and 2023, and universities that had built out capacity found themselves with
          programs larger than student demand could sustain.
        </p>
        <p className="text-sm leading-relaxed text-gray-700">
          The decline from peak is modest at −6.1% nationally across the 49 schools. But within that average sits a wide range
          of individual school outcomes — and the schools that expanded most aggressively are now the most exposed.
        </p>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Which Schools Over-Expanded?</h3>
          <p className="mb-4 text-sm text-gray-600">
            Every school in the top 15 most-exposed list is an Expansion Player — not a single elite private university appears.
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>University</Th>
                  <Th>Type</Th>
                  <Th right>Growth 2012–19</Th>
                  <Th right>Decline 2019–23</Th>
                  <Th right>Exposure Score</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["UIUC (Illinois)", "+132.7%", "−12.2%", "157.1"],
                  ["NC State", "+130.2%", "−10.6%", "151.4"],
                  ["NYU", "+127.3%", "−9.9%", "147.1"],
                  ["Virginia Tech", "+130.6%", "−8.2%", "147.0"],
                  ["University of Florida", "+127.0%", "−9.2%", "145.5"],
                  ["UT Austin", "+131.4%", "−5.7%", "142.8"],
                  ["UW Seattle", "+118.5%", "−8.5%", "135.4"],
                  ["U of Minnesota", "+119.5%", "−5.0%", "129.5"],
                  ["UC San Diego", "+114.7%", "−6.8%", "128.2"],
                  ["ASU", "+123.2%", "−2.2%", "127.6"],
                ].map(([name, growth, decline, score]) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                    <td className="px-4 py-3"><span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">Expansion Player</span></td>
                    <Td right mono>{growth}</Td>
                    <Td right mono>{decline}</Td>
                    <Td right mono>{score}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400">Exposure score = Boom % − (Bust % × 2). A higher score means greater mismatch risk as hiring demand softens.</p>
        </div>

        <Callout>
          <strong>Why Elite Schools Were Insulated:</strong> Harvard, MIT, Stanford and their peers grew CS enrollment during the boom — but much more slowly and selectively. Their admissions model is constrained by design: they don't simply add seats to meet demand. This turned out to be a structural advantage. When demand softened, they had less excess capacity to unwind.
        </Callout>
      </div>

      {/* Section 2: AI */}
      <div className="space-y-6">
        <SectionHeader
          number="Section 2"
          title="Every University Now Has an AI Program — and a Price Tag to Match"
          subtitle="Today, all 49 universities in this study offer an AI/ML master's program. And they are charging a significant premium for the privilege."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatPill value="49 / 49" label="Schools with AI Programs — every tracked school" />
          <StatPill value="42,683" label="AI Enrollment 2023 — master's-level students" />
          <StatPill value="128%" label="Avg Tuition Premium — above undergrad net price" />
          <StatPill value="$45,876" label="Avg AI Net Price — per year, 2023" />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">The AI Premium: What Universities Are Actually Charging</h3>
          <p className="mb-4 text-sm text-gray-600">
            On average, AI master's programs cost 128% more than the institution's own undergraduate net price. The 'AI' label has become a pricing lever — and universities are using it.
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>University</Th>
                  <Th>Type</Th>
                  <Th right>Launched</Th>
                  <Th right>AI Price/yr</Th>
                  <Th right>Undergrad Price</Th>
                  <Th right>Premium</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Northeastern", "Expansion Player", "2019", "$103,200", "$41,287", "+150%", "bg-blue-100 text-blue-800"],
                  ["Providence College", "Tuition Dependent", "2022", "$93,490", "$37,528", "+149%", "bg-red-100 text-red-800"],
                  ["CMU", "Expansion Player", "2019", "$88,610", "$35,588", "+149%", "bg-blue-100 text-blue-800"],
                  ["Seattle University", "Tuition Dependent", "2022", "$88,199", "$36,193", "+144%", "bg-red-100 text-red-800"],
                  ["Drexel", "Tuition Dependent", "2022", "$94,997", "$39,993", "+138%", "bg-red-100 text-red-800"],
                  ["NYU", "Expansion Player", "2019", "$115,315", "$48,578", "+137%", "bg-blue-100 text-blue-800"],
                  ["Fordham", "Tuition Dependent", "2022", "$93,219", "$39,403", "+137%", "bg-red-100 text-red-800"],
                  ["Quinnipiac", "Tuition Dependent", "2022", "$92,080", "$39,818", "+131%", "bg-red-100 text-red-800"],
                  ["Harvard", "Prestige Fortress", "2018", "$91,911", "$42,283", "+117%", "bg-violet-100 text-violet-800"],
                  ["Princeton", "Prestige Fortress", "2018", "$90,078", "$41,455", "+117%", "bg-violet-100 text-violet-800"],
                ].map(([name, type, launched, aiPrice, ugPrice, premium, color]) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{type}</span></td>
                    <Td right mono>{launched}</Td>
                    <Td right mono>{aiPrice}</Td>
                    <Td right mono>{ugPrice}</Td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-amber-700">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400">Net price = what students actually pay after financial aid. Premium = AI price ÷ undergrad net price.</p>
        </div>

        <Callout>
          <strong>Who Launched When — And Why It Matters:</strong> Prestige Fortress schools launched in 2018, before the public AI moment — reflecting research-driven positioning. Tuition Dependent schools arrived last, in 2022, right as AI became a mainstream buzzword. For these schools, launching an AI program looks more like a financial lifeline than an academic investment.
        </Callout>
      </div>

      {/* Section 3: Tuition */}
      <div className="space-y-6">
        <SectionHeader
          number="Section 3"
          title="Tuition Has Beaten Inflation at Nearly Every School"
          subtitle="Over the past decade, one of the most persistent drivers of above-inflation price increases has been college tuition."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatPill value="+44.6%" label="Public Tuition Growth — nominal increase 2012–2023" />
          <StatPill value="+32.7%" label="General Inflation — CPI all-items, same period" />
          <StatPill value="24 of 29" label="Schools Beating CPI — in real inflation-adjusted terms" />
          <StatPill value="144.6" label="Tuition Index — 2012 = 100 baseline" />
        </div>

        <p className="text-sm leading-relaxed text-gray-700">
          There is a critical distinction that often gets lost in tuition discussions: the difference between published ("sticker") price
          and net price — what families actually pay after financial aid and scholarships are applied. For private universities, the gap
          between sticker and net can be enormous. One important pattern: upper-middle-income families ($75,000–$110,000 household income)
          tend to face the heaviest real burden — they earn too much to qualify for maximum need-based aid, but not enough to be indifferent
          to high sticker prices.
        </p>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">How Each School Type Raised Prices</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>School Type</Th>
                  <Th right>Nominal Increase</Th>
                  <Th right>Real Increase</Th>
                  <Th>Plain English</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { type: "Regional Value", color: "bg-emerald-100 text-emerald-800", nominal: "~+54%", real: "+16%", note: "Raised prices fastest in real terms — straining their core affordability pitch." },
                  { type: "Expansion Player", color: "bg-blue-100 text-blue-800", nominal: "~+46%", real: "+10%", note: "Consistent, above-inflation increases across the board." },
                  { type: "Prestige Fortress (public)", color: "bg-violet-100 text-violet-800", nominal: "~+31%", real: "−1.1%", note: "Actually fell slightly below inflation-adjusted prices — the most restrained group." },
                ].map((row) => (
                  <tr key={row.type} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.color}`}>{row.type}</span></td>
                    <Td right mono>{row.nominal}</Td>
                    <Td right mono>{row.real}</Td>
                    <Td dim>{row.note}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400">Real increase = nominal tuition growth minus CPI inflation (32.7%) over the same period.</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Specific Schools: Winners and Laggards on Pricing</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>University</Th>
                  <Th>Type</Th>
                  <Th right>2012 Tuition</Th>
                  <Th right>2023 Tuition</Th>
                  <Th right>Nominal Δ</Th>
                  <Th right>Real Δ</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Utah State", "Regional Value", "bg-emerald-100 text-emerald-800", "$9,779", "$15,055", "+54%", "+16%"],
                  ["Missouri State", "Regional Value", "bg-emerald-100 text-emerald-800", "$7,669", "$11,807", "+54%", "+16%"],
                  ["Oregon", "Regional Value", "bg-emerald-100 text-emerald-800", "$10,317", "$15,882", "+54%", "+16%"],
                  ["Georgia Tech", "Expansion Player", "bg-blue-100 text-blue-800", "$12,164", "$17,759", "+46%", "+10%"],
                  ["UT Austin", "Expansion Player", "bg-blue-100 text-blue-800", "$13,245", "$19,338", "+46%", "+10%"],
                  ["ASU", "Expansion Player", "bg-blue-100 text-blue-800", "$12,638", "$18,451", "+46%", "+10%"],
                  ["UCLA", "Prestige Fortress", "bg-violet-100 text-violet-800", "$13,454", "$17,653", "+31%", "−1.1%"],
                  ["UC Berkeley", "Prestige Fortress", "bg-violet-100 text-violet-800", "$15,301", "$20,077", "+31%", "−1.1%"],
                  ["UVA", "Prestige Fortress", "bg-violet-100 text-violet-800", "$13,081", "$17,163", "+31%", "−1.1%"],
                  ["Michigan", "Prestige Fortress", "bg-violet-100 text-violet-800", "$13,737", "$18,025", "+31%", "−1.1%"],
                ].map(([name, type, color, t12, t23, nom, real]) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{type}</span></td>
                    <Td right mono>{t12}</Td>
                    <Td right mono>{t23}</Td>
                    <Td right mono>{nom}</Td>
                    <td className={`px-4 py-3 text-right text-sm font-mono font-semibold ${real.startsWith("−") ? "text-emerald-700" : "text-red-600"}`}>{real}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400">Figures shown are in-state published tuition. Real change adjusts for cumulative CPI of +32.7% from 2012 to 2023.</p>
        </div>
      </div>

      {/* Section 4: Financial Health */}
      <div className="space-y-6">
        <SectionHeader
          number="Section 4"
          title="Who Is Financially Healthy — and Who Is Fragile"
          subtitle="A composite health score from four inputs: tuition dependence, endowment per student, enrollment trend, and revenue concentration."
        />

        <p className="text-sm leading-relaxed text-gray-700">
          The results are stark. The 17 Prestige Fortress schools all score above 93. The bottom five schools — all Tuition Dependent —
          score between 43 and 59. No school currently crosses the threshold of three simultaneous risk flags, meaning no institution is
          officially "high-risk" by the composite measure. But several are closer to that line than their reputations might suggest.
        </p>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">The Most Financially Resilient Schools</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>#</Th>
                  <Th>University</Th>
                  <Th right>Score</Th>
                  <Th right>Tuition Dep.</Th>
                  <Th right>Endow./Student</Th>
                  <Th right>Grad Earnings</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  [1, "Stanford (CA)", "100", "15.6%", "$429,390", "$88,257"],
                  [2, "Brown (RI)", "98.8", "16.8%", "$341,438", "$98,115"],
                  [3, "UCLA (CA)", "98.3", "18.4%", "$432,506", "$96,238"],
                  [4, "Columbia (NY)", "97.9", "18.3%", "$332,881", "$94,764"],
                  [5, "UC Berkeley (CA)", "97.9", "17.8%", "$303,531", "$100,999"],
                  [6, "Michigan (MI)", "97.8", "17.7%", "$275,349", "$100,177"],
                  [7, "Princeton (NJ)", "97.7", "18.7%", "$344,090", "$99,272"],
                  [8, "MIT (MA)", "96.8", "19.6%", "$302,016", "$105,546"],
                  [9, "UChicago (IL)", "96.0", "19.9%", "$216,662", "$100,611"],
                  [10, "Northwestern (IL)", "95.9", "20.4%", "$240,274", "$89,515"],
                ].map(([rank, name, score, td, endow, earnings]) => (
                  <tr key={String(name)} className="hover:bg-gray-50">
                    <Td mono dim>{rank}</Td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">{score}</span>
                    </td>
                    <Td right mono dim>{td}</Td>
                    <Td right mono dim>{endow}</Td>
                    <Td right mono dim>{earnings}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400">Endowment per student = total endowment ÷ total enrollment. Tuition Dep. = share of revenue from tuition. Grad Earnings = median income 10 years post-enrollment.</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">The Most Financially Fragile Schools</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>#</Th>
                  <Th>University</Th>
                  <Th right>Score</Th>
                  <Th right>Tuition Dep.</Th>
                  <Th right>Endow./Student</Th>
                  <Th right>Grad Earnings</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  [45, "Seattle U (WA)", "59.4", "65.9%", "$8,734", "$50,371"],
                  [46, "Drexel (PA)", "55.6", "74.7%", "$9,011", "$58,292"],
                  [47, "Fordham (NY)", "53.5", "74.8%", "$6,926", "$50,337"],
                  [48, "Providence (RI)", "52.3", "80.3%", "$9,701", "$59,595"],
                  [49, "Quinnipiac (CT)", "43.3", "94.1%", "$5,046", "$61,167"],
                ].map(([rank, name, score, td, endow, earnings]) => (
                  <tr key={String(name)} className="hover:bg-gray-50">
                    <Td mono dim>{rank}</Td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">{score}</span>
                    </td>
                    <Td right mono dim>{td}</Td>
                    <Td right mono dim>{endow}</Td>
                    <Td right mono dim>{earnings}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Callout>
          <strong>Quinnipiac ranks last:</strong> 94% tuition dependence, $5,046 endowment per student — and the fastest-growing AI program in the dataset at +42.9% annually. A high-stakes bet on AI revenue to fix a structural financial problem.
        </Callout>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Risk Flags at a Glance</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Risk Category</Th>
                  <Th right>Schools Flagged</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Heavy reliance on international student revenue", "13 schools"],
                  ["Aggressive tuition inflation (above-average real increases)", "6 schools"],
                  ["High tuition dependence (>65% of revenue from tuition)", "5 schools"],
                  ["Low endowment buffer (under $10,000 per student)", "5 schools"],
                ].map(([risk, count]) => (
                  <tr key={risk} className="hover:bg-gray-50">
                    <Td>{risk}</Td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">{count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Five Takeaways */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">What It All Means: Five Takeaways</h2>
        <div className="space-y-4">
          {[
            {
              n: "1",
              title: "The CS Bubble Hasn't Burst — But It's Leaking",
              body: "A 6% decline from peak sounds manageable. But the schools that expanded fastest are seeing the largest reversals, and those reversals are concentrated among the large public universities that trained the most graduates. If the tech labor market doesn't recover robustly, some of these schools will need to rethink the size of their CS operations.",
            },
            {
              n: "2",
              title: "AI Programs Are a Revenue Strategy Disguised as an Academic One",
              body: "There is nothing wrong with universities offering AI programs — the field is important and demand is real. But the pricing tells a revealing story. The schools charging the highest premiums are often not the ones with the strongest AI research reputations. For Tuition Dependent schools in particular, AI programs look less like academic investments and more like financial rescue strategies. Whether students get adequate value at $90,000+ per year remains an open question.",
            },
            {
              n: "3",
              title: "The \"Affordable\" Schools Are Raising Prices Fastest",
              body: "Regional Value universities — the regional public schools that serve working and middle-class students — have raised tuition 16% in real, inflation-adjusted terms over the past decade. That is faster than elite schools, and faster than Expansion Players. For students who choose these schools precisely because of price, this trend quietly erodes the value proposition that defines the archetype.",
            },
            {
              n: "4",
              title: "Elite Schools Are More Resilient Than the Data Needs to Confirm",
              body: "Stanford, MIT, Harvard and their peers sit at the top of every financial metric in this study. Low tuition dependence. Massive endowments. Strong enrollment demand. This insulation is structural — it doesn't depend on any single program or market trend. These schools could absorb significant shocks that would be devastating to schools lower in the ranking.",
            },
            {
              n: "5",
              title: "The International Student Risk Is Real and Underappreciated",
              body: "Of all the risks in the dataset, international revenue concentration is the most widespread and the least discussed. Thirteen schools carry this flag. Schools with the highest international enrollment shares include Columbia (26.5%), Dartmouth (26.5%), Harvard (29.8%), and UPenn (25.4%). Any significant policy shift could rapidly affect enrollment and revenue at these institutions.",
            },
          ].map((t) => (
            <div key={t.n} className="flex gap-4 rounded-lg bg-white p-5 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {t.n}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
        CampusCapital — campuscapital-app.vercel.app
        <br />
        Data sources: IPEDS, College Scorecard, Bureau of Labor Statistics OEWS
      </div>
    </div>
  );
}

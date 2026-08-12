import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePlay,
  Coffee,
  Dumbbell,
  Flower2,
  Focus,
  Gift,
  Heart,
  Leaf,
  LockKeyhole,
  Medal,
  MoonStar,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Timer,
  Trophy,
  Users,
  Volume2,
  WandSparkles,
  Zap,
} from "lucide-react";
import { brandConfig } from "@aiyomi/config";
import { CompanionGallery } from "@/components/companion-gallery";
import { LandingAnalytics } from "@/components/landing-analytics";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { WaitlistButton } from "@/components/waitlist-button";

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  emotional = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  emotional?: boolean;
}) {
  return (
    <div className={`section-heading section-heading-${align} ${emotional ? "section-heading-emotional" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function MiniIcon({ children, tone = "mint" }: { children: ReactNode; tone?: string }) {
  return <span className={`mini-icon mini-icon-${tone}`}>{children}</span>;
}

function TodayPhone() {
  return (
    <div className="phone-wrap today-phone-wrap" role="img" aria-label="Concept preview of the future Aiyomi Today screen with a greeting, current priority, timeline, quick capture, and focus action">
      <span className="preview-label" aria-hidden="true"><Sparkles size={13} /> Product preview</span>
      <div className="phone-shell" aria-hidden="true">
        <div className="phone-speaker" />
        <div className="phone-screen today-screen">
          <div className="phone-status"><span>9:41</span><span>● ●●</span></div>
          <div className="mobile-topbar">
            <div><small>Tuesday, June 16</small><strong>Good morning, Jamie</strong></div>
            <span className="tiny-avatar"><Mascot variant="mori" size="small" /></span>
          </div>
          <div className="day-energy-card">
            <div>
              <span className="tiny-kicker"><Sun size={13} aria-hidden="true" /> Balanced day</span>
              <strong>You have room for what matters.</strong>
              <p>Three priorities and a gentle evening.</p>
            </div>
            <Mascot variant="mori" size="medium" label="Mori greeting Jamie" />
          </div>
          <button type="button" className="now-button" tabIndex={-1}>
            <span><WandSparkles size={16} aria-hidden="true" /> What should I do now?</span>
            <ChevronRight size={17} aria-hidden="true" />
          </button>
          <div className="phone-section-title"><strong>Today</strong><span>3 of 5</span></div>
          <div className="timeline-list">
            <div className="timeline-item is-done">
              <span className="timeline-time">8:00</span><i><Check size={12} /></i>
              <div><strong>Morning reset</strong><small>Routine · 20 min</small></div>
            </div>
            <div className="timeline-item is-current">
              <span className="timeline-time">10:00</span><i><BookOpen size={12} /></i>
              <div><strong>Study biology</strong><small>Priority · Focus for 50 min</small></div>
              <CirclePlay size={21} aria-hidden="true" />
            </div>
            <div className="timeline-item">
              <span className="timeline-time">12:30</span><i><Coffee size={12} /></i>
              <div><strong>Lunch with Mia</strong><small>Personal · 60 min</small></div>
            </div>
            <div className="timeline-item">
              <span className="timeline-time">5:30</span><i><Dumbbell size={12} /></i>
              <div><strong>Easy movement</strong><small>Minimum · 10 min</small></div>
            </div>
          </div>
          <div className="mobile-tabbar">
            <span className="active"><Sun /><small>Today</small></span>
            <span><CalendarDays /><small>Plan</small></span>
            <button type="button" tabIndex={-1} aria-label="Quick capture"><Plus /></button>
            <span><Focus /><small>Focus</small></span>
            <span><BarChart3 /><small>Grow</small></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NowRecommendation() {
  return (
    <figure className="now-recommendation">
      <div className="now-context-rail">
        <span><Timer aria-hidden="true" /> 43 minutes free</span>
        <span><Target aria-hidden="true" /> One priority due tomorrow</span>
        <span><Sun aria-hidden="true" /> Good focus window</span>
      </div>
      <div className="now-panel">
        <div className="now-panel-top">
          <div><small>2:37 PM</small><span>Aiyomi suggests</span></div>
          <Mascot variant="lumi" size="medium" pose="plan" mood="thoughtful" label="Lumi considering the next useful step" />
        </div>
        <div className="now-task">
          <span className="now-task-icon"><BookOpen aria-hidden="true" /></span>
          <div><small>Estimated 35 min</small><strong>Review Biology</strong><span>Learning · Due tomorrow</span></div>
        </div>
        <div className="now-reason">
          <span><WandSparkles aria-hidden="true" /> Why this?</span>
          <p>You usually focus well around this time, and this assignment is due tomorrow.</p>
        </div>
        <div className="now-actions" aria-label="Concept actions">
          <span className="now-action-primary"><Play aria-hidden="true" /> Start Focus</span>
          <span>Something lighter</span>
          <span>Maybe later</span>
        </div>
      </div>
      <figcaption>Concept preview. Suggestions stay explainable, and you choose what happens next.</figcaption>
    </figure>
  );
}

function HeroPhone() {
  return (
    <div className="hero-visual" role="img" aria-label="Concept preview of Aiyomi greeting you, organizing priorities, and suggesting the next useful task">
      <span className="hero-orb hero-orb-one" aria-hidden="true" />
      <span className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="floating-card floating-card-focus" aria-hidden="true">
        <MiniIcon tone="lavender"><Timer /></MiniIcon>
        <span><small>Focused today</small><strong>1h 42m</strong></span>
      </div>
      <div className="floating-card floating-card-streak" aria-hidden="true">
        <MiniIcon tone="peach"><WandSparkles /></MiniIcon>
        <span><small>Aiyomi suggests</small><strong>Study biology next</strong></span>
      </div>
      <div className="phone-shell hero-phone-shell" aria-hidden="true">
        <div className="phone-speaker" />
        <div className="phone-screen hero-screen">
          <div className="phone-status"><span>9:41</span><span>● ●●</span></div>
          <div className="hero-phone-header"><span>Today</span><button type="button" tabIndex={-1}><MoreHorizontal /></button></div>
          <div className="hero-greeting-card">
            <div className="hero-greeting-copy">
              <span className="tiny-kicker"><Sun size={13} /> Good morning</span>
              <strong>Let&apos;s make space for a good day.</strong>
              <p>You have three things that matter most.</p>
            </div>
            <Mascot variant="mori" size="large" label="Mori welcoming you to Aiyomi" />
          </div>
          <button type="button" className="now-button hero-now" tabIndex={-1}>
            <span><WandSparkles size={15} /> What should I do now?</span><ArrowRight size={16} />
          </button>
          <div className="priority-heading"><span>What matters today</span><small>2 of 3</small></div>
          <div className="priority-card priority-card-done">
            <span className="round-check"><Check /></span><div><strong>Plan the week gently</strong><small>Personal · 20 min</small></div>
          </div>
          <div className="priority-card">
            <span className="round-check empty"><Target /></span><div><strong>Study biology</strong><small>Learning · 50 min focus</small></div><CirclePlay />
          </div>
          <div className="priority-card">
            <span className="round-check empty peach"><Heart /></span><div><strong>Call Mom</strong><small>Relationships · Flexible</small></div>
          </div>
          <div className="small-progress-card"><span><Leaf /> Today&apos;s growth</span><strong>68%</strong><i><b /></i></div>
        </div>
      </div>
      <div className="hero-companion-pop" aria-hidden="true"><Mascot variant="mori" size="large" pose="wave" decorative /></div>
    </div>
  );
}

export default function HomePage() {
  const socialLinks = [
    ["Instagram", brandConfig.instagramUrl],
    ["Facebook", brandConfig.facebookUrl],
    ["TikTok", brandConfig.tiktokUrl],
    ["X", brandConfig.xUrl],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  const companyLinks = [
    ["About", brandConfig.aboutUrl],
    ["Contact", brandConfig.contactUrl],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  const legalLinks = [
    ["Privacy", brandConfig.privacyUrl],
    ["Terms", brandConfig.termsUrl],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <>
      <LandingAnalytics />
      <SiteHeader />
      <main id="main-content">
        <section className="hero-section">
          <div className="hero-doodle hero-doodle-one" aria-hidden="true">✦</div>
          <div className="hero-doodle hero-doodle-two" aria-hidden="true">◌</div>
          <div className="shell hero-grid">
            <Reveal className="hero-copy">
              <span className="hero-kicker"><span>AI</span> + You + Me</span>
              <h1>Your AI companion for <em>better days.</em></h1>
              <p>Plan your day, focus on what matters, build better routines, and grow with a companion that learns what works for you.</p>
              <div className="hero-actions">
                <WaitlistButton source="hero" />
                <a className="text-link" href="#how-it-works">See how it works <ArrowDown size={17} aria-hidden="true" /></a>
              </div>
              <div className="availability-row" aria-label="Coming soon to iOS and Android">
                <span className="coming-label">Coming soon to</span>
                <span className="platform-pill">iOS</span>
                <span className="platform-pill">Android</span>
              </div>
              <div className="hero-principles">
                <span><ShieldCheck size={16} /> Private by default</span>
                <span><Heart size={16} /> Made for real life, even when plans change</span>
                <span><Target size={16} /> You stay in control</span>
              </div>
            </Reveal>
            <Reveal className="hero-visual-column" delay={0.08}><HeroPhone /></Reveal>
          </div>
          <div className="hero-wave" aria-hidden="true" />
        </section>

        <section id="how-it-works" className="section how-section">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="A day with Aiyomi" title="One companion for your whole day." description="From the first plan to the evening reflection, your companion stays part of the experience." align="center" emotional /></Reveal>
            <div className="companion-journey" aria-label="How Aiyomi supports a day">
              {[
                { time: "Morning", title: "Greet", copy: "Start with a calm view of what matters.", pose: "wave", mood: "happy", tone: "mint" },
                { time: "Plan", title: "Organize", copy: "Turn a noisy list into a realistic day.", pose: "plan", mood: "thoughtful", tone: "sky" },
                { time: "Focus", title: "Settle in", copy: "Work beside a companion who shares the moment.", pose: "focus", mood: "focused", tone: "lavender" },
                { time: "Adapt", title: "Make room", copy: "Change the plan without starting over.", pose: "reflect", mood: "thoughtful", tone: "peach" },
                { time: "Evening", title: "Reflect", copy: "Notice what worked with context and care.", pose: "reflect", mood: "proud", tone: "yellow" },
                { time: "Growth", title: "Celebrate", copy: "Let real progress shape your shared world.", pose: "celebrate", mood: "happy", tone: "mint" },
              ].map((step, index) => (
                <Reveal key={step.time} className={`journey-moment journey-${step.tone}`} delay={index * 0.04}>
                  <span className="journey-time">{step.time}</span>
                  <div className="journey-character"><Mascot variant="mori" size="small" pose={step.pose as "wave" | "plan" | "focus" | "reflect" | "celebrate"} mood={step.mood as "happy" | "focused" | "thoughtful" | "proud"} decorative /></div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </Reveal>
              ))}
              <span className="journey-path" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section id="companions" className="section companion-section">
          <div className="shell split-heading-grid">
            <Reveal>
              <SectionHeading eyebrow="Meet the companions" title="Choose a companion that grows with you." description="Choose how your companion supports you, then unlock new looks through meaningful progress." emotional />
              <ul className="check-list">
                <li><Check /> Choose from original companion characters</li>
                <li><Check /> Select a gentle, balanced, or coach personality</li>
                <li><Check /> Unlock future looks through meaningful progress</li>
              </ul>
              <p className="concept-note"><Sparkles /> Original concept characters shown. Names and art may evolve before launch.</p>
            </Reveal>
            <Reveal delay={0.08}><CompanionGallery /></Reveal>
          </div>
        </section>

        <section id="features" className="section today-section">
          <div className="shell product-story-grid">
            <Reveal className="phone-story"><TodayPhone /></Reveal>
            <Reveal className="story-copy" delay={0.06}>
              <SectionHeading eyebrow="Your day, made clearer" title="Know what matters today." description="Aiyomi brings priorities, routines, commitments, and open time into one calm view. You decide what stays, moves, or changes." />
              <div className="feature-points">
                <div><MiniIcon tone="sky"><Sun /></MiniIcon><span><strong>A plan that fits</strong><small>See a realistic day instead of an overloaded list.</small></span></div>
                <div><MiniIcon tone="mint"><WandSparkles /></MiniIcon><span><strong>One clear next step</strong><small>Ask what to do now when your day feels noisy.</small></span></div>
                <div><MiniIcon tone="peach"><RefreshCw /></MiniIcon><span><strong>Room to change</strong><small>Adapt with support when real life rewrites the plan.</small></span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="what-now" className="section now-section" data-analytics-section="what_should_i_do">
          <div className="shell now-story-grid">
            <Reveal className="now-story-copy">
              <span className="chapter-number" aria-hidden="true">02:37</span>
              <SectionHeading eyebrow="What should I do now?" title="Not sure what to do next? Just ask." description="Aiyomi considers your time, priorities, energy, schedule, and patterns to suggest one useful next step." emotional />
              <p className="concept-note"><WandSparkles /> Concept preview. The future recommendation will include a clear reason and stay under your control.</p>
            </Reveal>
            <Reveal delay={0.05}><NowRecommendation /></Reveal>
          </div>
        </section>

        <section id="brain-dump" className="section brain-section">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="AI Brain Dump" title="Tell Aiyomi what&apos;s on your mind." description="Drop in the messy version. Aiyomi can help turn scattered thoughts into a realistic plan that you approve." align="center" /></Reveal>
            <div className="brain-transform">
              <Reveal className="brain-card brain-input">
                <div className="brain-card-top"><span><Brain /> Messy thoughts</span><small>10:14 AM</small></div>
                <p>study biology, buy groceries, call mom, gym, finish assignment</p>
                <div className="voice-input"><Plus /><span>Tell Aiyomi anything...</span><span className="voice-dot">●</span></div>
              </Reveal>
              <div className="brain-sorter" aria-hidden="true">
                <span className="thought-chip thought-one">gym</span>
                <span className="thought-chip thought-two">call</span>
                <Mascot variant="piko" size="medium" pose="plan" mood="thoughtful" decorative />
                <WandSparkles />
              </div>
              <Reveal className="brain-card brain-output" delay={0.07}>
                <div className="brain-card-top"><span><Sparkles /> A realistic plan</span><small>Ready to review</small></div>
                <div className="organized-group must"><strong>Must do</strong><span>Finish assignment <small>60m</small></span><span>Study biology <small>50m</small></span></div>
                <div className="organized-group should"><strong>Should do</strong><span>Gym <small>30m</small></span></div>
                <div className="organized-group flexible"><strong>Flexible</strong><span>Groceries + Call Mom</span></div>
                <div className="suggested-plan"><strong>Suggested plan</strong><span><i>4:00</i> Assignment</span><span><i>5:30</i> Gym</span><span><i>7:00</i> Groceries</span></div>
              </Reveal>
            </div>
            <p className="control-note"><ShieldCheck /> Aiyomi suggests. You review and approve.</p>
          </div>
        </section>

        <section id="focus" className="section focus-section">
          <div className="shell focus-grid">
            <Reveal className="focus-copy">
              <SectionHeading eyebrow="Focus Mode" title="Focus together, not alone." description="Choose what matters, start a timer, and let your companion settle in beside you." emotional />
              <div className="focus-chip-row"><span>25 / 5</span><span>50 / 10</span><span>90 min</span><span>Custom</span></div>
              <p className="ambient-note"><Volume2 /> Optional ambient sounds and companion focus moments are planned. Audio will always stay in your control.</p>
            </Reveal>
            <Reveal className="focus-visual" delay={0.08}>
              <div className="focus-room">
                <div className="room-window"><span /><i>✦</i></div>
                <div className="room-plant"><i /><b /></div>
                <div className="focus-desk"><span className="desk-lamp" /><span className="desk-book" /></div>
                <Mascot variant="lumi" size="large" mood="focused" pose="focus" accessory="book" label="Lumi reading beside you during a focus session" />
                <span className="focus-floating-note">quiet company</span>
              </div>
              <div className="focus-timer-card">
                <span className="focus-mode-label"><Focus /> Focus session</span>
                <strong>42:18</strong>
                <p>Study Biology</p>
                <div className="focus-session-meta"><span><Zap /> Deep Focus</span><span><Volume2 /> Rain</span></div>
                <div className="timer-progress"><i /></div>
                <div className="timer-actions" aria-label="Concept focus controls"><span><Pause /> Pause</span><span><MoreHorizontal /> End</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="life-model" className="section learning-section" data-analytics-section="life_model">
          <div className="shell">
            <div className="life-model-heading">
              <Reveal><SectionHeading eyebrow="Life Model" title="Aiyomi learns what works for you." description="Over time, Aiyomi notices patterns in when you focus best, what you postpone, how much you realistically finish, and which routines actually stick." emotional /></Reveal>
              <Reveal className="life-model-promise" delay={0.04}><LockKeyhole /><p><strong>Patterns, not labels.</strong><span>Insights stay explainable, editable, and under your control.</span></p></Reveal>
            </div>
            <div className="life-model-canvas">
              <Reveal className="signal-board">
                <div className="signal-board-top"><span><BarChart3 /> Patterns taking shape</span><small>Illustrative week</small></div>
                <div className="signal-grid">
                  <div className="signal-card signal-wide"><MiniIcon tone="yellow"><Sun /></MiniIcon><span>Best focus</span><strong>9:10 AM to 11:20 AM</strong><small>Your calmest work window</small></div>
                  <div className="signal-card"><MiniIcon tone="lavender"><Timer /></MiniIcon><span>Realistic session</span><strong>Around 45 min</strong></div>
                  <div className="signal-card"><MiniIcon tone="mint"><Dumbbell /></MiniIcon><span>Workout pattern</span><strong>Most consistent before lunch</strong></div>
                  <div className="signal-card"><MiniIcon tone="sky"><CalendarDays /></MiniIcon><span>Planning realism</span><strong>About 4 major activities</strong></div>
                  <div className="signal-card signal-warm"><MiniIcon tone="peach"><MoonStar /></MiniIcon><span>Often postponed</span><strong>Reading after 9 PM</strong></div>
                </div>
              </Reveal>
              <div className="model-story-stack">
                <Reveal className="companion-insight-card" delay={0.05}>
                  <div className="insight-companion"><Mascot variant="mori" size="medium" pose="reflect" mood="thoughtful" label="Mori presenting a weekly pattern" /></div>
                  <span className="insight-label"><Sparkles /> Aiyomi noticed</span>
                  <h3>Your mornings have been more consistent than your evenings.</h3>
                  <p>Want me to move reading earlier next week?</p>
                  <div className="insight-actions" aria-label="Concept insight actions"><span>Adjust next week</span><span>Keep my schedule</span></div>
                </Reveal>
                <Reveal className="memory-evidence" delay={0.08}>
                  <div><span>You told Aiyomi</span><p>“I prefer working out before dinner.”</p></div>
                  <ArrowRight aria-hidden="true" />
                  <div><span>Aiyomi noticed</span><p>Morning workouts have been easier to complete.</p></div>
                </Reveal>
              </div>
            </div>
            <div className="privacy-memory-note"><LockKeyhole /><div><strong>Your patterns stay yours.</strong><span>Future controls will let you view, correct, disable, or reset what your companion remembers.</span></div></div>
          </div>
        </section>

        <section id="intent-reality" className="section reality-section">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="Intent vs Reality" title="A good day is more than checked boxes." description="Aiyomi learns from the distance between what you planned and what life allowed, without turning change into guilt." align="center" emotional /></Reveal>
            <div className="reality-grid">
              <Reveal className="intent-card">
                <div className="intent-header"><span><CalendarDays /> Planned</span><small>3 commitments</small></div>
                <div className="comparison-row"><span>Study</span><i><b style={{ width: "100%" }} /></i><strong>60m</strong></div>
                <div className="comparison-row"><span>Exercise</span><i><b style={{ width: "75%" }} /></i><strong>45m</strong></div>
                <div className="comparison-row"><span>Read</span><i><b style={{ width: "50%" }} /></i><strong>30m</strong></div>
              </Reveal>
              <div className="reality-link" aria-hidden="true"><ArrowRight /></div>
              <Reveal className="intent-card actual-card" delay={0.05}>
                <div className="intent-header"><span><Check /> Actual</span><small>What happened</small></div>
                <div className="comparison-row"><span>Study</span><i><b style={{ width: "78%" }} /></i><strong>47m</strong></div>
                <div className="comparison-row"><span>Exercise</span><i><b style={{ width: "33%" }} /></i><strong>20m</strong></div>
                <div className="comparison-row"><span>Read</span><i><b style={{ width: "50%" }} /></i><strong>30m</strong></div>
              </Reveal>
              <Reveal className="compassion-card" delay={0.1}>
                <Mascot variant="piko" size="medium" pose="reflect" mood="proud" label="Piko reflecting on the day without judgment" />
                <div><span>Aiyomi suggests</span><strong>You finished your highest-priority work and still moved for 20 minutes.</strong><p>Your plan was slightly heavier than your available time.</p><small>Tomorrow, let&apos;s keep the workout at a 20-minute target.</small><div className="reality-actions" aria-label="Concept adjustment actions"><i>Adjust tomorrow</i><i>Keep my plan</i></div></div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="day-score" className="section score-section">
          <div className="shell score-grid">
            <Reveal className="score-card-wrap">
              <div className="day-score-card">
                <div className="score-top"><span><Sparkles /> Day Score</span><small>Tuesday, June 16</small></div>
                <div className="score-main"><div className="score-ring"><span>84</span><small>Strong Day</small></div><Mascot variant="mori" size="large" pose="celebrate" mood="proud" label="Mori celebrating a strong day" /></div>
                <div className="score-bars">
                  <div><span>Priorities</span><i><b style={{ width: "90%" }} /></i><strong>90</strong></div>
                  <div><span>Focus</span><i><b style={{ width: "82%" }} /></i><strong>82</strong></div>
                  <div><span>Consistency</span><i><b style={{ width: "86%" }} /></i><strong>86</strong></div>
                  <div><span>Balance</span><i><b style={{ width: "78%" }} /></i><strong>78</strong></div>
                  <div><span>Planning realism</span><i><b style={{ width: "84%" }} /></i><strong>84</strong></div>
                </div>
                <div className="score-reflection-grid">
                  <div><span>Biggest win</span><p>You completed your most important task before lunch.</p></div>
                  <div><span>Could improve</span><p>Your evening plan held more than your usual capacity.</p></div>
                  <div><span>Tomorrow</span><p>Keep reading to 20 minutes and move exercise earlier.</p></div>
                </div>
              </div>
            </Reveal>
            <Reveal className="story-copy" delay={0.06}>
              <SectionHeading eyebrow="Day Score" title="Understand how your day actually went." description="Day Score is not based on raw completed task count. It considers what mattered, how realistically the day was planned, focus, consistency, balance, and actual context." emotional />
              <div className="score-factor-cloud" aria-label="Concept Day Score factors">
                <span>Priorities</span><span>Focus</span><span>Consistency</span><span>Balance</span><span>Planning realism</span><span>Real-life context</span>
              </div>
              <p className="score-trust-note"><ShieldCheck /> A reflective guide for your own patterns, never a global rank.</p>
            </Reveal>
          </div>
        </section>

        <section id="weekly-insights" className="section progress-section">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="Weekly Review" title="See your patterns, not just your stats." description="A friendly weekly story connects focused time, routines, meaningful priorities, and one useful next step." align="center" emotional /></Reveal>
            <div className="progress-dashboard">
              <div className="progress-stat-grid">
                <div><MiniIcon tone="lavender"><Timer /></MiniIcon><span>Focused</span><strong>12h 42m</strong><small>Time protected with intention</small></div>
                <div><MiniIcon tone="mint"><Star /></MiniIcon><span>Strong days</span><strong>5</strong><small>Two gentle days included</small></div>
                <div><MiniIcon tone="peach"><RefreshCw /></MiniIcon><span>Routine consistency</span><strong>84%</strong><small>Morning reset feels steady</small></div>
                <div><MiniIcon tone="yellow"><Target /></MiniIcon><span>Meaningful priorities</span><strong>4</strong><small>Your most important work</small></div>
              </div>
              <div className="noticed-card"><Mascot variant="lumi" size="medium" pose="reflect" mood="proud" label="Lumi sharing a weekly reflection" /><div><span>Your weekly story</span><strong>You were most consistent before lunch this week.</strong><p><b>Next week:</b> Protect your 9 AM to 11 AM window for your hardest work.</p></div><span className="review-pattern">Review pattern <ChevronRight /></span></div>
            </div>
          </div>
        </section>

        <section id="rewards" className="section game-section">
          <div className="shell game-grid">
            <Reveal className="game-copy">
              <SectionHeading eyebrow="Meaningful rewards" title="Make real progress feel rewarding." description="Complete meaningful priorities, focus with intention, and care for your routines. Your real life helps your companion and world grow." />
              <p className="primary-rule"><Leaf /> Real-life progress drives virtual progress.</p>
              <div className="reward-causality">
                <div><span><Focus /> 45 min Focus</span><ArrowRight /><strong>+40 XP</strong></div>
                <div><span><Heart /> Daily Reflection</span><ArrowRight /><strong>+20 XP</strong></div>
                <div><span><Dumbbell /> Workout Completed</span><ArrowRight /><strong>+30 XP</strong></div>
                <div className="reward-unlock"><span><Target /> Weekly Quest</span><ArrowRight /><strong><Gift /> Garden Lantern</strong></div>
              </div>
              <p className="no-farm-note">No pay-to-win competition. No reward for meaningless task farming.</p>
            </Reveal>
            <Reveal className="reward-visual" delay={0.08}>
              <div className="level-card"><span className="level-badge">12</span><div><small>Companion level</small><strong>Meadow Friend</strong><i><b /></i><em>1,840 / 2,200 XP</em></div></div>
              <div className="quest-card"><div className="quest-head"><span><Target /> Today&apos;s gentle quests</span><strong>2 / 3</strong></div><p><i><Check /></i><span><strong>Protect one priority</strong><small>+80 XP</small></span></p><p><i><Check /></i><span><strong>Focus for 25 minutes</strong><small>+60 XP</small></span></p><p><i className="empty" /><span><strong>Close the day kindly</strong><small>+40 XP</small></span></p></div>
              <div className="achievement-pop"><span><Trophy /></span><div><small>Achievement unlocked</small><strong>Steady Sprout</strong></div><b>+120 XP</b></div>
            </Reveal>
            <Reveal className="progress-world-bridge" delay={0.1}>
              <div className="bridge-side bridge-life"><span>Real life</span><div><i><BookOpen /></i><b>Learn</b><i><Focus /></i><b>Focus</b><i><Dumbbell /></i><b>Move</b><i><Heart /></i><b>Reflect</b></div></div>
              <div className="bridge-center" aria-hidden="true"><span>meaningful action</span><ArrowRight /></div>
              <div className="bridge-side bridge-world"><span>Aiyomi world</span><div><i><BookOpen /></i><b>Library grows</b><i><Flower2 /></i><b>Garden blooms</b><i><Sparkles /></i><b>Looks unlock</b></div></div>
            </Reveal>
          </div>
        </section>

        <section id="world" className="section world-section" data-analytics-section="world">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="Your World" title="Build your world by building yourself." description="Meaningful things you do in real life can shape a cozy visual world shared with your companion." align="center" emotional /></Reveal>
            <Reveal className="world-cinematic">
              <Image
                className="world-environment-image"
                src="/landing/world-garden-concept-v1.jpg"
                width={1536}
                height={1024}
                sizes="(max-width: 700px) 94vw, (max-width: 1200px) 92vw, 1180px"
                alt="Concept illustration of a cozy Aiyomi room opening into a flourishing garden"
              />
              <span className="world-concept-badge"><Sparkles /> Concept world</span>
              <div className="world-companion"><Mascot variant="mori" size="large" pose="celebrate" mood="proud" accessory="lantern" label="Mori enjoying the room and garden grown through real-life progress" /></div>
              <div className="world-zone world-zone-library"><BookOpen /><span>Learning</span><strong>Library nook</strong></div>
              <div className="world-zone world-zone-creative"><Sparkles /><span>Creative</span><strong>Studio corner</strong></div>
              <div className="world-zone world-zone-wellbeing"><Flower2 /><span>Wellbeing</span><strong>Garden blooms</strong></div>
              <div className="world-zone world-zone-fitness"><Dumbbell /><span>Fitness</span><strong>Movement space</strong></div>
            </Reveal>
            <div className="world-stage-track">
              <Reveal className="world-stage-card"><span>Stage 1</span><strong>A peaceful beginning</strong><p>A simple room, a tiny garden, and space to grow.</p></Reveal>
              <Reveal className="world-stage-card is-current" delay={0.04}><span>Stage 2</span><strong>Your routines take root</strong><p>Plants, books, a better desk, and a first companion accessory.</p></Reveal>
              <Reveal className="world-stage-card" delay={0.08}><span>Stage 3</span><strong>Your story fills the space</strong><p>A larger garden, creative corner, library, and meaningful keepsakes.</p></Reveal>
            </div>
            <p className="concept-note centered"><Sparkles /> Replaceable concept art. Exact environments, items, and progression may change before launch.</p>
          </div>
        </section>

        <section id="community" className="section community-section">
          <div className="shell community-grid">
            <Reveal>
              <SectionHeading eyebrow="Community, your way" title="Grow beside people who cheer for you." description="Future friendships can bring shared focus, kind challenges, privacy-safe profiles, and optional competition without exposing the details of your life." />
              <div className="community-principles"><span><Users /> Friends first</span><span><Focus /> Focus together</span><span><ShieldCheck /> Privacy-safe</span></div>
              <p>Global ranking will never be the heart of Aiyomi. Personal growth stays the main story.</p>
            </Reveal>
            <Reveal className="community-phone" delay={0.08}>
              <div className="friends-card">
                <div className="friends-top"><span><Users /> Your circle</span><small>Friends first</small></div>
                <div className="friend-row"><span className="friend-avatar friend-a"><Mascot variant="mori" size="small" decorative /></span><div><strong>Mika</strong><small>Focusing now · 18m</small></div><span className="cheer-chip">Cheer</span></div>
                <div className="friend-row"><span className="friend-avatar friend-b"><Mascot variant="lumi" size="small" decorative /></span><div><strong>Jules</strong><small>5-day growth streak</small></div><span className="tiny-fire">✦</span></div>
                <div className="shared-focus-card"><Mascot variant="piko" size="small" pose="focus" mood="focused" decorative /><div><small>Shared focus room</small><strong>Quiet Garden</strong><span>3 friends · 32 min left</span></div><CirclePlay aria-hidden="true" /></div>
              </div>
              <div className="cooperative-challenge">
                <div className="challenge-top"><span><Target /> 7-Day Focus Challenge</span><strong>8h together</strong></div>
                <div className="challenge-row"><span>You</span><i><b style={{ width: "70%" }} /></i><strong>4h 12m</strong></div>
                <div className="challenge-row"><span>Jamie</span><i><b style={{ width: "63%" }} /></i><strong>3h 48m</strong></div>
                <p>One shared goal. Your schedules and task names stay private.</p>
              </div>
              <div className="privacy-bubble"><LockKeyhole /><span><strong>Your task names stay private.</strong><small>You choose what friends can see.</small></span></div>
            </Reveal>
          </div>
        </section>

        <section id="sharing" className="section sharing-section">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="Share your wins" title="Celebrate progress your way." description="Create branded, privacy-safe cards for the moments you choose to share. Sensitive details stay out by default." align="center" /></Reveal>
            <div className="share-card-row">
              <Reveal className="share-card share-streak"><div className="share-brand"><Logo compact linked={false} /><span>Aiyomi</span></div><div className="share-art"><Mascot variant="mori" size="medium" pose="celebrate" decorative /><span>21</span></div><strong>Day Growth Streak</strong><p>Small steps. Real change.</p><span className="share-handle">Plan. Focus. Grow. Together.</span><span className="share-world-scene" aria-hidden="true" /></Reveal>
              <Reveal className="share-card share-focus" delay={0.04}><div className="share-brand"><Logo compact linked={false} /><span>Aiyomi</span></div><div className="share-companion-corner"><Mascot variant="lumi" size="small" pose="focus" mood="focused" decorative /></div><div className="focus-share-ring"><Timer /><strong>12h 42m</strong><span>focused this week</span></div><p>Made time for what mattered.</p><span className="share-handle">A private weekly milestone</span><span className="share-world-scene" aria-hidden="true" /></Reveal>
              <Reveal className="share-card share-achievement" delay={0.08}><div className="share-brand"><Logo compact linked={false} /><span>Aiyomi</span></div><div className="share-companion-corner"><Mascot variant="piko" size="small" pose="celebrate" decorative /></div><span className="share-medal"><Medal /></span><small>Achievement unlocked</small><strong>Steady Sprout</strong><p>Showed up with care for 7 days.</p><span className="share-handle">Only shared when you choose</span><span className="share-world-scene" aria-hidden="true" /></Reveal>
            </div>
            <p className="share-scroll-hint">Swipe to see more milestone concepts.</p>
          </div>
        </section>

        <section id="recovery" className="section real-life-section">
          <div className="shell">
            <Reveal><SectionHeading eyebrow="Built for real life" title="Progress without the pressure." description="Aiyomi is guided by principles that protect your wellbeing, choices, and privacy." align="center" /></Reveal>
            <div className="principle-grid">
              {[
                { icon: <MoonStar />, title: "Rest is progress too", copy: "Recovery should not feel like failure.", tone: "lavender", variant: "lumi", pose: "rest", mood: "sleepy" },
                { icon: <RefreshCw />, title: "Plans can change", copy: "Aiyomi helps you adapt without starting over.", tone: "sky", variant: "piko", pose: "plan", mood: "thoughtful" },
                { icon: <Leaf />, title: "Start small", copy: "Minimum, Target, and Stretch options help consistency.", tone: "mint", variant: "mori", pose: "wave", mood: "happy" },
                { icon: <LockKeyhole />, title: "Your life stays yours", copy: "Private life data stays private by default.", tone: "peach", variant: "mori", pose: "reflect", mood: "proud" },
              ].map((principle, index) => (
                <Reveal key={principle.title} className={`principle-card principle-${principle.tone}`} delay={index * 0.04}><MiniIcon tone={principle.tone}>{principle.icon}</MiniIcon><div className="principle-companion"><Mascot variant={principle.variant as "mori" | "lumi" | "piko"} size="small" pose={principle.pose as "rest" | "plan" | "wave" | "reflect"} mood={principle.mood as "sleepy" | "thoughtful" | "happy" | "proud"} decorative /></div><h3>{principle.title}</h3><p>{principle.copy}</p></Reveal>
              ))}
            </div>
            <Reveal className="recovery-story">
              <div className="recovery-intro">
                <Mascot variant="lumi" size="large" pose="rest" mood="sleepy" label="Lumi resting during a lighter day" />
                <span>Light Day</span>
                <h3>Today feels heavy?</h3>
                <p>Let&apos;s protect what matters and make the rest lighter.</p>
              </div>
              <div className="recovery-plan">
                <div className="recovery-keep"><span>Keep</span><p><Check /> One important task</p><p><Check /> A short walk</p><p><Check /> Evening reflection</p></div>
                <div className="recovery-move"><span>Move</span><p><ArrowRight /> Optional study</p><p><ArrowRight /> Deep cleaning</p></div>
                <small>Aiyomi suggests. You decide what changes.</small>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="final-cta-section">
          <div className="shell">
            <Reveal className="final-cta-card">
              <span className="cta-spark cta-spark-one" aria-hidden="true">✦</span><span className="cta-spark cta-spark-two" aria-hidden="true">✦</span>
              <div className="cta-mascot-left"><Mascot variant="piko" size="large" pose="celebrate" decorative /></div>
              <div className="cta-mascot-center"><Mascot variant="lumi" size="medium" pose="reflect" mood="proud" decorative /></div>
              <div className="cta-content"><span className="eyebrow">A better tomorrow starts gently</span><h2>Ready to meet your companion?</h2><p>Build better days, one day at a time.</p><WaitlistButton source="final_cta" /><div className="cta-platforms"><span>Coming soon to</span><b>iOS</b><b>Android</b></div></div>
              <div className="cta-mascot-right"><Mascot variant="mori" size="large" pose="wave" decorative /></div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div className="footer-brand"><Logo /><p>{brandConfig.tagline}</p><span>AI + You + Me</span></div>
          <div className="footer-column"><strong>Product</strong><a href="#features">Features</a><a href="#how-it-works">How It Works</a><a href="#companions">Companions</a><a href="#community">Community</a></div>
          {companyLinks.length > 0 && <div className="footer-column"><strong>Company</strong>{companyLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</div>}
          {legalLinks.length > 0 && <div className="footer-column"><strong>Legal</strong>{legalLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</div>}
          {socialLinks.length > 0 && <div className="footer-column"><strong>Social</strong>{socialLinks.map(([label, href]) => <a key={label} href={href} rel="noreferrer">{label}</a>)}</div>}
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Aiyomi. All rights reserved.</span><span>Made for better days.</span></div>
      </footer>
    </>
  );
}

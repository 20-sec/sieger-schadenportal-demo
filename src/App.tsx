import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Building2,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

type Tab = "home" | "report" | "claims" | "documents" | "profile";
type ClaimStatus = "question" | "missing" | "review" | "settled";

type Claim = {
  id: string;
  object: string;
  address: string;
  title: string;
  status: ClaimStatus;
  nextStep: string;
  owner: string;
  updated: string;
  progress: number;
  documents: string[];
  missingDocuments: string[];
  timeline: { label: string; note: string; time: string }[];
};

const claims: Claim[] = [
  {
    id: "SK-2026-104",
    object: "WEG Lindenhof",
    address: "Schulstr. 4, 47447 Moers",
    title: "Wasser im Keller",
    status: "missing",
    nextStep: "Bitte Rechnung oder Kostenvoranschlag hochladen",
    owner: "Continentale Schadenservice",
    updated: "Heute, 09:42",
    progress: 52,
    documents: ["Schadenfotos", "Erstmeldung"],
    missingDocuments: ["Rechnung", "Kostenvoranschlag"],
    timeline: [
      {
        label: "Rückfrage",
        note: "Für die Prüfung fehlt noch ein Kostenbeleg.",
        time: "Heute, 09:42",
      },
      {
        label: "Prüfung gestartet",
        note: "Der Schaden liegt beim Schadenservice.",
        time: "Gestern, 15:10",
      },
      {
        label: "Gemeldet",
        note: "Schadenmeldung inklusive Fotos eingegangen.",
        time: "Montag, 08:18",
      },
    ],
  },
  {
    id: "SK-2026-096",
    object: "Haus am Markt",
    address: "Marktplatz 12, 40670 Meerbusch",
    title: "Sturmschaden am Dach",
    status: "review",
    nextStep: "Versicherung prüft, Sie müssen aktuell nichts tun",
    owner: "Tobias Bartschat",
    updated: "Gestern, 16:05",
    progress: 70,
    documents: ["Fotos", "Handwerkerangebot", "Wetterbericht"],
    missingDocuments: [],
    timeline: [
      {
        label: "In Prüfung",
        note: "Die Unterlagen sind vollständig.",
        time: "Gestern, 16:05",
      },
      {
        label: "Angebot ergänzt",
        note: "Dachdecker-Angebot wurde hochgeladen.",
        time: "Montag, 11:30",
      },
    ],
  },
  {
    id: "SK-2026-081",
    object: "Parkresidenz Nord",
    address: "Rosenweg 9, 40211 Düsseldorf",
    title: "Glasschaden Eingangstür",
    status: "question",
    nextStep: "Bitte Rückfrage zur Ursache beantworten",
    owner: "Continentale Schadenservice",
    updated: "Vor 2 Tagen",
    progress: 38,
    documents: ["Foto Eingangstür"],
    missingDocuments: ["Antwort zur Ursache"],
    timeline: [
      {
        label: "Rückfrage",
        note: "War die Beschädigung durch Fremdeinwirkung sichtbar?",
        time: "Vor 2 Tagen",
      },
      {
        label: "Gemeldet",
        note: "Schaden wurde erfolgreich angelegt.",
        time: "Vor 3 Tagen",
      },
    ],
  },
];

const documents = [
  {
    title: "Musterrechnung_ohneFotos.pdf",
    type: "Rechnung",
    claim: "Wasser im Keller",
    date: "Heute",
  },
  {
    title: "Schadenfotos_Keller.zip",
    type: "Fotos",
    claim: "Wasser im Keller",
    date: "Gestern",
  },
  {
    title: "Angebot_Dachdecker.pdf",
    type: "Kostenvoranschlag",
    claim: "Sturmschaden am Dach",
    date: "Montag",
  },
];

const objects = ["WEG Lindenhof", "Haus am Markt", "Parkresidenz Nord"];

const statusMeta = {
  question: {
    label: "Rückfrage offen",
    tone: "danger",
    icon: MessageCircle,
  },
  missing: {
    label: "Dokument fehlt",
    tone: "warning",
    icon: Paperclip,
  },
  review: {
    label: "In Prüfung",
    tone: "info",
    icon: ShieldCheck,
  },
  settled: {
    label: "Abgeschlossen",
    tone: "success",
    icon: Check,
  },
} satisfies Record<ClaimStatus, { label: string; tone: string; icon: typeof Check }>;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0].id);
  const [query, setQuery] = useState("");
  const [reportStep, setReportStep] = useState(0);
  const [draft, setDraft] = useState({
    object: objects[0],
    description: "",
    contact: "Mara Klein",
    files: 2,
  });

  const selectedClaim = claims.find((claim) => claim.id === selectedClaimId) ?? claims[0];
  const filteredClaims = claims.filter((claim) => {
    const haystack = `${claim.id} ${claim.object} ${claim.address} ${claim.title}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const attentionCount = claims.filter((claim) => claim.status === "question" || claim.status === "missing").length;

  const openClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    setActiveTab("claims");
  };

  return (
    <div className="app-shell">
      <aside className="desktop-rail" aria-label="Hauptnavigation">
        <BrandMark />
        <nav>
          <RailButton icon={Home} label="Start" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <RailButton icon={Plus} label="Melden" active={activeTab === "report"} onClick={() => setActiveTab("report")} />
          <RailButton icon={ClipboardCheck} label="Schäden" active={activeTab === "claims"} onClick={() => setActiveTab("claims")} />
          <RailButton icon={FileText} label="Dokumente" active={activeTab === "documents"} onClick={() => setActiveTab("documents")} />
          <RailButton icon={CircleUserRound} label="Profil" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </nav>
      </aside>

      <div className="phone-frame">
        <header className="mobile-header">
          <BrandMark compact />
          <div className="header-actions">
            <button className="icon-button" aria-label="Benachrichtigungen">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <button className="avatar-button" aria-label="Profil öffnen">
              MK
            </button>
          </div>
        </header>

        <main className="content">
          {activeTab === "home" && <HomeView attentionCount={attentionCount} onReport={() => setActiveTab("report")} onOpenClaim={openClaim} />}
          {activeTab === "report" && (
            <ReportView
              draft={draft}
              setDraft={setDraft}
              step={reportStep}
              setStep={setReportStep}
              onFinish={() => {
                setReportStep(0);
                setActiveTab("home");
              }}
            />
          )}
          {activeTab === "claims" && (
            <ClaimsView
              claim={selectedClaim}
              claims={filteredClaims}
              query={query}
              setQuery={setQuery}
              onSelectClaim={setSelectedClaimId}
            />
          )}
          {activeTab === "documents" && <DocumentsView />}
          {activeTab === "profile" && <ProfileView />}
        </main>

        <nav className="bottom-nav" aria-label="Mobile Navigation">
          <NavButton icon={Home} label="Start" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavButton icon={Plus} label="Melden" active={activeTab === "report"} onClick={() => setActiveTab("report")} />
          <NavButton icon={ClipboardCheck} label="Schäden" active={activeTab === "claims"} onClick={() => setActiveTab("claims")} />
          <NavButton icon={FileText} label="Dokumente" active={activeTab === "documents"} onClick={() => setActiveTab("documents")} />
          <NavButton icon={CircleUserRound} label="Profil" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </nav>
      </div>

      <section className="desktop-context" aria-label="Agentur-Kontext">
        <div className="context-header">
          <span>Agenturansicht</span>
          <strong>Nur für interne Bearbeitung</strong>
        </div>
        <div className="context-grid">
          <ContextMetric label="Offene Rückfragen" value="2" tone="danger" />
          <ContextMetric label="In Prüfung" value="1" tone="info" />
          <ContextMetric label="Dokumente fehlen" value="2" tone="warning" />
          <ContextMetric label="Ø Reaktionszeit" value="3 h" tone="success" />
        </div>
        <div className="context-panel">
          <h2>Warum diese Struktur</h2>
          <p>
            Hausverwalter sehen zuerst Aufgaben, nicht interne Codes. Fachdetails bleiben erreichbar, aber die Startoberfläche
            beantwortet sofort: Was ist offen, wer ist dran und was muss ich tun?
          </p>
        </div>
      </section>
    </div>
  );
}

function HomeView({
  attentionCount,
  onReport,
  onOpenClaim,
}: {
  attentionCount: number;
  onReport: () => void;
  onOpenClaim: (claimId: string) => void;
}) {
  return (
    <div className="view-stack">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Hausverwalter-Portal</p>
          <h1>Heute brauchen {attentionCount} Schäden Ihre Aufmerksamkeit.</h1>
        </div>
        <button className="primary-action" onClick={onReport}>
          <Plus size={20} />
          Schaden melden
        </button>
      </section>

      <section className="attention-grid" aria-label="Aktuelle Aufgaben">
        <AttentionTile icon={MessageCircle} label="Rückfragen" value="1" tone="danger" />
        <AttentionTile icon={Paperclip} label="Dokumente fehlen" value="1" tone="warning" />
        <AttentionTile icon={ShieldCheck} label="In Prüfung" value="1" tone="info" />
      </section>

      <section className="next-section">
        <div className="section-heading">
          <h2>Als Nächstes</h2>
          <span>nach Dringlichkeit</span>
        </div>
        <div className="claim-list">
          {claims.slice(0, 3).map((claim) => (
            <ClaimCard key={claim.id} claim={claim} onClick={() => onOpenClaim(claim.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportView({
  draft,
  setDraft,
  step,
  setStep,
  onFinish,
}: {
  draft: { object: string; description: string; contact: string; files: number };
  setDraft: (draft: { object: string; description: string; contact: string; files: number }) => void;
  step: number;
  setStep: (step: number) => void;
  onFinish: () => void;
}) {
  const steps = ["Objekt", "Beschreibung", "Fotos", "Prüfen"];
  const canContinue = step !== 1 || draft.description.trim().length >= 12;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    onFinish();
  };

  return (
    <form className="view-stack" onSubmit={submit}>
      <section className="screen-title">
        <button className="icon-button ghost" type="button" onClick={() => setStep(Math.max(0, step - 1))} aria-label="Zurück">
          <ArrowLeft size={19} />
        </button>
        <div>
          <p className="eyebrow">Schadenmeldung</p>
          <h1>{steps[step]}</h1>
        </div>
      </section>

      <StepIndicator steps={steps} active={step} />

      {step === 0 && (
        <section className="form-section">
          <label htmlFor="object">Welches Objekt betrifft es?</label>
          <select id="object" value={draft.object} onChange={(event) => setDraft({ ...draft, object: event.target.value })}>
            {objects.map((object) => (
              <option key={object}>{object}</option>
            ))}
          </select>
          <div className="hint-row">
            <MapPin size={17} />
            <span>Adresse wird nach Auswahl automatisch ergänzt.</span>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="form-section">
          <label htmlFor="description">Was ist passiert?</label>
          <textarea
            id="description"
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            placeholder="Zum Beispiel: Im Keller steht Wasser, die Wand ist nass und der Mieter hat Fotos geschickt."
            rows={7}
          />
          <div className={`hint-row ${canContinue ? "good" : ""}`}>
            <Sparkles size={17} />
            <span>Die App leitet daraus später Schadenart und Versicherungssparte ab.</span>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="upload-zone">
          <Camera size={30} />
          <h2>{draft.files} Dateien vorbereitet</h2>
          <p>Fotos, Rechnungen oder Angebote können direkt vom Handy ergänzt werden.</p>
          <div className="upload-actions">
            <button className="secondary-action" type="button" onClick={() => setDraft({ ...draft, files: draft.files + 1 })}>
              <Camera size={18} />
              Foto aufnehmen
            </button>
            <button className="secondary-action" type="button" onClick={() => setDraft({ ...draft, files: draft.files + 1 })}>
              <Upload size={18} />
              Datei hochladen
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="review-panel">
          <ReviewLine label="Objekt" value={draft.object} />
          <ReviewLine label="Beschreibung" value={draft.description || "Wasser im Keller, Wand ist nass"} />
          <ReviewLine label="Kontakt" value={draft.contact} />
          <ReviewLine label="Anhänge" value={`${draft.files} Dateien`} />
          <div className="comfort-note">
            <ShieldCheck size={18} />
            <span>Nach dem Absenden erhalten Sie eine klare Statusseite mit dem nächsten Schritt.</span>
          </div>
        </section>
      )}

      <div className="sticky-actions">
        <button className="primary-action full" type="submit" disabled={!canContinue}>
          {step < steps.length - 1 ? "Weiter" : "Schaden absenden"}
          <ChevronRight size={19} />
        </button>
      </div>
    </form>
  );
}

function ClaimsView({
  claim,
  claims: claimList,
  query,
  setQuery,
  onSelectClaim,
}: {
  claim: Claim;
  claims: Claim[];
  query: string;
  setQuery: (query: string) => void;
  onSelectClaim: (claimId: string) => void;
}) {
  return (
    <div className="view-stack split-view">
      <section className="screen-title compact">
        <div>
          <p className="eyebrow">Schäden</p>
          <h1>Aktuelle Fälle</h1>
        </div>
      </section>

      <div className="search-field">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Adresse, Objekt oder Nummer suchen" />
      </div>

      <div className="claim-list condensed">
        {claimList.map((item) => (
          <ClaimCard key={item.id} claim={item} selected={item.id === claim.id} onClick={() => onSelectClaim(item.id)} />
        ))}
      </div>

      <section className="claim-detail">
        <div className="detail-header">
          <StatusBadge status={claim.status} />
          <h2>{claim.title}</h2>
          <p>{claim.address}</p>
        </div>

        <div className="next-step-band">
          <AlertCircle size={20} />
          <div>
            <strong>Aktuell wichtig</strong>
            <span>{claim.nextStep}</span>
          </div>
        </div>

        <div className="progress-block">
          <div>
            <span>Fortschritt</span>
            <strong>{claim.progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${claim.progress}%` }} />
          </div>
        </div>

        <section className="doc-checklist">
          <h3>Unterlagen</h3>
          {claim.documents.map((doc) => (
            <ChecklistRow key={doc} done label={doc} />
          ))}
          {claim.missingDocuments.map((doc) => (
            <ChecklistRow key={doc} label={doc} />
          ))}
        </section>

        <section className="timeline">
          <h3>Verlauf</h3>
          {claim.timeline.map((item) => (
            <div className="timeline-item" key={`${item.label}-${item.time}`}>
              <Clock3 size={15} />
              <div>
                <strong>{item.label}</strong>
                <span>{item.note}</span>
                <small>{item.time}</small>
              </div>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}

function DocumentsView() {
  return (
    <div className="view-stack">
      <section className="screen-title compact">
        <div>
          <p className="eyebrow">Dokumente</p>
          <h1>Alles am Schaden</h1>
        </div>
        <button className="icon-button raised" aria-label="Dokument hochladen">
          <Upload size={19} />
        </button>
      </section>

      <section className="quick-upload">
        <Upload size={24} />
        <div>
          <strong>Dokument nachreichen</strong>
          <span>Rechnung, Angebot oder Foto direkt einem Schaden zuordnen.</span>
        </div>
      </section>

      <div className="document-list">
        {documents.map((document) => (
          <article className="document-row" key={document.title}>
            <div className="doc-icon">
              <FileText size={19} />
            </div>
            <div>
              <strong>{document.title}</strong>
              <span>
                {document.type} · {document.claim}
              </span>
            </div>
            <small>{document.date}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="view-stack">
      <section className="profile-hero">
        <div className="large-avatar">MK</div>
        <h1>Mara Klein</h1>
        <p>Hausverwaltung Klein & Partner</p>
      </section>

      <section className="profile-list">
        <ProfileRow icon={Building2} label="3 verwaltete Objekte" />
        <ProfileRow icon={Mail} label="mara.klein@beispiel.de" />
        <ProfileRow icon={Wrench} label="Standard-Handwerker aktiv" />
        <ProfileRow icon={Download} label="Monatsbericht herunterladen" />
      </section>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? "compact" : ""}`}>
      <img className="brand-logo" src="/sieger-logo.png" alt="SIEGER Versicherungsschmiede" />
      <div>
        <strong>SIEGER</strong>
        {!compact && <span>Schadenportal</span>}
      </div>
    </div>
  );
}

function AttentionTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className={`attention-tile ${tone}`}>
      <Icon size={19} />
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function ClaimCard({ claim, selected = false, onClick }: { claim: Claim; selected?: boolean; onClick: () => void }) {
  const Icon = statusMeta[claim.status].icon;

  return (
    <button className={`claim-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className={`claim-icon ${statusMeta[claim.status].tone}`}>
        <Icon size={18} />
      </div>
      <div className="claim-copy">
        <strong>{claim.title}</strong>
        <span>{claim.object}</span>
        <p>{claim.nextStep}</p>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}

function StatusBadge({ status }: { status: ClaimStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span className={`status-badge ${meta.tone}`}>
      <Icon size={15} />
      {meta.label}
    </span>
  );
}

function StepIndicator({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="step-indicator" aria-label="Fortschritt">
      {steps.map((step, index) => (
        <div className={`step-dot ${index <= active ? "active" : ""}`} key={step}>
          <span>{index + 1}</span>
          <small>{step}</small>
        </div>
      ))}
    </div>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChecklistRow({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <div className={`checklist-row ${done ? "done" : ""}`}>
      <span>{done ? <Check size={15} /> : <X size={15} />}</span>
      <strong>{label}</strong>
    </div>
  );
}

function ProfileRow({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <div className="profile-row">
      <Icon size={19} />
      <span>{label}</span>
      <ChevronRight size={18} />
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

function RailButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <Icon size={19} />
      <span>{label}</span>
    </button>
  );
}

function ContextMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <article className={`context-metric ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import MarkdownEditor from "./Components/MarkdownEditor";
import TemplateWizard from "./Components/TemplateWizard";
import "./App.css";
import { v4 as uuidv4 } from 'uuid';
import html2pdf from 'html2pdf.js';
import { cvTemplates } from './data/cvTemplates';
import ErrorBoundary from './Components/ErrorBoundary';
import { LuPlus, LuLogOut, LuUser, LuChevronRight, LuCalendar, LuFileText, LuSmartphone, LuShare2, LuDownload, LuSave, LuTrash2, LuMenu, LuX, LuSettings } from "react-icons/lu";

import { useAuth } from './context/AuthContext';
import Login from './Components/Login';
import ResetPassword from './Components/ResetPassword';
import CVScoringModal from './Components/CVScoringModal';
import EmptyState from './Components/EmptyState';
import SystemSetupModal from './Components/SystemSetupModal';
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const { user, getUserId } = useAuth();
  const [resetToken, setResetToken] = useState(null);

  // System settings state (available after login)
  const [existingConfig, setExistingConfig] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Check if URL is a reset password link
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/').pop();
      if (token) setResetToken(token);
    }
  }, []);

  const handleBackToLogin = () => {
    setResetToken(null);
    window.history.pushState({}, '', '/');
  };
  const [notes, setNotes] = useState([]);

  const [currentNote, setCurrentNote] = useState({ title: "", desc: "", script: "", id: null, parentId: "", isDraft: false });
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("Guided");
  const [cvFormat, setCvFormat] = useState("European");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [wizardOptions, setWizardOptions] = useState({ mode: 'select', step: 0 });

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
      setIsEditing(false);
      return;
    }

    const checkBackend = (retries = 10) => {
      fetch(`${import.meta.env.VITE_API_URL}/api/test`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setBackendStatus("connected");
          } else {
            setBackendStatus("waking-up");
            if (retries > 0) setTimeout(() => checkBackend(retries - 1), 3000);
            else setBackendStatus("disconnected");
          }
        })
        .catch((err) => {
          setBackendStatus("waking-up");
          if (retries > 0) setTimeout(() => checkBackend(retries - 1), 3000);
          else {
            console.error("Backend offline", err);
            setBackendStatus("disconnected");
          }
        });
    };
    checkBackend();

    // After login: check if system settings have been configured.
    // If not → auto-open the settings modal so the user sets them up first.
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL}/api/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(cfg => {
        setExistingConfig(cfg);
        if (!cfg.isConfigured) {
          // Settings not yet configured — open the settings modal automatically
          setIsSettingsOpen(true);
        }
      })
      .catch(() => {
        // If config fetch fails, don't block the user — proceed normally
      });

    const userId = getUserId();
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/resumes?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setNotes(data);
        } else {
          setNotes([]);
        }
      })
      .catch(err => console.error("Failed to fetch resumes", err));
  }, [user]);

  const handleCreateNote = async (parentId = "", selections = null) => {
    let templateKey = "Blank Note";
    let format = "America";
    let templateContent = "";

    if (selections) {
      // Direct Creation Flow (Using Selections or AI)
      const { occupation, layout, education, aiGenerated, mode } = selections;
      const format = layout || "Professional";
      
      let templateContent = "";
      let newTitle = "New CV";

      if (mode === 'ai' && aiGenerated) {
        templateContent = aiGenerated;
        newTitle = "AI Generated CV";
        setNeedsVerification(true); // Trigger GuidedEditor verification popup
      } else {
        // Try to find template, fallback to a generated header so it's not empty
        templateContent = cvTemplates[occupation];
        if (!templateContent) {
          templateContent = `# [Your Name] | ${occupation || 'Professional'}\n[Email] | [Phone]\n\n## Education\n- ${education || '[Degree]'}\n\n## Experience\n- [Job Title] | [Company Name]`;
        }
        newTitle = occupation ? `${occupation} CV` : "New CV";
      }

      setCurrentNote({
        title: newTitle,
        desc: templateContent,
        script: "",
        id: null,
        parentId,
        isDraft: true
      });
      setCvFormat(format);
      setIsEditing(false);
      setActiveTab("Guided"); // Switch to editor tab immediately
    } else {

      // Manual creation (Initial state or empty)
      templateContent = cvTemplates["Blank Note"];
      setCurrentNote({
        title: "New CV",
        desc: templateContent,
        script: "",
        id: null,
        parentId: "",
        isDraft: true
      });
      setCvFormat("America");
      setIsEditing(false);
      setWizardOptions({ mode: 'select', step: 0 });
      setIsWizardOpen(true);
    }
  };

  const handleOpenWizardFromEmpty = (mode) => {
    setWizardOptions({ 
      mode: mode, 
      step: mode === 'ai' ? 0 : 1 
    });
    setIsWizardOpen(true);
  };

  const handleAutoTitleUpdate = ({ firstName, lastName, profession }) => {
    // Only update if current title is essentially "Untitled"
    const currentTitle = currentNote.title || "";
    const isUntitled = !currentTitle || 
                       currentTitle === "Untitled" || 
                       currentTitle === "Untitled Resume" || 
                       currentTitle === "Resume Title..." ||
                       // Also allow if it looks like a previously auto-generated title
                       (firstName && currentTitle.includes(firstName)) || 
                       (lastName && currentTitle.includes(lastName));

    if (isUntitled && (firstName || lastName || profession)) {
      const newTitle = `${firstName} ${lastName} ${profession ? '- ' + profession : ''}`.trim();
      if (newTitle && newTitle !== currentTitle) {
        setCurrentNote(prev => ({ ...prev, title: newTitle }));
      }
    }
  };

  const handleSaveNote = () => {
    if (!currentNote.title.trim()) {
      alert("Please provide a title for your resume.");
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    const noteToSave = {
      ...currentNote,
      date: new Date().toLocaleDateString(),
      userId: userId
    };

    if (currentNote.id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/resumes/${currentNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteToSave)
      })
        .then(res => res.json())
        .then(updatedNote => {
          setNotes(notes.map(n => (n.id === updatedNote.id ? updatedNote : n)));
          setIsEditing(true);
        })
        .catch(err => alert("Failed to save changes"));
    } else {
      const newNote = { ...noteToSave, id: uuidv4() };
      fetch(`${import.meta.env.VITE_API_URL}/api/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      })
        .then(res => res.json())
        .then(savedNote => {
          setNotes([savedNote, ...notes]);
          setCurrentNote(savedNote);
          setIsEditing(true);
        })
        .catch(err => alert("Failed to create resume"));
    }
  };

  const handleDeleteNote = (id) => {
    const userId = getUserId();
    if (!userId) return;
    if (window.confirm("Are you sure you want to delete this resume?")) {
      fetch(`${import.meta.env.VITE_API_URL}/api/resumes/${id}?userId=${userId}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            setNotes(notes.filter(n => n.id !== id));
            if (currentNote.id === id) {
              setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "", isDraft: false });
              setIsEditing(false);
            }
          }
        })
        .catch(err => alert("Failed to delete resume"));
    }
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector(".cv-preview > div") || document.querySelector(".html-preview");
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `${currentNote.title || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['css', 'legacy'], // Utilize native CSS behaviors rather than forcing whole sections to jump
        avoid: ['h2', 'h3', 'p', 'li', '.contact-info', '.cv-photo-container'] // Target atomic elements instead of large sections! 
      }
    };
    html2pdf().set(opt).from(element).save();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (resetToken) return <ResetPassword token={resetToken} onBackToLogin={handleBackToLogin} />;
  if (!user) return <Login />;

  const hasResumes = notes.length > 0;
  const isCreatingNew = currentNote.title !== "" || currentNote.desc !== "" || isWizardOpen || currentNote.id !== null || currentNote.isDraft;
  const shouldShowEditor = hasResumes || isCreatingNew;

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <ErrorBoundary>
        <Sidebar
          notes={notes}
          onCreateNote={() => {
            setWizardOptions({ mode: 'select', step: 0 });
            handleCreateNote();
            if (window.innerWidth <= 768) setIsSidebarOpen(false);
          }}
          onSelectNote={(note) => {
            setCurrentNote({ ...note, title: note.title || "", desc: note.desc || "", script: note.script || "" });
            setIsEditing(true);
            if (window.innerWidth <= 768) setIsSidebarOpen(false);
          }}
          onDeleteNote={handleDeleteNote}
          activeNoteId={currentNote.id}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={toggleSidebar}
        />
      </ErrorBoundary>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            {!isSidebarOpen && (
              <button className="desktop-toggle-btn" onClick={toggleSidebar} title="Open Sidebar">
                <LuMenu />
              </button>
            )}
            {!isSidebarOpen && <div className="divider-vertical"></div>}
            <input
              type="text"
              className="title-input-flat"
              placeholder="Resume Title..."
              value={currentNote.title || ""}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              disabled={!shouldShowEditor}
            />
            <div className="divider-vertical"></div>
            <span className={`editor-status ${isEditing ? "status-saved" : "status-unsaved"}`}>
              {isEditing ? "SAVED" : "UNSAVED"}
            </span>
            <div className="divider-vertical"></div>
            <span
              className={`editor-status ${backendStatus === "connected" ? "status-saved" : (backendStatus === "waking-up" ? "status-waking" : "status-unsaved")}`}
              title="Backend Connection"
              style={backendStatus === "waking-up" ? { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' } : {}}
            >
              {backendStatus === "connected" ? "ONLINE" : (backendStatus === "waking-up" ? "WAKING UP..." : "OFFLINE")}
            </span>
          </div>

          <div className="top-bar-right">
            <button
              className="create-cv-btn-top"
              onClick={() => {
                setWizardOptions({ mode: 'select', step: 0 });
                setIsWizardOpen(true);
              }}
              title="Create New CV"
            >
              <LuPlus size={16} /> Create CV
            </button>
            <button
              className="settings-gear-btn"
              onClick={() => {
                const token = localStorage.getItem('token');
                fetch(`${import.meta.env.VITE_API_URL}/api/config`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                  .then(r => r.json())
                  .then(cfg => { setExistingConfig(cfg); setIsSettingsOpen(true); })
                  .catch(() => setIsSettingsOpen(true));
              }}
              title="System Settings"
              aria-label="System Settings"
            >
              <LuSettings size={18} />
            </button>
          </div>
        </header>

        {shouldShowEditor ? (
          <div className="editor-workspace">
            <ErrorBoundary>
              <MarkdownEditor
                markdownValue={currentNote.desc}
                onMarkdownChange={(val) => setCurrentNote({ ...currentNote, desc: val })}
                scriptValue={currentNote.script}
                onScriptChange={(val) => setCurrentNote({ ...currentNote, script: val })}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                cvFormat={cvFormat}
                onFormatChange={setCvFormat}
                onSave={handleSaveNote}
                onStartWizard={() => setIsWizardOpen(true)}
                needsVerification={needsVerification}
                onVerificationDismissed={() => setNeedsVerification(false)}
                onMetaUpdate={handleAutoTitleUpdate}
                onDownloadPDF={handleDownloadPDF}
                onScoreCV={() => setIsScoringModalOpen(true)}
                currentNoteId={currentNote.id}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <EmptyState onSelectMode={handleOpenWizardFromEmpty} />
        )}
      </main>
      <TemplateWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={(selections) => handleCreateNote("", selections)}
        initialMode={wizardOptions.mode}
        initialStep={wizardOptions.step}
      />

      <CVScoringModal 
        isOpen={isScoringModalOpen} 
        onClose={() => setIsScoringModalOpen(false)} 
        markdown={currentNote.desc} 
      />

      {/* System Settings Modal — auto-opens on first login if not configured */}
      {isSettingsOpen && (
        <SystemSetupModal
          isEditMode={true}
          existingConfig={existingConfig}
          allowClose={existingConfig?.isConfigured === true}
          onConfigured={(cfg) => {
            setExistingConfig(cfg);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <SpeedInsights />
    </div>
  );
}

export default App;

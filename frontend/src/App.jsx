import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Components/Sidebar";
import MarkdownEditor from "./Components/MarkdownEditor";
import TemplateWizard from "./Components/TemplateWizard";
import "./App.css";
import { v4 as uuidv4 } from 'uuid';
import html2pdf from 'html2pdf.js';
import { cvTemplates } from './data/cvTemplates';
import ErrorBoundary from './Components/ErrorBoundary';

import { useAuth } from './context/AuthContext';
import Login from './Components/Login';
import ResetPassword from './Components/ResetPassword';
import EmptyState from './Components/EmptyState';
import SystemSetupModal from './Components/SystemSetupModal';
import { getAuthHeaders } from './utils/api';
import { consumeResetPasswordToken, clearResetPasswordToken } from './utils/resetPasswordToken';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LuTrash2 } from "react-icons/lu";

function App() {
  const { user, getUserId } = useAuth();
  const [resetToken, setResetToken] = useState(null);
  const [inviteToken, setInviteToken] = useState(null);

  // System settings state (available after login)
  const [existingConfig, setExistingConfig] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const token = consumeResetPasswordToken();
    if (token) setResetToken(token);

    const path = window.location.pathname;
    if (path.startsWith('/register')) {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      if (invite) setInviteToken(invite);
    }
  }, []);

  const handleBackToLogin = () => {
    clearResetPasswordToken();
    setResetToken(null);
    window.history.pushState({}, '', '/');
  };
  const [notes, setNotes] = useState([]);

  const [currentNote, setCurrentNote] = useState({ title: "", desc: "", script: "", id: null, parentId: "", isDraft: false });
  const [isDirty, setIsDirty] = useState(false);

  const [cvFormat, setCvFormat] = useState("European");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [wizardOptions, setWizardOptions] = useState({ mode: 'select', step: 0 });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleVerificationDismissed = useCallback(() => {
    setNeedsVerification(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
      setIsDirty(false);
      return;
    }

    const checkBackend = (retries = 3) => {
      fetch(`${import.meta.env.VITE_API_URL}/api/test`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.status === 'success') {
            setBackendStatus("connected");
            return;
          }
          setBackendStatus("waking-up");
          if (retries > 0) setTimeout(() => checkBackend(retries - 1), 2000);
          else setBackendStatus("disconnected");
        })
        .catch((err) => {
          setBackendStatus("waking-up");
          if (retries > 0) setTimeout(() => checkBackend(retries - 1), 2000);
          else {
            console.error("Backend offline", err);
            setBackendStatus("disconnected");
          }
        });
    };
    checkBackend();

    // Load settings snapshot for the current user (values are masked by the API).
    fetch(`${import.meta.env.VITE_API_URL}/api/config`, {
      headers: getAuthHeaders()
    })
      .then(r => r.json())
      .then(cfg => {
        setExistingConfig(cfg);
      })
      .catch(() => {
        // If config fetch fails, don't block the user — proceed normally
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/resumes`, {
      headers: getAuthHeaders()
    })
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
    if (selections) {
      const { occupation, education, aiGenerated, mode, photo, importedTitle } = selections;
      const format = photo === "yes" ? "European" : "America";

      let templateContent = "";
      let newTitle = "New CV";

      if (mode === 'ai' && aiGenerated) {
        templateContent = aiGenerated;
        newTitle = "AI Generated CV";
        setNeedsVerification(true);
      } else if (mode === 'import' && aiGenerated) {
        templateContent = aiGenerated;
        newTitle = importedTitle || "Imported CV";
        setNeedsVerification(false);

        const userId = getUserId();
        if (!userId) return;

        const newNote = {
          id: uuidv4(),
          title: newTitle,
          desc: templateContent,
          script: "",
          date: new Date().toLocaleDateString(),
          parentId,
          cvFormat: "America",
          userId,
        };

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/resumes`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(newNote),
          });
          if (!res.ok) throw new Error('Save failed');
          const savedNote = await res.json();
          setNotes([savedNote, ...notes]);
          setCurrentNote(savedNote);
          setCvFormat("America");
          setIsDirty(false);
        } catch (err) {
          console.error('Auto-save after import failed:', err);
          setCurrentNote({
            title: newTitle,
            desc: templateContent,
            script: "",
            id: null,
            parentId,
            isDraft: true,
            cvFormat: "America",
          });
          setCvFormat("America");
          setIsDirty(true);
        }
        return;
      } else {
        templateContent = cvTemplates[occupation];
        if (!templateContent) {
          templateContent = `# [Your Name] | ${occupation || 'Professional'}\n[City], [Province], [Zip] | [Email] | [Phone]\n\n## Education\n- ${education || '[Degree]'}\n\n## Experience\n- [Job Title] | [Company Name]`;
        }
        newTitle = occupation ? `${occupation} CV` : "New CV";
      }

      setCurrentNote({
        title: newTitle,
        desc: templateContent,
        script: "",
        id: null,
        parentId,
        isDraft: true,
        cvFormat: format,
      });
      setCvFormat(format);
      setIsDirty(true);
      setIsPreviewMode(false);
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
      setIsDirty(false);
      setWizardOptions({ mode: 'select', step: 0 });
      setIsWizardOpen(true);
    }
  };

  const handleOpenWizardFromEmpty = (mode) => {
    setWizardOptions({ 
      mode: mode, 
      step: mode === 'manual' ? 1 : 0 
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
        setIsDirty(true);
      }
    }
  };

  const handleSaveNote = (descOverride) => {
    if (!currentNote.title.trim()) {
      alert("Please provide a title for your resume.");
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    const noteToSave = {
      ...currentNote,
      desc: descOverride ?? currentNote.desc,
      date: new Date().toLocaleDateString(),
      userId: userId,
      cvFormat: cvFormat,
    };

    if (currentNote.id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/resumes/${currentNote.id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(noteToSave)
      })
        .then(res => res.json())
        .then(updatedNote => {
          setNotes(notes.map(n => (n.id === updatedNote.id ? updatedNote : n)));
          setCurrentNote(updatedNote);
          setIsDirty(false);
        })
        .catch(err => alert("Failed to save changes"));
    } else {
      const newNote = { ...noteToSave, id: uuidv4() };
      fetch(`${import.meta.env.VITE_API_URL}/api/resumes`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(newNote)
      })
        .then(res => res.json())
        .then(savedNote => {
          setNotes([savedNote, ...notes]);
          setCurrentNote(savedNote);
          setIsDirty(false);
        })
        .catch(err => alert("Failed to create resume"));
    }
  };

  const handleDuplicateNote = (id) => {
    const userId = getUserId();
    if (!userId) return;

    const source = notes.find(n => n.id === id);
    if (!source) return;

    const copyTitle = source.title?.trim()
      ? `${source.title.trim()} (Copy)`
      : 'Untitled (Copy)';

    const newNote = {
      id: uuidv4(),
      title: copyTitle,
      desc: source.desc || '',
      script: source.script || '',
      date: new Date().toLocaleDateString(),
      parentId: source.parentId || '',
      cvFormat: source.cvFormat || cvFormat,
      userId,
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/resumes`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(newNote),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to duplicate');
        return res.json();
      })
      .then(savedNote => {
        setNotes(prev => [savedNote, ...prev]);
        setCurrentNote({
          ...savedNote,
          title: savedNote.title || '',
          desc: savedNote.desc || '',
          script: savedNote.script || '',
          isDraft: false,
        });
        setCvFormat(savedNote.cvFormat || 'European');
        setIsDirty(false);
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
      })
      .catch(() => alert('Failed to duplicate resume'));
  };

  const handleDeleteNote = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteNote = () => {
    const id = deleteConfirmId;
    if (!id) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/resumes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
      .then(res => {
        if (res.ok) {
          setNotes(notes.filter(n => n.id !== id));
          if (currentNote.id === id) {
            setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "", isDraft: false });
            setIsPreviewMode(false);
            setIsDirty(false);
          }
          setDeleteConfirmId(null);
        }
      })
      .catch(() => alert("Failed to delete resume"));
  };

  const pendingDeleteNote = deleteConfirmId
    ? notes.find(n => n.id === deleteConfirmId)
    : null;

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

  const openCreateWizard = () => {
    setWizardOptions({ mode: 'select', step: 0 });
    setIsWizardOpen(true);
  };

  const updateCurrentNote = (updates) => {
    setCurrentNote(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const selectNote = (note) => {
    setCurrentNote({
      ...note,
      title: note.title || "",
      desc: note.desc || "",
      script: note.script || "",
      isDraft: false,
    });
    setCvFormat(note.cvFormat || "European");
    setIsDirty(false);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const openSettings = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/config`, {
      headers: getAuthHeaders()
    })
      .then(r => r.json())
      .then(cfg => { setExistingConfig(cfg); setIsSettingsOpen(true); })
      .catch(() => setIsSettingsOpen(true));
  };

  if (resetToken) return <ResetPassword token={resetToken} onBackToLogin={handleBackToLogin} />;
  if (!user) return <Login inviteToken={inviteToken} />;

  const hasResumes = notes.length > 0;
  const shouldShowEditor = currentNote.id !== null || currentNote.isDraft;

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <ErrorBoundary>
        <Sidebar
          notes={notes}
          onSelectNote={selectNote}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          activeNoteId={currentNote.id}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          onOpenSettings={openSettings}
          onCreateResume={openCreateWizard}
        />
      </ErrorBoundary>

      <main className="main-content main-content-full">
        {shouldShowEditor ? (
          <div className="editor-workspace editor-workspace-full">
            <ErrorBoundary>
              <MarkdownEditor
                key={currentNote.id || (currentNote.isDraft ? 'draft' : 'new')}
                markdownValue={currentNote.desc}
                onMarkdownChange={(val) => updateCurrentNote({ desc: val })}
                cvFormat={cvFormat}
                onFormatChange={setCvFormat}
                onSave={handleSaveNote}
                onStartWizard={openCreateWizard}
                needsVerification={needsVerification}
                onVerificationDismissed={handleVerificationDismissed}
                onMetaUpdate={handleAutoTitleUpdate}
                onDownloadPDF={handleDownloadPDF}
                currentNoteId={currentNote.id}
                isPreview={isPreviewMode}
                onPreviewChange={setIsPreviewMode}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <EmptyState hasResumes={hasResumes} onSelectMode={handleOpenWizardFromEmpty} />
        )}
      </main>
      <TemplateWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={(selections) => handleCreateNote("", selections)}
        initialMode={wizardOptions.mode}
        initialStep={wizardOptions.step}
      />

      {/* Setup modal — auto-opens on first login if API keys are not configured */}
      {isSettingsOpen && (
        <SystemSetupModal
          existingConfig={existingConfig}
          allowClose={true}
          onConfigured={(cfg) => {
            setExistingConfig(cfg);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {deleteConfirmId && (
        <div className="profile-logout-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="profile-logout-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-logout-icon">
              <LuTrash2 size={28} />
            </div>
            <h3>Delete Resume</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>{pendingDeleteNote?.title || 'this resume'}</strong>? This action cannot be undone.
            </p>
            <div className="profile-logout-actions">
              <button type="button" className="profile-logout-cancel" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button type="button" className="profile-logout-confirm" onClick={confirmDeleteNote}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <SpeedInsights />
    </div>
  );
}

export default App;

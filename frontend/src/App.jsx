import React, { useState, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import MarkdownEditor from "./Components/MarkdownEditor";
import TemplateWizard from "./Components/TemplateWizard";
import "./App.css";
import { v4 as uuidv4 } from 'uuid';
import html2pdf from 'html2pdf.js';
import { cvTemplates } from './data/cvTemplates';
import ErrorBoundary from './Components/ErrorBoundary';
import { LuPlus, LuLogOut, LuUser, LuChevronRight, LuCalendar, LuFileText, LuSmartphone, LuShare2, LuDownload, LuSave, LuTrash2, LuMenu, LuX } from "react-icons/lu";

import { useAuth } from './context/AuthContext';
import Login from './Components/Login';

function App() {
  const { user, getUserId } = useAuth();
  const [notes, setNotes] = useState([]);

  const [currentNote, setCurrentNote] = useState({ title: "", desc: "", script: "", id: null, parentId: "" });
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("Guided");
  const [cvFormat, setCvFormat] = useState("European");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      // Direct Creation Flow (Using Selections)
      const { occupation, layout, education } = selections;
      const format = layout || "America";
      
      // Try to find template, fallback to a generated header so it's not empty
      let templateContent = cvTemplates[occupation];
      if (!templateContent) {
        // Generate a baseline if no template exists
        templateContent = `# [Your Name] | ${occupation || 'Professional'}\n[Email] | [Phone]\n\n## Education\n- ${education || '[Degree]'}\n\n## Experience\n- [Job Title] | [Company Name]`;
      }
      
      const newTitle = occupation ? `${occupation} CV` : "New CV";

      setCurrentNote({
        title: newTitle,
        desc: templateContent,
        script: "",
        id: null,
        parentId
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
        parentId: ""
      });
      setCvFormat("America");
      setIsEditing(false);
      setIsWizardOpen(true);
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
              setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
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
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) return <Login />;

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <ErrorBoundary>
        <Sidebar
          notes={notes}
          onCreateNote={() => { handleCreateNote(); setIsSidebarOpen(false); }}
          onSelectNote={(note) => { setCurrentNote({ ...note, title: note.title || "", desc: note.desc || "", script: note.script || "" }); setIsEditing(true); setIsSidebarOpen(false); }}
          onDeleteNote={handleDeleteNote}
          activeNoteId={currentNote.id}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={toggleSidebar}
        />
      </ErrorBoundary>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="icon-btn-top mobile-only" onClick={toggleSidebar} title="Open Sidebar">
              <LuMenu />
            </button>
            <input
              type="text"
              className="title-input-flat"
              placeholder="Resume Title..."
              value={currentNote.title || ""}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
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
            {activeTab === "Preview" && (
              <div className="preview-controls">
                <button className="icon-btn-top" onClick={handleDownloadPDF} title="Export PDF">
                  Export PDF
                </button>
              </div>
            )}
            <button className="save-btn-primary" onClick={handleSaveNote}>
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </header>

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
            />
          </ErrorBoundary>
        </div>
      </main>
      <TemplateWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={(selections) => handleCreateNote("", selections)}
      />
    </div>
  );
}

export default App;

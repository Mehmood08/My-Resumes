import React, { useState, useEffect } from "react";
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

function App() {
  const { user, getUserId } = useAuth();
  const [notes, setNotes] = useState([]);

  const [currentNote, setCurrentNote] = useState({ title: "", desc: "", script: "", id: null, parentId: "" });
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("Guided");
  const [cvFormat, setCvFormat] = useState("European");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("disconnected");

  useEffect(() => {
    // If no user, reset the local state so previous records don't linger
    if (!user) {
      setNotes([]);
      setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
      setIsEditing(false);
      return;
    }

    // Check backend connection
    fetch(`${import.meta.env.VITE_API_URL}/api/test`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setBackendStatus("connected");
      })
      .catch((err) => {
        console.error("Backend offline", err);
        setBackendStatus("disconnected");
      });

    // Fetch resumes only for this user
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
          console.error("API returned non-array:", data);
          setNotes([]);
        }
      })
      .catch(err => console.error("Failed to fetch resumes", err));
  }, [user]);

  const handleCreateNote = (parentId = "", selections = null) => {
    let templateKey = "Blank Note";
    let format = "America"; // Default
    let occupationVal = "";

    if (selections) {
      occupationVal = selections.occupation;
      // Map occupation selection to template if possible
      const occ = selections.occupation;
      if (occ.includes("Software") || occ.includes("IT")) templateKey = "Software Engineer";
      else if (occ.includes("Management")) templateKey = "Project Manager";
      else if (occ.includes("Healthcare")) templateKey = "Blank Note"; // Add more if needed
      else templateKey = "Blank Note";

      // Map layout
      if (selections.layout === "America" || selections.layout === "American") format = "America";
      else if (selections.layout === "European") format = "European";
      else if (selections.layout === "Gulf") format = "Gulf";
      else format = selections.layout; // Fallback to direct ID if it exists in data
    }

    let templateContent = cvTemplates[templateKey] || "";

    // If we have an occupation but used a blank template or the template doesn't have it,
    // ensure the header is initialized with the occupation
    if (occupationVal && (!templateContent || !templateContent.includes("|"))) {
      if (!templateContent) {
        templateContent = `# [Name] | ${occupationVal}\n[Email] | [Phone]\n\n## SUMMARY\n\n`;
      } else {
        // Replace the first line with one that includes the occupation if it's just # [Name]
        templateContent = templateContent.replace(/^# (.*?)(\n)/, `# $1 | ${occupationVal}$2`);
      }
    }

    const newTitle = templateKey !== "Blank Note" ? `${templateKey} CV` : "New CV";

    setCurrentNote({
      title: newTitle,
      desc: templateContent,
      script: "",
      id: null,
      parentId
    });
    setCvFormat(format);
    setIsEditing(false);
    setActiveTab("Guided");
  };

  const handleSaveNote = () => {
    if (!currentNote.title.trim()) {
      alert("Please provide a title for your resume.");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    const noteToSave = {
      ...currentNote,
      date: new Date().toLocaleDateString(),
      userId: userId // Attach owner ID
    };

    if (currentNote.id) {
      // Update existing
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
      // Create new
      const newNote = { ...noteToSave, id: uuidv4() };
      console.log("Saving NEW note:", newNote); // DEBUG
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
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }
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
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <ErrorBoundary>
        <Sidebar
          notes={notes}
          onCreateNote={handleCreateNote}
          onSelectNote={(note) => { setCurrentNote({ ...note, title: note.title || "", desc: note.desc || "", script: note.script || "" }); setIsEditing(true); }}
          onDeleteNote={handleDeleteNote}
          activeNoteId={currentNote.id}
        />
      </ErrorBoundary>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
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
            <span className={`editor-status ${backendStatus === "connected" ? "status-saved" : "status-unsaved"}`} title="Backend Connection">
              {backendStatus === "connected" ? "ONLINE" : "OFFLINE"}
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

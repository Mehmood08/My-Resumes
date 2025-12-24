import React, { useState, useEffect } from "react";
import Sidebar from "./Components/sidebar";
import MarkdownEditor from "./Components/markdownEditor";
import TemplateWizard from "./Components/TemplateWizard";
import "./App.css";
import { v4 as uuidv4 } from 'uuid';
import html2pdf from 'html2pdf.js';
import { cvTemplates } from './data/cvTemplates';

function App() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [currentNote, setCurrentNote] = useState({ title: "", desc: "", script: "", id: null, parentId: "" });
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("Guided");
  const [cvFormat, setCvFormat] = useState("European");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = (parentId = "", selections = null) => {
    let templateKey = "Blank Note";
    let format = "America"; // Default

    if (selections) {
      // Map occupation selection to template if possible
      const occ = selections.occupation;
      if (occ.includes("Software") || occ.includes("IT")) templateKey = "Software Engineer";
      else if (occ.includes("Management")) templateKey = "Project Manager";
      else if (occ.includes("Healthcare")) templateKey = "Blank Note"; // Add more if needed
      else templateKey = "Blank Note";

      // Map layout
      if (selections.layout === "American") format = "America";
      else if (selections.layout === "European") format = "European";
      else if (selections.layout === "Gulf") format = "Gulf";
    }

    const templateContent = cvTemplates[templateKey] || "";
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

    if (currentNote.id) {
      setNotes(notes.map(n => (n.id === currentNote.id ? { ...currentNote, date: new Date().toLocaleDateString() } : n)));
    } else {
      const newNote = { ...currentNote, id: uuidv4(), date: new Date().toLocaleDateString() };
      setNotes([newNote, ...notes]);
      setCurrentNote(newNote);
    }
    setIsEditing(true);
  };

  const handleDeleteNote = (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      const deleteRecursive = (noteId, allNotes) => {
        let toDelete = [noteId];
        const children = allNotes.filter(n => n.parentId === noteId);
        children.forEach(child => {
          toDelete = [...toDelete, ...deleteRecursive(child.id, allNotes)];
        });
        return toDelete;
      };

      const idsToDelete = deleteRecursive(id, notes);
      setNotes(notes.filter(n => !idsToDelete.includes(n.id)));
      if (idsToDelete.includes(currentNote.id)) {
        setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
        setIsEditing(false);
      }
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

  return (
    <div className="app-layout">
      <Sidebar
        notes={notes}
        onSelectNote={(note) => { setCurrentNote(note); setIsEditing(true); }}
        onDeleteNote={handleDeleteNote}
        onStartWizard={() => setIsWizardOpen(true)}
        activeNoteId={currentNote.id}
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <input
              type="text"
              className="title-input-flat"
              placeholder="Resume Title..."
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            />
            <div className="divider-vertical"></div>
            <span className={`editor-status ${isEditing ? "status-saved" : "status-unsaved"}`}>
              {isEditing ? "SAVED" : "UNSAVED"}
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
          />
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

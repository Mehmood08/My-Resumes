import './App.css';
import Sidebar from './Components/sidebar';
import MarkdownEditor from './Components/markdownEditor';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // Load notes from localStorage on app start
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [currentNote, setCurrentNote] = useState({ title: "", desc: "", script: "", id: null, parentId: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Create new note
  const handleCreateNote = (parentId = "") => {
    setCurrentNote({ title: "", desc: "", script: "", id: null, parentId });
    setIsEditing(false);
  };

  // Save or update note
  const handleSubmit = (e) => {
    // e might be present if clicked, but we don't depend on form submit anymore
    if (e && e.preventDefault) e.preventDefault();

    if (!currentNote.title.trim()) return;

    if (isEditing) {
      const updatedNotes = notes.map(n =>
        n.id === currentNote.id ? { ...currentNote } : n
      );
      setNotes(updatedNotes);
    } else {
      const newNote = { ...currentNote, id: uuidv4(), date: new Date().toLocaleString() };
      setNotes([...notes, newNote]);
    }

    setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
    setIsEditing(false);
  };

  // Delete a note
  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);

    if (currentNote.id === id) {
      setCurrentNote({ title: "", desc: "", script: "", id: null, parentId: "" });
      setIsEditing(false);
    }
  };

  // Select a note from sidebar
  const handleSelectNote = (note) => {
    setCurrentNote({ ...note });
    setIsEditing(true);
  };

  const getEditorHeaderText = () => {
    if (isEditing) {
      return `Editing: ${currentNote.title || "Untitled"}`;
    }

    if (currentNote.parentId) {
      const parent = notes.find(n => n.id === currentNote.parentId);
      return parent
        ? `Create Child of "${parent.title}"`
        : "Create Child Note";
    }

    return "Create New Note";
  };

  return (
    <div className="app-layout">
      <Sidebar
        notes={notes}
        onSelectNote={handleSelectNote}
        onDeleteNote={handleDeleteNote}
        onCreateNote={handleCreateNote}
        activeNoteId={currentNote.id}
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="editor-status">{getEditorHeaderText()}</span>
            <div className="divider-vertical"></div>
            <input
              className="title-input-flat"
              placeholder="Note Title"
              value={currentNote.title}
              onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="top-bar-right">
            <button className="save-btn-primary" onClick={handleSubmit}>
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </header>

        <div className="editor-workspace">
          <MarkdownEditor
            markdownValue={currentNote.desc}
            onMarkdownChange={(val) => setCurrentNote(prev => ({ ...prev, desc: val }))}
            scriptValue={currentNote.script}
            onScriptChange={(val) => setCurrentNote(prev => ({ ...prev, script: val }))}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

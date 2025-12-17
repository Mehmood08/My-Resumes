import './App.css';
import Sidebar from './Components/sidebar';
import MarkdownEditor from './Components/MarkdownEditor';
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
    e.preventDefault();
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

      <div className="note-editor">
       <div className="editor-header">
  {getEditorHeaderText()}
</div>


        <form className="note-form" onSubmit={handleSubmit}>
          <input
            className="title-input"
            placeholder="Title"
            value={currentNote.title}
            onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
          />

          <MarkdownEditor
            markdownValue={currentNote.desc}
            onMarkdownChange={(val) => setCurrentNote(prev => ({ ...prev, desc: val }))}
            scriptValue={currentNote.script}
            onScriptChange={(val) => setCurrentNote(prev => ({ ...prev, script: val }))}
          />

          <button className="save-btn" type="submit">
            {isEditing ? "Update Note" : "Save Note"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;


import './App.css'
import Navbar from './Components/Navbar'
import Card from './Components/card'
import { useEffect, useState } from 'react'


function App() {
  
  const [notes, setNotes] = useState([])
  const [currentNote, setcurrentNote] = useState({ title: "", desc: "" })

useEffect(()=>{
    console.log("I am use effect")
    let localNotes = localStorage.getItem("notes")
    if(localNotes){
      setNotes(JSON.parse(localNotes))
    }
}, [] )

const handleSubmit = (e) => {
  e.preventDefault();
  const newNote = {
    id: Date.now(),     
    title: currentNote.title,
    desc: currentNote.desc
  };

    const updatedNotes = [...notes, newNote];
  setNotes(updatedNotes);
  localStorage.setItem("notes", JSON.stringify(updatedNotes));
  setcurrentNote({ title: "", desc: "" });
};

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(item => item.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };


  const handleChange = (e) => {
    setcurrentNote({ ...currentNote, [e.target.name]: e.target.value })
  
  }
  return (
    <>
      <Navbar />
      <main>
        <h1>  Create your note:</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title</label>
            <input value={currentNote.title} onChange={handleChange} type="text" name="title" id="title" />
          </div>
          <div>
            <label htmlFor="desc">Description</label>
            <textarea name="desc" id="desc" onChange={handleChange} value={currentNote.desc} ></textarea>
          </div>
          <button className='btn'>Submit</button>
        </form>
      </main>
      <section>
        <h2>Your notes</h2>
        <div className='container'>
          {notes && notes.map(note => {
            return <Card key={note.id}    id={note.id} deleteNote={deleteNote}    title={note.title} desc={note.desc} />
          })}
          {notes.length == 0 && <div><h3>Add a notes to continue:</h3> </div>}
        </div>

      </section>

    </>
  )
}

export default App

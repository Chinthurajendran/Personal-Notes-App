import React, { useEffect, useState } from "react"
import { Pencil, Trash2, X } from "lucide-react"
import axiosInstance from "../utils/axiosInstance"
import { useSelector } from "react-redux"
import Header from "./Header"

const NotesPage = () => {
  const [selectedNote, setSelectedNote] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [notes, setNotes] = useState([])
  const userId = useSelector((state) => state.authentication_user.userid)

  const fetchNote = async () => {
    try {
      const response = await axiosInstance.get(`/FetchNote/${userId}/`)
      if (response.status === 200) {
        setNotes(response.data.Notes)
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to fetch policies. Please try again later."
      )
    }
  }

  useEffect(() => {
    fetchNote()
  }, [])

  const bgColors = [
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-orange-100",
    "bg-emerald-100",
    "bg-indigo-100",
  ]

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/DeleteNote/${id}/`)
      if (response.status === 200) {
        setNotes(notes.filter((note) => note.id !== id))
        setSelectedNote(null)
        setEditingNote(null)
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to fetch policies. Please try again later."
      )
    }
  }

  const handleEdit = (note) => {
    
    setEditingNote(note)
    setEditedTitle(note.title)
    setEditedContent(note.description)
  }

const handleSave = async () => {
  try {
    const response = await axiosInstance.put(`/UpdateNote/${editingNote.id}/`, {
      title: editedTitle,
      description: editedContent, // Use 'description' if your backend expects it
    })

    if (response.status === 200) {
      // Update local state after successful backend update
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editingNote.id
            ? { ...note, title: editedTitle, description: editedContent }
            : note
        )
      )
      setEditingNote(null)
      setSelectedNote(null)
    }
  } catch (error) {
    console.error("Failed to update note:", error)
    toast.error("Failed to update the note. Please try again.")
  }
}


  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      <h2 className="text-4xl font-bold text-gray-800 mb-10 tracking-tight text-center">
        🗒️ Your Scribbles
      </h2>
      <Header onNoteAdded={fetchNote} />
      {notes.length === 0 ? (
        <p className="text-gray-500 text-base text-center">
          No notes available. Start by adding one!
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`${
                bgColors[index % bgColors.length]
              } border border-gray-200 rounded-xl shadow-md p-4 hover:shadow-lg transition cursor-pointer`}
              style={{ minHeight: "180px" }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {note.title}
              </h3>
              <p className="text-gray-700 text-sm line-clamp-2">
                {note.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* View Note Modal */}
      {selectedNote && !editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {selectedNote.title}
            </h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap mb-6">
              {selectedNote.description}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEdit(selectedNote)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 transition"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedNote.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-red-600 border border-red-200 hover:bg-red-50 transition"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <button
              onClick={() => {
                setEditingNote(null)
                setSelectedNote(null)
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Note</h3>

            <div className="space-y-4">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Title"
              />
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Note content"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingNote(null)
                  setSelectedNote(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesPage

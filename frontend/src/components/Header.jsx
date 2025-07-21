import React, { useState } from "react"
import { PencilLine, LogOut, StickyNote, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { logout } from "../store/slices/UserToken"
import axiosInstance from "../utils/axiosInstance"
import { useSelector } from "react-redux"

const Header = ({ onNoteAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleAddNoteClick = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const userId = useSelector((state) => state.authentication_user.userid)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddNote = async (e) => {
    e.preventDefault()

    if (formData.title.trim() && formData.description.trim()) {
      try {
        const res = await axiosInstance.post(`/NoteCreate/${userId}/`, formData)
        if (res.status === 201) {
          toast.success("Note added successfully!")
          setFormData({ title: "", description: "" })
          setIsModalOpen(false)
          onNoteAdded()
        }
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.detail || "Something went wrong.")
      }
    } else {
      toast.error("Please enter title and description.")
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate("/LoginPage")
    toast.success("Logout successful. See you next time!")
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <StickyNote size={26} className="text-gray-700" />
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Scribbly
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddNoteClick}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-4 py-2 rounded-md text-sm transition"
            >
              <PencilLine size={16} />
              Add Note
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-md text-sm transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Heading */}
            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
              New Note
            </h2>

            <form onSubmit={handleAddNote} className="space-y-4">
              {/* Title Input */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter note title"
                value={formData.title}
                onChange={handleChange}
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
              />

              {/* Description Textarea */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Write your note here..."
                value={formData.description}
                name="description"
                onChange={handleChange}
                rows={5}
                className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
              ></textarea>

              {/* Add Note Button */}
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-lg transition"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Header

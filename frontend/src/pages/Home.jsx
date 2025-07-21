import Header from "../components/Header"
import Footer from "../components/Footer"
import NotesPage from "../components/NotesPage"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()
  const authState = useSelector(
    (state) => state.authentication_user.isAuthenticated
  )
  useEffect(() => {
    if (!authState) {
      navigate("/LoginPage")
    }
  })
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* <Header /> */}

      <main className="flex-grow pt-24 px-40 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <NotesPage />
      </main>

      <Footer />
    </div>
  )
}

export default Home

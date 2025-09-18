import { Routes, Route } from 'react-router-dom'
//import Chatbot from './components/Chatbot'

// CVision System Pages
import CVisionHome from './pages/CVisionHome'
import CVisionDashboard from './pages/CVisionDashboard'
import MockInterview from './pages/MockInterview'
import ImproveResumeStep1 from './pages/ImproveResumeStep1'
import ImproveResumeStep2 from './pages/ImproveResumeStep2'
import ImproveResumeStep3 from './pages/ImproveResumeStep3'
import ResumeAnalysisStep1 from './pages/ResumeAnalysisStep1'
import ResumeAnalysisStep2 from './pages/ResumeAnalysisStep2'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import VerifyAccount from './pages/VerifyAccount'
import EvaluationReport from './pages/EvaluationReport'
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <main>
        <Routes>
          {/* CVision System Routes */}
          <Route path="/" element={<CVisionHome />} />
          <Route 
            path="/mock-interview" 
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            } 
          />
          <Route path="/improve-resume/step1" element={<ImproveResumeStep1 />} />
          <Route path="/improve-resume/step2" element={<ImproveResumeStep2 />} />
          <Route path="/improve-resume/step3" element={<ImproveResumeStep3 />} />
          <Route path="/resume-analysis/step1" element={<ResumeAnalysisStep1 />} />
          <Route path="/resume-analysis/step2" element={<ResumeAnalysisStep2 />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/evaluation-report" element={<EvaluationReport />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CVisionDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {/* <Chatbot /> */}
    </div>
  )
}

export default App

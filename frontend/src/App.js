import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import SubmitExam from './pages/studentsubmit'; // Import SubmitExam component
import StudentGradesPage from './pages/StudentGradesPage';
import UploadExam from './pages/uploadExam';
import Logout from './pages/Logout';
import TeacherDashboard from './pages/TeacherDashboard';
import EvaluateSubmissions from './pages/Evaluatesubmissions';
import ViewGrades from './pages/viewgrades';
import ViewResults from './pages/ViewResults';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/teacher/dashboard' element={<TeacherDashboard/>} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/submit-exam" element={<SubmitExam />} /> {/* Route for SubmitExam */}
        <Route path="/student/grades" element={<StudentGradesPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path='/upload-exam'element={<UploadExam/>}/>
        <Route path='/evaluate-submissions'element={<EvaluateSubmissions/>}/>
        <Route path="/" element={<Login />} /> {/* Default route */}
        <Route path = '/view-grades' element={<ViewGrades/>}/>
        <Route path = '/view-results/:examId' element={<ViewResults/>}/>
      </Routes>
    </Router>
  );
}

export default App;

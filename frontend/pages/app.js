// src/App.js

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentGradesPage from './pages/StudentGradesPage';
import TeacherGradesPage from './pages/TeacherGradesPage';
import Logout from './pages/Logout';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/teacher/dashboard" component={TeacherDashboard} />
        <Route path="/student/grades" component={StudentGradesPage} />
        <Route path="/teacher/grades" component={TeacherGradesPage} />
        <Route path="/logout" component={Logout} />
        <Route path="/" exact component={Login} /> {/* Default route */}
      </Switch>
    </Router>
  );
}

export default App;

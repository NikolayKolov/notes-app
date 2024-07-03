import Main from './layout/Main';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Notes from './pages/Notes';
import Note from './pages/Note';
import NoteCreate from './pages/NoteCreate';
import NoteEdit from './pages/NoteEdit';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerifyIP from './pages/VerifyIP';
import './App.css';

function App() {

    return (
        <Router basename="/">
            <Routes>
                <Route path="/" element={<Main />}>
                    <Route index element={<Notes />} />
                    <Route path="register" element={<Register />} />
                    <Route path="create" element={<NoteCreate />} />
                    <Route path="edit/:noteId" element={<NoteEdit />} />
                    <Route path="note/:noteId" element={<Note />} />
                    <Route path="verify/:UUID" element={<VerifyEmail />} />
                    <Route path="verifyIP/:UUID" element={<VerifyIP />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App

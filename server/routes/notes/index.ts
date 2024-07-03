import express from 'express';
import { getAllNotesByUser, getNoteById, createNote, updateNote, updateNoteItem, deleteNote } from '../../controllers/notesController';

const notesRouter = express.Router();

notesRouter
    // get note by note id
    .post('/get/:noteId', getNoteById)
    // get list of all notes by user id
    .get('/list/:userId', getAllNotesByUser)
    // create new note
    .post('/create/', createNote)
    // edit existing note
    .post('/edit/:noteId', updateNote)
    // edit existing note checklist item
    .post('/editnoteitem/:noteId&:checklistId', updateNoteItem)
    // delete existing note
    .post('/delete/:noteId', deleteNote);

export default notesRouter;
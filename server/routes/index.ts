import express from 'express';
import authUserRequest from '../middlewares/authMiddelware';
import usersRouter from './users';
import notesRouter from './notes';

const mainRouter = express.Router();

// load routes
mainRouter.use('/note/', authUserRequest, notesRouter);
mainRouter.use('/user/', usersRouter);
mainRouter.use('/', (_req, res) => {
    res.send('Server running');
});

export default mainRouter;
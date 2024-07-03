import express from 'express';
import { registerUser, loginUser, verifyUser, generateNewVerify, verifyUserIP } from '../../controllers/usersController';

const usersRouter = express.Router();

usersRouter
    .post('/register', registerUser)
    .post('/login', loginUser)
    .get('/verify/:emailUUID', verifyUser)
    .post('/reverify', generateNewVerify)
    .get('/verifyIP/:ipUUID', verifyUserIP);

export default usersRouter;
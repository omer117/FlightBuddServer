import express from 'express'
import { AuthController } from '../controllers/AuthController';
import { expressjwt } from 'express-jwt';

const AuthRouter = express.Router();
AuthRouter.post('/login', AuthController.logIn)
AuthRouter.post('/register', AuthController.Register)

export default AuthRouter;
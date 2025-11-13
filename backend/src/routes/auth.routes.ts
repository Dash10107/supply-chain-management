import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validator.middleware';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

const router = Router();
const authController = new AuthController();

router.post('/login', validateDto(LoginDto), authController.login);
router.post('/register', validateDto(RegisterDto), authController.register);
router.get('/profile', authenticate, authController.getProfile);

export default router;


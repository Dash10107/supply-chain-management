import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../schemas/User';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AppError } from '../middlewares/error-handler';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });

    if (!user || user.status !== 'active') {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const secret = (process.env.JWT_SECRET || 'secret') as string;
    const options: SignOptions = {};
    if (process.env.JWT_EXPIRES_IN) {
      options.expiresIn = process.env.JWT_EXPIRES_IN as any;
    } else {
      options.expiresIn = '24h' as any;
    }
    const token = jwt.sign({ userId: user.id, role: user.role.name }, secret, options);

    return { user, token };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }
}


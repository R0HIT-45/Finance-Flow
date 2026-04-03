import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

const userRepo = new UserRepository();
const JWT_SECRET = 'supersecret'; // later move to env

export class AuthService {

  async register(name: string, email: string, password: string) {
    const existingUser = await userRepo.findByEmail(email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET
    );

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET
    );

    return { user, token };
  }
}
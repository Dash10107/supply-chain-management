import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Role } from '../schemas/Role';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    void req;
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find({
      order: { name: 'ASC' },
    });
    res.json({ status: 'success', data: roles });
  } catch (error) {
    next(error);
  }
});

export default router;


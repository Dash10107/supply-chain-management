import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Supplier } from '../schemas/Supplier';
import { AppError } from '../middlewares/error-handler';

export class SupplierController {
  private supplierRepository: Repository<Supplier>;

  constructor() {
    this.supplierRepository = AppDataSource.getRepository(Supplier);
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suppliers = await this.supplierRepository.find({
        order: { createdAt: 'DESC' },
      });
      res.json({ status: 'success', data: suppliers });
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const supplier = await this.supplierRepository.findOne({
        where: { id },
        relations: ['purchaseOrders'],
      });
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }
      res.json({ status: 'success', data: supplier });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = this.supplierRepository.create(req.body);
      const savedSupplier = await this.supplierRepository.save(supplier);
      res.status(201).json({ status: 'success', data: savedSupplier });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const supplier = await this.supplierRepository.findOne({ where: { id } });
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }
      Object.assign(supplier, req.body);
      const updatedSupplier = await this.supplierRepository.save(supplier);
      res.json({ status: 'success', data: updatedSupplier });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const supplier = await this.supplierRepository.findOne({ where: { id } });
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }
      await this.supplierRepository.remove(supplier);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}


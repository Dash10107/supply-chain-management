import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Warehouse } from '../schemas/Warehouse';
import { AppError } from '../middlewares/error-handler';

export class WarehouseController {
  private warehouseRepository: Repository<Warehouse>;

  constructor() {
    this.warehouseRepository = AppDataSource.getRepository(Warehouse);
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      void req;
      const warehouses = await this.warehouseRepository.find({
        order: { createdAt: 'DESC' },
      });
      res.json({ status: 'success', data: warehouses });
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseRepository.findOne({
        where: { id },
        relations: ['inventories', 'inventories.product'],
      });
      if (!warehouse) {
        throw new AppError('Warehouse not found', 404);
      }
      res.json({ status: 'success', data: warehouse });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const warehouse = this.warehouseRepository.create(req.body);
      const savedWarehouse = await this.warehouseRepository.save(warehouse);
      res.status(201).json({ status: 'success', data: savedWarehouse });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseRepository.findOne({ where: { id } });
      if (!warehouse) {
        throw new AppError('Warehouse not found', 404);
      }
      Object.assign(warehouse, req.body);
      const updatedWarehouse = await this.warehouseRepository.save(warehouse);
      res.json({ status: 'success', data: updatedWarehouse });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseRepository.findOne({ where: { id } });
      if (!warehouse) {
        throw new AppError('Warehouse not found', 404);
      }
      await this.warehouseRepository.remove(warehouse);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}


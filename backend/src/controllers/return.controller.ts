import { Request, Response, NextFunction } from 'express';
import { ReturnService } from '../services/return.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ReturnController {
  private returnService: ReturnService;

  constructor() {
    this.returnService = new ReturnService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { salesOrderId, items, reason, description } = req.body;
      const returnOrder = await this.returnService.createReturn(
        salesOrderId,
        items,
        reason,
        description
      );
      res.status(201).json({
        status: 'success',
        data: returnOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as any;

      const result = await this.returnService.findAll(page, limit, status);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const returnOrder = await this.returnService.findOne(id);
      res.json({
        status: 'success',
        data: returnOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const returnOrder = await this.returnService.approveReturn(id);
      res.json({
        status: 'success',
        data: returnOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  process = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { warehouseId } = req.body;
      const returnOrder = await this.returnService.processReturn(
        id,
        warehouseId,
        req.user?.id
      );
      res.json({
        status: 'success',
        data: returnOrder,
      });
    } catch (error) {
      next(error);
    }
  };
}


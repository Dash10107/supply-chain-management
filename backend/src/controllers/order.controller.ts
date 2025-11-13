import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { CreateSalesOrderDto, CreatePurchaseOrderDto } from '../dto/order.dto';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SalesOrderStatus, PurchaseOrderStatus } from '../schemas';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createSalesOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createOrderDto = req.body as CreateSalesOrderDto;
      const order = await this.orderService.createSalesOrder(
        createOrderDto,
        req.user?.id
      );
      res.status(201).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  findAllSalesOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as SalesOrderStatus | undefined;

      const result = await this.orderService.findAllSalesOrders(page, limit, status);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findSalesOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.findSalesOrder(id);
      res.json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelSalesOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.cancelSalesOrder(id);
      res.json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  createPurchaseOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createOrderDto = req.body as CreatePurchaseOrderDto;
      const order = await this.orderService.createPurchaseOrder(
        createOrderDto,
        req.user?.id
      );
      res.status(201).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  findAllPurchaseOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as PurchaseOrderStatus | undefined;

      const result = await this.orderService.findAllPurchaseOrders(page, limit, status);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findPurchaseOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.findPurchaseOrder(id);
      res.json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };
}


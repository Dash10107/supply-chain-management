import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      void req;
      const stats = await this.analyticsService.getDashboardStats();
      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getSalesByPeriod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ message: 'Invalid date range' });
        return;
      }

      const sales = await this.analyticsService.getSalesByPeriod(startDate, endDate);
      res.json({
        status: 'success',
        data: sales,
      });
    } catch (error) {
      next(error);
    }
  };

  getTopProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await this.analyticsService.getTopProducts(limit);
      res.json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStockProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      void req;
      const products = await this.analyticsService.getLowStockProducts();
      res.json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };
}


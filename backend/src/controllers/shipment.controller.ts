import { Request, Response, NextFunction } from 'express';
import { ShipmentService } from '../services/shipment.service';
import { ShipmentStatus } from '../schemas/Shipment';

export class ShipmentController {
  private shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { salesOrderId } = req.body;
      const shipment = await this.shipmentService.createShipment(salesOrderId);
      res.status(201).json({
        status: 'success',
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as ShipmentStatus | undefined;

      const result = await this.shipmentService.findAll(page, limit, status);
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
      const shipment = await this.shipmentService.findOne(id);
      res.json({
        status: 'success',
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, carrier, carrierTrackingNumber } = req.body;
      const shipment = await this.shipmentService.updateShipmentStatus(
        id,
        status,
        carrier,
        carrierTrackingNumber
      );
      res.json({
        status: 'success',
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  };
}


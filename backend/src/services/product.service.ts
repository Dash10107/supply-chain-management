import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Product } from '../schemas/Product';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { AppError } from '../middlewares/error-handler';

export class ProductService {
  private productRepository: Repository<Product>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Product> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (category) {
      where.category = category;
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { products, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', 400);
    }

    const product = this.productRepository.create({
      ...createProductDto,
      reorderThreshold: createProductDto.reorderThreshold || 10,
      reorderQuantity: createProductDto.reorderQuantity || 50,
    });

    return await this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}


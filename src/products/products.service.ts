import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    const cachedProducts = await this.cacheManager.get('products');

    if (cachedProducts) {
      console.log('Returning cached products');
      return cachedProducts as Product[];
    }
    console.log('Fetching products from database');
    const products = await this.productsRepository.find();
    await this.cacheManager.set(
      'products',
      products,
      60 * 60 * 1000, // 1 hour in milliseconds
    );

    return products;
  }

  async findOne(id: number): Promise<Product> {
    const cachedProduct = await this.cacheManager.get(`products`);

    if (cachedProduct) {
      console.log('Returning cached product');
      const foundProduct = (cachedProduct as Product[]).find(
        (product: Product) => product.id === id,
      );
      if (foundProduct) {
        return foundProduct;
      }
    }

    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid product ID - must be a number');
    }
    if (updateProductDto.price && isNaN(updateProductDto.price)) {
      throw new BadRequestException('Invalid price - must be a number');
    }
    if (updateProductDto.name && typeof updateProductDto.name !== 'string') {
      throw new BadRequestException('Invalid name - must be a string');
    }
    if (
      updateProductDto.description &&
      typeof updateProductDto.description !== 'string'
    ) {
      throw new BadRequestException('Invalid description - must be a string');
    }

    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateProductDto);
    await this.productsRepository.save(product);

    await this.cacheManager.del('products');

    return product;
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productsRepository.remove(product);
    await this.cacheManager.del('products');
    return { message: 'Product deleted successfully' };
  }
}

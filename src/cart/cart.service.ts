import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { User } from '../user/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addToCart(createCartItemDto: CreateCartItemDto, user: User) {
    const product = await this.productRepository.findOne({
      where: { id: createCartItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingCartItem = await this.cartItemRepository.findOne({
      where: { user: { id: user.id }, product: { id: product.id } },
    });

    if (existingCartItem) {
      existingCartItem.quantity += createCartItemDto.quantity;
      return this.cartItemRepository.save(existingCartItem);
    }

    const cartItem = this.cartItemRepository.create({
      user,
      product,
      quantity: createCartItemDto.quantity,
    });

    return this.cartItemRepository.save(cartItem);
  }

  async getUserCart(userId: number) {
    console.log('Very Bad 🚀 ~ CartService ~ getUserCart ~ userId:', userId);
    return this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async updateCartItem(
    id: number,
    updateCartItemDto: UpdateCartItemDto,
    userId: number,
  ) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeFromCart(id: number, userId: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    return { message: 'Cart item removed successfully' };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { User } from '../user/entities/user.entity';
import { In } from 'typeorm';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: User) {
    const cartItems = await this.cartItemRepository.find({
      where: {
        id: In(createOrderDto.cartIds),
        user: { id: user.id },
      },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('No cart items found');
    }

    if (cartItems.length !== createOrderDto.cartIds.length) {
      throw new BadRequestException('Some cart items were not found');
    }

    const order = this.orderRepository.create({
      user,
      status: 'pending',
      totalAmount: 0,
    });
    await this.orderRepository.save(order);

    let totalAmount = 0;
    const orderItems = cartItems.map((cartItem) => {
      const orderItem = this.orderItemRepository.create({
        order,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
      });
      totalAmount += cartItem.product.price * cartItem.quantity;
      return orderItem;
    });

    await this.orderItemRepository.save(orderItems);

    order.totalAmount = totalAmount;
    await this.orderRepository.save(order);

    await this.cartItemRepository.remove(cartItems);

    return this.getOrderById(order.id, user);
  }
  async getAllOrders() {
    return this.orderRepository.find({
      relations: ['user', 'orderItems', 'orderItems.product'],
      order: { createdAt: 'ASC' }, // if want to get the newest order first : order: { createdAt: 'DESC' },
    });
  }
  async getUserOrders(user: User) {
    const orders = await this.orderRepository.find({
      where: { user: { id: user.id } },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });

    if (orders.length === 0) {
      throw new NotFoundException('No orders found for this user');
    }

    return orders;
  }
  async getOrderById(id: number, user: User) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.id !== user.id) {
      throw new BadRequestException('Not authorized to view this order');
    }

    return order;
  }
  async cancelOrder(id: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new BadRequestException(
        'Cannot cancel shipped or delivered orders',
      );
    }

    order.status = 'cancelled';
    await this.orderRepository.save(order);
    return {
      message: 'Order cancelled successfully',
      order,
    };
  }
}

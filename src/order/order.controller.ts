import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/checkout')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.orderService.createOrder(createOrderDto, req.user);
  }

  @Get('/get-all-orders')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('/get-user-orders')
  @ApiOperation({ summary: 'Get orders for current user' })
  @ApiResponse({ status: 200, description: 'Returns user orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserOrders(@Request() req) {
    return this.orderService.getUserOrders(req.user);
  }

  @Get('/get-order-by-id/:id')
  @ApiOperation({ summary: 'Get specific order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Returns the order' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrderById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.orderService.getOrderById(id, req.user);
  }

  /**
   * Cancel an order
   * @curl
   * curl -X PUT http://localhost:3000/orders/cancel-order/:id \
   * -H "Authorization: Bearer your-jwt-token"
   */
  @Put('/cancel-order/:id')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order successfully cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancelOrder(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.orderService.cancelOrder(id, req.user.id);
  }
}

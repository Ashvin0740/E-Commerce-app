import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/add-to-cart')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item successfully added to cart' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addToCart(@Body() createCartItemDto: CreateCartItemDto, @Request() req) {
    return this.cartService.addToCart(createCartItemDto, req.user);
  }

  @Get('/get-user-cart')
  @ApiOperation({ summary: "Get user's cart" })
  @ApiResponse({ status: 200, description: "Returns user's cart items" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserCart(@Request() req) {
    return this.cartService.getUserCart(req.user.id);
  }

  @Put('/update-cart-item/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  updateCartItem(
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Request() req,
  ) {
    return this.cartService.updateCartItem(id, updateCartItemDto, req.user.id);
  }

  @Delete('/remove-from-cart/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item successfully removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeFromCart(@Param('id') id: number, @Request() req) {
    return this.cartService.removeFromCart(id, req.user.id);
  }
}

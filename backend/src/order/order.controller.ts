import { Controller, Get, Post, Body, Patch, Param, Request, Delete, UseGuards, ConflictException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OwnRouteOrCafeteriaOperatorGuard } from '../user/guards/own-route-or-cafeteriaOperator.guard';
import { Role } from '../user/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { MealsOrderDto } from './dto/meals.order.dto';
import { OrderDto } from './dto/order.dto';
import { PatchOrderDto } from './dto/patch-order.dto';
import { OrderService } from './order.service';
import { LockedException } from '../shared/http-locked-exception';


@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @UseGuards(OwnRouteOrCafeteriaOperatorGuard)
    @Get('id/:orderId')
    @ApiResponse({ type: () => OrderDto })
    @ApiParam({ name: 'orderId' })
    async getOrder(@Request() request, @Param('orderId') orderId: string) {
        return (await this.orderService.findOrderById(orderId)).toJSON();
    }

    @UseGuards(OwnRouteOrCafeteriaOperatorGuard)
    @Get('employee/:employeeId')
    @ApiResponse({ type: () => OrderDto, isArray: true })
    @ApiParam({ name: 'employeeId' })
    async getOrdersByEmployeeId(@Request() request, @Param('employeeId') employeeId: string) {
        return await this.orderService.findOrdersByEmployeeId(employeeId);  
    }

    @Roles(Role.CafeteriaOperator)
    @Get('date/:date')
    @ApiResponse({ type: () => MealsOrderDto })
    @ApiParam({ name: 'date' })
    async getOrdersByDate(@Request() request, @Param('date') date: string) {
        return await this.orderService.findOrdersByDate(new Date(date));  
    }

    @Roles(Role.CafeteriaOperator)
    @Get('')
    @ApiResponse({ type: () => OrderDto, isArray: true })
    async getOrders() {
        return await this.orderService.findAllOrders();
    }

    @UseGuards(OwnRouteOrCafeteriaOperatorGuard)
    @Post('')
    @ApiResponse({ type: () => OrderDto })
    @ApiBody({ type: () => CreateOrderDto })
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        if (!this.validateEditOrder(createOrderDto.date)) {
            throw new LockedException({ date: createOrderDto.date, error: 'Orders for this date are no longer accepted' }, 
                'Orders for this date are no longer accepted'
            );
        } else if (await this.orderService.hasOrder(createOrderDto.employeeId, createOrderDto.date)) {
            throw new ConflictException({ employeeId: createOrderDto.employeeId, date: createOrderDto.date, error: 'Order already exists for this employee and date' },
                'Order already exists for this employee and date',
            );
        } 
        return (await this.orderService.createOrder(createOrderDto)).toJSON(); 
    }

    @UseGuards(OwnRouteOrCafeteriaOperatorGuard)
    @Patch('id/:orderId')
    @ApiBody({ type: () => PatchOrderDto })
    @ApiParam({ name: 'orderId' })
    async patchOrder(@Param('orderId') orderId: string, @Body() patchOrderDto: PatchOrderDto) {
        var order = await this.orderService.findOrderById(orderId)
        if (!this.validateEditOrder(order.date)) {
            throw new LockedException({ date: order.date, error: 'Orders for this date are no longer accepted' }, 
                'Orders for this date are no longer accepted'
            );
        }
        return (await this.orderService.updateOrder(orderId, patchOrderDto)).toJSON();
    }

    @UseGuards(OwnRouteOrCafeteriaOperatorGuard)
    @Delete('id/:orderId')
    @ApiParam({ name: 'orderId' })
    async deleteOrder(@Param('orderId') orderId: string) {
        var order = await this.orderService.findOrderById(orderId)
        if (!this.validateEditOrder(order.date)) {
            throw new LockedException({ date: order.date, error: 'Orders for this date are no longer accepted' }, 
                'Orders for this date are no longer accepted'
            );
        }
        await this.orderService.deleteOrder(orderId);
    }

    // returns "true" if the order is still editable
    validateEditOrder(date: Date) {
        var d = new Date(date);
        var difference = d.getDate() - (d.getDay() + 3);
        d.setDate(difference);
        d.setHours(18, 0, 0, 0);

        return new Date() < d;
    }
}
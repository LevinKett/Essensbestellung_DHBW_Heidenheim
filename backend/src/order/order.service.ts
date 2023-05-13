import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { MealsOrderDto } from './dto/meals.order.dto';
import { PatchOrderDto } from './dto/patch-order.dto';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderService {
    constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

    findAllOrders() { 
        return this.orderModel.find({}); 
    }

    findOrdersByEmployeeId(employeeId: string) {
        return this.orderModel.find({ employeeId: this.castToObjectId(employeeId) });
    }

    async findOrderById(orderId: string): Promise<OrderDocument | undefined> {
        const order = await this.orderModel.findOne({ _id: this.castToObjectId(orderId) });
        if (!order) {
            throw new NotFoundException({
                orderId: orderId,
                error: 'Order not found.'
            });
        }
        return order;
    }

    async findOrdersByDate(date: Date): Promise<MealsOrderDto | undefined> {
        // initializing orderSummary with zeros
        let orderSummary: MealsOrderDto = {
            breakfast1: 0,
            breakfast2: 0,
            breakfast3: 0,
            breakfast4: 0,
            menu1: 0,
            menu2: 0,
            menu2Vegetarian: 0,
            dessert: 0,
            soup: 0,
            salad: 0
        };

        // finding all orders with the given date
        let orders = await this.orderModel.find({ date: date });
        orders.forEach(order => {
            // adding each meal's quantity to the orderSummary
            Object.entries(order.meals).forEach(async ([mealType, quantity]) => {
                orderSummary[mealType] += quantity;
            });
        });

        return orderSummary;
    }

    async hasOrder(employeeId: string, date: Date) {
        const order = await this.orderModel.findOne({ employeeId: employeeId, date: date});
        return order ? true : false;
    }

    async createOrder(createOrderDto: CreateOrderDto) {
        const orderDocument = new this.orderModel(createOrderDto);
        await orderDocument.save();
        return orderDocument;
    }

    async updateOrder(orderId: string, patchOrderDto: PatchOrderDto) {
        const order = await this.findOrderById(orderId);
        Object.assign(order, patchOrderDto);
        await order.save();
        return order;
    }

    async deleteOrder(orderId: string) {
        await this.orderModel.deleteOne({ _id: this.castToObjectId(orderId) });
    }

    castToObjectId(id: string) {
        try {
            return new mongoose.Types.ObjectId(id);
        } catch {
            throw new UnprocessableEntityException({
                id,
                error: 'Given id is not a valid orderId',
            });
        }
    }
}
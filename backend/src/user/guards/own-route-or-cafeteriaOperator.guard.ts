import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Role } from '../role.enum';
import { OrderService } from '../../order/order.service';

@Injectable()
export class OwnRouteOrCafeteriaOperatorGuard implements CanActivate {
    constructor(@Inject(OrderService) private readonly orderService: OrderService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        let employeeIdFromOrderId = "not a valid employeeId";
        try {
            var order = await this.orderService.findOrderById(request.params.orderId);
            employeeIdFromOrderId = order.employeeId;
        } catch (NotFoundException) {}

        return (
            request.user.roles.includes(Role.CafeteriaOperator) ||  // for example: [POST] /meal
            request.params.userId === request.user._id ||           // for example: [GET]  /user/{myEmployeeId}
            request.params.employeeId === request.user._id ||       // for example: [GET]  /order/employeeId/{myEmployeeId}
            request.body.employeeId === request.user._id ||         // for example: [POST] /order
            employeeIdFromOrderId == request.user._id               // for example: [PTCH] /order/id/{orderIdOfMyOrder}
        );
    }
}

import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
    info(message: any, context?: string): void;
    info(message: any, ...optionalParams: [...any, string?]) {
        this.log(message, ...optionalParams);
    }
}

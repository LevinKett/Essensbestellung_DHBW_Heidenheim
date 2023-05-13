import { HttpException, } from "@nestjs/common";

export class LockedException extends HttpException {
    constructor (objectOrError?: any, descriptionOrOptions?: string) {
      super(objectOrError, 423);
    }
  }
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

export = async function globalSetup() {
    (global as any).__MONGOINSTANCE = await MongoMemoryServer.create();
    const uri = (global as any).__MONGOINSTANCE.getUri();
    process.env.MONGODB_URI = uri.slice(0, uri.lastIndexOf('/'));
    await mongoose.connect(`${process.env.MONGODB_URI}/e2e-test`);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
};
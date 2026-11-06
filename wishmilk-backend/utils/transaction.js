import mongoose from "mongoose";

// Runs `work(session)` inside a MongoDB transaction so everything it writes
// commits together or not at all. Transactions need a replica set (Atlas
// always is one). On a standalone local mongod they are unsupported, so in
// that one case the work runs once without a session and a warning is
// logged — keep the writes inside `work` conditional where you can.
export async function runInTransaction(work) {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } catch (error) {
        const msg = String((error && error.message) || "");
        if (/Transaction numbers are only allowed|replica set|does not support transactions/i.test(msg)) {
            console.warn("[transaction] not supported by this MongoDB deployment — running without one");
            return work(null);
        }
        throw error;
    } finally {
        await session.endSession();
    }
}
import cron from "node-cron";
import Subscription from "../models/subscription.js";
import Order from "../models/order.js";

// Finds every active subscription whose next delivery is due (today or
// earlier — "or earlier" covers the server being down when a run was
// supposed to happen) and creates a real Order for each one, exactly as
// if the customer had placed it manually. One subscription failing to
// generate never blocks the rest — each is wrapped individually.
export async function generateSubscriptionOrders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = await Subscription.find({
        status: "active",
        nextDeliveryDate: { $lte: today },
    });

    let generated = 0;
    let failed = 0;

    for (const sub of due) {
        try {
            const order = await Order.create({
                userId: sub.user,
                dairy: sub.dairy,
                milkType: sub.milkType,
                quantity: sub.quantity,
                totalPrice: sub.pricePerDelivery,
                deliveryAddress: sub.deliveryAddress,
                deliverySlot: sub.deliverySlot,
                scheduledDate: new Date(sub.nextDeliveryDate),
                status: "pending",
                paymentStatus: "pending",
                subscription: sub._id,
            });

            sub.lastGeneratedOrder = order._id;

            const next = new Date(sub.nextDeliveryDate);
            next.setDate(next.getDate() + 1);

            if (next > sub.cycleEndDate) {
                if (sub.autoRenew) {
                    const cycleDays = sub.plan === "weekly" ? 7 : 30;
                    const newCycleEnd = new Date(sub.cycleEndDate);
                    newCycleEnd.setDate(newCycleEnd.getDate() + cycleDays);
                    sub.cycleEndDate = newCycleEnd;
                    sub.nextDeliveryDate = next;
                } else {
                    sub.status = "completed";
                }
            } else {
                sub.nextDeliveryDate = next;
            }

            await sub.save();
            generated += 1;
        } catch (error) {
            failed += 1;
            console.error(`Subscription ${sub._id} failed to generate an order:`, error.message);
        }
    }

    return { checked: due.length, generated, failed };
}

// Runs once daily, shortly after midnight server time. This is the only
// thing that makes subscriptions actually deliver without a manual
// order — if the process restarts, node-cron re-registers this on boot.
export function startSubscriptionScheduler() {
    cron.schedule("5 0 * * *", () => {
        generateSubscriptionOrders()
            .then(({ checked, generated, failed }) => {
                console.log(`[subscriptions] checked ${checked}, generated ${generated}, failed ${failed}`);
            })
            .catch((error) => console.error("[subscriptions] scheduler run failed:", error.message));
    });
}
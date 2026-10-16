// import mongoose from "mongoose";
// import Order from "../models/order.js";
// import Delivery from "../models/delivery.js";
// import Dairy from "../models/dairy.js";
// import Payout from "../models/payout.js";
// import { PLATFORM_COMMISSION_PERCENT, RIDER_COMMISSION_PERCENT } from "../config/commission.js";

// const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// function monthBounds(date) {
//   const thisMonthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
//   const lastMonthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
//   return { thisMonthStart, lastMonthStart };
// }

// // Lifetime gross + net for a dairy owner, from their dairy's delivered
// // orders. Shared between the earnings summary and the payout-request
// // balance check so the two never disagree with each other.
// async function computeOwnerNet(ownerId) {
//   const dairy = await Dairy.findOne({ owner: ownerId });
//   if (!dairy) return { dairy: null, grossRevenue: 0, deliveredOrders: 0, netEarnings: 0 };

//   const rows = await Order.aggregate([
//     { $match: { dairy: dairy._id, status: "delivered" } },
//     { $group: { _id: null, grossRevenue: { $sum: "$totalPrice" }, deliveredOrders: { $sum: 1 } } },
//   ]);
//   const grossRevenue = rows[0]?.grossRevenue || 0;
//   return {
//     dairy,
//     grossRevenue,
//     deliveredOrders: rows[0]?.deliveredOrders || 0,
//     netEarnings: round2(grossRevenue * (1 - PLATFORM_COMMISSION_PERCENT / 100)),
//   };
// }

// // Lifetime gross-handled + net commission for a rider, from their
// // completed deliveries.
// async function computeRiderNet(riderId) {
//   const rows = await Delivery.aggregate([
//     { $match: { assignedRider: riderId, status: "delivered" } },
//     { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
//     { $unwind: "$order" },
//     { $group: { _id: null, grossHandled: { $sum: "$order.totalPrice" }, deliveries: { $sum: 1 } } },
//   ]);
//   const grossHandled = rows[0]?.grossHandled || 0;
//   return {
//     grossHandled,
//     deliveries: rows[0]?.deliveries || 0,
//     netEarnings: round2(grossHandled * (RIDER_COMMISSION_PERCENT / 100)),
//   };
// }

// // Sums this user's Payout documents by status, so "available balance"
// // can subtract money already paid out AND money already tied up in a
// // pending/processing request (so the same earnings can't be requested
// // twice while a request is still in flight).
// async function getPayoutTotals(userId) {
//   const rows = await Payout.aggregate([
//     { $match: { user: userId } },
//     { $group: { _id: "$status", total: { $sum: "$amount" } } },
//   ]);
//   const totals = { pending: 0, processing: 0, paid: 0, rejected: 0 };
//   rows.forEach((r) => {
//     totals[r._id] = r.total;
//   });
//   return totals;
// }

// async function computeAvailableBalance(userId, role) {
//   const net =
//     role === "dairyOwner" ? (await computeOwnerNet(userId)).netEarnings : (await computeRiderNet(userId)).netEarnings;
//   const payoutTotals = await getPayoutTotals(userId);
//   const balance = net - payoutTotals.paid - payoutTotals.pending - payoutTotals.processing;
//   return Math.max(0, round2(balance));
// }

// // @desc    Earnings dashboard for the logged-in dairy owner: lifetime
// //          + this-month/last-month net revenue (after the platform
// //          commission), a daily trend for the selected year, and their
// //          payout balance.
// // @route   GET /api/earnings/owner?year=2026
// // @access  Private (dairyOwner)
// export const getOwnerEarnings = async (req, res) => {
//   try {
//     const { dairy, grossRevenue, deliveredOrders, netEarnings } = await computeOwnerNet(req.user._id);

//     if (!dairy) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           hasDairy: false,
//           commissionPercent: PLATFORM_COMMISSION_PERCENT,
//           grossRevenue: 0,
//           netEarnings: 0,
//           deliveredOrders: 0,
//           thisMonthNet: 0,
//           lastMonthNet: 0,
//           dailyEarnings: [],
//           totalPaidOut: 0,
//           pendingPayout: 0,
//           availableBalance: 0,
//         },
//       });
//     }

//     const year = Number(req.query.year) || new Date().getFullYear();
//     const yearStart = new Date(Date.UTC(year, 0, 1));
//     const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
//     const now = new Date();
//     const { thisMonthStart, lastMonthStart } = monthBounds(now);
//     const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } };

//     const [dailyRows, thisMonthAgg, lastMonthAgg, payoutTotals] = await Promise.all([
//       Order.aggregate([
//         { $match: { dairy: dairy._id, status: "delivered", scheduledDate: { $gte: yearStart, $lt: yearEnd } } },
//         { $group: { _id: dayFormat, gross: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
//         { $sort: { _id: 1 } },
//       ]),
//       Order.aggregate([
//         { $match: { dairy: dairy._id, status: "delivered", scheduledDate: { $gte: thisMonthStart } } },
//         { $group: { _id: null, gross: { $sum: "$totalPrice" } } },
//       ]),
//       Order.aggregate([
//         { $match: { dairy: dairy._id, status: "delivered", scheduledDate: { $gte: lastMonthStart, $lt: thisMonthStart } } },
//         { $group: { _id: null, gross: { $sum: "$totalPrice" } } },
//       ]),
//       getPayoutTotals(req.user._id),
//     ]);

//     const dailyEarnings = dailyRows.map((r) => ({
//       date: r._id,
//       orders: r.orders,
//       gross: r.gross,
//       net: round2(r.gross * (1 - PLATFORM_COMMISSION_PERCENT / 100)),
//     }));

//     const pendingPayout = payoutTotals.pending + payoutTotals.processing;
//     const availableBalance = Math.max(0, round2(netEarnings - payoutTotals.paid - pendingPayout));

//     res.status(200).json({
//       success: true,
//       data: {
//         hasDairy: true,
//         commissionPercent: PLATFORM_COMMISSION_PERCENT,
//         grossRevenue,
//         netEarnings,
//         deliveredOrders,
//         thisMonthNet: round2((thisMonthAgg[0]?.gross || 0) * (1 - PLATFORM_COMMISSION_PERCENT / 100)),
//         lastMonthNet: round2((lastMonthAgg[0]?.gross || 0) * (1 - PLATFORM_COMMISSION_PERCENT / 100)),
//         dailyEarnings,
//         totalPaidOut: payoutTotals.paid,
//         pendingPayout,
//         availableBalance,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching earnings", error: error.message });
//   }
// };

// // @desc    Earnings dashboard for the logged-in delivery rider: lifetime
// //          + this-month/last-month commission earned, a daily trend for
// //          the selected year, and their payout balance.
// // @route   GET /api/earnings/rider?year=2026
// // @access  Private (deliveryPerson)
// export const getRiderEarnings = async (req, res) => {
//   try {
//     const riderId = new mongoose.Types.ObjectId(req.user._id);
//     const { grossHandled, deliveries, netEarnings } = await computeRiderNet(riderId);

//     const year = Number(req.query.year) || new Date().getFullYear();
//     const yearStart = new Date(Date.UTC(year, 0, 1));
//     const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
//     const now = new Date();
//     const { thisMonthStart, lastMonthStart } = monthBounds(now);
//     const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } };

//     const [dailyRows, thisMonthAgg, lastMonthAgg, payoutTotals] = await Promise.all([
//       Delivery.aggregate([
//         { $match: { assignedRider: riderId, status: "delivered", deliveredAt: { $gte: yearStart, $lt: yearEnd } } },
//         { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
//         { $unwind: "$order" },
//         { $group: { _id: dayFormat, gross: { $sum: "$order.totalPrice" }, deliveries: { $sum: 1 } } },
//         { $sort: { _id: 1 } },
//       ]),
//       Delivery.aggregate([
//         { $match: { assignedRider: riderId, status: "delivered", deliveredAt: { $gte: thisMonthStart } } },
//         { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
//         { $unwind: "$order" },
//         { $group: { _id: null, gross: { $sum: "$order.totalPrice" } } },
//       ]),
//       Delivery.aggregate([
//         { $match: { assignedRider: riderId, status: "delivered", deliveredAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
//         { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
//         { $unwind: "$order" },
//         { $group: { _id: null, gross: { $sum: "$order.totalPrice" } } },
//       ]),
//       getPayoutTotals(req.user._id),
//     ]);

//     const dailyEarnings = dailyRows.map((r) => ({
//       date: r._id,
//       deliveries: r.deliveries,
//       net: round2(r.gross * (RIDER_COMMISSION_PERCENT / 100)),
//     }));

//     const pendingPayout = payoutTotals.pending + payoutTotals.processing;
//     const availableBalance = Math.max(0, round2(netEarnings - payoutTotals.paid - pendingPayout));

//     res.status(200).json({
//       success: true,
//       data: {
//         commissionPercent: RIDER_COMMISSION_PERCENT,
//         grossHandled,
//         deliveries,
//         netEarnings,
//         thisMonthNet: round2((thisMonthAgg[0]?.gross || 0) * (RIDER_COMMISSION_PERCENT / 100)),
//         lastMonthNet: round2((lastMonthAgg[0]?.gross || 0) * (RIDER_COMMISSION_PERCENT / 100)),
//         dailyEarnings,
//         totalPaidOut: payoutTotals.paid,
//         pendingPayout,
//         availableBalance,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching earnings", error: error.message });
//   }
// };

// // @desc    Request a payout against the caller's own available balance.
// // @route   POST /api/earnings/payouts  { amount, method, payoutDetails }
// // @access  Private (dairyOwner or deliveryPerson)
// export const requestPayout = async (req, res) => {
//   try {
//     const amount = Number(req.body.amount);
//     const { method, payoutDetails } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ success: false, message: "A valid amount is required" });
//     }

//     const role = req.user.role; // route already restricts to dairyOwner | deliveryPerson
//     const availableBalance = await computeAvailableBalance(req.user._id, role);

//     if (amount > availableBalance) {
//       return res.status(400).json({
//         success: false,
//         message: `You can request up to ${formatMoney(availableBalance)} right now`,
//       });
//     }

//     const payout = await Payout.create({
//       user: req.user._id,
//       role,
//       amount,
//       method: method || "upi",
//       payoutDetails,
//     });

//     res.status(201).json({ success: true, message: "Payout requested", data: payout });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error requesting payout", error: error.message });
//   }
// };

// function formatMoney(n) {
//   return `₹${Number(n).toFixed(2)}`;
// }

// // @desc    The logged-in owner/rider's own payout history.
// // @route   GET /api/earnings/payouts/my
// // @access  Private (dairyOwner or deliveryPerson)
// export const getMyPayouts = async (req, res) => {
//   try {
//     const payouts = await Payout.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: payouts.length, data: payouts });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching payout history", error: error.message });
//   }
// };

// // @desc    All payout requests, optionally filtered — for admin review.
// // @route   GET /api/earnings/payouts?status=pending&role=deliveryPerson
// // @access  Private (admin)
// export const getAllPayouts = async (req, res) => {
//   try {
//     const filter = {};
//     if (req.query.status) filter.status = req.query.status;
//     if (req.query.role) filter.role = req.query.role;

//     const payouts = await Payout.find(filter)
//       .populate("user", "username email phone role")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, count: payouts.length, data: payouts });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching payouts", error: error.message });
//   }
// };

// // @desc    Settle a payout request — mark it paid/rejected/processing.
// // @route   PATCH /api/earnings/payouts/:id  { status, notes }
// // @access  Private (admin)
// export const updatePayoutStatus = async (req, res) => {
//   try {
//     const { status, notes } = req.body;
//     const allowed = ["pending", "processing", "paid", "rejected"];
//     if (!allowed.includes(status)) {
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }

//     const payout = await Payout.findById(req.params.id);
//     if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });

//     payout.status = status;
//     if (notes) payout.notes = notes;
//     if (["paid", "rejected"].includes(status)) {
//       payout.processedAt = new Date();
//       payout.processedBy = req.user._id;
//     }
//     await payout.save();

//     res.status(200).json({ success: true, message: "Payout updated", data: payout });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating payout", error: error.message });
//   }
// };
















import mongoose from "mongoose";
import Order from "../models/order.js";
import Milk from "../models/milk.js";
import Review from "../models/review.js";
import Wallet from "../models/wallet.js";
import Dairy from "../models/dairy.js";
import Delivery from "../models/delivery.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const toUTC = (dateStr) => Date.parse(`${dateStr}T00:00:00Z`);

// Given a sorted list of distinct 'YYYY-MM-DD' strings (days with at
// least one delivered order), works out:
//  - longest: the longest run of consecutive days, ever
//  - current: the run of consecutive days ending today or yesterday
//    (ending yesterday still counts — the streak isn't broken until a
//    full day passes with nothing delivered)
function computeStreaks(dates) {
    if (dates.length === 0) return { current: 0, longest: 0 };

    let longest = 1;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
        const diff = (toUTC(dates[i]) - toUTC(dates[i - 1])) / DAY_MS;
        if (diff === 1) {
            run += 1;
            longest = Math.max(longest, run);
        } else {
            run = 1;
        }
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const gapToToday = (toUTC(todayStr) - toUTC(dates[dates.length - 1])) / DAY_MS;

    let current = 0;
    if (gapToToday <= 1) {
        current = 1;
        for (let i = dates.length - 1; i > 0; i--) {
            const diff = (toUTC(dates[i]) - toUTC(dates[i - 1])) / DAY_MS;
            if (diff === 1) current += 1;
            else break;
        }
    }

    return { current, longest };
}

// @desc    Activity dashboard numbers for the logged-in customer: totals,
//          milk-type breakdown, delivery streaks, and a per-day activity
//          calendar (with milk type + quantity detail for tooltips) for
//          a given year.
// @route   GET /api/orders/my-activity?year=2026
// @access  Private
export const getMyActivity = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const year = Number(req.query.year) || new Date().getFullYear();
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

        const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } };

        const [
            totals,
            milkRows,
            dailyRows,
            deliveredRows,
            reviewsWritten,
            subscriptionDeliveries,
            wallet,
        ] = await Promise.all([
            Order.aggregate([
                { $match: { userId } },
                { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" } } },
            ]),
            Order.aggregate([
                { $match: { userId } },
                { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
                { $unwind: "$milk" },
                { $group: { _id: "$milk.type", count: { $sum: 1 } } },
            ]),
            // Per day AND per milk-type, so the heatmap tooltip can show a
            // breakdown like "Cow milk — 2L" / "Buffalo milk — 1L" for a
            // day where more than one type was ordered.
            Order.aggregate([
                { $match: { userId, scheduledDate: { $gte: yearStart, $lt: yearEnd } } },
                { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
                { $unwind: { path: "$milk", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { date: dayFormat, milkType: "$milk.type" },
                        quantity: { $sum: "$quantity" },
                        orders: { $sum: 1 },
                        unit: { $first: "$milk.unit" },
                    },
                },
                { $sort: { "_id.date": 1 } },
            ]),
            Order.aggregate([
                { $match: { userId, status: "delivered" } },
                { $group: { _id: dayFormat } },
                { $sort: { _id: 1 } },
            ]),
            Review.countDocuments({ userId }),
            Order.countDocuments({ userId, subscription: { $exists: true, $ne: null } }),
            Wallet.findOne({ user: req.user._id }),
        ]);

        const milkBreakdown = { cow: 0, buffalo: 0, goat: 0, sheep: 0 };
        milkRows.forEach((row) => {
            if (row._id in milkBreakdown) milkBreakdown[row._id] = row.count;
        });

        // Fold the (date, milkType) rows back into one entry per date, each
        // carrying a `count` (for the cell's shade) and an `items` list
        // (for the tooltip: milk type, quantity, unit).
        const dailyMap = new Map();
        dailyRows.forEach((row) => {
            const date = row._id.date;
            if (!dailyMap.has(date)) dailyMap.set(date, { date, count: 0, items: [] });
            const entry = dailyMap.get(date);
            entry.count += row.orders;
            entry.items.push({
                milkType: row._id.milkType || "milk",
                quantity: row.quantity,
                unit: row.unit || "L",
                orders: row.orders,
            });
        });
        const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        const yearTotal = dailyActivity.reduce((sum, d) => sum + d.count, 0);
        const { current, longest } = computeStreaks(deliveredRows.map((r) => r._id));

        res.status(200).json({
            success: true,
            data: {
                year,
                totalOrders: totals[0]?.totalOrders || 0,
                totalSpent: totals[0]?.totalSpent || 0,
                reviewsWritten,
                subscriptionDeliveries,
                loyaltyPoints: wallet?.loyaltyPoints || 0,
                currentStreak: current,
                longestStreak: longest,
                milkBreakdown,
                dailyActivity,
                yearTotal,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching activity", error: error.message });
    }
};

// @desc    Activity dashboard for the logged-in dairy owner: fulfilled-
//          order totals, milk-type breakdown, fulfillment streaks, and a
//          per-day calendar (with milk type + quantity for tooltips),
//          scoped to their own dairy only.
// @route   GET /api/dairies/owner/my-activity?year=2026
// @access  Private (dairyOwner)
export const getOwnerActivity = async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const dairy = await Dairy.findOne({ owner: req.user._id });

        if (!dairy) {
            return res.status(200).json({
                success: true,
                data: {
                    hasDairy: false,
                    year,
                    totalOrders: 0,
                    milkBreakdown: { cow: 0, buffalo: 0, goat: 0, sheep: 0 },
                    currentStreak: 0,
                    longestStreak: 0,
                    dailyActivity: [],
                    yearTotal: 0,
                },
            });
        }

        const dairyId = dairy._id;
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
        const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } };

        const [totals, milkRows, dailyRows, deliveredRows] = await Promise.all([
            Order.aggregate([
                { $match: { dairy: dairyId, status: "delivered" } },
                { $group: { _id: null, totalOrders: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: { dairy: dairyId, status: "delivered" } },
                { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
                { $unwind: "$milk" },
                { $group: { _id: "$milk.type", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: { dairy: dairyId, status: "delivered", scheduledDate: { $gte: yearStart, $lt: yearEnd } } },
                { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
                { $unwind: { path: "$milk", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { date: dayFormat, milkType: "$milk.type" },
                        quantity: { $sum: "$quantity" },
                        orders: { $sum: 1 },
                        unit: { $first: "$milk.unit" },
                    },
                },
                { $sort: { "_id.date": 1 } },
            ]),
            Order.aggregate([
                { $match: { dairy: dairyId, status: "delivered" } },
                { $group: { _id: dayFormat } },
                { $sort: { _id: 1 } },
            ]),
        ]);

        const milkBreakdown = { cow: 0, buffalo: 0, goat: 0, sheep: 0 };
        milkRows.forEach((row) => {
            if (row._id in milkBreakdown) milkBreakdown[row._id] = row.count;
        });

        const dailyMap = new Map();
        dailyRows.forEach((row) => {
            const date = row._id.date;
            if (!dailyMap.has(date)) dailyMap.set(date, { date, count: 0, items: [] });
            const entry = dailyMap.get(date);
            entry.count += row.orders;
            entry.items.push({
                milkType: row._id.milkType || "milk",
                quantity: row.quantity,
                unit: row.unit || "L",
                orders: row.orders,
            });
        });
        const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        const yearTotal = dailyActivity.reduce((sum, d) => sum + d.count, 0);
        const { current, longest } = computeStreaks(deliveredRows.map((r) => r._id));

        res.status(200).json({
            success: true,
            data: {
                hasDairy: true,
                year,
                totalOrders: totals[0]?.totalOrders || 0,
                milkBreakdown,
                currentStreak: current,
                longestStreak: longest,
                dailyActivity,
                yearTotal,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching activity", error: error.message });
    }
};

// @desc    Activity dashboard for the logged-in delivery rider:
//          completed-delivery totals, milk-type breakdown of what they
//          delivered, delivery streaks, and a per-day calendar, scoped
//          to their own deliveries only.
// @route   GET /api/delivery/my-activity?year=2026
// @access  Private (deliveryPerson)
export const getRiderActivity = async (req, res) => {
    try {
        const riderId = new mongoose.Types.ObjectId(req.user._id);
        const year = Number(req.query.year) || new Date().getFullYear();
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
        const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } };

        const [totals, milkRows, dailyRows, deliveredRows, failedDeliveries] = await Promise.all([
            Delivery.aggregate([
                { $match: { assignedRider: riderId, status: "delivered" } },
                { $group: { _id: null, totalDeliveries: { $sum: 1 } } },
            ]),
            Delivery.aggregate([
                { $match: { assignedRider: riderId, status: "delivered" } },
                { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
                { $unwind: "$order" },
                { $lookup: { from: Milk.collection.name, localField: "order.milkType", foreignField: "_id", as: "milk" } },
                { $unwind: "$milk" },
                { $group: { _id: "$milk.type", count: { $sum: 1 } } },
            ]),
            Delivery.aggregate([
                { $match: { assignedRider: riderId, status: "delivered", deliveredAt: { $gte: yearStart, $lt: yearEnd } } },
                { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
                { $unwind: "$order" },
                { $lookup: { from: Milk.collection.name, localField: "order.milkType", foreignField: "_id", as: "milk" } },
                { $unwind: { path: "$milk", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { date: dayFormat, milkType: "$milk.type" },
                        quantity: { $sum: "$order.quantity" },
                        orders: { $sum: 1 },
                        unit: { $first: "$milk.unit" },
                    },
                },
                { $sort: { "_id.date": 1 } },
            ]),
            Delivery.aggregate([
                { $match: { assignedRider: riderId, status: "delivered" } },
                { $group: { _id: dayFormat } },
                { $sort: { _id: 1 } },
            ]),
            Delivery.countDocuments({ assignedRider: riderId, status: "failed" }),
        ]);

        const milkBreakdown = { cow: 0, buffalo: 0, goat: 0, sheep: 0 };
        milkRows.forEach((row) => {
            if (row._id in milkBreakdown) milkBreakdown[row._id] = row.count;
        });

        const dailyMap = new Map();
        dailyRows.forEach((row) => {
            const date = row._id.date;
            if (!dailyMap.has(date)) dailyMap.set(date, { date, count: 0, items: [] });
            const entry = dailyMap.get(date);
            entry.count += row.orders;
            entry.items.push({
                milkType: row._id.milkType || "milk",
                quantity: row.quantity,
                unit: row.unit || "L",
                orders: row.orders,
            });
        });
        const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        const yearTotal = dailyActivity.reduce((sum, d) => sum + d.count, 0);
        const { current, longest } = computeStreaks(deliveredRows.map((r) => r._id));

        res.status(200).json({
            success: true,
            data: {
                year,
                totalDeliveries: totals[0]?.totalDeliveries || 0,
                failedDeliveries,
                milkBreakdown,
                currentStreak: current,
                longestStreak: longest,
                dailyActivity,
                yearTotal,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching activity", error: error.message });
    }
};
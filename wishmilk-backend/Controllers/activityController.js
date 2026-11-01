// import mongoose from "mongoose";
// import Order from "../models/order.js";
// import Milk from "../models/milk.js";
// import Review from "../models/review.js";
// import Wallet from "../models/wallet.js";
// import Dairy from "../models/dairy.js";
// import Delivery from "../models/delivery.js";

// const DAY_MS = 24 * 60 * 60 * 1000;
// const toUTC = (dateStr) => Date.parse(`${dateStr}T00:00:00Z`);

// // Given a sorted list of distinct 'YYYY-MM-DD' strings (days with at
// // least one delivered order), works out:
// //  - longest: the longest run of consecutive days, ever
// //  - current: the run of consecutive days ending today or yesterday
// //    (ending yesterday still counts — the streak isn't broken until a
// //    full day passes with nothing delivered)
// function computeStreaks(dates) {
//     if (dates.length === 0) return { current: 0, longest: 0 };

//     let longest = 1;
//     let run = 1;
//     for (let i = 1; i < dates.length; i++) {
//         const diff = (toUTC(dates[i]) - toUTC(dates[i - 1])) / DAY_MS;
//         if (diff === 1) {
//             run += 1;
//             longest = Math.max(longest, run);
//         } else {
//             run = 1;
//         }
//     }

//     const todayStr = new Date().toISOString().slice(0, 10);
//     const gapToToday = (toUTC(todayStr) - toUTC(dates[dates.length - 1])) / DAY_MS;

//     let current = 0;
//     if (gapToToday <= 1) {
//         current = 1;
//         for (let i = dates.length - 1; i > 0; i--) {
//             const diff = (toUTC(dates[i]) - toUTC(dates[i - 1])) / DAY_MS;
//             if (diff === 1) current += 1;
//             else break;
//         }
//     }

//     return { current, longest };
// }

// // @desc    Activity dashboard numbers for the logged-in customer: totals,
// //          milk-type breakdown, delivery streaks, and a per-day activity
// //          calendar (with milk type + quantity detail for tooltips) for
// //          a given year.
// // @route   GET /api/orders/my-activity?year=2026
// // @access  Private
// export const getMyActivity = async (req, res) => {
//     try {
//         const userId = new mongoose.Types.ObjectId(req.user._id);
//         const year = Number(req.query.year) || new Date().getFullYear();
//         const yearStart = new Date(Date.UTC(year, 0, 1));
//         const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

//         const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } };

//         const [
//             totals,
//             milkRows,
//             dailyRows,
//             deliveredRows,
//             reviewsWritten,
//             subscriptionDeliveries,
//             wallet,
//         ] = await Promise.all([
//             Order.aggregate([
//                 { $match: { userId } },
//                 { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" } } },
//             ]),
//             Order.aggregate([
//                 { $match: { userId } },
//                 { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
//                 { $unwind: "$milk" },
//                 { $group: { _id: "$milk.type", count: { $sum: 1 } } },
//             ]),
//             // Per day AND per milk-type, so the heatmap tooltip can show a
//             // breakdown like "Cow milk — 2L" / "Buffalo milk — 1L" for a
//             // day where more than one type was ordered.
//             Order.aggregate([
//                 { $match: { userId, scheduledDate: { $gte: yearStart, $lt: yearEnd } } },
//                 { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
//                 { $unwind: { path: "$milk", preserveNullAndEmptyArrays: true } },
//                 {
//                     $group: {
//                         _id: { date: dayFormat, milkType: "$milk.type" },
//                         quantity: { $sum: "$quantity" },
//                         orders: { $sum: 1 },
//                         unit: { $first: "$milk.unit" },
//                     },
//                 },
//                 { $sort: { "_id.date": 1 } },
//             ]),
//             Order.aggregate([
//                 { $match: { userId, status: "delivered" } },
//                 { $group: { _id: dayFormat } },
//                 { $sort: { _id: 1 } },
//             ]),
//             Review.countDocuments({ userId }),
//             Order.countDocuments({ userId, subscription: { $exists: true, $ne: null } }),
//             Wallet.findOne({ user: req.user._id }),
//         ]);

//         const milkBreakdown = { cow: 0, buffalo: 0, goat: 0, sheep: 0 };
//         milkRows.forEach((row) => {
//             if (row._id in milkBreakdown) milkBreakdown[row._id] = row.count;
//         });

//         // Fold the (date, milkType) rows back into one entry per date, each
//         // carrying a `count` (for the cell's shade) and an `items` list
//         // (for the tooltip: milk type, quantity, unit).
//         const dailyMap = new Map();
//         dailyRows.forEach((row) => {
//             const date = row._id.date;
//             if (!dailyMap.has(date)) dailyMap.set(date, { date, count: 0, items: [] });
//             const entry = dailyMap.get(date);
//             entry.count += row.orders;
//             entry.items.push({
//                 milkType: row._id.milkType || "milk",
//                 quantity: row.quantity,
//                 unit: row.unit || "L",
//                 orders: row.orders,
//             });
//         });
//         const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
//         const yearTotal = dailyActivity.reduce((sum, d) => sum + d.count, 0);
//         const { current, longest } = computeStreaks(deliveredRows.map((r) => r._id));

//         res.status(200).json({
//             success: true,
//             data: {
//                 year,
//                 totalOrders: totals[0]?.totalOrders || 0,
//                 totalSpent: totals[0]?.totalSpent || 0,
//                 reviewsWritten,
//                 subscriptionDeliveries,
//                 loyaltyPoints: wallet?.loyaltyPoints || 0,
//                 currentStreak: current,
//                 longestStreak: longest,
//                 milkBreakdown,
//                 dailyActivity,
//                 yearTotal,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching activity", error: error.message });
//     }
// };

// // @desc    Activity dashboard for the logged-in dairy owner: fulfilled-
// //          order totals, milk-type breakdown, fulfillment streaks, and a
// //          per-day calendar (with milk type + quantity for tooltips),
// //          scoped to their own dairy only.
// // @route   GET /api/dairies/owner/my-activity?year=2026
// // @access  Private (dairyOwner)
// export const getOwnerActivity = async (req, res) => {
//     try {
//         const year = Number(req.query.year) || new Date().getFullYear();
//         const dairy = await Dairy.findOne({ owner: req.user._id });

//         if (!dairy) {
//             return res.status(200).json({
//                 success: true,
//                 data: {
//                     hasDairy: false,
//                     year,
//                     totalOrders: 0,
//                     milkBreakdown: { cow: 0, buffalo: 0, goat: 0, sheep: 0 },
//                     currentStreak: 0,
//                     longestStreak: 0,
//                     dailyActivity: [],
//                     yearTotal: 0,
//                 },
//             });
//         }

//         const dairyId = dairy._id;
//         const yearStart = new Date(Date.UTC(year, 0, 1));
//         const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
//         const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } };

//         const [totals, milkRows, dailyRows, deliveredRows] = await Promise.all([
//             Order.aggregate([
//                 { $match: { dairy: dairyId, status: "delivered" } },
//                 { $group: { _id: null, totalOrders: { $sum: 1 } } },
//             ]),
//             Order.aggregate([
//                 { $match: { dairy: dairyId, status: "delivered" } },
//                 { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
//                 { $unwind: "$milk" },
//                 { $group: { _id: "$milk.type", count: { $sum: 1 } } },
//             ]),
//             Order.aggregate([
//                 { $match: { dairy: dairyId, status: "delivered", scheduledDate: { $gte: yearStart, $lt: yearEnd } } },
//                 { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
//                 { $unwind: { path: "$milk", preserveNullAndEmptyArrays: true } },
//                 {
//                     $group: {
//                         _id: { date: dayFormat, milkType: "$milk.type" },
//                         quantity: { $sum: "$quantity" },
//                         orders: { $sum: 1 },
//                         unit: { $first: "$milk.unit" },
//                     },
//                 },
//                 { $sort: { "_id.date": 1 } },
//             ]),
//             Order.aggregate([
//                 { $match: { dairy: dairyId, status: "delivered" } },
//                 { $group: { _id: dayFormat } },
//                 { $sort: { _id: 1 } },
//             ]),
//         ]);

//         const milkBreakdown = { cow: 0, buffalo: 0, goat: 0, sheep: 0 };
//         milkRows.forEach((row) => {
//             if (row._id in milkBreakdown) milkBreakdown[row._id] = row.count;
//         });

//         const dailyMap = new Map();
//         dailyRows.forEach((row) => {
//             const date = row._id.date;
//             if (!dailyMap.has(date)) dailyMap.set(date, { date, count: 0, items: [] });
//             const entry = dailyMap.get(date);
//             entry.count += row.orders;
//             entry.items.push({
//                 milkType: row._id.milkType || "milk",
//                 quantity: row.quantity,
//                 unit: row.unit || "L",
//                 orders: row.orders,
//             });
//         });
//         const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
//         const yearTotal = dailyActivity.reduce((sum, d) => sum + d.count, 0);
//         const { current, longest } = computeStreaks(deliveredRows.map((r) => r._id));

//         res.status(200).json({
//             success: true,
//             data: {
//                 hasDairy: true,
//                 year,
//                 totalOrders: totals[0]?.totalOrders || 0,
//                 milkBreakdown,
//                 currentStreak: current,
//                 longestStreak: longest,
//                 dailyActivity,
//                 yearTotal,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching activity", error: error.message });
//     }
// };

// // @desc    Activity dashboard for the logged-in delivery rider:
// //          completed-delivery totals, milk-type breakdown of what they
// //          delivered, delivery streaks, and a per-day calendar, scoped
// //          to their own deliveries only.
// // @route   GET /api/delivery/my-activity?year=2026
// // @access  Private (deliveryPerson)
// export const getRiderActivity = async (req, res) => {
//     try {
//         const riderId = new mongoose.Types.ObjectId(req.user._id);
//         const year = Number(req.query.year) || new Date().getFullYear();
//         const yearStart = new Date(Date.UTC(year, 0, 1));
//         const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
//         const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } };

//         const [totals, milkRows, dailyRows, deliveredRows, failedDeliveries] = await Promise.all([
//             Delivery.aggregate([
//                 { $match: { assignedRider: riderId, status: "delivered" } },
//                 { $group: { _id: null, totalDeliveries: { $sum: 1 } } },
//             ]),
//             Delivery.aggregate([
//                 { $match: { assignedRider: riderId, status: "delivered" } },
//                 { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
//                 { $unwind: "$order" },
//                 { $lookup: { from: Milk.collection.name, localField: "order.milkType", foreignField: "_id", as: "milk" } },
//                 { $unwind: "$milk" },
//                 { $group: { _id: "$milk.type", count: { $sum: 1 } } },
//             ]),
//             Delivery.aggregate([
//                 { $match: { assignedRider: riderId, status: "delivered", deliveredAt: { $gte: yearStart, $lt: yearEnd } } },
//                 { $lookup: { from: Order.collection.name, localField: "order", foreignField: "_id", as: "order" } },
//                 { $unwind: "$order" },
//                 { $lookup: { from: Milk.collection.name, localField: "order.milkType", foreignField: "_id", as: "milk" } },
//                 { $unwind: { path: "$milk", preserveNullAndEmptyArrays: true } },
//                 {
//                     $group: {
//                         _id: { date: dayFormat, milkType: "$milk.type" },
//                         quantity: { $sum: "$order.quantity" },
//                         orders: { $sum: 1 },
//                         unit: { $first: "$milk.unit" },
//                     },
//                 },
//                 { $sort: { "_id.date": 1 } },
//             ]),
//             Delivery.aggregate([
//                 { $match: { assignedRider: riderId, status: "delivered" } },
//                 { $group: { _id: dayFormat } },
//                 { $sort: { _id: 1 } },
//             ]),
//             Delivery.countDocuments({ assignedRider: riderId, status: "failed" }),
//         ]);

//         const milkBreakdown = { cow: 0, buffalo: 0, goat: 0, sheep: 0 };
//         milkRows.forEach((row) => {
//             if (row._id in milkBreakdown) milkBreakdown[row._id] = row.count;
//         });

//         const dailyMap = new Map();
//         dailyRows.forEach((row) => {
//             const date = row._id.date;
//             if (!dailyMap.has(date)) dailyMap.set(date, { date, count: 0, items: [] });
//             const entry = dailyMap.get(date);
//             entry.count += row.orders;
//             entry.items.push({
//                 milkType: row._id.milkType || "milk",
//                 quantity: row.quantity,
//                 unit: row.unit || "L",
//                 orders: row.orders,
//             });
//         });
//         const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
//         const yearTotal = dailyActivity.reduce((sum, d) => sum + d.count, 0);
//         const { current, longest } = computeStreaks(deliveredRows.map((r) => r._id));

//         res.status(200).json({
//             success: true,
//             data: {
//                 year,
//                 totalDeliveries: totals[0]?.totalDeliveries || 0,
//                 failedDeliveries,
//                 milkBreakdown,
//                 currentStreak: current,
//                 longestStreak: longest,
//                 dailyActivity,
//                 yearTotal,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching activity", error: error.message });
//     }
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

// @desc    Platform-wide activity for the admin: delivered-order totals,
//          milk-type breakdown, who is active on the platform, delivery
//          streaks, and a per-day calendar across every dairy.
// @route   GET /api/admin/activity?year=2026
// @access  Private (admin)
export const getAdminActivity = async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
        const dayFormat = { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } };
        const delivered = { status: "delivered" };

        const [totals, cancelledOrders, milkRows, dailyRows, deliveredRows, riderRows] = await Promise.all([
            Order.aggregate([
                { $match: delivered },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        customers: { $addToSet: "$userId" },
                        dairies: { $addToSet: "$dairy" },
                    },
                },
            ]),
            Order.countDocuments({ status: "cancelled" }),
            Order.aggregate([
                { $match: delivered },
                { $lookup: { from: Milk.collection.name, localField: "milkType", foreignField: "_id", as: "milk" } },
                { $unwind: "$milk" },
                { $group: { _id: "$milk.type", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: { ...delivered, scheduledDate: { $gte: yearStart, $lt: yearEnd } } },
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
                { $match: delivered },
                { $group: { _id: dayFormat } },
                { $sort: { _id: 1 } },
            ]),
            Delivery.aggregate([
                { $match: { status: "delivered", assignedRider: { $ne: null } } },
                { $group: { _id: "$assignedRider" } },
                { $count: "activeRiders" },
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
                year,
                totalOrders: totals[0]?.totalOrders || 0,
                cancelledOrders,
                activeCustomers: totals[0]?.customers?.length || 0,
                activeDairies: totals[0]?.dairies?.length || 0,
                activeRiders: riderRows[0]?.activeRiders || 0,
                milkBreakdown,
                currentStreak: current,
                longestStreak: longest,
                dailyActivity,
                yearTotal,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching platform activity", error: error.message });
    }
};
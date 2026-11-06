// Shared coupon rules, so the "apply" preview and the real checkout can
// never disagree about whether a coupon is valid or how much it takes off.

const toPaise = (rupees) => Math.round(rupees * 100);
const toRupees = (paise) => paise / 100;

// Checks a coupon against an amount for one user and works out the
// discount. Pure: reads the coupon document, changes nothing.
//   -> { ok: false, status, message }  when it can't be used
//   -> { ok: true, discount }          discount in rupees
export function evaluateCoupon(coupon, amount, userId) {
    if (!coupon || !coupon.isActive) {
        return { ok: false, status: 404, message: "Coupon not found" };
    }
    if (new Date() > coupon.expiresAt) {
        return { ok: false, status: 400, message: "Coupon has expired" };
    }
    if (amount < coupon.minOrderAmount) {
        return {
            ok: false,
            status: 400,
            message: `Minimum order amount to apply this coupon is ₹${coupon.minOrderAmount}`,
        };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
        return { ok: false, status: 400, message: "Coupon usage limit has been reached" };
    }
    const userUsage = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
    if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
        return {
            ok: false,
            status: 400,
            message: "You've already used this coupon the maximum number of times",
        };
    }

    let discount =
        coupon.discountType === "percentage" ? (amount * coupon.discountValue) / 100 : coupon.discountValue;
    // maxDiscount caps percentage coupons. 0 / unset means "no cap" — it
    // used to mean "cap at ₹0", which silently made such coupons worthless.
    if (coupon.discountType === "percentage" && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, amount);
    return { ok: true, discount: toRupees(toPaise(discount)) };
}

// Splits a discount across order lines in proportion to each line's value,
// working in whole paise so the shares add up to the discount exactly (no
// ₹0.01 lost or invented) and no share ever exceeds its own line.
//   lineAmounts: [rupees]  ->  [rupees] shares, same order
export function splitDiscount(lineAmounts, discount) {
    const linePaise = lineAmounts.map(toPaise);
    const totalPaise = linePaise.reduce((a, b) => a + b, 0);
    const discountPaise = Math.min(toPaise(discount), totalPaise);
    if (totalPaise === 0 || discountPaise === 0) return lineAmounts.map(() => 0);

    const shares = linePaise.map((p) => Math.floor((discountPaise * p) / totalPaise));
    let leftover = discountPaise - shares.reduce((a, b) => a + b, 0);

    // Hand the few remaining paise to the biggest lines first.
    const order = linePaise.map((p, i) => i).sort((a, b) => linePaise[b] - linePaise[a]);
    for (let k = 0; leftover > 0; k = (k + 1) % order.length) {
        const i = order[k];
        if (shares[i] < linePaise[i]) {
            shares[i] += 1;
            leftover -= 1;
        }
    }
    return shares.map(toRupees);
}
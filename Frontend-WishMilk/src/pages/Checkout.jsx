// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import toast from "react-hot-toast";
// import { MapPin, Plus, Tag, Loader2, Banknote, ShieldCheck } from "lucide-react";
// import { authApi } from "../api/auth.js";
// import { orderApi } from "../api/order.js";
// import { couponApi } from "../api/coupon.js";
// import { paymentApi } from "../api/payment.js";
// import { payWithRazorpay } from "../lib/razorpay.js";
// import { useCart } from "../context/CartContext.jsx";
// import Card from "../components/ui/Card.jsx";
// import Button from "../components/ui/Button.jsx";
// import Input from "../components/ui/Input.jsx";
// import { formatINR, SLOT_LABEL, cx } from "../lib/utils.js";

// const todayISO = () => new Date().toISOString().split("T")[0];

// export default function Checkout() {
//   const { items, subtotal, clear } = useCart();
//   const navigate = useNavigate();

//   const [addresses, setAddresses] = useState([]);
//   const [addressId, setAddressId] = useState("");
//   const [loadingAddresses, setLoadingAddresses] = useState(true);
//   const [showAddAddress, setShowAddAddress] = useState(false);
//   const [newAddress, setNewAddress] = useState({ label: "home", fullAddress: "" });
//   const [coords, setCoords] = useState(null);
//   const [savingAddress, setSavingAddress] = useState(false);

//   const [slot, setSlot] = useState("morning");
//   const [date, setDate] = useState(todayISO());

//   const [couponCode, setCouponCode] = useState("");
//   const [applyingCoupon, setApplyingCoupon] = useState(false);
//   const [coupon, setCoupon] = useState(null); // { code, discount, finalAmount }
//   const [couponError, setCouponError] = useState("");

//   // Online payment (Razorpay) only supports one Order per Payment on the
//   // backend, so it's only offered when the cart has exactly one item.
//   // Multi-item carts always go cash-on-delivery.
//   const isSingleItem = items.length === 1;
//   const [paymentChoice, setPaymentChoice] = useState("online"); // 'online' | 'cod'

//   const [placing, setPlacing] = useState(false);

//   useEffect(() => {
//     if (items.length === 0) {
//       navigate("/cart", { replace: true });
//       return;
//     }
//     authApi
//       .getAddresses()
//       .then((res) => {
//         setAddresses(res.data || []);
//         if (res.data?.length) setAddressId(res.data[0]._id);
//         else setShowAddAddress(true);
//       })
//       .catch((err) => toast.error(err.message))
//       .finally(() => setLoadingAddresses(false));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const captureLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition(
//       (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
//       () => toast.error("Couldn't access your location")
//     );
//   };

//   const handleAddAddress = async (e) => {
//     e.preventDefault();
//     if (!newAddress.fullAddress) return;
//     setSavingAddress(true);
//     try {
//       const res = await authApi.addAddress({
//         label: newAddress.label,
//         fullAddress: newAddress.fullAddress,
//         location: { coordinates: coords || [0, 0] },
//       });
//       setAddresses((prev) => [...prev, res.data]);
//       setAddressId(res.data._id);
//       setShowAddAddress(false);
//       toast.success("Address saved");
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSavingAddress(false);
//     }
//   };

//   const handleApplyCoupon = async () => {
//     if (!couponCode) return;
//     setApplyingCoupon(true);
//     setCouponError("");
//     try {
//       const res = await couponApi.apply({ code: couponCode, orderAmount: subtotal });
//       setCoupon(res.data);
//       toast.success(`Coupon ${res.data.code} applied`);
//     } catch (err) {
//       setCoupon(null);
//       setCouponError(err.message);
//     } finally {
//       setApplyingCoupon(false);
//     }
//   };

//   const discountRatio = coupon ? coupon.discount / subtotal : 0;
//   const total = coupon ? coupon.finalAmount : subtotal;

//   const handlePlaceOrder = async () => {
//     if (!addressId) {
//       toast.error("Please choose or add a delivery address");
//       return;
//     }
//     setPlacing(true);
//     try {
//       const createdOrders = [];
//       for (const item of items) {
//         const itemTotal = item.pricePerUnit * item.quantity;
//         const finalItemTotal = coupon
//           ? Math.max(0, Math.round((itemTotal - itemTotal * discountRatio) * 100) / 100)
//           : itemTotal;

//         const res = await orderApi.create({
//           dairy: item.dairyId,
//           milkType: item.milkId,
//           quantity: item.quantity,
//           deliveryAddress: addressId,
//           deliverySlot: slot,
//           scheduledDate: date,
//           totalPrice: finalItemTotal,
//         });
//         createdOrders.push(res.data);
//       }

//       if (coupon) {
//         await couponApi.redeem({ code: coupon.code }).catch(() => {});
//       }

//       const wantsOnline = isSingleItem && paymentChoice === "online";

//       if (wantsOnline) {
//         try {
//           const payRes = await paymentApi.createOrder({
//             orderId: createdOrders[0]._id,
//             paymentMethod: "upi",
//           });
//           await payWithRazorpay(payRes.data);
//           toast.success("Payment successful — order confirmed!");
//         } catch (err) {
//           // Order already exists either way — payment just didn't go
//           // through, so let them know instead of losing the order.
//           toast.error(`${err.message}. Your order is saved as unpaid — you can retry from My Orders.`);
//         }
//       } else {
//         // Cash on delivery — still create a Payment record per order so
//         // it shows up consistently in payment history later.
//         await Promise.all(
//           createdOrders.map((order) =>
//             paymentApi
//               .createOrder({ orderId: order._id, paymentMethod: "cash_on_delivery" })
//               .catch(() => {})
//           )
//         );
//         toast.success("Order placed! Track it from My Orders.");
//       }

//       clear();
//       navigate("/orders", { replace: true });
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setPlacing(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-3xl px-6 py-10">
//       <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>

//       {/* Address */}
//       <section className="mt-6">
//         <h2 className="font-display text-lg font-semibold text-ink">Delivery address</h2>
//         {loadingAddresses ? (
//           <p className="mt-2 text-sm text-ink-soft">Loading addresses…</p>
//         ) : (
//           <div className="mt-3 flex flex-col gap-2">
//             {addresses.map((a) => (
//               <label
//                 key={a._id}
//                 className={cx(
//                   "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm",
//                   addressId === a._id ? "border-butter bg-butter-light/30" : "border-ink/12 bg-cream-card"
//                 )}
//               >
//                 <input
//                   type="radio"
//                   name="address"
//                   className="mt-1"
//                   checked={addressId === a._id}
//                   onChange={() => setAddressId(a._id)}
//                 />
//                 <span>
//                   <span className="mb-0.5 block font-medium capitalize text-ink">{a.label}</span>
//                   <span className="text-ink-soft">{a.fullAddress}</span>
//                 </span>
//               </label>
//             ))}

//             {!showAddAddress && (
//               <button
//                 onClick={() => setShowAddAddress(true)}
//                 className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-ink/20 px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-butter hover:text-ink"
//               >
//                 <Plus size={15} /> Add a new address
//               </button>
//             )}

//             {showAddAddress && (
//               <Card className="p-4">
//                 <form onSubmit={handleAddAddress} className="flex flex-col gap-3">
//                   <div className="flex gap-2">
//                     {["home", "office", "other"].map((l) => (
//                       <button
//                         type="button"
//                         key={l}
//                         onClick={() => setNewAddress((n) => ({ ...n, label: l }))}
//                         className={cx(
//                           "rounded-full border px-3 py-1 text-xs font-medium capitalize",
//                           newAddress.label === l
//                             ? "border-butter bg-butter-light/50 text-butter-dark"
//                             : "border-ink/12 text-ink-soft"
//                         )}
//                       >
//                         {l}
//                       </button>
//                     ))}
//                   </div>
//                   <Input
//                     placeholder="Flat / street / area / city"
//                     value={newAddress.fullAddress}
//                     onChange={(e) => setNewAddress((n) => ({ ...n, fullAddress: e.target.value }))}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={captureLocation}
//                     className="flex items-center gap-1.5 self-start text-xs font-medium text-dawn-dark hover:underline"
//                   >
//                     <MapPin size={14} /> {coords ? "Location pinned ✓" : "Pin current location"}
//                   </button>
//                   <div className="flex gap-2">
//                     <Button type="submit" size="sm" loading={savingAddress}>
//                       Save address
//                     </Button>
//                     {addresses.length > 0 && (
//                       <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}>
//                         Cancel
//                       </Button>
//                     )}
//                   </div>
//                 </form>
//               </Card>
//             )}
//           </div>
//         )}
//       </section>

//       {/* Slot + date */}
//       <section className="mt-8 grid gap-4 sm:grid-cols-2">
//         <label className="block">
//           <span className="mb-1.5 block text-sm font-medium text-ink-soft">Delivery slot</span>
//           <select
//             className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn"
//             value={slot}
//             onChange={(e) => setSlot(e.target.value)}
//           >
//             {Object.entries(SLOT_LABEL).map(([value, label]) => (
//               <option key={value} value={value}>
//                 {label}
//               </option>
//             ))}
//           </select>
//         </label>
//         <Input
//           label="Delivery date"
//           type="date"
//           min={todayISO()}
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//         />
//       </section>

//       {/* Coupon */}
//       <section className="mt-8">
//         <h2 className="font-display text-lg font-semibold text-ink">Coupon</h2>
//         <div className="mt-3 flex gap-2">
//           <Input
//             placeholder="Enter coupon code"
//             value={couponCode}
//             onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
//             className="flex-1"
//           />
//           <Button variant="outline" onClick={handleApplyCoupon} loading={applyingCoupon}>
//             <Tag size={15} /> Apply
//           </Button>
//         </div>
//         {couponError && <p className="mt-1.5 text-sm text-clay">{couponError}</p>}
//         {coupon && (
//           <p className="mt-1.5 text-sm text-leaf">
//             {coupon.code} applied — you save {formatINR(coupon.discount)}
//           </p>
//         )}
//       </section>

//       {/* Payment method */}
//       <section className="mt-8">
//         <h2 className="font-display text-lg font-semibold text-ink">Payment method</h2>
//         {isSingleItem ? (
//           <div className="mt-3 grid gap-3 sm:grid-cols-2">
//             <button
//               type="button"
//               onClick={() => setPaymentChoice("online")}
//               className={cx(
//                 "flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm",
//                 paymentChoice === "online" ? "border-butter bg-butter-light/30" : "border-ink/12 bg-cream-card"
//               )}
//             >
//               <ShieldCheck size={18} className="mt-0.5 flex-none text-dawn-dark" />
//               <span>
//                 <span className="block font-medium text-ink">Pay online</span>
//                 <span className="text-xs text-ink-soft">Card, UPI, or net banking via Razorpay</span>
//               </span>
//             </button>
//             <button
//               type="button"
//               onClick={() => setPaymentChoice("cod")}
//               className={cx(
//                 "flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm",
//                 paymentChoice === "cod" ? "border-butter bg-butter-light/30" : "border-ink/12 bg-cream-card"
//               )}
//             >
//               <Banknote size={18} className="mt-0.5 flex-none text-leaf" />
//               <span>
//                 <span className="block font-medium text-ink">Cash on delivery</span>
//                 <span className="text-xs text-ink-soft">Pay when it arrives</span>
//               </span>
//             </button>
//           </div>
//         ) : (
//           <div className="mt-3 flex items-start gap-3 rounded-xl border border-ink/12 bg-cream-card p-3.5 text-sm">
//             <Banknote size={18} className="mt-0.5 flex-none text-leaf" />
//             <span className="text-ink-soft">
//               Online payment is only available for single-item orders right now — your
//               {" "}{items.length} items will be cash on delivery.
//             </span>
//           </div>
//         )}
//       </section>

//       {/* Summary */}
//       <Card className="mt-8 p-5">
//         <div className="flex items-center justify-between text-sm text-ink-soft">
//           <span>Subtotal</span>
//           <span className="font-mono">{formatINR(subtotal)}</span>
//         </div>
//         {coupon && (
//           <div className="mt-1.5 flex items-center justify-between text-sm text-leaf">
//             <span>Discount</span>
//             <span className="font-mono">-{formatINR(coupon.discount)}</span>
//           </div>
//         )}
//         <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3">
//           <span className="font-medium text-ink">Total</span>
//           <span className="font-mono text-lg font-semibold text-ink">{formatINR(total)}</span>
//         </div>
//         <Button size="lg" className="mt-5 w-full" onClick={handlePlaceOrder} loading={placing}>
//           {placing && <Loader2 className="animate-spin" size={16} />}
//           {isSingleItem && paymentChoice === "online" ? `Pay ${formatINR(total)} now` : "Place order"}
//         </Button>
//         <p className="mt-2 text-center text-xs text-ink-faint">
//           {isSingleItem
//             ? "Online payments are handled securely by Razorpay — we never see your card details."
//             : "Multi-item carts ship as separate orders and are cash on delivery for now."}
//         </p>
//       </Card>
//     </div>
//   );
// }



















import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Plus, Tag, Loader2, Banknote, ShieldCheck } from "lucide-react";
import { authApi } from "../api/auth.js";
import { orderApi } from "../api/order.js";
import { couponApi } from "../api/coupon.js";
import { paymentApi } from "../api/payment.js";
import { payWithRazorpay } from "../lib/razorpay.js";
import { useCart } from "../context/CartContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { formatINR, SLOT_LABEL, cx } from "../lib/utils.js";

const todayISO = () => new Date().toISOString().split("T")[0];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "home", fullAddress: "" });
  const [coords, setCoords] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [slot, setSlot] = useState("morning");
  const [date, setDate] = useState(todayISO());

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discount, finalAmount }
  const [couponError, setCouponError] = useState("");

  // Online payment (Razorpay) only supports one Order per Payment on the
  // backend, so it's only offered when the cart has exactly one item.
  // Multi-item carts always go cash-on-delivery.
  const isSingleItem = items.length === 1;
  const [paymentChoice, setPaymentChoice] = useState("online"); // 'online' | 'cod'

  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }
    authApi
      .getAddresses()
      .then((res) => {
        setAddresses(res.data || []);
        if (res.data?.length) setAddressId(res.data[0]._id);
        else setShowAddAddress(true);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingAddresses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
      () => toast.error("Couldn't access your location")
    );
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullAddress) return;
    setSavingAddress(true);
    try {
      const res = await authApi.addAddress({
        label: newAddress.label,
        fullAddress: newAddress.fullAddress,
        location: { coordinates: coords || [0, 0] },
      });
      setAddresses((prev) => [...prev, res.data]);
      setAddressId(res.data._id);
      setShowAddAddress(false);
      toast.success("Address saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      // The coupon can only be redeemed on one order (see handlePlaceOrder),
      // so for multi-item carts the preview is computed against just the
      // first item's amount — showing the whole cart's subtotal here would
      // overstate the discount that actually gets applied.
      const previewAmount = isSingleItem ? subtotal : items[0].pricePerUnit * items[0].quantity;
      const res = await couponApi.apply({ code: couponCode, orderAmount: previewAmount });
      setCoupon(res.data);
      toast.success(`Coupon ${res.data.code} applied`);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const total = coupon ? Math.max(0, subtotal - coupon.discount) : subtotal;

  const handlePlaceOrder = async () => {
    if (!addressId) {
      toast.error("Please choose or add a delivery address");
      return;
    }
    setPlacing(true);
    try {
      const createdOrders = [];
      // The coupon can only be redeemed once per checkout, so it's sent
      // with the first order — the backend validates and applies it
      // server-side there. totalPrice is never sent: the backend computes
      // the real price itself from the dairy's pricing, so a tampered
      // request can't discount an order beyond what a coupon actually
      // allows.
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = await orderApi.create({
          dairy: item.dairyId,
          milkType: item.milkId,
          quantity: item.quantity,
          deliveryAddress: addressId,
          deliverySlot: slot,
          scheduledDate: date,
          couponCode: i === 0 ? coupon?.code : undefined,
        });
        createdOrders.push(res.data);
      }

      const wantsOnline = isSingleItem && paymentChoice === "online";

      if (wantsOnline) {
        try {
          const payRes = await paymentApi.createOrder({
            orderId: createdOrders[0]._id,
            paymentMethod: "upi",
          });
          await payWithRazorpay(payRes.data);
          toast.success("Payment successful — order confirmed!");
        } catch (err) {
          // Order already exists either way — payment just didn't go
          // through, so let them know instead of losing the order.
          toast.error(`${err.message}. Your order is saved as unpaid — you can retry from My Orders.`);
        }
      } else {
        // Cash on delivery — still create a Payment record per order so
        // it shows up consistently in payment history later.
        await Promise.all(
          createdOrders.map((order) =>
            paymentApi
              .createOrder({ orderId: order._id, paymentMethod: "cash_on_delivery" })
              .catch(() => {})
          )
        );
        toast.success("Order placed! Track it from My Orders.");
      }

      clear();
      navigate("/orders", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>

      {/* Address */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-semibold text-ink">Delivery address</h2>
        {loadingAddresses ? (
          <p className="mt-2 text-sm text-ink-soft">Loading addresses…</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {addresses.map((a) => (
              <label
                key={a._id}
                className={cx(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm",
                  addressId === a._id ? "border-butter bg-butter-light/30" : "border-ink/12 bg-cream-card"
                )}
              >
                <input
                  type="radio"
                  name="address"
                  className="mt-1"
                  checked={addressId === a._id}
                  onChange={() => setAddressId(a._id)}
                />
                <span>
                  <span className="mb-0.5 block font-medium capitalize text-ink">{a.label}</span>
                  <span className="text-ink-soft">{a.fullAddress}</span>
                </span>
              </label>
            ))}

            {!showAddAddress && (
              <button
                onClick={() => setShowAddAddress(true)}
                className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-ink/20 px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-butter hover:text-ink"
              >
                <Plus size={15} /> Add a new address
              </button>
            )}

            {showAddAddress && (
              <Card className="p-4">
                <form onSubmit={handleAddAddress} className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    {["home", "office", "other"].map((l) => (
                      <button
                        type="button"
                        key={l}
                        onClick={() => setNewAddress((n) => ({ ...n, label: l }))}
                        className={cx(
                          "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                          newAddress.label === l
                            ? "border-butter bg-butter-light/50 text-butter-dark"
                            : "border-ink/12 text-ink-soft"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Flat / street / area / city"
                    value={newAddress.fullAddress}
                    onChange={(e) => setNewAddress((n) => ({ ...n, fullAddress: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={captureLocation}
                    className="flex items-center gap-1.5 self-start text-xs font-medium text-dawn-dark hover:underline"
                  >
                    <MapPin size={14} /> {coords ? "Location pinned ✓" : "Pin current location"}
                  </button>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" loading={savingAddress}>
                      Save address
                    </Button>
                    {addresses.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Slot + date */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Delivery slot</span>
          <select
            className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            {Object.entries(SLOT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Delivery date"
          type="date"
          min={todayISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </section>

      {/* Coupon */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Coupon</h2>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button variant="outline" onClick={handleApplyCoupon} loading={applyingCoupon}>
            <Tag size={15} /> Apply
          </Button>
        </div>
        {couponError && <p className="mt-1.5 text-sm text-clay">{couponError}</p>}
        {coupon && (
          <p className="mt-1.5 text-sm text-leaf">
            {coupon.code} applied — you save {formatINR(coupon.discount)}
          </p>
        )}
        {!isSingleItem && (
          <p className="mt-1.5 text-xs text-ink-faint">
            Coupons apply to one order at a time — this one will be applied to your first item.
          </p>
        )}
      </section>

      {/* Payment method */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Payment method</h2>
        {isSingleItem ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentChoice("online")}
              className={cx(
                "flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm",
                paymentChoice === "online" ? "border-butter bg-butter-light/30" : "border-ink/12 bg-cream-card"
              )}
            >
              <ShieldCheck size={18} className="mt-0.5 flex-none text-dawn-dark" />
              <span>
                <span className="block font-medium text-ink">Pay online</span>
                <span className="text-xs text-ink-soft">Card, UPI, or net banking via Razorpay</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentChoice("cod")}
              className={cx(
                "flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm",
                paymentChoice === "cod" ? "border-butter bg-butter-light/30" : "border-ink/12 bg-cream-card"
              )}
            >
              <Banknote size={18} className="mt-0.5 flex-none text-leaf" />
              <span>
                <span className="block font-medium text-ink">Cash on delivery</span>
                <span className="text-xs text-ink-soft">Pay when it arrives</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-ink/12 bg-cream-card p-3.5 text-sm">
            <Banknote size={18} className="mt-0.5 flex-none text-leaf" />
            <span className="text-ink-soft">
              Online payment is only available for single-item orders right now — your
              {" "}{items.length} items will be cash on delivery.
            </span>
          </div>
        )}
      </section>

      {/* Summary */}
      <Card className="mt-8 p-5">
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Subtotal</span>
          <span className="font-mono">{formatINR(subtotal)}</span>
        </div>
        {coupon && (
          <div className="mt-1.5 flex items-center justify-between text-sm text-leaf">
            <span>Discount</span>
            <span className="font-mono">-{formatINR(coupon.discount)}</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3">
          <span className="font-medium text-ink">Total</span>
          <span className="font-mono text-lg font-semibold text-ink">{formatINR(total)}</span>
        </div>
        <Button size="lg" className="mt-5 w-full" onClick={handlePlaceOrder} loading={placing}>
          {placing && <Loader2 className="animate-spin" size={16} />}
          {isSingleItem && paymentChoice === "online" ? `Pay ${formatINR(total)} now` : "Place order"}
        </Button>
        <p className="mt-2 text-center text-xs text-ink-faint">
          {isSingleItem
            ? "Online payments are handled securely by Razorpay — we never see your card details."
            : "Multi-item carts ship as separate orders and are cash on delivery for now."}
        </p>
      </Card>
    </div>
  );
}
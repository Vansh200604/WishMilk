// import { useState } from "react";
// import { Minus, Plus, ShoppingBasket, PackageX } from "lucide-react";
// import toast from "react-hot-toast";
// import Card from "../ui/Card.jsx";
// import Button from "../ui/Button.jsx";
// import { useCart } from "../../context/CartContext.jsx";
// import { formatINR, MILK_TYPE_LABEL } from "../../lib/utils.js";

// export default function MilkCard({ milk, dairy }) {
//   const [qty, setQty] = useState(1);
//   const { addItem } = useCart();

//   const pricePerUnit =
//     dairy?.milkPricing?.find((p) => p.type === milk.type)?.price ?? 0;

//   const handleAdd = () => {
//     addItem({
//       milkId: milk._id,
//       milkName: milk.name,
//       milkType: milk.type,
//       packaging: milk.packaging,
//       unit: milk.unit,
//       dairyId: dairy._id,
//       dairyName: dairy.name,
//       pricePerUnit,
//       quantity: qty,
//     });
//     toast.success(`${milk.name} added to cart`);
//   };

//   return (
//     <Card className="flex flex-col p-4">
//       <div className="flex items-start justify-between gap-2">
//         <div>
//           <h3 className="font-display text-base font-semibold text-ink">{milk.name}</h3>
//           <p className="mt-0.5 text-xs text-ink-faint">
//             {MILK_TYPE_LABEL[milk.type]} · {milk.fatPercentage}% fat · {milk.packaging}
//           </p>
//         </div>
//         {!milk.inStock && (
//           <span className="flex items-center gap-1 rounded-full bg-clay-light px-2 py-1 text-[11px] font-semibold text-clay">
//             <PackageX size={12} /> Out of stock
//           </span>
//         )}
//       </div>

//       <div className="mt-4 flex items-end justify-between">
//         <p className="font-mono text-lg font-semibold text-ink">
//           {formatINR(pricePerUnit)}
//           <span className="ml-1 text-xs font-normal text-ink-faint">/ {milk.unit}</span>
//         </p>

//         {milk.inStock && (
//           <div className="flex items-center gap-2 rounded-xl border border-ink/12 px-1">
//             <button
//               onClick={() => setQty((q) => Math.max(1, q - 1))}
//               className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
//               aria-label="Decrease quantity"
//             >
//               <Minus size={14} />
//             </button>
//             <span className="w-5 text-center font-mono text-sm">{qty}</span>
//             <button
//               onClick={() => setQty((q) => q + 1)}
//               className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
//               aria-label="Increase quantity"
//             >
//               <Plus size={14} />
//             </button>
//           </div>
//         )}
//       </div>

//       <Button
//         className="mt-4 w-full"
//         onClick={handleAdd}
//         disabled={!milk.inStock || pricePerUnit === 0}
//         title={pricePerUnit === 0 ? "This dairy hasn't set a price for this milk type yet" : ""}
//       >
//         <ShoppingBasket size={16} />
//         Add to cart
//       </Button>
//     </Card>
//   );
// }.




import { useState } from "react";
import { Minus, Plus, ShoppingBasket, PackageX, Repeat } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SubscribeModal from "../subscription/SubscribeModal.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { formatINR, MILK_TYPE_LABEL } from "../../lib/utils.js";

export default function MilkCard({ milk, dairy }) {
  const [qty, setQty] = useState(1);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const { addItem } = useCart();

  const pricePerUnit =
    dairy?.milkPricing?.find((p) => p.type === milk.type)?.price ?? 0;

  const handleAdd = () => {
    addItem({
      milkId: milk._id,
      milkName: milk.name,
      milkType: milk.type,
      packaging: milk.packaging,
      unit: milk.unit,
      dairyId: dairy._id,
      dairyName: dairy.name,
      pricePerUnit,
      quantity: qty,
    });
    toast.success(`${milk.name} added to cart`);
  };

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{milk.name}</h3>
          <p className="mt-0.5 text-xs text-ink-faint">
            {MILK_TYPE_LABEL[milk.type]} · {milk.fatPercentage}% fat · {milk.packaging}
          </p>
        </div>
        {!milk.inStock && (
          <span className="flex items-center gap-1 rounded-full bg-clay-light px-2 py-1 text-[11px] font-semibold text-clay">
            <PackageX size={12} /> Out of stock
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="font-mono text-lg font-semibold text-ink">
          {formatINR(pricePerUnit)}
          <span className="ml-1 text-xs font-normal text-ink-faint">/ {milk.unit}</span>
        </p>

        {milk.inStock && (
          <div className="flex items-center gap-2 rounded-xl border border-ink/12 px-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-mono text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1"
          onClick={handleAdd}
          disabled={!milk.inStock || pricePerUnit === 0}
          title={pricePerUnit === 0 ? "This dairy hasn't set a price for this milk type yet" : ""}
        >
          <ShoppingBasket size={16} />
          Add to cart
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowSubscribe(true)}
          disabled={!milk.inStock || pricePerUnit === 0}
          title="Get this delivered automatically, every day"
        >
          <Repeat size={16} />
        </Button>
      </div>

      {showSubscribe && (
        <SubscribeModal
          milk={milk}
          dairy={dairy}
          pricePerUnit={pricePerUnit}
          onClose={() => setShowSubscribe(false)}
        />
      )}
    </Card>
  );
}
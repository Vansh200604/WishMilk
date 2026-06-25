import walletService from "../services/walletService.js";

// get logged-in user's wallet
//route: GET /api/wallet
export const getMyWallet = async(req, res) => {
    try {
        const wallet = await walletService.getOrCreate(req.user._id);
        res.status(200).json({
            success: true,
            data: wallet
        });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Error fetching wallet.", error: error.message });;
    }
}

// get wallet transaction history
//route: GET /api/wallet/transactions
export const getTransactions = async(req, res) => {
    try{
        const {page = 1, limit = 20, type} = req.query;
        const wallet = await walletService.getOrCreate(req.user._id);

        let transactions = wallet.transactions;
        if(type){
            transactions = transactions.filter(t => t.type === type);
        }
        const total = transactions.length;
        const pageNum = Number(page);
        const limitNum = Number(limit);

        const paged = transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(
                (pageNum - 1) * limitNum,
                pageNum * limitNum
            );

        res.status(200).json({
            success: true,
            count: paged.length,
            total,
            page: pageNum,
            data: paged
        });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Error fetching transactions.", error: error.message });
    }
}

// Add money to wallet (admin only)
//route: POST /api/wallet/add-money
export const addMoney = async(req, res) => {
    try{
        const { amount } = req.body;
        if(!amount || amount <= 0){
            return res.status(400).json({ success: false, message: "Valid amount is required." });
        }
        const wallet = await walletService.credit({
            userId: req.user._id,
            amount,
            description: "Wallet top-up.",
            reference: `topup_${Date.now()}`,

        })
        res.status(200).json({
            success: true,
            message: `₹${amount} added to wallet successfully.`,
            data: wallet
        });

    }
    catch(error){
        res.status(500).json({ success: false, message: "Error adding money to wallet.", error: error.message });
    }
}

//Redeem loyalty points into wallet balance
//route: POST /api/wallet/redeem-points
export const redeemLoyaltyPoints  = async(req, res) => {
    try{
        const {points} = req.body;
        if(!points || points <= 0){
            return res.status(400).json({ success: false, message: "Valid points are required." });
        }
        const result = await walletService.redeemPoints({
            userId: req.user._id,
            points
        });
        res.status(200).json({
            success: true,
             message: `${result.redeemedPoints} points redeemed for ₹${result.amountCredited}`,
            data: result.wallet
        });
    }
    catch(error){
        res.status(400).json({
        success: false,
        message: error.message
    });
}
}
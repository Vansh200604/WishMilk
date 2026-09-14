import Wallet from '../models/wallet.js';

const walletService = {

    async getOrCreate(userId) {
        let wallet = await Wallet.findOne({ user: userId });
        if(!wallet) {
            const newWallet = await Wallet.create({ user: userId });
            wallet = newWallet;
        }
        return wallet;
    },

    async credit({userId, amount, description, reference }) {
        const wallet = await this.getOrCreate(userId);
        if(amount <= 0){
            throw new Error("Amount must be greater than zero.");
        }
        wallet.balance += amount;
        wallet.totalEarned += amount;
        wallet.transactions.push({
            type: 'credit',
            amount,
            description,
            reference,
            balanceAfter: wallet.balance
        })
        await wallet.save();
        return wallet;
    },

    async debit({ userId, amount, description, reference }){
        const wallet = await this.getOrCreate(userId);
        if(amount <= 0){
            throw new Error("Amount must be greater than zero.");
        }
        if(wallet.balance < amount){
            throw new Error("Insufficient wallet balance.")
        };
        wallet.balance -= amount;
        wallet.totalSpent += amount;
        wallet.transactions.push({
            type: 'debit',
            amount,
            description,
            reference,
            balanceAfter: wallet.balance
        })
        await wallet.save();
        return wallet;
    },

    // Earned 1 points per ₹10 spent
    async addLoyaltyPoints({ userId, orderAmount }){
        if(orderAmount <= 0){
            throw new Error("Invalid order amount.");
        }
        const points = Math.floor(orderAmount/10);
        if(points <= 0){
            return;
        }
        const wallet = await this.getOrCreate(userId);
        wallet.loyaltyPoints += points;
        await wallet.save();
        return { pointsEarned: points, totalPoints: wallet.loyaltyPoints };
    },

    async redeemPoints({ userId, points }){
        const wallet = await this.getOrCreate(userId);
        if(points <= 0){
            throw new Error("Points must be greater than zero.");
        }
        if(wallet.loyaltyPoints < points){
            throw new Error("Insuffcient loyalty points.");
        }
        const amount = points;
        wallet.loyaltyPoints -= points;
        wallet.balance += amount;
        wallet.totalEarned += amount;
        wallet.transactions.push({
            type: 'credit',
            amount,
            description: `Redeemed ${points} loyalty points.`,
            reference: 'LOYALTY_REDEMPTION',
            balanceAfter: wallet.balance,
        })
        await wallet.save();
        return { redeemedPoints: points, amountCredited: amount, wallet};
    }

}

export default walletService;
export type Payment = {
    id: number;
    amount: number;
    currency: string;
    userId: number;
    type: string; // 'stripe'
    thirdPartyPaymentId?: string;
    createAt: Date;
    updateAt: Date;
    status: string; // 'success' | 'failed' | 'pending' | 'canceled'
}

export type CreatePaymentSchema = {
    amount: number;
    currency: string;
    userId: number;
    type: string;
    status: string;
}

export type CreateStripePaymentSessionSchema = {
    paymentId: number;
    amount: number;
    currency: string;
}

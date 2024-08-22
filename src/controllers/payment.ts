import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { verifyToken } from '../utils/auth';
import { Response, Request } from 'express';
import { UNAUTHORIZED } from '../const/user';
import { createStripePaymentSession } from '../utils/stripe';
import { PaymentServices } from '../services/payment';
import { CreatePaymentSchema } from '../schemas/payment';
import { CREATE_PAYMENT_ERROR, CREATE_PAYMENT_REQUIRE, PAYMENT_NOT_FOUND, STRIPE_PAYMENT_CALLBACK_REQUIRE } from '../const/payment';
import { JwtPayload } from 'jsonwebtoken';

@Controller("payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentServices) { }

    @Get()
    async getUserAllPaymentRecords(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });
            return;
        }

        const token = request.cookies.token;
        const payload: JwtPayload | void = await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });

        if (typeof payload !== "object" || !(typeof payload.aud === 'string')) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }
        const data = await this.paymentService.getPaymentRecordByUserId(parseInt(payload.aud));

        response.status(HttpStatus.OK).json(data);
    }

    @Get(":id")
    async getUserPaymentRecord(@Param('id') id: string, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });
            return;
        }

        const token = request.cookies.token;
        const payload: JwtPayload | void = await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });

        if (typeof payload !== "object" || !(typeof payload.aud === 'string')) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }
        const data = await this.paymentService.getPaymentRecordByUserIdByPaymentId(parseInt(payload.aud), parseInt(id)).catch((err) => {
            console.log(err);
            response.status(HttpStatus.NOT_FOUND).json({
                message: PAYMENT_NOT_FOUND
            });
            return;
        });

        response.status(HttpStatus.OK).json(data);
    }

    @Post()
    async createPayment(@Body() data: CreatePaymentSchema, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });
            return;
        }

        const token = request.cookies.token;
        const payload: JwtPayload | void = await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });
        
        if (!data.amount || !data.currency || !data.userId || !data.type || !data.status) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: CREATE_PAYMENT_REQUIRE
            });
            return;
        }
        
        if (typeof payload !== "object" || !(typeof payload.aud === 'string')) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }
        if (data.userId !== parseInt(payload.aud)) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }

        const payment = await this.paymentService.createPayment(data);
        const paymentId = (payment as any).insertId;
        if (!paymentId) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: CREATE_PAYMENT_ERROR
            });
            return;
        }

        await createStripePaymentSession({
            paymentId: paymentId,
            amount: data.amount,
            currency: data.currency
        });
    }

    @Get("stripe/callback/:paymentId/:sessionId")
    async stripeCallback(@Param('paymentId') paymentId: string, @Req() request: Request, @Res({ passthrough: true }) response: Response, @Param('sessionId') sessionId?: string) {
        const referer = request.headers.referer;
        if (!referer || !referer.includes('https://checkout.stripe.com/')) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }
        
        if (!paymentId) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: STRIPE_PAYMENT_CALLBACK_REQUIRE
            });
            return;
        }

        const payment = await this.paymentService.getPaymentRecordByPaymentId(parseInt(paymentId)).catch((err) => {
            console.log(err);
            response.status(HttpStatus.NOT_FOUND).json({
                message: PAYMENT_NOT_FOUND
            });
            return;
        });
        if (!payment) {
            response.status(HttpStatus.NOT_FOUND).json({
                message: PAYMENT_NOT_FOUND
            });
            return;
        }

        if (!sessionId) {
            await this.paymentService.updatePaymentStatus(parseInt(paymentId), "canceled");

            response.redirect("https://backend-api.skyproton.org/api");
            return;
        }

        await this.paymentService.updatePaymentStatus(parseInt(paymentId), "success", sessionId);
        
        response.redirect("https://backend-api.skyproton.org/api");
    }
}

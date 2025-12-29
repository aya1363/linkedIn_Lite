import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class paymentService {
    private stripe: Stripe
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET as string)

    }
    async checkSession() {
        const session = await this.stripe.checkout.sessions.create({
        //    customer_email,
        //    cancel_url,
        ////    success_url,
        //    metadata,
        //    discounts,
        //    mode,
        //    line_items

        })
    }

}
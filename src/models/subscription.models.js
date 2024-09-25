import mongoose, { Schema, SchemaType } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        // one who is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        // one to whom subscriber is subcribing
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{ timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

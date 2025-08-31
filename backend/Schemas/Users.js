// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { 
        type: String, 
        required:true,
        unique: true,
    },
    password:{
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    isGoogleUser: {
        type: Boolean,
    },
    provider: { 
        type: String, 
        enum: ["google", "credentials"], 
        required: true, index: true 
    },
    plan: { 
        type: String, 
        enum: ["free", "pro"], 
        default: "free" 
    },
    credits: { 
        type: Number, 
        default: 0 
    },            
    monthlyCredits: { 
        type: Number, 
        default: 0 
    },     
    billingCycleStart: { 
        type: Date 
    },               
    nextResetAt: { 
        type: Date 
    }, 
    conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation", index: true }],
    lastChatAt: { type: Date },
    chatCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  users: string[];
  latestMessage?: {
    text: string;
    sender: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    users: {
      type: [String],
      required: true,
    },
    latestMessage: {
      text: String,
      sender: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);

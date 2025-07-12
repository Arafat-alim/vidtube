import mongoose, { Schema } from "mongoose";
import aggregatePaginate from ("mongoose-aggregate-paginate-v2");
const videoSchema = new Schema(
  {
    videoFile: { type: String, required: true },
    thumbnail: { type: String, required: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    duration: { type: number, required: true },
    views: { type: number, required: true },
    isPublished: { type: boolean, default: true },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

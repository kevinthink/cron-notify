import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const timeRecordSchema = new Schema({
  recordedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

type TimeRecordDocument = InferSchemaType<typeof timeRecordSchema>;

// Reuse the compiled model across hot reloads in dev.
export const TimeRecord =
  (models.TimeRecord as Model<TimeRecordDocument> | undefined) ??
  model<TimeRecordDocument>("TimeRecord", timeRecordSchema);


import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISetting extends Document {
    key: string;
    value: any;
    description?: string;
}

const SettingSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String }
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production' && mongoose.models.Setting) {
    delete mongoose.models.Setting;
}

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;

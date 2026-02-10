
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGuru extends Document {
    nipy: string;
    nama: string;
    ket: string;
    password: string;
}

const GuruSchema: Schema = new Schema({
    nipy: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    ket: { type: String },
    password: { type: String, required: true },
});

const Guru: Model<IGuru> = mongoose.models.Guru || mongoose.model<IGuru>('Guru', GuruSchema);

export default Guru;

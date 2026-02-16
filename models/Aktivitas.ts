
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAktivitas extends Document {
    nis: string;
    tipe: 'status' | 'biodata' | 'jurnal' | 'qna';
    aksi: string; // Detail aksi, e.g. status text atau "Update Profile"
    createdAt: Date;
    updatedAt: Date;
}

const AktivitasSchema: Schema = new Schema({
    nis: { type: String, required: true },
    tipe: { type: String, enum: ['status', 'biodata', 'jurnal', 'qna'], required: true },
    aksi: { type: String, required: true },
}, { timestamps: true, collection: 'aktivitas_logs' });

// Index for faster querying
AktivitasSchema.index({ nis: 1, createdAt: -1 });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Aktivitas;
}

const Aktivitas: Model<IAktivitas> = mongoose.models.Aktivitas || mongoose.model<IAktivitas>('Aktivitas', AktivitasSchema);

export default Aktivitas;

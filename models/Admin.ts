
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdmin extends Document {
    username: string;
    nama: string;
    password: string;
    foto?: string;
    noHp?: string;
    emailPribadi?: string;
    status?: string;
    statusUpdatedAt?: Date;
}

const AdminSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    password: { type: String, required: true },
    foto: { type: String, default: '' },
    noHp: { type: String, default: '' },
    emailPribadi: { type: String, default: '' },
    status: { type: String, default: '' },
    statusUpdatedAt: { type: Date }
});

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;

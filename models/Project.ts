import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  category: string;
  image: string;
  link: string;
  stats: { likes: string; views: string };
  featured: boolean;
  order: number;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  stats: {
    likes: { type: String, default: '0' },
    views: { type: String, default: '0' },
  },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Project || model<IProject>('Project', ProjectSchema);

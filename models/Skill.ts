import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISkill extends Document {
  categoryTitle: string;
  icon: string;
  skills: string[];
  order: number;
}

const SkillSchema = new Schema<ISkill>({
  categoryTitle: { type: String, required: true },
  icon: { type: String, required: true },
  skills: [{ type: String }],
  order: { type: Number, default: 0 },
});

export default models.Skill || model<ISkill>('Skill', SkillSchema);

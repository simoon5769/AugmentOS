// cloud/server/src/models/app.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { AppI as _AppI, TpaType, ToolSchema, ToolParameterSchema } from '@augmentos/sdk';

export type AppStoreStatus = 'DEVELOPMENT' | 'SUBMITTED' | 'REJECTED' | 'PUBLISHED';



// Extend the AppI interface for our MongoDB document
export interface AppI extends _AppI, Document {
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  hashedApiKey: string;
  hashedEndpointSecret?: string;
  appStoreStatus: AppStoreStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  tools?: ToolSchema[];
}

// Using existing schema with flexible access
const AppSchema = new Schema({

  // Type of app "background" | "standard" | "system_dashboard". "background by default"
  tpaType: {
    type: String,
    enum: Object.values(TpaType),
    default: TpaType.BACKGROUND
  },

  // Appstore / Developer properties
  appStoreStatus: {
    type: String,
    enum: ['DEVELOPMENT', 'SUBMITTED', 'REJECTED', 'PUBLISHED'],
    default: 'DEVELOPMENT'
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  
  // TPA AI Tools
  tools: [{
    id: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    activationPhrases: {
      type: [String],
      required: false
    },
    parameters: {
      type: Map,
      of: new Schema({
        type: {
          type: String,
          enum: ['string', 'number', 'boolean'],
          required: true
        },
        description: {
          type: String,
          required: true
        },
        enum: {
          type: [String],
          required: false
        },
        required: {
          type: Boolean,
          default: false
        }
      }),
      required: false
    }
  }]
}, { 
  strict: false,
  timestamps: true 
});

export default mongoose.model<AppI>('App', AppSchema, 'apps');
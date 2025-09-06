import mongoose, { Schema } from 'mongoose';

// Enhanced PartialDate interface with more flexibility
export interface PartialDate {
  year?: number;
  month?: number;
  day?: number;
  approximate?: boolean;
  range?: {
    from?: string;
    to?: string;
  };
  notes?: string;
}

// Social Media Links interface for future features
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

// Photo interface for future features
export interface Photo {
  url: string;
  caption?: string;
  uploadedAt: Date;
  isProfilePhoto?: boolean;
}

// Enhanced Person interface with future features
export interface IPerson {
  _id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  dob?: PartialDate;
  birthPlace?: string;
  deathDate?: PartialDate;
  deathPlace?: string;
  phone?: string;
  email?: string; // Future feature
  photos?: Photo[]; // Future feature
  socialMedia?: SocialMediaLinks; // Future feature
  occupation?: string; // Future feature
  education?: string; // Future feature
  notes?: string; // Additional notes
  isLiving?: boolean; // Computed field based on deathDate
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Marriage interface with future features
export interface IMarriage {
  _id: string;
  spouses: [string, string]; // Person IDs
  date?: PartialDate;
  place?: string;
  status?: 'married' | 'divorced' | 'widowed';
  children?: string[]; // Person IDs
  photos?: Photo[]; // Wedding photos - future feature
  anniversary?: PartialDate; // Different from marriage date - future feature
  officiant?: string; // Who performed the ceremony - future feature
  witnesses?: string[]; // Witness Person IDs - future feature
  notes?: string; // Additional notes about the marriage
  createdAt: Date;
  updatedAt: Date;
}

// PartialDate schema
const PartialDateSchema = new Schema<PartialDate>({
  year: { type: Number, min: 1000, max: 9999 },
  month: { type: Number, min: 1, max: 12 },
  day: { type: Number, min: 1, max: 31 },
  approximate: { type: Boolean, default: false },
  range: {
    from: String,
    to: String
  },
  notes: String
}, { _id: false });

// Social Media schema for future features
const SocialMediaSchema = new Schema<SocialMediaLinks>({
  facebook: { type: String, match: /^https?:\/\/(www\.)?facebook\.com\/.+/ },
  twitter: { type: String, match: /^https?:\/\/(www\.)?twitter\.com\/.+/ },
  instagram: { type: String, match: /^https?:\/\/(www\.)?instagram\.com\/.+/ },
  linkedin: { type: String, match: /^https?:\/\/(www\.)?linkedin\.com\/.+/ },
  youtube: { type: String, match: /^https?:\/\/(www\.)?youtube\.com\/.+/ },
  tiktok: { type: String, match: /^https?:\/\/(www\.)?tiktok\.com\/.+/ },
  website: { type: String, match: /^https?:\/\/.+/ }
}, { _id: false });

// Photo schema for future features
const PhotoSchema = new Schema<Photo>({
  url: { 
    type: String, 
    required: true, 
    match: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i 
  },
  caption: String,
  uploadedAt: { type: Date, default: Date.now },
  isProfilePhoto: { type: Boolean, default: false }
}, { _id: false });

// Person Schema with enhanced features
const PersonSchema = new Schema<IPerson>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  dob: PartialDateSchema,
  birthPlace: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  deathDate: PartialDateSchema,
  deathPlace: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  phone: { 
    type: String, 
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/ // Basic international phone validation
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  photos: [PhotoSchema],
  socialMedia: SocialMediaSchema,
  occupation: { 
    type: String, 
    trim: true,
    maxlength: 200
  },
  education: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  notes: { 
    type: String, 
    trim: true,
    maxlength: 2000
  },
  isLiving: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret: Record<string, unknown>) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Marriage Schema with enhanced features
const MarriageSchema = new Schema<IMarriage>({
  spouses: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v.length === 2 && v[0] !== v[1];
      },
      message: 'Marriage must have exactly 2 different spouses'
    }
  },
  date: PartialDateSchema,
  place: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  status: { 
    type: String, 
    enum: ['married', 'divorced', 'widowed'],
    lowercase: true,
    default: 'married'
  },
  children: [{
    type: String,
    ref: 'Person'
  }],
  photos: [PhotoSchema],
  anniversary: PartialDateSchema,
  officiant: { 
    type: String, 
    trim: true,
    maxlength: 200
  },
  witnesses: [{
    type: String,
    ref: 'Person'
  }],
  notes: { 
    type: String, 
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret: Record<string, unknown>) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
PersonSchema.index({ name: 1 });
PersonSchema.index({ 'dob.year': 1 });
PersonSchema.index({ birthPlace: 1 });
PersonSchema.index({ phone: 1 });
PersonSchema.index({ email: 1 });
PersonSchema.index({ isLiving: 1 });
PersonSchema.index({ createdAt: -1 });

MarriageSchema.index({ spouses: 1 });
MarriageSchema.index({ children: 1 });
MarriageSchema.index({ 'date.year': 1 });
MarriageSchema.index({ place: 1 });
MarriageSchema.index({ status: 1 });
MarriageSchema.index({ createdAt: -1 });

// Pre-save middleware to update isLiving based on deathDate
PersonSchema.pre('save', function(next) {
  if (this.deathDate && (this.deathDate.year || this.deathDate.range)) {
    this.isLiving = false;
  } else {
    this.isLiving = true;
  }
  next();
});

// Virtual for person's age (approximate)
PersonSchema.virtual('age').get(function() {
  if (!this.dob?.year) return null;
  
  const currentYear = new Date().getFullYear();
  const deathYear = this.deathDate?.year || currentYear;
  
  return deathYear - this.dob.year;
});

// Virtual for marriage duration
MarriageSchema.virtual('duration').get(function() {
  if (!this.date?.year) return null;
  
  const startYear = this.date.year;
  const currentYear = new Date().getFullYear();
  
  return currentYear - startYear;
});

// Create models (avoid recompilation in development)
const Person = mongoose.models.Person || mongoose.model<IPerson>('Person', PersonSchema);
const Marriage = mongoose.models.Marriage || mongoose.model<IMarriage>('Marriage', MarriageSchema);

export { Marriage, Person };


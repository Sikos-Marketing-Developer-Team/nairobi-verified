const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    openingHours: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    logo: {
      url: String,
      publicId: String,
    },
    coverImage: {
      url: String,
      publicId: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorSubscription",
    },
    features: {
      isFeatured: {
        type: Boolean,
        default: false,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      isPremium: {
        type: Boolean,
        default: false,
      },
    },
    settings: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        showContactInfo: {
          type: Boolean,
          default: true,
        },
        showLocation: {
          type: Boolean,
          default: true,
        },
      },
    },
    metadata: {
      lastActive: Date,
      lastLogin: Date,
      totalProducts: {
        type: Number,
        default: 0,
      },
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
businessSchema.index({ name: "text", description: "text" });
businessSchema.index({ location: "2dsphere" });
businessSchema.index({ category: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ "features.isFeatured": 1 });
businessSchema.index({ "features.isVerified": 1 });
businessSchema.index({ rating: -1 });

// Virtuals
businessSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "businessId",
});

businessSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "businessId",
});

// Methods
businessSchema.methods.toJSON = function () {
  const business = this.toObject();
  delete business.__v;
  return business;
};

const Business = mongoose.model("Business", businessSchema);

module.exports = Business; 
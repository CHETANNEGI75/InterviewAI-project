import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,

  answer: String,
  feedback: String,

  score: { type: Number, default: 0 },

  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },

  // 🔥 NEW: mistake tracking
  mistakes: {
    type: [String],
    default: []
  }
});


const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    required: true
  },

  experience: {
    type: String,
    required: true
  },

  // 🔥 UPDATED modes (expand kar diye)
  mode: {
    type: String,
    enum: ["HR", "Technical", "friendly", "strict", "technical"],
    required: true
  },

  resumeText: {
    type: String
  },

  questions: [questionsSchema],

  finalScore: { type: Number, default: 0 },

  // 🔥 NEW: global mistake memory (power move)
  overallMistakes: {
    type: [String],
    default: []
  },

  status: {
    type: String,
    enum: ["Incompleted", "completed"],
    default: "Incompleted",
  }

}, { timestamps: true });


const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
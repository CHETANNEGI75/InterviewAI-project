import fs from 'fs';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../model/userModel.js";
import Interview from "../model/interview.model.js";


// ================== 🔥 NEW HELPERS ==================

// 🎭 Personality Mode
const getPersonalityPrompt = (mode) => {
  if (mode === "strict") {
    return `
You are a strict and serious interviewer.
You challenge weak answers and expect precise responses.
Tone should be slightly tough and critical.
`;
  }

  if (mode === "friendly") {
    return `
You are a friendly and supportive interviewer.
Encourage the candidate and keep tone warm and polite.
`;
  }

  if (mode === "technical") {
    return `
You are a deep technical interviewer.
Ask precise, concept-heavy and challenging questions.
`;
  }

  return `You are a professional interviewer.`;
};


// 🔁 Follow-up generator
const generateFollowUpPrompt = (question, answer) => {
  return `
You are a real interviewer.

Based on the candidate's answer, ask ONE natural follow-up question.

Question: ${question}
Answer: ${answer}

Rules:
- Ask only ONE follow-up question
- Keep it conversational
- Do not explain anything
`;
};
export const getInterviewReport = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.json({
      finalScore: interview.finalScore,
      questions: interview.questions
    });

  } catch (error) {
    return res.status(500).json({ message: "Error fetching report" });
  }
};




// ================== RESUME ANALYSIS ==================
export const analyzeResume = async (req,res)=>{
    try {
      console.log("<><><><>><><>",req?.cookies)
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"})
        }

        const filePath = req.file.path;
        const filebuffer = await fs.promises.readFile(filePath);
        const uint8array = new Uint8Array(filebuffer);

        const pdf = await pdfjsLib.getDocument({
          data: uint8array,
          standardFontDataUrl: "./node_modules/pdfjs-dist/standard_fonts/",
          useWorkerFetch: false,
          isEvalSupported: false
        }).promise;

        let resumeText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          resumeText += pageText + '\n';
        }

        resumeText = resumeText.replace(/\s+/g, ' ').trim();

        const messages = [
          {
            role: "system",
            content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
          },
          {
            role: "user",
            content: resumeText
          }
        ];

        const AIresponse = await askAi(messages);
        const parsed = JSON.parse(AIresponse);

        fs.unlinkSync(filePath)

        res.json({
          role: parsed.role,
          experience: parsed.experience,
          projects: parsed.projects,
          skills: parsed.skills,
          resumeText
        });

    } catch (error) {
        console.error(error);

        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ message: error.message });
    }
}




// ================== GENERATE QUESTIONS ==================
export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role:${role}
Experience:${experience}
InterviewMode:${mode}
Projects:${projectText}
Skills:${skillsText}
Resume:${safeResume}
`;

    const messages = [
      {
        role: "system",
        content: `
${getPersonalityPrompt(mode)}

You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience, interviewMode, projects, skills, and resume details.
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse = await askAi(messages)

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      }))
    })

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });

  } catch (error) {
    return res.status(500).json({message:`failed to create interview ${error}`})
  }
}



// ================== SUBMIT ANSWER ==================
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";
      await interview.save();

      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded.";
      question.answer = answer;
      await interview.save();

      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional interviewer.

Evaluate answer and return JSON:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short feedback",
  "mistakes": ["mistake1","mistake2"]
}
`
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];

    const aiResponse = await askAi(messages)
   let parsed;

try {
  parsed = JSON.parse(aiResponse);
} catch (err) {
  console.log("❌ AI RAW RESPONSE:", aiResponse);

  return res.status(500).json({
    message: "AI response parsing failed"
  });
}console.log("AI RESPONSE:", aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    question.mistakes = parsed.mistakes || [];

    await interview.save();

    // 🔁 Follow-up question
    const followUp = await askAi([
      {
        role: "system",
        content: "You are a real interviewer."
      },
      {
        role: "user",
        content: generateFollowUpPrompt(question.question, answer)
      }
    ]);

    return res.status(200).json({
      feedback: parsed.feedback,
      followUp
    });

  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})
  }
}

export const getMyInterviews = async (req, res) => {
  try {
    const userId = req.userId;

    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 });

    res.json(interviews);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};



// ================== REST SAME ==================
export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await Interview.findById(interviewId)

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const totalQuestions = interview.questions.length;

    const finalScore = totalScore / totalQuestions;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1))
    })

  } catch (error) {
    return res.status(500).json({message:`failed ${error}`})
  }
}
import fs from 'fs';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { askAi } from '../services/openRouter.service.js';
export const analyzeResume = async (req,res)=>{
    try {
        //if no file is uploaded
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"})
        }
        const filePath = req.file.path;
        //read the filebuffer
        const filebuffer = await fs.promises.readFile(filePath);
        const uint8array = new Uint8Array(filebuffer);
       const pdf = await pdfjsLib.getDocument({
  data: uint8array,
  standardFontDataUrl: "./node_modules/pdfjs-dist/standard_fonts/",
  useWorkerFetch: false,
  isEvalSupported: false
}).promise;
        // data ko text me convert krna
        let resumeText = '';
        // har page ke liye text extract krna
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);// page ke text content ko extract krna
        const content = await page.getTextContent();// har item ke text ko join krna
        const pageText = content.items.map(item => item.str).join(' ');// page ke text ko resumeText me add krna
        resumeText += pageText + '\n';
        }
      // Extra spaces ko remove krna
      resumeText= resumeText.replace(/\s+/g, ' ').trim(); // Extra spaces ko remove krna

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
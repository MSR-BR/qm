import { handleQmChapterQuiz } from '../lib/qm-chapter-quiz-handler.mjs';
export default async function handler(req,res){const r=await handleQmChapterQuiz({method:req.method,headers:req.headers,body:req.body,query:req.query,env:process.env});return res.status(r.status).json(r.body);}

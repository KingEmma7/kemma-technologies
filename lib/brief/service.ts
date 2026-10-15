import { sessionSchema, fileSpec, validateAnswers } from "./schema";
import { BriefError, signCapability, verifyCapability, publicBase, r2StorageConfig, storageMode, type FileSpec, type Session, type Upload } from "./config";
import { Conflict, digest, readDocument, writeDocument, fileHead } from "./storage";
import { sendNotification } from "./email";

export type Submission = { id:string; reference:string; schemaVersion:2; savedAt:string; answers:Record<string,unknown>; products:Record<string,unknown>[]; files:FileSpec[]; hash:string; reviewToken:string; baseUrl:string };
type Allocation = {createdAt:string;files:FileSpec[]};
export const recordPath=(id:string)=>`briefs/${id}/submission.json`;
export const allocationPath=(id:string)=>`briefs/${id}/allocation.json`;
function canonical(value:unknown):string {if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";if(value&&typeof value==="object")return "{"+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}";return JSON.stringify(value)}
export async function beginSession(body:unknown){
  storageMode();const parsed=sessionSchema.safeParse(body);if(!parsed.success)throw new BriefError("Check the selected files and reopen your project link.");
  const invite=verifyCapability(parsed.data.invite,"invite");
  const files=parsed.data.files.map(f=>fileSpec(f,invite.id));
  if(new Set(files.map(f=>f.id)).size!==files.length)throw new BriefError("A file was listed twice.");
  if(parsed.data.checkpoint)validateAnswers(parsed.data.checkpoint.answers,parsed.data.checkpoint.products,files);
  const finalized=await readDocument<Submission>(recordPath(invite.id));
  for(let attempt=0;attempt<5;attempt++){
    const old=await readDocument<Allocation>(allocationPath(invite.id));
    const allocated=[...(old?.value.files||[])];
    for(const f of files){const prior=allocated.find(x=>x.id===f.id);if(prior){if(canonical(prior)!==canonical(f))throw new BriefError("A saved file has changed. Add it as a new file.",409)}else{if(finalized)throw new BriefError("This brief has already been sent. Contact Kemma to add anything else.",409);allocated.push(f)}}
    if(!old||allocated.length!==old.value.files.length){try{await writeDocument(allocationPath(invite.id),{createdAt:old?.value.createdAt||new Date().toISOString(),files:allocated},old?.etag??null)}catch(e){if(e instanceof Conflict)continue;throw e}}
    const session:Session={kind:"session",id:invite.id,exp:Math.min(invite.exp,Date.now()+30*60*1000),files};
    // Preserve the first send's answers independently of file reads/transfers. Never
    // replace this recovery record with an older tab's answers or call it a submission.
    let answersBackedUp=false;
    if(parsed.data.checkpoint){
      const path=`briefs/${invite.id}/answers-checkpoint.json`;
      if(!await readDocument(path)){
        try{await writeDocument(path,{schemaVersion:2,savedAt:new Date().toISOString(),...parsed.data.checkpoint,files},null)}catch(error){if(!(error instanceof Conflict))throw error}
      }
      answersBackedUp=true;
    }
    const uploaded=await Promise.all(files.map(async f=>{const existing=await fileHead(f.pathname);return {...f,uploadToken:signCapability({kind:"upload",id:invite.id,exp:session.exp,fileId:f.id}),uploaded:!!existing&&existing.size===f.size&&(storageMode()==="local"||existing.type.split(";")[0]===f.type)}}));
    const mode=storageMode();
    return {submissionId:invite.id,sessionToken:signCapability(session),uploadMode:mode,answersBackedUp,...(mode==="r2"?{uploadUrl:r2StorageConfig().url+"/v1/upload"}:{}),files:uploaded,preview:mode==="local"};
  }
  throw new BriefError("Another save is in progress. Please try again.",409);
}
export async function getSubmission(id:string){return (await readDocument<Submission>(recordPath(id)))?.value||null}
/** Resolve immutable file metadata from storage; upload headers contain no manifest. */
export async function authorizedUploadFile(token:string,fileId:string|null){
  let capability:Upload|Session;
  try{capability=verifyCapability(token,"upload")}catch(error){if(!(error instanceof BriefError)||error.status!==401)throw error;capability=verifyCapability(token,"session")}
  const allocation=await readDocument<Allocation>(allocationPath(capability.id));
  const file=allocation?.value.files.find(candidate=>candidate.id===fileId);
  if(!file||(capability.kind==="upload"?capability.fileId!==fileId:!capability.files.some(candidate=>canonical(candidate)===canonical(file))))throw new BriefError("This file is not part of your project.",403);
  return {projectId:capability.id,file};
}
export async function acceptSubmission(sessionToken:string,answers:Record<string,unknown>,products:Record<string,unknown>[],request:Request){
  const session=verifyCapability(sessionToken,"session");validateAnswers(answers,products,session.files);
  const allocation=await readDocument<Allocation>(allocationPath(session.id));
  if(!allocation||session.files.some(f=>!allocation.value.files.some(x=>canonical(x)===canonical(f))))throw new BriefError("Reopen your project link and try sending again.",401);
  const hash=digest(canonical({schemaVersion:2,answers,products,files:session.files}));
  let record=await getSubmission(session.id);
  if(record&&record.hash!==hash)throw new BriefError("This brief is already saved. Contact Kemma to make changes.",409);
  if(!record){
    for(const f of session.files){const h=await fileHead(f.pathname);if(!h||h.size!==f.size||(storageMode()==="r2"&&h.type.split(";")[0]!==f.type))throw new BriefError(`The upload for ${f.name} is incomplete. Please try sending again.`,409)}
    const candidate:Submission={id:session.id,reference:`KEM-${session.id.slice(0,8).toUpperCase()}`,schemaVersion:2,savedAt:new Date().toISOString(),answers,products,files:session.files,hash,reviewToken:signCapability({kind:"review",id:session.id,exp:Date.now()+365*24*60*60*1000}),baseUrl:publicBase(request)};
    try{await writeDocument(recordPath(session.id),candidate,null);record=candidate}catch(e){if(!(e instanceof Conflict))throw e;record=await getSubmission(session.id);if(!record||record.hash!==hash)throw new BriefError("This brief was already saved with different answers.",409)}
  }
  // A notification failure never removes the accepted submission.
  let notification:"sent"|"pending"|"preview"="pending";
  try{notification=await sendNotification(record)}catch{console.warn("[brief] Saved submission notification is pending.")}
  return {ok:true,reference:record.reference,notification,preview:storageMode()==="local"};
}

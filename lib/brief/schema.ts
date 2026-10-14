import { z } from "zod";
import { BriefError, type FileSpec } from "./config";

export const MAX_FILES = 60, MAX_FILE_BYTES = 25 * 1024 * 1024, MAX_TOTAL_BYTES = 150 * 1024 * 1024;
const types: Record<string, string> = { jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",heic:"image/heic",svg:"image/svg+xml",pdf:"application/pdf",mp4:"video/mp4",mov:"video/quicktime",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",csv:"text/csv",txt:"text/plain",zip:"application/zip",ai:"application/postscript",eps:"application/postscript" };
export const fileSchema = z.object({
  id: z.uuid(), name: z.string().trim().min(1).max(180), type: z.string().max(150), size: z.number().int().positive().max(MAX_FILE_BYTES),
  scope: z.string().regex(/^(logo|brand|catalogue|policies|product:[0-9a-f-]{36}|paid:[0-9a-f-]{36})$/),
  role: z.enum(["Additional file", "Main product photo", "Private paid download"]),
}).strict();
export const sessionSchema = z.object({invite:z.string().min(1).max(2000),files:z.array(fileSchema).max(MAX_FILES)}).strict();
export function fileSpec(value: z.infer<typeof fileSchema>, id: string): FileSpec {
  const ext = value.name.toLowerCase().split(".").pop() || "";
  if (!types[ext]) throw new BriefError("Use an image, document or video file.");
  const safeName = value.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/^\.+/, "").slice(0,180) || `file.${ext}`;
  return {...value, type:types[ext], pathname:`briefs/${id}/files/${value.id}/${safeName}`};
}
function safeJson(value: unknown, depth=0): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= 40_000;
  if (Array.isArray(value)) return value.length <= 100 && value.every(v=>safeJson(v,depth+1));
  if (value && typeof value === "object") {const entries=Object.entries(value);return entries.length<=120 && entries.every(([k,v])=>k.length<=100 && !["__proto__","prototype","constructor"].includes(k) && safeJson(v,depth+1));}
  return false;
}
export const submitSchema = z.object({sessionToken:z.string().min(1).max(48_000),schemaVersion:z.literal(2),answers:z.record(z.string(),z.unknown()),products:z.array(z.record(z.string(),z.unknown())).max(60)}).strict();
export function validateAnswers(answers: Record<string,unknown>, products: Record<string,unknown>[], files: FileSpec[]) {
  if (!safeJson(answers) || !safeJson(products)) throw new BriefError("Some answers are too long. Shorten them or upload a document.");
  if (typeof answers.businessName!=="string" || !answers.businessName.trim() || answers.businessName.length>200) throw new BriefError("Add your business name.");
  if (!z.email().max(254).safeParse(answers.email).success) throw new BriefError("Add a valid email address.");
  if (files.length && answers.permission !== true) throw new BriefError("Confirm permission to use your files before sending.");
  const ids=new Set<string>();
  for(const p of products) {if(typeof p.id!=="string" || !z.uuid().safeParse(p.id).success || ids.has(p.id) || typeof p.name!=="string" || !p.name.trim() || p.name.length>200) throw new BriefError("Give each product a name.");ids.add(p.id);}
  for(const f of files) if((f.scope.startsWith("product:")||f.scope.startsWith("paid:"))&&!ids.has(f.scope.split(":")[1])) throw new BriefError("A file is missing its product. Go back and check your products.");
}
export async function readJson(request: Request, limit=512*1024): Promise<unknown> {
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))throw new BriefError("Use JSON content.",415);
  const reader=request.body?.getReader();if(!reader)throw new BriefError("Empty request.");let size=0;const chunks:Uint8Array[]=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new BriefError("Request too large.",413)}chunks.push(value)}
  try{return JSON.parse(Buffer.concat(chunks).toString())}catch{throw new BriefError("Invalid request.")}
}
export function assertSameOrigin(request: Request) {
  const origin=request.headers.get("origin");
  const internal=new URL(request.url);
  let supplied:URL;try{supplied=new URL(origin||"")}catch{throw new BriefError("Open the form on Kemma’s website.",403)}
  const canonical=new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://www.kemmatechnologies.com").origin;
  const localAlias=process.env.BRIEF_STORAGE_MODE==="local"&&!process.env.VERCEL&&process.env.NODE_ENV!=="production"&&["localhost","127.0.0.1"].includes(supplied.hostname)&&["localhost","127.0.0.1"].includes(internal.hostname)&&supplied.protocol===internal.protocol&&supplied.port===internal.port;
  if(!origin || (!localAlias&&origin!==internal.origin&&origin!==canonical))throw new BriefError("Open the form on Kemma’s website.",403);
}

import { verifyCapability, BriefError } from "@/lib/brief/config";
import { getSubmission } from "@/lib/brief/service";
import { downloadUrl } from "@/lib/brief/email";
import { privateHeaders, briefFailure } from "@/lib/brief/http";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){try{
  const {id}=await context.params;const capability=verifyCapability(new URL(request.url).searchParams.get("key")||"","review");if(capability.id!==id)throw new BriefError("Not found.",404);
  const record=await getSubmission(id);if(!record)throw new BriefError("Not found.",404);
  const value={reference:record.reference,savedAt:record.savedAt,answers:record.answers,products:record.products,files:record.files.map(f=>({...f,downloadUrl:downloadUrl(record,f.id)}))};
  return new Response(JSON.stringify(value,null,2),{headers:{...privateHeaders,"Content-Type":"application/json","Content-Disposition":`attachment; filename="${record.reference}-brief.json"`}});
}catch(e){return briefFailure(e)}}

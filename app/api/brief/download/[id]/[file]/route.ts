import { verifyCapability, BriefError } from "@/lib/brief/config";
import { getSubmission } from "@/lib/brief/service";
import { fileStream } from "@/lib/brief/storage";
import { privateHeaders, briefFailure } from "@/lib/brief/http";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{id:string;file:string}>}){try{
  const {id,file}=await context.params;const capability=verifyCapability(new URL(request.url).searchParams.get("key")||"","review");
  if(capability.id!==id)throw new BriefError("Not found.",404);
  const record=await getSubmission(id),metadata=record?.files.find(f=>f.id===file);if(!metadata)throw new BriefError("Not found.",404);
  const stream=await fileStream(metadata.pathname);if(!stream)throw new BriefError("File temporarily unavailable.",503);
  return new Response(stream,{headers:{...privateHeaders,"Content-Type":"application/octet-stream","Content-Disposition":`attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(metadata.name).replace(/'/g,"%27")}`,"Content-Length":String(metadata.size)}});
}catch(e){return briefFailure(e)}}

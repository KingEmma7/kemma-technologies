import { verifyCapability, BriefError, storageMode } from "@/lib/brief/config";
import { getSubmission } from "@/lib/brief/service";
import { buildEmail } from "@/lib/brief/email";
import { privateHeaders, briefFailure } from "@/lib/brief/http";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){try{
  if(storageMode()!=="local")throw new BriefError("Not found.",404);
  const {id}=await context.params;const capability=verifyCapability(new URL(request.url).searchParams.get("key")||"","review");if(capability.id!==id)throw new BriefError("Not found.",404);
  const record=await getSubmission(id);if(!record)throw new BriefError("Not found.",404);const preview=buildEmail(record);
  return new Response(`<html><head><title>Notification preview</title></head><body style="font:15px Arial;max-width:900px;margin:40px auto;padding:0 24px"><p>Current notification template · Local preview · No email sent</p>${preview.html}</body></html>`,{headers:{...privateHeaders,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"}});
}catch(e){return briefFailure(e)}}

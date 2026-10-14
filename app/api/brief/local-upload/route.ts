import { assertSameOrigin } from "@/lib/brief/schema";
import { BriefError, storageMode } from "@/lib/brief/config";
import { Conflict, fileHead, writeBytes } from "@/lib/brief/storage";
import { authorizedUploadFile, getSubmission } from "@/lib/brief/service";
import { briefFailure, briefResponse } from "@/lib/brief/http";
export const runtime="nodejs";
export async function POST(request:Request){try{
  assertSameOrigin(request);if(storageMode()!=="local")throw new BriefError("Not found.",404);
  const {projectId,file}=await authorizedUploadFile((request.headers.get("authorization")||"").replace(/^Bearer /,""),new URL(request.url).searchParams.get("file"));
  if(await getSubmission(projectId))throw new BriefError("This brief has already been sent.",409);
  const reader=request.body?.getReader();if(!reader)throw new BriefError("Empty upload.");let size=0;const chunks:Uint8Array[]=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>file.size){await reader.cancel();throw new BriefError("This upload is larger than expected.",413)}chunks.push(value)}
  if(size!==file.size)throw new BriefError("The file upload is incomplete.",409);
  try{await writeBytes(file.pathname,Buffer.concat(chunks),file.type,null)}catch(e){if(!(e instanceof Conflict))throw e;const existing=await fileHead(file.pathname);if(existing?.size!==file.size)throw new BriefError("Try uploading this file again.",409)}
  return briefResponse({ok:true});
}catch(e){return briefFailure(e)}}

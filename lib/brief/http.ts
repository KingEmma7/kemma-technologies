import { BriefError } from "./config";
export const privateHeaders={"Cache-Control":"no-store, max-age=0","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow","X-Content-Type-Options":"nosniff"};
export function briefFailure(error:unknown){
  if(error instanceof BriefError)return Response.json({error:error.message},{status:error.status,headers:privateHeaders});
  console.error("[brief] Request failed; details withheld to protect submission data.");
  return Response.json({error:"We couldn’t complete that step. Your draft is still on this device. Please try again."},{status:503,headers:privateHeaders});
}
export function briefResponse(value:unknown){return Response.json(value,{headers:privateHeaders})}

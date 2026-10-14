import { timingSafeEqual } from "node:crypto";
import { readDocument, submissionKeys } from "@/lib/brief/storage";
import { sendNotification, type Notification } from "@/lib/brief/email";
import type { Submission } from "@/lib/brief/service";
import { BriefError } from "@/lib/brief/config";
import { briefFailure, briefResponse } from "@/lib/brief/http";
export const runtime="nodejs";
export const maxDuration=60;
export async function GET(request:Request){try{
  const secret=process.env.CRON_SECRET,actual=request.headers.get("authorization")||"",expected=`Bearer ${secret}`;
  if(!secret||secret.length<32||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))throw new BriefError("Not authorized.",401);
  let retried=0,sent=0,pending=0,needsReview=0;const deadline=Date.now()+40_000;
  for(const path of await submissionKeys()){
    if(retried>=25||Date.now()>deadline)break;
    const id=path.split("/")[1],notification=await readDocument<Notification>(`briefs/${id}/notification.json`);
    if(notification?.value.state==="sent"||notification?.value.state==="preview")continue;
    if((notification?.value.leaseUntil||0)>Date.now())continue;
    if(notification?.value.attemptedAt&&notification.value.uncertain!==false&&Date.now()-notification.value.attemptedAt>23*60*60*1000){needsReview++;continue}
    const record=await readDocument<Submission>(path);if(!record)continue;retried++;
    if(await sendNotification(record.value)==="sent")sent++;else pending++;
  }
  return briefResponse({retried,sent,pending,needsReview});
}catch(e){return briefFailure(e)}}

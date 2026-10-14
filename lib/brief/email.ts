import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "../site";
import { escapeHtml } from "../contact-email";
import { BriefError, storageMode } from "./config";
import { Conflict, readDocument, writeDocument } from "./storage";
import type { Submission } from "./service";

export type Notification = {state:"sending"|"sent"|"pending"|"preview";attemptedAt:number;leaseUntil:number;uncertain?:boolean;emailId?:string};
const emailPath=(id:string)=>`briefs/${id}/notification.json`;
// This private setting is read only by server notification code, never page props.
export function notificationRecipient():string {
  const override=process.env.BRIEF_TO_EMAIL?.trim();
  if(!override)return SITE.email;
  if(!z.email().safeParse(override).success)throw new BriefError("Configure a valid BRIEF_TO_EMAIL for project notifications.",503);
  return override;
}
export function reviewUrl(record:Submission){return `${record.baseUrl}/brief/submission/${record.id}?key=${encodeURIComponent(record.reviewToken)}`}
export function downloadUrl(record:Submission,fileId:string){return `${record.baseUrl}/api/brief/download/${record.id}/${fileId}?key=${encodeURIComponent(record.reviewToken)}`}
export function displayValue(value:unknown):string {
  if(value===null||value===undefined||value==="")return "Not supplied";
  if(typeof value==="boolean")return value?"Yes":"No";
  if(Array.isArray(value))return value.map(displayValue).join("; ");
  if(typeof value==="object")return Object.entries(value).filter(([k])=>k!=="id").map(([k,v])=>`${answerLabels[k]||k}: ${displayValue(v)}`).join("\n");
  return String(value);
}
export const answerLabels:Record<string,string>={businessName:"Business name",contactName:"Contact name",email:"Email",privatePhone:"WhatsApp number",goal:"Website goal",references:"Inspiration websites",description:"Business description",productCategories:"Products made",socials:"Social links and handles",otherSocial:"Other social platform",publicEmail:"Public business email",brandNotes:"Brand notes",folderLink:"Shared folder",catalogueNotes:"Catalogue notes",deliveryOptions:"Delivery options",deliveryAreas:"Delivery areas",deliveryFee:"Delivery charge",deliveryTime:"Delivery timing",deliveryNotes:"Delivery notes",paymentMethods:"Payment methods",paymentTiming:"Payment timing",deposit:"Deposit",orderNotes:"Order notes",policyMethod:"Policy sharing",policyTexts:"Policy texts",policyType:"Last policy edited",launchTiming:"Preferred launch",launchNotes:"Launch notes",domain:"Preferred domain",ownsDomain:"Already owns domain",domainHelp:"Help choosing domain",additionalTopics:"Additional topics",additionalNotes:"Anything we missed?",permission:"Permission to use files"};
Object.assign(answerLabels,{url:"Website",aspects:"What stood out",note:"Note",priceLabel:"Price and currency",priceMode:"Pricing",type:"Product type",details:"Description",customNotes:"Custom-order notes",materials:"Materials",sizing:"Sizing",sizesColours:"Sizes and colours",makingTime:"Making time",measurements:"Measurements",skillLevel:"Pattern skill level",patternRights:"Pattern use",shipping:"Shipping / delivery",terms:"Terms",privacy:"Privacy",refunds:"Returns / refunds"});
export function scopeLabel(record:Submission,scope:string){const [kind,id]=scope.split(":");if(id)return `${kind==="paid"?"Paid download for ":""}${record.products.find(p=>p.id===id)?.name||"Product"}`;return ({logo:"Logo",brand:"Brand photos",catalogue:"Catalogue",policies:"Policy document"} as Record<string,string>)[scope]||scope}
export function buildEmail(record:Submission){
  const rows=Object.entries(record.answers).map(([key,value])=>[answerLabels[key]||key,displayValue(value)]);
  const link=reviewUrl(record);
  const text=[`Website brief: ${record.answers.businessName}`,`Reference: ${record.reference}`,`Saved: ${record.savedAt}`,"",...rows.map(([label,value])=>`${label}: ${value}`),"","Products:",...record.products.map((p,i)=>`${i+1}. ${displayValue(p)}`),"","Original uploads:",...record.files.map(f=>`${f.name} (${scopeLabel(record,f.scope)} / ${f.role}, ${f.size} bytes)\n${downloadUrl(record,f.id)}`),"",`View the saved brief and download its files: ${link}`,"Private project links. Keep this email within the project team. Links remain valid for one year; the original files remain stored."] .join("\n");
  const html=`<h2>Website brief: ${escapeHtml(String(record.answers.businessName))}</h2><p>Reference: ${record.reference}</p><p><a href="${escapeHtml(link)}">View saved brief and files</a></p><table cellpadding="8" style="border-collapse:collapse">${rows.map(([label,value])=>`<tr><th style="text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table><h3>Products</h3>${record.products.map(p=>`<pre style="white-space:pre-wrap">${escapeHtml(displayValue(p))}</pre>`).join("")}<h3>Original uploads</h3><ul>${record.files.map(f=>`<li><a href="${escapeHtml(downloadUrl(record,f.id))}">${escapeHtml(f.name)}</a> · ${escapeHtml(f.scope)} · ${escapeHtml(f.role)}</li>`).join("")}</ul><p>Private project links. Keep this email within the project team. Download links remain valid for one year; the original files remain stored.</p>`;
  const attachment=Buffer.from(JSON.stringify({reference:record.reference,savedAt:record.savedAt,answers:record.answers,products:record.products,files:record.files.map(f=>({name:f.name,size:f.size,type:f.type,scope:f.scope,role:f.role,downloadUrl:downloadUrl(record,f.id)}))},null,2));
  return {to:[notificationRecipient()],replyTo:String(record.answers.email),subject:`${storageMode()==="local"?"[Preview test] ":""}Website brief: ${String(record.answers.businessName).replace(/[\r\n]/g," ")} (${record.reference})`,text,html,attachments:[{filename:`${record.reference}-brief.json`,content:attachment}]};
}
export async function sendNotification(record:Submission):Promise<"sent"|"pending"|"preview">{
  const path=emailPath(record.id),old=await readDocument<Notification>(path);
  if(old?.value.state==="sent"||old?.value.state==="preview")return old.value.state;
  const now=Date.now();if(old?.value.leaseUntil&&old.value.leaseUntil>now)return "pending";
  // Resend's deduplication window is 24h. An old ambiguous attempt needs owner
  // reconciliation, rather than risking a duplicate notification after expiry.
  if(old?.value.attemptedAt&&old.value.uncertain!==false&&now-old.value.attemptedAt>23*60*60*1000)return "pending";
  let lease:string;
  const sending:Notification={state:"sending",attemptedAt:old?.value.uncertain===false?now:old?.value.attemptedAt||now,leaseUntil:now+90_000,uncertain:true};
  try{lease=await writeDocument(path,sending,old?.etag??null)}catch(e){if(e instanceof Conflict)return "pending";throw e}
  // Persist the payload before attempting delivery. A later deploy can change
  // labels/templates/recipient without changing an already-attempted idempotent email.
  const payloadPath=`briefs/${record.id}/email-payload.json`;
  type Payload=Omit<ReturnType<typeof buildEmail>,"attachments">&{attachments:{filename:string;content:string}[]};
  let stored=await readDocument<Payload>(payloadPath);
  if(!stored){
    let initial:ReturnType<typeof buildEmail>;
    try{initial=buildEmail(record)}catch{
      // Configuration failed before any provider call. Release this owned lease
      // as known unsent so correction remains retryable beyond the dedupe window.
      await writeDocument(path,{...sending,state:"pending",leaseUntil:0,uncertain:false},lease);
      return "pending";
    }
    const value={...initial,attachments:initial.attachments.map(a=>({...a,content:a.content.toString("base64")}))};try{await writeDocument(payloadPath,value,null);stored={value,etag:""}}catch(e){if(!(e instanceof Conflict))throw e;stored=await readDocument<Payload>(payloadPath)}
  }
  if(!stored)throw new Error("Missing notification payload");const payload=stored.value;
  if(storageMode()==="local"&&process.env.BRIEF_EMAIL_MODE!=="live"){
    await writeDocument(`briefs/${record.id}/email-preview.json`,payload,null).catch(e=>{if(!(e instanceof Conflict))throw e});
    await writeDocument(path,{...sending,state:"preview",leaseUntil:0},lease);return "preview";
  }
  if(!process.env.RESEND_API_KEY||!process.env.CONTACT_FROM_EMAIL){await writeDocument(path,{...sending,state:"pending",leaseUntil:0,uncertain:false},lease);return "pending"}
  try{
    const senderPath=`briefs/${record.id}/email-sender.json`;let sender=await readDocument<{from:string}>(senderPath);if(!sender){try{await writeDocument(senderPath,{from:process.env.CONTACT_FROM_EMAIL},null);sender={value:{from:process.env.CONTACT_FROM_EMAIL},etag:""}}catch(e){if(!(e instanceof Conflict))throw e;sender=await readDocument<{from:string}>(senderPath)}}
    if(!sender)throw new Error("Missing notification sender");
    const resend=new Resend(process.env.RESEND_API_KEY);
    const {data,error}=await resend.emails.send({from:sender.value.from,...payload},{idempotencyKey:`brief/${record.id}`});
    if(error){const status=error.statusCode;const rejected=typeof status==="number"&&status>=400&&status<500&&status!==409;await writeDocument(path,{...sending,state:"pending",leaseUntil:0,uncertain:!rejected},lease);return "pending"}
    if(!data?.id)throw new Error("Unconfirmed email acceptance");
    await writeDocument(path,{...sending,state:"sent",leaseUntil:0,emailId:data?.id},lease);return "sent";
  }catch{await writeDocument(path,{...sending,state:"pending",leaseUntil:0},lease).catch(()=>{});return "pending"}
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyCapability, storageMode } from "@/lib/brief/config";
import { getSubmission } from "@/lib/brief/service";
import { answerLabels, displayValue, downloadUrl } from "@/lib/brief/email";
import { readDocument } from "@/lib/brief/storage";
import styles from "./review.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Saved website brief",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function SavedBrief({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{key?:string}>}){
  const {id}=await params,{key}=await searchParams;
  try{if(verifyCapability(key||"","review").id!==id)notFound()}catch{notFound()}
  const record=await getSubmission(id);if(!record)notFound();
  const notification=await readDocument<{state:string}>(`briefs/${id}/notification.json`);
  const preview=storageMode()==="local";
  const protectedKey=encodeURIComponent(key||"");
  return <div className={styles.page}><header><Link href="/" aria-label="Kemma Technologies"><Image src="/brief/brand/kemma-logo.png" alt="Kemma Technologies" width={105} height={78}/></Link><span>Saved website brief</span></header><main><p className={styles.reference}>{record.reference} · Saved {new Date(record.savedAt).toLocaleDateString("en-GB",{timeZone:"Africa/Accra"})}</p><h1>{String(record.answers.businessName)}</h1><p className={styles.note}>{preview?"Local preview record. No cloud deployment has occurred.":"This private link contains the client’s answers and original files."}</p><div className={styles.actions}><a href={`/api/brief/record/${id}?key=${protectedKey}`}>Download the complete brief</a>{preview&&<a href={`/api/brief/email-preview/${id}?key=${protectedKey}`}>View notification email preview</a>}</div><p className={styles.note}>Email: {notification?.value.state==="sent"?"Accepted by the email provider":notification?.value.state==="preview"?"Preview generated; no email sent":"Notification pending; the brief is safely saved"}. Private download links stay valid for one year.</p><section><h2>Answers</h2><dl>{Object.entries(record.answers).filter(([k])=>k!=="policyType").map(([key,value])=><div key={key}><dt>{answerLabels[key]||key}</dt><dd>{displayValue(value)}</dd></div>)}</dl></section><section><h2>Products</h2>{record.products.length?record.products.map(p=><article key={String(p.id)}><h3>{String(p.name)}</h3><dl>{Object.entries(p).filter(([k])=>k!=="id"&&k!=="name").map(([k,v])=><div key={k}><dt>{answerLabels[k]||k}</dt><dd>{displayValue(v)}</dd></div>)}</dl></article>):<p>No products supplied yet.</p>}</section><section><h2>Original files</h2>{record.files.length?<ul>{record.files.map(f=><li key={f.id}><a href={downloadUrl(record,f.id)}>{f.name}</a><span>{f.scope.startsWith("product:")?String(record.products.find(p=>p.id===f.scope.split(":")[1])?.name||"Product"):f.scope} · {f.role} · {(f.size/1024).toFixed(1)} KB</span></li>)}</ul>:<p>No files supplied yet.</p>}</section></main></div>
}

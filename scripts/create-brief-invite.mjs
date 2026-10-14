import { randomUUID, createHmac } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
try { process.loadEnvFile('.env.local'); } catch { /* hosted env may already be set */ }
const secret=process.env.BRIEF_SIGNING_SECRET;
if(!secret||secret.length<32)throw new Error('Configure BRIEF_SIGNING_SECRET before creating a client link.');
const id=randomUUID(),body=Buffer.from(JSON.stringify({kind:'invite',id,exp:Date.now()+90*24*60*60*1000})).toString('base64url');
const token=body+'.'+createHmac('sha256',secret).update(body).digest('base64url');
const base=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.kemmatechnologies.com').replace(/\/$/,'');
const url=base+'/brief/crochet?invite='+encodeURIComponent(token);
const folder=resolve('.brief-private-invites');await mkdir(folder,{recursive:true,mode:0o700});
const path=resolve(folder,id+'.txt');await writeFile(path,url+'\n',{mode:0o600});
console.log('Private client link saved to '+path+'. Share this file only with the client.');

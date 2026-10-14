import { acceptSubmission } from "@/lib/brief/service";
import { assertSameOrigin, readJson, submitSchema } from "@/lib/brief/schema";
import { BriefError } from "@/lib/brief/config";
import { briefFailure, briefResponse } from "@/lib/brief/http";
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(request:Request){try{assertSameOrigin(request);const parsed=submitSchema.safeParse(await readJson(request));if(!parsed.success)throw new BriefError("Check your answers and try again.");return briefResponse(await acceptSubmission(parsed.data.sessionToken,parsed.data.answers,parsed.data.products,request))}catch(e){return briefFailure(e)}}

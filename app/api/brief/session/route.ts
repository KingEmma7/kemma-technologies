import { beginSession } from "@/lib/brief/service";
import { assertSameOrigin, readJson } from "@/lib/brief/schema";
import { briefFailure, briefResponse } from "@/lib/brief/http";
export const runtime="nodejs";
export async function POST(request:Request){try{assertSameOrigin(request);return briefResponse(await beginSession(await readJson(request,64*1024)))}catch(e){return briefFailure(e)}}

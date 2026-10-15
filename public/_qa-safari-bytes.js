// components/brief/storage.js
var databaseName = (invite2) => {
  let hash2 = 2166136261;
  for (const char of invite2 || "missing") {
    hash2 ^= char.charCodeAt(0);
    hash2 = Math.imul(hash2, 16777619);
  }
  return "kemma-crochet-brief-v2-" + (hash2 >>> 0).toString(16);
};
var STORAGE_TIMEOUT = 15e3;
async function open(invite2) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(invite2), 1);
    let rejected = false;
    const timer = setTimeout(() => fail(new Error("Opening the saved brief took too long.")), STORAGE_TIMEOUT);
    const fail = (error) => {
      rejected = true;
      clearTimeout(timer);
      reject(error || new Error("Couldn\u2019t open the saved brief."));
    };
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => {
      clearTimeout(timer);
      if (rejected) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => fail(request.error);
    request.onblocked = () => fail(new Error("Close other brief tabs and try opening this one again."));
  });
}
async function readDraft(invite2) {
  const db = await open(invite2);
  try {
    const saved = await new Promise((resolve, reject) => {
      const transaction = db.transaction("drafts", "readonly");
      const timer = setTimeout(() => {
        try {
          transaction.abort();
        } catch {
        }
        reject(new Error("Opening the saved brief took too long."));
      }, STORAGE_TIMEOUT);
      const request = transaction.objectStore("drafts").get("current");
      let saved2;
      request.onsuccess = () => {
        saved2 = request.result;
      };
      request.onerror = () => reject(request.error || new Error("Couldn\u2019t read the saved brief."));
      transaction.oncomplete = () => {
        clearTimeout(timer);
        resolve(saved2);
      };
      transaction.onerror = () => {
        clearTimeout(timer);
        reject(transaction.error || new Error("Couldn\u2019t read the saved brief."));
      };
      transaction.onabort = () => {
        clearTimeout(timer);
        reject(transaction.error || new Error("Opening the saved brief was interrupted."));
      };
    });
    if (!saved?.files?.some((entry) => entry.byteKey)) return saved;
    const files = [];
    for (const entry of saved.files) {
      if (!entry.byteKey) {
        files.push(entry);
        continue;
      }
      let bytes;
      try {
        bytes = await readFileBytes(db, entry.byteKey);
      } catch {
      }
      if (!(bytes instanceof ArrayBuffer) || bytes.byteLength !== entry.file.size) {
        files.push({ ...entry, needsOriginal: true });
        continue;
      }
      files.push({ ...entry, needsOriginal: false, file: new File([bytes], entry.file.name, { type: entry.file.type, lastModified: entry.file.lastModified }) });
    }
    return { ...saved, files };
  } finally {
    db.close();
  }
}
function readFileBytes(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", "readonly"), request = tx.objectStore("drafts").get(key);
    let bytes;
    const timer = setTimeout(() => {
      try {
        tx.abort();
      } catch {
      }
      reject(new Error("Reading the saved original took too long."));
    }, STORAGE_TIMEOUT);
    request.onsuccess = () => {
      bytes = request.result;
    };
    tx.oncomplete = () => {
      clearTimeout(timer);
      resolve(bytes);
    };
    tx.onerror = tx.onabort = () => {
      clearTimeout(timer);
      reject(tx.error || new Error("Couldn\u2019t read the saved original."));
    };
  });
}
async function preserveOriginalFile(file, invite2) {
  if (!file.size || file.size > 25 * 1024 * 1024) throw new Error("Use an original file up to 25 MB.");
  const bytes = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reader.onload = reader.onerror = reader.onabort = null;
      if (error) reject(error);
      else resolve(value);
    };
    const timer = setTimeout(() => {
      finish(new Error("Couldn\u2019t copy the original file."));
      if (reader.readyState === FileReader.LOADING) reader.abort();
    }, 3e4);
    reader.onload = () => reader.result instanceof ArrayBuffer && reader.result.byteLength === file.size ? finish(null, reader.result) : finish(new Error("The original file was incomplete."));
    reader.onerror = reader.onabort = () => finish(new Error("Couldn\u2019t copy the original file."));
    try {
      reader.readAsArrayBuffer(file);
    } catch (error) {
      finish(error);
    }
  });
  const key = "original:" + crypto.randomUUID(), db = await open(invite2);
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      const timer = setTimeout(() => {
        try {
          tx.abort();
        } catch {
        }
        reject(new Error("Saving the original took too long."));
      }, STORAGE_TIMEOUT);
      tx.oncomplete = () => {
        clearTimeout(timer);
        resolve();
      };
      tx.onerror = tx.onabort = () => {
        clearTimeout(timer);
        reject(tx.error || new Error("Couldn\u2019t save the original file."));
      };
      tx.objectStore("drafts").put(bytes, key);
    });
  } finally {
    db.close();
  }
  return { file: new File([bytes], file.name, { type: file.type, lastModified: file.lastModified }), byteKey: key, needsOriginal: false };
}
var DraftConflictError = class extends Error {
  constructor() {
    super("Another tab has newer answers. Keep this page open and contact Kemma before continuing.");
    this.name = "DraftConflictError";
  }
};
var inactiveDraft = () => Object.assign(new Error("This brief is no longer open."), { name: "DraftDisposedError" });
var localRevision = (saved) => saved?._localRevision ?? null;
async function commitDraft(snapshot, invite2, expectedRevision, active, transactions) {
  if (!active()) throw inactiveDraft();
  const db = await open(invite2);
  try {
    if (!active()) throw inactiveDraft();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("drafts", "readwrite");
      transactions.add(transaction);
      const store = transaction.objectStore("drafts");
      const revision = crypto.randomUUID();
      let failure, written = false;
      const abort = (error) => {
        failure = error;
        try {
          transaction.abort();
        } catch {
          reject(error);
        }
      };
      const timer = setTimeout(() => abort(new Error("Saving the brief took too long. Keep this page open.")), STORAGE_TIMEOUT);
      transaction.oncomplete = () => {
        clearTimeout(timer);
        transactions.delete(transaction);
        if (written) resolve(revision);
        else reject(failure || new Error("Save interrupted."));
      };
      transaction.onerror = () => {
        failure = failure || transaction.error || new Error("Couldn\u2019t save the brief.");
      };
      transaction.onabort = () => {
        clearTimeout(timer);
        transactions.delete(transaction);
        reject(!active() ? inactiveDraft() : failure || transaction.error || new Error("Save interrupted."));
      };
      const request = store.get("current");
      request.onerror = () => abort(request.error || new Error("Couldn\u2019t read the saved brief."));
      request.onsuccess = () => {
        if (!active()) {
          abort(inactiveDraft());
          return;
        }
        if (localRevision(request.result) !== expectedRevision) {
          abort(new DraftConflictError());
          return;
        }
        try {
          const files = snapshot.files.map((entry) => entry.byteKey ? { ...entry, file: { name: entry.file.name, size: entry.file.size, type: entry.file.type, lastModified: entry.file.lastModified } } : entry);
          store.put({ ...snapshot, files, _localRevision: revision }, "current");
          written = true;
        } catch (error) {
          abort(error);
        }
      };
    });
  } finally {
    db.close();
  }
}
function supportedDraft(saved) {
  return saved && saved.schemaVersion === 2 && saved.answers && typeof saved.answers === "object" && !Array.isArray(saved.answers) && Array.isArray(saved.products) && Array.isArray(saved.files) && (saved._localRevision === void 0 || typeof saved._localRevision === "string");
}
function createDraftPersistence(invite2) {
  let ready = false, active = false, generation = 0, expectedRevision = null, serial = Promise.resolve(), unavailable = inactiveDraft();
  const transactions = /* @__PURE__ */ new Set();
  const invalidate = () => {
    ready = false;
    generation += 1;
    for (const transaction of transactions) {
      try {
        transaction.abort();
      } catch {
      }
    }
    transactions.clear();
  };
  return {
    async restore() {
      invalidate();
      active = true;
      const attempt = generation;
      try {
        const saved = await readDraft(invite2);
        if (!active || attempt !== generation) throw inactiveDraft();
        if (saved !== void 0 && !supportedDraft(saved)) throw new Error("The saved brief could not be restored.");
        expectedRevision = localRevision(saved);
        ready = true;
        return saved;
      } catch (error) {
        if (attempt === generation) {
          ready = false;
          unavailable = error;
        }
        throw error;
      }
    },
    save(snapshot) {
      if (!ready || !active) return Promise.reject(unavailable);
      if (!supportedDraft(snapshot)) return Promise.reject(new Error("The brief could not be saved."));
      const attempt = generation;
      const current = () => active && ready && attempt === generation;
      const task = serial.catch(() => {
      }).then(async () => {
        if (!current()) throw unavailable;
        try {
          expectedRevision = await commitDraft(snapshot, invite2, expectedRevision, current, transactions);
        } catch (error) {
          if (error instanceof DraftConflictError && attempt === generation) {
            ready = false;
            unavailable = error;
          }
          throw error;
        }
      });
      serial = task;
      return task;
    },
    dispose() {
      active = false;
      unavailable = inactiveDraft();
      invalidate();
    }
  };
}

// safari-byte-qa.js
var invite = "safari-byte-qa-20261015-v1";
var persistence = createDraftPersistence(invite);
var status = document.querySelector("#status");
var picker = document.querySelector("input");
async function hash(file) {
  const bytes = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((v) => v.toString(16).padStart(2, "0")).join("");
}
var draft = await persistence.restore();
if (draft) {
  let good = 0;
  for (const entry of draft.files) {
    if (await hash(entry.file) === draft.answers.hashes[entry.id]) good++;
  }
  status.textContent = good === draft.files.length && draft.answers.additionalNotes === "Keep this exact note after refresh." ? "PASS: " + good + " of " + draft.files.length + " exact originals restored after refresh. Answers unchanged." : "FAIL: restored data differs.";
} else status.textContent = "Choose synthetic test files.";
picker.onchange = async () => {
  try {
    picker.disabled = true;
    status.textContent = "Copying actual original bytes\u2026";
    const files = [], hashes = {};
    for (const file of picker.files) {
      const id = crypto.randomUUID(), preserved = await preserveOriginalFile(file, invite);
      files.push({ id, scope: "brand", role: "Additional file", ...preserved });
      hashes[id] = await hash(preserved.file);
    }
    draft = { schemaVersion: 2, question: "finish", answers: { businessName: "Safari original-byte QA", additionalNotes: "Keep this exact note after refresh.", hashes }, products: [], files };
    await persistence.save(draft);
    picker.value = "";
    status.textContent = "Saved " + files.length + " originals. Ready to refresh this tab.";
  } catch (error) {
    status.textContent = "FAIL: " + error.message;
  } finally {
    picker.disabled = false;
  }
};
document.querySelector("#refresh").onclick = () => location.reload();

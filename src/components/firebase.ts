// localStorage-backed Firestore shim for Digital World (Weg A).
// Emulates the subset of firebase/firestore + firebase auth used by the ported Digital Buero views.
// NO real Firebase, NO network, NO relay/gateway. All data lives in localStorage.

const PREFIX = 'dw.fs.';
const keyFor = (path: string) => PREFIX + path;

// ---- low level store ----
function readColl(coll: string): any[] {
  try { return JSON.parse(localStorage.getItem(keyFor(coll) + '.__coll__') || '[]'); } catch { return []; }
}
function writeColl(coll: string, arr: any[]) {
  localStorage.setItem(keyFor(coll) + '.__coll__', JSON.stringify(arr));
  emit(coll);
}
function readDocRaw(coll: string, id: string): any | null {
  const arr = readColl(coll);
  const found = arr.find((d) => d.__id === id);
  return found ? found : null;
}

// ---- change emitter for onSnapshot ----
type Listener = () => void;
const listeners: Record<string, Listener[]> = {};
function emit(coll: string) {
  (listeners[coll] || []).forEach((l) => { try { l(); } catch (e) { console.error(e); } });
}
function subscribe(coll: string, l: Listener): () => void {
  if (!listeners[coll]) listeners[coll] = [];
  listeners[coll].push(l);
  return () => { listeners[coll] = (listeners[coll] || []).filter((x) => x !== l); };
}

// ---- timestamp ----
export function serverTimestamp() {
  return { __ts: true, value: Date.now() };
}
function tsToDate(v: any): Date {
  if (v && typeof v === 'object' && v.__ts) return new Date(v.value);
  if (v && typeof v.toDate === 'function') return v.toDate();
  if (typeof v === 'number') return new Date(v);
  return new Date();
}

// ---- references ----
export function collection(_db: any, path: string) {
  return { __type: 'collection', path };
}
export function doc(dbOrColl: any, a?: string, b?: string) {
  // doc(db, coll, id)  OR  doc(collectionRef, id)
  if (dbOrColl && dbOrColl.__type === 'collection') {
    return { __type: 'doc', coll: dbOrColl.path, id: a as string };
  }
  return { __type: 'doc', coll: a as string, id: b as string };
}

// ---- query (passthrough; ordering applied in snapshot) ----
export function query(collRef: any, ...clauses: any[]) {
  return { __type: 'query', coll: collRef.path, clauses };
}
export function orderBy(field: string, dir: 'asc' | 'desc' = 'asc') {
  return { __type: 'orderBy', field, dir };
}
export function where(field: string, op: string, value: any) {
  return { __type: 'where', field, op, value };
}

// ---- snapshot doc wrapper ----
function wrapDoc(raw: any) {
  return { id: raw.__id, data: () => raw };
}

// ---- reads/writes ----
export async function getDoc(ref: any) {
  const raw = readDocRaw(ref.coll, ref.id);
  return {
    exists: () => !!raw,
    id: ref.id,
    data: () => (raw ? raw : undefined),
  };
}
export async function setDoc(ref: any, data: any, opts?: { merge?: boolean }) {
  const arr = readColl(ref.coll);
  const idx = arr.findIndex((d) => d.__id === ref.id);
  let next = { ...data, __id: ref.id };
  if (opts && opts.merge && idx >= 0) next = { ...arr[idx], ...data, __id: ref.id };
  if (idx >= 0) arr[idx] = next; else arr.push(next);
  writeColl(ref.coll, arr);
}
export async function deleteDoc(ref: any) {
  const arr = readColl(ref.coll).filter((d) => d.__id !== ref.id);
  writeColl(ref.coll, arr);
}

// ---- onSnapshot (collection/query OR single doc) ----
export function onSnapshot(target: any, onNext: any, _onErr?: any) {
  const isDoc = target.__type === 'doc';
  const coll = target.coll;
  const emitNow = () => {
    if (isDoc) {
      const raw = readDocRaw(coll, target.id);
      onNext({ exists: () => !!raw, id: target.id, data: () => (raw ? raw : undefined) });
    } else {
      let arr = readColl(coll);
      const ob = (target.clauses || []).find((c: any) => c.__type === 'orderBy');
      if (ob) {
        arr = arr.slice().sort((a, b) => {
          let av = a[ob.field]; let bv = b[ob.field];
          if (av && av.__ts) av = av.value; if (bv && bv.__ts) bv = bv.value;
          if (av < bv) return ob.dir === 'desc' ? 1 : -1;
          if (av > bv) return ob.dir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      const docs = arr.map(wrapDoc);
      onNext({ forEach: (cb: any) => docs.forEach(cb), docs, size: docs.length, empty: docs.length === 0 });
    }
  };
  emitNow();
  return subscribe(coll, emitNow);
}

// ---- auth shim: a permanent local 'logged-in' user, no real sign-in ----
const LOCAL_USER = { uid: 'local-user', displayName: 'Local User', email: 'local@digital.world', isAnonymous: false } as any;
export const auth: any = { currentUser: LOCAL_USER };
export const googleProvider: any = {};
export function onAuthStateChanged(_auth: any, cb: (u: any) => void) {
  cb(LOCAL_USER);
  return () => {};
}
export async function signInWithPopup(..._args: any[]) { return { user: LOCAL_USER }; }
export async function signOut(..._args: any[]) { return; }

// ---- db handle (opaque; refs carry the path) ----
export const db: any = { __localStore: true };

// ---- compatibility exports from original firebase.ts ----
export enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write',
}
export function handleFirestoreError(error: unknown, _op: OperationType, _path: string | null) {
  console.error('[firebase shim] suppressed firestore error:', error);
}


// ---- updateDoc (merge into existing) ----
export async function updateDoc(ref: any, updates: any) {
  const arr = readColl(ref.coll);
  const idx = arr.findIndex((d) => d.__id === ref.id);
  if (idx >= 0) { arr[idx] = { ...arr[idx], ...updates, __id: ref.id }; writeColl(ref.coll, arr); }
  else { arr.push({ ...updates, __id: ref.id }); writeColl(ref.coll, arr); }
}

// ---- User type (shape compatible with firebase/auth User subset used) ----
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  isAnonymous: boolean;
}

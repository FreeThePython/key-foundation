/*
 * KEY Canonical State Store v0.1
 *
 * An in-memory reference implementation of KEY's canonical truth boundary.
 * Transactions are validated against an isolated working snapshot and become
 * visible only when every mutation succeeds.
 */

import {
  type Belief,
  type CanonicalMutation,
  type CanonicalRecordType,
  type CanonicalTransaction,
  type CanonicalValue,
  type Entity,
  type Event,
  type Memory,
  type Observation,
  type Proposition,
  type TransactionId,
  type ValidationIssue,
  type WorldId,
  type WorldTimestamp,
  validateBelief,
  validateCanonicalMutation,
  validateCanonicalTransaction,
  validateEntity,
  validateEvent,
  validateMemory,
  validateObservation,
  validateProposition,
} from "./primitives";

export type CanonicalRecord =
  | Entity
  | Proposition
  | Event
  | Observation
  | Belief
  | Memory
  | Readonly<Record<string, CanonicalValue>>;

export interface CanonicalRecordEnvelope<T extends CanonicalRecord = CanonicalRecord> {
  recordType: CanonicalRecordType;
  recordId: string;
  value: T;
}

export interface CanonicalSnapshot {
  worldId: WorldId;
  revision: number;
  records: ReadonlyMap<CanonicalRecordType, ReadonlyMap<string, CanonicalRecord>>;
  committedTransactionIds: readonly TransactionId[];
}

export interface CommitSuccess {
  ok: true;
  transaction: CanonicalTransaction;
  worldRevision: number;
  appliedMutationIds: string[];
}

export interface CommitFailure {
  ok: false;
  transaction: CanonicalTransaction;
  worldRevision: number;
  issues: ValidationIssue[];
}

export type CommitResult = CommitSuccess | CommitFailure;

export interface CanonicalStateStoreOptions {
  worldId: WorldId;
  initialRecords?: CanonicalRecordEnvelope[];
}

const RECORD_TYPES: CanonicalRecordType[] = [
  "entity",
  "proposition",
  "event",
  "observation",
  "belief",
  "memory",
  "process",
];

const cloneValue = <T>(value: T): T => {
  if (value === undefined || value === null || typeof value !== "object") return value;
  return JSON.parse(JSON.stringify(value)) as T;
};

const stableStringify = (value: unknown): string => {
  if (value === undefined) return "__undefined__";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
    .join(",")}}`;
};

const valuesEqual = (left: unknown, right: unknown): boolean =>
  stableStringify(left) === stableStringify(right);

const issue = (code: string, path: string, message: string): ValidationIssue => ({
  code,
  path,
  message,
  severity: "error",
});

const createEmptyTables = (): Map<CanonicalRecordType, Map<string, CanonicalRecord>> =>
  new Map(RECORD_TYPES.map((type) => [type, new Map<string, CanonicalRecord>()]));

const cloneTables = (
  source: Map<CanonicalRecordType, Map<string, CanonicalRecord>>,
): Map<CanonicalRecordType, Map<string, CanonicalRecord>> => {
  const target = createEmptyTables();
  for (const [recordType, records] of source) {
    const targetRecords = target.get(recordType)!;
    for (const [id, value] of records) targetRecords.set(id, cloneValue(value));
  }
  return target;
};

const splitPath = (path?: string): string[] => {
  if (!path || path === "$" || path === ".") return [];
  return path.replace(/^\$?\.?/, "").split(".").filter(Boolean);
};

const getAtPath = (root: unknown, path?: string): unknown => {
  let cursor = root;
  for (const segment of splitPath(path)) {
    if (cursor === null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
};

const setAtPath = (root: CanonicalRecord, path: string | undefined, value: unknown): CanonicalRecord => {
  const segments = splitPath(path);
  if (segments.length === 0) return cloneValue(value) as CanonicalRecord;

  const copy = cloneValue(root) as Record<string, unknown>;
  let cursor = copy;
  for (const segment of segments.slice(0, -1)) {
    const existing = cursor[segment];
    if (existing === null || typeof existing !== "object" || Array.isArray(existing)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = cloneValue(value);
  return copy as CanonicalRecord;
};

const removeAtPath = (root: CanonicalRecord, path?: string): CanonicalRecord | undefined => {
  const segments = splitPath(path);
  if (segments.length === 0) return undefined;
  const copy = cloneValue(root) as Record<string, unknown>;
  let cursor = copy;
  for (const segment of segments.slice(0, -1)) {
    const child = cursor[segment];
    if (child === null || typeof child !== "object" || Array.isArray(child)) return copy as CanonicalRecord;
    cursor = child as Record<string, unknown>;
  }
  delete cursor[segments[segments.length - 1]];
  return copy as CanonicalRecord;
};

const recordRevision = (record: CanonicalRecord | undefined): number | undefined => {
  if (!record || typeof record !== "object") return undefined;
  const revision = (record as Record<string, unknown>).revision;
  return typeof revision === "number" && Number.isInteger(revision) ? revision : undefined;
};

const incrementRecordRevision = (record: CanonicalRecord): CanonicalRecord => {
  const revision = recordRevision(record);
  if (revision === undefined) return record;
  return { ...(record as Record<string, CanonicalValue>), revision: revision + 1 } as CanonicalRecord;
};

const validateRecord = (
  recordType: CanonicalRecordType,
  value: unknown,
): ValidationIssue[] => {
  switch (recordType) {
    case "entity": return validateEntity(value).issues;
    case "proposition": return validateProposition(value).issues;
    case "event": return validateEvent(value).issues;
    case "observation": return validateObservation(value).issues;
    case "belief": return validateBelief(value).issues;
    case "memory": return validateMemory(value).issues;
    case "process":
      return value !== null && typeof value === "object" && !Array.isArray(value)
        ? []
        : [issue("invalid_process", "$", "process records must be objects")];
  }
};

const withIssuePrefix = (issues: ValidationIssue[], prefix: string): ValidationIssue[] =>
  issues.map((entry) => ({
    ...entry,
    path: `${prefix}${entry.path === "$" ? "" : entry.path.slice(1)}`,
  }));

export class CanonicalStateStore {
  readonly worldId: WorldId;

  private tables: Map<CanonicalRecordType, Map<string, CanonicalRecord>>;
  private revision = 0;
  private readonly history: CanonicalTransaction[] = [];
  private readonly transactionIds = new Set<string>();

  constructor(options: CanonicalStateStoreOptions) {
    this.worldId = options.worldId;
    this.tables = createEmptyTables();

    for (const envelope of options.initialRecords ?? []) {
      const recordWorldId = (envelope.value as { worldId?: unknown }).worldId;
      if (recordWorldId !== this.worldId) {
        throw new TypeError(`Initial record ${envelope.recordId} belongs to a different world`);
      }
      const validationIssues = validateRecord(envelope.recordType, envelope.value)
        .filter((entry) => entry.severity === "error");
      if (validationIssues.length > 0) {
        throw new TypeError(`Invalid initial record ${envelope.recordId}: ${validationIssues.map((entry) => entry.message).join("; ")}`);
      }
      this.tables.get(envelope.recordType)!.set(envelope.recordId, cloneValue(envelope.value));
    }
  }

  get worldRevision(): number {
    return this.revision;
  }

  has(recordType: CanonicalRecordType, recordId: string): boolean {
    return this.tables.get(recordType)!.has(recordId);
  }

  get<T extends CanonicalRecord = CanonicalRecord>(
    recordType: CanonicalRecordType,
    recordId: string,
  ): T | undefined {
    const value = this.tables.get(recordType)!.get(recordId);
    return value === undefined ? undefined : cloneValue(value) as T;
  }

  list<T extends CanonicalRecord = CanonicalRecord>(recordType: CanonicalRecordType): T[] {
    return [...this.tables.get(recordType)!.values()].map((value) => cloneValue(value) as T);
  }

  getHistory(): CanonicalTransaction[] {
    return this.history.map(cloneValue);
  }

  snapshot(): CanonicalSnapshot {
    const records = new Map<CanonicalRecordType, ReadonlyMap<string, CanonicalRecord>>();
    for (const [recordType, table] of this.tables) {
      records.set(recordType, new Map([...table].map(([id, value]) => [id, cloneValue(value)])));
    }
    return {
      worldId: this.worldId,
      revision: this.revision,
      records,
      committedTransactionIds: this.history.map((transaction) => transaction.id),
    };
  }

  commit(proposed: CanonicalTransaction, committedAt?: WorldTimestamp): CommitResult {
    const transaction = cloneValue(proposed);
    const issues: ValidationIssue[] = [];

    issues.push(...validateCanonicalTransaction(transaction).issues.filter((entry) => entry.severity === "error"));

    if (transaction.worldId !== this.worldId) {
      issues.push(issue("wrong_world", "$.worldId", "Transaction belongs to a different world"));
    }
    if (this.transactionIds.has(transaction.id)) {
      issues.push(issue("duplicate_transaction", "$.id", "Transaction has already been committed"));
    }
    if (transaction.status !== "proposed" && transaction.status !== "validated") {
      issues.push(issue("invalid_transaction_status", "$.status", "Only proposed or validated transactions may be committed"));
    }

    const mutationIds = new Set<string>();
    for (const [index, mutation] of transaction.mutations.entries()) {
      if (mutationIds.has(mutation.id)) {
        issues.push(issue("duplicate_mutation", `$.mutations[${index}].id`, "Mutation IDs must be unique within a transaction"));
      }
      mutationIds.add(mutation.id);
      if (mutation.worldId !== this.worldId) {
        issues.push(issue("wrong_world", `$.mutations[${index}].worldId`, "Mutation belongs to a different world"));
      }
      if (mutation.transactionId !== transaction.id) {
        issues.push(issue("transaction_mismatch", `$.mutations[${index}].transactionId`, "Mutation transactionId must match its transaction"));
      }
    }

    if (issues.length > 0) return this.reject(transaction, issues);

    const working = cloneTables(this.tables);
    const createdEventIds = new Set(
      transaction.mutations
        .filter((mutation) => mutation.operation === "create" && mutation.target.recordType === "event")
        .map((mutation) => mutation.target.recordId),
    );

    for (const [index, mutation] of transaction.mutations.entries()) {
      const mutationIssues = this.applyMutation(working, mutation, createdEventIds, index);
      issues.push(...mutationIssues);
      if (mutationIssues.some((entry) => entry.severity === "error")) break;
    }

    if (issues.length > 0) return this.reject(transaction, issues);

    transaction.status = "committed";
    transaction.committedAt = cloneValue(committedAt ?? transaction.startedAt);
    transaction.validationErrors = [];

    this.tables = working;
    this.revision += 1;
    this.transactionIds.add(transaction.id);
    this.history.push(cloneValue(transaction));

    return {
      ok: true,
      transaction,
      worldRevision: this.revision,
      appliedMutationIds: transaction.mutations.map((mutation) => mutation.id),
    };
  }

  static replay(
    options: CanonicalStateStoreOptions,
    transactions: readonly CanonicalTransaction[],
  ): CanonicalStateStore {
    const store = new CanonicalStateStore(options);
    for (const committed of transactions) {
      const proposed: CanonicalTransaction = {
        ...cloneValue(committed),
        status: "validated",
        committedAt: undefined,
        validationErrors: [],
      };
      const result = store.commit(proposed, committed.committedAt);
      if (!result.ok) {
        throw new TypeError(`Replay failed for transaction ${committed.id}: ${result.issues.map((entry) => entry.message).join("; ")}`);
      }
    }
    return store;
  }

  private reject(transaction: CanonicalTransaction, issues: ValidationIssue[]): CommitFailure {
    transaction.status = "rejected";
    transaction.validationErrors = cloneValue(issues);
    return { ok: false, transaction, worldRevision: this.revision, issues };
  }

  private applyMutation(
    working: Map<CanonicalRecordType, Map<string, CanonicalRecord>>,
    mutation: CanonicalMutation,
    createdEventIds: Set<string>,
    index: number,
  ): ValidationIssue[] {
    const prefix = `$.mutations[${index}]`;
    const issues = withIssuePrefix(
      validateCanonicalMutation(mutation).issues.filter((entry) => entry.severity === "error"),
      prefix,
    );
    if (issues.length > 0) return issues;

    const table = working.get(mutation.target.recordType)!;
    const current = table.get(mutation.target.recordId);

    for (const eventId of mutation.causeEventIds) {
      if (!working.get("event")!.has(eventId) && !createdEventIds.has(eventId)) {
        issues.push(issue("missing_cause_event", `${prefix}.causeEventIds`, `Cause event ${eventId} does not exist`));
      }
    }

    for (const propositionId of mutation.preconditionPropositionIds) {
      const proposition = working.get("proposition")!.get(propositionId) as Proposition | undefined;
      if (!proposition || proposition.canonicalStatus !== "true") {
        issues.push(issue("failed_precondition", `${prefix}.preconditionPropositionIds`, `Precondition ${propositionId} is not canonically true`));
      }
    }

    if (mutation.target.expectedRevision !== undefined) {
      const actualRevision = recordRevision(current);
      if (actualRevision !== mutation.target.expectedRevision) {
        issues.push(issue(
          "revision_conflict",
          `${prefix}.target.expectedRevision`,
          `Expected revision ${mutation.target.expectedRevision}, received ${actualRevision ?? "none"}`,
        ));
      }
    }

    if (mutation.operation === "create" && current !== undefined) {
      issues.push(issue("record_exists", `${prefix}.target.recordId`, "Create target already exists"));
    }
    if (mutation.operation !== "create" && current === undefined) {
      issues.push(issue("record_missing", `${prefix}.target.recordId`, "Mutation target does not exist"));
    }

    if (current !== undefined && mutation.before !== undefined) {
      const actualBefore = getAtPath(current, mutation.target.path);
      if (!valuesEqual(actualBefore, mutation.before)) {
        issues.push(issue("before_mismatch", `${prefix}.before`, "Mutation before value does not match canonical state"));
      }
    }

    if (issues.length > 0) return issues;

    let next: CanonicalRecord | undefined;
    switch (mutation.operation) {
      case "create":
        next = cloneValue(mutation.after) as CanonicalRecord;
        break;
      case "replace":
        next = setAtPath(current!, mutation.target.path, mutation.after);
        break;
      case "patch": {
        const target = getAtPath(current!, mutation.target.path);
        if (target === null || typeof target !== "object" || Array.isArray(target) || mutation.after === null || typeof mutation.after !== "object" || Array.isArray(mutation.after)) {
          return [issue("invalid_patch", `${prefix}.after`, "Patch requires object target and object after values")];
        }
        next = setAtPath(current!, mutation.target.path, {
          ...(target as Record<string, CanonicalValue>),
          ...(mutation.after as Record<string, CanonicalValue>),
        });
        break;
      }
      case "append": {
        const target = getAtPath(current!, mutation.target.path);
        if (!Array.isArray(target)) return [issue("invalid_append", `${prefix}.target.path`, "Append target must be an array")];
        next = setAtPath(current!, mutation.target.path, [...target, cloneValue(mutation.after)]);
        break;
      }
      case "remove":
        next = removeAtPath(current!, mutation.target.path);
        break;
      case "end":
        next = setAtPath(current!, mutation.target.path, mutation.after);
        break;
    }

    if (next !== undefined && mutation.operation !== "create") next = incrementRecordRevision(next);

    if (next !== undefined) {
      const nextWorldId = (next as { worldId?: unknown }).worldId;
      const nextId = (next as { id?: unknown }).id;
      if (nextWorldId !== undefined && nextWorldId !== this.worldId) {
        return [issue("wrong_world", `${prefix}.after.worldId`, "Resulting record belongs to a different world")];
      }
      if (nextId !== undefined && nextId !== mutation.target.recordId) {
        return [issue("record_id_mismatch", `${prefix}.after.id`, "Resulting record ID must match mutation target")];
      }
      const recordIssues = validateRecord(mutation.target.recordType, next)
        .filter((entry) => entry.severity === "error");
      if (recordIssues.length > 0) return withIssuePrefix(recordIssues, `${prefix}.after`);
      table.set(mutation.target.recordId, next);
    } else {
      table.delete(mutation.target.recordId);
    }

    return [];
  }
}

export const CANONICAL_STATE_STORE_VERSION = "0.1.0" as const;

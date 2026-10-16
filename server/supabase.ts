import { createClient } from '@supabase/supabase-js';
import type { ApplicationData, ApplicationRecord, ApplicationSummary } from '../src/types.js';
import type { ApplicationStage, DbsStatus, RtwStatus, StageHistoryEntry } from '../src/data/pipeline.js';

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

export async function saveApplication(referenceId: string, data: ApplicationData): Promise<void> {
  const supabase = getClient();
  const submittedAt = new Date().toISOString();
  const { error } = await supabase.from('care_applications').insert({
    reference_id: referenceId,
    applicant_name: [data.personal.firstName, data.personal.lastName].filter(Boolean).join(' '),
    email: data.contact.email1,
    phone: data.contact.mobileTel1,
    payload: data,
    stage_history: [
      { stage: 'right_to_work_check', at: submittedAt, by: 'system', note: 'Application submitted' },
    ] satisfies StageHistoryEntry[],
  });
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

export async function listApplications(): Promise<ApplicationSummary[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('care_applications')
    .select('id, reference_id, applicant_name, email, phone, stage, rtw_status, dbs_status, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  return data;
}

export async function getApplication(id: string): Promise<ApplicationRecord> {
  const supabase = getClient();
  const { data, error } = await supabase.from('care_applications').select('*').eq('id', id).single();
  if (error || !data) {
    throw new Error(`Application not found: ${error?.message ?? id}`);
  }
  return data;
}

export interface PipelinePatch {
  stage: ApplicationStage;
  rtw_status: RtwStatus;
  dbs_status: DbsStatus;
  closed_reason: string | null;
  stage_history: StageHistoryEntry[];
}

export async function updateApplicationPipeline(id: string, patch: PipelinePatch): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('care_applications').update(patch).eq('id', id);
  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }
}

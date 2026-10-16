import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthError, requireStaffAuth } from '../../../server/adminAuth.js';
import { getApplication, updateApplicationPipeline } from '../../../server/supabase.js';
import { sendStageChangeEmail } from '../../../server/email.js';
import { sendWhatsAppText } from '../../../server/whatsapp.js';
import { applyPipelineAction, STAGE_LABELS } from '../../../src/data/pipeline.js';
import type { PipelineAction, PipelineState } from '../../../src/data/pipeline.js';

function isPipelineAction(value: unknown): value is PipelineAction {
  return !!value && typeof value === 'object' && typeof (value as { type?: unknown }).type === 'string';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Missing application id' });
    return;
  }

  let staffId: string;
  try {
    staffId = await requireStaffAuth(req);
  } catch (err) {
    res.status(401).json({ error: err instanceof AuthError ? err.message : 'Unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const application = await getApplication(id);
      res.status(200).json({ application });
    } catch (err) {
      console.error('Failed to load application', err);
      res.status(404).json({ error: 'Application not found' });
    }
    return;
  }

  if (req.method === 'PATCH') {
    if (!isPipelineAction(req.body)) {
      res.status(400).json({ error: 'Invalid pipeline action' });
      return;
    }

    try {
      const current = await getApplication(id);
      const currentState: PipelineState = {
        stage: current.stage,
        rtwStatus: current.rtw_status,
        dbsStatus: current.dbs_status,
        closedReason: current.closed_reason ?? undefined,
        stageHistory: current.stage_history ?? [],
      };
      const next = applyPipelineAction(currentState, req.body, staffId);
      await updateApplicationPipeline(id, {
        stage: next.stage,
        rtw_status: next.rtwStatus,
        dbs_status: next.dbsStatus,
        closed_reason: next.closedReason ?? null,
        stage_history: next.stageHistory,
      });

      if (next.stage !== currentState.stage) {
        const applicantName = current.applicant_name || 'Unknown applicant';
        const note = next.stageHistory[next.stageHistory.length - 1]?.note;
        const [emailResult, whatsappResult] = await Promise.allSettled([
          sendStageChangeEmail(current.reference_id, applicantName, currentState.stage, next.stage, note),
          sendWhatsAppText(
            `${applicantName} (${current.reference_id}) moved to ${STAGE_LABELS[next.stage]}.${note ? ` ${note}` : ''}`,
          ),
        ]);
        if (emailResult.status === 'rejected') console.error('Stage-change email failed', emailResult.reason);
        if (whatsappResult.status === 'rejected') console.error('Stage-change WhatsApp failed', whatsappResult.reason);
      }

      res.status(200).json({ application: { ...current, ...currentToPatch(next) } });
    } catch (err) {
      console.error('Failed to update application', err);
      res.status(400).json({ error: err instanceof Error ? err.message : 'Could not update application' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

function currentToPatch(next: PipelineState) {
  return {
    stage: next.stage,
    rtw_status: next.rtwStatus,
    dbs_status: next.dbsStatus,
    closed_reason: next.closedReason ?? null,
    stage_history: next.stageHistory,
  };
}

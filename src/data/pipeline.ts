// The recruitment pipeline a submitted application moves through, run by
// staff from the admin panel. The right to work check is a hard gate: the
// only way to reach 'interview' is the 'pass_rtw' action below, so an
// applicant can never be interviewed before their eligibility is confirmed.

export type ApplicationStage =
  | 'right_to_work_check'
  | 'interview'
  | 'references_dbs'
  | 'offer'
  | 'closed_not_eligible';

export type RtwStatus = 'pending' | 'passed' | 'failed';
export type DbsStatus = 'pending' | 'applicant_applying' | 'link_sent' | 'completed';

export interface StageHistoryEntry {
  stage: ApplicationStage;
  at: string;
  by: string;
  note?: string;
}

export interface PipelineState {
  stage: ApplicationStage;
  rtwStatus: RtwStatus;
  dbsStatus: DbsStatus;
  closedReason?: string;
  stageHistory: StageHistoryEntry[];
}

export type PipelineAction =
  | { type: 'pass_rtw' }
  | { type: 'fail_rtw'; reason?: string }
  | { type: 'advance_to_references' }
  | { type: 'reject_at_interview'; reason?: string }
  | { type: 'set_dbs_status'; dbsStatus: DbsStatus }
  | { type: 'advance_to_offer' }
  | { type: 'reject_at_references'; reason?: string };

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  right_to_work_check: 'Right to work check',
  interview: 'Interview',
  references_dbs: 'References & DBS',
  offer: 'Offer & onboarding',
  closed_not_eligible: 'Closed',
};

export const DBS_STATUS_LABELS: Record<DbsStatus, string> = {
  pending: 'Not started',
  applicant_applying: 'Applicant is applying',
  link_sent: 'Link sent to applicant',
  completed: 'Certificate received',
};

export const RTW_STATUS_LABELS: Record<RtwStatus, string> = {
  pending: 'Not checked',
  passed: 'Passed',
  failed: 'Failed',
};

function entry(stage: ApplicationStage, by: string, note?: string): StageHistoryEntry {
  return { stage, at: new Date().toISOString(), by, note };
}

function assertStage(state: PipelineState, expected: ApplicationStage, action: string): void {
  if (state.stage !== expected) {
    throw new Error(
      `Cannot ${action}: application is at "${STAGE_LABELS[state.stage]}", not "${STAGE_LABELS[expected]}"`,
    );
  }
}

export function applyPipelineAction(state: PipelineState, action: PipelineAction, actor: string): PipelineState {
  switch (action.type) {
    case 'pass_rtw':
      assertStage(state, 'right_to_work_check', 'pass the right to work check');
      return {
        ...state,
        rtwStatus: 'passed',
        stage: 'interview',
        stageHistory: [...state.stageHistory, entry('interview', actor, 'Right to work check passed')],
      };

    case 'fail_rtw': {
      assertStage(state, 'right_to_work_check', 'fail the right to work check');
      const reason = action.reason?.trim() || 'Right to work check failed';
      return {
        ...state,
        rtwStatus: 'failed',
        stage: 'closed_not_eligible',
        closedReason: reason,
        stageHistory: [...state.stageHistory, entry('closed_not_eligible', actor, reason)],
      };
    }

    case 'advance_to_references':
      assertStage(state, 'interview', 'advance to references & DBS');
      return {
        ...state,
        stage: 'references_dbs',
        stageHistory: [...state.stageHistory, entry('references_dbs', actor, 'Interview passed')],
      };

    case 'reject_at_interview': {
      assertStage(state, 'interview', 'reject at interview');
      const reason = action.reason?.trim() || 'Not successful at interview';
      return {
        ...state,
        stage: 'closed_not_eligible',
        closedReason: reason,
        stageHistory: [...state.stageHistory, entry('closed_not_eligible', actor, reason)],
      };
    }

    case 'set_dbs_status':
      assertStage(state, 'references_dbs', 'update the DBS status');
      return { ...state, dbsStatus: action.dbsStatus };

    case 'advance_to_offer':
      assertStage(state, 'references_dbs', 'move to offer');
      if (state.dbsStatus !== 'completed') {
        throw new Error('Cannot move to offer: the Enhanced DBS certificate is not marked as received yet');
      }
      return {
        ...state,
        stage: 'offer',
        stageHistory: [...state.stageHistory, entry('offer', actor, 'References and DBS satisfied')],
      };

    case 'reject_at_references': {
      assertStage(state, 'references_dbs', 'reject at references & DBS');
      const reason = action.reason?.trim() || 'Did not pass references or DBS check';
      return {
        ...state,
        stage: 'closed_not_eligible',
        closedReason: reason,
        stageHistory: [...state.stageHistory, entry('closed_not_eligible', actor, reason)],
      };
    }
  }
}

export interface PipelineActionOption {
  label: string;
  action: PipelineAction;
  variant: 'primary' | 'danger';
  needsReason?: boolean;
}

export function getAvailableActions(stage: ApplicationStage): PipelineActionOption[] {
  switch (stage) {
    case 'right_to_work_check':
      return [
        { label: 'Pass — move to interview', action: { type: 'pass_rtw' }, variant: 'primary' },
        { label: 'Fail — close application', action: { type: 'fail_rtw' }, variant: 'danger', needsReason: true },
      ];
    case 'interview':
      return [
        { label: 'Advance to references & DBS', action: { type: 'advance_to_references' }, variant: 'primary' },
        {
          label: 'Reject — close application',
          action: { type: 'reject_at_interview' },
          variant: 'danger',
          needsReason: true,
        },
      ];
    case 'references_dbs':
      return [
        { label: 'Move to offer', action: { type: 'advance_to_offer' }, variant: 'primary' },
        {
          label: 'Reject — close application',
          action: { type: 'reject_at_references' },
          variant: 'danger',
          needsReason: true,
        },
      ];
    case 'offer':
    case 'closed_not_eligible':
      return [];
  }
}

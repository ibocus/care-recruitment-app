import type { ApplicationData } from '../types';
import type { Errors } from '../utils/validation';

export interface StepProps {
  data: ApplicationData;
  setData: (updater: (prev: ApplicationData) => ApplicationData) => void;
  errors: Errors;
}

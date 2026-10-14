'use client';

import { useEffect, useId, useRef, useState } from 'react';


export type MorphStatusState = 'idle' | 'pending' | 'success' | 'error';

export type MorphStatusButtonProps = {
  onSave: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  onStateChange?: (state: MorphStatusState) => void;
};

const labels: Record<MorphStatusState, string> = {
  idle: 'Send my brief',
  pending: 'Sending…',
  success: 'Sent',
  error: 'Try again',
};

export function MorphStatusButton({
  onSave,
  successMessage = 'The action promise resolved.',
  errorMessage = 'The action did not complete. Retry is available.',
  onStateChange,
}: MorphStatusButtonProps) {
  const [state, setState] = useState<MorphStatusState>('idle');
  const [message, setMessage] = useState('');
  const requestId = useRef(0);
  const inFlight = useRef(false);
  const succeeded = useRef(false);
  const mounted = useRef(false);
  const messageId = useId();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
      inFlight.current = false;
    };
  }, []);

  function notifyStateChange(nextState: MorphStatusState) {
    try {
      onStateChange?.(nextState);
    } catch (error) {
      console.error('MorphStatusButton state observer failed.', error);
    }
  }

  async function runSave() {
    if (inFlight.current || succeeded.current) return;
    inFlight.current = true;
    const currentRequest = ++requestId.current;
    setState('pending');
    notifyStateChange('pending');
    setMessage('Saving your answers and uploads…');

    try {
      await onSave();
      if (!mounted.current || requestId.current !== currentRequest) return;
      // Lock synchronously: observers can queue another activation before React commits.
      succeeded.current = true;
      setState('success');
      notifyStateChange('success');
      setMessage(successMessage);
    } catch (error) {
      if (!mounted.current || requestId.current !== currentRequest) return;
      setState('error');
      notifyStateChange('error');
      setMessage(error instanceof Error ? error.message : errorMessage);
    } finally {
      if (requestId.current === currentRequest) inFlight.current = false;
    }
  }

  const locked = state === 'pending' || state === 'success';
  const mark = state === 'pending'
    ? <span className="morph-status-spinner" aria-hidden="true" />
    : state === 'success' ? '✓' : state === 'error' ? '!' : '';

  return (
    <span className="morph-status-control">
      <button
        className="morph-status-button"
        type="button"
        data-state={state}
        disabled={locked}
        aria-disabled={locked}
        aria-busy={state === 'pending'}
        aria-describedby={messageId}
        onClick={runSave}
      >
        <span className="morph-status-button__mark" aria-hidden="true">{mark}</span>
        <span className="morph-status-button__label">{labels[state]}</span>
      </button>
      <span id={messageId} className="morph-status-message" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </span>
    </span>
  );
}

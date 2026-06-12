import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Subscribe to Postgres changes on a single table.
 * `onChange` is called on any INSERT / UPDATE / DELETE.
 * Pass `enabled = false` to pause the subscription.
 */
export function useRealtimeTable(
  table: string,
  onChange: () => void,
  enabled = true
) {
  // stable ref to avoid unnecessary resubscribes when the callback changes
  const onChangeRef = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        onChangeRef
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onChangeRef, enabled]);
}

/**
 * Subscribe to multiple tables at once.
 * `onChange` fires when ANY of the listed tables change.
 */
export function useRealtimeTables(
  tables: string[],
  onChange: () => void,
  enabled = true
) {
  const onChangeRef = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const channel = tables.reduce(
      (ch, table) =>
        ch.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          onChangeRef
        ),
      supabase.channel(`rt-multi-${Math.random().toString(36).slice(2)}`)
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables.join(','), onChangeRef, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}

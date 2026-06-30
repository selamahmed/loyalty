import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type RealtimeOptions = {
  debounceMs?: number;
};

/**
 * Subscribe to Postgres changes on a single table.
 * `onChange` is called on any INSERT / UPDATE / DELETE.
 * Pass `enabled = false` to pause the subscription.
 */
export function useRealtimeTable(
  table: string,
  onChange: () => void,
  enabled = true,
  options: RealtimeOptions = {},
) {
  const onChangeRef = useRef(onChange);
  const debounceMs = options.debounceMs ?? 500;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const notify = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => onChangeRef.current(), debounceMs);
    };

    const channel = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        notify,
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [table, enabled, debounceMs]);
}

/**
 * Subscribe to multiple tables at once.
 * `onChange` fires when ANY of the listed tables change.
 */
export function useRealtimeTables(
  tables: string[],
  onChange: () => void,
  enabled = true,
  options: RealtimeOptions = {},
) {
  const onChangeRef = useRef(onChange);
  const debounceMs = options.debounceMs ?? 500;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled || tables.length === 0) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const notify = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => onChangeRef.current(), debounceMs);
    };

    const channel = tables.reduce(
      (ch, table) =>
        ch.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          notify,
        ),
      supabase.channel(`rt-multi-${Math.random().toString(36).slice(2)}`)
    );

    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [tables.join(','), enabled, debounceMs]); // eslint-disable-line react-hooks/exhaustive-deps
}

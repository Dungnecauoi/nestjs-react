import { useQuery } from '@tanstack/react-query';
import { optionsApi } from '../api/modules/options.api';

export const SYSTEM_OPTIONS_QUERY_KEY = ['system-options'];

export function useSystemOptions() {
  return useQuery({
    queryKey: SYSTEM_OPTIONS_QUERY_KEY,
    queryFn: optionsApi.getOptions,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, simulateEvent, deleteEvent } from '../services/api';

export function useEvents(filters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    refetchInterval: 5000, // poll every 5 s for live feel
  });
}

export function useSimulateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: simulateEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

/**
 * useDocuments hook - SWR-based caching for document list
 * Eliminates redundant API calls when navigating between pages
 */

import useSWR from "swr"
import { listDocuments, DocumentInfo } from "@/lib/api"

const DOCUMENTS_KEY = "/api/documents"

// Fetcher function for SWR
const fetcher = async () => {
    const result = await listDocuments()
    return result.documents || []
}

/**
 * Hook to fetch and cache documents list
 * - Automatically caches results
 * - Deduplicates concurrent requests
 * - Revalidates on mount (configurable)
 */
export function useDocuments() {
    const { data, error, isLoading, mutate } = useSWR<DocumentInfo[]>(
        DOCUMENTS_KEY,
        fetcher,
        {
            revalidateOnFocus: false, // Don't refetch when tab regains focus
            revalidateOnReconnect: false, // Don't refetch on reconnect
            dedupingInterval: 60000, // Dedupe requests within 1 minute
        }
    )

    return {
        documents: data || [],
        isLoading,
        isError: !!error,
        error,
        mutate, // Expose mutate for manual revalidation after mutations
    }
}

/**
 * Invalidate the documents cache
 * Call this after ingest/delete operations
 */
export function invalidateDocuments() {
    // This is a module-level function for use outside of components
    // For in-component use, use the mutate returned from useDocuments
    return import("swr").then(({ mutate }) => mutate(DOCUMENTS_KEY))
}

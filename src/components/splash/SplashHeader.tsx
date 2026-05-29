import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Menu, Plus, Trash2, X } from 'lucide-react';
import NautaLogo from '../NautaLogo';
import {
  deleteTrip,
  listTripsForMenu,
  tripDisplayLabel,
  tripMenuLabel,
} from '../../lib/tripService';
import type { TripRecord } from '../../types/trip';
import type { TravelState } from '../../types/travelState';
import {
  buildItineraryMenuEntries,
  CURRENT_ITINERARY_VERSION_ID,
  travelStateFromTripRecord,
} from '../../lib/travel/itineraryVersionMenu';
import { travelPeriodSummary } from '../../lib/travel/planningSummary';
import TripItineraryVersionMenu from '../travel/TripItineraryVersionMenu';

type Props = {
  onSelectTrip: (trip: TripRecord) => void;
  onNewTrip: () => void;
  onTripDeleted?: (tripId: string) => void;
  activeTripId?: string | null;
  /** Live state for active trip — keeps version list in sync while editing. */
  travelState?: TravelState | null;
  itineraryVersionLoading?: boolean;
  onSelectItineraryVersion?: (tripId: string, versionId: string) => void;
  costSlot?: ReactNode;
};

function resolveTravelStateForTrip(
  trip: TripRecord,
  activeTripId: string | null | undefined,
  liveState: TravelState | null | undefined
): TravelState | null {
  if (trip.id === activeTripId && liveState) return liveState;
  return travelStateFromTripRecord(trip);
}

/** Sticky top bar: Nauta logo + burger menu with saved trips. */
export default function SplashHeader({
  onSelectTrip,
  onNewTrip,
  onTripDeleted,
  activeTripId,
  travelState,
  itineraryVersionLoading,
  onSelectItineraryVersion,
  costSlot,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuSelectedId, setMenuSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadTrips = useCallback(() => {
    setLoadingTrips(true);
    listTripsForMenu()
      .then((rows) => setTrips(rows))
      .catch(() => setTrips([]))
      .finally(() => setLoadingTrips(false));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    loadTrips();
  }, [menuOpen, loadTrips]);

  /** Keep menu trip row in sync with live travel_state after recalculate / restore. */
  useEffect(() => {
    if (!activeTripId || !travelState) return;
    setTrips((prev) =>
      prev.map((t) =>
        t.id === activeTripId
          ? { ...t, travel_state: travelState as unknown as Record<string, unknown> }
          : t
      )
    );
  }, [activeTripId, travelState]);

  useEffect(() => {
    if (!menuOpen) {
      setMenuSelectedId(null);
      setConfirmDeleteId(null);
      setDeleteError(null);
      return;
    }
    if (!activeTripId) return;
    const activeTrip = trips.find((t) => t.id === activeTripId);
    if (!activeTrip) return;
    const ts = resolveTravelStateForTrip(activeTrip, activeTripId, travelState);
    if (ts && buildItineraryMenuEntries(ts).length > 0) {
      setMenuSelectedId(activeTripId);
    }
  }, [menuOpen, activeTripId, travelState, trips]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  function handleTripRowClick(trip: TripRecord) {
    if (confirmDeleteId === trip.id) return;

    const ts = resolveTravelStateForTrip(trip, activeTripId, travelState);
    const hasVersions = ts ? buildItineraryMenuEntries(ts).length > 0 : false;

    if (menuSelectedId === trip.id) {
      onSelectTrip(trip);
      setMenuOpen(false);
      setMenuSelectedId(null);
      return;
    }

    setMenuSelectedId(trip.id);
    setConfirmDeleteId(null);
    setDeleteError(null);

    if (!hasVersions && trip.id === activeTripId) {
      onSelectTrip(trip);
      setMenuOpen(false);
      setMenuSelectedId(null);
    }
  }

  function requestDelete(e: React.MouseEvent, tripId: string) {
    e.preventDefault();
    e.stopPropagation();
    setMenuSelectedId(tripId);
    setDeleteError(null);
    setConfirmDeleteId(tripId);
  }

  function cancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(null);
    setDeleteError(null);
  }

  function handleItineraryVersionClick(trip: TripRecord, versionId: string) {
    if (versionId !== CURRENT_ITINERARY_VERSION_ID) {
      onSelectItineraryVersion?.(trip.id, versionId);
    }
    if (trip.id !== activeTripId) {
      onSelectTrip(trip);
    }
    setMenuOpen(false);
    setMenuSelectedId(null);
  }

  async function confirmDelete(e: React.MouseEvent, trip: TripRecord) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(trip.id);
    setDeleteError(null);
    try {
      await deleteTrip(trip.id);
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      setConfirmDeleteId(null);
      setMenuSelectedId(null);
      onTripDeleted?.(trip.id);
    } catch {
      setDeleteError('Eliminazione non riuscita');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <header className="sticky top-0 z-[100] bg-stone-950/95 backdrop-blur-md border-b border-amber-900/20">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <NautaLogo height={40} />

        {costSlot}

        <div className="relative z-[110]" ref={panelRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-200/90 hover:bg-amber-900/20 border border-amber-800/30 transition-colors"
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border border-amber-900/40 bg-stone-900 shadow-xl shadow-black/40 py-1"
              style={{ overflow: 'visible' }}
            >
              <button
                type="button"
                onClick={() => {
                  onNewTrip();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-teal-200/95 hover:bg-teal-950/50 transition-colors"
              >
                <Plus size={18} className="shrink-0 text-teal-400" aria-hidden />
                Crea nuovo viaggio
              </button>

              <div className="my-1 border-t border-amber-900/40" aria-hidden />

              <ul
                className={`max-h-[min(70vh,24rem)] overflow-y-auto overflow-x-visible list-none m-0 p-0 ${
                  confirmDeleteId ? 'pb-24' : ''
                }`}
              >
                {loadingTrips ? (
                  <li className="px-4 py-3 text-sm text-stone-500">Caricamento...</li>
                ) : trips.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-stone-500 italic">Nessun viaggio salvato</li>
                ) : (
                  trips.map((trip) => {
                    const isActive = trip.id === activeTripId;
                    const isDeleting = deletingId === trip.id;
                    const isExpanded = menuSelectedId === trip.id;
                    const isConfirming = confirmDeleteId === trip.id;
                    const tsForMenu = resolveTravelStateForTrip(trip, activeTripId, travelState);
                    const versionEntries = tsForMenu ? buildItineraryMenuEntries(tsForMenu) : [];
                    const tripMetaLine = tsForMenu ? travelPeriodSummary(tsForMenu.profile) : '';
                    const showVersionPanel =
                      isExpanded && !isConfirming && versionEntries.length > 0;

                    return (
                      <li
                        key={trip.id}
                        className={[
                          'trip-menu-row relative',
                          isExpanded || isConfirming ? 'trip-menu-selected' : '',
                          isConfirming ? 'trip-menu-confirming z-30' : isExpanded ? 'z-20' : 'z-0',
                          isActive || isExpanded ? 'bg-amber-900/15' : '',
                        ].join(' ')}
                      >
                        <div className="relative flex items-start">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleTripRowClick(trip)}
                            className="flex-1 min-w-0 text-left pl-4 pr-14 py-2.5 text-sm text-amber-100/90 transition-colors disabled:opacity-50"
                          >
                            <span className="font-medium block truncate">
                              {tripMenuLabel(trip, trips)}
                            </span>
                            {!isExpanded && versionEntries.length > 0 ? (
                              <span className="text-[10px] text-amber-500/65 block mt-0.5">
                                {versionEntries.length}{' '}
                                {versionEntries.length === 1 ? 'itinerario' : 'itinerari'}
                              </span>
                            ) : null}
                            {isExpanded && !showVersionPanel && !isConfirming ? (
                              <span className="text-[10px] text-amber-500/70 block mt-0.5">
                                Tocca di nuovo per aprire
                              </span>
                            ) : null}
                            {trip.status === 'completed' && !isExpanded ? (
                              <span className="text-[10px] text-amber-600/80 uppercase tracking-wide block">
                                Completato
                              </span>
                            ) : null}
                          </button>

                          <div className="absolute right-1 top-2 flex flex-col items-end z-40">
                            <button
                              type="button"
                              title="Elimina viaggio"
                              aria-label={`Elimina ${tripDisplayLabel(trip)}`}
                              disabled={isDeleting || !isExpanded}
                              onClick={(e) => requestDelete(e, trip.id)}
                              className="trip-menu-delete-btn w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 disabled:opacity-40"
                            >
                              <Trash2 size={18} strokeWidth={2.5} aria-hidden />
                            </button>

                            {isConfirming && (
                              <div
                                role="dialog"
                                aria-label="Conferma eliminazione"
                                className="mt-1 min-w-[9.5rem] rounded-lg border border-amber-900/50 bg-stone-950 shadow-lg shadow-black/60 px-2 py-2"
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <p className="text-[10px] text-amber-200/70 mb-1.5">Eliminare?</p>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={(e) => void confirmDelete(e, trip)}
                                    className="flex-1 rounded-md bg-red-900/80 hover:bg-red-800 text-amber-50 text-[11px] font-semibold py-1 disabled:opacity-50"
                                  >
                                    Confermo
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={cancelDelete}
                                    className="flex-1 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-100/90 text-[11px] font-medium py-1 disabled:opacity-50"
                                  >
                                    Annulla
                                  </button>
                                </div>
                                {deleteError ? (
                                  <p className="text-[10px] text-red-400 mt-1">{deleteError}</p>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>

                        {showVersionPanel ? (
                          <div className="pb-2 pl-1 pr-2">
                            {tripMetaLine ? (
                              <p className="text-[10px] text-amber-500/70 px-3 pb-1 truncate">
                                {tripMetaLine}
                              </p>
                            ) : null}
                            <TripItineraryVersionMenu
                              entries={versionEntries}
                              disabled={itineraryVersionLoading}
                              onSelect={(versionId) =>
                                handleItineraryVersionClick(trip, versionId)
                              }
                            />
                          </div>
                        ) : null}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

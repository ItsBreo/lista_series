'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WatchItem, ItemStatus, Genre } from '@/lib/types';
import { Locale, t } from '@/lib/i18n';
import {
  subscribeToWatchlist,
  addItem,
  updateItem,
  deleteItem,
} from '@/lib/watchlist-service';
import WatchCard from '@/components/WatchCard';
import AddEditModal from '@/components/AddEditModal';
import DetailModal from '@/components/DetailModal';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';
import LanguageToggle from '@/components/LanguageToggle';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
  exiting?: boolean;
}

// Cuántas tarjetas se muestran por página
const PAGE_SIZE = 12;

export default function Home() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<Locale>('es');

  // Filters
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [genreFilter, setGenreFilter] = useState<Genre | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);

  // Detail view
  const [detailItem, setDetailItem] = useState<WatchItem | null>(null);

  // Delete confirm
  const [deletingItem, setDeletingItem] = useState<WatchItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const tr = t(locale);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Start exit animation after 2.5s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
    }, 2500);

    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Load locale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('watchlist-locale');
    if (saved === 'es' || saved === 'en') {
      setLocale(saved);
    }
  }, []);

  // Subscribe to Firestore
  useEffect(() => {
    const unsubscribe = subscribeToWatchlist(
      (newItems) => {
        setItems(newItems);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setLoading(false);
        showToast(
          locale === 'es'
            ? 'Error al conectar con la base de datos'
            : 'Error connecting to database',
          'error'
        );
      }
    );
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('watchlist-locale', newLocale);
  };

  // Filter items
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (genreFilter !== 'all' && item.genre !== genreFilter) return false;
    if (normalizedSearch && !item.title.toLowerCase().includes(normalizedSearch))
      return false;
    return true;
  });

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages); // clamp (e.g. after deletes)
  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Back to the first page whenever the filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genreFilter, searchTerm]);

  // Stats
  const stats = {
    total: items.length,
    watching: items.filter((i) => i.status === 'watching').length,
    completed: items.filter((i) => i.status === 'completed').length,
    pending: items.filter((i) => i.status === 'pending').length,
  };

  // Modal handlers
  const handleOpenAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: WatchItem) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleOpenDetail = useCallback((item: WatchItem) => {
    setDetailItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailItem(null);
  }, []);

  const handleEditFromDetail = useCallback((item: WatchItem) => {
    setDetailItem(null);
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleSave = async (data: Partial<WatchItem>): Promise<boolean> => {
    const isUpdate = !!data.id;
    const started = performance.now();

    // Firestore applies the write to its local cache immediately, but the
    // returned promise only resolves once the SERVER acknowledges it.
    let writePromise: Promise<unknown>;
    if (isUpdate) {
      const { id, ...updateData } = data;
      writePromise = updateItem(id as string, updateData);
    } else {
      writePromise = addItem(data as WatchItem);
    }

    // Diagnostics — shows in the browser console how long the real
    // server confirmation takes (or the exact error if it fails).
    writePromise
      .then(() =>
        console.log(
          `[save] confirmado por el servidor en ${Math.round(
            performance.now() - started
          )} ms`
        )
      )
      .catch((e) => console.error('[save] la escritura falló:', e));

    try {
      // Never let the spinner hang forever waiting for the server.
      await Promise.race([
        writePromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SAVE_TIMEOUT')), 8000)
        ),
      ]);
      showToast(
        isUpdate
          ? locale === 'es'
            ? '✏️ Actualizado correctamente'
            : '✏️ Updated successfully'
          : locale === 'es'
          ? `🎬 "${data.title}" añadido a la lista`
          : `🎬 "${data.title}" added to the list`,
        'success'
      );
      handleCloseModal();
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === 'SAVE_TIMEOUT') {
        // The write is stored locally and will sync when the connection
        // recovers — unblock the user instead of leaving the spinner.
        console.warn(
          '[save] sin confirmación del servidor en 8s; se sincronizará en segundo plano'
        );
        showToast(
          locale === 'es' ? '💾 Guardado. Sincronizando…' : '💾 Saved. Syncing…',
          'success'
        );
        handleCloseModal();
        return true;
      }
      console.error('Error saving item:', error);
      showToast(
        locale === 'es'
          ? 'Error al guardar. Inténtalo de nuevo.'
          : 'Error saving. Please try again.',
        'error'
      );
      return false;
    }
  };

  // Delete handlers
  const handleRequestDelete = useCallback((item: WatchItem) => {
    setDeletingItem(item);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      const title = deletingItem.title;
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
      showToast(
        locale === 'es'
          ? `🗑️ "${title}" eliminado`
          : `🗑️ "${title}" deleted`,
        'success'
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast(
        locale === 'es'
          ? 'Error al eliminar. Inténtalo de nuevo.'
          : 'Error deleting. Please try again.',
        'error'
      );
    }
  };

  const handleCancelDelete = useCallback(() => {
    setDeletingItem(null);
  }, []);

  return (
    <main className="app-container">
      {/* Header */}
      <header className="header" id="app-header">
        <div className="header-left">
          <span className="header-icon">🎬</span>
          <div>
            <h1 className="header-title">{tr.appTitle}</h1>
            <p className="header-subtitle">{tr.appSubtitle}</p>
          </div>
        </div>
        <div className="header-actions">
          <LanguageToggle locale={locale} onChange={handleLocaleChange} />
          <button
            className="btn btn-primary"
            onClick={handleOpenAdd}
            id="btn-add-new"
          >
            <span>+</span> {tr.add}
          </button>
        </div>
      </header>

      {/* Stats */}
      {items.length > 0 && (
        <div className="stats-bar" id="stats-bar">
          <div className="stat-chip">
            <span className="stat-count">{stats.total}</span> {tr.totalItems}
          </div>
          <div className="stat-chip stat-watching">
            <span className="stat-dot" />
            <span className="stat-count">{stats.watching}</span> {tr.watchingCount}
          </div>
          <div className="stat-chip stat-completed">
            <span className="stat-dot" />
            <span className="stat-count">{stats.completed}</span> {tr.completedCount}
          </div>
          <div className="stat-chip stat-pending">
            <span className="stat-dot" />
            <span className="stat-count">{stats.pending}</span> {tr.pendingCount}
          </div>
        </div>
      )}

      {/* Filters */}
      {items.length > 0 && (
        <FilterBar
          locale={locale}
          activeStatus={statusFilter}
          activeGenre={genreFilter}
          searchTerm={searchTerm}
          onStatusChange={setStatusFilter}
          onGenreChange={setGenreFilter}
          onSearchChange={setSearchTerm}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState locale={locale} onAdd={handleOpenAdd} />
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p className="empty-message" style={{ marginBottom: 0 }}>
            {locale === 'es'
              ? 'No hay resultados con estos filtros'
              : 'No results with these filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="cards-grid" id="cards-grid">
            {paginatedItems.map((item, index) => (
              <WatchCard
                key={item.id}
                item={item}
                locale={locale}
                onEdit={handleOpenEdit}
                onDelete={handleRequestDelete}
                onOpenDetail={handleOpenDetail}
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" id="pagination" aria-label="Paginación">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(page - 1)}
                disabled={page === 1}
                id="page-prev"
                aria-label={locale === 'es' ? 'Anterior' : 'Previous'}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`pagination-btn${n === page ? ' active' : ''}`}
                  onClick={() => setCurrentPage(n)}
                  id={`page-${n}`}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(page + 1)}
                disabled={page === totalPages}
                id="page-next"
                aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
              >
                ›
              </button>
            </nav>
          )}
        </>
      )}

      {/* Detail Modal — always show the freshest version of the item */}
      <DetailModal
        locale={locale}
        item={
          detailItem
            ? items.find((i) => i.id === detailItem.id) ?? detailItem
            : null
        }
        onClose={handleCloseDetail}
        onEdit={handleEditFromDetail}
      />

      {/* Add/Edit Modal */}
      <AddEditModal
        locale={locale}
        item={editingItem}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      {deletingItem && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete} id="delete-overlay">
          <div
            className="delete-confirm-dialog"
            onClick={(e) => e.stopPropagation()}
            id="delete-dialog"
          >
            <div className="delete-confirm-icon">⚠️</div>
            <h3 className="delete-confirm-title">{tr.confirmDelete}</h3>
            <p className="delete-confirm-message">
              {tr.confirmDeleteMessage} &quot;{deletingItem.title}&quot;?
            </p>
            <div className="delete-confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                id="delete-cancel-btn"
              >
                {tr.cancel}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                id="delete-confirm-btn"
              >
                {tr.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}${toast.exiting ? ' toast-exit' : ''}`}
          style={{ bottom: `${1.5 + toasts.indexOf(toast) * 3.5}rem` }}
          id={`toast-${toast.id}`}
        >
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : '❌'}
          </span>
          {toast.message}
        </div>
      ))}
    </main>
  );
}

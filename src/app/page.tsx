'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchItem, ItemStatus, Genre } from '@/lib/types';
import { Locale, t, getStatusLabel } from '@/lib/i18n';
import {
  subscribeToWatchlist,
  addItem,
  updateItem,
  deleteItem,
} from '@/lib/watchlist-service';
import WatchCard from '@/components/WatchCard';
import AddEditModal from '@/components/AddEditModal';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';
import LanguageToggle from '@/components/LanguageToggle';

export default function Home() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<Locale>('es');

  // Filters
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [genreFilter, setGenreFilter] = useState<Genre | 'all'>('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);

  // Delete confirm
  const [deletingItem, setDeletingItem] = useState<WatchItem | null>(null);

  const tr = t(locale);

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
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('watchlist-locale', newLocale);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (genreFilter !== 'all' && item.genre !== genreFilter) return false;
    return true;
  });

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

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleSave = async (data: Partial<WatchItem>) => {
    try {
      if (data.id) {
        // Editing
        const { id, ...updateData } = data;
        await updateItem(id, updateData);
      } else {
        // Adding
        await addItem(data as WatchItem);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Delete handlers
  const handleRequestDelete = useCallback((item: WatchItem) => {
    setDeletingItem(item);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
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
          onStatusChange={setStatusFilter}
          onGenreChange={setGenreFilter}
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
        <div className="cards-grid" id="cards-grid">
          {filteredItems.map((item, index) => (
            <WatchCard
              key={item.id}
              item={item}
              locale={locale}
              onEdit={handleOpenEdit}
              onDelete={handleRequestDelete}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      )}

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
    </main>
  );
}

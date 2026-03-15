'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import DetailModal from '../components/DetailModal';
import ThemeToggle from '../components/ThemeToggle';
import styles from './page.module.css';

const TABS = [
  { id: 'abilities', label: 'Poderes', icon: '⚡', endpoint: '/abilities' },
  { id: 'rituals', label: 'Rituais', icon: '✨', endpoint: '/rituals' },
  { id: 'items', label: 'Itens', icon: '🧭', endpoint: '/items' },
  { id: 'rules', label: 'Regras', icon: '📖', endpoint: '/rules' },
  { id: 'classes', label: 'Classes', icon: '🛡️', endpoint: '/classes' },
  { id: 'tracks', label: 'Trilhas', icon: '🛤️', endpoint: '/tracks' },
  { id: 'weapons', label: 'Armas', icon: '🗡️', endpoint: '/weapons' },
  { id: 'threats', label: 'Ameaças', icon: '💀', endpoint: '/threats' }
];

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(() => {
    if (tabQuery && TABS.some(t => t.id === tabQuery)) {
      return tabQuery;
    }
    return 'abilities';
  });

  useEffect(() => {
    if (tabQuery && TABS.some(t => t.id === tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableWeaponTypes, setAvailableWeaponTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWeaponType, setSelectedWeaponType] = useState('');
  const [availableThreatTypes, setAvailableThreatTypes] = useState([]);
  const [availableElements, setAvailableElements] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedThreatType, setSelectedThreatType] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  
  const [showTags, setShowTags] = useState(true);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const activeTabData = TABS.find((tab) => tab.id === activeTab);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [items, selectedTags, selectedBook, selectedCategory, selectedWeaponType, sortBy, sortOrder, activeTab, selectedThreatType, selectedElement, selectedSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${activeTabData.endpoint}`,
        { params: { limit: 1000 } }
      );
      setItems(response.data.data || []);

      const metaResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${activeTabData.endpoint}/meta`);
      setAvailableTags(metaResponse.data.tags || []);
      setAvailableBooks(metaResponse.data.books || []);
      
      if (activeTab === 'weapons') {
        setAvailableCategories(metaResponse.data.categories || []);
        setAvailableWeaponTypes(metaResponse.data.types || []);
      } else if (activeTab === 'threats') {
        setAvailableThreatTypes(metaResponse.data.types || []);
        setAvailableElements(metaResponse.data.elements || []);
        setAvailableSizes(metaResponse.data.sizes || []);
      } else {
        setAvailableCategories([]);
        setAvailableWeaponTypes([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setItems([]);
      setAvailableTags([]);
      setAvailableBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...items];

    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => {
        const itemTags = item.tags || [];
        return selectedTags.every(tag => itemTags.includes(tag));
      });
    }

    if (selectedBook) {
      filtered = filtered.filter(item => item.book === selectedBook || item.source === selectedBook);
    }

    if (activeTab === 'weapons') {
      if (selectedCategory) filtered = filtered.filter(item => item.category === selectedCategory);
      if (selectedWeaponType) filtered = filtered.filter(item => item.type === selectedWeaponType);
    }

    if (activeTab === 'threats') {
      if (selectedThreatType) filtered = filtered.filter(item => item.type === selectedThreatType);
      if (selectedElement) filtered = filtered.filter(item => (item.elements || []).includes(selectedElement));
      if (selectedSize) filtered = filtered.filter(item => item.size === selectedSize);
    }

    filtered.sort((a, b) => {
      let aValue = sortBy === 'name' ? (a.name || a.title || '').toLowerCase() : new Date(a.createdAt || 0);
      let bValue = sortBy === 'name' ? (b.name || b.title || '').toLowerCase() : new Date(b.createdAt || 0);

      if (sortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    setFilteredItems(filtered);
  }, [items, selectedTags, selectedBook, sortBy, sortOrder, activeTab, selectedCategory, selectedWeaponType, selectedThreatType, selectedElement, selectedSize]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearFilters = () => {
    setSelectedTags([]); setSelectedBook(''); setSelectedCategory(''); setSelectedWeaponType('');
    setSelectedThreatType(''); setSelectedElement(''); setSelectedSize(''); setTagSearchQuery('');
  };

  const getFilteredTags = useCallback(() => {
    if (!tagSearchQuery.trim()) return availableTags;
    const query = tagSearchQuery.toLowerCase();
    return availableTags.filter(tag => tag.toLowerCase().includes(query));
  }, [availableTags, tagSearchQuery]);

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setModalType(activeTab === 'abilities' ? 'ability' : activeTab === 'rituals' ? 'ritual' :
                 activeTab === 'items' ? 'item' : activeTab === 'classes' ? 'class' :
                 activeTab === 'tracks' ? 'track' : activeTab === 'weapons' ? 'weapon' : 
                 activeTab === 'threats' ? 'threat' : 'rule');
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const getGroupedItems = () => {
    const groups = {};

    filteredItems.forEach(item => {
      let groupKey = 'Outros';
      let isParanormalGroup = false;

      switch (activeTab) {
        case 'abilities': groupKey = item.origin ? 'Com Origem' : 'Sem Origem'; break;
        case 'rituals': groupKey = item.circle ? `Círculo ${item.circle}` : 'Sem Círculo'; break;
        case 'items':
          groupKey = item.paranormal ? 'Itens Paranormais' : 'Itens Comuns';
          isParanormalGroup = item.paranormal === true;
          break;
        case 'rules': groupKey = item.section || 'Sem Secção'; break;
        case 'classes': groupKey = 'Classes'; break;
        case 'tracks': groupKey = item.class ? (typeof item.class === 'object' ? item.class.name || item.class.title || 'Sem Classe' : item.class) : 'Sem Classe'; break;
        case 'weapons': groupKey = item.type || 'Sem Tipo'; break;
        case 'threats': groupKey = item.type || 'Sem Tipo'; break;
      }

      if (!groups[groupKey]) groups[groupKey] = { title: groupKey, items: [], isParanormal: isParanormalGroup };
      groups[groupKey].items.push(item);
    });

    return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title));
  };

  const groupedItems = getGroupedItems();

  const renderTable = (title, itemsToRender, isParanormal) => {
    if (itemsToRender.length === 0) return null;

    return (
      <div key={title} className={`${styles.categorySection} ${isParanormal ? styles.paranormalSection : ''}`}>
        <h3 className={`${styles.categoryTitle} ${isParanormal ? styles.paranormalTitle : ''}`}>
          {title} <span className={styles.itemCount}>({itemsToRender.length})</span>
        </h3>
        <div className={styles.tableWrapper}>
          <table className={`${styles.dataTable} ${isParanormal ? styles.paranormalTable : ''}`}>
            <thead>
              <tr>
                <th>Nome</th>
                {activeTab === 'abilities' && <th>Origem</th>}
                {activeTab === 'rituals' && <th>Duração</th>}
                {activeTab === 'rules' && <th>Secção</th>}
                {activeTab === 'items' && <th>Categoria</th>}
                {activeTab === 'weapons' && <><th>Categoria</th><th>Tipo</th></>}
                {activeTab === 'threats' && <><th>VD</th><th>Tamanho</th><th>Elementos</th></>}
                <th>Livro</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((item) => (
                <tr key={item._id} className={`${styles.tableRow} ${isParanormal ? styles.paranormalRow : ''}`} onClick={() => openDetailModal(item)}>
                  <td className={styles.nameCell}>{item.name || item.title}</td>
                  {activeTab === 'abilities' && <td>{item.origin || '-'}</td>}
                  {activeTab === 'rituals' && <td>{item.duration || '-'}</td>}
                  {activeTab === 'rules' && <td>{item.section || '-'}</td>}
                  {activeTab === 'items' && <td>{item.category || '-'}</td>}
                  {activeTab === 'weapons' && <><td>{item.category || '-'}</td><td>{item.type || '-'}</td></>}
                  {activeTab === 'threats' && <>
                    <td><span className={styles.vdBadge}>{item.vd || '-'}</span></td>
                    <td>{item.size || '-'}</td>
                    <td>{item.elements && item.elements.length > 0 ? item.elements.join(', ') : 'Nenhum'}</td>
                  </>}
                  <td className={styles.bookCell}>{item.book || item.source || '-'}</td>
                  <td>
                    <div className={styles.tagsCell}>
                      {(item.tags || []).slice(0, 3).map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                      {(item.tags || []).length > 3 && <span className={styles.moreTags}>+{(item.tags || []).length - 3}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/" className={styles.backLink}>&larr; Voltar à Página Principal</Link>
            <ThemeToggle />
          </div>
          <h1 className={styles.title}>Arquivo Paranormal</h1>
          <p className={styles.subtitle}>Aceda à base de dados completa da Ordem.</p>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.tabNavigation}>
          {TABS.map((tab) => (
            <button key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.filters}>
{activeTab !== 'classes' && activeTab !== 'tracks' && (
            <div className={styles.filterSection}>
              <div className={styles.filterHeader} onClick={() => setShowTags(!showTags)}>
                <h3>Filtrar por Tags</h3>
                <span className={`${styles.expandIcon} ${showTags ? styles.expanded : ''}`}>▼</span>
              </div>
              
              {/* A barra de pesquisa fica agora sempre visível */}
              <input 
                type="text" 
                placeholder="🔍 Pesquisar tags..." 
                value={tagSearchQuery} 
                onChange={(e) => {
                  setTagSearchQuery(e.target.value);
                  // Se o utilizador começar a escrever e as tags estiverem escondidas, abre-as automaticamente!
                  if (!showTags) setShowTags(true); 
                }} 
                className={styles.tagSearchInput} 
              />

              {/* Apenas os botões das tags ficam escondidos/mostrados */}
              {showTags && (
                <div className={styles.tagFilters}>
                  {getFilteredTags().length > 0 ? (
                    getFilteredTags().map(tag => (
                      <button key={tag} className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.tagSelected : ''}`} onClick={() => handleTagToggle(tag)}>
                        {tag}
                      </button>
                    ))
                  ) : (<div className={styles.noTagsMessage}>Nenhuma tag encontrada</div>)}
                </div>
              )}
            </div>
          )}

          <div className={styles.filterSection}>
            <div className={styles.filterHeader}><h3>Filtrar por Livro</h3></div>
            <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} className={styles.aeroSelect}>
              <option value="">Todos os livros</option>
              {availableBooks.map(book => <option key={book} value={book}>{book}</option>)}
            </select>
          </div>

          {activeTab === 'weapons' && (
            <>
              <div className={styles.filterSection}>
                <div className={styles.filterHeader}><h3>Filtrar por Categoria</h3></div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={styles.aeroSelect}>
                  <option value="">Todas as categorias</option>
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className={styles.filterSection}>
                <div className={styles.filterHeader}><h3>Filtrar por Tipo</h3></div>
                <select value={selectedWeaponType} onChange={(e) => setSelectedWeaponType(e.target.value)} className={styles.aeroSelect}>
                  <option value="">Todos os tipos</option>
                  {availableWeaponTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </>
          )}

          {activeTab === 'threats' && (
            <>
              <div className={styles.filterSection}>
                <div className={styles.filterHeader}><h3>Filtrar por Tipo</h3></div>
                <select value={selectedThreatType} onChange={(e) => setSelectedThreatType(e.target.value)} className={styles.aeroSelect}>
                  <option value="">Todos os tipos</option>
                  {availableThreatTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.filterSection}>
                <div className={styles.filterHeader}><h3>Filtrar por Elemento</h3></div>
                <select value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)} className={styles.aeroSelect}>
                  <option value="">Todos os elementos</option>
                  {availableElements.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </>
          )}

          <div className={styles.filterSection}>
            <div className={styles.filterHeader}><h3>Ordenar</h3></div>
            <div className={styles.sortControls}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.aeroSelect}>
                <option value="name">Nome (A-Z)</option>
                <option value="date">Adicionado a</option>
              </select>
              <button className={styles.sortOrderButton} onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} title="Inverter ordem">
                {sortOrder === 'asc' ? '⬇️' : '⬆️'}
              </button>
            </div>
          </div>

          {(selectedTags.length > 0 || selectedBook || selectedCategory || selectedWeaponType || selectedThreatType || selectedElement || selectedSize) && (
            <button className={styles.clearFiltersButton} onClick={clearFilters}>Limpar Filtros</button>
          )}
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner}></div>
              <p>A sincronizar dados da Ordem...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum registo encontrado com estes parâmetros.</p>
            </div>
          ) : (
            <div className={styles.tablesContainer}>
              {groupedItems.map(group => renderTable(group.title, group.items, group.isParanormal))}
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <DetailModal item={selectedItem} type={modalType} onClose={closeDetailModal} onUpdate={fetchData} />
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className={styles.loadingBox}><div className={styles.spinner}></div><p>A iniciar terminal...</p></div>}>
      <BrowsePageContent />
    </Suspense>
  );
}
import React, { useState, useEffect } from 'react';
import { menuItemApi, categoryApi } from '../services/api';
import type { MenuItemDto, CreateMenuItemDto, ItemType } from '../types/menuItem';
import type { CategoryDto } from '../types/category';
import './DrinksManagement.css';

const DrinksManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
    const [items, setItems] = useState<MenuItemDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showItemModal, setShowItemModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'items') {
                const [itemsRes, categoriesRes] = await Promise.all([
                    menuItemApi.getAll(),
                    categoryApi.getAllCategories()
                ]);

                if (itemsRes.success && itemsRes.data) {
                    setItems(itemsRes.data);
                }
                if (categoriesRes.success && categoriesRes.data) {
                    setCategories(categoriesRes.data);
                }
            } else {
                const categoriesRes = await categoryApi.getAllCategories();
                if (categoriesRes.success && categoriesRes.data) {
                    setCategories(categoriesRes.data);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await menuItemApi.delete(id);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Error deleting item');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryApi.deleteCategory(id);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Error deleting category');
        }
    };

    const formatType = (row: MenuItemDto) => {
        if (row.itemType === 'Food') return 'Food';
        return row.isAlcoholic ? `Drink (Alcoholic ${row.alcoholPercentage ?? 0}%)` : 'Drink (non-alcoholic)';
    };

    return (
        <div className="drinks-management">
            <div className="management-header">
                <h2>Menu & categories</h2>
                <div className="sub-tabs">
                    <button
                        className={`sub-tab ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        Menu items
                    </button>
                    <button
                        className={`sub-tab ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {activeTab === 'items' ? (
                <div className="drinks-section">
                    <div className="section-actions">
                        <button className="create-btn" onClick={() => {
                            setEditingItem(null);
                            setShowItemModal(true);
                        }}>+ Add item</button>
                    </div>
                    {loading ? <div className="loading">Loading menu...</div> : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.name}</td>
                                        <td>{row.categoryName}</td>
                                        <td>€ {row.price.toFixed(2)}</td>
                                        <td>{formatType(row)}</td>
                                        <td>
                                            <span className={`status-badge ${row.isAvailable ? 'available' : 'unavailable'}`}>
                                                {row.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="edit-btn" onClick={() => {
                                                setEditingItem(row);
                                                setShowItemModal(true);
                                            }}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteItem(row.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="categories-section">
                    <div className="section-actions">
                        <button className="create-btn" onClick={() => {
                            setEditingCategory(null);
                            setShowCategoryModal(true);
                        }}>+ Add Category</button>
                    </div>
                    {loading ? <div className="loading">Loading categories...</div> : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(category => (
                                    <tr key={category.id}>
                                        <td>{category.id}</td>
                                        <td>{category.name}</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => {
                                                setEditingCategory(category);
                                                setShowCategoryModal(true);
                                            }}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {showItemModal && (
                <MenuItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setShowItemModal(false)}
                    onSave={() => {
                        setShowItemModal(false);
                        loadData();
                    }}
                />
            )}

            {showCategoryModal && (
                <CategoryModal
                    category={editingCategory}
                    onClose={() => setShowCategoryModal(false)}
                    onSave={() => {
                        setShowCategoryModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

const MenuItemModal: React.FC<{
    item: MenuItemDto | null;
    categories: CategoryDto[];
    onClose: () => void;
    onSave: () => void;
}> = ({ item, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<CreateMenuItemDto>({
        name: item?.name || '',
        price: item?.price || 0,
        categoryId: item?.categoryId || (categories[0]?.id || 0),
        itemType: (item?.itemType as ItemType) || 'Drink',
        isAlcoholic: item?.itemType === 'Drink' ? (item?.isAlcoholic || false) : false,
        alcoholPercentage: item?.alcoholPercentage || 0,
        imageUrl: item?.imageUrl || '',
        isAvailable: item?.isAvailable ?? true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: CreateMenuItemDto = {
                ...formData,
                isAlcoholic: formData.itemType === 'Drink' ? formData.isAlcoholic : false,
                alcoholPercentage: formData.itemType === 'Drink' && formData.isAlcoholic ? formData.alcoholPercentage : undefined,
            };
            if (item) {
                await menuItemApi.update(item.id, payload);
            } else {
                await menuItemApi.create(payload);
            }
            onSave();
        } catch (err: any) {
            alert(err.message || 'Error saving item');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{item ? 'Edit menu item' : 'New menu item'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Price (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: parseInt(e.target.value, 10) })}
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Item type</label>
                        <select
                            value={formData.itemType}
                            onChange={e => setFormData({
                                ...formData,
                                itemType: e.target.value as ItemType,
                                isAlcoholic: e.target.value === 'Food' ? false : formData.isAlcoholic,
                            })}
                        >
                            <option value="Drink">Drink</option>
                            <option value="Food">Food</option>
                        </select>
                    </div>
                    {formData.itemType === 'Drink' && (
                        <>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isAlcoholic}
                                        onChange={e => setFormData({ ...formData, isAlcoholic: e.target.checked })}
                                    />
                                    Is alcoholic
                                </label>
                            </div>
                            {formData.isAlcoholic && (
                                <div className="form-group">
                                    <label>Alcohol %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.alcoholPercentage || 0}
                                        onChange={e => setFormData({ ...formData, alcoholPercentage: parseFloat(e.target.value) })}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                            />
                            Available
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryModal: React.FC<{
    category: CategoryDto | null;
    onClose: () => void;
    onSave: () => void;
}> = ({ category, onClose, onSave }) => {
    const [name, setName] = useState(category?.name || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (category) {
                await categoryApi.updateCategory(category.id, { name });
            } else {
                await categoryApi.createCategory({ name });
            }
            onSave();
        } catch (err: any) {
            alert(err.message || 'Error saving category');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{category ? 'Edit Category' : 'New Category'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DrinksManagement;

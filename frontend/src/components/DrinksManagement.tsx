import React, { useState, useEffect } from 'react';
import { drinkApi, categoryApi } from '../services/api';
import type { DrinkDto, CreateDrinkDto } from '../types/drink';
import type { CategoryDto, CreateCategoryDto } from '../types/category';
import './DrinksManagement.css';

const DrinksManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'drinks' | 'categories'>('drinks');
    const [drinks, setDrinks] = useState<DrinkDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal states
    const [showDrinkModal, setShowDrinkModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingDrink, setEditingDrink] = useState<DrinkDto | null>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'drinks') {
                const [drinksRes, categoriesRes] = await Promise.all([
                    drinkApi.getAllDrinks(),
                    categoryApi.getAllCategories()
                ]);

                if (drinksRes.success && drinksRes.data) {
                    setDrinks(drinksRes.data);
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

    const handleDeleteDrink = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this drink?')) return;
        try {
            await drinkApi.deleteDrink(id);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Error deleting drink');
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

    return (
        <div className="drinks-management">
            <div className="management-header">
                <h2>Drinks & Categories Management</h2>
                <div className="sub-tabs">
                    <button
                        className={`sub-tab ${activeTab === 'drinks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('drinks')}
                    >
                        Drinks
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

            {activeTab === 'drinks' ? (
                <div className="drinks-section">
                    <div className="section-actions">
                        <button className="create-btn" onClick={() => {
                            setEditingDrink(null);
                            setShowDrinkModal(true);
                        }}>+ Add Drink</button>
                    </div>
                    {loading ? <div className="loading">Loading drinks...</div> : (
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
                                {drinks.map(drink => (
                                    <tr key={drink.id}>
                                        <td>{drink.name}</td>
                                        <td>{drink.categoryName}</td>
                                        <td>€ {drink.price.toFixed(2)}</td>
                                        <td>{drink.isAlcoholic ? `Alcoholic (${drink.alcoholPercentage}%)` : 'Non-Alcoholic'}</td>
                                        <td>
                                            <span className={`status-badge ${drink.isAvailable ? 'available' : 'unavailable'}`}>
                                                {drink.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="edit-btn" onClick={() => {
                                                setEditingDrink(drink);
                                                setShowDrinkModal(true);
                                            }}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteDrink(drink.id)}>Delete</button>
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

            {showDrinkModal && (
                <DrinkModal
                    drink={editingDrink}
                    categories={categories}
                    onClose={() => setShowDrinkModal(false)}
                    onSave={() => {
                        setShowDrinkModal(false);
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

const DrinkModal: React.FC<{
    drink: DrinkDto | null;
    categories: CategoryDto[];
    onClose: () => void;
    onSave: () => void;
}> = ({ drink, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<CreateDrinkDto>({
        name: drink?.name || '',
        price: drink?.price || 0,
        categoryId: drink?.categoryId || (categories[0]?.id || 0),
        isAlcoholic: drink?.isAlcoholic || false,
        alcoholPercentage: drink?.alcoholPercentage || 0,
        imageUrl: drink?.imageUrl || '',
        isAvailable: drink?.isAvailable ?? true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (drink) {
                await drinkApi.updateDrink(drink.id, formData);
            } else {
                await drinkApi.createDrink(formData);
            }
            onSave();
        } catch (err: any) {
            alert(err.message || 'Error saving drink');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{drink ? 'Edit Drink' : 'New Drink'}</h3>
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
                            onChange={e => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.isAlcoholic}
                                onChange={e => setFormData({ ...formData, isAlcoholic: e.target.checked })}
                            />
                            Is Alcoholic
                        </label>
                    </div>
                    {formData.isAlcoholic && (
                        <div className="form-group">
                            <label>Alcohol Percentage (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.alcoholPercentage || 0}
                                onChange={e => setFormData({ ...formData, alcoholPercentage: parseFloat(e.target.value) })}
                            />
                        </div>
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

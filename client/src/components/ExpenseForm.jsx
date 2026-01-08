import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { api } from '../lib/api';
import './ExpenseForm.css';
import { Plus } from 'lucide-react';
import { CURRENCIES } from '../lib/constants';

export function ExpenseForm({ onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        currency: 'USD'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res);
            if (res.length > 0) {
                setFormData(prev => ({ ...prev, category_id: res[0].id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            setFormData({
                amount: '',
                category_id: categories[0]?.id || '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                currency: formData.currency
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            alert('Failed to add expense');
        }
    };


    const currentSymbol = CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$';

    return (
        <Card title="Add Expense" className="expense-form-card">
            <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                    <label>Amount</label>
                    <div className="amount-input-group">
                        <div className="currency-select-wrapper">
                            <select
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                className="currency-select"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.code}</option>
                                ))}
                            </select>
                        </div>
                        <div className="amount-input-wrapper">
                            <span className="currency-symbol">{currentSymbol}</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        value={formData.category_id}
                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        placeholder="What was it for?"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    <Plus size={18} /> Add Expense
                </button>
            </form>
        </Card>
    );
}

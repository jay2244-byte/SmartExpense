import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { api } from '../lib/api';
import './CategoryBreakdown.css';
import { CURRENCIES } from '../lib/constants';

export function CategoryBreakdown({ refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const loadData = async () => {
        try {
            const res = await api.get('/summary/category');
            setData(res);

            const currencies = [...new Set(res.map(i => i.currency))];
            if (currencies.length === 1) {
                setSelectedCurrency(currencies[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const filteredData = data.filter(d => d.currency === selectedCurrency);
    const total = filteredData.reduce((sum, item) => sum + item.total, 0);

    const availableCurrencies = [...new Set(data.map(i => i.currency))].sort();

    if (loading) return <Card title="Spending by Category">Loading...</Card>;

    const headerAction = (
        <select
            value={selectedCurrency}
            onChange={e => setSelectedCurrency(e.target.value)}
            className="currency-filter-select"
        >
            {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            {!availableCurrencies.includes(selectedCurrency) && <option value={selectedCurrency}>{selectedCurrency}</option>}
        </select>
    );

    const handleSetBudget = async (item) => {
        const newBudget = prompt(`Set monthly budget for ${item.name} (in ${selectedCurrency}):`, item.budget || 0);
        if (newBudget !== null && !isNaN(parseFloat(newBudget))) {
            try {
                await api.put(`/categories/${item.id}`, { budget: parseFloat(newBudget) });
                loadData();
            } catch (err) {
                alert('Failed to update budget');
            }
        }
    };

    return (
        <Card title="Spending by Category" action={availableCurrencies.length > 0 ? headerAction : null} className="category-breakdown">
            <div className="breakdown-list">
                {filteredData.map((item) => {
                    const budget = item.budget || 0;
                    const percent = budget > 0 ? (item.total / budget) * 100 : (item.total / (total || 1)) * 100;
                    const isOverLine = budget > 0 && item.total > budget;
                    const currencySymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol;

                    return (
                        <div key={item.name} className="breakdown-item" onDoubleClick={() => handleSetBudget(item)} title="Double click to set budget">
                            <div className="breakdown-info">
                                <span className="breakdown-name">
                                    <span className="breakdown-icon">{item.icon || '•'}</span>
                                    {item.name}
                                    {budget > 0 && <span className="budget-tag" style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                                        / {currencySymbol}{budget}
                                    </span>}
                                </span>
                                <span className="breakdown-amount" style={{ color: isOverLine ? '#ff6b6b' : 'inherit' }}>
                                    {currencySymbol}{item.total.toFixed(2)}
                                </span>
                            </div>
                            <div className="breakdown-bar-bg">
                                <div
                                    className="breakdown-bar-fill"
                                    style={{
                                        width: `${Math.min(percent, 100)}%`,
                                        backgroundColor: isOverLine ? '#ff6b6b' : item.color
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
                {filteredData.length === 0 && <div className="text-secondary text-center">No expenses in {selectedCurrency}.</div>}
                {filteredData.length > 0 && <div className="text-center" style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                    Double-click any category to set a monthly budget.
                </div>}
            </div>
        </Card>
    );
}

import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { api } from '../lib/api';
import './ExpenseList.css';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { CURRENCIES } from '../lib/constants';

export function ExpenseList({ refreshTrigger, triggerRefresh }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const loadData = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSymbol = (code) => CURRENCIES.find(c => c.code === code)?.symbol || '$';

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await api.delete(`/expenses/${id}`);
            triggerRefresh(); // Refresh list and stats
        } catch (err) {
            alert('Failed to delete');
        }
    };

    if (loading) return <Card title="Recent Transactions">Loading...</Card>;

    return (
        <Card title="Recent Transactions" className="expense-list-card">
            <div className="expense-list">
                {expenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                        <div className="expense-icon" style={{ backgroundColor: expense.category_color + '20', color: expense.category_color }}>
                            {expense.category_icon || '•'}
                        </div>
                        <div className="expense-details">
                            <div className="expense-desc">{expense.description || expense.category_name}</div>
                            <div className="expense-date">{format(new Date(expense.date), 'MMM d, yyyy')}</div>
                        </div>
                        <div className="expense-amount">
                            {getSymbol(expense.currency)}{expense.amount.toFixed(2)}
                        </div>
                        <button className="delete-btn" onClick={() => handleDelete(expense.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {expenses.length === 0 && <div className="text-secondary text-center p-4">No transactions yet.</div>}
            </div>
        </Card>
    );
}

import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { api } from '../lib/api';
import { Wallet } from 'lucide-react';
import './SummaryCards.css';
import { CURRENCIES } from '../lib/constants';

export function SummaryCards({ refreshTrigger }) {
    const [totals, setTotals] = useState([]);

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const loadData = async () => {
        try {
            const res = await api.get('/summary/monthly');
            // Filter for current month (first item typically if sorted, but let's be safe later)
            // The API returns all months, but let's just take the first month's data if it exists
            // actually API groups by month AND currency. So we might get multiple rows for "2023-10".

            if (res.length > 0) {
                const currentMonth = res[0].month;
                const currentMonthData = res.filter(r => r.month === currentMonth);
                setTotals(currentMonthData);
            } else {
                setTotals([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getSymbol = (code) => CURRENCIES.find(c => c.code === code)?.symbol || code;

    return (
        <div className="summary-grid">
            <Card className="summary-card">
                <div className="summary-icon">
                    <Wallet size={24} />
                </div>
                <div className="summary-content">
                    <div className="summary-label">Total Spending (This Month)</div>
                    <div className="summary-values">
                        {totals.length > 0 ? totals.map(t => (
                            <div key={t.currency} className="summary-value-row">
                                <span className="summary-currency">{t.currency}</span>
                                <span className="summary-amount">{getSymbol(t.currency)}{t.total.toFixed(2)}</span>
                            </div>
                        )) : <div className="summary-value">$0.00</div>}
                    </div>
                </div>
            </Card>
        </div>
    );
}

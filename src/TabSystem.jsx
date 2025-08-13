import React, { useState } from 'react';
import ConfirmGenerator from './components/ConfirmGenerator';

const TabSystem = () => {
    const [tabs, setTabs] = useState([{ id: 1, title: 'New Trade', tradeInput: '' }]);
    const [activeTab, setActiveTab] = useState(1);
    const [nextId, setNextId] = useState(2);

    const generateTabTitle = (tradeInput) => {
        if (!tradeInput || tradeInput.trim() === '') {
            return 'New Trade';
        }

        // Clean up the trade input for display
        let title = tradeInput.trim();

        // Extract key parts of the trade for a more meaningful title
        // This regex captures common patterns like "Z25 5.00c LIVE" or "J26 3.75/4.00cs vs. 3.00/2.75ps"
        const tradeMatch = title.match(/^([A-Z]\d{2})\s+(.+?)(?:\s+(?:LIVE|x\d+\.\d+\s+\d+d))?$/i);

        if (tradeMatch) {
            const [, expiry, details] = tradeMatch;
            // Truncate details if too long
            const maxDetailsLength = 15;
            const truncatedDetails = details.length > maxDetailsLength
                ? details.substring(0, maxDetailsLength) + '...'
                : details;
            title = `${expiry} ${truncatedDetails}`;
        } else {
            // Fallback: just truncate the whole input
            const maxLength = 20;
            if (title.length > maxLength) {
                title = title.substring(0, maxLength) + '...';
            }
        }

        return title;
    };

    const handleTradeInputChange = (tabId, tradeInput) => {
        setTabs(prevTabs =>
            prevTabs.map(tab =>
                tab.id === tabId
                    ? { ...tab, tradeInput, title: generateTabTitle(tradeInput) }
                    : tab
            )
        );
    };

    const addTab = () => {
        const newTab = {
            id: nextId,
            title: 'New Trade',
            tradeInput: ''
        };
        setTabs([...tabs, newTab]);
        setActiveTab(nextId);
        setNextId(nextId + 1);
    };

    const closeTab = (tabId) => {
        const newTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(newTabs);

        // If we're closing the active tab, switch to another tab
        if (activeTab === tabId && newTabs.length > 0) {
            // Try to activate the tab to the right, or leftmost if that was the rightmost tab
            const closedTabIndex = tabs.findIndex(tab => tab.id === tabId);
            const newActiveIndex = closedTabIndex < newTabs.length ? closedTabIndex : newTabs.length - 1;
            setActiveTab(newTabs[newActiveIndex].id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Tab Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center overflow-x-auto">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`px-4 py-3 border-r border-gray-200 cursor-pointer flex items-center whitespace-nowrap min-w-0 ${
                                activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                    : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                            title={tab.tradeInput || tab.title} // Tooltip shows full trade input
                        >
                            <span className="truncate max-w-xs">{tab.title}</span>
                            {tabs.length > 1 && (
                                <button
                                    className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                    title="Close tab"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 whitespace-nowrap flex-shrink-0"
                        onClick={addTab}
                        title="Add new tab"
                    >
                        + New Tab
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={activeTab === tab.id ? 'block' : 'hidden'}
                    >
                        <ConfirmGenerator
                            tabId={tab.id}
                            onTradeInputChange={handleTradeInputChange}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabSystem;
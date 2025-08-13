import React, { useState } from 'react';
import ConfirmGenerator from './components/ConfirmGenerator';

const TabSystem = () => {
    const [tabs, setTabs] = useState([{ id: 1, title: 'Tab 1' }]);
    const [activeTab, setActiveTab] = useState(1);
    const [nextId, setNextId] = useState(2);

    const addTab = () => {
        const newTab = { id: nextId, title: `Tab ${nextId}` };
        setTabs([...tabs, newTab]);
        setActiveTab(nextId);
        setNextId(nextId + 1);
    };

    const closeTab = (tabId) => {
        const newTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(newTabs);
        if (activeTab === tabId && newTabs.length > 0) {
            setActiveTab(newTabs[0].id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white border-b border-gray-200">
                <div className="flex items-center">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`px-4 py-2 border-r border-gray-200 cursor-pointer flex items-center ${
                                activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.title}</span>
                            {tabs.length > 1 && (
                                <button
                                    className="ml-2 text-gray-400 hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                        onClick={addTab}
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="p-4">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={activeTab === tab.id ? 'block' : 'hidden'}
                    >
                        <ConfirmGenerator />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabSystem;
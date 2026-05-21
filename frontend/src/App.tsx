import { useState } from 'react';
import ConnectWallet from './components/ConnectWallet.tsx';
import StakePanel from './components/StakePanel.tsx';
import SwapAndStake from './components/SwapAndStake.tsx';
import UniFiVaults from './components/UniFiVaults.tsx';

function App() {
  const [activeTab, setActiveTab] = useState<'stake' | 'swap' | 'vault'>('stake');

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white text-3xl">🐡</div>
            <div>
              <h1 className="text-2xl font-bold text-black">Puffer 泡芙河豚</h1>
              <p className="text-sm text-gray-500">任意币速冻 · 一键泡芙</p>
            </div>
          </div>
          <ConnectWallet />
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {/* Tabs */}
        <div className="flex bg-white rounded-3xl p-1 mb-8 shadow">
          {[
            { key: 'stake', label: '直接质押' },
            { key: 'swap', label: '任意币兑换质押' },
            { key: 'vault', label: '速冻库 UniFi' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3.5 rounded-3xl text-sm font-medium transition-all ${
                activeTab === tab.key 
                  ? 'bg-[#007AFF] text-white shadow' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'stake' && <StakePanel />}
        {activeTab === 'swap' && <SwapAndStake />}
        {activeTab === 'vault' && <UniFiVaults />}
      </div>
    </div>
  );
}

export default App;

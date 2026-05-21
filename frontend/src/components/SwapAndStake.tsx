import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import tcx from '@imtoken/tcx-wasm';

export default function SwapAndStake() {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const init = async () => {
      try { await tcx.init(); } catch (e) {}
    };
    init();
  }, []);

  const openTokenlon = () => {
    if (!isConnected || !address) {
      alert('请先连接 imToken 钱包');
      return;
    }

    const url = `https://tokenlon.im/instant?from=ETH&to=pufETH&address=${address}`;
    window.open(url, '_blank');
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">任意币兑换 + 质押</h2>
      <p className="text-gray-500 mb-6">Tokenlon 聚合最优价格 → pufETH</p>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8 mb-8 text-center">
        <div className="text-6xl mb-4">🔄</div>
        <div className="text-xl font-semibold mb-3">任意代币一键兑换</div>
        <div className="text-sm text-gray-600">
          支持 USDT / USDC / DAI / WBTC 等<br/>Tokenlon 自动最优路由
        </div>
      </div>

      <button
        onClick={openTokenlon}
        className="w-full py-6 bg-[#FF6B00] text-white rounded-3xl text-xl font-medium active:scale-[0.97] transition-all"
      >
        🚀 打开 Tokenlon 兑换任意币
      </button>

      <div className="mt-6 p-4 bg-white rounded-2xl text-sm">
        💡 兑换完成后切换到「直接质押」Tab 即可质押得到的 pufETH
      </div>
    </div>
  );
}

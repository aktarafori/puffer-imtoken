import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import tcx from '@imtoken/tcx-wasm';

export default function SwapAndStake() {
  const { isConnected, address } = useAccount();
  const [txHash, setTxHash] = useState('');

  // Token Core 初始化
  useEffect(() => {
    const init = async () => {
      try { await tcx.init(); } catch (e) { console.log(e); }
    };
    init();
  }, []);

  // 打开 Tokenlon 兑换（imToken 环境最友好）
  const openTokenlonSwap = () => {
    if (!isConnected) {
      alert('请先连接 imToken 钱包');
      return;
    }

    // Tokenlon 官方 Swap 页面（带 referral 效果更好）
    const tokenlonUrl = `https://tokenlon.im/instant?from=ETH&to=pufETH&address=${address}`;
    
    // 在新标签页打开（imToken 内会自动适配）
    window.open(tokenlonUrl, '_blank');
    
    alert('已打开 Tokenlon 兑换页面\n\n兑换完成后回到此页面点击“去质押”');
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">任意币兑换 + 质押</h2>
      <p className="text-gray-500 mb-6">通过 Tokenlon 聚合最优价格 → pufETH</p>

      <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6 mb-8 text-center">
        <div className="text-5xl mb-4">🔄</div>
        <div className="text-xl font-medium">支持任意代币兑换成 pufETH</div>
        <div className="text-sm text-gray-500 mt-2">Tokenlon 提供最优汇率 + 低滑点</div>
      </div>

      <button
        onClick={openTokenlonSwap}
        className="w-full py-5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-3xl text-xl font-medium mb-4"
      >
        打开 Tokenlon 兑换任意币
      </button>

      <button
        onClick={() => window.location.reload()} // 简单返回质押页
        className="w-full py-5 bg-[#007AFF] text-white rounded-3xl text-xl font-medium"
      >
        兑换完成后 → 去直接质押
      </button>

      <p className="text-center text-xs text-gray-400 mt-8">
        已集成 Token Core • Tokenlon 官方聚合器 • imToken 最佳体验
      </p>
    </div>
  );
}

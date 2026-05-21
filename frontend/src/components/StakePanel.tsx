import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function StakePanel() {
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStake = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    setLoading(true);
    // 这里后续会集成 Puffer SDK 的 depositETH
    alert(`正在质押 ${amount} ETH → pufETH\n（实际项目中会调用 Puffer SDK）`);
    setLoading(false);
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">直接质押 ETH / stETH</h2>
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="text-sm text-gray-500 mb-1">当前 APY</div>
        <div className="text-4xl font-bold text-[#007AFF]">~4.8%</div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="输入质押数量 (ETH)"
        className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:border-[#007AFF]"
      />

      <button
        onClick={handleStake}
        disabled={loading || !amount}
        className="w-full mt-6 py-4 bg-[#007AFF] text-white rounded-2xl text-lg font-medium disabled:opacity-50"
      >
        {loading ? '处理中...' : '一键质押 → pufETH'}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        支持 ETH、stETH、wstETH • imToken 完美兼容
      </p>
    </div>
  );
}

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function SwapAndStake() {
  const { isConnected } = useAccount();
  const [fromToken, setFromToken] = useState('USDT');
  const [amount, setAmount] = useState('');

  const handleSwapAndStake = () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    // Tokenlon 跳转或集成
    window.open(`https://tokenlon.im/swap?from=${fromToken}&to=ETH&amount=${amount}`, '_blank');
    alert('已跳转 Tokenlon 兑换 → 兑换后自动质押（后续可深度集成）');
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">任意币 → pufETH</h2>
      <p className="text-sm text-gray-500 mb-6">通过 Tokenlon 一键兑换后质押</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500 block mb-1">兑换自</label>
          <select 
            value={fromToken} 
            onChange={(e) => setFromToken(e.target.value)}
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl"
          >
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="DAI">DAI</option>
            <option value="WBTC">WBTC</option>
          </select>
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="输入数量"
          className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl"
        />
      </div>

      <button
        onClick={handleSwapAndStake}
        className="w-full mt-8 py-4 bg-[#007AFF] text-white rounded-2xl text-lg font-medium"
      >
        Tokenlon 兑换并质押
      </button>
    </div>
  );
}

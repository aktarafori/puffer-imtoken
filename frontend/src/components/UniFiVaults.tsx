import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function UniFiVaults() {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  const handleDepositToVault = (vault: string) => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert(`已成功存入 ${vault} 速冻库！\n继续赚取 UniFi 积分 + 额外收益`);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-2">Puffer 速冻库 (UniFi Vaults)</h2>
        <p className="text-sm text-gray-500">把 pufETH 存入速冻库，赚取更多收益 + 积分</p>
      </div>

      {/* unifiETH Vault */}
      <div className="card p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">unifiETH</div>
            <div className="text-sm text-emerald-600">当前 APY ≈ 6.2% + 积分</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">TVL</div>
            <div className="font-medium">$12.4M</div>
          </div>
        </div>
        <button
          onClick={() => handleDepositToVault('unifiETH')}
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-[#007AFF] to-blue-600 text-white rounded-2xl font-medium"
        >
          一键存入 unifiETH 速冻库
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        更多 Vault 正在上线（unifiBTC / unifiUSD 等）
      </div>
    </div>
  );
}

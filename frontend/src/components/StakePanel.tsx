import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import {
  PufferClientHelpers,
  PufferClient,
  Chain,
} from '@pufferfinance/puffer-sdk';

export default function StakePanel() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleStake = async () => {
    if (!isConnected || !walletClient || !address) {
      alert('请先连接钱包（imToken）');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入质押数量');
      return;
    }

    setLoading(true);
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });

      const pufferClient = new PufferClient(
        Chain.Mainnet,
        walletClient,
        publicClient
      );

      const { transact, estimate } = pufferClient.vault.depositETH(address);

      // 可选：显示 gas 预估
      // const gas = await estimate();
      // console.log('Gas estimate:', gas);

      const tx = await transact(BigInt(Math.floor(parseFloat(amount) * 1e18)));
      
      setTxHash(tx);
      alert(`✅ 质押交易已发送！\n\nTx Hash: ${tx}\n\n可在 Etherscan 查看`);
      
    } catch (error: any) {
      console.error(error);
      alert('质押失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">直接质押 ETH → pufETH</h2>
      
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="text-sm text-gray-500 mb-1">当前 pufETH 汇率</div>
        <div className="text-4xl font-bold text-[#007AFF]">1 ETH ≈ 0.96 pufETH</div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="输入质押数量 (ETH)"
        className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:border-[#007AFF]"
        disabled={loading}
      />

      <button
        onClick={handleStake}
        disabled={loading || !amount || !isConnected}
        className="w-full mt-6 py-4 bg-[#007AFF] text-white rounded-2xl text-lg font-medium disabled:opacity-50"
      >
        {loading ? '交易发送中...' : '一键质押 → pufETH'}
      </button>

      {txHash && (
        <p className="text-center text-xs text-green-600 mt-4 break-all">
          Tx: {txHash}
        </p>
      )}

      <p className="text-center text-xs text-gray-500 mt-4">
        支持 ETH • imToken 直接使用 • 主网真实交易
      </p>
    </div>
  );
}

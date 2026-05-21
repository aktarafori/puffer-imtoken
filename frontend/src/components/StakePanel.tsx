import { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useBalance } from 'wagmi';
import {
  PufferClientHelpers,
  PufferClient,
  Chain,
} from '@pufferfinance/puffer-sdk';

const tokens = [
  { value: 'ETH', label: 'ETH', isNative: true },
  { value: 'stETH', label: 'stETH', isNative: false },
  { value: 'wstETH', label: 'wstETH', isNative: false },
];

export default function StakePanel() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [pufETHBalance, setPufETHBalance] = useState('0');
  const [rate, setRate] = useState('1');

  // 获取 pufETH 余额
  const fetchPufETHBalance = async () => {
    if (!address) return;
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });
      const pufferClient = new PufferClient(Chain.Mainnet, walletClient || undefined, publicClient);
      const bal = await pufferClient.vault.balanceOf(address);
      setPufETHBalance((Number(bal) / 1e18).toFixed(4));
    } catch (e) {
      console.error(e);
    }
  };

  // 获取汇率
  const fetchRate = async () => {
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });
      const pufferClient = new PufferClient(Chain.Mainnet, undefined, publicClient);
      const r = await pufferClient.vault.getPufETHRate();
      setRate((Number(r) / 1e18).toFixed(4));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchPufETHBalance();
      fetchRate();
    }
  }, [isConnected, address]);

  const currentToken = tokens.find(t => t.value === selectedToken)!;

  const handleStake = async () => {
    if (!isConnected || !walletClient || !address) {
      alert('请先用 imToken 连接钱包');
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

      let tx: string;

      if (selectedToken === 'ETH') {
        const { transact } = pufferClient.vault.depositETH(address);
        tx = await transact(BigInt(Math.floor(parseFloat(amount) * 1e18)));
      } else {
        // stETH / wstETH 使用 deposit 方法（SDK 支持）
        const tokenMap: any = {
          stETH: 'stETH', // SDK 内部会处理具体逻辑
          wstETH: 'wstETH',
        };
        const { transact } = pufferClient.vault.deposit(
          address,
          tokenMap[selectedToken],
          BigInt(Math.floor(parseFloat(amount) * 1e18))
        );
        tx = await transact();
      }

      setTxHash(tx);
      alert(`✅ 质押成功提交！\n\nTx: ${tx}\n\n请在 Etherscan 查看`);
      setAmount('');
      setTimeout(fetchPufETHBalance, 8000); // 稍后刷新余额
    } catch (error: any) {
      console.error(error);
      alert('操作失败: ' + (error?.message || '请检查钱包网络是否为主网'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">Puffer 质押</h2>
      <p className="text-gray-500 mb-6">ETH / stETH / wstETH → pufETH（真实主网）</p>

      {/* pufETH 余额展示 */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">你的 pufETH 余额</div>
            <div className="text-3xl font-bold text-[#007AFF]">{pufETHBalance} pufETH</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">当前汇率</div>
            <div className="font-medium">1 ETH ≈ {rate} pufETH</div>
          </div>
        </div>
      </div>

      {/* Token 选择 */}
      <div className="mb-4">
        <label className="block text-sm text-gray-500 mb-2">选择质押资产</label>
        <div className="flex gap-2">
          {tokens.map(token => (
            <button
              key={token.value}
              onClick={() => setSelectedToken(token.value)}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                selectedToken === token.value
                  ? 'bg-[#007AFF] text-white shadow'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {token.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输入金额 */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`输入 ${selectedToken} 数量`}
        className="w-full px-5 py-5 text-xl border border-gray-200 rounded-3xl focus:outline-none focus:border-[#007AFF] mb-6"
        disabled={loading}
      />

      <button
        onClick={handleStake}
        disabled={loading || !amount || !isConnected}
        className="w-full py-5 bg-[#007AFF] hover:bg-blue-600 text-white rounded-3xl text-xl font-medium disabled:opacity-50 transition-all"
      >
        {loading ? '交易处理中...' : `一键质押 ${selectedToken} → pufETH`}
      </button>

      {txHash && (
        <p className="mt-4 text-center text-sm text-green-600 break-all">
          ✅ Tx Hash: {txHash}
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        imToken 主网 • 小额测试安全 • 交易前确认钱包网络为主网
      </p>
    </div>
  );
}

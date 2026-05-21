import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import {
  PufferClientHelpers,
  PufferClient,
  Chain,
} from '@pufferfinance/puffer-sdk';
import tcx from '@imtoken/tcx-wasm';

const tokens = [
  { value: 'ETH', label: 'ETH' },
  { value: 'stETH', label: 'stETH' },
  { value: 'wstETH', label: 'wstETH' },
];

export default function StakePanel() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [pufETHBalance, setPufETHBalance] = useState('0.0000');
  const [rate, setRate] = useState('1.0000');
  const [refreshing, setRefreshing] = useState(false);

  // Token Core 初始化
  useEffect(() => {
    const initTokenCore = async () => {
      try {
        await tcx.init();
        console.log('✅ Token Core 初始化成功');
      } catch (err) {
        console.log('Token Core 初始化:', err);
      }
    };
    initTokenCore();
  }, []);

  const fetchRate = async () => {
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });
      const puffer = new PufferClient(Chain.Mainnet, undefined, publicClient);
      const r = await puffer.vault.getPufETHRate();
      setRate((Number(r) / 1e18).toFixed(4));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBalance = async () => {
    if (!address) return;
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });
      const puffer = new PufferClient(Chain.Mainnet, undefined, publicClient);
      const bal = await puffer.vault.balanceOf(address);
      setPufETHBalance((Number(bal) / 1e18).toFixed(4));
    } catch (e) {
      console.error(e);
    }
  };

  // 刷新数据
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchRate(), fetchBalance()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRate();
    if (isConnected && address) fetchBalance();
  }, [isConnected, address]);

  const handleStake = async () => {
    if (!isConnected || !walletClient || !address) {
      alert('请先用 imToken 连接钱包');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('请输入大于 0 的质押数量');
      return;
    }

    setLoading(true);
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });

      const pufferClient = new PufferClient(Chain.Mainnet, walletClient, publicClient);

      let tx: string;
      if (selectedToken === 'ETH') {
        const { transact } = pufferClient.vault.depositETH(address);
        tx = await transact(BigInt(Math.floor(Number(amount) * 1e18)));
      } else {
        alert('当前版本仅支持 ETH 直接质押\nstETH / wstETH 即将支持');
        setLoading(false);
        return;
      }

      setTxHash(tx);
      alert(`✅ 质押交易已成功发送！\n\nTx Hash: ${tx}`);
      setAmount('');
      
      // 成功后自动刷新余额
      setTimeout(() => refreshData(), 8000);
    } catch (error: any) {
      console.error(error);
      alert('质押失败: ' + (error?.shortMessage || error?.message || '请检查钱包网络和余额'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-1">直接质押</h2>
      <p className="text-gray-500 mb-6">ETH → pufETH（真实主网）</p>

      {/* 余额 + 汇率 */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 mb-6">
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
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="mt-3 text-xs text-[#007AFF] hover:underline disabled:opacity-50"
        >
          {refreshing ? '刷新中...' : '↻ 刷新数据'}
        </button>
      </div>

      {/* Token 选择 */}
      <div className="mb-5">
        <div className="text-sm text-gray-500 mb-2">选择质押资产</div>
        <div className="flex gap-2">
          {tokens.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedToken(t.value)}
              className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                selectedToken === t.value 
                  ? 'bg-[#007AFF] text-white shadow' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`输入 ${selectedToken} 数量`}
        className="w-full px-5 py-5 text-xl border border-gray-200 rounded-3xl focus:border-[#007AFF] mb-6"
        disabled={loading}
      />

      <button
        onClick={handleStake}
        disabled={loading || !amount || !isConnected}
        className="w-full py-5 bg-[#007AFF] hover:bg-blue-600 text-white rounded-3xl text-xl font-medium disabled:opacity-50 transition-all"
      >
        {loading ? '交易发送中...' : `一键质押 ${selectedToken} → pufETH`}
      </button>

      {txHash && (
        <p className="mt-4 text-center text-sm break-all text-green-600 bg-green-50 p-3 rounded-2xl">
          ✅ Tx Hash: {txHash}
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        已集成 Token Core • 支持 imToken 主网 • 小额测试安全
      </p>
    </div>
  );
}

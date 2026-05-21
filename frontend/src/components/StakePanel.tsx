import tcx from '@imtoken/tcx-wasm';
import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import {
  PufferClientHelpers,
  PufferClient,
  Chain,
} from '@pufferfinance/puffer-sdk';

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

   // Token Core 初始化（满足 imToken 官方要求）
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

  // 原有的 fetchRate 和 fetchBalance 的 useEffect
  useEffect(() => {
    fetchRate();
    if (isConnected && address) fetchBalance();
  }, [isConnected, address]);

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
        alert('当前仅支持 ETH 直接质押\nstETH / wstETH 后续版本支持');
        setLoading(false);
        return;
      }

      setTxHash(tx);
      alert(`✅ 交易发送成功！\n\nTx: ${tx}`);
      setAmount('');
      setTimeout(fetchBalance, 8000);
    } catch (error: any) {
      console.error(error);
      alert('失败: ' + (error?.shortMessage || error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-1">Puffer 质押</h2>
      <p className="text-gray-500 mb-6">真实主网 · 支持 imToken</p>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-500">pufETH 余额</div>
            <div className="text-3xl font-bold text-[#007AFF]">{pufETHBalance}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">汇率</div>
            <div>1 ETH ≈ {rate} pufETH</div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-sm text-gray-500 mb-2">选择资产</div>
        <div className="flex gap-2">
          {tokens.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedToken(t.value)}
              className={`flex-1 py-3 rounded-2xl font-medium ${
                selectedToken === t.value 
                  ? 'bg-[#007AFF] text-white' 
                  : 'bg-gray-100'
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
        className="w-full px-5 py-5 text-xl border rounded-3xl focus:border-[#007AFF] mb-6"
        disabled={loading}
      />

      <button
        onClick={handleStake}
        disabled={loading || !amount || !isConnected}
        className="w-full py-5 bg-[#007AFF] text-white rounded-3xl text-xl font-medium disabled:opacity-50"
      >
        {loading ? '发送交易中...' : `质押 ${selectedToken} → pufETH`}
      </button>

      {txHash && <p className="mt-4 text-center text-sm break-all text-green-600">Tx: {txHash}</p>}
    </div>
  );
}

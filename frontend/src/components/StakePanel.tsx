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

  // 获取 pufETH 余额
  const fetchPufETHBalance = async () => {
    if (!address) return;
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });
      const pufferClient = new PufferClient(Chain.Mainnet, undefined, publicClient);
      const bal = await pufferClient.vault.balanceOf(address);
      setPufETHBalance((Number(bal) / 1e18).toFixed(4));
    } catch (e) {
      console.error('Balance fetch error:', e);
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
      console.error('Rate fetch error:', e);
    }
  };

  useEffect(() => {
    fetchRate();
    if (isConnected && address) {
      fetchPufETHBalance();
    }
  }, [isConnected, address]);

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
        // stETH / wstETH 暂时简化（SDK 主要稳定支持 ETH，stETH 可通过 approve + deposit）
        alert(`当前版本暂优先支持 ETH 质押。\n\nstETH/wstETH 功能开发中...`);
        setLoading(false);
        return;
      }

      setTxHash(tx);
      alert(`✅ 交易已提交！\n\nTx Hash: ${tx}\n\n可在 Etherscan 查看`);
      setAmount('');
      setTimeout(fetchPufETHBalance, 10000);
    } catch (error: any) {
      console.error(error);
      alert('质押失败: ' + (error?.message || '未知错误，请确认主网并检查余额'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">Puffer 质押</h2>
      <p className="text-gray-500 mb-6">ETH / stETH / wstETH → pufETH（真实主网）</p>

      {/* 余额 + 汇率 */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div
